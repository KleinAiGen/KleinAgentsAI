import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Loader2, Copy, Check, CornerDownLeft, 
  Image as ImageIcon, Plus, Trash2, Download, 
  Upload, FileText, Settings, Menu, X, 
  Sparkles, History, MessageSquare, Save,
  Share2, MoreVertical, ShieldCheck, Zap, Database, Layout, Beaker, Search,
  Terminal, Server, Cloud, Briefcase, PenTool, Activity, LineChart, Smartphone, TerminalSquare, Code, Shield, Cpu, Globe,
  Wrench, Lock, Key, PieChart, BarChart, TrendingUp, Megaphone, Target, Camera, Video, Music, Book, GraduationCap, Scale, HeartPulse, Leaf, Plane, DollarSign, ShoppingCart, Calendar, Clock, CheckSquare, List, MessageCircle, Mail, Phone, Users, Box, Map as MapIcon, Eye, Type as TypeIcon, Brain,
  Volume2, VolumeX, Sliders, Play, Layers, ArrowRight, CornerRightDown, RefreshCw
} from "lucide-react";
import { AGENT_LIBRARY, type Agent, type AgentCategory } from "../data/agents";
import { CLAUDE_COMMANDS, type ClaudeCommand } from "../data/commands";
import { DEFAULT_PLUGINS, SpeechReader, estimateTokens, type TerminalPlugin } from "../data/plugins";
import { useAgentPersistence } from "../hooks/useAgentPersistence";
import ClaudeCommandsModal from "./ClaudeCommandsModal";
import CommandPalettePopup from "./CommandPalettePopup";
import PluginConsoleModal from "./PluginConsoleModal";
import AgentCreatorModal from "./AgentCreatorModal";

const ICON_MAP: Record<string, any> = {
  Sparkles, History, MessageSquare, Save, Share2, MoreVertical, ShieldCheck, Zap, Database, Layout, Beaker, Search, Terminal, Server, Cloud, Briefcase, PenTool, Activity, LineChart, Smartphone, TerminalSquare, Code, Shield, Cpu, Globe, Wrench, Lock, Key, PieChart, BarChart, TrendingUp, Megaphone, Target, Camera, Video, Music, Book, GraduationCap, Scale, HeartPulse, Leaf, Plane, DollarSign, ShoppingCart, Calendar, Clock, CheckSquare, List, MessageCircle, Mail, Phone, Users, FileText, Settings, Image: ImageIcon, Box, Map: MapIcon, Eye, Type: TypeIcon, Brain, Volume2, VolumeX, Sliders, Play, Layers
};
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "gemini";
  timestamp: number;
  images?: string[]; // Base64 images
  isImageGeneration?: boolean;
  groundingChunks?: any[];
  appliedCommand?: string;
  suggestions?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  model: string;
  systemInstruction: string;
  suggestedPrompts?: string[];
}

const TRANSLATIONS = {
  ENG: {
    newChat: "New Chat",
    agentLibrary: "Agent Library",
    howCanIHelp: "How can I help you today?",
    selectModel: "Select a model and start a conversation. You can upload images, use 43 Claude Commands, or run terminal plugins.",
    typeMessage: "Type a message or / for commands...",
    send: "Send",
    exportPDF: "Export to PDF",
    systemInstruction: "System Instruction",
    setPersona: "Set AI persona...",
    categories: "Categories",
    searchAgents: "Search agents, skills, and templates...",
    noAgents: "No agents found matching your criteria.",
    showing: "Showing",
    of: "of",
    availableAgents: "available agents",
    commands: "Commands",
    skills: "Skills",
    chooseSpecialist: "Choose a specialist for your task from the community repository",
    geminiProcessing: "AI Terminal is processing...",
    availableCommands: "Available Commands",
    attachImage: "Attach image",
    uploadImage: "Upload image",
    generateImage: "Generate image",
    clearChat: "Clear Chat",
    exportJSON: "Export JSON",
    importJSON: "Import JSON",
    skillsAndAgents: "1,000+ Skills & Agents",
    capabilities: "Capabilities",
    startChat: "Start Chat",
    describeImage: "Describe the image to generate...",
    askGemini: "Type message or /command (e.g. /godmode, /debug, /10x)...",
    uploadImageTitle: "Upload File / Image / Code",
    clearChatTitle: "Clear Chat",
    agentGenerator: "Agent Skill Generator",
    createCustomAgents: "Create Custom Agents",
    claudeCommandsBtn: "Claude Commands (43)",
    pluginsBtn: "Plugins & Scripts",
    terminalMode: "Terminal Mode",
    listen: "Listen",
    stop: "Stop",
    armedCommand: "Active Command Mode:",
    quickCommandsTitle: "POPULAR COMMANDS:",
    openPlaybook: "Open All 43 Commands",
    suggestedFollowUps: "Dynamic Follow-up Prompts",
    dynamicPrompts: "Dynamic Prompts",
    generatePrompts: "Generate Dynamic Prompts",
    generatingPrompts: "Generating Prompts...",
    regenerate: "Regenerate"
  },
  HUN: {
    newChat: "Új Csevegés",
    agentLibrary: "Ügynök Könyvtár",
    howCanIHelp: "Miben segíthetek ma?",
    selectModel: "Válassz modellt és indíts beszélgetést. Használhatsz fájlfeltöltést, 43 Claude parancsot és terminál pluginokat.",
    typeMessage: "Írj üzenetet vagy / a parancsokhoz...",
    send: "Küldés",
    exportPDF: "Exportálás PDF-be",
    systemInstruction: "Rendszer Utasítás",
    setPersona: "AI személyiség beállítása...",
    categories: "Kategóriák",
    searchAgents: "Ügynökök, készségek és sablonok keresése...",
    noAgents: "Nem található a feltételeknek megfelelő ügynök.",
    showing: "Mutatva",
    of: "/",
    availableAgents: "elérhető ügynök",
    commands: "Parancsok",
    skills: "Készségek",
    chooseSpecialist: "Válassz egy specialistát a feladatodhoz a közösségi tárból",
    geminiProcessing: "Az AI Terminál feldolgozza...",
    availableCommands: "Elérhető Parancsok",
    attachImage: "Kép csatolása",
    uploadImage: "Kép feltöltése",
    generateImage: "Kép generálása",
    clearChat: "Csevegés Törlése",
    exportJSON: "JSON Exportálása",
    importJSON: "JSON Importálása",
    skillsAndAgents: "1,000+ Készség és Ügynök",
    capabilities: "Képességek",
    startChat: "Csevegés Indítása",
    describeImage: "Írd le a generálandó képet...",
    askGemini: "Írj üzenetet vagy /parancsot (pl. /godmode, /debug, /10x)...",
    uploadImageTitle: "Fájl / Kép / Kód feltöltése",
    clearChatTitle: "Csevegés Törlése",
    agentGenerator: "Ügynök Készség Generátor",
    createCustomAgents: "Egyedi Ügynökök Készítése",
    claudeCommandsBtn: "Claude Parancsok (43)",
    pluginsBtn: "Bővítmények & Scriptek",
    terminalMode: "Terminál Üzemmód",
    listen: "Felolvasás",
    stop: "Leállítás",
    armedCommand: "Aktív Parancsmód:",
    quickCommandsTitle: "GYORSPARANCSOK:",
    openPlaybook: "Összes 43 Parancs Megnyitása",
    suggestedFollowUps: "Dinamikus Promptok & Folytatási Kérdések",
    dynamicPrompts: "Dinamikus Promptok",
    generatePrompts: "Dinamikus promptok generálása",
    generatingPrompts: "Promptok generálása...",
    regenerate: "Újragenerálás"
  }
};

const MODELS = [
  { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash", description: "Fast, intelligent & recommended" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "High stability standard model" },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", description: "Deep reasoning & code analysis" },
  { id: "gemini-3.1-flash-image", name: "Gemini Image Gen", description: "Generate images from text prompts" },
  { id: "Qwen/Qwen3.5-35B-A3B:novita", name: "Qwen 3.5 35B", description: "Open source reasoning assistant" },
];

