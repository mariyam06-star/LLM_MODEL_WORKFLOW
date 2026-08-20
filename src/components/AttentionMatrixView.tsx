import React, { useState } from 'react';
import { TokenItem, TransformerLayerState } from '../types.ts';
import { TokenBadge } from './TokenBadge.tsx';
import { Eye, Sparkles, Info, HelpCircle, ArrowDownRight, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface AttentionMatrixViewProps {
  tokens: TokenItem[];
  layerState: TransformerLayerState;
}

export const AttentionMatrixView: React.FC<AttentionMatrixViewProps> = ({
  tokens,
  layerState,
}) => {
  const [selectedHeadIdx, setSelectedHeadIdx] = useState<number>(0);
  const [selectedQueryIdx, setSelectedQueryIdx] = useState<number>(Math.max(0, tokens.length - 1));
  const [hoveredKeyIdx, setHoveredKeyIdx] = useState<number | null>(null);

  const safeQueryIdx = Math.min(selectedQueryIdx, Math.max(0, tokens.length - 1));
  const currentHead = layerState.attentionHeads[selectedHeadIdx] || layerState.attentionHeads[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Head Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-1">
              Multi-Head Attention Visualizer
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-500" />
              <span>Attention Spotlight (How Words Connect)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select an attention head to see what relationships and patterns that specific neural circuit specializes in.
            </p>
          </div>

          {/* Attention Head Selector Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex-wrap">
            {layerState.attentionHeads.map((head, idx) => (
              <button
                key={head.id}
                onClick={() => setSelectedHeadIdx(idx)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  selectedHeadIdx === idx
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Head {idx + 1}: {head.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Head Mission Description */}
        <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 flex items-start gap-3 text-xs">
          <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-sky-950 dark:text-sky-200 font-bold block mb-0.5">
              {currentHead.name} Circuit
            </strong>
            <p className="text-sky-900 dark:text-sky-300 leading-relaxed">
              {currentHead.description}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Spotlight Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Interactive Attention Spotlight
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any token below to see how strongly it looks back at preceding words in the sentence.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Currently Inspecting:</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
              #{tokens[safeQueryIdx]?.position} "{tokens[safeQueryIdx]?.text}"
            </span>
          </div>
        </div>

        {/* Token Strip */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
            {tokens.map((tok, idx) => {
              const isQuery = idx === safeQueryIdx;
              const weight = currentHead.matrix[safeQueryIdx]?.[idx] || 0;
              const isFuture = idx > safeQueryIdx;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedQueryIdx(idx)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer min-w-[76px] ${
                    isQuery
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 ring-2 ring-indigo-500/20 shadow-md'
                      : isFuture
                      ? 'opacity-30 border-dashed border-slate-200 dark:border-slate-800'
                      : weight > 0.3
                      ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  {/* Weight percentage chip */}
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isFuture
                        ? 'text-slate-400'
                        : isQuery
                        ? 'bg-indigo-600 text-white'
                        : weight > 0.3
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isFuture ? 'mask' : `${Math.round(weight * 100)}%`}
                  </span>

                  <TokenBadge
                    token={tok}
                    isActive={isQuery}
                    showId={false}
                    size="sm"
                  />

                  <span className="text-[10px] text-slate-400 font-mono">
                    pos {tok.position}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Attention Flow Breakdown */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Attention Spotlight breakdown for word "{tokens[safeQueryIdx]?.text}":
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {tokens.slice(0, safeQueryIdx + 1).map((tok, j) => {
                const weight = currentHead.matrix[safeQueryIdx]?.[j] || 0;
                const percent = (weight * 100).toFixed(1);

                return (
                  <div
                    key={j}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">#{tok.position}</span>
                      <strong className="text-slate-900 dark:text-white font-mono">
                        "{tok.text}"
                      </strong>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${Math.max(4, weight * 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-sky-600 dark:text-sky-400 w-10 text-right">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
