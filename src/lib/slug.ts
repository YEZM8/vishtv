/**
 * Decode a dynamic route param. This Next.js version does NOT auto-decode route params, so
 * non-ASCII slugs (e.g. Sinhala) arrive percent-encoded and won't match Sanity `slug.current`.
 * Safe: returns the input unchanged if it isn't valid percent-encoding.
 */
export function decodeSlug(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
