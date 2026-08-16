import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, Cpu, Terminal, Code, Brain, Shield, Database, 
  Zap, Wrench, Plus, Trash2, Check, Download, Play, Rocket, 
  Search, RefreshCw, Layers, Edit3, UserCheck, AlertCircle
} from 'lucide-react';
import { type Agent, type AgentCategory } from '../data/agents';

const AVAILABLE_ICONS = [
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Cpu', icon: Cpu },
  { name: 'Terminal', icon: Terminal },
  { name: 'Code', icon: Code },
  { name: 'Brain', icon: Brain },
  { name: 'Shield', icon: Shield },
  { name: 'Database', icon: Database },
  { name: 'Zap', icon: Zap },
  { name: 'Wrench', icon: Wrench },
];

const CATEGORIES: (AgentCategory | 'Custom')[] = [
  'Custom',
  'Development',
  'Design',
  'Productivity',
  'Writing',
  'Marketing',
  'Business',
  'Education',
  'Lifestyle'
];

const SAMPLE_TEMPLATES = [
  { label: 'Python Backend Pro', query: 'Senior Python developer specialized in FastAPI, AsyncIO, PyTest, and PostgreSQL optimization.' },
  { label: 'Cybersecurity Auditor', query: 'Ethical hacker and security auditor specializing in OWASP Top 10, penetration testing, and code vulnerability scanning.' },
  { label: 'Hungarian AI Assistant', query: 'Magyar anyanyelvű professzionális tanácsadó és szövegíró, segítőkész és precíz stílussal.' },
  { label: 'Prompt Engineer Guru', query: 'Advanced LLM prompt engineering master crafting few-shot, chain-of-thought, and system prompts.' },
  { label: 'React UI Architect', query: 'Modern React 19 and Tailwind CSS frontend specialist focusing on accessible, high-performance web apps.' },
];

interface AgentCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAgent: (agent: Agent, activateImmediately?: boolean) => void;
  onDeleteAgent: (id: string) => void;
  customAgents: Agent[];
  activeAgentId?: string;
  initialQuery?: string;
}

