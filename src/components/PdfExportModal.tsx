import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { 
  FileText, 
  Download, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Compass, 
  Eye, 
  Cpu, 
  Trophy,
  BookOpen
} from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  currentPrompt,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > 275) {
          doc.addPage();
          y = 20;
          // Add header on new page
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text('LLM Explorer & Transformer Architecture Guide', margin, 10);
          doc.line(margin, 12, pageWidth - margin, 12);
        }
      };

      // Header Banner (Navy/Indigo)
      doc.setFillColor(30, 41, 59); // Slate 800
      doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('Large Language Model (LLM) & Transformer Guide', margin + 6, y + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text('Complete Architecture Workflow, Concepts & Technical Reference', margin + 6, y + 18);
      y += 34;

      // Section 1: Executive Summary & Workflow Overview
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('1. The Complete End-to-End LLM Pipeline', margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const overviewText = 
        'When an LLM receives an input prompt, it processes the text through a 5-stage feed-forward ' +
        'neural architecture to compute probability logits and autoregressively predict the next token:';
      const splitOverview = doc.splitTextToSize(overviewText, contentWidth);
      doc.text(splitOverview, margin, y);
      y += splitOverview.length * 4.5 + 4;

      // Pipeline Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229);
      doc.text('[ Prompt ] -> 1. Tokenizer -> 2. Embeddings -> 3. Self-Attention -> 4. MLP / FFN -> 5. Softmax -> [ Next Word ]', margin + 4, y + 11);
      y += 26;

      // Section 2: Deep Dive into Each Stage
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('2. Stage-by-Stage Architectural Breakdown', margin, y);
      y += 7;

      const stages = [
        {
          num: 'Stage 1: 🧩 The Tokenizer (Subword Splitting & Vocabulary)',
          bullets: [
            'Function: Converts raw strings into discrete numerical identifiers (Token IDs) from a fixed dictionary (vocabulary).',
            'Algorithms: Byte-Pair Encoding (BPE), WordPiece, or SentencePiece iteratively merge frequent character pairs.',
            'Rule of Thumb: 1 token ≈ 4 English characters (or ~0.75 words). Complex or rare words split into subwords.',
          ],
        },
        {
          num: 'Stage 2: 🧭 Vector Embeddings & Positional Encodings',
          bullets: [
            'Continuous Coordinates: Each token ID is looked up in an embedding matrix W_e to yield a dense semantic vector.',
            'Geometric Meaning: Words sharing concepts cluster closely in high-dimensional space (measured via Cosine Similarity).',
            'Word Vector Arithmetic: Classic semantic property: Vector("King") - Vector("Man") + Vector("Woman") ≈ Vector("Queen").',
            'Positional Encodings: Injects sequence order using Sinusoidal functions or Rotary Position Embeddings (RoPE).',
          ],
        },
        {
          num: 'Stage 3: 💡 Multi-Head Self-Attention (Relational Context)',
          bullets: [
            'Core Formula: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V',
            'Query (Q), Key (K), Value (V): Vectors computed per token to score relevance across all other words in the sequence.',
            'Causal Masking: Prevents tokens from looking into future positions (upper-triangular -infinity mask).',
            'Multi-Head Specialization: Multiple parallel attention heads focus on syntax, grammar, pronoun reference, and factual links.',
          ],
        },
        {
          num: 'Stage 4: 🧠 Feed-Forward Networks (FFN / MLP) & Residual Stream',
          bullets: [
            'Knowledge Retrieval: Acts as key-value associative memory, expanding vector dimension by 4x to evaluate factual memory.',
            'Residual Skip Connections: x_out = x_in + Sublayer(x_in) prevents vanishing gradients across deep layer stacks (12-128+ layers).',
            'Layer Normalization: RMSNorm / LayerNorm stabilizes internal activations across network depth.',
          ],
        },
        {
          num: 'Stage 5: 🏆 The LM Head, Logits & Sampling (Softmax)',
          bullets: [
            'Unembedding Matrix (W_u): Projects final hidden state vector back to vocabulary size to produce unnormalized Logits (z).',
            'Softmax Probability: P(token_i) = exp(z_i / T) / sum(exp(z_j / T)) yielding a normalized 0-100% distribution.',
            'Temperature (T): Controls randomness. Low T (0.1-0.3) is deterministic; Balanced T (0.7) is fluent; High T (1.0+) is creative.',
            'Top-K & Top-P (Nucleus) Sampling: Filters the candidate pool to either top K words or smallest set summing to probability P.',
          ],
        },
      ];

      stages.forEach((stg) => {
        checkPageBreak(38);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(stg.num, margin, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);

        stg.bullets.forEach((b) => {
          checkPageBreak(12);
          const splitBullet = doc.splitTextToSize(`• ${b}`, contentWidth - 4);
          doc.text(splitBullet, margin + 4, y);
          y += splitBullet.length * 4.2;
        });
        y += 3;
      });

      // Section 3: Glossary of Key Terms
      checkPageBreak(50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('3. Key Terminology Reference Table', margin, y);
      y += 6;

      const glossary = [
        { term: 'Autoregressive Loop', def: 'Generating text one word at a time, appending it to prompt, and repeating until stop token.' },
        { term: 'Cosine Similarity', def: 'Dot product of normalized vectors measuring angular closeness (1.0 = identical, 0.0 = orthogonal).' },
        { term: 'Logit', def: 'The raw, unnormalized score for each word before the Softmax function turns it into a percentage.' },
        { term: 'Context Window', def: 'The maximum token sequence length (e.g. 8k, 32k, 1M+ tokens) the model can hold in active attention.' },
        { term: 'Hallucination', def: 'When probability sampling picks a plausible-sounding token that is factually inaccurate.' },
      ];

      glossary.forEach((item) => {
        checkPageBreak(14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(79, 70, 229);
        doc.text(`• ${item.term}:`, margin, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const splitDef = doc.splitTextToSize(item.def, contentWidth - 40);
        doc.text(splitDef, margin + 38, y);
        y += Math.max(5, splitDef.length * 4.2);
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`LLM Explorer & Visualizer • Page ${i} of ${totalPages}`, margin, 290);
        doc.text('Generated via Google AI Studio LLM Explorer', pageWidth - margin - 60, 290);
      }

      // Save & Download PDF
      doc.save('LLM-Architecture-and-Workflow-Guide.pdf');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Download PDF Guide
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Full LLM Architecture & Workflow Technical Document
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF Contents Preview Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[10px]">
            📄 Document Contents (Ready for instant download):
          </span>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span><strong>1. End-to-End Pipeline</strong>: Tokenization → Embeddings → Attention → MLP → Softmax</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span><strong>2. Detailed Explanations</strong>: Q, K, V attention formulas, word vector math, temperature sampling</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span><strong>3. Key Terminology Table</strong>: Logits, Autoregressive loop, Cosine similarity, Context window</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Generating PDF...' : 'Download PDF Guide'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
