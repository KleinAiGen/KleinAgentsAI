import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, Sparkles, Terminal, Code, Cpu, 
  Brain, FileText, Scale, MessageSquare, GraduationCap, 
  Eye, Zap, Users, List, CheckSquare, Megaphone, 
  PenTool, TrendingUp, Share2, Video, Layout, 
  Wrench, ShieldCheck, Database, Globe, Lock, 
  Activity, Cloud, Server, BarChart, Target, HelpCircle,
  Play, CornerDownLeft, Copy, Check
} from 'lucide-react';
import { CLAUDE_COMMANDS, COMMAND_CATEGORIES, type ClaudeCommand } from '../data/commands';

const ICON_COMPONENTS: Record<string, any> = {
  Brain, FileText, Scale, MessageSquare, GraduationCap,
  Eye, Zap, Sparkles, Users, List, CheckSquare, Search,
  Megaphone, PenTool, TrendingUp, Share2, Video, Layout,
  Wrench, ShieldCheck, Database, Globe, Lock, Activity,
  Cloud, Server, BarChart, Target, Cpu, Code, MessageCircle: MessageSquare,
  HelpCircle, Terminal
};

interface ClaudeCommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand: (cmd: ClaudeCommand, immediateExecute?: boolean) => void;
}

export default function ClaudeCommandsModal({ isOpen, onClose, onSelectCommand }: ClaudeCommandsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredCommands = CLAUDE_COMMANDS.filter(cmd => {
    const matchesSearch = 
      cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || cmd.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-5xl h-[88vh] bg-[#0c0c12] border border-[#ff8c20]/40 shadow-[0_0_50px_rgba(255,140,32,0.15)] rounded-2xl flex flex-col overflow-hidden text-white"
      >
        {/* Header matching poster style */}
        <div className="p-6 bg-gradient-to-r from-[#140f0c] via-[#0c0c12] to-[#120a1c] border-b border-[#ff8c20]/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff7a00] to-[#e028e0] p-0.5 shadow-lg shadow-[#ff7a00]/30">
              <div className="w-full h-full bg-[#0c0c12] rounded-[10px] flex items-center justify-center text-[#ff8c20]">
                <Sparkles size={24} className="animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-[#ff9a3c] via-[#ff6a00] to-[#e028e0] bg-clip-text text-transparent font-mono">
                  ALL CLAUDE COMMANDS
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#ff8c20]/20 text-[#ff9a3c] border border-[#ff8c20]/40 rounded-full font-mono">
                  43 POWER MODES
                </span>
              </div>
              <p className="text-xs text-[#a0a0b0] mt-0.5">
                Drop any command in chat terminal to trigger instant professional personas, deep audits & transformations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#a0a0b0] hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 bg-[#0a0a0e] border-b border-[#ff8c20]/20 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ff8c20]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search command (e.g. /godmode, /debug)..."
              className="w-full pl-10 pr-4 py-2 bg-[#12121c] border border-[#ff8c20]/30 rounded-xl text-xs text-white placeholder-[#6c6c80] focus:outline-none focus:border-[#ff8c20] focus:ring-1 focus:ring-[#ff8c20]"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {COMMAND_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#ff8c20] text-black shadow-md shadow-[#ff8c20]/30 font-bold'
                    : 'bg-[#151522] text-[#a0a0b0] hover:text-white hover:bg-[#1f1f33]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Command Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCommands.map((cmd) => {
            const Icon = ICON_COMPONENTS[cmd.icon] || Terminal;
            return (
              <div
                key={cmd.command}
                onClick={() => onSelectCommand(cmd, false)}
                className="group relative p-4 bg-[#11111a] hover:bg-[#161624] border border-[#252538] hover:border-[#ff8c20]/60 rounded-xl transition-all flex flex-col justify-between cursor-pointer hover:shadow-lg hover:shadow-[#ff8c20]/10 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#1f1f30] group-hover:bg-[#ff8c20]/20 text-[#ff9a3c] flex items-center justify-center transition-colors">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-bold text-[#ff9a3c] group-hover:text-[#ffb366] flex items-center gap-1.5">
                          {cmd.command}
                        </div>
                        <div className="text-[11px] text-[#707088] font-medium">
                          {cmd.name}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleCopy(cmd.command, e)}
                      className="p-1.5 text-[#606078] hover:text-white hover:bg-[#252538] rounded-md transition-colors"
                      title="Copy command"
                    >
                      {copiedCmd === cmd.command ? <Check size={13} className="text-[#00ff9d]" /> : <Copy size={13} />}
                    </button>
                  </div>

                  <p className="text-xs text-[#b0b0c4] leading-relaxed mb-3">
                    {cmd.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#202030] flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-[#1c1c2b] text-[#8888a0] font-mono text-[10px]">
                    {cmd.category}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCommand(cmd, false);
                    }}
                    className="flex items-center gap-1 text-[#ff8c20] hover:text-[#ffa84d] font-semibold text-xs transition-colors"
                  >
                    <CornerDownLeft size={12} />
                    <span>Arm Command</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#08080c] border-t border-[#ff8c20]/20 flex items-center justify-between text-xs text-[#707088]">
          <span>Tip: Type <code className="text-[#ff9a3c] font-mono font-bold">/</code> anywhere in the chat to open instant command autocompletion</span>
          <span className="font-mono">{filteredCommands.length} of {CLAUDE_COMMANDS.length} commands</span>
        </div>
      </motion.div>
    </div>
  );
}
