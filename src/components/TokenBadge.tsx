import React from 'react';
import { TokenItem } from '../types.ts';
import { motion } from 'motion/react';

interface TokenBadgeProps {
  token: TokenItem;
  isActive?: boolean;
  isFocused?: boolean;
  onClick?: () => void;
  showId?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TokenBadge: React.FC<TokenBadgeProps> = ({
  token,
  isActive = false,
  isFocused = false,
  onClick,
  showId = true,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2',
  };

  const idSizeClasses = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`inline-flex items-center font-mono font-medium rounded-xl border transition-all cursor-pointer select-none ${
        sizeClasses[size]
      } ${
        isActive
          ? 'ring-2 ring-indigo-500 shadow-md shadow-indigo-500/20 bg-indigo-500 text-white border-indigo-400'
          : isFocused
          ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-400 shadow-sm'
          : token.color
      }`}
    >
      <span className="font-semibold">{token.text === ' ' ? '␣' : token.text}</span>
      {showId && (
        <span
          className={`opacity-70 font-sans font-normal px-1 rounded bg-black/10 dark:bg-white/15 ${idSizeClasses[size]}`}
        >
          #{token.id}
        </span>
      )}
    </motion.div>
  );
};
