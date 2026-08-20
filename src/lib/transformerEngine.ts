import { TokenItem, TransformerLayerState, AttentionHeadData, CandidateToken, SamplingConfig } from '../types.ts';
import { VOCABULARY_LIST, TOKEN_COLOR_PALETTE, VocabEntry } from './vocabulary.ts';

// Deterministic hash to pick colors
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Tokenize text into subwords / tokens with real UTF-8 bytes and positions
export function tokenizeText(input: string): TokenItem[] {
  if (!input || input.trim() === '') {
    return [];
  }

  // Tokenize regex preserving punctuation and whitespace tokens
  const rawTokens = input.match(/\w+|[^\w\s]|\s+/g) || [input];
  const items: TokenItem[] = [];

  let pos = 0;
  for (const raw of rawTokens) {
    if (raw.trim() === '' && raw.length > 0 && items.length > 0) {
      // White space attached or skip if consecutive whitespace
      continue;
    }
    const cleanToken = raw.trim();
    if (!cleanToken) continue;

    // Find in vocab or generate deterministic id
    const found = VOCABULARY_LIST.find(
      v => v.token.toLowerCase() === cleanToken.toLowerCase()
    );
    const id = found ? found.id : 100 + hashString(cleanToken) % 800;

    // UTF-8 byte representation
    const encoder = new TextEncoder();
    const bytes = Array.from(encoder.encode(cleanToken));

    const colorIdx = hashString(cleanToken) % TOKEN_COLOR_PALETTE.length;

    items.push({
      id,
      text: cleanToken,
      bytes,
      position: pos++,
      color: TOKEN_COLOR_PALETTE[colorIdx],
    });
  }

  return items;
}

// Lookup or create high-dimensional semantic embedding vector (16-dim normalized)
export function getSemanticEmbedding(tokenText: string, dim: number = 16): number[] {
  const found = VOCABULARY_LIST.find(
    v => v.token.toLowerCase() === tokenText.toLowerCase()
  );
  if (found && found.semanticVector.length === dim) {
    return [...found.semanticVector];
  }

  // Deterministic pseudo-embedding for unknown words based on char codes
  const vec: number[] = [];
  const hash = hashString(tokenText);
  let normSq = 0;
  for (let i = 0; i < dim; i++) {
    const val = Math.sin(hash * 0.13 + i * 1.618);
    vec.push(val);
    normSq += val * val;
  }
  const norm = Math.sqrt(normSq) || 1;
  return vec.map(v => Math.round((v / norm) * 1000) / 1000);
}

// Sinusoidal Positional Encoding: PE(pos, 2i) = sin(pos / 10000^(2i/d)), PE(pos, 2i+1) = cos(pos / 10000^(2i/d))
export function getSinusoidalPositionalEncoding(pos: number, dim: number = 16): number[] {
  const pe: number[] = [];
  for (let i = 0; i < dim; i++) {
    const denominator = Math.pow(10000, (2 * Math.floor(i / 2)) / dim);
    if (i % 2 === 0) {
      pe.push(Math.round(Math.sin(pos / denominator) * 1000) / 1000);
    } else {
      pe.push(Math.round(Math.cos(pos / denominator) * 1000) / 1000);
    }
  }
  return pe;
}

// Rotary Positional Encoding (RoPE) frequencies
export function getRoPEFrequencies(pos: number, dim: number = 16) {
  const cos: number[] = [];
  const sin: number[] = [];
  for (let i = 0; i < dim / 2; i++) {
    const theta = 1 / Math.pow(10000, (2 * i) / dim);
    const angle = pos * theta;
    cos.push(Math.cos(angle));
    sin.push(Math.sin(angle));
  }
  return { cos, sin };
}

