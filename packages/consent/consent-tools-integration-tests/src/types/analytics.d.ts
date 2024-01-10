import type { AnalyticsSnippet } from '@snitcher/analytics-browser'

declare global {
  interface Window {
    analytics: AnalyticsSnippet
  }
}
