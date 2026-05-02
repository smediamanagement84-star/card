import type { CSSProperties, Key } from 'react';

const rounding = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
} as const;

type Rounded = keyof typeof rounding;

export default function Skeleton(props: {
  key?: Key | null;
  className?: string;
  rounded?: Rounded;
  style?: CSSProperties;
}) {
  const { className = '', rounded = 'lg', style } = props;
  return (
    <div
      className={`bg-white/[0.04] ${rounding[rounded]} animate-pulse ${className}`}
      aria-hidden="true"
      style={style}
    />
  );
}

export function SkeletonText(props: { lines?: number; className?: string }) {
  const { lines = 3, className = '' } = props;
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
