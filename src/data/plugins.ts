export interface TerminalPlugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Developer Tools' | 'Prompt Optimization' | 'Audio & Speech' | 'Analytics & Quality';
  enabled: boolean;
}

export const DEFAULT_PLUGINS: TerminalPlugin[] = [
  {
    id: 'token_counter',
    name: 'Token & Cost Estimator',
    description: 'Live token consumption, latency estimator, and context window monitor.',
    icon: 'Activity',
    category: 'Analytics & Quality',
    enabled: true
  },
  {
    id: 'code_runner',
    name: 'JavaScript / TS Sandbox',
    description: 'Interactive execution sandbox to run code blocks directly in the terminal.',
    icon: 'Terminal',
    category: 'Developer Tools',
    enabled: true
  },
  {
    id: 'speech_reader',
    name: 'Voice Synthesizer (TTS)',
    description: 'Listen to AI responses with natural Web Speech synthesis and playback controls.',
    icon: 'Music',
    category: 'Audio & Speech',
    enabled: true
  },
  {
    id: 'prompt_enhancer',
    name: 'Auto Prompt Optimizer',
    description: 'One-click AI prompt expansion adding elite system constraints and output schemas.',
    icon: 'Sparkles',
    category: 'Prompt Optimization',
    enabled: true
  },
  {
    id: 'diff_comparator',
    name: 'Side-by-Side Diff Inspector',
    description: 'Visual diff comparator for /compare, /rewrite, and /10x commands.',
    icon: 'Scale',
    category: 'Developer Tools',
    enabled: true
  },
  {
    id: 'json_formatter',
    name: 'JSON & Code Beautifier',
    description: 'Auto-formats raw JSON, SQL, and code snippets into clean markdown structures.',
    icon: 'Code',
    category: 'Developer Tools',
    enabled: true
  }
];

// Helper Utility Scripts

/**
 * Fast token estimator (~4 chars per token average)
 */
export function estimateTokens(text: string): { tokens: number; words: number; readingTimeSec: number } {
  if (!text) return { tokens: 0, words: 0, readingTimeSec: 0 };
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const tokens = Math.ceil(text.length / 3.8);
  const readingTimeSec = Math.ceil((words / 200) * 60);
  return { tokens, words, readingTimeSec };
}

/**
 * Text-to-speech speaker using browser SpeechSynthesis API
 */
export class SpeechReader {
  private static synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;

  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  static speak(text: string, onEnd?: () => void, lang = 'en-US'): boolean {
    if (!this.synth) return false;
    this.stop();

    // Clean markdown before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_#~]/g, '')
      .slice(0, 1000); // Safety limit for single utterance

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    if (onEnd) {
      utterance.onend = () => {
        this.currentUtterance = null;
        onEnd();
      };
      utterance.onerror = () => {
        this.currentUtterance = null;
        onEnd();
      };
    }

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  static stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  static isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

/**
 * Safe client-side JavaScript Execution Sandbox
 */
export function runSandboxCode(code: string): { output: string[]; error?: string; executionTimeMs: number } {
  const logs: string[] = [];
  const startTime = performance.now();

  const mockConsole = {
    log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
    warn: (...args: any[]) => logs.push('⚠️ ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
    error: (...args: any[]) => logs.push('❌ ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
    table: (data: any) => logs.push(JSON.stringify(data, null, 2))
  };

  try {
    // Strip markdown code fences if provided
    let cleanCode = code.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '').trim();
    
    // Create isolated sandbox function with mock console
    const sandboxFn = new Function('console', `
      try {
        ${cleanCode}
      } catch (err) {
        throw err;
      }
    `);

    const result = sandboxFn(mockConsole);
    if (result !== undefined && logs.length === 0) {
      logs.push(typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result));
    }
    
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return { output: logs.length > 0 ? logs : ['(Execution completed with no console output)'], executionTimeMs };
  } catch (err: any) {
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return { output: logs, error: err?.message || String(err), executionTimeMs };
  }
}

/**
 * Auto-Prompt Enhancer
 */
export function enhancePrompt(prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) return prompt;

  return `${trimmed}\n\n[Instructions: Provide an exceptionally thorough, high-precision response. Structure with clear markdown headings, bulleted takeaways, concrete real-world examples, and production-grade code snippets if applicable. Highlight edge-cases and critical trade-offs.]`;
}
