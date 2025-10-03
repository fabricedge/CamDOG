"use client";

import React from 'react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ControlPanel } from '@/components/ControlPanel';
import { InteractionLog } from '@/components/InteractionLog';
import { usePetCam } from '@/hooks/usePetCam';

export default function HomePage() {
    const {
        connectionState,
        logEntries,
        mediaStream,
        petName,
        connect,
        disconnect,
        dispenseTreat,
        playSound,
    } = usePetCam();

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-brand-accent tracking-wide">
                    Gemini Pet Cam
                </h1>
                <p className="text-brand-text-muted">
                    Your virtual window to talk to your best friend
                </p>
            </header>
            
            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 flex flex-col gap-8">
                    <VideoPlayer 
                        mediaStream={mediaStream} 
                        petName={petName}
                        connectionState={connectionState}
                    />
                    <ControlPanel
                        connectionState={connectionState}
                        petName={petName}
                        onConnect={connect}
                        onDisconnect={disconnect}
                        onDispenseTreat={dispenseTreat}
                        onPlaySound={playSound}
                    />
                </div>
                <div className="lg:col-span-2">
                    <InteractionLog entries={logEntries} />
                </div>
            </main>
        </div>
    );
}
