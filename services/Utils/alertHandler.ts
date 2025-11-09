// services/Utils/alertHandler.ts

export type AlertType = 'warning' | 'error' | 'info' | 'success';

export interface AlertButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
}

export interface AlertConfig {
  message: string;
  type: AlertType;
  buttons?: AlertButton[];
  onConfirm?: () => void;  
  onCancel?: () => void;   
}

type AlertHandler = (config: AlertConfig) => void;

class AlertHandlerService {
  private static handler: AlertHandler | null = null;
  private static fallbackEnabled = true;

  static setHandler(handler: AlertHandler): void {
    this.handler = handler;
  }

  static clearHandler(): void {
    this.handler = null;
  }

  static setFallback(enabled: boolean): void {
    this.fallbackEnabled = enabled;
  }

  static show(
    message: string,
    type: AlertType = 'info',
    options?: Omit<AlertConfig, 'message' | 'type'>
  ): void {
    const config: AlertConfig = { message, type, ...options };

    if (this.handler) {
      this.handler(config);
      return;
    }

    if (this.fallbackEnabled) {
      alert(message);
      return;
    }

    //console.warn('⚠️ No alert handler registered:', config);
  }

  static success(message: string, options?: Omit<AlertConfig, 'message' | 'type'>) {
    this.show(message, 'success', options);
  }

  static error(message: string, options?: Omit<AlertConfig, 'message' | 'type'>) {
    this.show(message, 'error', options);
  }

  static warning(message: string, options?: Omit<AlertConfig, 'message' | 'type'>) {
    this.show(message, 'warning', options);
  }

  static info(message: string, options?: Omit<AlertConfig, 'message' | 'type'>) {
    this.show(message, 'info', options);
  }
}

export default AlertHandlerService;