import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Loader2, Copy, Check, CornerDownLeft, 
  Image as ImageIcon, Plus, Trash2, Download, 
  Upload, FileText, Settings, Menu, X, 
  Sparkles, History, MessageSquare, Save,
  Share2, MoreVertical, ShieldCheck, Zap, Database, Layout, Beaker, Search,
  Terminal, Server, Cloud, Briefcase, PenTool, Activity, LineChart, Smartphone, TerminalSquare, Code, Shield, Cpu, Globe,
  Wrench, Lock, Key, PieChart, BarChart, TrendingUp, Megaphone, Target, Camera, Video, Music, Book, GraduationCap, Scale, HeartPulse, Leaf, Plane, DollarSign, ShoppingCart, Calendar, Clock, CheckSquare, List, MessageCircle, Mail, Phone, Users, Box, Map, Eye, Type as TypeIcon, Brain
} from "lucide-react";
import { AGENT_LIBRARY, type Agent, type AgentCategory } from "../data/agents";

const ICON_MAP: Record<string, any> = {
  Sparkles, History, MessageSquare, Save, Share2, MoreVertical, ShieldCheck, Zap, Database, Layout, Beaker, Search, Terminal, Server, Cloud, Briefcase, PenTool, Activity, LineChart, Smartphone, TerminalSquare, Code, Shield, Cpu, Globe, Wrench, Lock, Key, PieChart, BarChart, TrendingUp, Megaphone, Target, Camera, Video, Music, Book, GraduationCap, Scale, HeartPulse, Leaf, Plane, DollarSign, ShoppingCart, Calendar, Clock, CheckSquare, List, MessageCircle, Mail, Phone, Users, FileText, Settings, Image: ImageIcon, Box, Map, Eye, Type: TypeIcon, Brain
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
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  model: string;
  systemInstruction: string;
}

const TRANSLATIONS = {
  ENG: {
    newChat: "New Chat",
    agentLibrary: "Agent Library",
    howCanIHelp: "How can I help you today?",
    selectModel: "Select a model and start a conversation. You can upload images or generate them too.",
    typeMessage: "Type a message...",
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
    geminiProcessing: "Gemini is processing...",
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
    askGemini: "Ask Gemini anything...",
    uploadImageTitle: "Upload Image",
    clearChatTitle: "Clear Chat"
  },
  HUN: {
    newChat: "Új Csevegés",
    agentLibrary: "Ügynök Könyvtár",
    howCanIHelp: "Miben segíthetek ma?",
    selectModel: "Válassz egy modellt és kezdj egy beszélgetést. Képeket is feltölthetsz vagy generálhatsz.",
    typeMessage: "Írj egy üzenetet...",
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
    geminiProcessing: "A Gemini feldolgozza...",
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
    askGemini: "Kérdezz bármit a Geminitől...",
    uploadImageTitle: "Kép Feltöltése",
    clearChatTitle: "Csevegés Törlése"
  }
};

const MODELS = [
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", description: "Most capable model" },
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", description: "Fast and efficient" },
  { id: "gemini-2.5-flash-image", name: "Gemini Image Gen", description: "Generate images from text" },
  { id: "Qwen/Qwen3.5-35B-A3B:novita", name: "Qwen 3.5 35B", description: "Reasoning and Coding Assistant" },
];

