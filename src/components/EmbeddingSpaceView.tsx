import React, { useState } from 'react';
import { TokenItem } from '../types.ts';
import { VOCABULARY_LIST, VocabEntry } from '../lib/vocabulary.ts';
import { 
  getSemanticEmbedding, 
  cosineSimilarity, 
  computeVectorAnalogy 
} from '../lib/transformerEngine.ts';
import { Compass, Sparkles, Calculator, Search, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface EmbeddingSpaceViewProps {
  tokens: TokenItem[];
}

export const EmbeddingSpaceView: React.FC<EmbeddingSpaceViewProps> = ({ tokens }) => {
  // Vector analogy state
  const [wordA, setWordA] = useState<string>('king');
  const [wordB, setWordB] = useState<string>('man');
  const [wordC, setWordC] = useState<string>('woman');

  // Pair comparison state
  const [pairWord1, setPairWord1] = useState<string>('Paris');
  const [pairWord2, setPairWord2] = useState<string>('France');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const analogyResult = computeVectorAnalogy(wordA, wordB, wordC);

  const vec1 = getSemanticEmbedding(pairWord1);
  const vec2 = getSemanticEmbedding(pairWord2);
  const pairSim = cosineSimilarity(vec1, vec2);

  const get2DCoords = (v: VocabEntry) => {
    const x = (v.semanticVector[4] * 0.4 + v.semanticVector[5] * 0.4 - v.semanticVector[8] * 0.3) * 160 + 200;
    const y = (v.semanticVector[0] * 0.4 - v.semanticVector[14] * 0.3 + v.semanticVector[2] * 0.3) * -120 + 170;
    return { x: Math.max(25, Math.min(375, x)), y: Math.max(25, Math.min(315, y)) };
  };

  const filteredVocab = VOCABULARY_LIST.filter(v => 
    !['<pad>', '<bos>', '<eos>'].includes(v.token) &&
    (searchFilter === '' || v.token.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-2">
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
          Geometric Word Space
        </span>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-500" />
          <span>Word Embeddings & Vector Arithmetic</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          In LLMs, every word lives at a set of coordinates in multi-dimensional space. Words that share concepts sit near each other!
        </p>
      </div>

      {/* Grid: 2D Radar & Arithmetic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 2D Semantic Radar (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                2D Semantic Radar Map
              </h3>
              <p className="text-xs text-slate-400">
                Click any word dot to inspect it or test similarity.
              </p>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search word..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs pl-8 pr-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full h-[360px] bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden select-none">
            {/* Axis */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-full h-px bg-slate-400" />
              <div className="h-full w-px bg-slate-400 absolute" />
            </div>

            {/* Clusters */}
            <span className="absolute top-3 left-4 text-[10px] font-mono text-emerald-600/80 font-bold uppercase">
              ✦ Royalty & Life
            </span>
            <span className="absolute top-3 right-4 text-[10px] font-mono text-sky-600/80 font-bold uppercase">
              ✦ Countries & Cities
            </span>
            <span className="absolute bottom-3 right-4 text-[10px] font-mono text-indigo-600/80 font-bold uppercase">
              ✦ AI & Neural Tech
            </span>
            <span className="absolute bottom-3 left-4 text-[10px] font-mono text-amber-600/80 font-bold uppercase">
              ✦ Code & Syntax
            </span>

            {/* Plotted Words */}
            <svg className="w-full h-full">
              {filteredVocab.map((v) => {
                const { x, y } = get2DCoords(v);
                const isInPrompt = tokens.some(t => t.text.toLowerCase() === v.token.toLowerCase());

                return (
                  <g
                    key={v.id}
                    className="cursor-pointer group transition-all"
                    onClick={() => setPairWord1(v.token)}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isInPrompt ? 7 : 4}
                      className={`${
                        isInPrompt
                          ? 'fill-indigo-600 stroke-2 stroke-amber-400'
                          : 'fill-emerald-500 dark:fill-emerald-400'
                      } transition-all group-hover:r-6`}
                    />
                    <text
                      x={x + 7}
                      y={y + 3}
                      className={`text-[11px] font-mono font-bold ${
                        isInPrompt
                          ? 'fill-indigo-600 dark:fill-indigo-400 font-extrabold text-xs'
                          : 'fill-slate-700 dark:fill-slate-300'
                      } group-hover:fill-emerald-600`}
                    >
                      {v.token}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Word Vector Arithmetic (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Word Math Calculator */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Word Vector Arithmetic
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adding and subtracting word vectors produces new concepts:
            </p>

            {/* Formula inputs */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                <input
                  type="text"
                  value={wordA}
                  onChange={(e) => setWordA(e.target.value)}
                  className="w-20 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="text"
                  value={wordB}
                  onChange={(e) => setWordB(e.target.value)}
                  className="w-20 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center"
                />
                <span className="text-slate-400">+</span>
                <input
                  type="text"
                  value={wordC}
                  onChange={(e) => setWordC(e.target.value)}
                  className="w-20 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center"
                />
                <span className="text-emerald-500 font-bold">≈</span>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { a: 'king', b: 'man', c: 'woman', label: '👑 King - Man + Woman' },
                  { a: 'Paris', b: 'France', c: 'Italy', label: '🍕 Paris - France + Italy' },
                  { a: 'neural', b: 'brain', c: 'transformer', label: '🧠 Neural - Brain + Transformer' },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setWordA(p.a);
                      setWordB(p.b);
                      setWordC(p.c);
                    }}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nearest Match Results */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 block">
                Top Calculated Semantic Results:
              </span>
              <div className="space-y-2">
                {analogyResult.topMatches.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">#{idx + 1}</span>
                      <strong className="text-slate-900 dark:text-white font-bold text-sm bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        "{m.token}"
                      </strong>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Match: {(m.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pairwise Cosine Similarity Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Word Similarity Gauge
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Word 1
                </label>
                <input
                  type="text"
                  value={pairWord1}
                  onChange={(e) => setPairWord1(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Word 2
                </label>
                <input
                  type="text"
                  value={pairWord2}
                  onChange={(e) => setPairWord2(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-center"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">
                  Cosine Similarity Score
                </span>
                <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {pairSim.toFixed(3)}
                </span>
              </div>

              <span className={`text-xs font-bold font-mono px-3 py-1 rounded-full ${
                pairSim > 0.7
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : pairSim > 0.4
                  ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {pairSim > 0.7 ? 'High Match ✨' : pairSim > 0.4 ? 'Moderate' : 'Unrelated'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
