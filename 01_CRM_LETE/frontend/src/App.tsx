import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, Bot, Smartphone, HardHat, ShieldAlert, StickyNote, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import type { Conversation, Message } from './types';

// CLAVE QUEMADA DE RESPALDO (Por si acaso, pero idealmente la pone el usuario)
// Nota: En un entorno real idealmente esto viene de variable de entorno, pero para simplificar:
const APP_SECRET_KEY = 'crm_secret_key'; 

function App() {
  // --- ESTADO DE AUTENTICACIÓN ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Instancia de API (se configurará cuando tengamos la clave)
  const [api, setApi] = useState<any>(null);

  // --- ESTADOS DE LA APP ---
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [viewMode, setViewMode] = useState<'ADMIN' | 'TECH'>('ADMIN'); 
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 0. VERIFICAR SI YA ESTÁ LOGUEADO AL INICIAR
  useEffect(() => {
      const storedKey = localStorage.getItem(APP_SECRET_KEY);
      if (storedKey) {
          initializeApi(storedKey);
      }
  }, []);

const initializeApi = (key: string) => {
    const newApi = axios.create({
        baseURL: '/api',
        headers: {
            'x-app-key': key,
            'Content-Type': 'application/json'
        }
    });
    
    // Interceptor de REQUEST para agregar el header en CADA petición
    newApi.interceptors.request.use(
        (config) => {
            config.headers['x-app-key'] = key;
            config.headers['Content-Type'] = 'application/json';
            console.log('🔑 Enviando petición con key:', key); // DEBUG
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
    
    // Interceptor de RESPONSE para detectar errores de autenticación
    newApi.interceptors.response.use(
        response => response,
        error => {
            if (error.response && error.response.status === 403) {
                alert("Sesión expirada o contraseña incorrecta");
                handleLogout();
            }
            return Promise.reject(error);
        }
    );

    setApi(newApi);
      setIsAuthenticated(true);
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Guardamos la clave y probamos
      localStorage.setItem(APP_SECRET_KEY, passwordInput);
      initializeApi(passwordInput);
  };

  const handleLogout = () => {
      localStorage.removeItem(APP_SECRET_KEY);
      setIsAuthenticated(false);
      setApi(null);
      setPasswordInput('');
  };

  // 1. Cargar Conversaciones (Polling)
  const fetchConversations = async () => {
    if (!api) return;
    try {
      const res = await api.get('/conversations');
      let allChats = res.data as Conversation[];
      if (viewMode === 'TECH') {
        allChats = allChats.filter(c => c.status === 'TECH_POOL' || c.assigned_to_role === 'TECH');
      }
      setConversations(allChats);
    } catch (error: any) { 
    console.error("ERROR REAL:", error); 
    if (error.response) console.error("STATUS:", error.response.status);
    alert(`Error: ${error.message}`); // Esto te mostrará una alerta en pantalla con el error
}
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [viewMode, isAuthenticated, api]);

  // 2. Cargar Mensajes
  useEffect(() => {
    if (!selectedChat || !api) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/conversations/${selectedChat.id}/messages`);
        setMessages(res.data);
      } catch (error) { console.error(error); }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedChat, api]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => { scrollToBottom(); }, [messages.length, selectedChat?.id]);

  // 3. Acciones
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat || !api) return;
    const tempContent = inputText;
    setInputText(''); 

    try {
      if (viewMode === 'TECH' && !isInternal) await handleStatusChange('OPEN', 'TECH'); 
      await api.post(`/conversations/${selectedChat.id}/send`, { content: tempContent, is_internal: isInternal });
      const res = await api.get(`/conversations/${selectedChat.id}/messages`);
      setMessages(res.data);
      setIsInternal(false); 
    } catch (error) { alert("Error enviando"); setInputText(tempContent); }
  };

  const handleStatusChange = async (newStatus: string, newRole: string) => {
    if (!selectedChat || !api) return;
    try {
        await api.patch(`/conversations/${selectedChat.id}/status`, { status: newStatus, assigned_to_role: newRole });
        fetchConversations(); 
        setSelectedChat({...selectedChat, status: newStatus as any, assigned_to_role: newRole});
        if (newStatus === 'CLOSED') setSelectedChat(null);
    } catch (e) { alert("Error actualizando estado"); }
  };

  // --- VISTA DE LOGIN (SI NO ESTÁ AUTENTICADO) ---
  if (!isAuthenticated) {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-100">
              <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="text-blue-600" size={32} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h1>
                  <p className="text-gray-500 mb-6">CRM Luz en tu Espacio</p>
                  
                  <form onSubmit={handleLogin}>
                      <input 
                          type="password" 
                          placeholder="Ingresa la llave de acceso..."
                          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:border-blue-500"
                          value={passwordInput}
                          onChange={e => setPasswordInput(e.target.value)}
                      />
                      <button 
                          type="submit"
                          className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 transition-colors"
                      >
                          Entrar
                      </button>
                  </form>
              </div>
          </div>
      );
  }

  // --- VISTA DE LA APP (IGUAL QUE ANTES) ---
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <div className={`w-full md:w-1/3 min-w-[300px] bg-white border-r border-gray-200 flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 bg-gray-800 text-white flex justify-between items-center shadow-md z-10">
          <div>
              <h1 className="font-bold text-lg">Luz en tu Espacio</h1>
              <p className="text-xs text-gray-400 cursor-pointer" onClick={handleLogout}>{viewMode === 'ADMIN' ? 'Admin (Salir)' : 'Técnico (Salir)'}</p>
          </div>
          <button 
            onClick={() => setViewMode(viewMode === 'ADMIN' ? 'TECH' : 'ADMIN')}
            className={`p-2 rounded flex items-center gap-2 text-xs font-bold transition-colors ${viewMode === 'ADMIN' ? 'bg-blue-600' : 'bg-orange-600'}`}
          >
            {viewMode === 'ADMIN' ? <User size={16}/> : <HardHat size={16}/>}
            {viewMode === 'ADMIN' ? 'Soy Admin' : 'Soy Técnico'}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No hay tickets pendientes.</div>}
          {conversations.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors ${selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${chat.assigned_to_role === 'BOT' ? 'bg-purple-500' : 'bg-gray-400'}`}>
                      {chat.client_name?.charAt(0).toUpperCase()}
                   </div>
                   <div className="overflow-hidden">
                      <h3 className="font-semibold text-gray-800 truncate text-base">{chat.client_name}</h3>
                      <p className="text-xs text-gray-500">{chat.whatsapp_id.split('@')[0]}</p>
                   </div>
                </div>
                {chat.unread_count > 0 && <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">{chat.unread_count}</span>}
              </div>
              <div className="mt-2 flex justify-between items-center">
                 <div className="flex gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${chat.status === 'TECH_POOL' ? 'bg-orange-100 text-orange-800 border-orange-200' : chat.status === 'NEW' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{chat.status}</span>
                 </div>
                 <span className="text-[10px] text-gray-400">{new Date(chat.last_interaction).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className={`flex-1 flex-col bg-[#e5ddd5] relative ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
        {selectedChat ? (
          <>
            <div className="p-2 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 text-gray-600"><ArrowLeft size={24} /></button>
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center"><User className="text-gray-600" size={20}/></div>
                <div className="overflow-hidden">
                  <h2 className="font-bold text-gray-800 text-sm truncate w-32 md:w-auto">{selectedChat.client_name}</h2>
                  <p className="text-xs text-green-600 flex items-center gap-1"><Smartphone size={10}/> En Línea</p>
                </div>
              </div>
              <div className="flex gap-2">
                 {viewMode === 'ADMIN' && selectedChat.status !== 'TECH_POOL' && (
                    <button onClick={() => handleStatusChange('TECH_POOL', 'TECH')} className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-2 rounded text-xs font-bold flex items-center gap-1 border border-orange-200"><ShieldAlert size={16}/> <span className="hidden md:inline">SOS</span></button>
                 )}
                 {viewMode === 'TECH' && selectedChat.status === 'TECH_POOL' && (
                    <button onClick={() => handleStatusChange('OPEN', 'TECH')} className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold shadow-sm">TOMAR</button>
                 )}
                 <button onClick={() => handleStatusChange('CLOSED', 'ADMIN')} className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-2 rounded text-xs font-bold border border-gray-300">CERRAR</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', opacity: 0.95}}>
              {messages.map((msg) => {
                const isClient = msg.sender_type === 'CLIENT';
                const isInternalMsg = msg.is_internal;
                return (
                  <div key={msg.id} className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] rounded-lg p-2.5 px-3 shadow-sm relative text-sm ${isInternalMsg ? 'bg-yellow-100 border border-yellow-300 text-gray-800' : isClient ? 'bg-white text-gray-900 rounded-tl-none' : 'bg-[#d9fdd3] text-gray-900 rounded-tr-none'}`}>
                      {!isClient && <div className="flex justify-between items-center mb-1 opacity-70 text-[10px] font-bold tracking-wide uppercase"><span className="flex items-center gap-1">{msg.sender_type === 'BOT' ? <Bot size={10}/> : isInternalMsg ? <StickyNote size={10}/> : <User size={10}/>}{msg.sender_type === 'BOT' ? 'IA' : isInternalMsg ? 'Nota Interna' : 'Agente'}</span></div>}
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <div className="text-[10px] text-gray-400 text-right mt-1 flex justify-end gap-1 items-center">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}{!isClient && !isInternalMsg && <CheckCircle size={10} className="text-blue-500"/>}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className={`p-2 border-t border-gray-200 transition-colors ${isInternal ? 'bg-yellow-50' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-2 justify-end md:justify-start">
                  <button onClick={() => setIsInternal(!isInternal)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-all ${isInternal ? 'bg-yellow-200 text-yellow-800 border-yellow-400 shadow-inner' : 'bg-white text-gray-600 border-gray-300'}`}>{isInternal ? <StickyNote size={12}/> : <Send size={12}/>}{isInternal ? 'NOTA INTERNA' : 'MENSAJE PÚBLICO'}</button>
              </div>
              <form onSubmit={handleSend} className="flex gap-2">
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={isInternal ? "Nota interna..." : "Escribe un mensaje..."} className={`flex-1 p-3 rounded-full border focus:outline-none focus:ring-2 transition-all ${isInternal ? 'bg-yellow-50 border-yellow-300 focus:ring-yellow-400' : 'bg-white border-gray-300 focus:ring-blue-500'}`} />
                <button type="submit" disabled={!inputText.trim()} className={`p-3 rounded-full text-white transition-colors shadow-sm disabled:opacity-50 ${isInternal ? 'bg-yellow-600' : 'bg-green-600'}`}><Send size={20} /></button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#f0f2f5] p-10 text-center"><Smartphone size={64} className="mb-4 opacity-20" /><p className="text-lg font-medium">Luz en tu Espacio Web</p><p className="text-sm">Selecciona un chat para comenzar.</p></div>
        )}
      </div>
    </div>
  );
}

export default App;
