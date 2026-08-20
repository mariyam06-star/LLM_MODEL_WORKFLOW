export interface TokenItem {
  id: number;
  text: string;
  bytes: number[];
  position: number;
  color: string;
}

export interface AttentionHeadData {
  id: number;
  name: string;
  description: string;
  focusType: 'causal' | 'syntactic' | 'semantic' | 'positional';
  matrix: number[][]; // [queryTokenIndex][keyTokenIndex] => weight (0 to 1)
}

export interface VectorSlice {
  dim: number;
  values: number[];
}

export interface TransformerLayerState {
  layerIndex: number;
  tokens: TokenItem[];
  embeddings: number[][]; // [tokenIndex][dim]
  positionalEncodings: number[][]; // [tokenIndex][dim]
  combinedEmbeddings: number[][]; // [tokenIndex][dim]
  qVectors: number[][][]; // [headIndex][tokenIndex][headDim]
  kVectors: number[][][]; // [headIndex][tokenIndex][headDim]
  vVectors: number[][][]; // [headIndex][tokenIndex][headDim]
  rawScores: number[][][]; // [headIndex][queryIndex][keyIndex]
  attentionHeads: AttentionHeadData[];
  multiHeadOutput: number[][]; // [tokenIndex][dim]
  postAttentionNorm: number[][]; // [tokenIndex][dim]
  ffnExpanded: number[][]; // [tokenIndex][ffnDim]
  ffnOutput: number[][]; // [tokenIndex][dim]
  postFfnNorm: number[][]; // [tokenIndex][dim]
}

export interface CandidateToken {
  token: string;
  tokenId: number;
  rawLogit: number;
  scaledLogit: number;
  probability: number;
  cumulativeProb: number;
  isTopK: boolean;
  isTopP: boolean;
  selected?: boolean;
}

export interface SamplingConfig {
  temperature: number; // 0.1 to 2.0
  topK: number; // 1 to 50
  topP: number; // 0.1 to 1.0
  repetitionPenalty: number;
}

export interface ModelPreset {
  id: string;
  name: string;
  category: string;
  prompt: string;
  description: string;
  expectedContinuation?: string;
}

export type VisualizerMode = 
  | 'pipeline' 
  | 'sandbox' 
  | 'attention' 
  | 'embeddings' 
  | 'ai-introspection';

export type PipelineStage = 
  | 'tokenization' 
  | 'embeddings' 
  | 'attention' 
  | 'mlp' 
  | 'lm-head' 
  | 'sampling';
