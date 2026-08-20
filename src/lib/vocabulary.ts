export interface VocabEntry {
  id: number;
  token: string;
  subwords?: string[];
  semanticVector: number[]; // 16-dim normalized semantic features
  category: 'noun' | 'verb' | 'adjective' | 'syntax' | 'punctuation' | 'concept' | 'code';
}

// 16-dimensional semantic feature meanings:
// [0]: Animacy/Living, [1]: Human, [2]: Royalty/Authority, [3]: Female/Male (-1 to +1),
// [4]: Geographic/Place, [5]: Technology/Computing, [6]: Action/Dynamic, [7]: Abstract/Cognitive,
// [8]: Structure/Syntax, [9]: Negation/Condition, [10]: Size/Magnitude, [11]: Emotion/Positive,
// [12]: Language/Grammar, [13]: Time/Sequence, [14]: Science/Math, [15]: Punctuation/Boundary

export const VOCABULARY_LIST: VocabEntry[] = [
  { id: 0, token: "<pad>", semanticVector: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1], category: "syntax" },
  { id: 1, token: "<bos>", semanticVector: [0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1], category: "syntax" },
  { id: 2, token: "<eos>", semanticVector: [0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1], category: "syntax" },
  { id: 3, token: "the", semanticVector: [0,0,0,0,0,0,0,0,0.9,0,0,0,0.8,0,0,0], category: "syntax" },
  { id: 4, token: "The", semanticVector: [0,0,0,0,0,0,0,0,0.9,0,0,0,0.8,0,0,0], category: "syntax" },
  { id: 5, token: "capital", semanticVector: [0,0,0.7,0,0.8,0,0,0.5,0,0,0.6,0,0,0,0,0], category: "noun" },
  { id: 6, token: "of", semanticVector: [0,0,0,0,0,0,0,0,0.8,0,0,0,0.7,0,0,0], category: "syntax" },
  { id: 7, token: "France", semanticVector: [0,0,0.3,0,0.95,0,0,0.2,0,0,0.5,0.4,0,0,0,0], category: "noun" },
  { id: 8, token: "is", semanticVector: [0,0,0,0,0,0,0.6,0.3,0.7,0,0,0,0.8,0,0,0], category: "verb" },
  { id: 9, token: "Paris", semanticVector: [0,0,0.4,0,0.98,0,0,0.3,0,0,0.6,0.6,0,0,0,0], category: "noun" },
  { id: 10, token: ".", semanticVector: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], category: "punctuation" },
  { id: 11, token: "king", semanticVector: [0.9,0.95,0.95,0.8,0,0,0.2,0.3,0,0,0.7,0.3,0,0,0,0], category: "noun" },
  { id: 12, token: "queen", semanticVector: [0.9,0.95,0.95,-0.8,0,0,0.2,0.3,0,0,0.7,0.4,0,0,0,0], category: "noun" },
  { id: 13, token: "man", semanticVector: [0.9,0.95,0.1,0.85,0,0,0.3,0.2,0,0,0.4,0.1,0,0,0,0], category: "noun" },
  { id: 14, token: "woman", semanticVector: [0.9,0.95,0.1,-0.85,0,0,0.3,0.2,0,0,0.4,0.2,0,0,0,0], category: "noun" },
  { id: 15, token: "Italy", semanticVector: [0,0,0.3,0,0.94,0,0,0.2,0,0,0.5,0.5,0,0,0,0], category: "noun" },
  { id: 16, token: "Rome", semanticVector: [0,0,0.4,0,0.96,0,0,0.3,0,0,0.6,0.6,0,0,0,0], category: "noun" },
  { id: 17, token: "Germany", semanticVector: [0,0,0.3,0,0.93,0,0,0.2,0,0,0.5,0.3,0,0,0,0], category: "noun" },
  { id: 18, token: "Berlin", semanticVector: [0,0,0.4,0,0.95,0,0,0.3,0,0,0.6,0.4,0,0,0,0], category: "noun" },
  { id: 19, token: "Japan", semanticVector: [0,0,0.3,0,0.94,0,0,0.2,0,0,0.5,0.5,0,0,0,0], category: "noun" },
  { id: 20, token: "Tokyo", semanticVector: [0,0,0.4,0,0.97,0.5,0,0.3,0,0,0.7,0.5,0,0,0,0], category: "noun" },
  { id: 21, token: "London", semanticVector: [0,0,0.4,0,0.96,0,0,0.3,0,0,0.7,0.4,0,0,0,0], category: "noun" },
  { id: 22, token: "UK", semanticVector: [0,0,0.3,0,0.92,0,0,0.2,0,0,0.5,0.4,0,0,0,0], category: "noun" },
  { id: 23, token: "England", semanticVector: [0,0,0.3,0,0.92,0,0,0.2,0,0,0.5,0.4,0,0,0,0], category: "noun" },
  { id: 24, token: "neural", semanticVector: [0.6,0.3,0,0,0,0.85,0.2,0.7,0,0,0.4,0,0,0,0.8,0], category: "adjective" },
  { id: 25, token: "network", semanticVector: [0.3,0,0,0,0,0.92,0.4,0.6,0.3,0,0.6,0,0,0,0.7,0], category: "noun" },
  { id: 26, token: "transformer", semanticVector: [0,0,0.2,0,0,0.98,0.5,0.8,0.2,0,0.8,0.2,0,0,0.9,0], category: "noun" },
  { id: 27, token: "attention", semanticVector: [0.5,0.6,0,0,0,0.85,0.4,0.95,0.2,0,0.5,0.3,0,0,0.7,0], category: "noun" },
  { id: 28, token: "model", semanticVector: [0,0,0,0,0,0.9,0.3,0.7,0.2,0,0.5,0,0,0,0.8,0], category: "noun" },
  { id: 29, token: "predicts", semanticVector: [0.4,0.4,0,0,0,0.7,0.8,0.8,0.5,0,0.3,0,0.7,0.4,0.6,0], category: "verb" },
  { id: 30, token: "next", semanticVector: [0,0,0,0,0,0,0.4,0.3,0.4,0,0.3,0,0.5,0.95,0.2,0], category: "adjective" },
  { id: 31, token: "token", semanticVector: [0,0,0,0,0,0.9,0.2,0.6,0.6,0,0.2,0,0.9,0,0.6,0], category: "noun" },
  { id: 32, token: "def", semanticVector: [0,0,0,0,0,0.95,0.7,0.5,0.8,0,0,0,0.5,0,0.8,0], category: "code" },
  { id: 33, token: "fibonacci", semanticVector: [0,0,0,0,0,0.8,0.5,0.6,0.3,0,0.6,0,0,0,0.98,0], category: "code" },
  { id: 34, token: "(", semanticVector: [0,0,0,0,0,0.5,0,0,0.9,0,0,0,0,0,0,0.9], category: "syntax" },
  { id: 35, token: "n", semanticVector: [0,0,0,0,0,0.6,0,0.2,0.4,0,0.2,0,0,0,0.9,0], category: "code" },
  { id: 36, token: ")", semanticVector: [0,0,0,0,0,0.5,0,0,0.9,0,0,0,0,0,0,0.9], category: "syntax" },
  { id: 37, token: ":", semanticVector: [0,0,0,0,0,0.5,0,0,0.8,0,0,0,0,0,0,0.95], category: "syntax" },
  { id: 38, token: "if", semanticVector: [0,0,0,0,0,0.7,0.3,0.6,0.9,0.7,0,0,0.6,0,0.4,0], category: "code" },
  { id: 39, token: "<=", semanticVector: [0,0,0,0,0,0.6,0,0.3,0.8,0,0.3,0,0,0,0.85,0], category: "syntax" },
  { id: 40, token: "1", semanticVector: [0,0,0,0,0,0.2,0,0.1,0.2,0,0.1,0,0,0,0.95,0], category: "noun" },
  { id: 41, token: "return", semanticVector: [0,0,0,0,0,0.9,0.8,0.4,0.9,0,0,0,0.4,0.6,0.5,0], category: "code" },
  { id: 42, token: "beautiful", semanticVector: [0.3,0.4,0.2,0,0,0,0.2,0.5,0,0,0.6,0.95,0,0,0,0], category: "adjective" },
  { id: 43, token: "city", semanticVector: [0,0,0.3,0,0.8,0,0,0.2,0,0,0.7,0.4,0,0,0,0], category: "noun" },
  { id: 44, token: "Once", semanticVector: [0,0,0,0,0,0,0.1,0.4,0.5,0,0,0.2,0.6,0.9,0,0], category: "syntax" },
  { id: 45, token: "upon", semanticVector: [0,0,0,0,0,0,0.1,0.3,0.7,0,0,0,0.6,0.8,0,0], category: "syntax" },
  { id: 46, token: "a", semanticVector: [0,0,0,0,0,0,0,0,0.9,0,0,0,0.8,0,0,0], category: "syntax" },
  { id: 47, token: "time", semanticVector: [0,0,0,0,0,0,0.2,0.8,0.4,0,0.5,0,0.3,0.95,0.4,0], category: "noun" },
  { id: 48, token: ",", semanticVector: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.9], category: "punctuation" },
  { id: 49, token: "there", semanticVector: [0,0,0,0,0.4,0,0.2,0.3,0.7,0,0,0,0.6,0.3,0,0], category: "syntax" },
  { id: 50, token: "lived", semanticVector: [0.9,0.7,0.1,0,0.2,0,0.8,0.3,0.3,0,0.2,0.4,0,0.8,0,0], category: "verb" },
  { id: 51, token: "brave", semanticVector: [0.8,0.8,0.4,0.3,0,0,0.7,0.5,0,0,0.6,0.85,0,0,0,0], category: "adjective" },
  { id: 52, token: "knight", semanticVector: [0.95,0.95,0.6,0.8,0,0,0.7,0.2,0,0,0.6,0.5,0,0,0,0], category: "noun" },
  { id: 53, token: "in", semanticVector: [0,0,0,0,0.6,0,0,0.2,0.8,0,0,0,0.7,0.4,0,0], category: "syntax" },
  { id: 54, token: "castle", semanticVector: [0,0,0.8,0,0.6,0,0,0.3,0,0,0.8,0.4,0,0,0,0], category: "noun" },
  { id: 55, token: "AI", semanticVector: [0.2,0.1,0.2,0,0,0.98,0.5,0.9,0.2,0,0.8,0.3,0,0,0.9,0], category: "concept" },
  { id: 56, token: "learns", semanticVector: [0.8,0.8,0,0,0,0.8,0.8,0.95,0.3,0,0.5,0.4,0.4,0.5,0.7,0], category: "verb" },
  { id: 57, token: "patterns", semanticVector: [0,0,0,0,0,0.8,0.3,0.85,0.4,0,0.6,0.2,0.3,0,0.85,0], category: "noun" },
  { id: 58, token: "from", semanticVector: [0,0,0,0,0.4,0,0.2,0.3,0.8,0,0,0,0.7,0.5,0,0], category: "syntax" },
  { id: 59, token: "massive", semanticVector: [0,0,0,0,0,0,0,0.3,0.1,0,0.98,0.1,0,0,0.5,0], category: "adjective" },
  { id: 60, token: "data", semanticVector: [0,0,0,0,0,0.96,0.3,0.7,0.4,0,0.8,0,0.2,0,0.9,0], category: "noun" },
  { id: 61, token: "deep", semanticVector: [0,0,0,0,0,0.7,0.2,0.8,0,0,0.8,0.1,0,0,0.8,0], category: "adjective" },
  { id: 62, token: "learning", semanticVector: [0.5,0.5,0,0,0,0.95,0.6,0.95,0.2,0,0.7,0.3,0,0.3,0.9,0], category: "concept" },
  { id: 63, token: "weights", semanticVector: [0,0,0,0,0,0.9,0.3,0.7,0.4,0,0.5,0,0,0,0.92,0], category: "noun" },
  { id: 64, token: "softmax", semanticVector: [0,0,0,0,0,0.85,0.4,0.8,0.3,0,0.4,0,0,0,0.96,0], category: "concept" },
  { id: 65, token: "logits", semanticVector: [0,0,0,0,0,0.88,0.4,0.8,0.4,0,0.4,0,0,0,0.94,0], category: "concept" },
  { id: 66, token: "temperature", semanticVector: [0,0,0,0,0,0.8,0.4,0.75,0.3,0,0.5,0.2,0,0,0.9,0], category: "concept" },
  { id: 67, token: "and", semanticVector: [0,0,0,0,0,0,0,0,0.9,0,0,0,0.85,0,0,0], category: "syntax" },
  { id: 68, token: "generates", semanticVector: [0.3,0.2,0,0,0,0.85,0.9,0.8,0.5,0,0.6,0.4,0.4,0.6,0.6,0], category: "verb" },
  { id: 69, token: "human", semanticVector: [0.95,0.98,0.2,0,0,0.2,0.4,0.7,0,0,0.5,0.4,0.4,0,0.3,0], category: "noun" },
  { id: 70, token: "like", semanticVector: [0,0,0,0,0,0,0.3,0.6,0.7,0,0.3,0.5,0.5,0,0.2,0], category: "syntax" },
  { id: 71, token: "text", semanticVector: [0,0,0,0,0,0.7,0.2,0.6,0.5,0,0.4,0.1,0.95,0,0.4,0], category: "noun" },
  { id: 72, token: "accurately", semanticVector: [0,0,0,0,0,0.5,0.5,0.7,0,0,0.5,0.8,0.3,0,0.75,0], category: "adjective" },
  { id: 73, token: "calculates", semanticVector: [0.4,0.3,0,0,0,0.75,0.85,0.8,0.5,0,0.5,0.2,0.2,0,0.95,0], category: "verb" },
];

