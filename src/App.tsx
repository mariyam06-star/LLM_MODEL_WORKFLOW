import React, { useState, useEffect } from 'react';
import { VisualizerMode, ModelPreset, SamplingConfig } from './types.ts';
import { MODEL_PRESETS } from './lib/vocabulary.ts';
import { tokenizeText, runTransformerForwardPass } from './lib/transformerEngine.ts';
import { Navbar } from './components/Navbar.tsx';
import { VisualJourney } from './components/VisualJourney.tsx';
import { GenerationSandbox } from './components/GenerationSandbox.tsx';
import { AttentionMatrixView } from './components/AttentionMatrixView.tsx';
import { EmbeddingSpaceView } from './components/EmbeddingSpaceView.tsx';
import { GeminiInspector } from './components/GeminiInspector.tsx';
import { PdfExportModal } from './components/PdfExportModal.tsx';

export default function App() {
  const [currentMode, setCurrentMode] = useState<VisualizerMode>('pipeline');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('factual-qa');
  const [promptText, setPromptText] = useState<string>('The capital of France is');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  const [samplingConfig, setSamplingConfig] = useState<SamplingConfig>({
    temperature: 0.7,
    topK: 8,
    topP: 0.9,
    repetitionPenalty: 0.2,
  });

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Compute tokenization and forward pass
  const tokens = tokenizeText(promptText || 'The capital of France is');
  const layerState = runTransformerForwardPass(tokens);

  const handleSelectPreset = (preset: ModelPreset) => {
    setSelectedPresetId(preset.id);
    setPromptText(preset.prompt);
  };

  const handleReset = () => {
    const found = MODEL_PRESETS.find(p => p.id === selectedPresetId) || MODEL_PRESETS[0];
    setPromptText(found.prompt);
  };

  const handleUpdateSamplingConfig = (newConfig: Partial<SamplingConfig>) => {
    setSamplingConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        tokenCount={tokens.length}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
      />

      {/* Main Visualizer Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {currentMode === 'pipeline' && (
          <VisualJourney
            promptText={promptText}
            onChangePrompt={setPromptText}
            tokens={tokens}
            layerState={layerState}
            samplingConfig={samplingConfig}
            onUpdateSamplingConfig={handleUpdateSamplingConfig}
            onReset={handleReset}
          />
        )}

        {currentMode === 'sandbox' && (
          <GenerationSandbox
            promptText={promptText}
            onChangePrompt={setPromptText}
            tokens={tokens}
            layerState={layerState}
            samplingConfig={samplingConfig}
            onUpdateSamplingConfig={handleUpdateSamplingConfig}
            onResetToPrompt={handleReset}
          />
        )}

        {currentMode === 'attention' && (
          <AttentionMatrixView
            tokens={tokens}
            layerState={layerState}
          />
        )}

        {currentMode === 'embeddings' && (
          <EmbeddingSpaceView
            tokens={tokens}
          />
        )}

        {currentMode === 'ai-introspection' && (
          <GeminiInspector
            promptText={promptText}
            tokens={tokens}
          />
        )}
      </main>

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        currentPrompt={promptText}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Interactive LLM Simulator
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>Tokens ➔ Embeddings ➔ Attention ➔ Probabilities</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
