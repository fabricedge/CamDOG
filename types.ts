export enum LogType {
  INFO = 'INFO',
  USER_SPEECH = 'USER_SPEECH',
  AI_SPEECH = 'AI_SPEECH',
  ACTION = 'ACTION',
  ERROR = 'ERROR',
}

export interface LogEntry {
  id: number;
  type: LogType;
  message: string;
  timestamp: string;
}

export type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
