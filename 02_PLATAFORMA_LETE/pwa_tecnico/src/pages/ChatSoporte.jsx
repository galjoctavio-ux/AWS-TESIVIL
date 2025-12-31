import React, { useState, useEffect, useRef } from 'react';
import { Send, User, HardHat, StickyNote, ArrowLeft, Bot, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { crmApi as api } from '../apiService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const ChatSoporte = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);

    // NUEVO: Estado para el resumen IA
    const [techSummary, setTechSummary] = useState(null);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [inputText, setInputText] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const messagesEndRef = useRef(null);

    // 1. AUTO-SELECCIONAR CHAT SI VIENE DE LA AGENDA
    useEffect(() => {
        if (location.state && location.state.autoSelectChat) {
            setSelectedChat(location.state.autoSelectChat);
            // Limpiamos el state para evitar bucles
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // 2. Cargar Lista de Chats (Solo Pool o Asignados al técnico)
    const fetchConversations = async () => {
        try {
            const res = await api.get('/conversations');
            const techChats = res.data.filter(c => c.status === 'TECH_POOL' || c.assigned_to_role === 'TECH');
            setConversations(techChats);
        } catch (error) {
            console.error("Error conectando con CRM:", error);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Polling de lista cada 10s
        return () => clearInterval(interval);
    }, []);

    // 3. Cargar Mensajes y Resumen (LÓGICA NUEVA)
    useEffect(() => {
        if (!selectedChat) return;

        const fetchMessages = async () => {
            try {
                // AQUI ESTÁ LA CLAVE: Pedimos la vista "tech"
                const res = await api.get(`/conversations/${selectedChat.id}/messages?view=tech`);

                // Si el backend responde con el formato nuevo seguro
                if (res.data.mode === 'tech_safe_view') {
                    setTechSummary(res.data.summary);
                    setMessages(res.data.messages);
                } else {
                    // Fallback (por si acaso)
                    setMessages(Array.isArray(res.data) ? res.data : []);
                }

            } catch (error) { console.error(error); }
        };

        setLoadingMessages(true);
        fetchMessages().then(() => setLoadingMessages(false));

        const interval = setInterval(fetchMessages, 3000); // Polling chat cada 3s
        return () => clearInterval(interval);
    }, [selectedChat]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages.length, techSummary]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedChat) return;
        const tempContent = inputText;
        setInputText('');

        try {
            // Obtener nombre real desde Supabase para mostrarlo bonito
            let senderName = "Técnico";
            if (user?.id) {
                const { data } = await supabase.from('profiles').select('nombre').eq('id', user.id).single();
                if (data?.nombre) senderName = data.nombre;
            }

            // Si respondo un chat del Pool, me lo auto-asigno
            if (selectedChat.status === 'TECH_POOL' && !isInternal) {
                await handleStatusChange('OPEN', 'TECH');
            }

            await api.post(`/conversations/${selectedChat.id}/send`, {
                content: tempContent,
                is_internal: isInternal,
                senderName: senderName
            });

            // Refetch inmediato
            const res = await api.get(`/conversations/${selectedChat.id}/messages?view=tech`);
            if (res.data.messages) setMessages(res.data.messages);
            scrollToBottom();
            setIsInternal(false);

        } catch (error) {
            console.error(error);
            setInputText(tempContent);
            alert("No se pudo enviar mensaje. Verifica conexión.");
        }
    };

    const handleStatusChange = async (newStatus, newRole) => {
        if (!selectedChat) return;
        try {
            await api.patch(`/conversations/${selectedChat.id}/status`, {
                status: newStatus,
                assigned_to_role: newRole
            });
            fetchConversations();
            setSelectedChat(prev => ({ ...prev, status: newStatus, assigned_to_role: newRole }));
            if (newStatus === 'CLOSED') setSelectedChat(null);
        } catch (e) { console.error(e); }
    };

    // --- RENDER: LISTA DE CHATS ---
    if (!selectedChat) {
        return (
            <div className="flex flex-col h-screen bg-gray-50 pb-20">
                <div className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
                    <button onClick={() => navigate(-1)} className="p-2"><ArrowLeft className="text-gray-600" /></button>
                    <h1 className="font-bold text-lg text-gray-800">Soporte Técnico</h1>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {conversations.length === 0 ? (
                        <div className="text-center mt-10 text-gray-400">
                            <HardHat className="mx-auto mb-2 opacity-20" size={48} />
                            <p>Sin casos pendientes</p>
                        </div>
                    ) : (
                        conversations.map(chat => (
                            <div key={chat.id} onClick={() => setSelectedChat(chat)} className="bg-white p-4 rounded-lg shadow-sm mb-3 border-l-4 border-l-blue-500 active:bg-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-800">{chat.client_name}</h3>
                                    {chat.unread_count > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{chat.unread_count}</span>}
                                </div>
                                <div className="flex gap-2 mb-1">
                                    {chat.status === 'TECH_POOL' && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded font-bold">POR ASIGNAR</span>}
                                    {chat.assigned_to_role === 'TECH' && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded flex items-center gap-1"><HardHat size={10} /> ASIGNADO A MÍ</span>}
                                </div>
                                <p className="text-xs text-gray-400 text-right">{new Date(chat.last_interaction).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // --- RENDER: CHAT INDIVIDUAL ---
    return (
        <div className="flex flex-col h-screen bg-[#e5ddd5] pb-0">
            {/* Header */}
            <div className="bg-white p-3 shadow-sm flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedChat(null)} className="p-1"><ArrowLeft className="text-gray-600" /></button>
                    <div>
                        <h2 className="font-bold text-sm text-gray-800 truncate w-32">{selectedChat.client_name}</h2>
                        <p className="text-[10px] text-green-600">Conectado</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {selectedChat.status === 'TECH_POOL' && (
                        <button onClick={() => handleStatusChange('OPEN', 'TECH')} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-bold shadow-sm animate-pulse">TOMAR CASO</button>
                    )}
                    {selectedChat.status !== 'TECH_POOL' && selectedChat.assigned_to_role !== 'BOT' && (
                        <button onClick={() => handleStatusChange('CLOSED', 'ADMIN')} className="bg-gray-200 text-gray-700 text-xs px-2 py-1.5 rounded font-bold border border-gray-300">FINALIZAR</button>
                    )}
                </div>
            </div>

            {/* AREA DE MENSAJES */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#e5ddd5]">

                {/* --- TARJETA DE RESUMEN IA (Sticky visual o al inicio) --- */}
                {techSummary ? (
                    <div className="bg-white border-l-4 border-blue-500 rounded-r-lg shadow-md p-4 mb-6 opacity-95">
                        <div className="flex items-center gap-2 mb-2 border-b pb-2">
                            <Bot className="text-blue-600" size={20} />
                            <h3 className="font-bold text-gray-800 text-sm">Resumen Operativo (IA)</h3>
                        </div>
                        <div className="text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">
                            {techSummary}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100 flex gap-2 items-center text-[10px] text-gray-400">
                            <Info size={12} />
                            <span>Datos sensibles ocultos por seguridad.</span>
                        </div>
                    </div>
                ) : (
                    // Mensaje temporal mientras carga o se genera
                    <div className="bg-blue-50 border border-blue-100 rounded p-4 text-center text-xs text-blue-600 mb-4 animate-pulse">
                        <div className="flex justify-center items-center gap-2 mb-1">
                            <Bot size={16} />
                            <strong>Analizando caso...</strong>
                        </div>
                        {loadingMessages ? "Cargando..." : "Generando resumen seguro..."}
                    </div>
                )}

                {/* SEPARADOR DE TIEMPO */}
                <div className="flex justify-center my-4 opacity-60">
                    <span className="bg-gray-200 text-gray-600 text-[10px] px-3 py-1 rounded-full shadow-sm">
                        Inicio de tu sesión técnica
                    </span>
                </div>

                {/* MENSAJES */}
                {messages.length === 0 && !loadingMessages && (
                    <p className="text-center text-xs text-gray-400 mt-4">No hay mensajes nuevos desde tu asignación.</p>
                )}

                {messages.map((msg) => {
                    const isClient = msg.sender_type === 'CLIENT';
                    const isInternalMsg = msg.is_internal;
                    return (
                        <div key={msg.id} className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[85%] rounded-lg p-2 text-sm shadow-sm relative ${isInternalMsg ? 'bg-yellow-100 border border-yellow-300 text-gray-800' :
                                    isClient ? 'bg-white text-gray-900 rounded-tl-none' :
                                        'bg-[#d9fdd3] text-gray-900 rounded-tr-none'
                                }`}>
                                {!isClient && (
                                    <p className="text-[9px] font-bold mb-1 opacity-60 flex gap-1 uppercase">
                                        {isInternalMsg ? <StickyNote size={9} /> : <HardHat size={9} />}
                                        {isInternalMsg ? 'Nota Interna' : 'Tú'}
                                    </p>
                                )}
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                <p className="text-[9px] text-gray-400 text-right mt-1">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className={`p-2 pb-4 border-t ${isInternal ? 'bg-yellow-50' : 'bg-gray-100'}`}>
                <div className="flex justify-end mb-2">
                    <button onClick={() => setIsInternal(!isInternal)} className={`text-[10px] px-2 py-1 rounded-full font-bold border flex items-center gap-1 ${isInternal ? 'bg-yellow-200 border-yellow-400' : 'bg-white border-gray-300'}`}>
                        {isInternal ? <StickyNote size={10} /> : <Send size={10} />}
                        {isInternal ? 'NOTA PRIVADA' : 'PÚBLICO'}
                    </button>
                </div>
                <form onSubmit={handleSend} className="flex gap-2">
                    <input className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 text-sm" placeholder={isInternal ? "Nota interna..." : "Mensaje al cliente..."} value={inputText} onChange={e => setInputText(e.target.value)} />
                    <button type="submit" className={`p-2 rounded-full text-white shadow-sm ${isInternal ? 'bg-yellow-600' : 'bg-blue-600'}`}><Send size={18} /></button>
                </form>
            </div>
        </div>
    );
};

export default ChatSoporte;