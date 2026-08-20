# LLM Architecture & Workflow Guide

A concise technical reference covering the end-to-end pipeline of how a Large Language Model (LLM) processes a prompt and generates the next token.

## Contents

- `llm_architecture_guide.pdf` — formatted reference document (tokenizer, embeddings, attention, FFN, softmax, glossary)

## Pipeline overview

```
[ Prompt ] -> Tokenizer -> Embeddings -> Self-Attention -> MLP/FFN -> Softmax -> [ Next Word ]
```

The model repeats this loop autoregressively, appending each predicted token back onto the input until a stop token is produced.

## Stages

| # | Stage | What it does |
|---|-------|---------------|
| 1 | **Tokenizer** | Splits raw text into subword units (BPE, WordPiece, SentencePiece) and maps them to token IDs. ~1 token ≈ 4 characters. |
| 2 | **Embeddings** | Looks up each token ID in a matrix to get a dense vector; adds positional encoding (sinusoidal or RoPE) so order is preserved. |
| 3 | **Self-Attention** | Computes Query/Key/Value per token; `softmax(QKᵀ/√d_k)·V` determines how much each token attends to every other token. Causal masking blocks future tokens; multiple heads specialize in different relationships. |
| 4 | **FFN / MLP** | Per-token feed-forward network acting as associative memory (expands dimension ~4x). Residual connections (`x_out = x_in + Sublayer(x_in)`) and layer norm keep deep stacks (12–128+ layers) trainable. |
| 5 | **Softmax / Sampling** | Projects the final hidden state back to vocabulary size (logits), applies softmax for probabilities, then samples using temperature and top-k/top-p filtering. |

## Key terms

- **Autoregressive loop** — generate one token, append it, repeat.
- **Cosine similarity** — angular closeness between vectors (1.0 = identical, 0.0 = orthogonal).
- **Logit** — raw unnormalized score before softmax.
- **Context window** — max tokens the model can attend to at once.
- **Hallucination** — a fluent but factually incorrect sampled token.

## Source

Content adapted and reformatted from the original *LLM Explorer & Visualizer* reference (Google AI Studio).
