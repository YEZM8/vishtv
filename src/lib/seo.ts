/**
 * Whether the site should be indexed by search engines.
 *
 * Only true on the PRODUCTION deployment AND when ALLOW_INDEXING="true" is set. This lets us
 * publish vishtv.com as a non-indexed "soft launch" (running in parallel with the old Wix site
 * without creating duplicate content), then flip a single Vercel env var at cutover to turn
 * indexing on — no code change or redeploy of new code required, just an env change + redeploy.
 *
 * Preview / dev deployments are never indexable.
 */
export function isIndexable(): boolean {
  return (
    process.env.VERCEL_ENV === "production" &&
    process.env.ALLOW_INDEXING === "true"
  );
}
