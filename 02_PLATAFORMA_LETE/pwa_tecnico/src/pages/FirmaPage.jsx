import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Ajusta la ruta según tu estructura

const FirmaPage = () => {
    const sigCanvas = useRef({});
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUser(user);
        };
        getUser();
    }, []);

    const clear = () => sigCanvas.current.clear();

    const save = async () => {
        if (sigCanvas.current.isEmpty()) {
            setFeedback({ type: 'error', message: 'Por favor firma antes de guardar.' });
            return;
        }

        setLoading(true);
        setFeedback({ type: '', message: '' });

        try {
            const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            const blob = await (await fetch(dataURL)).blob();

            if (!user) throw new Error('Usuario no autenticado');

            const fileName = `firma-ingeniero-${user.id}-${Date.now()}.png`;
            const filePath = `firmas/${fileName}`;

            // 1. Subir imagen al Storage
            const { error: uploadError } = await supabase.storage
                .from('reportes') // Usamos el bucket 'reportes' o 'firmas' según tu estructura
                .upload(filePath, blob, { contentType: 'image/png', upsert: true });

            if (uploadError) throw uploadError;

            // 2. Obtener URL pública
            const { data: urlData } = supabase.storage
                .from('reportes')
                .getPublicUrl(filePath);

            const publicUrl = urlData.publicUrl;

            // 3. Actualizar perfil del usuario
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ firma_url: publicUrl })
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            setFeedback({ type: 'success', message: 'Firma guardada exitosamente.' });
            setTimeout(() => navigate('/'), 1500);

        } catch (error) {
            console.error('Error guardando firma:', error);
            setFeedback({ type: 'error', message: 'Error al guardar la firma. Inténtalo de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-3">
                <button onClick={() => navigate('/')} className="text-slate-600">
                    ← Volver
                </button>
                <h1 className="text-lg font-bold text-slate-800">Configurar Firma</h1>
            </div>

            <div className="flex-1 p-4 flex flex-col items-center justify-center gap-6">
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-slate-800">Tu Firma Digital</h2>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                        Dibuja tu firma en el recuadro. Esta firma aparecerá automáticamente en tus reportes.
                    </p>
                </div>

                <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                    <SignatureCanvas
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{
                            className: 'w-full h-64 bg-white cursor-crosshair'
                        }}
                        backgroundColor="white"
                    />
                </div>

                {feedback.message && (
                    <div className={`text-sm font-medium px-4 py-2 rounded-lg ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {feedback.message}
                    </div>
                )}

                <div className="flex gap-4 w-full max-w-md">
                    <button
                        onClick={clear}
                        disabled={loading}
                        className="flex-1 py-3 px-4 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                    >
                        Borrar
                    </button>
                    <button
                        onClick={save}
                        disabled={loading}
                        className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors disabled:opacity-70 flex justify-center items-center"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : 'Guardar Firma'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FirmaPage;
