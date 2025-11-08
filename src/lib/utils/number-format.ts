/**
 * Format numbers into short form like:
 * 1000 → 1K, 1,000,000 → 1M
 */
export function formatAbbr(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
  }
  return num.toString()
}
