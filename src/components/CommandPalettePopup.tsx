import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Terminal, Code, Cpu, 
  Brain, FileText, Scale, MessageSquare, GraduationCap, 
  Eye, Zap, Users, List, CheckSquare, Megaphone, 
  PenTool, TrendingUp, Share2, Video, Layout, 
  Wrench, ShieldCheck, Database, Globe, Lock, 
  Activity, Cloud, Server, BarChart, Target, HelpCircle
} from 'lucide-react';
import { CLAUDE_COMMANDS, type ClaudeCommand } from '../data/commands';

const ICON_COMPONENTS: Record<string, any> = {
  Brain, FileText, Scale, MessageSquare, GraduationCap,
  Eye, Zap, Sparkles, Users, List, CheckSquare,
  Megaphone, PenTool, TrendingUp, Share2, Video, Layout,
  Wrench, ShieldCheck, Database, Globe, Lock, Activity,
  Cloud, Server, BarChart, Target, Cpu, Code, HelpCircle, Terminal
};

interface CommandPalettePopupProps {
  isOpen: boolean;
  filterText: string;
  onSelect: (cmd: ClaudeCommand) => void;
  onClose: () => void;
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
}

export default function CommandPalettePopup({
  isOpen,
  filterText,
  onSelect,
  onClose,
  selectedIndex,
  setSelectedIndex
}: CommandPalettePopupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  const cleanFilter = filterText.startsWith('/') ? filterText.slice(1).toLowerCase().trim() : filterText.toLowerCase().trim();

  const filtered = CLAUDE_COMMANDS.filter(c => 
    c.command.toLowerCase().includes(cleanFilter) ||
    c.name.toLowerCase().includes(cleanFilter) ||
    c.description.toLowerCase().includes(cleanFilter) ||
    c.category.toLowerCase().includes(cleanFilter)
  );

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen || filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      className="absolute bottom-full left-0 w-full mb-2 bg-[#0d0d14] border border-[#ff8c20]/40 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] overflow-hidden z-40 max-h-72 flex flex-col"
    >
      {/* Header */}
      <div className="px-3.5 py-2 bg-[#141420] border-b border-[#252538] flex items-center justify-between text-[11px] text-[#a0a0b8]">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[#ff8c20] font-bold">⚡ CLAUDE COMMANDS</span>
          <span className="text-[#606078]">({filtered.length})</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#707088] font-mono">
          <span>↑↓ Navigate</span>
          <span>↵ / Tab Select</span>
          <span>Esc Cancel</span>
        </div>
      </div>

      {/* List */}
      <div ref={containerRef} className="overflow-y-auto p-1.5 space-y-1">
        {filtered.map((cmd, idx) => {
          const Icon = ICON_COMPONENTS[cmd.icon] || Terminal;
          const isSelected = idx === selectedIndex;

          return (
            <button
              key={cmd.command}
              ref={isSelected ? activeItemRef : null}
              onMouseEnter={() => setSelectedIndex(idx)}
              onClick={() => onSelect(cmd)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-[#ff8c20]/20 to-[#e028e0]/15 border border-[#ff8c20]/50 text-white'
                  : 'hover:bg-[#181826] text-[#b0b0c4] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-[#ff8c20] text-black font-bold' : 'bg-[#1a1a29] text-[#ff9a3c]'
                }`}>
                  <Icon size={15} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#ff9a3c]">
                      {cmd.command}
                    </span>
                    <span className="text-xs font-medium text-white truncate">
                      {cmd.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#808098] truncate">
                    {cmd.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#181826] text-[#8080a0] border border-[#26263a]">
                  {cmd.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
