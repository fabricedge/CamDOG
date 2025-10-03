import React, { useRef, useEffect } from 'react';
import type { LogEntry } from '@/types';
import { LogItem } from './LogItem';

interface InteractionLogProps {
    entries: LogEntry[];
}

export const InteractionLog: React.FC<InteractionLogProps> = ({ entries }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [entries]);

    return (
        <div className="bg-brand-surface rounded-lg p-4 flex flex-col h-full shadow-lg">
            <h2 className="text-xl font-bold text-brand-text mb-4">Interaction Log</h2>
            <div ref={logContainerRef} className="flex-grow overflow-y-auto bg-brand-primary/30 rounded-md">
                {entries.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-brand-text-muted">
                        <p>No interactions yet. Connect to begin.</p>
                    </div>
                ) : (
                    entries.map(entry => <LogItem key={entry.id} entry={entry} />)
                )}
            </div>
        </div>
    );
};
