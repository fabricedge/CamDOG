import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
    mediaStream: MediaStream | null;
    petName: string;
    connectionState: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ mediaStream, petName, connectionState }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
        } else if(videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [mediaStream]);

    const isLive = connectionState === 'CONNECTED';

    return (
        <div className="bg-brand-surface rounded-lg p-4 flex flex-col h-full shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-brand-text">Pet Cam</h2>
                <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-600 text-gray-300'}`}>
                        {isLive ? 'LIVE' : 'OFFLINE'}
                    </span>
                </div>
            </div>
            <div className="relative aspect-video bg-black rounded-md overflow-hidden flex-grow flex items-center justify-center">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover"></video>
                {!mediaStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Camera is off</span>
                    </div>
                )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-brand-text-muted">Name</p>
                    <p className="font-semibold text-lg text-brand-text">{petName}</p>
                </div>
                <div>
                    <p className="text-sm text-brand-text-muted">Status</p>
                    <p className="font-semibold text-lg text-brand-text">Resting</p>
                </div>
                <div>
                    <p className="text-sm text-brand-text-muted">Mood</p>
                    <p className="font-semibold text-lg text-brand-text">Calm</p>
                </div>
            </div>
        </div>
    );
};
