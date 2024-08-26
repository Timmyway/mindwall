export type NotifKind = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    show?: boolean;
    kind?: NotifKind;
    timeout?: number;
    message: string | string[];
}

export type NotifPosition = 'tl' | 'tr' | 'br' | 'bl';