export default function AgentCreatorModal({
  isOpen,
  onClose,
  onSaveAgent,
  onDeleteAgent,
  customAgents,
  activeAgentId,
  initialQuery = ''
}: AgentCreatorModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [generatorQuery, setGeneratorQuery] = useState(initialQuery);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [agentForm, setAgentForm] = useState<Agent>({
    id: `custom-${Date.now()}`,
    name: '',
    description: '',
    systemInstruction: '',
    icon: 'Sparkles',
    category: 'Custom',
    capabilities: ['Code Analysis', 'Problem Solving'],
    commands: [
      { command: '/analyze', description: 'Analyze input or code', prompt: 'Please analyze this deeply: ' }
    ]
  });

  const [newCapability, setNewCapability] = useState('');
  const [newCmdName, setNewCmdName] = useState('');
  const [newCmdDesc, setNewCmdDesc] = useState('');
  const [newCmdPrompt, setNewCmdPrompt] = useState('');

  if (!isOpen) return null;

  const handleGenerateWithAI = async (queryToUse?: string) => {
    const q = (queryToUse || generatorQuery).trim();
    if (!q) {
      setErrorMsg('Please enter a description or topic for the agent.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/generate-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || `HTTP error ${res.status}`);
      }

      const generated: Agent = await res.json();
      setAgentForm({
        ...generated,
        id: `custom-${Date.now()}`
      });
      setSuccessMsg(`Generated "${generated.name}" successfully! You can now customize or save it.`);
    } catch (err: any) {
      console.error('Failed to generate agent:', err);
      // Fallback smart builder
      const fallbackName = q.split(' ').slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Agent';
      setAgentForm({
        id: `custom-${Date.now()}`,
        name: fallbackName,
        description: `Expert assistant specialized in ${q}. Designed to provide concise, accurate, and actionable answers.`,
        systemInstruction: `You are an elite AI specialist in "${q}". Provide in-depth, structured, and highly practical assistance. Respond professionally in the user's language.`,
        icon: 'Cpu',
        category: 'Custom',
        capabilities: ['Domain Expertise', 'Strategy', 'Optimization'],
        commands: [
          { command: '/solve', description: 'Solve specific domain challenge', prompt: `Apply expertise in ${q} to solve: ` }
        ]
      });
      setSuccessMsg(`Generated draft for "${fallbackName}".`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCapability = () => {
    if (!newCapability.trim()) return;
    setAgentForm(prev => ({
      ...prev,
      capabilities: [...(prev.capabilities || []), newCapability.trim()]
    }));
    setNewCapability('');
  };

  const handleRemoveCapability = (idx: number) => {
    setAgentForm(prev => ({
      ...prev,
      capabilities: (prev.capabilities || []).filter((_, i) => i !== idx)
    }));
  };

  const handleAddCommand = () => {
    if (!newCmdName.trim() || !newCmdPrompt.trim()) return;
    const formattedCmd = newCmdName.startsWith('/') ? newCmdName.trim() : `/${newCmdName.trim()}`;
    setAgentForm(prev => ({
      ...prev,
      commands: [
        ...(prev.commands || []),
        { command: formattedCmd, description: newCmdDesc.trim() || formattedCmd, prompt: newCmdPrompt.trim() }
      ]
    }));
    setNewCmdName('');
    setNewCmdDesc('');
    setNewCmdPrompt('');
  };

  const handleRemoveCommand = (idx: number) => {
    setAgentForm(prev => ({
      ...prev,
      commands: (prev.commands || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSave = (activateImmediately = false) => {
    if (!agentForm.name.trim()) {
      setErrorMsg('Please provide a name for the agent.');
      return;
    }
    if (!agentForm.systemInstruction.trim()) {
      setErrorMsg('Please specify system instructions for this agent.');
      return;
    }

    const agentToSave: Agent = {
      ...agentForm,
      id: agentForm.id || `custom-${Date.now()}`
    };

    onSaveAgent(agentToSave, activateImmediately);
    setSuccessMsg(`Agent "${agentToSave.name}" successfully saved to your library!`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const loadAgentForEditing = (agent: Agent) => {
    setAgentForm({ ...agent });
    setActiveTab('create');
    setSuccessMsg(`Loaded "${agent.name}" for editing.`);
  };

  const SelectedIconComponent = AVAILABLE_ICONS.find(i => i.name === agentForm.icon)?.icon || Sparkles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl max-h-[92vh] bg-[#07070d] border border-[#20e0e0]/40 shadow-[0_0_40px_rgba(32,224,224,0.15)] rounded-2xl flex flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#20e0e0]/30 flex items-center justify-between bg-[#0b0b14]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#20e0e0]/20 to-[#b020ff]/20 text-[#20e0e0] border border-[#20e0e0]/40 rounded-xl shadow-[0_0_15px_rgba(32,224,224,0.2)]">
              <Cpu size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-wider text-white flex items-center gap-2">
                Agent Skill Generator
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#20e0e0]/10 text-[#20e0e0] rounded border border-[#20e0e0]/30">
                  Creator Studio
                </span>
              </h2>
              <p className="text-xs text-[#20e0e0]/60">Design, customize, or generate AI specialists in seconds</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#05050a] p-1 rounded-xl border border-[#20e0e0]/20 text-xs">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'create'
                    ? 'bg-[#20e0e0] text-black shadow-[0_0_10px_rgba(32,224,224,0.5)]'
                    : 'text-[#20e0e0]/70 hover:text-white'
                }`}
              >
                Creator & AI
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'manage'
                    ? 'bg-[#b020ff] text-white shadow-[0_0_10px_rgba(176,32,255,0.5)]'
                    : 'text-[#b020ff]/70 hover:text-white'
                }`}
              >
                <span>My Agents</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-black/40 rounded-full font-mono">
                  {customAgents.length}
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}
        {successMsg && (
          <div className="mx-4 mt-3 p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check size={15} />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'manage' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#20e0e0] uppercase tracking-wider flex items-center gap-2">
                  <Layers size={16} /> Saved Custom Agents ({customAgents.length})
                </h3>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-3 py-1.5 bg-[#20e0e0]/20 hover:bg-[#20e0e0]/30 text-[#20e0e0] rounded-lg text-xs font-bold border border-[#20e0e0]/40 flex items-center gap-1.5 transition-all"
                >
                  <Plus size={14} /> Create New Agent
                </button>
              </div>

              {customAgents.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-[#20e0e0]/20 rounded-2xl space-y-3 bg-[#05050a]">
                  <Cpu size={40} className="mx-auto text-[#20e0e0]/30" />
                  <p className="text-sm text-[#20e0e0]/70 font-medium">No custom agents saved yet.</p>
                  <p className="text-xs text-white/40 max-w-sm mx-auto">
                    Use the AI Generator or the Creator form to build and save custom personas that stay in your memory.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-2 px-4 py-2 bg-[#20e0e0] hover:bg-[#20e0e0]/90 text-black font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(32,224,224,0.4)]"
                  >
                    Generate Your First Agent
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customAgents.map(agent => {
                    const IconComp = AVAILABLE_ICONS.find(i => i.name === agent.icon)?.icon || Sparkles;
                    const isActive = activeAgentId === agent.id;
                    return (
                      <div
                        key={agent.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isActive
                            ? 'bg-[#b020ff]/20 border-[#b020ff] shadow-[0_0_20px_rgba(176,32,255,0.2)]'
                            : 'bg-[#0b0b14] border-[#20e0e0]/20 hover:border-[#20e0e0]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#20e0e0]/10 text-[#20e0e0] rounded-xl border border-[#20e0e0]/30">
                              <IconComp size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm">{agent.name}</h4>
                              <span className="text-[10px] text-[#ffc020] uppercase font-mono font-bold">
                                {agent.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => loadAgentForEditing(agent)}
                              className="p-1.5 text-[#20e0e0]/70 hover:text-[#20e0e0] hover:bg-[#20e0e0]/10 rounded-lg transition-colors"
                              title="Edit Agent"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => onDeleteAgent(agent.id)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete Agent"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-white/70 line-clamp-2 mb-3">{agent.description}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <span className="text-[10px] font-mono text-white/40">
                            {agent.commands?.length || 0} Commands
                          </span>
                          <button
                            onClick={() => {
                              onSaveAgent(agent, true);
                              onClose();
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isActive
                                ? 'bg-[#80ff00]/20 text-[#80ff00] border border-[#80ff00]/40'
                                : 'bg-[#20e0e0]/20 hover:bg-[#20e0e0]/30 text-[#20e0e0] border border-[#20e0e0]/40'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <Check size={13} /> Active Agent
                              </>
                            ) : (
                              <>
                                <Rocket size={13} /> Activate
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* AI One-Click Generator Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#b020ff]/15 via-[#20e0e0]/10 to-[#b020ff]/15 border border-[#20e0e0]/40 shadow-[0_0_20px_rgba(32,224,224,0.1)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-[#20e0e0]" />
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      One-Click AI Generator
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#20e0e0]/80 bg-[#20e0e0]/10 px-2 py-0.5 rounded border border-[#20e0e0]/30">
                    Fast Generation
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={generatorQuery}
                      onChange={e => setGeneratorQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleGenerateWithAI();
                      }}
                      placeholder="e.g. Hungarian Tax Law Advisor, Rust Systems Engineer, SEO Specialist..."
                      className="w-full bg-[#05050a] border border-[#20e0e0]/40 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/40 focus:border-[#20e0e0] focus:ring-1 focus:ring-[#20e0e0] outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleGenerateWithAI()}
                    disabled={isGenerating}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#20e0e0] to-[#b020ff] hover:opacity-90 disabled:opacity-50 text-black font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(32,224,224,0.4)] transition-all cursor-pointer whitespace-nowrap"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin text-black" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Generate Agent</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Example Quick Prompts */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-white/50 font-bold uppercase mr-1">Inspirations:</span>
                  {SAMPLE_TEMPLATES.map((tmpl, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setGeneratorQuery(tmpl.query);
                        handleGenerateWithAI(tmpl.query);
                      }}
                      className="text-[10px] bg-[#0b0b14] hover:bg-[#20e0e0]/20 text-[#20e0e0] px-2.5 py-1 rounded-full border border-[#20e0e0]/30 transition-all font-mono"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Form & Preview Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Customizer Form (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-xs font-bold text-[#20e0e0] uppercase tracking-wider flex items-center gap-2">
                    <Edit3 size={15} /> Customize Agent Specs
                  </h3>

                  {/* Name & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest block mb-1">
                        Agent Name *
                      </label>
                      <input
                        type="text"
                        value={agentForm.name}
                        onChange={e => setAgentForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Hungarian Code Auditor"
                        className="w-full bg-[#05050a] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-[#20e0e0] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest block mb-1">
                        Category
                      </label>
                      <select
                        value={agentForm.category}
                        onChange={e => setAgentForm(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full bg-[#05050a] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-[#20e0e0] outline-none"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest block mb-1">
                      Choose Icon
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {AVAILABLE_ICONS.map(({ name, icon: IconComp }) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setAgentForm(prev => ({ ...prev, icon: name }))}
                          className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-xs ${
                            agentForm.icon === name
                              ? 'bg-[#20e0e0] text-black border-[#20e0e0] shadow-[0_0_10px_rgba(32,224,224,0.4)]'
                              : 'bg-[#05050a] text-white/70 border-white/10 hover:border-white/30'
                          }`}
                        >
                          <IconComp size={15} />
                          <span className="text-[10px] font-mono">{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest block mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={agentForm.description}
                      onChange={e => setAgentForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief overview of what this agent does..."
                      className="w-full bg-[#05050a] border border-white/20 rounded-xl p-3 text-xs text-white focus:border-[#20e0e0] outline-none resize-none"
                    />
                  </div>

                  {/* System Instruction */}
                  <div>
                    <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest block mb-1">
                      System Instruction (Prompt Persona) *
                    </label>
                    <textarea
                      rows={4}
                      value={agentForm.systemInstruction}
                      onChange={e => setAgentForm(prev => ({ ...prev, systemInstruction: e.target.value }))}
                      placeholder="Detailed persona instructions, tone of voice, coding style, or specialized guidelines..."
                      className="w-full bg-[#05050a] border border-[#b020ff]/40 rounded-xl p-3 text-xs text-white focus:border-[#b020ff] outline-none font-mono resize-y"
                    />
                  </div>

                  {/* Capabilities Tags */}
                  <div>
                    <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest block mb-1">
                      Key Capabilities (Skills)
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={newCapability}
                        onChange={e => setNewCapability(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCapability();
                          }
                        }}
                        placeholder="Add skill (e.g. Code Refactoring)"
                        className="flex-1 bg-[#05050a] border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#80ff00] outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCapability}
                        className="px-3 py-1.5 bg-[#80ff00]/20 hover:bg-[#80ff00]/30 text-[#80ff00] border border-[#80ff00]/40 rounded-lg text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(agentForm.capabilities || []).map((cap, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-[#80ff00] bg-[#80ff00]/10 px-2 py-0.5 rounded border border-[#80ff00]/30"
                        >
                          <span>{cap}</span>
                          <button
                            onClick={() => handleRemoveCapability(i)}
                            className="hover:text-red-400 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Custom Slash Commands */}
                  <div>
                    <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest block mb-1">
                      Presets & Slash Commands (/command)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                      <input
                        type="text"
                        value={newCmdName}
                        onChange={e => setNewCmdName(e.target.value)}
                        placeholder="/command"
                        className="bg-[#05050a] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                      <input
                        type="text"
                        value={newCmdDesc}
                        onChange={e => setNewCmdDesc(e.target.value)}
                        placeholder="Description"
                        className="bg-[#05050a] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={newCmdPrompt}
                          onChange={e => setNewCmdPrompt(e.target.value)}
                          placeholder="Prefix prompt..."
                          className="flex-1 bg-[#05050a] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddCommand}
                          className="px-2.5 py-1.5 bg-[#b020ff]/20 text-[#b020ff] border border-[#b020ff]/40 rounded-lg text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {(agentForm.commands || []).map((cmd, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-[#05050a] p-2 rounded-lg border border-[#b020ff]/20 text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-[#b020ff]">{cmd.command}</span>
                            <span className="text-white/50 text-[10px] ml-2">{cmd.description}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveCommand(idx)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Card Preview (5 cols) */}
                <div className="lg:col-span-5 flex flex-col">
                  <h3 className="text-xs font-bold text-[#b020ff] uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Sparkles size={15} /> Real-Time Preview
                  </h3>

                  <div className="flex-1 bg-[#0c0c18] border border-[#20e0e0]/40 rounded-2xl p-5 flex flex-col justify-between relative shadow-[0_0_30px_rgba(32,224,224,0.1)]">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-[#20e0e0]/30 to-[#b020ff]/30 text-[#20e0e0] border border-[#20e0e0]/50 rounded-xl shadow-lg shadow-[#20e0e0]/20">
                            <SelectedIconComponent size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-base">
                              {agentForm.name || 'Untitled Agent'}
                            </h4>
                            <span className="text-[10px] font-mono font-bold uppercase text-[#ffc020] bg-[#05050a] px-2 py-0.5 rounded border border-[#ffc020]/30">
                              {agentForm.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-white/80 leading-relaxed min-h-[40px]">
                        {agentForm.description || 'Describe your agent to see preview here...'}
                      </p>

                      {/* Capabilities */}
                      {(agentForm.capabilities || []).length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block">
                            Capabilities:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {agentForm.capabilities.map((c, i) => (
                              <span
                                key={i}
                                className="text-[9px] font-mono text-[#80ff00] bg-[#80ff00]/10 px-1.5 py-0.5 rounded border border-[#80ff00]/20"
                              >
                                ✓ {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Commands */}
                      {(agentForm.commands || []).length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block">
                            Commands:
                          </span>
                          <div className="space-y-1">
                            {agentForm.commands.map((cmd, i) => (
                              <div
                                key={i}
                                className="bg-[#05050a] px-2 py-1 rounded text-[10px] font-mono text-[#b020ff] border border-[#b020ff]/20 flex justify-between"
                              >
                                <span>{cmd.command}</span>
                                <span className="text-white/40 truncate max-w-[140px]">{cmd.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Save & Activate Actions */}
                    <div className="pt-5 mt-4 border-t border-white/10 space-y-2">
                      <button
                        onClick={() => handleSave(true)}
                        className="w-full py-2.5 bg-gradient-to-r from-[#20e0e0] to-[#b020ff] hover:opacity-90 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(32,224,224,0.4)] transition-all cursor-pointer"
                      >
                        <Rocket size={15} />
                        <span>Save & Activate Agent</span>
                      </button>

                      <button
                        onClick={() => handleSave(false)}
                        className="w-full py-2 bg-[#05050a] hover:bg-[#111] text-[#20e0e0] border border-[#20e0e0]/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download size={14} />
                        <span>Save to Library Only</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