export const TOKEN_COLOR_PALETTE = [
  "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800",
  "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800",
  "bg-sky-100 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 border-sky-300 dark:border-sky-800",
  "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800",
  "bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800",
  "bg-violet-100 dark:bg-violet-950/60 text-violet-900 dark:text-violet-200 border-violet-300 dark:border-violet-800",
  "bg-teal-100 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 border-teal-300 dark:border-teal-800",
  "bg-orange-100 dark:bg-orange-950/60 text-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-800",
  "bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-900 dark:text-fuchsia-200 border-fuchsia-300 dark:border-fuchsia-800",
  "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800",
];

export const MODEL_PRESETS: import('../types.ts').ModelPreset[] = [
  {
    id: "factual-qa",
    name: "Factual Geographic Association",
    category: "Knowledge & Facts",
    prompt: "The capital of France is",
    description: "Demonstrates high attention between 'capital' and 'France', steering the LM head to predict 'Paris' with overwhelming probability (>90%).",
    expectedContinuation: "Paris ."
  },
  {
    id: "vector-analogy",
    name: "Semantic Vector Analogy",
    category: "Word Vectors",
    prompt: "king man woman queen",
    description: "Classic embedding space arithmetic: Vector(King) - Vector(Man) + Vector(Woman) ≈ Vector(Queen).",
    expectedContinuation: "throne ruler royal palace"
  },
  {
    id: "transformer-explainer",
    name: "Transformer Self-Attention",
    category: "AI Architecture",
    prompt: "The transformer attention model predicts next",
    description: "Shows how multi-head self-attention links 'transformer' with 'attention' and 'predicts', leading directly to 'token'.",
    expectedContinuation: "token from context ."
  },
  {
    id: "code-completion",
    name: "Python Code Induction",
    category: "Code Generation",
    prompt: "def fibonacci(n): if n <=",
    description: "Illustrates syntax-aware attention heads attending to parameter `n` and condition operators, predicting `1 return`.",
    expectedContinuation: "1 : return n"
  },
  {
    id: "creative-story",
    name: "Creative Narrative Flow",
    category: "Storytelling",
    prompt: "Once upon a time , there lived a brave knight in a",
    description: "Narrative context triggers medieval fantasy semantic representations, attending to 'brave knight' to predict 'castle' or 'kingdom'.",
    expectedContinuation: "castle near the forest ."
  }
];
