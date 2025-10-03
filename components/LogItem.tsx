
import React from 'react';
import type { LogEntry } from '../types';
import { LogType } from '../types';
import { BotIcon, ErrorIcon, InfoIcon, SoundIcon, TreatIcon, UserIcon } from './icons';

interface LogItemProps {
    entry: LogEntry;
}

// FIX: Updated getIcon to accept and use the log message to correctly display action-specific icons. The 'name' variable was undefined.
const getIcon = (type: LogType, message: string) => {
    const iconClass = "w-5 h-5 mr-3 flex-shrink-0";
    switch (type) {
        case LogType.INFO:
            return <InfoIcon className={`${iconClass} text-blue-400`} />;
        case LogType.USER_SPEECH:
            return <UserIcon className={`${iconClass} text-green-400`} />;
        case LogType.AI_SPEECH:
            return <BotIcon className={`${iconClass} text-purple-400`} />;
        case LogType.ACTION:
            if (/(treat)/i.test(message)) {
                return <TreatIcon className={`${iconClass} text-yellow-400`} />;
            }
            return <SoundIcon className={`${iconClass} text-yellow-400`} />;
        case LogType.ERROR:
            return <ErrorIcon className={`${iconClass} text-red-400`} />;
        default:
            return <InfoIcon className={`${iconClass} text-gray-400`} />;
    }
};


export const LogItem: React.FC<LogItemProps> = ({ entry }) => {
    return (
        <div className="flex items-start p-2.5 border-b border-brand-primary/50 last:border-b-0">
            {getIcon(entry.type, entry.message)}
            <div className="flex-grow">
                <p className="text-sm text-brand-text leading-tight">{entry.message}</p>
                <p className="text-xs text-brand-text-muted mt-0.5">{entry.timestamp}</p>
            </div>
        </div>
    );
};
