import React from 'react';
import { VisualizerMode, ModelPreset } from '../types.ts';
import { MODEL_PRESETS } from '../lib/vocabulary.ts';
import { 
  Sparkles, 
  Layers, 
  Play, 
  Eye, 
  Compass, 
  Bot, 
  Sun, 
  Moon, 
  RotateCcw,
  Zap,
  FileText,
  Download
} from 'lucide-react';

interface NavbarProps {
  currentMode: VisualizerMode;
  onSelectMode: (mode: VisualizerMode) => void;
  selectedPresetId: string;
  onSelectPreset: (preset: ModelPreset) => void;
  onReset: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  tokenCount: number;
  onOpenPdfModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  selectedPresetId,
  onSelectPreset,
  onReset,
  isDarkMode,
  onToggleDarkMode,
  tokenCount,
  onOpenPdfModal,
}) => {
  const modes = [
    { id: 'pipeline' as VisualizerMode, label: 'Visual Story', icon: Sparkles },
    { id: 'sandbox' as VisualizerMode, label: 'Auto-Play Lab', icon: Play },
    { id: 'attention' as VisualizerMode, label: 'Attention Spotlight', icon: Eye },
    { id: 'embeddings' as VisualizerMode, label: 'Word Map & Math', icon: Compass },
    { id: 'ai-introspection' as VisualizerMode, label: 'Gemini 3.7 AI', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                LLM Explorer
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Visualizer
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              See how AI turns words into thoughts & predictions
            </p>
          </div>
        </div>

        {/* Navigation Mode Pills */}
        <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto max-w-full">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = currentMode === m.id;
            return (
              <button
                key={m.id}
                id={`navbar-mode-${m.id}`}
                onClick={() => onSelectMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools (PDF Guide & Dark mode toggle) */}
        <div className="flex items-center gap-2">
          {/* Download PDF Button */}
          <button
            id="download-pdf-guide-btn"
            onClick={onOpenPdfModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition cursor-pointer active:scale-95"
            title="Download PDF Guide"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Get PDF Guide</span>
            <span className="sm:hidden">PDF</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

      </div>
    </header>
  );
};
