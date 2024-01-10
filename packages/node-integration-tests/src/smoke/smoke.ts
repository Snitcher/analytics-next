import { default as AnalyticsDefaultImport } from '@snitcher/analytics-node'
import { Analytics as AnalyticsNamedImport } from '@snitcher/analytics-node'

{
  // test named imports vs default imports
  new AnalyticsNamedImport({ writeKey: 'hello world' })
  new AnalyticsDefaultImport({ writeKey: 'hello world' })
}
