/**
 * Operator details for the legal pages.
 *
 * These bracketed values are intentionally obvious. Replace them before you
 * publish: a privacy notice with the wrong controller identity is worse than
 * no notice at all. `LEGAL_CHECKLIST.md` lists what must be filled in.
 */
export const LEGAL = {
  product: 'ShiftedMind Tone Lab',
  operatorName: '[Operator legal name]',
  operatorAddress: '[Registered address]',
  contactEmail: '[privacy contact email]',
  jurisdiction: '[Governing law and courts]',
  hostingProvider: '[Hosting provider]',
  effectiveDate: '17 October 2026',
  version: '1.0',
  minimumAge: 16,
  /** True while bracketed placeholders remain. Surfaces a draft notice on legal pages. */
  placeholders: true,
} as const;

/** Bump when the microphone notice changes: users are asked to acknowledge it again. */
export const MIC_NOTICE_VERSION = '2026-10-17';

export const LEGAL_ROUTES = {
  privacy: '#/privacy',
  terms: '#/terms',
  accessibility: '#/accessibility',
  data: '#/data',
} as const;
