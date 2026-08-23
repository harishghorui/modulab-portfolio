export const DEVICON_VERSION = 'v2.17.0';

export const DEVICON_SUFFIXES = [
  'original-wordmark',
  'plain-wordmark',
  'line-wordmark',
  'original',
  'plain',
  'line',
] as const;

export type DeviconSuffix = (typeof DEVICON_SUFFIXES)[number];

export interface ParsedDevicon {
  name: string;
  version: string;
}

/**
 * Deterministically parses stored Devicon class names (e.g. 'devicon-react-original colored')
 * into the technology slug name and version variant.
 */
export function parseDevicon(iconClass: string): ParsedDevicon | null {
  if (!iconClass || typeof iconClass !== 'string') return null;

  // 1. Remove 'colored' flag and extraneous whitespace
  const clean = iconClass.replace(/\s+colored/gi, '').trim();
  if (!clean) return null;

  // Direct URLs or relative paths (e.g. custom user images)
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('/')) {
    return { name: 'custom', version: clean };
  }

  // 2. Strip leading 'devicon-' prefix
  const body = clean.startsWith('devicon-') ? clean.slice(8) : clean;

  // 3. Match against known Devicon version suffixes
  for (const suffix of DEVICON_SUFFIXES) {
    if (body.endsWith(`-${suffix}`)) {
      const name = body.slice(0, -(suffix.length + 1));
      return { name, version: suffix };
    }
  }

  // Fallback: If no known suffix matched, treat whole body as name with 'original'
  return { name: body, version: 'original' };
}

/**
 * Returns the primary pinned CDN SVG URL for a given Devicon identifier.
 */
export function getDeviconSvgUrl(iconClass: string): string | null {
  const parsed = parseDevicon(iconClass);
  if (!parsed) return null;

  if (parsed.name === 'custom') {
    return parsed.version;
  }

  return `https://cdn.jsdelivr.net/gh/devicons/devicon@${DEVICON_VERSION}/icons/${parsed.name}/${parsed.name}-${parsed.version}.svg`;
}

/**
 * Returns a fallback SVG URL if an icon variant (e.g. an alias version) does not exist directly.
 */
export function getDeviconFallbackUrl(iconClass: string): string | null {
  const parsed = parseDevicon(iconClass);
  if (!parsed || parsed.name === 'custom') return null;

  // If the requested version was not 'original', try 'original'
  if (parsed.version !== 'original') {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@${DEVICON_VERSION}/icons/${parsed.name}/${parsed.name}-original.svg`;
  }

  // If 'original' failed, try 'plain'
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@${DEVICON_VERSION}/icons/${parsed.name}/${parsed.name}-plain.svg`;
}
