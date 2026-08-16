import { useState, useEffect, useCallback, useRef } from "react";
import { type Agent } from "../data/agents";

// Obfuscated database storage keys
const PRIMARY_KEY = "custom_agents_db";
const OBFUSCATED_KEY = typeof btoa === "function" ? btoa("custom_agents_db") : "Y3VzdG9tX2FnZW50c19kYg==";
const LEGACY_KEYS = ["gemini_custom_agents", PRIMARY_KEY];

function safeEncode(data: Agent[]): string {
  try {
    const json = JSON.stringify(data);
    return typeof btoa === "function" ? btoa(unescape(encodeURIComponent(json))) : json;
  } catch (err) {
    console.error("[useAgentPersistence] Failed to encode agents:", err);
    return JSON.stringify(data);
  }
}

function safeDecode(rawData: string): Agent[] {
  if (!rawData || typeof rawData !== "string") return [];
  
  // Try 1: Base64 UTF-8 decoded
  try {
    const decoded = decodeURIComponent(escape(atob(rawData)));
    const parsed = JSON.parse(decoded);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Try 2: Standard atob
    try {
      const decoded = atob(rawData);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Try 3: Direct JSON parse
      try {
        const parsed = JSON.parse(rawData);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.warn("[useAgentPersistence] Unable to parse raw data:", err);
      }
    }
  }

  return [];
}

/**
 * Custom React hook for persisting generated and custom AI agents to localStorage.
 * Handles deduplication, base64 data encoding, legacy key migrations, and cross-tab sync.
 */
export function useAgentPersistence(storageKey: string = OBFUSCATED_KEY) {
  const [customAgents, setCustomAgents] = useState<Agent[]>(() => {
    // Attempt to load from primary or legacy keys
    const keysToCheck = [storageKey, ...LEGACY_KEYS];
    for (const key of keysToCheck) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const agents = safeDecode(raw);
          if (agents.length > 0) {
            // Deduplicate by ID
            const uniqueMap = new Map<string, Agent>();
            for (const a of agents) {
              if (a && a.id) uniqueMap.set(a.id, a);
            }
            return Array.from(uniqueMap.values());
          }
        }
      } catch (e) {
        console.warn(`[useAgentPersistence] Error reading key "${key}":`, e);
      }
    }
    return [];
  });

  const [isLoaded, setIsLoaded] = useState(true);
  const isInitialMount = useRef(true);

  // Sync state to localStorage whenever customAgents updates
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    try {
      const encoded = safeEncode(customAgents);
      localStorage.setItem(storageKey, encoded);
      // Clean up legacy keys if they exist to keep storage tidy
      for (const legacy of LEGACY_KEYS) {
        if (legacy !== storageKey && localStorage.getItem(legacy)) {
          localStorage.removeItem(legacy);
        }
      }
    } catch (err) {
      console.error("[useAgentPersistence] Failed to write to localStorage:", err);
    }
  }, [customAgents, storageKey]);

  // Listen for storage events across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const remoteAgents = safeDecode(e.newValue);
          setCustomAgents(prev => {
            const map = new Map(prev.map(a => [a.id, a]));
            for (const agent of remoteAgents) {
              if (agent && agent.id) map.set(agent.id, agent);
            }
            return Array.from(map.values());
          });
        } catch (err) {
          console.error("[useAgentPersistence] Cross-tab sync error:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [storageKey]);

  /**
   * Save or insert a generated agent. Prevents duplicate ID entries.
   */
  const saveAgent = useCallback((agent: Agent): boolean => {
    if (!agent || !agent.id) {
      console.error("[useAgentPersistence] Cannot save invalid agent:", agent);
      return false;
    }

    setCustomAgents(prev => {
      const existsIndex = prev.findIndex(a => a.id === agent.id);
      if (existsIndex >= 0) {
        // Update existing
        const next = [...prev];
        next[existsIndex] = { ...next[existsIndex], ...agent };
        return next;
      }
      // Insert new
      return [agent, ...prev];
    });

    return true;
  }, []);

  /**
   * Delete an agent by its unique identifier.
   */
  const deleteAgent = useCallback((id: string) => {
    if (!id) return;
    setCustomAgents(prev => prev.filter(a => a.id !== id));
  }, []);

  /**
   * Update an existing custom agent.
   */
  const updateAgent = useCallback((agent: Agent) => {
    if (!agent || !agent.id) return;
    setCustomAgents(prev => prev.map(a => a.id === agent.id ? { ...a, ...agent } : a));
  }, []);

  /**
   * Retrieve a custom agent by ID.
   */
  const getAgent = useCallback((id: string): Agent | undefined => {
    return customAgents.find(a => a.id === id);
  }, [customAgents]);

  /**
   * Clear all custom persisted agents.
   */
  const clearAgents = useCallback(() => {
    setCustomAgents([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.error("[useAgentPersistence] Failed to clear storage:", err);
    }
  }, [storageKey]);

  return {
    customAgents,
    setCustomAgents,
    saveAgent,
    deleteAgent,
    updateAgent,
    getAgent,
    clearAgents,
    isLoaded
  };
}

export default useAgentPersistence;
