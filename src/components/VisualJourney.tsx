import React, { useState } from 'react';
import { TokenItem, TransformerLayerState, SamplingConfig, CandidateToken } from '../types.ts';
import { TokenBadge } from './TokenBadge.tsx';
import { 
  computeNextTokenLogits, 
  sampleNextToken, 
  getSemanticEmbedding,
  cosineSimilarity 
} from '../lib/transformerEngine.ts';
import { VOCABULARY_LIST } from '../lib/vocabulary.ts';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  Layers, 
  Compass, 
  Eye, 
  Cpu, 
  Trophy,
  Flame,
  Snowflake,
  Info,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Zap,
  Split,
  MessageSquare
} from 'lucide-react';

interface VisualJourneyProps {
  promptText: string;
  onChangePrompt: (newPrompt: string) => void;
  tokens: TokenItem[];
  layerState: TransformerLayerState;
  samplingConfig: SamplingConfig;
  onUpdateSamplingConfig: (config: Partial<SamplingConfig>) => void;
  onReset: () => void;
}

export const VisualJourney: React.FC<VisualJourneyProps> = ({
  promptText,
  onChangePrompt,
  tokens,
  layerState,
  samplingConfig,
  onUpdateSamplingConfig,
  onReset,
}) => {
  // Current active step (1 to 5)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(Math.max(0, tokens.length - 1));
  const [selectedHeadIdx, setSelectedHeadIdx] = useState<number>(0);
  const [lastGeneratedWord, setLastGeneratedWord] = useState<string | null>(null);

  // Safe token index
  const safeIdx = Math.min(selectedTokenIdx, Math.max(0, tokens.length - 1));
  const currentToken = tokens[safeIdx] || tokens[0];

  // Final hidden state & next token predictions
  const finalHiddenState = layerState.postFfnNorm[layerState.postFfnNorm.length - 1] || new Array(16).fill(0);
  const candidates: CandidateToken[] = computeNextTokenLogits(tokens, finalHiddenState, samplingConfig);
  const nextTopPick = sampleNextToken(candidates, samplingConfig);

  // Current attention head
  const currentHead = layerState.attentionHeads[selectedHeadIdx] || layerState.attentionHeads[0];

  // Quick preset prompts
  const funPresets = [
    { label: '🏰 Castle Story', prompt: 'Once upon a time , there lived a brave knight in a' },
    { label: '🇫🇷 France Capital', prompt: 'The capital of France is' },
    { label: '👑 Word Analogy', prompt: 'king man woman queen' },
    { label: '🤖 AI Model', prompt: 'The transformer attention model predicts next' },
    { label: '🐍 Python Code', prompt: 'def fibonacci(n): if n <=' },
  ];

  // Trigger next word generation
  const handleGenerateNextWord = (overrideWord?: string) => {
    const wordToAppend = overrideWord || nextTopPick.token;
    const updated = promptText.trim() + ' ' + wordToAppend;
    onChangePrompt(updated);
    setLastGeneratedWord(wordToAppend);
    setSelectedTokenIdx(tokens.length); // point to new token
    setActiveStep(5); // highlight final prediction

    // Pop celebratory confetti for fun interactive feel
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
      });
    } catch {
      // ignore in tests
    }
  };

  const stepsList = [
    {
      num: 1,
      title: '1. Tokenizer',
      subtitle: 'Chop Words into Puzzle Pieces',
      icon: Split,
      color: 'from-amber-500 to-orange-500',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    },
    {
      num: 2,
      title: '2. Word Radar',
      subtitle: 'GPS Coordinates for Meaning',
      icon: Compass,
      color: 'from-emerald-500 to-teal-500',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    },
    {
      num: 3,
      title: '3. Attention Beams',
      subtitle: 'Words Talking to Each Other',
      icon: Eye,
      color: 'from-sky-500 to-indigo-500',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300',
    },
    {
      num: 4,
      title: '4. Neural Brain',
      subtitle: 'Remembering Facts & Context',
      icon: Cpu,
      color: 'from-purple-500 to-pink-500',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
    },
    {
      num: 5,
      title: '5. Next-Word Prediction',
      subtitle: 'Roll the Probability Dice',
      icon: Trophy,
      color: 'from-indigo-600 to-violet-600',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Interactive Prompt Studio */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        {/* Header & Preset Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span>Interactive Sentence Studio</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Type anything or tap a fun scenario below to see how the AI processes it inside.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center flex-wrap gap-1.5">
            {funPresets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onChangePrompt(p.prompt);
                  setSelectedTokenIdx(0);
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Box with Generate Controls */}
        <div className="relative">
          <textarea
            id="interactive-prompt-input"
            rows={2}
            value={promptText}
            onChange={(e) => onChangePrompt(e.target.value)}
            placeholder="Type any sentence here..."
            className="w-full text-sm sm:text-base font-mono p-4 pr-36 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none leading-relaxed"
          />

          {/* Quick Action Button overlay */}
          <div className="absolute right-3 top-3 flex flex-col gap-1.5">
            <button
              id="generate-next-token-hero-btn"
              onClick={() => handleGenerateNextWord()}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Next Word</span>
            </button>

            <button
              onClick={onReset}
              title="Reset prompt"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 self-end transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Token Strip Preview */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center flex-wrap gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Split className="w-3.5 h-3.5" />
            Tokens ({tokens.length}):
          </span>
          {tokens.map((tok, idx) => (
            <TokenBadge
              key={`${tok.position}-${tok.id}`}
              token={tok}
              isActive={idx === safeIdx}
              onClick={() => setSelectedTokenIdx(idx)}
              size="sm"
            />
          ))}

          {/* Glowing Next Word Ghost */}
          {nextTopPick && (
            <button
              onClick={() => handleGenerateNextWord(nextTopPick.token)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-dashed border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono text-xs hover:bg-indigo-100 transition cursor-pointer"
              title="Click to insert predicted token"
            >
              <span>+ "{nextTopPick.token}"</span>
              <span className="text-[10px] bg-indigo-200/60 dark:bg-indigo-900 px-1 rounded font-bold">
                {(nextTopPick.probability * 100).toFixed(0)}%
              </span>
            </button>
          )}
        </div>

        {/* Creativity / Temperature Slider Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="font-semibold flex items-center gap-1">
              {samplingConfig.temperature < 0.4 ? (
                <Snowflake className="w-4 h-4 text-sky-500" />
              ) : (
                <Flame className="w-4 h-4 text-amber-500" />
              )}
              AI Creativity Dial (Temperature):
            </span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              {samplingConfig.temperature.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              ({samplingConfig.temperature < 0.4 ? 'Strict & Logical 🧊' : samplingConfig.temperature < 0.9 ? 'Balanced ⚖️' : 'Wild & Creative 🔥'})
            </span>
          </div>

          <div className="w-full sm:w-64 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Cold (0.1)</span>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={samplingConfig.temperature}
              onChange={(e) => onUpdateSamplingConfig({ temperature: parseFloat(e.target.value) })}
              className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-[10px] text-slate-400">Hot (1.5)</span>
          </div>
        </div>
      </div>

      {/* 5-Step Visual Stepper Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {stepsList.map((step) => {
          const Icon = step.icon;
          const isCurrent = activeStep === step.num;

          return (
            <button
              key={step.num}
              onClick={() => setActiveStep(step.num)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden group cursor-pointer ${
                isCurrent
                  ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Glowing top line */}
              {isCurrent && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
              )}

              <div className="flex items-center justify-between mb-1.5">
                <div className={`p-1.5 rounded-xl bg-gradient-to-br ${step.color} text-white shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                  isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  Step {step.num}
                </span>
              </div>

              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                {step.title.split('. ')[1]}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {step.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Active Stage Stage Viewer Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        
        {/* ===================== STEP 1: TOKENIZATION ===================== */}
        {activeStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                  Stage 1 of 5 • Input Ingestion
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>The Tokenizer (Chopping Text into Lego Bricks)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  AI models cannot read English letters directly. They use a dictionary called a <strong>Tokenizer (BPE)</strong> to cut text into numbered chunks called <strong>Tokens</strong>.
                </p>
              </div>

              <button
                onClick={() => setActiveStep(2)}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
              >
                <span>Next: Word Radar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive Token Inspection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left: Token Stream */}
              <div className="md:col-span-2 p-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                  Tap any token to inspect its computer representation:
                </span>

                <div className="flex flex-wrap gap-2.5">
                  {tokens.map((tok, idx) => (
                    <TokenBadge
                      key={idx}
                      token={tok}
                      isActive={idx === safeIdx}
                      onClick={() => setSelectedTokenIdx(idx)}
                      size="lg"
                    />
                  ))}
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    Fun Fact: 1 token is roughly <strong>4 characters</strong> or ~0.75 words in English.
                  </span>
                </div>
              </div>

              {/* Right: Selected Token Anatomy */}
              {currentToken && (
                <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 space-y-3">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block uppercase tracking-wider">
                    Selected Token Inspector
                  </span>

                  <div className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 text-center">
                    "{currentToken.text}"
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-indigo-100 dark:border-indigo-900/60">
                      <span className="text-slate-500 font-sans">Token ID Number:</span>
                      <strong className="text-slate-900 dark:text-white">#{currentToken.id}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-indigo-100 dark:border-indigo-900/60">
                      <span className="text-slate-500 font-sans">Sequence Position:</span>
                      <strong className="text-slate-900 dark:text-white">Pos {currentToken.position}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-sans">UTF-8 Raw Bytes:</span>
                      <span className="text-indigo-600 dark:text-indigo-300">
                        [{currentToken.bytes.join(', ')}]
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ===================== STEP 2: VECTOR RADAR (EMBEDDINGS) ===================== */}
        {activeStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  Stage 2 of 5 • Semantic Space
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Word Radar (Meaning as Coordinates)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  The model converts each token into a list of numbers (a <strong>Vector Embedding</strong>). Words with similar meanings land near each other in this semantic map!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
                >
                  <span>Next: Attention Beams</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual 2D Radar Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 relative h-[320px] bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 overflow-hidden select-none">
                {/* Radar Grid Circles */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-64 h-64 rounded-full border border-slate-400" />
                  <div className="w-40 h-40 rounded-full border border-slate-400" />
                  <div className="w-16 h-16 rounded-full border border-slate-400" />
                  <div className="w-full h-px bg-slate-400 absolute" />
                  <div className="h-full w-px bg-slate-400 absolute" />
                </div>

                {/* Compass Labels */}
                <span className="absolute top-2 left-4 text-[10px] font-mono text-emerald-600/80 font-bold uppercase">
                  ✦ Living & Royalty
                </span>
                <span className="absolute top-2 right-4 text-[10px] font-mono text-sky-600/80 font-bold uppercase">
                  ✦ Places & Capitals
                </span>
                <span className="absolute bottom-2 right-4 text-[10px] font-mono text-indigo-600/80 font-bold uppercase">
                  ✦ AI & Computing
                </span>
                <span className="absolute bottom-2 left-4 text-[10px] font-mono text-amber-600/80 font-bold uppercase">
                  ✦ Grammar & Verbs
                </span>

                {/* Floating Words */}
                <svg className="w-full h-full">
                  {VOCABULARY_LIST.slice(3, 40).map((v) => {
                    const x = (v.semanticVector[4] * 0.4 + v.semanticVector[5] * 0.4 - v.semanticVector[8] * 0.3) * 140 + 170;
                    const y = (v.semanticVector[0] * 0.4 - v.semanticVector[14] * 0.3) * -110 + 150;
                    const isInPrompt = tokens.some(t => t.text.toLowerCase() === v.token.toLowerCase());

                    return (
                      <g
                        key={v.id}
                        className="cursor-pointer group transition-all"
                        onClick={() => {
                          const foundIdx = tokens.findIndex(t => t.text.toLowerCase() === v.token.toLowerCase());
                          if (foundIdx >= 0) setSelectedTokenIdx(foundIdx);
                        }}
                      >
                        <circle
                          cx={Math.max(20, Math.min(320, x))}
                          cy={Math.max(20, Math.min(290, y))}
                          r={isInPrompt ? 6 : 3.5}
                          className={`${
                            isInPrompt
                              ? 'fill-indigo-600 stroke-2 stroke-amber-400'
                              : 'fill-slate-400 dark:fill-slate-600'
                          } transition-all group-hover:r-5`}
                        />
                        <text
                          x={Math.max(20, Math.min(320, x)) + 7}
                          y={Math.max(20, Math.min(290, y)) + 3}
                          className={`text-[11px] font-mono font-bold ${
                            isInPrompt
                              ? 'fill-indigo-600 dark:fill-indigo-400 font-extrabold text-xs'
                              : 'fill-slate-600 dark:fill-slate-400'
                          }`}
                        >
                          {v.token}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Vector Details & Analogy Magic */}
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                  <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block">
                    ✨ Word Vector Magic Formula:
                  </span>
                  <p className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed font-mono">
                    Vector("King") - Vector("Man") + Vector("Woman") ≈ <strong>Vector("Queen")</strong>
                  </p>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
                    Math can solve word analogies because meaning is mapped onto geometric directions!
                  </p>
                </div>

                {currentToken && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-500 block">
                      Embedding Slice for "{currentToken.text}":
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
                      {getSemanticEmbedding(currentToken.text, 8).map((val, idx) => (
                        <div
                          key={idx}
                          className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        >
                          {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== STEP 3: ATTENTION BEAMS ===================== */}
        {activeStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-1">
                  Stage 3 of 5 • Relational Thinking
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Self-Attention Beams (Words Shining Lights on Each Other)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  When reading a sentence, words need context. For example, in <em>"The capital of France is"</em>, the word <strong>"is"</strong> looks back at <strong>"capital"</strong> and <strong>"France"</strong> to know we need a city name!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveStep(4)}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
                >
                  <span>Next: Neural Brain</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Head Selector Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-semibold">Specialized Brain Heads:</span>
              {layerState.attentionHeads.map((head, idx) => (
                <button
                  key={head.id}
                  onClick={() => setSelectedHeadIdx(idx)}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    selectedHeadIdx === idx
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {head.name}
                </button>
              ))}
            </div>

            {/* Interactive Attention Laser Diagram */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Click any word to see where its attention spotlight shines:</span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                  Focusing on: "{tokens[safeIdx]?.text}"
                </span>
              </div>

              {/* Tokens with glowing attention percentages */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {tokens.map((tok, j) => {
                  const isCurrentTarget = j === safeIdx;
                  const weight = currentHead.matrix[safeIdx]?.[j] || 0;
                  const isFuture = j > safeIdx;

                  return (
                    <div
                      key={j}
                      onClick={() => setSelectedTokenIdx(j)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isCurrentTarget
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 ring-2 ring-indigo-500/20'
                          : isFuture
                          ? 'opacity-30 border-dashed border-slate-300 dark:border-slate-800'
                          : weight > 0.35
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 font-mono mb-1">
                        Pos #{tok.position}
                      </div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                        "{tok.text}"
                      </div>

                      {/* Weight progress bar */}
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFuture ? 'w-0' : weight > 0.35 ? 'bg-sky-500' : 'bg-indigo-400'
                          }`}
                          style={{ width: isFuture ? '0%' : `${Math.max(5, weight * 100)}%` }}
                        />
                      </div>

                      <span className="text-[10px] font-mono font-bold mt-1.5 block text-slate-600 dark:text-slate-400">
                        {isFuture ? 'Masked' : `${(weight * 100).toFixed(0)}% Attention`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== STEP 4: NEURAL BRAIN (LAYERS & FFN) ===================== */}
        {activeStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">
                  Stage 4 of 5 • Deep Processing
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>The Neural Brain (Deep Context & Fact Retrieval)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  After words share attention, they pass through multiple <strong>Neural Network Layers (MLP / FFN)</strong>. This is where factual memory (like "Paris is in France") is retrieved and mixed with the sentence context!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveStep(3)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveStep(5)}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
                >
                  <span>Next: Word Prediction</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Layer Stack */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-2">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase block">
                  Layer 1: Surface Words
                </span>
                <p className="text-xs text-purple-800 dark:text-purple-400">
                  Recognizes individual words, punctuation, and basic grammar patterns.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-2">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase block">
                  Layer 2: Relational Context
                </span>
                <p className="text-xs text-indigo-800 dark:text-indigo-400">
                  Links entities together (e.g. subject + verb + geographic location).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/50 space-y-2">
                <span className="text-xs font-bold text-pink-900 dark:text-pink-300 uppercase block">
                  Layer 3: Fact Retrieval & Intent
                </span>
                <p className="text-xs text-pink-800 dark:text-pink-400">
                  Accesses pre-trained knowledge base to formulate the final next-word idea.
                </p>
              </div>
            </div>

            {/* Neural Expansion Animation Card */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Feed-Forward Expansion (4x Dimension)
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  The model expands each token's vector from 16 to 64 neurons to evaluate possible meanings, then compresses it back down.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  16 neurons
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-500" />
                <span className="px-2.5 py-1 bg-purple-600 text-white font-bold rounded-lg shadow-sm">
                  64 neurons (Expanded)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-500" />
                <span className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  16 neurons
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== STEP 5: NEXT-WORD PODIUM (SOFTMAX) ===================== */}
        {activeStep === 5 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                  Stage 5 of 5 • Output Generation
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>The Next-Word Prediction Podium</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  The model converts its thoughts into a probability for every word in its vocabulary. Tap any candidate below to add it to your sentence!
                </p>
              </div>

              <button
                onClick={() => handleGenerateNextWord()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 transition"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Pick Top Word ("{nextTopPick.token}")</span>
              </button>
            </div>

            {/* Top 5 Candidates Race Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {candidates.slice(0, 6).map((cand, idx) => {
                const percent = (cand.probability * 100).toFixed(1);
                const isWinner = cand.token === nextTopPick.token;

                return (
                  <div
                    key={cand.tokenId}
                    onClick={() => handleGenerateNextWord(cand.token)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.99] ${
                      isWinner
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          #{idx + 1}
                        </span>

                        <span className="font-mono font-bold text-base text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          "{cand.token}"
                        </span>

                        {isWinner && (
                          <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            Top Pick
                          </span>
                        )}
                      </div>

                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {percent}%
                      </span>
                    </div>

                    {/* Visual Probability Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isWinner ? 'bg-gradient-to-r from-indigo-600 to-violet-600' : 'bg-sky-500'
                        }`}
                        style={{ width: `${Math.max(3, cand.probability * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>Click to append this word</span>
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                        + Insert "{cand.token}" →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
