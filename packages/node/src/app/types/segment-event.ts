import type { CoreSegmentEvent } from '@snitcher/analytics-core'

type SegmentEventType = 'track' | 'page' | 'identify' | 'alias' | 'screen'

export interface SegmentEvent extends CoreSegmentEvent {
  type: SegmentEventType
}
