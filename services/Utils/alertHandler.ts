// services/utils/alertHandler.ts

/**
 * Alert Handler Service
 * Provides a centralized way to handle alerts throughout the application
 * Can be configured to use custom Alert component or fallback to native alert
 */

export type AlertType = 'warning' | 'error' | 'info' | 'success';

export interface AlertButton {
  label: string;
  onClick: () => void;
  variant?: string;
}

export interface AlertConfig {
  message: string;
  type: AlertType;
  buttons?: AlertButton[];
}

type AlertHandler = (config: AlertConfig) => void;

class AlertHandlerService {
  private static handler: AlertHandler | null = null;
  private static fallbackEnabled: boolean = true;

  /**
   * Set the custom alert handler (usually from a React component)
   * @param handler - Function that displays the custom alert
   */
  static setHandler(handler: AlertHandler): void {
    this.handler = handler;
    console.log('✅ Custom alert handler registered');
  }

  /**
   * Remove the custom alert handler
   */
  static clearHandler(): void {
    this.handler = null;
    console.log('🗑️ Custom alert handler cleared');
  }

  /**
   * Enable/disable fallback to native alert when no handler is set
   * @param enabled - Whether to use native alert as fallback
   */
  static setFallback(enabled: boolean): void {
    this.fallbackEnabled = enabled;
  }

  /**
   * Show an alert
   * @param message - The message to display
   * @param type - The type of alert (warning, error, info, success)
   * @param buttons - Optional custom buttons
   */
  static show(
    message: string,
    type: AlertType = 'info',
    buttons?: AlertButton[]
  ): void {
    const config: AlertConfig = { message, type, buttons };

    // Use custom handler if available
    if (this.handler) {
      this.handler(config);
      return;
    }

    // Fallback to native alert if enabled
    if (this.fallbackEnabled) {
      console.warn('⚠️ No custom alert handler registered, using native alert');
      alert(message);
      return;
    }

    // If no handler and fallback disabled, just log
    console.warn('⚠️ Alert attempted but no handler registered:', config);
  }

  /**
   * Convenience method for success alerts
   */
  static success(message: string, buttons?: AlertButton[]): void {
    this.show(message, 'success', buttons);
  }

  /**
   * Convenience method for error alerts
   */
  static error(message: string, buttons?: AlertButton[]): void {
    this.show(message, 'error', buttons);
  }

  /**
   * Convenience method for warning alerts
   */
  static warning(message: string, buttons?: AlertButton[]): void {
    this.show(message, 'warning', buttons);
  }

  /**
   * Convenience method for info alerts
   */
  static info(message: string, buttons?: AlertButton[]): void {
    this.show(message, 'info', buttons);
  }
}

export default AlertHandlerService;