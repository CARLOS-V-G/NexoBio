'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { detectPlatform, getPlatformIconUrl, getPlatformColor } from '@/lib/platforms';

interface PlatformIconProps {
  url: string;
  size?: number;
  className?: string;
  showFallback?: boolean;
}

export function PlatformIcon({ url, size = 20, className = '', showFallback = true }: PlatformIconProps) {
  const [failed, setFailed] = useState(false);
  const platform = detectPlatform(url);

  if (!platform || failed) {
    if (!showFallback) return null;
    return <ExternalLink className={className} style={{ width: size, height: size }} />;
  }

  return (
    <img
      src={getPlatformIconUrl(platform)}
      alt={platform.name}
      width={size}
      height={size}
      className={className}
      onError={() => setFailed(true)}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}

interface PlatformBadgeProps {
  url: string;
  className?: string;
}

export function PlatformBadge({ url, className = '' }: PlatformBadgeProps) {
  const platform = detectPlatform(url);

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg ${className}`}
      style={{
        background: platform ? `#${platform.bgColor ?? platform.color}20` : 'rgba(255,255,255,0.05)',
        color: platform ? `#${platform.bgColor ?? platform.color}` : '#9ca3af',
        border: `1px solid ${platform ? `#${platform.bgColor ?? platform.color}30` : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      <PlatformIcon url={url} size={12} showFallback />
      <span>{platform?.name ?? 'Link'}</span>
    </div>
  );
}

export function usePlatform(url: string) {
  const platform = url ? detectPlatform(url) : null;
  return {
    platform,
    color: platform ? getPlatformColor(platform) : '#ec4899',
    name: platform?.name ?? '',
    hasIcon: !!platform,
  };
}
