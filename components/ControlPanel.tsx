import React, { useState } from 'react';
import type { ConnectionState } from '@/types';

interface ControlPanelProps {
    connectionState: ConnectionState;
    petName: string;
    onConnect: () => void;
    onDisconnect: () => void;
    onDispenseTreat: () => void;
    onPlaySound: (sound: string) => void;
}

const sounds = ['Squeaky Toy', 'Bird Chirp', 'Cat Meow'];

export const ControlPanel: React.FC<ControlPanelProps> = ({
    connectionState,
    petName,
    onConnect,
    onDisconnect,
    onDispenseTreat,
    onPlaySound,
}) => {
    const [selectedSound, setSelectedSound] = useState(sounds[0]);
    const isConnected = connectionState === 'CONNECTED';
    const isConnecting = connectionState === 'CONNECTING';

    const handleMainButtonClick = () => {
        if (isConnected || isConnecting) {
            onDisconnect();
        } else {
            onConnect();
        }
    };
    
    return (
        <div className="bg-brand-surface rounded-lg p-4 flex flex-col gap-4 shadow-lg">
            <h2 className="text-xl font-bold text-brand-text">Controls</h2>
            
            <button
                onClick={handleMainButtonClick}
                disabled={isConnecting}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface
                ${isConnecting ? 'bg-yellow-600 cursor-wait' : ''}
                ${!isConnecting && isConnected ? 'bg-brand-accent hover:bg-red-700 focus:ring-red-500' : ''}
                ${!isConnecting && !isConnected ? 'bg-brand-secondary hover:bg-purple-800 focus:ring-purple-500' : ''}
                `}
            >
                {isConnecting ? 'Connecting...' : (isConnected ? 'Disconnect' : `Talk to ${petName}`)}
            </button>

            <button
                onClick={onDispenseTreat}
                disabled={!isConnected}
                className="w-full py-2 px-4 rounded-lg bg-brand-primary hover:bg-blue-800 text-white font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                Dispense Treat
            </button>

            <div className="flex gap-2">
                <select 
                    value={selectedSound} 
                    onChange={e => setSelectedSound(e.target.value)}
                    disabled={!isConnected}
                    className="flex-grow bg-brand-primary border border-transparent rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {sounds.map(sound => <option key={sound} value={sound}>{sound}</option>)}
                </select>
                <button
                    onClick={() => onPlaySound(selectedSound)}
                    disabled={!isConnected}
                    className="py-2 px-4 rounded-lg bg-brand-primary hover:bg-blue-800 text-white font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Play
                </button>
            </div>
            
        </div>
    );
};
