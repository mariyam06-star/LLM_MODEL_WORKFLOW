import React, { useState } from 'react';
import { TokenItem, TransformerLayerState, PipelineStage, SamplingConfig } from '../types.ts';
import { TokenBadge } from './TokenBadge.tsx';
import { MathFormula } from './MathFormula.tsx';
import { computeNextTokenLogits, sampleNextToken } from '../lib/transformerEngine.ts';
import { 
  Binary, 
  Layers, 
  GitFork, 
  TrendingUp, 
  BarChart3, 
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PipelineWalkthroughProps {
  tokens: TokenItem[];
  layerState: TransformerLayerState;
  samplingConfig: SamplingConfig;
  onUpdateSamplingConfig: (config: Partial<SamplingConfig>) => void;
  onSelectTokenIndex?: (index: number) => void;
}

export const PipelineWalkthrough: React.FC<PipelineWalkthroughProps> = ({
  tokens,
  layerState,
  samplingConfig,
  onUpdateSamplingConfig,
}) => {
  const [activeStage, setActiveStage] = useState<PipelineStage>('tokenization');
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(Math.max(0, tokens.length - 1));
  const [selectedHeadIdx, setSelectedHeadIdx] = useState<number>(0);
  const [selectedActivation, setSelectedActivation] = useState<'gelu' | 'swiglu' | 'relu'>('gelu');

  const stages: { id: PipelineStage; name: string; icon: React.ReactNode; stepNumber: number; summary: string }[] = [
    { id: 'tokenization', name: '1. Tokenization & BPE', icon: <Binary className="w-4 h-4" />, stepNumber: 1, summary: 'Converts raw string to discrete integer token IDs and bytes' },
    { id: 'embeddings', name: '2. Embeddings & Positional PE', icon: <Layers className="w-4 h-4" />, stepNumber: 2, summary: 'Projects token IDs into semantic vector space + sinusoidal positional waves' },
    { id: 'attention', name: '3. Multi-Head Self-Attention', icon: <GitFork className="w-4 h-4" />, stepNumber: 3, summary: 'Calculates Q, K, V dot-products, causal masking, and context routing' },
    { id: 'mlp', name: '4. MLP & LayerNorm', icon: <TrendingUp className="w-4 h-4" />, stepNumber: 4, summary: 'Expands 4x dimensions, applies non-linear GELU activation, and residual Add & Norm' },
    { id: 'lm-head', name: '5. LM Head & Logits', icon: <BarChart3 className="w-4 h-4" />, stepNumber: 5, summary: 'Unembeds hidden states into raw vocabulary scores (logits)' },
    { id: 'sampling', name: '6. Softmax & Sampling', icon: <SlidersHorizontal className="w-4 h-4" />, stepNumber: 6, summary: 'Applies temperature, Top-K/Top-P filtering, and predicts the next token' },
  ];

  const currentStageIdx = stages.findIndex(s => s.id === activeStage);

  // Compute live logits & predictions for the walkthrough
  const finalHiddenState = layerState.postFfnNorm[layerState.postFfnNorm.length - 1] || new Array(16).fill(0);
  const candidateTokens = computeNextTokenLogits(tokens, finalHiddenState, samplingConfig);
  const predictedToken = sampleNextToken(candidateTokens, samplingConfig);

  const safeSelectedTokenIdx = Math.min(selectedTokenIdx, Math.max(0, tokens.length - 1));
  const currentToken = tokens[safeSelectedTokenIdx];

  return (
    <div className="space-y-6">
      {/* Stepper Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Transformer Architecture Pipeline</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Stage {currentStageIdx + 1} of 6
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any stage below to inspect the mathematical transformations occurring in the neural network.
            </p>
          </div>

          {/* Prev/Next navigation buttons */}
          <div className="flex items-center gap-1.5">
            <button
              id="walkthrough-prev-step-button"
              disabled={currentStageIdx === 0}
              onClick={() => setActiveStage(stages[currentStageIdx - 1].id)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Previous Stage"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="walkthrough-next-step-button"
              disabled={currentStageIdx === stages.length - 1}
              onClick={() => setActiveStage(stages[currentStageIdx + 1].id)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Next Stage"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {stages.map((st, idx) => {
            const isActive = activeStage === st.id;
            const isCompleted = idx < currentStageIdx;
            return (
              <button
                key={st.id}
                id={`stage-button-${st.id}`}
                onClick={() => setActiveStage(st.id)}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-150 ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : isCompleted
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {isCompleted ? '✓' : `0${st.stepNumber}`}
                  </span>
                  <div className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
                    {st.icon}
                  </div>
                </div>
                <div className="text-xs font-semibold leading-snug line-clamp-1">
                  {st.name.replace(/^\d+\.\s*/, '')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Panels */}
      {activeStage === 'tokenization' && (
        <div className="space-y-6">
          {/* Math Formula Card */}
          <MathFormula
            title="Stage 1: Tokenization & Byte-Pair Encoding (BPE)"
            formula="Text \xrightarrow{\text{Regex \& BPE Merge}} [t_0, t_1, \dots, t_{N-1}], \quad t_i \in \{0, \dots, |V|-1\}"
            description="LLMs do not read raw strings. The tokenizer breaks the unicode sequence into discrete subwords based on frequency merge tables, assigning an integer ID from the model's vocabulary |V|."
            dimensions={[
              { symbol: "N", meaning: `Sequence Length (${tokens.length} tokens)` },
              { symbol: "|V|", meaning: "Vocabulary Size (~32,000 to 128,000 in modern LLMs)" },
              { symbol: "Bytes", meaning: "UTF-8 byte encodings per token" },
            ]}
            highlight="Input Layer"
          />

          {/* Interactive Token Inspection Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tokenized Sequence Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any token below to view its byte-level details and vocabulary index.
                </p>
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                Total: {tokens.length} tokens
              </span>
            </div>

            {/* Token Stream Chips */}
            <div className="flex flex-wrap gap-2 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {tokens.map((tok, idx) => (
                <TokenBadge
                  key={`${tok.position}-${tok.id}`}
                  token={tok}
                  isActive={safeSelectedTokenIdx === idx}
                  onClick={() => setSelectedTokenIdx(idx)}
                />
              ))}
            </div>

            {/* Selected Token Inspector Card */}
            {currentToken && (
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    Token String
                  </span>
                  <span className="font-mono text-base font-bold text-indigo-950 dark:text-indigo-200 bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-800 inline-block">
                    "{currentToken.text}"
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    Vocabulary ID (Index)
                  </span>
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                    #{currentToken.id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    Sequence Position (pos)
                  </span>
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                    Index {currentToken.position}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    UTF-8 Bytes
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 inline-block">
                    [{currentToken.bytes.join(', ')}]
                  </span>
                </div>
              </div>
            )}

            {/* Subword BPE Concept Explanation */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
              <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-white font-semibold">Why Subwords Matter: </strong>
                Instead of storing every possible word in the dictionary, modern tokenizers use subword merges (e.g. <code>"unbelievable"</code> $\to$ <code>["un", "believ", "able"]</code>). This gives infinite vocabulary coverage with bounded memory.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStage === 'embeddings' && (
        <div className="space-y-6">
          <MathFormula
            title="Stage 2: Vector Embedding & Positional Encoding"
            formula="\mathbf{x}_i^{(0)} = \mathbf{E}[t_i] + \mathbf{PE}(i), \quad \mathbf{PE}(i, 2k) = \sin\left(\frac{i}{10000^{2k/d}}\right), \quad \mathbf{PE}(i, 2k+1) = \cos\left(\frac{i}{10000^{2k/d}}\right)"
            description="The integer Token ID is looked up in an embedding matrix to retrieve a continuous semantic vector of dimension d_model. Because self-attention has no inherent concept of word order, sinusoidal or rotary (RoPE) positional signals are added."
            dimensions={[
              { symbol: "d_model", meaning: "Hidden dimension (16 in this simulator; 4096 in Llama-3 8B, 8192 in GPT-4)" },
              { symbol: "E[t_i]", meaning: "Token embedding vector" },
              { symbol: "PE(i)", meaning: "Positional encoding vector for token at index i" },
            ]}
            highlight="Embedding Matrix"
          />

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Interactive Vector Decomposition for: <span className="font-mono text-indigo-600 dark:text-indigo-400">"{currentToken?.text}"</span> (Pos #{currentToken?.position})
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Select token:</span>
                <select
                  value={safeSelectedTokenIdx}
                  onChange={(e) => setSelectedTokenIdx(Number(e.target.value))}
                  className="text-xs font-mono py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {tokens.map((t, idx) => (
                    <option key={idx} value={idx}>
                      #{t.position}: {t.text}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vector Component Heatmaps */}
            <div className="space-y-4 font-mono text-xs">
              {/* 1. Semantic Embedding Vector */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-sans">
                    1. Semantic Embedding Vector <span className="font-mono text-slate-400">(E[t])</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">16 dimensions</span>
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
                  {layerState.embeddings[safeSelectedTokenIdx]?.map((val, d) => {
                    const intensity = Math.min(1, Math.abs(val));
                    const isPositive = val >= 0;
                    return (
                      <div
                        key={d}
                        title={`Dim ${d}: ${val}`}
                        className={`p-1.5 rounded text-center text-[10px] font-bold transition-all ${
                          isPositive
                            ? 'bg-indigo-500 text-white'
                            : 'bg-rose-500 text-white'
                        }`}
                        style={{ opacity: 0.35 + intensity * 0.65 }}
                      >
                        {val.toFixed(1)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Sinusoidal Positional Encoding */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-sans">
                    2. Positional Encoding <span className="font-mono text-slate-400">(PE[pos])</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">Sinusoidal Wave (Pos {currentToken?.position})</span>
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
                  {layerState.positionalEncodings[safeSelectedTokenIdx]?.map((val, d) => {
                    const isEven = d % 2 === 0;
                    return (
                      <div
                        key={d}
                        title={`Dim ${d} (${isEven ? 'sin' : 'cos'}): ${val}`}
                        className={`p-1.5 rounded text-center text-[10px] font-bold text-white transition-all ${
                          isEven ? 'bg-sky-500' : 'bg-teal-500'
                        }`}
                        style={{ opacity: 0.35 + Math.abs(val) * 0.65 }}
                      >
                        {val.toFixed(1)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Combined Input Vector */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-indigo-950 dark:text-indigo-200 font-sans">
                    3. Combined Vector Input <span className="font-mono text-indigo-400">(X_0 = E + PE)</span>
                  </span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-sans font-medium">Ready for Transformer Block</span>
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
                  {layerState.combinedEmbeddings[safeSelectedTokenIdx]?.map((val, d) => (
                    <div
                      key={d}
                      title={`Combined Dim ${d}: ${val}`}
                      className="p-1.5 rounded text-center text-[10px] font-bold bg-indigo-600 text-white"
                      style={{ opacity: 0.4 + (Math.min(2, Math.abs(val)) / 2) * 0.6 }}
                    >
                      {val.toFixed(1)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStage === 'attention' && (
        <div className="space-y-6">
          <MathFormula
            title="Stage 3: Multi-Head Self-Attention Mechanics"
            formula="\mathbf{Q} = \mathbf{X}\mathbf{W}_Q, \quad \mathbf{K} = \mathbf{X}\mathbf{W}_K, \quad \mathbf{V} = \mathbf{X}\mathbf{W}_V, \quad \text{Attention}(\mathbf{Q},\mathbf{K},\mathbf{V}) = \text{softmax}\left(\frac{\mathbf{Q}\mathbf{K}^T}{\sqrt{d_k}} + \mathbf{M}\right)\mathbf{V}"
            description="Queries (what I'm looking for), Keys (what I offer), and Values (the payload) are computed via learned projection matrices. Dot-products measure similarity, scaled by sqrt(d_k) to prevent vanishing gradients, and masked by M so tokens cannot look into the future."
            dimensions={[
              { symbol: "Q, K, V", meaning: "Linear projections of the input sequence" },
              { symbol: "d_k", meaning: "Head dimension (16 / 4 heads = 4)" },
              { symbol: "M", meaning: "Causal autoregressive mask (0 for past/present, -Infinity for future)" },
            ]}
            highlight="Core Engine"
          />

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
            {/* Attention Head Selector */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Multi-Head Attention Inspection
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select an attention head to see its specialized relational pattern.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {layerState.attentionHeads.map((head, idx) => (
                  <button
                    key={head.id}
                    id={`head-select-${idx}`}
                    onClick={() => setSelectedHeadIdx(idx)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                      selectedHeadIdx === idx
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Head {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Head Description Banner */}
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-sky-950 dark:text-sky-200 font-semibold">
                  {layerState.attentionHeads[selectedHeadIdx].name}:
                </strong>{' '}
                <span className="text-sky-800 dark:text-sky-300">
                  {layerState.attentionHeads[selectedHeadIdx].description}
                </span>
              </div>
            </div>

            {/* Attention Matrix Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[480px]">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                  <span>Query Token (Rows) \rightarrow Key Token (Columns)</span>
                  <span className="text-[11px] font-mono">Autoregressive Lower-Triangular Mask</span>
                </div>

                <div className="grid gap-1.5">
                  {/* Column Header Tokens (Keys) */}
                  <div className="flex items-center gap-1.5 pl-24">
                    {tokens.map((tok, j) => (
                      <div
                        key={j}
                        className="w-12 text-center text-[11px] font-mono font-semibold truncate text-slate-600 dark:text-slate-300"
                        title={`Key: ${tok.text}`}
                      >
                        {tok.text}
                      </div>
                    ))}
                  </div>

                  {/* Matrix Rows (Queries) */}
                  {tokens.map((qTok, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      {/* Row Label (Query Token) */}
                      <div
                        className="w-24 text-right pr-2 text-xs font-mono font-bold truncate text-slate-800 dark:text-slate-200"
                        title={`Query: ${qTok.text}`}
                      >
                        {qTok.text}
                      </div>

                      {/* Cells */}
                      {tokens.map((kTok, j) => {
                        const isMasked = j > i;
                        const weight = layerState.attentionHeads[selectedHeadIdx].matrix[i]?.[j] || 0;
                        const percent = Math.round(weight * 100);

                        return (
                          <div
                            key={j}
                            title={
                              isMasked
                                ? `Masked by Causal Mask (j > i)`
                                : `Query "${qTok.text}" attends to Key "${kTok.text}": ${(weight * 100).toFixed(1)}%`
                            }
                            className={`w-12 h-9 rounded flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                              isMasked
                                ? 'bg-slate-100 dark:bg-slate-950 text-slate-300 dark:text-slate-700 border border-dashed border-slate-200 dark:border-slate-800'
                                : weight > 0.4
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : weight > 0.15
                                ? 'bg-indigo-400 text-white'
                                : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300'
                            }`}
                          >
                            {isMasked ? '-\u221E' : `${percent}%`}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStage === 'mlp' && (
        <div className="space-y-6">
          <MathFormula
            title="Stage 4: MLP / Feed-Forward Network & Residual Add + Norm"
            formula="\mathbf{z}_i = \text{LayerNorm}(\mathbf{x}_i + \text{MultiHead}(\mathbf{x}_i)), \quad \mathbf{x}_i^{(l+1)} = \text{LayerNorm}(\mathbf{z}_i + \text{MLP}(\mathbf{z}_i)), \quad \text{MLP}(\mathbf{z}) = \text{GELU}(\mathbf{z}\mathbf{W}_1 + \mathbf{b}_1)\mathbf{W}_2 + \mathbf{b}_2"
            description="While Self-Attention routes information between different tokens, the Feed-Forward Network (MLP) acts on each token vector independently. It expands the dimension 4x (e.g. 16 -> 64 -> 16), executes non-linear activation (GELU/SwiGLU) for factual retrieval, and adds skip connections."
            dimensions={[
              { symbol: "MultiHead", meaning: "Attention output concatenated across all heads" },
              { symbol: "d_ffn", meaning: "4 * d_model (64 in simulator; 14,336 in Llama-3 8B)" },
              { symbol: "Add & Norm", meaning: "Prevents vanishing gradients in 100+ deep transformer layers" },
            ]}
            highlight="Non-Linear Reasoning"
          />

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Feed-Forward Expansion & Activation Function
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select an activation function to inspect how the token's 64 expanded features are shaped.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['gelu', 'swiglu', 'relu'] as const).map((act) => (
                  <button
                    key={act}
                    onClick={() => setSelectedActivation(act)}
                    className={`px-3 py-1 text-xs font-semibold uppercase rounded-lg transition ${
                      selectedActivation === act
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            {/* Architecture Flow Graphic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1: Input Vector */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Input Dimension
                </span>
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                  16 <span className="text-xs font-normal text-slate-400">(d_model)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Normalized post-attention representation
                </p>
              </div>

              {/* Step 2: Expanded MLP Dimension */}
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 text-center space-y-2">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Expanded Hidden Layer (4x)
                </span>
                <div className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  64 <span className="text-xs font-normal text-indigo-400">(d_ffn)</span>
                </div>
                <p className="text-[11px] text-indigo-800 dark:text-indigo-300 leading-tight">
                  Applied {selectedActivation.toUpperCase()} non-linear activation
                </p>
              </div>

              {/* Step 3: Projected Output */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-center space-y-2">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Residual Add + LayerNorm
                </span>
                <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  16 <span className="text-xs font-normal text-emerald-400">(d_model)</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-tight">
                  Final token contextual state
                </p>
              </div>
            </div>

            {/* MLP 64-dim Feature Slice Visualizer */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2 font-mono">
                FFN Hidden Layer Activation Matrix (64 intermediate neurons):
              </span>
              <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
                {layerState.ffnExpanded[safeSelectedTokenIdx]?.map((val, idx) => (
                  <div
                    key={idx}
                    title={`Neuron ${idx}: ${val}`}
                    className="p-1 text-center text-[9px] font-mono font-bold rounded bg-indigo-500 text-white"
                    style={{ opacity: Math.min(1, 0.2 + Math.abs(val) * 0.8) }}
                  >
                    {val.toFixed(1)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStage === 'lm-head' && (
        <div className="space-y-6">
          <MathFormula
            title="Stage 5: Language Model Head (LM Head) & Unembedding"
            formula="\mathbf{z} = \mathbf{x}_{N-1}^{(L)} \mathbf{W}_{\text{unembed}}, \quad \mathbf{z} \in \mathbb{R}^{|V|}"
            description="The final hidden state of the very last token in the prompt x_{N-1} is projected across the entire vocabulary via the unembedding matrix W_unembed. This produces unnormalized raw prediction scores called logits (z)."
            dimensions={[
              { symbol: "x_{N-1}", meaning: "Contextual vector of the last token (Paris/France/Token)" },
              { symbol: "W_unembed", meaning: "Weight matrix mapping d_model (16) -> Vocabulary (|V|)" },
              { symbol: "z", meaning: "Raw logit scores (higher = more likely)" },
            ]}
            highlight="Unembedding Layer"
          />

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Raw Logits for Top Vocabulary Candidates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              These are the raw unnormalized dot-product scores produced by the final linear projection layer.
            </p>

            <div className="space-y-2">
              {candidateTokens.slice(0, 8).map((cand, idx) => (
                <div
                  key={cand.tokenId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-slate-400 font-sans font-semibold">#{idx + 1}</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      "{cand.token}"
                    </span>
                    <span className="text-[11px] text-slate-500 font-sans">Token #{cand.tokenId}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 dark:text-slate-300">
                      Raw Logit: <strong className="text-indigo-600 dark:text-indigo-400">{cand.rawLogit > 0 ? `+${cand.rawLogit}` : cand.rawLogit}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeStage === 'sampling' && (
        <div className="space-y-6">
          <MathFormula
            title="Stage 6: Softmax, Temperature & Decoding Strategies"
            formula="P(t = w_i) = \frac{\exp(z_i / T)}{\sum_{j \in V_{\text{filtered}}} \exp(z_j / T)}, \quad \sum_{i \in \text{Top-P}} P(w_i) \ge p"
            description="Logits are divided by Temperature T. Softmax normalizes them into a true probability distribution summing to 1.0 (100%). Top-K restricts selection to K tokens; Top-P (Nucleus) filters the smallest set of tokens whose cumulative probability exceeds p."
            dimensions={[
              { symbol: "T (Temperature)", meaning: "Controls randomness (T=0.1 deterministic; T=1.0 balanced; T=1.8 creative)" },
              { symbol: "Top-K", meaning: "Truncates candidate pool to top K items" },
              { symbol: "Top-P (Nucleus)", meaning: "Dynamically cuts off the tail of low-probability tokens" },
            ]}
            highlight="Output Token Generation"
          />

          {/* Interactive Sampling Playground Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Interactive Decoding Hyperparameters</span>
              <span className="text-xs font-normal text-indigo-600 dark:text-indigo-400">
                Adjust sliders to see live probability shift
              </span>
            </h3>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Temperature (T)</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {samplingConfig.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  id="temperature-slider"
                  type="range"
                  min="0.05"
                  max="2.0"
                  step="0.05"
                  value={samplingConfig.temperature}
                  onChange={(e) => onUpdateSamplingConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Greedy (0.1)</span>
                  <span>Creative (2.0)</span>
                </div>
              </div>

              {/* Top-P Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Top-P (Nucleus)</span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                    {samplingConfig.topP.toFixed(2)}
                  </span>
                </div>
                <input
                  id="top-p-slider"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={samplingConfig.topP}
                  onChange={(e) => onUpdateSamplingConfig({ topP: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Strict (0.2)</span>
                  <span>Full Mass (1.0)</span>
                </div>
              </div>

              {/* Top-K Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Top-K</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {samplingConfig.topK}
                  </span>
                </div>
                <input
                  id="top-k-slider"
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={samplingConfig.topK}
                  onChange={(e) => onUpdateSamplingConfig({ topK: parseInt(e.target.value, 10) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Top 1</span>
                  <span>Top 20</span>
                </div>
              </div>
            </div>

            {/* Candidate Distribution Bars */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Probability Distribution for Next Token:
              </h4>

              <div className="space-y-2.5">
                {candidateTokens.slice(0, 6).map((cand) => {
                  const percent = (cand.probability * 100).toFixed(1);
                  const isWinner = cand.token === predictedToken.token;

                  return (
                    <div key={cand.tokenId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm px-2 py-0.5 rounded ${
                            isWinner
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}>
                            "{cand.token}"
                          </span>
                          {isWinner && (
                            <span className="text-[10px] font-sans font-semibold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Selected Token
                            </span>
                          )}
                          {!cand.isTopP && (
                            <span className="text-[10px] font-sans text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                              Cut by Top-P
                            </span>
                          )}
                        </div>

                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {percent}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            isWinner
                              ? 'bg-indigo-600'
                              : cand.isTopP
                              ? 'bg-sky-500'
                              : 'bg-slate-400 opacity-40'
                          }`}
                          style={{ width: `${Math.max(1, cand.probability * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
