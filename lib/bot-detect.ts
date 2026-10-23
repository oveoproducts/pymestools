const BOT_PATTERN =
  /bot|crawl|spider|slurp|curl|wget|python|requests|httpclient|http-client|go-http|java\/|okhttp|axios|node-fetch|headless|phantom|puppeteer|playwright|selenium|lighthouse|pagespeed|preview|facebookexternalhit|monitor|uptime|scan|check|feed|fetch/i

export function isBot(userAgent: string | null): boolean {
  if (!userAgent || userAgent.length < 20) return true
  return BOT_PATTERN.test(userAgent)
}
