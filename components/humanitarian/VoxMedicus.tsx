import React, { useState, useRef } from 'react';
import { Mic, Square, Sparkles, Activity, AlertTriangle } from 'lucide-react';
import { processMedicalAudioScribe } from '../../services/geminiService';
import { PatientData } from '../../types';

interface VoxMedicusProps {
    onDataExtracted: (data: PatientData) => void;
}

export const VoxMedicus: React.FC<VoxMedicusProps> = ({ onDataExtracted }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Codec Efficiency: Opus is standard for WebM and highly efficient for voice
            const mimeType = 'audio/webm; codecs=opus'; 
            
            // Fallback for Safari/Older browsers if needed, but WebM is widely supported in 2026 logic
            const options = MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : undefined;

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = handleStop;
            mediaRecorder.start();
            
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = window.setInterval(() => {
                setRecordingTime(t => t + 1);
            }, 1000);

        } catch (err) {
            console.error("Mic Error:", err);
            alert("Microphone access denied. Please enable permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            // Stop all tracks to release mic
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleStop = async () => {
        setIsProcessing(true);
        try {
            // 1. Create Blob
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

            // 2. Convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                // Strip header (data:audio/webm;base64,)
                const rawBase64 = base64String.split(',')[1];
                
                try {
                    // 3. Send to Gemini 3 Pro
                    const data = await processMedicalAudioScribe(rawBase64, 'audio/webm');
                    onDataExtracted(data);
                } catch (error) {
                    console.error(error);
                    alert("Analysis failed. Please try a shorter recording.");
                } finally {
                    setIsProcessing(false);
                }
            };
        } catch (error) {
            console.error(error);
            setIsProcessing(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative z-50">
            {/* FAB Button */}
            <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`
                    fixed bottom-6 right-6 md:absolute md:bottom-auto md:right-0 md:top-0 
                    p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2
                    ${isRecording 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-200 scale-110' 
                        : isProcessing
                            ? 'bg-indigo-600 cursor-wait'
                            : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'}
                `}
                title={isRecording ? "Stop Recording" : "Start Vox Medicus"}
            >
                {isProcessing ? (
                    <Sparkles size={24} className="text-white animate-spin" />
                ) : isRecording ? (
                    <Square size={24} className="text-white fill-current" />
                ) : (
                    <Mic size={24} className="text-white" />
                )}
                
                <span className="text-white font-bold pr-2 hidden md:inline">
                    {isProcessing ? "Analyzing..." : isRecording ? `Rec ${formatTime(recordingTime)}` : "Vox Medicus"}
                </span>
            </button>

            {/* Recording Indicator Overlay (Mobile Friendly) */}
            {isRecording && (
                <div className="fixed inset-x-0 bottom-24 mx-auto w-[90%] max-w-sm bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-red-500/30 shadow-2xl animate-slide-up flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></span>
                            <div className="relative bg-red-600 p-2 rounded-full">
                                <Activity size={20} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-red-200 uppercase tracking-wider">Live Input</p>
                            <p className="text-sm font-mono">{formatTime(recordingTime)} / WebM-Opus</p>
                        </div>
                    </div>
                    <div className="text-[10px] text-slate-400 max-w-[120px] text-right leading-tight">
                        Multimodal listening active. Analyzing tone & words.
                    </div>
                </div>
            )}
        </div>
    );
};