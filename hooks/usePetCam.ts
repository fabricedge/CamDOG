
import { useState, useRef, useCallback, useEffect } from 'react';
import type { LogEntry, ConnectionState } from '../types';
import { LogType } from '../types';
// FIX: Removed 'LiveSession' from import as it is not an exported member of '@google/genai'.
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';

// --- Helper Functions for Audio Processing ---

function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}


const PET_NAME = "Milo";

export const usePetCam = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED');
    const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    // FIX: Replaced 'LiveSession' with 'any' since it is not an exported type, to resolve the type error.
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
    
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const addLog = useCallback((type: LogType, message: string) => {
        const newEntry: LogEntry = {
            id: Date.now(),
            type,
            message,
            timestamp: new Date().toLocaleTimeString(),
        };
        setLogEntries(prev => [...prev, newEntry]);
    }, []);

    const connect = useCallback(async () => {
        if (connectionState !== 'DISCONNECTED') return;

        setConnectionState('CONNECTING');
        addLog(LogType.INFO, 'Starting session...');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setMediaStream(stream);

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setConnectionState('CONNECTED');
                        addLog(LogType.INFO, `Connected to ${PET_NAME}! You can now talk.`);
                        
                        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                        
                        const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        
                        const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            if (currentInputTranscriptionRef.current.trim()) {
                                addLog(LogType.USER_SPEECH, `You said: "${currentInputTranscriptionRef.current.trim()}"`);
                            }
                            if (currentOutputTranscriptionRef.current.trim()) {
                                addLog(LogType.AI_SPEECH, `${PET_NAME} responded: "${currentOutputTranscriptionRef.current.trim()}"`);
                            }
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }
                        
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const audioCtx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
                            
                            const source = audioCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(audioCtx.destination);
                            
                            source.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(source);
                            });

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Gemini Live API Error:', e);
                        addLog(LogType.ERROR, `Connection error: ${e.message || 'Unknown error'}`);
                        setConnectionState('ERROR');
                        disconnect();
                    },
                    onclose: () => {
                        addLog(LogType.INFO, 'Session closed.');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: `You are ${PET_NAME}, a friendly and playful dog. You can only respond with dog sounds like barks, yips, whines, and growls. Do not use any human words. Keep your responses short and expressive of a dog's emotions.`,
                },
            });

            sessionPromiseRef.current = sessionPromise;

        } catch (error) {
            console.error("Failed to connect:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addLog(LogType.ERROR, `Failed to start session: ${errorMessage}`);
            setConnectionState('ERROR');
        }
    }, [addLog, connectionState]);

    const disconnect = useCallback(() => {
        if (!sessionPromiseRef.current && !mediaStream) {
            return;
        }
        
        addLog(LogType.INFO, 'Disconnecting...');

        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        mediaStream?.getTracks().forEach(track => track.stop());
        setMediaStream(null);

        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;

        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        nextStartTimeRef.current = 0;

        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';

        setConnectionState('DISCONNECTED');
    }, [mediaStream, addLog]);

    const dispenseTreat = useCallback(() => {
        if (connectionState === 'CONNECTED') {
            addLog(LogType.ACTION, `${PET_NAME} received a treat!`);
        }
    }, [connectionState, addLog]);

    const playSound = useCallback((sound: string) => {
        if (connectionState === 'CONNECTED') {
            addLog(LogType.ACTION, `${PET_NAME} heard a ${sound} sound.`);
        }
    }, [connectionState, addLog]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (connectionState !== 'DISCONNECTED') {
                disconnect();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        connectionState,
        logEntries,
        mediaStream,
        petName: PET_NAME,
        connect,
        disconnect,
        dispenseTreat,
        playSound,
    };
};
