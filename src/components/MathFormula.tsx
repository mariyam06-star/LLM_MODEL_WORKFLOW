import React from 'react';
import { Info } from 'lucide-react';

interface MathFormulaProps {
  title: string;
  formula: string;
  description: string;
  dimensions?: { symbol: string; meaning: string }[];
  highlight?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  title,
  formula,
  description,
  dimensions,
  highlight,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </h4>
        {highlight && (
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {highlight}
          </span>
        )}
      </div>

      {/* Formula Display */}
      <div className="my-2 p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-sm sm:text-base text-slate-900 dark:text-slate-100 overflow-x-auto text-center font-bold tracking-tight">
        {formula}
      </div>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
        {description}
      </p>

      {dimensions && dimensions.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
          {dimensions.map((d, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{d.symbol}:</span>
              <span className="font-sans">{d.meaning}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
