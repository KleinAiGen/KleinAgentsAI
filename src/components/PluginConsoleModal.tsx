import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, Terminal, Play, RotateCcw, Copy, Check, 
  Sparkles, Activity, Music, Scale, Code, 
  Layers, CheckCircle, Shield, ArrowRight
} from 'lucide-react';
import { DEFAULT_PLUGINS, runSandboxCode, estimateTokens, enhancePrompt, type TerminalPlugin } from '../data/plugins';

interface PluginConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  plugins: TerminalPlugin[];
  onTogglePlugin: (pluginId: string) => void;
  onInsertOptimizedPrompt?: (prompt: string) => void;
}

export default function PluginConsoleModal({
  isOpen,
  onClose,
  plugins,
  onTogglePlugin,
  onInsertOptimizedPrompt
}: PluginConsoleModalProps) {
  const [activeTab, setActiveTab] = useState<'plugins' | 'sandbox' | 'promptOptimizer' | 'tokenEstimator'>('plugins');

  // Sandbox state
  const [sandboxCode, setSandboxCode] = useState<string>(
`// Interactive Terminal Sandbox Runner
const data = [
  { command: "/godmode", uses: 450, category: "Reasoning" },
  { command: "/debug", uses: 820, category: "Engineering" },
  { command: "/10x", uses: 610, category: "Writing" }
];

console.log("⚡ Claude Command Telemetry:");
const topCommand = data.sort((a, b) => b.uses - a.uses)[0];
console.log("Top command:", topCommand.command, "with", topCommand.uses, "invocations!");

// Test calculations
const tokensEstimated = data.reduce((acc, curr) => acc + curr.uses * 45, 0);
console.log("Total Tokens Processed:", tokensEstimated);`
  );
  const [sandboxOutput, setSandboxOutput] = useState<string[]>([]);
  const [sandboxError, setSandboxError] = useState<string | undefined>();
  const [sandboxExecutionTime, setSandboxExecutionTime] = useState<number>(0);
  const [copiedConsole, setCopiedConsole] = useState(false);

  // Prompt Optimizer state
  const [rawPromptInput, setRawPromptInput] = useState('write a python script to parse logs and send alerts');
  const [optimizedPromptOutput, setOptimizedPromptOutput] = useState('');

  // Token Estimator state
  const [textToEstimate, setTextToEstimate] = useState('Paste any text, prompt, or code here to inspect token metrics and reading time.');

  if (!isOpen) return null;

  const handleRunSandbox = () => {
    const result = runSandboxCode(sandboxCode);
    setSandboxOutput(result.output);
    setSandboxError(result.error);
    setSandboxExecutionTime(result.executionTimeMs);
  };

  const handleOptimizePrompt = () => {
    const enhanced = enhancePrompt(rawPromptInput);
    setOptimizedPromptOutput(enhanced);
  };

  const tokenMetrics = estimateTokens(textToEstimate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="w-full max-w-4xl h-[82vh] bg-[#0c0c14] border border-[#20e0e0]/40 shadow-[0_0_50px_rgba(32,224,224,0.15)] rounded-2xl flex flex-col overflow-hidden text-white font-sans"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0a1218] via-[#0c0c14] to-[#14081c] border-b border-[#20e0e0]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#20e0e0]/10 border border-[#20e0e0]/40 text-[#20e0e0] flex items-center justify-center">
              <Terminal size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-white">
                  Terminal Plugins & Helper Scripts
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#20e0e0]/20 text-[#20e0e0] border border-[#20e0e0]/40 rounded-md">
                  v2.5 ONLINE
                </span>
              </div>
              <p className="text-xs text-[#8c8ca8]">
                Configure terminal plug-ins, code execution sandboxes, and AI prompt helper scripts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8c8ca8] hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 bg-[#0e0e18] border-b border-[#202038] flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'plugins', label: 'Active Plugins', icon: Layers },
            { id: 'sandbox', label: 'JS/TS Code Sandbox', icon: Code },
            { id: 'promptOptimizer', label: 'Prompt Optimizer', icon: Sparkles },
            { id: 'tokenEstimator', label: 'Token & Metric Inspector', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 flex items-center gap-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive 
                    ? 'border-[#20e0e0] text-[#20e0e0] bg-[#20e0e0]/5 font-bold' 
                    : 'border-transparent text-[#8080a0] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* PLUGINS TAB */}
          {activeTab === 'plugins' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#a0a0c0]">
                  Installed Terminal Extensions ({plugins.length})
                </span>
                <span className="text-[11px] text-[#20e0e0] font-mono">
                  {plugins.filter(p => p.enabled).length} Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {plugins.map((plugin) => (
                  <div
                    key={plugin.id}
                    className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      plugin.enabled
                        ? 'bg-[#121624] border-[#20e0e0]/40 shadow-sm'
                        : 'bg-[#101018] border-[#222234] opacity-75'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">{plugin.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1c1c2e] text-[#8080a0] font-mono">
                          {plugin.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#9090ac] leading-relaxed">
                        {plugin.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onTogglePlugin(plugin.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                        plugin.enabled ? 'bg-[#20e0e0]' : 'bg-[#252538]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${
                          plugin.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SANDBOX RUNNER TAB */}
          {activeTab === 'sandbox' && (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-[#a0a0c0]">
                <span>Type or paste JavaScript/TypeScript code to execute safely:</span>
                <div className="flex items-center gap-2">
                  {sandboxExecutionTime > 0 && (
                    <span className="text-[11px] font-mono text-[#00ff9d]">
                      Executed in {sandboxExecutionTime}ms
                    </span>
                  )}
                  <button
                    onClick={handleRunSandbox}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ff9d] text-black font-bold text-xs rounded-lg hover:bg-[#00ff9d]/80 transition-colors shadow-md shadow-[#00ff9d]/20"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Run Script</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-[300px]">
                {/* Code input */}
                <div className="flex flex-col rounded-xl border border-[#252538] bg-[#090910] overflow-hidden">
                  <div className="px-3 py-1.5 bg-[#12121e] border-b border-[#252538] text-[10px] font-mono text-[#8080a0]">
                    EDITOR (JS / TS)
                  </div>
                  <textarea
                    value={sandboxCode}
                    onChange={(e) => setSandboxCode(e.target.value)}
                    className="flex-1 w-full p-3 bg-transparent text-xs font-mono text-[#a0e0ff] focus:outline-none resize-none"
                    spellCheck={false}
                  />
                </div>

                {/* Console output */}
                <div className="flex flex-col rounded-xl border border-[#252538] bg-[#06060c] overflow-hidden">
                  <div className="px-3 py-1.5 bg-[#12121e] border-b border-[#252538] flex items-center justify-between text-[10px] font-mono text-[#8080a0]">
                    <span>CONSOLE OUTPUT</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sandboxOutput.join('\n'));
                        setCopiedConsole(true);
                        setTimeout(() => setCopiedConsole(false), 2000);
                      }}
                      className="hover:text-white flex items-center gap-1"
                    >
                      {copiedConsole ? <Check size={11} className="text-[#00ff9d]" /> : <Copy size={11} />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1">
                    {sandboxError && (
                      <div className="p-2 rounded bg-red-900/30 border border-red-500/50 text-red-300">
                        Error: {sandboxError}
                      </div>
                    )}
                    {sandboxOutput.map((line, i) => (
                      <div key={i} className="text-[#b0f0a0] leading-relaxed whitespace-pre-wrap">
                        {line}
                      </div>
                    ))}
                    {sandboxOutput.length === 0 && !sandboxError && (
                      <div className="text-[#505068] italic">Click "Run Script" to execute code...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROMPT OPTIMIZER TAB */}
          {activeTab === 'promptOptimizer' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#151525] border border-[#ff8c20]/30 rounded-xl text-xs text-[#d0d0e0]">
                <strong className="text-[#ff9a3c]">⚡ Auto-Enhancer:</strong> Transforms simple one-line requests into comprehensive, high-context AI prompts with clear constraints, formatting rules, and edge-case instructions.
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-[#9090b0]">YOUR RAW PROMPT:</label>
                <textarea
                  rows={3}
                  value={rawPromptInput}
                  onChange={(e) => setRawPromptInput(e.target.value)}
                  placeholder="Enter simple prompt to optimize..."
                  className="w-full p-3 bg-[#0a0a12] border border-[#252538] rounded-xl text-xs text-white focus:border-[#ff8c20] focus:outline-none"
                />
                <button
                  onClick={handleOptimizePrompt}
                  className="px-4 py-2 bg-[#ff8c20] text-black font-bold text-xs rounded-xl hover:bg-[#ffa03c] transition-all flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>Generate Enhanced Prompt</span>
                </button>
              </div>

              {optimizedPromptOutput && (
                <div className="p-4 bg-[#0a0a14] border border-[#ff8c20]/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#ff9a3c] font-mono font-bold">
                    <span>OPTIMIZED PROMPT</span>
                    {onInsertOptimizedPrompt && (
                      <button
                        onClick={() => {
                          onInsertOptimizedPrompt(optimizedPromptOutput);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-[#ff8c20]/20 hover:bg-[#ff8c20]/30 text-[#ff9a3c] border border-[#ff8c20]/40 rounded-lg text-xs transition-colors"
                      >
                        <ArrowRight size={12} />
                        <span>Send to Chat Terminal</span>
                      </button>
                    )}
                  </div>
                  <pre className="text-xs text-[#d0d0e8] whitespace-pre-wrap font-mono bg-[#05050a] p-3 rounded-lg border border-[#202030]">
                    {optimizedPromptOutput}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TOKEN & METRIC INSPECTOR TAB */}
          {activeTab === 'tokenEstimator' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-[#10101c] border border-[#20e0e0]/30 rounded-xl text-center">
                  <div className="text-2xl font-black font-mono text-[#20e0e0]">{tokenMetrics.tokens}</div>
                  <div className="text-[11px] text-[#8080a0] uppercase tracking-wider font-mono mt-1">Estimated Tokens</div>
                </div>
                <div className="p-4 bg-[#10101c] border border-[#ff8c20]/30 rounded-xl text-center">
                  <div className="text-2xl font-black font-mono text-[#ff9a3c]">{tokenMetrics.words}</div>
                  <div className="text-[11px] text-[#8080a0] uppercase tracking-wider font-mono mt-1">Word Count</div>
                </div>
                <div className="p-4 bg-[#10101c] border border-[#00ff9d]/30 rounded-xl text-center">
                  <div className="text-2xl font-black font-mono text-[#00ff9d]">~{tokenMetrics.readingTimeSec}s</div>
                  <div className="text-[11px] text-[#8080a0] uppercase tracking-wider font-mono mt-1">Reading Time</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-[#9090b0]">TEXT TO ANALYZE:</label>
                <textarea
                  rows={6}
                  value={textToEstimate}
                  onChange={(e) => setTextToEstimate(e.target.value)}
                  className="w-full p-3 bg-[#0a0a12] border border-[#252538] rounded-xl text-xs text-white focus:border-[#20e0e0] focus:outline-none font-mono"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