export default function Chat() {
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [customAgents, setCustomAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem("gemini_custom_agents");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeAgent, setActiveAgent] = useState<Agent>(AGENT_LIBRARY[0]);
  const [generatedAgent, setGeneratedAgent] = useState<Agent | null>(null);
  const [isGeneratingAgent, setIsGeneratingAgent] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(AGENT_LIBRARY[0].systemInstruction);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [language, setLanguage] = useState<"ENG" | "HUN">("ENG");
  const t = TRANSLATIONS[language];
  const [agentSearchQuery, setAgentSearchQuery] = useState("");
  const [agentCategory, setAgentCategory] = useState<AgentCategory | "All">("All");
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [pendingCapabilityMessage, setPendingCapabilityMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Persistence
  useEffect(() => {
    localStorage.setItem("gemini_custom_agents", JSON.stringify(customAgents));
  }, [customAgents]);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const selectAgent = (agent: Agent) => {
    setActiveAgent(agent);
    setSystemInstruction(agent.systemInstruction);
    setIsLibraryOpen(false);
    setAgentSearchQuery("");
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

  const allAgents = [...AGENT_LIBRARY, ...customAgents];

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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate an AI agent profile based on this search query: "${agentSearchQuery}".
        Return ONLY a JSON object with this exact structure (no markdown formatting, just raw JSON):
        {
          "id": "generated-id",
          "name": "Agent Name",
          "description": "Short description of what the agent does.",
          "systemInstruction": "Detailed system instruction for the AI persona.",
          "icon": "Sparkles",
          "category": "Custom",
          "capabilities": ["Capability 1", "Capability 2", "Capability 3"],
          "commands": [
            { "command": "/analyze", "description": "Analyze the input", "prompt": "Analyze this: " }
          ]
        }`,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const data = JSON.parse(response.text);
      setGeneratedAgent({
        ...data,
        id: `custom-${Date.now()}`
      });
    } catch (error) {
      console.error("Failed to generate agent:", error);
    } finally {
      setIsGeneratingAgent(false);
    }
  };

  const saveGeneratedAgent = () => {
    if (generatedAgent) {
      setCustomAgents(prev => [...prev, generatedAgent]);
      setGeneratedAgent(null);
      setAgentSearchQuery("");
    }
  };

  const deleteCustomAgent = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCustomAgents(prev => prev.filter(a => a.id !== id));
    if (activeAgent.id === id) {
      setActiveAgent(AGENT_LIBRARY[0]);
      setSystemInstruction(AGENT_LIBRARY[0].systemInstruction);
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (val.startsWith("/")) {
      setShowCommandMenu(true);
    } else {
      setShowCommandMenu(false);
    }
  };

  const executeCommand = (cmd: { command: string; prompt: string }) => {
    const remainingText = input.replace(cmd.command, "").trim();
    const fullPrompt = cmd.prompt + remainingText;
    sendMessage(fullPrompt);
    setShowCommandMenu(false);
  };

  const generateSuggestions = async (lastAiMessage: string) => {
    if (!lastAiMessage || selectedModel === "gemini-2.5-flash-image") return;
    
    setIsGeneratingSuggestions(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on this AI response, generate 4 "Prompt Engineer level" follow-up prompts that a professional would ask to dive deeper, optimize, or expand on the topic. Return ONLY a JSON array of strings.
        
        AI Response: "${lastAiMessage.slice(0, 1000)}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      const suggestions = JSON.parse(response.text || "[]");
      setSuggestedPrompts(Array.isArray(suggestions) ? suggestions.slice(0, 4) : []);
    } catch (error) {
      console.error("Failed to generate suggestions", error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const sendMessage = async (messageText: string, overrideImages?: string[]) => {
    if (!messageText.trim() && !pendingImages.length && !overrideImages?.length) return;
    if (!currentSessionId) return;

    setSuggestedPrompts([]); // Clear old suggestions

    const imagesToUse = overrideImages || pendingImages;
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
    setPendingImages([]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Handle Image Generation Model
      if (selectedModel === "gemini-2.5-flash-image") {
        const response = await ai.models.generateContent({
          model: selectedModel,
          contents: { parts: [{ text: messageText }] },
          config: { imageConfig: { aspectRatio: "1:1" } }
        });

        let generatedImageUrl = "";
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          }
        }

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
      // Handle Qwen via HuggingFace Router
      else if (selectedModel === "Qwen/Qwen3.5-35B-A3B:novita") {
        const messages = [];
        if (currentSession?.messages) {
          for (const m of currentSession.messages) {
            messages.push({
              role: m.sender === "user" ? "user" : "assistant",
              text: m.text,
              images: m.images
            });
          }
        }
        messages.push({
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
            messages
          })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to fetch from Qwen API");
        }

        let finalAiText = "";
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
                      setSessions(prev => prev.map(s => {
                        if (s.id === currentSessionId) {
                          const lastMsg = s.messages[s.messages.length - 1];
                          if (lastMsg && lastMsg.id === aiMessageId) {
                            return { ...s, messages: s.messages.slice(0, -1).concat({ ...lastMsg, text: finalAiText }) };
                          } else {
                            return { ...s, messages: [...s.messages, { id: aiMessageId, text: finalAiText, sender: "gemini", timestamp: Date.now() }] };
                          }
                        }
                        return s;
                      }));
                    }
                  } catch (e) {
                    // Ignore parse errors for incomplete chunks
                  }
                }
              }
            }
          }
        } else {
          // Fallback if not streaming or body missing
          const data = await response.json();
          finalAiText = data.text || "";
          const aiMessage: Message = {
            id: crypto.randomUUID(),
            text: finalAiText || "No response.",
            sender: "gemini",
            timestamp: Date.now(),
          };
          setSessions(prev => prev.map(s => 
            s.id === currentSessionId ? { ...s, messages: [...s.messages, aiMessage] } : s
          ));
        }

        if (finalAiText) {
          generateSuggestions(finalAiText);
        }
      }
      // Handle Chat Models
      else {
        const parts: any[] = [];
        if (messageText.trim()) {
          parts.push({ text: messageText });
        }
        imagesToUse.forEach(img => {
          const base64Data = img.split(',')[1];
          const mimeType = img.split(';')[0].split(':')[1];
          parts.push({ inlineData: { data: base64Data, mimeType } });
        });

        const validHistory: any[] = [];
        let expectedRole = "user";
        
        if (currentSession?.messages) {
          for (const m of currentSession.messages) {
            const role = m.sender === "user" ? "user" : "model";
            if (role === expectedRole) {
              validHistory.push({
                role,
                parts: [{ text: m.text?.trim() ? m.text : " " }]
              });
              expectedRole = role === "user" ? "model" : "user";
            }
          }
        }
        
        if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === "user") {
          validHistory.pop();
        }

        const effectiveSystemInstruction = `${systemInstruction}\n\nIMPORTANT: You must respond entirely in ${language === "ENG" ? "English" : "Hungarian"}.`;

        const chat = ai.chats.create({
          model: selectedModel,
          config: { 
            systemInstruction: effectiveSystemInstruction,
            tools: activeAgent.geminiTools
          },
          history: validHistory.length > 0 ? validHistory : undefined
        });

        let finalAiText = "";
        let finalGroundingChunks: any[] = [];

        if (isStreaming) {
          const response = await chat.sendMessageStream({ message: parts });
          const aiMessageId = crypto.randomUUID();

          for await (const chunk of response) {
            const c = chunk as GenerateContentResponse;
            finalAiText += c.text;
            
            if (c.candidates?.[0]?.groundingMetadata?.groundingChunks) {
              finalGroundingChunks = c.candidates[0].groundingMetadata.groundingChunks;
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
          }
        } else {
          const response = await chat.sendMessage({ message: parts });
          finalAiText = response.text || "";
          if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            finalGroundingChunks = response.candidates[0].groundingMetadata.groundingChunks;
          }

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
        
        // Generate suggestions after AI finishes
        if (finalAiText) {
          generateSuggestions(finalAiText);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      
      let errorText = "Error: " + (error instanceof Error ? error.message : "Something went wrong.");
      
      if (errorText.includes("429") || errorText.includes("RESOURCE_EXHAUSTED")) {
        errorText = "⚠️ **Quota Exceeded**: Your Gemini API key has reached its rate limit or quota. Please check your Google AI Studio billing details or try again later.";
      } else if (errorText.includes("403") && errorText.includes("Inference Providers")) {
        errorText = "⚠️ **Permission Denied**: Your Hugging Face token does not have the required permissions.\n\nTo fix this:\n1. Go to your Hugging Face Token Settings.\n2. Create a new **Fine-grained** token.\n3. Under 'Inference', check **Make calls to the Serverless Inference API**.\n4. Update the `HF_TOKEN` secret in AI Studio.";
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
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed md:relative w-72 h-full bg-[#050505] border-r border-[#b020ff]/30 flex flex-col z-20 shadow-[0_0_15px_rgba(0,255,249,0.1)] md:shadow-none"
          >
            <div className="p-4 border-bottom border-[#b020ff]/30">
              <button
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 bg-[#e028e0] hover:bg-[#e028e0]/80 text-white py-2.5 rounded-xl transition-all shadow-[0_0_10px_rgba(255,0,60,0.5)]"
              >
                <Plus size={18} />
                <span className="font-medium">{t.newChat}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
              {suggestedPrompts.length > 0 && (
                <div className="mb-4 px-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#ffc020] uppercase tracking-widest mb-2">
                    <Sparkles size={10} />
                    Suggested Replies
                  </div>
                  <div className="space-y-2">
                    {suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(prompt)}
                        className="w-full text-left p-2.5 rounded-xl bg-[#ffc020]/5 border border-[#ffc020]/20 hover:bg-[#ffc020]/10 hover:border-[#ffc020]/40 text-[11px] text-[#ffc020]/80 transition-all leading-snug"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] font-bold text-[#a0a0b0]/60 uppercase tracking-widest px-2 mb-2">
                <span>Recent Chats</span>
              </div>
              {sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => setCurrentSessionId(session.id)}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                    currentSessionId === session.id 
                      ? "bg-[#0a0a0a] text-[#20e0e0]" 
                      : "hover:bg-[#0a0a0a]/50 text-[#20e0e0]/60"
                  )}
                >
                  <MessageSquare size={18} />
                  <span className="flex-1 truncate text-sm font-medium">{session.title}</span>
                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#b020ff]/30 space-y-4">
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="w-full flex items-center gap-3 p-3 bg-[#0a0a0a] hover:bg-[#111] rounded-xl text-sm text-white transition-all border border-[#e028e0]/30"
              >
                <div className="p-2 bg-[#ffc020]/10 rounded-lg text-[#ffc020]">
                  <Terminal size={16} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold">{t.agentLibrary}</span>
                  <span className="text-[10px] text-[#a0a0b0]/60">{t.skillsAndAgents}</span>
                </div>
              </button>

              <div className="space-y-2">
                <label className="text-[10px] text-[#4060ff]/80 font-bold uppercase tracking-widest px-1">{t.systemInstruction}</label>
                <textarea 
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  className="w-full bg-[#0a0a0a] text-xs rounded-lg p-2 border border-[#e028e0]/30 focus:border-[#20e0e0] outline-none resize-none h-20"
                  placeholder={t.setPersona}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[#80ff00]/60 px-2 mb-2">
                  <span>DATA MANAGEMENT</span>
                </div>
                <button onClick={exportJSON} className="w-full flex items-center gap-3 p-2 text-sm text-[#80ff00]/80 hover:text-white transition-colors">
                  <Download size={16} /> Export History
                </button>
                <label className="w-full flex items-center gap-3 p-2 text-sm text-[#80ff00]/80 hover:text-white transition-colors cursor-pointer">
                  <Upload size={16} /> Import History
                  <input type="file" hidden onChange={importJSON} accept=".json" />
                </label>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-16 bg-black/80 backdrop-blur-md border-b border-[#e028e0]/30 flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#111] rounded-lg text-[#e028e0]/80 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h1 
                className="text-lg font-bold text-white leading-tight glitch-text"
                data-text={currentSession?.title || "GlitchedAI"}
              >
                {currentSession?.title || "GlitchedAI"}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] cyber-text font-mono uppercase tracking-wider">
                <Sparkles size={10} />
                {MODELS.find(m => m.id === selectedModel)?.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as "ENG" | "HUN")}
              className="bg-[#0a0a0a] text-xs border border-[#20e0e0]/30 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-[#20e0e0] outline-none cyber-text mr-2"
            >
              <option value="ENG">ENG</option>
              <option value="HUN">HUN</option>
            </select>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#0a0a0a] text-xs border border-[#20e0e0]/30 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-[#20e0e0] outline-none cyber-text"
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button 
              onClick={exportToPDF}
              className="p-2 hover:bg-[#111] rounded-lg text-[#a0a0b0]/80 transition-colors"
              title={t.exportPDF}
            >
              <FileText size={20} />
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
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#20e0e0]/10">
                    <button 
                      onClick={() => handleCopy(message.text, message.id)}
                      className="flex items-center gap-1.5 text-xs text-[#20e0e0]/60 hover:text-[#20e0e0] transition-colors"
                      title="Copy Answer"
                    >
                      {copiedMessageId === message.id ? <Check size={14} /> : <Copy size={14} />}
                      <span>Copy</span>
                    </button>
                    <button 
                      onClick={() => handleStartNewChatWithAnswer(message.text)}
                      className="flex items-center gap-1.5 text-xs text-[#20e0e0]/60 hover:text-[#20e0e0] transition-colors"
                      title="Start new chat with this answer as system prompt"
                    >
                      <MessageSquare size={14} />
                      <span>Chat</span>
                    </button>
                    <button 
                      onClick={() => handleContinue(message.text)}
                      className="flex items-center gap-1.5 text-xs text-[#20e0e0]/60 hover:text-[#20e0e0] transition-colors"
                      title="Continue"
                    >
                      <CornerDownLeft size={14} />
                      <span>Continue</span>
                    </button>
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
              <div className="bg-[#0a0a0a] p-4 rounded-2xl rounded-tl-none border border-[#e028e0]/30 flex items-center gap-3">
                <Loader2 className="animate-spin text-[#20e0e0]" size={18} />
                <span className="text-sm text-[#e028e0]/80 animate-pulse">{t.geminiProcessing}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <footer className="p-4 bg-[#050505]/50 backdrop-blur-md border-t border-[#20e0e0]/30">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Pending Images Preview */}
            {pendingImages.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2">
                {pendingImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} className="w-16 h-16 object-cover rounded-lg border border-[#e028e0]/30" />
                    <button 
                      onClick={() => setPendingImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative flex items-end gap-2">
              {/* Command Menu */}
              <AnimatePresence>
                {showCommandMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 w-full mb-2 bg-[#050505] border border-[#20e0e0]/30 rounded-xl shadow-2xl overflow-hidden z-30"
                  >
                    <div className="p-2 bg-[#0a0a0a]/50 border-b border-[#b020ff]/30 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#4060ff]/80 uppercase tracking-widest px-2">{t.availableCommands}</span>
                      <X size={12} className="text-[#4060ff]/80 cursor-pointer" onClick={() => setShowCommandMenu(false)} />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {activeAgent.commands?.map((cmd, i) => (
                        <button
                          key={i}
                          onClick={() => executeCommand(cmd)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-[#20e0e0]/10 text-left transition-colors group"
                        >
                          <span className="text-[#4060ff] font-mono text-sm font-bold">{cmd.command}</span>
                          <span className="text-xs text-[#4060ff]/80 group-hover:text-white">{cmd.description}</span>
                        </button>
                      ))}
                      {(!activeAgent.commands || activeAgent.commands.length === 0) && (
                        <div className="p-4 text-center text-xs text-[#4060ff]/60 italic">
                          No commands available for {activeAgent.name}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 bg-[#0a0a0a] border border-[#e028e0]/30 rounded-2xl focus-within:ring-2 focus-within:ring-[#20e0e0]/50 transition-all">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder={selectedModel === "gemini-2.5-flash-image" ? t.describeImage : t.askGemini}
                  className="w-full bg-transparent border-none focus:ring-0 p-4 text-sm resize-none min-h-[52px] max-h-48 scrollbar-hide"
                  disabled={loading}
                />
                <div className="flex items-center justify-between px-3 pb-3">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-[#111] rounded-xl text-[#4060ff]/80 hover:text-[#4060ff] transition-colors"
                      title={t.uploadImageTitle}
                    >
                      <ImageIcon size={20} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      multiple 
                      accept="image/*" 
                      hidden 
                    />
                    <button 
                      onClick={() => setIsStreaming(!isStreaming)}
                      className={cn(
                        "p-2 rounded-xl transition-colors text-xs font-bold px-3",
                        isStreaming ? "text-[#20e0e0] bg-[#20e0e0]/10" : "text-[#20e0e0]/40 bg-[#111]"
                      )}
                    >
                      {isStreaming ? "STREAM" : "STATIC"}
                    </button>
                  </div>
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={loading || (!input.trim() && !pendingImages.length)}
                    className="bg-[#e028e0] hover:bg-[#e028e0]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shadow-lg shadow-[0_0_10px_rgba(255,0,60,0.5)]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-10"
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
              <div className="p-6 border-b border-[#b020ff]/30 flex items-center justify-between bg-[#050505]/50 backdrop-blur-md">
                <div>
                  <h2 className="text-2xl font-bold text-white">{t.agentLibrary}</h2>
                  <p className="text-sm text-[#a0a0b0]/80">{t.chooseSpecialist}</p>
                </div>
                <button 
                  onClick={() => setIsLibraryOpen(false)}
                  className="p-2 hover:bg-[#0a0a0a] rounded-full text-[#e028e0]/80 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Categories Sidebar */}
                <div className="w-48 bg-[#050505]/30 border-r border-[#b020ff]/30 p-4 overflow-y-auto hidden md:block">
                  <h3 className="text-[10px] font-bold text-[#4060ff]/80 uppercase tracking-widest mb-3 px-2">{t.categories}</h3>
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
                                  className="p-1.5 bg-[#e028e0]/10 text-[#e028e0]/60 hover:bg-[#e028e0]/20 hover:text-[#e028e0] rounded-lg transition-colors"
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
                  onClick={() => window.open('https://github.com', '_blank')}
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
