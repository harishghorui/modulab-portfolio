import React from 'react';
import { getDeviconSvgUrl, getDeviconFallbackUrl } from '@/lib/devicon';
import { cn } from '@/lib/utils';

export interface DeviconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  icon: string;
  alt?: string;
  className?: string;
}

export function Devicon({
  icon,
  alt = 'Technology icon',
  className,
  loading = 'lazy',
  decoding = 'async',
  ...props
}: DeviconProps) {
  const src = getDeviconSvgUrl(icon);
  if (!src) return null;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.dataset.triedFallback !== 'true') {
      target.dataset.triedFallback = 'true';
      const fallback = getDeviconFallbackUrl(icon);
      if (fallback && fallback !== target.src) {
        target.src = fallback;
        return;
      }
    }
    target.style.display = 'none';
  };

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={cn('inline-block select-none', className)}
      onError={handleError}
      {...props}
    />
  );
}
