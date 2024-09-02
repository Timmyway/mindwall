export type NotifKind = 
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'primary'
  | 'secondary'
  | 'light'
  | 'dark';

export type NotifIconClass = 
  | 'fas fa-check-circle'   // success
  | 'fas fa-times-circle'   // error
  | 'fas fa-exclamation-circle'  // warning
  | 'fas fa-info-circle'    // info
  | 'fas fa-star'           // primary
  | 'fas fa-thumbs-up'      // secondary
  | 'fas fa-lightbulb'      // light
  | 'fas fa-moon';          // dark';

export interface Notification {
    show?: boolean;
    kind?: NotifKind;
    timeout?: number;
    message: string | string[];
}

export type NotifPosition = 'tl' | 'tr' | 'br' | 'bl';