export default function Chat() {
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  
  // Persistent Custom Agents Hook
  const { customAgents, saveAgent, deleteAgent: removeAgentFromStorage, setCustomAgents } = useAgentPersistence();
  
  const [activeAgent, setActiveAgent] = useState<Agent>(AGENT_LIBRARY[0]);
  const [generatedAgent, setGeneratedAgent] = useState<Agent | null>(null);
  const [isGeneratingAgent, setIsGeneratingAgent] = useState(false);
  const [isAgentCreatorOpen, setIsAgentCreatorOpen] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(AGENT_LIBRARY[0].systemInstruction);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [language, setLanguage] = useState<"ENG" | "HUN">("ENG");
  const t = TRANSLATIONS[language];
  const [agentSearchQuery, setAgentSearchQuery] = useState("");
  const [agentCategory, setAgentCategory] = useState<AgentCategory | "All">("All");
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [pendingCapabilityMessage, setPendingCapabilityMessage] = useState<string | null>(null);

  // Claude Commands & Plugins State
  const [isClaudeModalOpen, setIsClaudeModalOpen] = useState(false);
  const [isPluginModalOpen, setIsPluginModalOpen] = useState(false);
  const [activeCommand, setActiveCommand] = useState<ClaudeCommand | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [commandPaletteFilter, setCommandPaletteFilter] = useState("");
  const [commandPaletteSelectedIndex, setCommandPaletteSelectedIndex] = useState(0);
  const [operatingMode, setOperatingMode] = useState<"standard" | "claude_terminal" | "sandbox">("claude_terminal");
  const [plugins, setPlugins] = useState<TerminalPlugin[]>(() => {
    const saved = localStorage.getItem("terminal_plugins");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_PLUGINS;
  });

  const togglePlugin = (id: string) => {
    setPlugins(prev => {
      const next = prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p);
      localStorage.setItem("terminal_plugins", JSON.stringify(next));
      return next;
    });
  };

  const handleToggleTTS = (messageId: string, text: string) => {
    if (speakingMessageId === messageId) {
      SpeechReader.stop();
      setSpeakingMessageId(null);
    } else {
      const lang = language === "ENG" ? "en-US" : "hu-HU";
      const started = SpeechReader.speak(text, () => setSpeakingMessageId(null), lang);
      if (started) {
        setSpeakingMessageId(messageId);
      }
    }
  };
  
  const allAgents = [...AGENT_LIBRARY, ...customAgents];
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem("gemini_chats");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
      } catch (e) {
        console.error("Failed to load chats", e);
      }
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("gemini_chats", JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (!currentSessionId) return;
    const current = sessions.find(s => s.id === currentSessionId);
    if (current) {
      if (current.suggestedPrompts && current.suggestedPrompts.length > 0) {
        setSuggestedPrompts(current.suggestedPrompts);
      } else {
        const aiMsgs = current.messages.filter(m => m.sender === "gemini");
        const lastAi = aiMsgs[aiMsgs.length - 1];
        if (lastAi?.suggestions && lastAi.suggestions.length > 0) {
          setSuggestedPrompts(lastAi.suggestions);
        } else {
          setSuggestedPrompts([]);
        }
      }
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (pendingCapabilityMessage && currentSessionId && !loading) {
      sendMessage(pendingCapabilityMessage);
      setPendingCapabilityMessage(null);
    }
  }, [pendingCapabilityMessage, currentSessionId, activeAgent, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [currentSession?.messages, loading]);

  // Actions
  const createNewChat = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      model: selectedModel,
      systemInstruction: systemInstruction,
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (currentSessionId === id) {
        setCurrentSessionId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);
      
      if (isImg) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setPendingFiles(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Text or code file (.ts, .js, .py, .json, .txt, .md, .html, .css, etc.)
        const reader = new FileReader();
        reader.onloadend = () => {
          const content = reader.result as string;
          if (content) {
            const ext = file.name.split('.').pop() || '';
            const formattedAttachment = `\n\n\`\`\`${ext}\n// File: ${file.name}\n${content}\n\`\`\`\n\n`;
            setInput(prev => prev ? `${prev}${formattedAttachment}` : `Please analyze this file (${file.name}):${formattedAttachment}`);
          }
        };
        reader.readAsText(file);
      }
    });

    // Reset file input value so same file can be uploaded again if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  const selectAgent = (agent: Agent) => {
    setActiveAgent(agent);
    setSystemInstruction(agent.systemInstruction);
    setIsLibraryOpen(false);
    setAgentSearchQuery("");
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    // Optionally update current session's system instruction
    if (currentSessionId) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, systemInstruction: agent.systemInstruction } : s
      ));
    }
  };

  const handleCapabilityClick = (agent: Agent, cap: string) => {
    selectAgent(agent);
    
    // Check if current session is empty
    const currentSess = sessions.find(s => s.id === currentSessionId);
    if (currentSess && currentSess.messages.length > 0) {
      // Create new session
      const newSess: ChatSession = {
        id: crypto.randomUUID(),
        title: cap.slice(0, 30),
        messages: [],
        systemInstruction: agent.systemInstruction,
        createdAt: Date.now(),
        model: selectedModel,
      };
      setSessions(prev => [newSess, ...prev]);
      setCurrentSessionId(newSess.id);
    }
    
    setPendingCapabilityMessage(cap);
  };

  const filteredAgents = allAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(agentSearchQuery.toLowerCase()) || 
                          agent.description.toLowerCase().includes(agentSearchQuery.toLowerCase());
    const matchesCategory = agentCategory === "All" || agent.category === agentCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(allAgents.map(a => a.category)))] as string[];

  const generateAgent = async () => {
    if (!agentSearchQuery) return;
    setIsGeneratingAgent(true);
    setGeneratedAgent(null);
    try {
      const res = await fetch("/api/generate-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: agentSearchQuery })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || "Failed to generate agent");
      }
      const data = await res.json();
      setGeneratedAgent(data);
    } catch (error) {
      console.error("Failed to generate agent:", error);
    } finally {
      setIsGeneratingAgent(false);
    }
  };

  const saveGeneratedAgent = () => {
    if (generatedAgent) {
      saveAgent(generatedAgent);
      setGeneratedAgent(null);
      setAgentSearchQuery("");
    }
  };

  const deleteCustomAgent = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      removeAgentFromStorage(id);
      if (activeAgent?.id === id) {
        setActiveAgent(AGENT_LIBRARY[0]);
        setSystemInstruction(AGENT_LIBRARY[0].systemInstruction);
      }
    } catch (err) {
      console.error("Failed to delete agent", err);
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (val.startsWith("/")) {
      setShowCommandMenu(true);
      setCommandPaletteFilter(val);
      setCommandPaletteSelectedIndex(0);
    } else {
      setShowCommandMenu(false);
      setCommandPaletteFilter("");
    }
  };

  const handleSelectClaudeCommand = (cmd: ClaudeCommand, immediateExecute = false) => {
    setActiveCommand(cmd);
    setIsClaudeModalOpen(false);
    setShowCommandMenu(false);

    // If input already has /something, clean it
    let cleanInput = input;
    if (cleanInput.startsWith("/")) {
      cleanInput = cleanInput.replace(/^\/\S*\s*/, "").trim();
      setInput(cleanInput);
    }

    if (immediateExecute && cleanInput) {
      handleSendWithCommand(cleanInput, cmd);
    }
  };

  const handleTransformMessage = (cmdName: string, targetText: string) => {
    const targetCmd = CLAUDE_COMMANDS.find(c => c.command === cmdName);
    if (targetCmd) {
      sendMessage(`${targetCmd.prompt}\n\n"${targetText}"`);
    }
  };

  const executeCommand = (cmd: { command: string; prompt: string }) => {
    const remainingText = input.replace(cmd.command, "").trim();
    const fullPrompt = cmd.prompt + remainingText;
    sendMessage(fullPrompt);
    setShowCommandMenu(false);
  };

  const generateSuggestions = async (lastAiMessage: string, messageId?: string) => {
    if (!lastAiMessage || selectedModel.includes("image")) return;
    
    setIsGeneratingSuggestions(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: lastAiMessage, language })
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          const suggestions = data.suggestions.slice(0, 4);
          setSuggestedPrompts(suggestions);
          
          setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
              const updatedMessages = s.messages.map(m => 
                (messageId && m.id === messageId) || (!messageId && m.sender === "gemini" && m.text === lastAiMessage)
                  ? { ...m, suggestions }
                  : m
              );
              return { ...s, suggestedPrompts: suggestions, messages: updatedMessages };
            }
            return s;
          }));
        }
      }
    } catch (error) {
      console.error("Failed to generate suggestions", error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleSendWithCommand = (rawText: string, commandToUse?: ClaudeCommand | null) => {
    const cmd = commandToUse || activeCommand;
    let textToSend = rawText.trim();

    if (!textToSend && !pendingFiles.length) return;

    // Check if rawText starts with a slash command like /godmode or /debug
    if (textToSend.startsWith("/")) {
      const firstToken = textToSend.split(/\s+/)[0];
      const matchedCmd = CLAUDE_COMMANDS.find(c => c.command.toLowerCase() === firstToken.toLowerCase());
      if (matchedCmd) {
        const remaining = textToSend.slice(firstToken.length).trim();
        textToSend = remaining ? `${matchedCmd.prompt} ${remaining}` : matchedCmd.prompt;
      } else if (cmd) {
        textToSend = `${cmd.prompt} ${textToSend}`;
      }
    } else if (cmd) {
      textToSend = `${cmd.prompt} ${textToSend}`;
    }

    setActiveCommand(null);
    setShowCommandMenu(false);
    sendMessage(textToSend);
  };

  const sendMessage = async (messageText: string, overrideImages?: string[]) => {
    if (!messageText.trim() && !pendingFiles.length && !overrideImages?.length) return;
    if (!currentSessionId) return;

    setSuggestedPrompts([]); // Clear old suggestions

    const imagesToUse = overrideImages || pendingFiles;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: messageText,
      sender: "user",
      timestamp: Date.now(),
      images: imagesToUse.length > 0 ? [...imagesToUse] : undefined,
    };

    // Update session with user message
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const newTitle = s.messages.length === 0 ? messageText.slice(0, 30) : s.title;
        return { ...s, title: newTitle, messages: [...s.messages, userMessage] };
      }
      return s;
    }));

    setInput("");
    setPendingFiles([]);
    setLoading(true);

    try {
      // Handle Image Generation Model
      if (selectedModel.includes("image")) {
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: messageText,
            aspectRatio: "1:1"
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || errData.error || "Failed to generate image.");
        }

        const data = await response.json();
        const generatedImageUrl = data.imageUrl || "";

        const aiMessage: Message = {
          id: crypto.randomUUID(),
          text: generatedImageUrl ? "Generated image:" : "Failed to generate image.",
          sender: "gemini",
          timestamp: Date.now(),
          images: generatedImageUrl ? [generatedImageUrl] : undefined,
          isImageGeneration: true,
        };

        setSessions(prev => prev.map(s => 
          s.id === currentSessionId ? { ...s, messages: [...s.messages, aiMessage] } : s
        ));
      } 
      // Handle Chat Models (Gemini or Qwen)
      else {
        const messagesPayload: any[] = [];
        if (currentSession?.messages) {
          for (const m of currentSession.messages) {
            messagesPayload.push({
              role: m.sender === "user" ? "user" : "gemini",
              text: m.text,
              images: m.images
            });
          }
        }
        messagesPayload.push({
          role: "user",
          text: messageText,
          images: imagesToUse.length > 0 ? imagesToUse : undefined
        });

        const effectiveSystemInstruction = `${systemInstruction}\n\nIMPORTANT: You must respond entirely in ${language === "ENG" ? "English" : "Hungarian"}.`;

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: selectedModel,
            systemInstruction: effectiveSystemInstruction,
            messages: messagesPayload,
            stream: isStreaming
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.message || errData.error || `Request failed with status ${response.status}`;
          throw new Error(errMsg);
        }

        let finalAiText = "";
        let finalGroundingChunks: any[] = [];
        const aiMessageId = crypto.randomUUID();

        if (isStreaming && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let done = false;

          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
              const chunkStr = decoder.decode(value, { stream: true });
              const lines = chunkStr.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                  try {
                    const data = JSON.parse(line.slice(6));
                    if (data.text) {
                      finalAiText += data.text;
                    }
                    if (data.groundingChunks) {
                      finalGroundingChunks = data.groundingChunks;
                    }
                    setSessions(prev => prev.map(s => {
                      if (s.id === currentSessionId) {
                        const lastMsg = s.messages[s.messages.length - 1];
                        if (lastMsg && lastMsg.id === aiMessageId) {
                          return { ...s, messages: s.messages.slice(0, -1).concat({ ...lastMsg, text: finalAiText, groundingChunks: finalGroundingChunks }) };
                        } else {
                          return { ...s, messages: [...s.messages, { id: aiMessageId, text: finalAiText, sender: "gemini", timestamp: Date.now(), groundingChunks: finalGroundingChunks }] };
                        }
                      }
                      return s;
                    }));
                  } catch (e) {
                    // Ignore parse errors for split chunk frames
                  }
                }
              }
            }
          }
        } else {
          const data = await response.json();
          finalAiText = data.text || "";
          finalGroundingChunks = data.groundingChunks || [];

          const aiMessage: Message = {
            id: crypto.randomUUID(),
            text: finalAiText || "No response.",
            sender: "gemini",
            timestamp: Date.now(),
            groundingChunks: finalGroundingChunks.length > 0 ? finalGroundingChunks : undefined
          };
          setSessions(prev => prev.map(s => 
            s.id === currentSessionId ? { ...s, messages: [...s.messages, aiMessage] } : s
          ));
        }

        if (finalAiText) {
          generateSuggestions(finalAiText);
        }
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      
      let errorText = "Error: " + (error instanceof Error ? error.message : String(error));
      
      if (errorText.includes("429") || errorText.includes("RESOURCE_EXHAUSTED") || errorText.includes("Quota Exceeded")) {
        errorText = "⚠️ **Quota Limit Reached (429)**\n\nThe Gemini API quota for this billing tier has been reached. Please try again in a few moments, or check your rate limits in Google AI Studio.";
      } else if (errorText.includes("401") || errorText.includes("Invalid username or password") || errorText.includes("HF_TOKEN")) {
        errorText = "⚠️ **Hugging Face Authentication Failed (401)**\n\nTo use Qwen models, please ensure a valid Hugging Face User Access Token is configured in **Settings > Secrets** (`HF_TOKEN`), or switch to a Gemini model from the model selector above.";
      }

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: errorText,
        sender: "gemini",
        timestamp: Date.now(),
      };
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, messages: [...s.messages, errorMessage] } : s
      ));
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!chatContainerRef.current) return;
    try {
      const imgData = await toPng(chatContainerRef.current, {
        backgroundColor: "#111827",
        pixelRatio: 2,
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`chat-${currentSession?.title || "export"}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "gemini_chats_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setSessions(prev => [...imported, ...prev]);
      } catch (e) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleRetryWithGemini = (failedMessageId?: string) => {
    setSelectedModel("gemini-3.7-flash");
    const currentSess = sessions.find(s => s.id === currentSessionId);
    if (!currentSess) return;

    const userMsgs = currentSess.messages.filter(m => m.sender === "user");
    const lastUserMsg = userMsgs[userMsgs.length - 1];

    if (failedMessageId) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, messages: s.messages.filter(m => m.id !== failedMessageId) } : s
      ));
    }

    if (lastUserMsg) {
      setTimeout(() => {
        sendMessage(lastUserMsg.text, lastUserMsg.images);
      }, 50);
    }
  };

  const handleContinue = (messageText: string) => {
    sendMessage("Continue from here: " + messageText.slice(-100));
  };

  const handleStartNewChatWithAnswer = (text: string) => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: "New Chat from Answer",
      messages: [],
      createdAt: Date.now(),
      model: selectedModel,
      systemInstruction: text,
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSystemInstruction(text);
  };

  const handleEditMessage = (text: string) => {
    setInput(text);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden scanlines">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed md:relative w-[85vw] max-w-[300px] md:w-72 h-full bg-[#07070d] border-r border-[#b020ff]/30 flex flex-col z-40 shadow-[0_0_30px_rgba(0,0,0,0.9)] md:shadow-none top-0 left-0"
          >
            <div className="p-4 border-b border-[#b020ff]/30 flex items-center gap-2">
              <button
                onClick={createNewChat}
                className="flex-1 flex items-center justify-center gap-2 bg-[#e028e0] hover:bg-[#e028e0]/80 text-white py-2.5 rounded-xl transition-all shadow-[0_0_10px_rgba(255,0,60,0.5)] font-bold text-xs"
              >
                <Plus size={16} />
                <span>{t.newChat}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (sessions.length > 1) {
                    deleteSession(currentSessionId, e);
                  }
                }}
                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                title="Delete Current Chat"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all md:hidden"
                title="Close Sidebar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
              {/* Dynamic Suggested Prompts in Menu */}
              <div className="mb-3 px-2 py-2.5 rounded-xl bg-gradient-to-b from-[#ffc020]/10 via-[#ffc020]/5 to-transparent border border-[#ffc020]/30 shadow-[0_0_12px_rgba(255,192,32,0.1)]">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#ffc020] uppercase tracking-wider mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className={isGeneratingSuggestions ? "animate-spin text-[#ffc020]" : "text-[#ffc020] animate-pulse"} />
                    <span>{t.dynamicPrompts}</span>
                    {suggestedPrompts.length > 0 && (
                      <span className="bg-[#ffc020]/20 text-[#ffc020] text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                        {suggestedPrompts.length}
                      </span>
                    )}
                  </div>
                  {currentSession && currentSession.messages.some(m => m.sender === "gemini") && (
                    <button
                      onClick={() => {
                        const aiMsgs = currentSession.messages.filter(m => m.sender === "gemini");
                        const lastAi = aiMsgs[aiMsgs.length - 1];
                        if (lastAi) generateSuggestions(lastAi.text, lastAi.id);
                      }}
                      disabled={isGeneratingSuggestions || loading}
                      className="p-1 hover:bg-[#ffc020]/20 text-[#ffc020]/80 hover:text-[#ffc020] rounded transition-colors"
                      title={t.regenerate}
                    >
                      <RefreshCw size={11} className={isGeneratingSuggestions ? "animate-spin" : ""} />
                    </button>
                  )}
                </div>

                {isGeneratingSuggestions ? (
                  <div className="p-3 rounded-lg bg-[#000]/40 border border-[#ffc020]/20 flex items-center justify-center gap-2 text-xs text-[#ffc020]/90 animate-pulse">
                    <Loader2 size={13} className="animate-spin text-[#ffc020]" />
                    <span>{t.generatingPrompts}</span>
                  </div>
                ) : suggestedPrompts.length > 0 ? (
                  <div className="space-y-1.5">
                    {suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          sendMessage(prompt);
                          if (window.innerWidth < 768) setIsSidebarOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-[#0a0a10] border border-[#ffc020]/25 hover:border-[#ffc020]/70 hover:bg-[#ffc020]/15 text-[11px] text-[#ffc020] hover:text-white transition-all leading-snug flex items-center justify-between group shadow-sm"
                      >
                        <span className="line-clamp-2 pr-1">{prompt}</span>
                        <ArrowRight size={11} className="text-[#ffc020]/40 group-hover:text-[#ffc020] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    {currentSession && currentSession.messages.some(m => m.sender === "gemini") ? (
                      <button
                        onClick={() => {
                          const aiMsgs = currentSession.messages.filter(m => m.sender === "gemini");
                          const lastAi = aiMsgs[aiMsgs.length - 1];
                          if (lastAi) generateSuggestions(lastAi.text, lastAi.id);
                        }}
                        disabled={loading}
                        className="w-full text-center py-2 px-2.5 rounded-lg bg-[#ffc020]/10 hover:bg-[#ffc020]/20 border border-[#ffc020]/30 text-[11px] font-semibold text-[#ffc020] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={11} />
                        <span>{t.generatePrompts}</span>
                      </button>
                    ) : (
                      <div className="text-[10px] text-white/40 italic text-center py-1">
                        {language === "HUN" ? "A válasz után itt jelennek meg a folytatási javaslatok." : "Suggested prompts will appear here after AI replies."}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-[#a0a0b0]/60 uppercase tracking-widest px-2 mb-2">
                <span>Recent Chats</span>
              </div>
              {sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => {
                    setCurrentSessionId(session.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                    currentSessionId === session.id 
                      ? "bg-[#0a0a0a] text-[#20e0e0] border border-[#20e0e0]/30" 
                      : "hover:bg-[#0a0a0a]/50 text-[#20e0e0]/60"
                  )}
                >
                  <MessageSquare size={16} />
                  <span className="flex-1 truncate text-xs font-medium">{session.title}</span>
                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#b020ff]/30 space-y-2.5">
              {/* Claude Commands Button */}
              <button
                onClick={() => {
                  setIsClaudeModalOpen(true);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-[#b020ff]/20 to-[#4060ff]/20 hover:from-[#b020ff]/30 hover:to-[#4060ff]/30 rounded-xl text-sm text-white transition-all border border-[#b020ff]/50 shadow-[0_0_15px_rgba(176,32,255,0.15)] group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#b020ff]/20 rounded-lg text-[#b020ff] group-hover:scale-105 transition-transform">
                    <Zap size={16} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-xs text-white">{t.claudeCommandsBtn}</span>
                    <span className="text-[10px] text-[#20e0e0]/70">{t.openPlaybook}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#b020ff]/30 text-[#20e0e0] px-2 py-0.5 rounded-full border border-[#b020ff]/40">
                  43
                </span>
              </button>

              {/* Plugins Console Button */}
              <button
                onClick={() => {
                  setIsPluginModalOpen(true);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-[#0a0a0a] hover:bg-[#111] rounded-xl text-sm text-white transition-all border border-[#80ff00]/40 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#80ff00]/10 rounded-lg text-[#80ff00] group-hover:scale-105 transition-transform">
                    <Sliders size={16} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-xs text-white">{t.pluginsBtn}</span>
                    <span className="text-[10px] text-[#80ff00]/70">Sandbox & Tools</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#80ff00]/20 text-[#80ff00] px-2 py-0.5 rounded-full border border-[#80ff00]/30">
                  {plugins.filter(p => p.enabled).length} ON
                </span>
              </button>

              {/* Agent Generator / Creator Modal Launcher */}
              <button
                onClick={() => {
                  setIsAgentCreatorOpen(true);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 bg-[#0a0a0a] hover:bg-[#111] rounded-xl text-sm text-white transition-all border border-[#20e0e0]/40 hover:border-[#20e0e0] group"
              >
                <div className="p-2 bg-[#20e0e0]/10 rounded-lg text-[#20e0e0] group-hover:scale-105 transition-transform">
                  <Cpu size={16} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-xs">{t.agentGenerator}</span>
                  <span className="text-[10px] text-[#a0a0b0]/60">{t.createCustomAgents}</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsLibraryOpen(true);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 bg-[#0a0a0a] hover:bg-[#111] rounded-xl text-sm text-white transition-all border border-[#b020ff]/30 group"
              >
                <div className="p-2 bg-[#b020ff]/10 rounded-lg text-[#b020ff] group-hover:scale-105 transition-transform">
                  <Sparkles size={16} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-xs">{t.agentLibrary}</span>
                  <span className="text-[10px] text-[#a0a0b0]/60">{allAgents.length} Agents</span>
                </div>
              </button>

              <div className="space-y-2">
                <label className="text-[10px] text-[#4060ff]/80 font-bold uppercase tracking-widest px-1">{t.systemInstruction}</label>
                <textarea 
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  className="w-full bg-[#0a0a0a] text-xs rounded-lg p-2 border border-[#e028e0]/30 focus:border-[#20e0e0] outline-none resize-none h-16"
                  placeholder={t.setPersona}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[#80ff00]/60 px-2 mb-1">
                  <span className="text-[10px] font-mono">DATA</span>
                </div>
                <button onClick={exportJSON} className="w-full flex items-center gap-3 p-2 text-xs text-[#80ff00]/80 hover:text-white transition-colors">
                  <Download size={14} /> Export JSON
                </button>
                <label className="w-full flex items-center gap-3 p-2 text-xs text-[#80ff00]/80 hover:text-white transition-colors cursor-pointer">
                  <Upload size={14} /> Import JSON
                  <input type="file" hidden onChange={importJSON} accept=".json" />
                </label>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-black">
        {/* Header */}
        <header className="h-14 sm:h-16 bg-black/90 backdrop-blur-md border-b border-[#e028e0]/30 flex items-center justify-between px-3 sm:px-4 z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#111] rounded-lg text-[#ffc020] transition-colors shrink-0"
              title="Toggle Menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 
                className="text-sm sm:text-base font-bold text-white leading-tight truncate glitch-text"
                data-text={currentSession?.title || "AgentKlein AI"}
              >
                {currentSession?.title || "AgentKlein AI"}
              </h1>
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] cyber-text font-mono uppercase tracking-wider truncate">
                <Sparkles size={9} />
                <span className="truncate">{MODELS.find(m => m.id === selectedModel)?.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Generator Button */}
            <button
              onClick={() => setIsAgentCreatorOpen(true)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-[#20e0e0]/20 hover:bg-[#20e0e0]/30 text-[#20e0e0] rounded-lg border border-[#20e0e0]/40 text-xs font-bold transition-all shadow-[0_0_10px_rgba(32,224,224,0.2)]"
              title="Open Agent Skill Generator Studio"
            >
              <Cpu size={13} />
              <span className="hidden xs:inline sm:inline">Generator</span>
            </button>

            <button
              onClick={() => setIsClaudeModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 bg-[#b020ff]/20 hover:bg-[#b020ff]/30 text-[#20e0e0] rounded-lg border border-[#b020ff]/50 text-xs font-bold transition-all shadow-[0_0_10px_rgba(176,32,255,0.2)]"
              title="Open all 43 Claude Commands playbook"
            >
              <Zap size={13} className="text-[#b020ff]" />
              <span className="hidden xs:inline sm:inline">/commands</span>
              <span className="bg-[#b020ff]/40 text-white text-[9px] px-1 rounded">43</span>
            </button>

            <button
              onClick={() => setIsPluginModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#80ff00]/10 hover:bg-[#80ff00]/20 text-[#80ff00] rounded-lg border border-[#80ff00]/30 text-xs font-bold transition-all"
              title="Open Terminal Plugins & Code Sandbox"
            >
              <Sliders size={13} />
              <span>Plugins</span>
            </button>

            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as "ENG" | "HUN")}
              className="bg-[#0a0a0a] text-[11px] sm:text-xs border border-[#20e0e0]/30 rounded-lg px-2 py-1 focus:ring-1 focus:ring-[#20e0e0] outline-none cyber-text"
            >
              <option value="ENG">ENG</option>
              <option value="HUN">HUN</option>
            </select>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#0a0a0a] text-[11px] sm:text-xs border border-[#20e0e0]/30 rounded-lg px-2 py-1 focus:ring-1 focus:ring-[#20e0e0] outline-none cyber-text max-w-[120px] sm:max-w-none truncate"
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button 
              onClick={exportToPDF}
              className="p-1.5 sm:p-2 hover:bg-[#111] rounded-lg text-[#a0a0b0]/80 transition-colors"
              title={t.exportPDF}
            >
              <FileText size={18} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#e028e0]/50 scrollbar-track-transparent"
        >
          {currentSession?.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <div className="w-16 h-16 bg-[#20e0e0]/10 rounded-full flex items-center justify-center text-[#e028e0]">
                <Sparkles size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white glitch-text" data-text={t.howCanIHelp}>{t.howCanIHelp}</h2>
                <p className="text-sm text-[#20e0e0]/60 max-w-xs mx-auto mt-2">
                  {t.selectModel}
                </p>
              </div>
            </div>
          )}

          {currentSession?.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col gap-2",
                message.sender === "user" ? "items-end" : "items-start"
              )}
            >
              <div className={cn(
                "group relative max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm transition-all",
                message.sender === "user" 
                  ? "bg-[#e028e0] text-white rounded-tr-none" 
                  : "bg-[#0a0a0a] text-white rounded-tl-none border border-[#e028e0]/30"
              )}>
                {/* Images in message */}
                {message.images && message.images.length > 0 && (
                  <div className={cn(
                    "grid gap-2 mb-3",
                    message.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  )}>
                    {message.images.map((img, i) => (
                      <img 
                        key={i} 
                        src={img} 
                        alt="Uploaded" 
                        className="rounded-lg w-full object-cover max-h-64 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </div>
                )}

                {/* Text Content */}
                <div className={cn(
                  "prose prose-sm md:prose-base prose-invert max-w-none",
                  message.sender === "user" ? "prose-p:text-white" : ""
                )}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code(props: any) {
                        const { node, inline, className, children, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg !bg-[#050505] !p-4 my-2"
                            {...rest}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={cn("bg-[#050505] px-1.5 py-0.5 rounded text-[#20e0e0]", className)} {...rest}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>

                  {/* Render Grounding Sources */}
                  {message.groundingChunks && message.groundingChunks.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#e028e0]/30/50">
                      <div className="text-[10px] font-bold text-[#20e0e0]/40 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Globe size={10} /> Sources
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.groundingChunks.map((chunk, idx) => {
                          if (chunk.web?.uri) {
                            return (
                              <a 
                                key={idx} 
                                href={chunk.web.uri} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#050505]/50 hover:bg-[#050505] rounded-lg text-xs text-blue-400 hover:text-blue-300 transition-colors border border-[#e028e0]/30"
                              >
                                <Globe size={12} />
                                <span className="truncate max-w-[200px]">{chunk.web.title}</span>
                              </a>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Message Actions (Hover) */}
                {message.sender === "user" && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditMessage(message.text)}
                      className="p-1.5 bg-[#050505]/80 hover:bg-[#050505] rounded-md text-white/60 hover:text-white transition-all"
                      title="Edit Message"
                    >
                      <PenTool size={14} />
                    </button>
                    <button 
                      onClick={() => handleCopy(message.text, message.id)}
                      className="p-1.5 bg-[#050505]/80 hover:bg-[#050505] rounded-md text-white/60 hover:text-white transition-all"
                      title="Copy Message"
                    >
                      {copiedMessageId === message.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                )}

                {/* AI Message Actions (End of Answer) */}
                {message.sender === "gemini" && (
                  <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-[#20e0e0]/10">
                    {/* Error Recovery Button */}
                    {(message.text.includes("⚠️") || message.text.includes("Error:") || message.text.includes("401") || message.text.includes("429")) && (
                      <div className="mb-2">
                        <button
                          onClick={() => handleRetryWithGemini(message.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#20e0e0]/20 hover:bg-[#20e0e0]/30 text-[#20e0e0] border border-[#20e0e0]/50 rounded-lg text-xs font-semibold transition-all shadow-sm"
                        >
                          <RefreshCw size={13} />
                          <span>Switch to Gemini 3.7 Flash & Retry</span>
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        onClick={() => handleCopy(message.text, message.id)}
                        className="flex items-center gap-1.5 text-xs text-[#20e0e0]/70 hover:text-[#20e0e0] transition-colors bg-[#111] px-2.5 py-1 rounded-lg border border-[#20e0e0]/20"
                        title="Copy Answer"
                      >
                        {copiedMessageId === message.id ? <Check size={13} /> : <Copy size={13} />}
                        <span>Copy</span>
                      </button>

                      <button 
                        onClick={() => handleToggleTTS(message.id, message.text)}
                        className={cn(
                          "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all",
                          speakingMessageId === message.id
                            ? "bg-[#80ff00]/20 text-[#80ff00] border-[#80ff00]/50 animate-pulse"
                            : "text-[#80ff00]/70 hover:text-[#80ff00] bg-[#111] border-[#80ff00]/20"
                        )}
                        title="Text-to-Speech Voice Playback"
                      >
                        {speakingMessageId === message.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                        <span>{speakingMessageId === message.id ? t.stop : t.listen}</span>
                      </button>

                      <button 
                        onClick={() => handleStartNewChatWithAnswer(message.text)}
                        className="flex items-center gap-1.5 text-xs text-[#ffc020]/70 hover:text-[#ffc020] bg-[#111] px-2.5 py-1 rounded-lg border border-[#ffc020]/20 transition-colors"
                        title="Start new chat with this answer as system prompt"
                      >
                        <MessageSquare size={13} />
                        <span>Fork Chat</span>
                      </button>

                      <button 
                        onClick={() => handleContinue(message.text)}
                        className="flex items-center gap-1.5 text-xs text-[#4060ff]/70 hover:text-[#4060ff] bg-[#111] px-2.5 py-1 rounded-lg border border-[#4060ff]/20 transition-colors"
                        title="Continue"
                      >
                        <CornerDownLeft size={13} />
                        <span>Continue</span>
                      </button>

                      <button 
                        onClick={() => generateSuggestions(message.text, message.id)}
                        disabled={isGeneratingSuggestions || loading}
                        className="flex items-center gap-1.5 text-xs text-[#ffc020] hover:text-white bg-[#ffc020]/10 hover:bg-[#ffc020]/25 px-2.5 py-1 rounded-lg border border-[#ffc020]/30 transition-all shadow-sm"
                        title="Generate dynamic follow-up prompts"
                      >
                        <Sparkles size={13} className={isGeneratingSuggestions ? "animate-spin" : ""} />
                        <span>{t.dynamicPrompts}</span>
                      </button>
                    </div>

                    {/* Dynamic Follow-up Prompt Cards inside AI message bubble */}
                    {((message.suggestions && message.suggestions.length > 0) || (currentSession?.messages[currentSession.messages.length - 1]?.id === message.id && suggestedPrompts.length > 0)) && (
                      <div className="mt-2 pt-2.5 border-t border-[#ffc020]/20 bg-gradient-to-r from-[#ffc020]/10 via-[#ffc020]/5 to-transparent rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#ffc020] uppercase tracking-wider">
                            <Sparkles size={12} className="text-[#ffc020] animate-pulse" />
                            <span>{t.suggestedFollowUps}</span>
                          </div>
                          <span className="text-[10px] text-[#ffc020]/60 font-mono">1-click prompt</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {((message.suggestions && message.suggestions.length > 0) ? message.suggestions : suggestedPrompts).map((prompt, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => sendMessage(prompt)}
                              className="text-left p-2.5 rounded-lg bg-[#0a0a10]/90 hover:bg-[#ffc020]/20 border border-[#ffc020]/30 hover:border-[#ffc020]/70 text-xs text-white/90 hover:text-[#ffc020] transition-all flex items-center justify-between group shadow-sm"
                            >
                              <span className="line-clamp-2 pr-1.5 leading-snug">{prompt}</span>
                              <ArrowRight size={12} className="text-[#ffc020]/50 group-hover:text-[#ffc020] group-hover:translate-x-1 transition-all shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Command Transform Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 pt-2 border-t border-white/5">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mr-1">Transforms:</span>
                      <button
                        onClick={() => handleTransformMessage("/explainlikeim5", message.text)}
                        className="text-[10px] font-mono bg-[#050505] hover:bg-[#b020ff]/20 text-[#b020ff] hover:text-white px-2 py-0.5 rounded border border-[#b020ff]/30 transition-colors"
                        title="Explain like I'm 5"
                      >
                        🧒 /explainlikeim5
                      </button>
                      <button
                        onClick={() => handleTransformMessage("/10x", message.text)}
                        className="text-[10px] font-mono bg-[#050505] hover:bg-[#20e0e0]/20 text-[#20e0e0] hover:text-white px-2 py-0.5 rounded border border-[#20e0e0]/30 transition-colors"
                        title="Multiply quality by 10x"
                      >
                        ⚡ /10x
                      </button>
                      <button
                        onClick={() => handleTransformMessage("/debug", message.text)}
                        className="text-[10px] font-mono bg-[#050505] hover:bg-[#80ff00]/20 text-[#80ff00] hover:text-white px-2 py-0.5 rounded border border-[#80ff00]/30 transition-colors"
                        title="Deep code debugging"
                      >
                        🐞 /debug
                      </button>
                      <button
                        onClick={() => handleTransformMessage("/critique", message.text)}
                        className="text-[10px] font-mono bg-[#050505] hover:bg-[#ffc020]/20 text-[#ffc020] hover:text-white px-2 py-0.5 rounded border border-[#ffc020]/30 transition-colors"
                        title="Brutally honest review"
                      >
                        🔍 /critique
                      </button>
                      <button
                        onClick={() => handleTransformMessage("/summary", message.text)}
                        className="text-[10px] font-mono bg-[#050505] hover:bg-[#4060ff]/20 text-[#4060ff] hover:text-white px-2 py-0.5 rounded border border-[#4060ff]/30 transition-colors"
                        title="Executive Summary"
                      >
                        📋 /summary
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#20e0e0]/30 px-2">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="bg-[#0a0a0a] p-4 rounded-2xl rounded-tl-none border border-[#e028e0]/30 flex items-center gap-3 shadow-[0_0_15px_rgba(224,40,224,0.2)]">
                <Loader2 className="animate-spin text-[#20e0e0]" size={18} />
                <span className="text-sm text-[#e028e0]/80 animate-pulse">{t.geminiProcessing}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <footer className="p-4 bg-[#050505]/70 backdrop-blur-md border-t border-[#20e0e0]/30 relative z-20">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Armed Active Command Badge */}
            {activeCommand && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-[#b020ff]/30 via-[#4060ff]/20 to-transparent border border-[#b020ff]/60 rounded-xl shadow-[0_0_15px_rgba(176,32,255,0.25)]"
              >
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#80ff00] animate-ping" />
                  <Zap size={14} className="text-[#20e0e0]" />
                  <span className="font-mono font-bold text-white bg-[#b020ff]/50 px-2 py-0.5 rounded text-xs border border-[#b020ff]/60">
                    {activeCommand.command}
                  </span>
                  <span className="font-semibold text-[#20e0e0]">{activeCommand.name}</span>
                  <span className="text-[11px] text-[#a0a0b0] hidden sm:inline">- {activeCommand.description}</span>
                </div>
                <button
                  onClick={() => setActiveCommand(null)}
                  className="p-1 hover:bg-[#b020ff]/30 rounded-lg text-white/70 hover:text-white transition-colors"
                  title="Clear Active Command"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}

            {/* Dynamic Suggested Prompts Carousel Above Input */}
            {suggestedPrompts.length > 0 && !loading && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-mono font-bold text-[#ffc020] uppercase whitespace-nowrap tracking-wider flex items-center gap-1 bg-[#ffc020]/15 px-2 py-0.5 rounded border border-[#ffc020]/40">
                  <Sparkles size={11} className="text-[#ffc020] animate-pulse" />
                  {t.dynamicPrompts}:
                </span>
                {suggestedPrompts.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => sendMessage(prompt)}
                    className="text-xs bg-[#0c0c14] hover:bg-[#ffc020]/20 text-[#ffc020] hover:text-white px-2.5 py-1 rounded-lg border border-[#ffc020]/40 hover:border-[#ffc020]/80 transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <span className="font-medium">{prompt}</span>
                    <ArrowRight size={11} className="opacity-70 text-[#ffc020]" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Popular Commands Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-mono font-bold text-[#20e0e0]/60 uppercase whitespace-nowrap tracking-wider flex items-center gap-1">
                <Zap size={11} className="text-[#ffc020]" />
                {t.quickCommandsTitle}
              </span>
              
              {[
                { cmd: "/godmode", label: "God Mode", icon: "⚡" },
                { cmd: "/10x", label: "10x Quality", icon: "🚀" },
                { cmd: "/debug", label: "Deep Debug", icon: "🐞" },
                { cmd: "/explainlikeim5", label: "ELI5", icon: "🧒" },
                { cmd: "/critique", label: "Critique", icon: "🔍" },
                { cmd: "/architect", label: "Architect", icon: "🏗️" },
                { cmd: "/plan", label: "Plan", icon: "🎯" },
                { cmd: "/security", label: "Security", icon: "🔒" },
                { cmd: "/pitch", label: "Pitch", icon: "💼" },
                { cmd: "/brief", label: "Exec Brief", icon: "📊" },
              ].map(c => {
                const fullCmd = CLAUDE_COMMANDS.find(item => item.command === c.cmd);
                return (
                  <button
                    key={c.cmd}
                    onClick={() => {
                      if (fullCmd) handleSelectClaudeCommand(fullCmd);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1 border",
                      activeCommand?.command === c.cmd
                        ? "bg-[#b020ff] text-white border-[#b020ff] shadow-[0_0_10px_rgba(176,32,255,0.4)]"
                        : "bg-[#0a0a0a] hover:bg-[#111] text-[#20e0e0]/80 hover:text-white border-[#20e0e0]/20 hover:border-[#20e0e0]/50"
                    )}
                  >
                    <span>{c.icon}</span>
                    <span className="font-bold">{c.cmd}</span>
                  </button>
                );
              })}

              <button
                onClick={() => setIsClaudeModalOpen(true)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#b020ff]/20 hover:bg-[#b020ff]/30 text-[#b020ff] hover:text-white border border-[#b020ff]/40 whitespace-nowrap transition-all flex items-center gap-1"
              >
                <span>+ 33 More...</span>
              </button>
            </div>

            {/* Pending Images Preview */}
            {pendingFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2">
                {pendingFiles.map((fileContent, i) => (
                  <div key={i} className="relative group">
                    {fileContent.startsWith('data:image/') ? (
                      <img src={fileContent} className="w-16 h-16 object-cover rounded-lg border border-[#e028e0]/30" />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center bg-[#111] rounded-lg border border-[#e028e0]/30 text-[10px] text-[#a0a0b0] p-1 truncate break-all">
                        {fileContent.substring(0, 50)}...
                      </div>
                    )}
                    <button 
                      onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative flex items-end gap-2">
              {/* Floating Command Palette Popup */}
              <CommandPalettePopup
                isOpen={showCommandMenu}
                filterText={commandPaletteFilter}
                onSelect={(cmd) => handleSelectClaudeCommand(cmd)}
                onClose={() => setShowCommandMenu(false)}
                selectedIndex={commandPaletteSelectedIndex}
                setSelectedIndex={setCommandPaletteSelectedIndex}
              />

              <div className="flex-1 bg-[#0a0a0a] border border-[#e028e0]/40 rounded-2xl focus-within:ring-2 focus-within:ring-[#20e0e0]/50 focus-within:border-[#20e0e0] transition-all">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendWithCommand(input);
                    }
                  }}
                  placeholder={selectedModel === "gemini-2.5-flash-image" ? t.describeImage : (activeCommand ? `Type your prompt for ${activeCommand.command}...` : t.askGemini)}
                  className="w-full bg-transparent border-none focus:ring-0 p-3.5 text-sm resize-none min-h-[52px] max-h-48 scrollbar-hide text-white placeholder:text-white/40"
                  disabled={loading}
                />
                <div className="flex items-center justify-between px-3 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-[#111] rounded-xl text-[#4060ff]/80 hover:text-[#4060ff] transition-colors"
                      title={t.uploadImageTitle}
                    >
                      <ImageIcon size={18} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      multiple 
                      accept="image/*,.ts,.tsx,.js,.jsx,.py,.css,.html,.json,.md,.txt" 
                      hidden 
                    />
                    
                    <button 
                      onClick={() => setIsStreaming(!isStreaming)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors text-[10px] font-mono font-bold px-2.5 border",
                        isStreaming 
                          ? "text-[#20e0e0] bg-[#20e0e0]/10 border-[#20e0e0]/30" 
                          : "text-[#20e0e0]/40 bg-[#111] border-white/10"
                      )}
                    >
                      {isStreaming ? "STREAM ON" : "STATIC"}
                    </button>

                    {/* Real-time Token Counter */}
                    <span className="text-[10px] font-mono text-white/40 px-2 hidden sm:inline">
                      {estimateTokens(input).tokens} tokens
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendWithCommand(input)}
                      disabled={loading || (!input.trim() && !pendingFiles.length)}
                      className="bg-gradient-to-r from-[#e028e0] to-[#b020ff] hover:from-[#e028e0]/90 hover:to-[#b020ff]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-[0_0_15px_rgba(224,40,224,0.4)] flex items-center gap-1.5 font-bold text-xs"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <>
                          <span>{t.send}</span>
                          <Send size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Claude Commands Modal Playbook */}
      <ClaudeCommandsModal
        isOpen={isClaudeModalOpen}
        onClose={() => setIsClaudeModalOpen(false)}
        onSelectCommand={handleSelectClaudeCommand}
      />

      {/* Terminal Plugins Console & Sandbox Modal */}
      <PluginConsoleModal
        isOpen={isPluginModalOpen}
        onClose={() => setIsPluginModalOpen(false)}
        plugins={plugins}
        onTogglePlugin={togglePlugin}
        onInsertOptimizedPrompt={(prompt) => {
          setInput(prompt);
          setIsPluginModalOpen(false);
        }}
      />

      {/* Agent Creator & Skill Generator Modal */}
      <AgentCreatorModal
        isOpen={isAgentCreatorOpen}
        onClose={() => setIsAgentCreatorOpen(false)}
        onSaveAgent={(agent, activateImmediately) => {
          saveAgent(agent);
          if (activateImmediately) {
            selectAgent(agent);
          }
        }}
        onDeleteAgent={(id) => removeAgentFromStorage(id)}
        customAgents={customAgents}
        activeAgentId={activeAgent.id}
        initialQuery={agentSearchQuery}
      />

      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Agent Library Modal */}
      <AnimatePresence>
        {isLibraryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsLibraryOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-[#050505] border border-[#b020ff]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-4 sm:p-6 border-b border-[#b020ff]/30 flex items-center justify-between bg-[#050505]/80 backdrop-blur-md">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{t.agentLibrary}</h2>
                  <p className="text-xs sm:text-sm text-[#a0a0b0]/80">{t.chooseSpecialist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsLibraryOpen(false);
                      setIsAgentCreatorOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-[#20e0e0] to-[#b020ff] hover:opacity-90 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(32,224,224,0.4)] transition-all"
                  >
                    <Cpu size={14} />
                    <span>Create / Generate</span>
                  </button>
                  <button 
                    onClick={() => setIsLibraryOpen(false)}
                    className="p-2 hover:bg-[#0a0a0a] rounded-full text-[#e028e0]/80 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Categories Sidebar */}
                <div className="w-48 bg-[#050505]/30 border-r border-[#b020ff]/30 p-4 overflow-y-auto hidden md:block">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <h3 className="text-[10px] font-bold text-[#4060ff]/80 uppercase tracking-widest">{t.categories}</h3>
                    {customAgents.length > 0 && (
                      <button 
                        onClick={() => {
                          setCustomAgents([]);
                          localStorage.removeItem("gemini_custom_agents");
                          if (activeAgent?.id.startsWith('custom-')) {
                            setActiveAgent(AGENT_LIBRARY[0]);
                            setSystemInstruction(AGENT_LIBRARY[0].systemInstruction);
                          }
                        }}
                        className="text-[10px] text-red-500 hover:text-red-400 transition-colors"
                        title="Clear All Custom Agents"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setAgentCategory(cat as any)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          agentCategory === cat 
                            ? "bg-[#4060ff]/20 text-[#4060ff] font-bold" 
                            : "text-[#4060ff]/80 hover:bg-[#0a0a0a] hover:text-white"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-[#20e0e0]/30">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b020ff]/60" size={18} />
                      <input 
                        type="text" 
                        placeholder={t.searchAgents} 
                        className="w-full bg-[#0a0a0a] border border-[#e028e0]/30 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-[#20e0e0] outline-none transition-colors"
                        value={agentSearchQuery}
                        onChange={e => setAgentSearchQuery(e.target.value)}
                      />
                    </div>
                    {/* Mobile Category Dropdown */}
                    <div className="md:hidden mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setAgentCategory(cat as any)}
                          className={cn(
                            "whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition-colors border",
                            agentCategory === cat 
                              ? "bg-[#4060ff]/20 border-[#4060ff]/50 text-[#4060ff] font-bold" 
                              : "bg-[#0a0a0a] border-[#e028e0]/30 text-[#20e0e0]/60"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredAgents.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center text-[#e028e0]/60 py-12">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="mb-4">{t.noAgents}</p>
                        {agentSearchQuery && (
                          <button 
                            onClick={generateAgent}
                            disabled={isGeneratingAgent}
                            className="flex items-center gap-2 px-4 py-2 bg-[#b020ff]/20 border border-[#b020ff]/50 text-[#b020ff] rounded-lg hover:bg-[#b020ff]/30 transition-colors"
                          >
                            {isGeneratingAgent ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                            {isGeneratingAgent ? "Generating Agent..." : "Generate Custom Agent"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {generatedAgent && (
                        <div className="col-span-full mb-4">
                          <div className="bg-[#b020ff]/10 border border-[#b020ff] ring-1 ring-[#b020ff]/50 rounded-2xl p-5 flex flex-col h-full transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#b020ff]/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                            
                            <div className="flex items-start justify-between mb-4 relative z-10">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-[#b020ff] text-white flex items-center justify-center shadow-lg shadow-[#b020ff]/20">
                                  <Sparkles size={24} />
                                </div>
                                <div>
                                  <h3 className="font-bold text-white text-lg">{generatedAgent.name}</h3>
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffc020]/80 bg-[#050505] px-2 py-1 rounded">
                                    {generatedAgent.category}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={saveGeneratedAgent}
                                  className="p-2 bg-[#80ff00]/20 text-[#80ff00] hover:bg-[#80ff00]/30 rounded-lg transition-colors"
                                  title="Save to Library"
                                >
                                  <Download size={18} />
                                </button>
                                <button 
                                  onClick={() => setGeneratedAgent(null)}
                                  className="p-2 bg-[#e028e0]/20 text-[#e028e0] hover:bg-[#e028e0]/30 rounded-lg transition-colors"
                                  title="Discard"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-[#a0a0b0] leading-relaxed mb-4 flex-1 relative z-10">
                              {generatedAgent.description}
                            </p>
                            
                            {generatedAgent.capabilities && (
                              <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                                {generatedAgent.capabilities.map((cap, idx) => (
                                  <span key={idx} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#80ff00]/90 bg-[#80ff00]/10 px-1.5 py-0.5 rounded border border-[#80ff00]/20">
                                    <Check size={10} />
                                    {cap}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {generatedAgent.commands && generatedAgent.commands.length > 0 && (
                              <div className="mb-4 relative z-10">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#b020ff] mb-2">Presets & Prompts</h4>
                                <div className="space-y-2">
                                  {generatedAgent.commands.map((cmd, idx) => (
                                    <div key={idx} className="bg-[#050505]/50 border border-[#b020ff]/30 rounded p-2">
                                      <div className="text-xs font-mono text-[#b020ff] font-bold">{cmd.command}</div>
                                      <div className="text-[10px] text-[#a0a0b0] mt-1">{cmd.description}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-auto pt-4 border-t border-[#b020ff]/30 flex items-center justify-between relative z-10">
                              <div className="text-xs text-[#b020ff]/80 font-mono">
                                Generated Agent
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {filteredAgents.map((agent) => {
                        const Icon = ICON_MAP[agent.icon] || Sparkles;
                        return (
                          <div
                            key={agent.id}
                            onClick={() => selectAgent(agent)}
                            className={cn(
                              "flex flex-col items-start p-5 rounded-2xl border transition-all text-left group cursor-pointer",
                              activeAgent.id === agent.id 
                                ? "bg-[#b020ff]/20 border-[#b020ff]/50 ring-1 ring-[#b020ff]/50" 
                                : "bg-[#0a0a0a]/50 border-[#e028e0]/30 hover:border-[#e028e0]/50 hover:bg-[#0a0a0a]"
                            )}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className={cn(
                                "p-3 rounded-xl transition-colors",
                                activeAgent.id === agent.id ? "bg-[#b020ff] text-white" : "bg-[#111] text-[#20e0e0]/60 group-hover:text-white"
                              )}>
                                <Icon size={24} />
                              </div>
                              {agent.id.startsWith('custom-') && (
                                <button 
                                  onClick={(e) => deleteCustomAgent(e, agent.id)}
                                  className="p-1.5 bg-[#e028e0]/10 text-[#e028e0]/60 hover:bg-[#e028e0]/20 hover:text-[#e028e0] rounded-lg transition-colors relative z-10"
                                  title="Delete Custom Agent"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                            <h3 className="font-bold text-white mb-1">{agent.name}</h3>
                            <p className="text-xs text-[#a0a0b0] leading-relaxed mb-4 flex-1">
                              {agent.description}
                            </p>
                            
                            {agent.capabilities && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {agent.capabilities.map((cap, i) => (
                                  <button 
                                    key={i} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCapabilityClick(agent, cap);
                                    }}
                                    className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#80ff00]/90 bg-[#80ff00]/10 hover:bg-[#80ff00]/20 px-1.5 py-0.5 rounded border border-[#80ff00]/20 transition-colors cursor-pointer"
                                  >
                                    <Wrench size={8} /> {cap}
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffc020]/80 bg-[#050505] px-2 py-1 rounded">
                                {agent.category}
                              </span>
                              {agent.commands && (
                                <span className="text-[10px] text-[#b020ff] font-mono">
                                  {agent.commands.length} Commands
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#050505]/50 border-t border-[#b020ff]/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#a0a0b0]/80">
                  <History size={14} />
                  <span>{t.showing} {filteredAgents.length} {t.of} {allAgents.length} {t.availableAgents}</span>
                </div>
                <button 
                  className="text-xs text-[#e028e0] hover:underline font-bold"
                  onClick={() => window.open('https://github.com/KleinAiGen/KleinAgentsAI', '_blank')}
                >
                  Browse GitHub Repository
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
