import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
export default function VideoRecorder({ orderId, onRecorded }) {
const [recording, setRecording] = useState(false);
const [previewUrl, setPreviewUrl] = useState(null);
const [duration, setDuration] = useState(0);
const [uploading, setUploading] = useState(false);
const [stream, setStream] = useState(null);
const mediaRecorderRef = useRef(null);
const chunksRef = useRef([]);
const timerRef = useRef(null);
const videoRef = useRef(null);
const { user } = useAuth();
const startRecording = async () => {
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: true,
        });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        const recorder = new MediaRecorder(mediaStream, {
            mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
                ? 'video/webm;codecs=vp9,opus'
                : 'video/webm',
        });
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            // Upload automatique vers Supabase Storage
            if (user?.id && orderId) {
                setUploading(true);
                try {
                    const fileName = `confirmations/${user.id}/${orderId}/${Date.now()}.webm`;
                    const { error: upErr } = await supabase.storage
                        .from('delivery-videos')
                        .upload(fileName, blob, { contentType: 'video/webm', upsert: false });
                    if (upErr) throw upErr;
                    onVideoUploaded && onVideoUploaded(fileName); // Retourne le chemin relatif
                } catch (err) {
                    console.error('Erreur upload vidéo:', err);
                    alert('Erreur lors de l\'envoi de la vidéo. Réessayez.');
                } finally {
                    setUploading(false);
                }
            }
            mediaStream.getTracks().forEach((t) => t.stop());
            setStream(null);
        };
        recorder.start();
        setRecording(true);
        setDuration(0);
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
        console.error('Caméra refusée:', err);
        alert('Impossible d\'accéder à la caméra. Autorisez l\'accès dans les paramètres de votre navigateur.');
    }
};
const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
        mediaRecorderRef.current.stop();
        setRecording(false);
        clearInterval(timerRef.current);
    }
};
const retake = () => {
    setPreviewUrl(null);
    onVideoUploaded && onVideoUploaded(null);
};
const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
};
return (
    <div className="w-full">
        {!previewUrl ? (
            <div className="relative rounded-xl overflow-hidden bg-gray-900" style={{ height: '320px' }}>
                {stream ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white">
                        <i className="ri-vidicon-line text-4xl mb-3 opacity-50"></i>
                        <p className="text-sm font-inter opacity-70">Prêt à enregistrer</p>
                    </div>
                )}
                {recording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-xs font-inter text-white">{formatTime(duration)}</span>
                    </div>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    {!recording && !stream && (
                        <button
                            onClick={startRecording}
                            disabled={uploading}
                            className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <i className="ri-record-circle-line text-2xl"></i>
                        </button>
                    )}
                    {recording && (
                        <button
                            onClick={stopRecording}
                            className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-red-500 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <i className="ri-stop-circle-line text-2xl"></i>
                        </button>
                    )}
                </div>
                {uploading && (
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Envoi en cours...
                    </div>
                )}
            </div>
        ) : (
            <div>
                <div className="rounded-xl overflow-hidden mb-3" style={{ height: '320px' }}>
                    <video src={previewUrl} controls className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={retake}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-poppins font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                        style={{ color: '#374151' }}
                    >
                        <i className="ri-refresh-line"></i> Refaire la vidéo
                    </button>
                </div>
            </div>
        )}
    </div>
);
}
