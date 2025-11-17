/**
 * React hook to access window.openai runtime
 * Subscribes to openai:set_globals events for reactive updates
 */

import { useSyncExternalStore, useCallback } from 'react';
import type { OpenAIGlobals } from '../types/openai';

/**
 * Subscribe to window.openai changes
 */
function subscribe(callback: () => void): () => void {
  const handler = () => callback();

  // Listen for openai:set_globals events
  window.addEventListener('openai:set_globals', handler);

  return () => {
    window.removeEventListener('openai:set_globals', handler);
  };
}

/**
 * Get current window.openai snapshot
 */
function getSnapshot(): OpenAIGlobals | null {
  return window.openai || null;
}

/**
 * Server-side rendering snapshot (always null)
 */
function getServerSnapshot(): null {
  return null;
}

/**
 * Hook to access window.openai with reactive updates
 *
 * @example
 * const openai = useOpenAiGlobal();
 * const companies = openai?.toolOutput?.companies || [];
 * const theme = openai?.theme || 'light';
 */
export function useOpenAiGlobal(): OpenAIGlobals | null {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
}

/**
 * Hook to access specific field from window.openai
 *
 * @example
 * const companies = useOpenAiField('toolOutput', 'companies', []);
 * const theme = useOpenAiField('theme', null, 'light');
 */
export function useOpenAiField<T>(
  field: keyof OpenAIGlobals,
  subfield?: string,
  defaultValue?: T
): T {
  const openai = useOpenAiGlobal();

  if (!openai) return defaultValue as T;

  const value = openai[field];

  if (subfield && typeof value === 'object' && value !== null) {
    return (value as any)[subfield] ?? defaultValue;
  }

  return (value ?? defaultValue) as T;
}

/**
 * Hook to call tools from widget
 *
 * @example
 * const callTool = useCallTool();
 * <button onClick={() => callTool('verify_uk_business', { company_number: '12345678' })}>
 *   Verify
 * </button>
 */
export function useCallTool() {
  const openai = useOpenAiGlobal();

  return useCallback(
    async (toolName: string, args: Record<string, any>) => {
      if (!openai?.callTool) {
        console.error('window.openai.callTool not available');
        return;
      }

      try {
        await openai.callTool(toolName, args);
      } catch (error) {
        console.error(`Failed to call tool ${toolName}:`, error);
        throw error;
      }
    },
    [openai]
  );
}

/**
 * Hook for widget state management
 *
 * @example
 * const [expanded, setExpanded] = useWidgetState('expanded', false);
 * <button onClick={() => setExpanded(!expanded)}>
 *   {expanded ? 'Collapse' : 'Expand'}
 * </button>
 */
export function useWidgetState<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const openai = useOpenAiGlobal();

  const value = (openai?.widgetState?.[key] ?? defaultValue) as T;

  const setValue = useCallback(
    (newValue: T) => {
      if (!openai?.setWidgetState) {
        console.error('window.openai.setWidgetState not available');
        return;
      }

      const currentState = openai.widgetState || {};
      openai.setWidgetState({
        ...currentState,
        [key]: newValue
      });
    },
    [openai, key]
  );

  return [value, setValue];
}

/**
 * Hook to get current theme
 *
 * @example
 * const theme = useTheme();
 * const isDark = theme === 'dark';
 */
export function useTheme(): 'light' | 'dark' {
  return useOpenAiField('theme', undefined, 'light');
}

/**
 * Hook to get current display mode
 *
 * @example
 * const displayMode = useDisplayMode();
 * const isFullscreen = displayMode === 'fullscreen';
 */
export function useDisplayMode(): 'inline' | 'fullscreen' | 'pip' {
  return useOpenAiField('displayMode', undefined, 'inline');
}
