/**
 * TypeScript definitions for window.openai runtime
 * ChatGPT Apps SDK - Widget Runtime API
 */

export interface OpenAIGlobals {
  // === Data Access ===

  /** Arguments passed to the tool that created this widget */
  toolInput: Record<string, any>;

  /** Structured content returned from the tool (what the model sees) */
  toolOutput: Record<string, any>;

  /** Private metadata from tool response (_meta field, widget-only) */
  toolResponseMetadata: Record<string, any>;

  /** Persistent widget state (survives across sessions) */
  widgetState: Record<string, any> | null;

  // === Actions ===

  /**
   * Call a tool from the widget
   * @param name - Tool name to invoke
   * @param args - Arguments to pass to the tool
   */
  callTool(name: string, args: Record<string, any>): Promise<void>;

  /**
   * Store widget state (persists across sessions)
   * @param state - State object to store
   */
  setWidgetState(state: Record<string, any>): void;

  /**
   * Request ChatGPT post a follow-up message
   * @param message - Message text
   */
  sendFollowUpMessage(message: string): Promise<void>;

  /**
   * Request display mode change
   * @param mode - Display mode (inline, fullscreen, pip)
   */
  requestDisplayMode(mode: 'inline' | 'fullscreen' | 'pip'): void;

  /**
   * Request modal overlay
   * @param config - Modal configuration
   */
  requestModal(config: ModalConfig): void;

  // === Context Signals ===

  /** Current theme (light or dark) */
  theme: 'light' | 'dark';

  /** Current display mode */
  displayMode: 'inline' | 'fullscreen' | 'pip';

  /** User locale (e.g., 'en-US') */
  locale: string;

  /** Safe area insets for mobile */
  safeArea: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  /** User agent string */
  userAgent: string;

  /** Device pixel ratio */
  devicePixelRatio: number;
}

export interface ModalConfig {
  title?: string;
  content: string;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Extend Window interface
declare global {
  interface Window {
    openai?: OpenAIGlobals;
  }

  interface WindowEventMap {
    'openai:set_globals': CustomEvent<Partial<OpenAIGlobals>>;
  }
}

export {};
