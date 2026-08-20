import React, { useState } from 'react';
import { TokenItem } from '../types.ts';
import { 
  Bot, 
  Sparkles, 
  Loader2, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import Markdown from 'react-markdown';

interface GeminiInspectorProps {
  promptText: string;
  tokens: TokenItem[];
}

export const GeminiInspector: React.FC<GeminiInspectorProps> = ({ promptText, tokens }) => {
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [modelNote, setModelNote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzePrompt = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          currentTokens: tokens.map(t => ({ id: t.id, text: t.text, position: t.position })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        let cleanMsg = data.error || 'Failed to query Gemini analysis API';
        try {
          if (typeof cleanMsg === 'string' && cleanMsg.startsWith('{')) {
            const parsed = JSON.parse(cleanMsg);
            if (parsed?.error?.message) {
              cleanMsg = parsed.error.message;
            }
          }
        } catch {
          // ignore
        }
        throw new Error(cleanMsg);
      }

      setAnalysisText(data.text);
      setModelUsed(data.model || 'Gemini');
      setModelNote(data.note || null);
    } catch (err: any) {
      console.error(err);
      let message = err.message || 'Could not connect to AI service';
      try {
        if (typeof message === 'string' && message.includes('{')) {
          const jsonStart = message.indexOf('{');
          const jsonStr = message.substring(jsonStart);
          const parsed = JSON.parse(jsonStr);
          if (parsed?.error?.message) {
            message = parsed.error.message;
          }
        }
      } catch {
        // keep string
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Direct AI Introspection
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Live Gemini Transformer Breakdown
              </h2>
            </div>
          </div>

          <button
            onClick={handleAnalyzePrompt}
            disabled={isLoading || !promptText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Architecture...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Explain With Real AI</span>
              </>
            )}
          </button>
        </div>

        {/* Current Prompt Box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-slate-400 font-sans font-semibold block mb-1">
              Sequence being analyzed:
            </span>
            <span className="text-slate-900 dark:text-white font-bold text-sm">
              "{promptText}"
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Tokens:</span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400">
              {tokens.length}
            </span>
          </div>
        </div>
      </div>

      {/* Error Card */}
      {error && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="space-y-1 flex-1">
              <strong className="font-bold text-sm block">Temporary Upstream Notice</strong>
              <p className="text-xs leading-relaxed text-rose-700 dark:text-rose-300">
                {error}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/60">
            <button
              onClick={handleAnalyzePrompt}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Analysis</span>
            </button>
          </div>
        </div>
      )}

      {/* Analysis Result */}
      {analysisText ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Architectural Breakdown & Attention Mechanics
              </span>
            </div>

            {modelUsed && (
              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Engine: {modelUsed}
              </span>
            )}
          </div>

          {modelNote && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
              ℹ️ {modelNote}
            </div>
          )}

          {/* Clean Markdown Typography */}
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 leading-relaxed font-sans space-y-4">
            <div className="markdown-body">
              <Markdown>{analysisText}</Markdown>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Sequence: "{promptText}"</span>
            <button
              onClick={handleAnalyzePrompt}
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-analyze</span>
            </button>
          </div>
        </div>
      ) : !error && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
            <Cpu className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ask Gemini to Break Down the Transformer Mechanics
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Tap <strong>"Explain With Real AI"</strong> above to have the model inspect the exact self-attention circuits, embedding vector directions, and probability logits for your sentence.
            </p>
          </div>

          <button
            onClick={handleAnalyzePrompt}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Analysis for "{promptText}"</span>
          </button>
        </div>
      )}
    </div>
  );
};

