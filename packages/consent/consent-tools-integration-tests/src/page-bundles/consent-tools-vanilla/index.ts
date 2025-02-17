import { AnalyticsBrowser } from '@snitcher/analytics-browser'
import { createWrapper } from '@segment/analytics-consent-tools'

const fakeCategories = { FooCategory1: true, FooCategory2: true }

const withCMP = createWrapper({
  getCategories: () => fakeCategories,
})

const analytics = new AnalyticsBrowser()

withCMP(analytics).load({
  writeKey: 'foo',
})

// for testing
;(window as any).analytics = analytics
