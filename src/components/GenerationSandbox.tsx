import React, { useState, useEffect } from 'react';
import { TokenItem, TransformerLayerState, SamplingConfig } from '../types.ts';
import { TokenBadge } from './TokenBadge.tsx';
import { 
  computeNextTokenLogits, 
  sampleNextToken 
} from '../lib/transformerEngine.ts';
import { 
  Play, 
  Pause, 
  StepForward, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  Snowflake,
  Zap,
  Split
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GenerationSandboxProps {
  promptText: string;
  onChangePrompt: (newPrompt: string) => void;
  tokens: TokenItem[];
  layerState: TransformerLayerState;
  samplingConfig: SamplingConfig;
  onUpdateSamplingConfig: (config: Partial<SamplingConfig>) => void;
  onResetToPrompt: () => void;
}

export const GenerationSandbox: React.FC<GenerationSandboxProps> = ({
  promptText,
  onChangePrompt,
  tokens,
  layerState,
  samplingConfig,
  onUpdateSamplingConfig,
  onResetToPrompt,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(600);
  const [tokensGeneratedCount, setTokensGeneratedCount] = useState<number>(0);

  const finalHiddenState = layerState.postFfnNorm[layerState.postFfnNorm.length - 1] || new Array(16).fill(0);
  const candidateTokens = computeNextTokenLogits(tokens, finalHiddenState, samplingConfig);
  const nextCandidate = sampleNextToken(candidateTokens, samplingConfig);

  const maxContext = 40;

  const handleStepForward = (overrideWord?: string) => {
    if (tokens.length >= maxContext) {
      setIsPlaying(false);
      return;
    }

    const winningWord = overrideWord || sampleNextToken(candidateTokens, samplingConfig).token;
    const updatedText = promptText.trim() + ' ' + winningWord;
    onChangePrompt(updatedText);
    setTokensGeneratedCount(prev => prev + 1);

    if (winningWord === '.') {
      setIsPlaying(false);
    }
  };

  // Auto-generation loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (tokens.length >= maxContext) {
          setIsPlaying(false);
        } else {
          handleStepForward();
        }
      }, speedMs);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, speedMs, tokens, promptText, candidateTokens, samplingConfig]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Generation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
              Continuous Auto-Play Mode
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span>Autoregressive Text Generation Lab</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Watch the model continuously predict words, append them to the sentence, and loop forward automatically!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStepForward()}
              disabled={isPlaying || tokens.length >= maxContext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <StepForward className="w-4 h-4" />
              <span>+1 Word</span>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={tokens.length >= maxContext}
              className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-md transition active:scale-95 cursor-pointer ${
                isPlaying
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Auto-Generate</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setTokensGeneratedCount(0);
                onResetToPrompt();
              }}
              title="Reset prompt"
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Speed & Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Context Length
            </span>
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-1 block">
              {tokens.length} / {maxContext} tokens
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Speed
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {[900, 600, 250].map((s, idx) => (
                <button
                  key={s}
                  onClick={() => setSpeedMs(s)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                    speedMs === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {idx === 0 ? '1x' : idx === 1 ? '2x' : '3x'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Tokens Created
            </span>
            <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
              +{tokensGeneratedCount} words
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Creativity (Temp)
            </span>
            <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400 mt-1 block">
              T = {samplingConfig.temperature.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Stream & Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Context Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Split className="w-4 h-4 text-indigo-500" />
                <span>Live Growing Sentence Stream</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {tokens.length} tokens
              </span>
            </div>

            {/* Token badges list */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 min-h-[140px] flex flex-wrap items-center gap-2 content-start">
              {tokens.map((tok, idx) => (
                <TokenBadge
                  key={`${tok.position}-${tok.id}`}
                  token={tok}
                  isActive={idx === tokens.length - 1}
                  size="md"
                />
              ))}

              {nextCandidate && (
                <button
                  onClick={() => handleStepForward(nextCandidate.token)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-dashed border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono text-sm animate-pulse hover:bg-indigo-100 transition cursor-pointer"
                >
                  <span>+ "{nextCandidate.token}"</span>
                  <span className="text-[10px] bg-indigo-200/70 dark:bg-indigo-900 px-1.5 py-0.5 rounded-full font-bold">
                    {(nextCandidate.probability * 100).toFixed(0)}%
                  </span>
                </button>
              )}
            </div>

            {/* Editable Prompt */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">
                You can edit the prompt text directly here at any time:
              </label>
              <textarea
                rows={2}
                value={promptText}
                onChange={(e) => onChangePrompt(e.target.value)}
                placeholder="Type any sentence..."
                className="w-full text-sm font-mono p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Next-Word Probabilities */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Next-Word Candidates
            </h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Live LM Head
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ranked probabilities for what comes next after "{tokens[tokens.length - 1]?.text}":
          </p>

          <div className="space-y-2.5">
            {candidateTokens.slice(0, 6).map((cand, idx) => {
              const percent = (cand.probability * 100).toFixed(1);
              const isSelected = cand.token === nextCandidate.token;

              return (
                <button
                  key={cand.tokenId}
                  onClick={() => handleStepForward(cand.token)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">#{idx + 1}</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        "{cand.token}"
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        isSelected ? 'bg-indigo-600' : 'bg-sky-500'
                      }`}
                      style={{ width: `${Math.max(2, cand.probability * 100)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