// Cosine Similarity between two arbitrary vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Vector Arithmetic: A - B + C
export function computeVectorAnalogy(
  wordA: string,
  wordB: string,
  wordC: string
): { targetVector: number[]; topMatches: { token: string; similarity: number }[] } {
  const vecA = getSemanticEmbedding(wordA);
  const vecB = getSemanticEmbedding(wordB);
  const vecC = getSemanticEmbedding(wordC);

  const targetVector: number[] = [];
  for (let i = 0; i < vecA.length; i++) {
    targetVector.push(vecA[i] - vecB[i] + vecC[i]);
  }

  // Normalize target
  let normSq = 0;
  for (const v of targetVector) normSq += v * v;
  const norm = Math.sqrt(normSq) || 1;
  const normalizedTarget = targetVector.map(v => v / norm);

  // Compare with all words in vocabulary
  const scored = VOCABULARY_LIST.filter(
    v => !["<pad>", "<bos>", "<eos>", wordA.toLowerCase(), wordB.toLowerCase(), wordC.toLowerCase()].includes(v.token.toLowerCase())
  ).map(v => ({
    token: v.token,
    similarity: Math.round(cosineSimilarity(normalizedTarget, v.semanticVector) * 1000) / 1000,
  }));

  scored.sort((a, b) => b.similarity - a.similarity);

  return {
    targetVector: normalizedTarget,
    topMatches: scored.slice(0, 5),
  };
}

// Full Transformer Forward Pass Calculation
export function runTransformerForwardPass(tokens: TokenItem[], dim: number = 16): TransformerLayerState {
  const numTokens = tokens.length;
  const numHeads = 4;
  const headDim = dim / numHeads; // 16 / 4 = 4

  // 1. Embeddings & Positional Encodings
  const embeddings: number[][] = [];
  const positionalEncodings: number[][] = [];
  const combinedEmbeddings: number[][] = [];

  for (let i = 0; i < numTokens; i++) {
    const emb = getSemanticEmbedding(tokens[i].text, dim);
    const posEnc = getSinusoidalPositionalEncoding(tokens[i].position, dim);
    const combined: number[] = [];
    for (let d = 0; d < dim; d++) {
      combined.push(Math.round((emb[d] + posEnc[d]) * 1000) / 1000);
    }
    embeddings.push(emb);
    positionalEncodings.push(posEnc);
    combinedEmbeddings.push(combined);
  }

  // 2. Linear Projections for Multi-Head Attention Q, K, V
  // 4 Heads:
  // Head 0: Causal Preceding Attention (looks back at immediate context)
  // Head 1: Semantic Association Attention (connects related entities, e.g. France <-> capital)
  // Head 2: Syntactic Dependency Attention (links verbs, operators, punctuation)
  // Head 3: Global Anchor Attention (attends to start token / main subject)
  const qVectors: number[][][] = []; // [head][token][headDim]
  const kVectors: number[][][] = [];
  const vVectors: number[][][] = [];
  const rawScores: number[][][] = []; // [head][query][key]
  const attentionHeads: AttentionHeadData[] = [
    {
      id: 0,
      name: "Head 1: Causal & Immediate Prior",
      description: "Focuses attention strongly on the immediately preceding 1-2 tokens in the sequence.",
      focusType: "causal",
      matrix: [],
    },
    {
      id: 1,
      name: "Head 2: Semantic Association",
      description: "Computes cosine dot-products between deep semantic vectors (e.g. 'France' connects to 'capital').",
      focusType: "semantic",
      matrix: [],
    },
    {
      id: 2,
      name: "Head 3: Syntactic & Structural",
      description: "Identifies grammatical roles, verb-object links, and code syntax markers.",
      focusType: "syntactic",
      matrix: [],
    },
    {
      id: 3,
      name: "Head 4: Global Context Anchor",
      description: "Maintains high attention weights to the beginning of the prompt/primary subject.",
      focusType: "positional",
      matrix: [],
    },
  ];

  for (let h = 0; h < numHeads; h++) {
    qVectors[h] = [];
    kVectors[h] = [];
    vVectors[h] = [];
    rawScores[h] = [];

    const headMatrix: number[][] = [];

    // Construct Head Q, K, V
    for (let i = 0; i < numTokens; i++) {
      const qH: number[] = [];
      const kH: number[] = [];
      const vH: number[] = [];
      for (let hd = 0; hd < headDim; hd++) {
        const base = combinedEmbeddings[i][h * headDim + hd];
        qH.push(Math.round((base * (1 + 0.1 * (h + 1))) * 1000) / 1000);
        kH.push(Math.round((base * (1 - 0.05 * (h + 1))) * 1000) / 1000);
        vH.push(Math.round(base * 1000) / 1000);
      }
      qVectors[h].push(qH);
      kVectors[h].push(kH);
      vVectors[h].push(vH);
    }

    // Compute Scaled Dot Product Attention with Causal Mask
    for (let i = 0; i < numTokens; i++) {
      const rowScores: number[] = [];
      const rowWeights: number[] = [];

      for (let j = 0; j < numTokens; j++) {
        if (j > i) {
          // Autoregressive causal mask: future tokens cannot be seen
          rowScores.push(-Infinity);
          rowWeights.push(0);
        } else {
          // Calculate dot product (Q_i . K_j) / sqrt(d_k)
          let dot = 0;
          for (let hd = 0; hd < headDim; hd++) {
            dot += qVectors[h][i][hd] * kVectors[h][j][hd];
          }
          let scaled = dot / Math.sqrt(headDim);

          // Head-specific architectural biases:
          if (h === 0) {
            // Head 0: Strongly weight immediate prior token
            if (j === i) scaled += 1.5;
            else if (j === i - 1) scaled += 2.8;
            else scaled += 0.2;
          } else if (h === 1) {
            // Head 1: Semantic similarity
            const sim = cosineSimilarity(embeddings[i], embeddings[j]);
            scaled += sim * 3.5;
          } else if (h === 2) {
            // Head 2: Syntactic linking (e.g., 'is' attends to noun, 'capital' attends to 'of')
            const textI = tokens[i].text.toLowerCase();
            const textJ = tokens[j].text.toLowerCase();
            if ((textI === "is" && (textJ === "capital" || textJ === "france")) ||
                (textI === "france" && textJ === "capital") ||
                (textI === "token" && textJ === "model") ||
                (textI === "<=" && textJ === "n")) {
              scaled += 3.2;
            } else {
              scaled += (i - j === 1 ? 1.0 : 0.4);
            }
          } else if (h === 3) {
            // Head 3: Global Anchor (token 0 gets attention)
            if (j === 0) scaled += 2.2;
            if (j === i) scaled += 1.2;
          }

          rowScores.push(Math.round(scaled * 100) / 100);
        }
      }

      // Softmax over non-masked scores (j <= i)
      const validScores = rowScores.filter(s => s !== -Infinity);
      const maxScore = Math.max(...validScores);
      const expScores = rowScores.map(s => (s === -Infinity ? 0 : Math.exp(s - maxScore)));
      const sumExp = expScores.reduce((acc, v) => acc + v, 0);

      for (let j = 0; j < numTokens; j++) {
        if (j > i) {
          rowWeights.push(0);
        } else {
          rowWeights.push(Math.round((expScores[j] / sumExp) * 1000) / 1000);
        }
      }

      rawScores[h].push(rowScores);
      headMatrix.push(rowWeights);
    }

    attentionHeads[h].matrix = headMatrix;
  }

  // 3. Multi-Head Output & LayerNorm
  const multiHeadOutput: number[][] = [];
  const postAttentionNorm: number[][] = [];

  for (let i = 0; i < numTokens; i++) {
    const concatHeadVals: number[] = [];
    for (let h = 0; h < numHeads; h++) {
      const headZ: number[] = new Array(headDim).fill(0);
      for (let j = 0; j <= i; j++) {
        const weight = attentionHeads[h].matrix[i][j];
        for (let hd = 0; hd < headDim; hd++) {
          headZ[hd] += weight * vVectors[h][j][hd];
        }
      }
      concatHeadVals.push(...headZ);
    }

    // Residual Add: X + Attention(X)
    const residualAdd: number[] = [];
    for (let d = 0; d < dim; d++) {
      residualAdd.push(combinedEmbeddings[i][d] + concatHeadVals[d]);
    }
    multiHeadOutput.push(residualAdd);

    // LayerNorm: (x - mean) / sqrt(var + eps)
    const mean = residualAdd.reduce((a, b) => a + b, 0) / dim;
    const variance = residualAdd.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dim;
    const std = Math.sqrt(variance + 1e-5);
    const norm = residualAdd.map(v => Math.round(((v - mean) / std) * 1000) / 1000);
    postAttentionNorm.push(norm);
  }

  // 4. MLP / Feed-Forward Network (FFN)
  // Expansion ratio = 4 (16 -> 64 -> 16) with GeLU activation
  const ffnExpanded: number[][] = [];
  const ffnOutput: number[][] = [];
  const postFfnNorm: number[][] = [];
  const ffnDim = dim * 4; // 64

  for (let i = 0; i < numTokens; i++) {
    const inputVec = postAttentionNorm[i];
    const hidden: number[] = [];

    // First Linear Layer + GELU: x * 0.5 * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))
    for (let f = 0; f < ffnDim; f++) {
      const sum = inputVec[f % dim] * 1.25 + Math.sin(f * 0.3);
      // GeLU approximation
      const gelu = 0.5 * sum * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (sum + 0.044715 * Math.pow(sum, 3))));
      hidden.push(Math.round(gelu * 1000) / 1000);
    }
    ffnExpanded.push(hidden);

    // Second Linear Layer (Project down to dim) + Residual Add
    const downProjected: number[] = [];
    for (let d = 0; d < dim; d++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += hidden[d * 4 + k] * 0.35;
      }
      // Residual Add: X_norm + FFN(X_norm)
      downProjected.push(inputVec[d] + sum);
    }
    ffnOutput.push(downProjected);

    // Final LayerNorm
    const mean = downProjected.reduce((a, b) => a + b, 0) / dim;
    const variance = downProjected.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dim;
    const std = Math.sqrt(variance + 1e-5);
    const norm = downProjected.map(v => Math.round(((v - mean) / std) * 1000) / 1000);
    postFfnNorm.push(norm);
  }

  return {
    layerIndex: 0,
    tokens,
    embeddings,
    positionalEncodings,
    combinedEmbeddings,
    qVectors,
    kVectors,
    vVectors,
    rawScores,
    attentionHeads,
    multiHeadOutput,
    postAttentionNorm,
    ffnExpanded,
    ffnOutput,
    postFfnNorm,
  };
}

// Compute Logits and Next Token Probabilities from final hidden state
export function computeNextTokenLogits(
  tokens: TokenItem[],
  finalHiddenState: number[],
  config: SamplingConfig
): CandidateToken[] {
  if (tokens.length === 0) return [];

  const lastToken = tokens[tokens.length - 1].text.toLowerCase();
  const allTokensText = tokens.map(t => t.text.toLowerCase());

  // Check key contextual indicators
  const hasCapital = allTokensText.includes("capital");
  const hasFrance = allTokensText.includes("france");
  const hasItaly = allTokensText.includes("italy");
  const hasGermany = allTokensText.includes("germany");
  const hasTransformer = allTokensText.includes("transformer");
  const hasAttention = allTokensText.includes("attention");
  const hasDef = allTokensText.includes("def");
  const hasStory = allTokensText.includes("once") || allTokensText.includes("lived") || allTokensText.includes("knight");

  const candidates: { token: string; tokenId: number; rawLogit: number }[] = [];

  for (const vocab of VOCABULARY_LIST) {
    if (["<pad>", "<bos>"].includes(vocab.token)) continue;

    // Base dot product between final hidden state and vocabulary embedding
    let logit = cosineSimilarity(finalHiddenState, vocab.semanticVector) * 4.0;

    const tok = vocab.token.toLowerCase();

    // Contextual boosting simulating trained LLM weights:
    if (hasCapital && hasFrance && lastToken === "is") {
      if (tok === "paris") logit += 8.5;
      else if (tok === "a") logit += 3.2;
      else if (tok === "the") logit += 2.8;
      else if (tok === "beautiful") logit += 2.1;
      else if (tok === "city") logit += 1.8;
    } else if (hasCapital && hasItaly && lastToken === "is") {
      if (tok === "rome") logit += 8.5;
      else if (tok === "a") logit += 3.0;
    } else if (hasCapital && hasGermany && lastToken === "is") {
      if (tok === "berlin") logit += 8.5;
    } else if (hasTransformer && (lastToken === "next" || lastToken === "predicts")) {
      if (tok === "token") logit += 7.8;
      else if (tok === "word") logit += 5.2;
      else if (tok === "patterns") logit += 4.5;
      else if (tok === "data") logit += 3.9;
    } else if (hasDef && lastToken === "<=") {
      if (tok === "1") logit += 8.2;
      else if (tok === "0") logit += 5.4;
      else if (tok === "return") logit += 3.1;
    } else if (lastToken === "1" && allTokensText.includes("<=")) {
      if (tok === ":") logit += 8.9;
      else if (tok === "return") logit += 6.5;
    } else if (lastToken === ":" && allTokensText.includes("return")) {
      if (tok === "return") logit += 8.5;
      else if (tok === "n") logit += 6.0;
    } else if (hasStory && lastToken === "a") {
      if (tok === "castle") logit += 6.8;
      else if (tok === "kingdom") logit += 5.9;
      else if (tok === "brave") logit += 4.5;
      else if (tok === "beautiful") logit += 4.0;
    } else if (lastToken === "is" || lastToken === "are") {
      if (vocab.category === "noun" || vocab.category === "adjective" || vocab.category === "syntax") {
        logit += 1.5;
      }
    }

    // Repetition penalty
    if (allTokensText.includes(tok)) {
      logit -= config.repetitionPenalty * 1.2;
    }

    // Grammar coherence (avoid invalid punctuation sequences)
    if ([".", ",", ")", ":"].includes(tok) && [".", ",", "(", ":"].includes(lastToken)) {
      logit -= 6.0;
    }

    candidates.push({
      token: vocab.token,
      tokenId: vocab.id,
      rawLogit: Math.round(logit * 100) / 100,
    });
  }

  // Sort by raw logit
  candidates.sort((a, b) => b.rawLogit - a.rawLogit);

  // Take top 25 for inspection
  const topSlice = candidates.slice(0, 25);

  // Apply Temperature scaling: z_i / T
  const temp = Math.max(0.01, config.temperature);
  const scaledLogits = topSlice.map(c => c.rawLogit / temp);

  // Softmax: e^(z_i) / sum(e^(z_j))
  const maxScaled = Math.max(...scaledLogits);
  const expValues = scaledLogits.map(s => Math.exp(s - maxScaled));
  const sumExp = expValues.reduce((a, b) => a + b, 0);
  const rawProbs = expValues.map(e => e / sumExp);

  // Compute Top-K and Top-P
  let cumulative = 0;
  const result: CandidateToken[] = [];

  for (let i = 0; i < topSlice.length; i++) {
    cumulative += rawProbs[i];
    const isTopK = i < config.topK;
    const isTopP = cumulative <= config.topP || (i > 0 && result[i - 1].cumulativeProb < config.topP);

    result.push({
      token: topSlice[i].token,
      tokenId: topSlice[i].tokenId,
      rawLogit: topSlice[i].rawLogit,
      scaledLogit: Math.round(scaledLogits[i] * 100) / 100,
      probability: Math.round(rawProbs[i] * 1000) / 1000,
      cumulativeProb: Math.round(cumulative * 1000) / 1000,
      isTopK,
      isTopP,
    });
  }

  return result;
}

// Sample a token based on candidate distribution and sampling config
export function sampleNextToken(
  candidates: CandidateToken[],
  config: SamplingConfig
): CandidateToken {
  if (candidates.length === 0) {
    return {
      token: ".",
      tokenId: 10,
      rawLogit: 0,
      scaledLogit: 0,
      probability: 1,
      cumulativeProb: 1,
      isTopK: true,
      isTopP: true,
    };
  }

  // Filter candidates matching both top-k and top-p criteria
  const eligible = candidates.filter(c => c.isTopK && c.isTopP);
  const pool = eligible.length > 0 ? eligible : [candidates[0]];

  // If temperature is very low (< 0.15), greedy pick top candidate
  if (config.temperature < 0.15) {
    return { ...pool[0], selected: true };
  }

  // Re-normalize probabilities within the filtered pool
  const poolSum = pool.reduce((acc, c) => acc + c.probability, 0) || 1;
  const randomVal = Math.random() * poolSum;

  let runningSum = 0;
  for (const cand of pool) {
    runningSum += cand.probability;
    if (randomVal <= runningSum) {
      return { ...cand, selected: true };
    }
  }

  return { ...pool[0], selected: true };
}
