import { join as joinPath } from 'path'
import { unstable_dev } from 'wrangler'
import { MockSegmentServer } from '../server/mock-segment-workers'

const isoDateRegEx = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

const snapshotMatchers = {
  get batchEvent() {
    return {
      messageId: expect.any(String),
      context: {
        library: {
          name: '@snitcher/analytics-node',
          version: expect.any(String),
        },
      },
      _metadata: {
        jsRuntime: 'cloudflare-worker',
      },
      timestamp: expect.stringMatching(isoDateRegEx),
    }
  },
  getReqBody(eventCount = 1) {
    const batch = []
    for (let i = 0; i < eventCount; i++) {
      batch.push(snapshotMatchers.batchEvent)
    }
    return {
      batch,
      sentAt: expect.stringMatching(isoDateRegEx),
    }
  },
}

describe('Analytics in Cloudflare workers', () => {
  let mockSegmentServer: MockSegmentServer
  beforeEach(async () => {
    mockSegmentServer = new MockSegmentServer(3000)
    await mockSegmentServer.start()
  })

  afterEach(async () => {
    await mockSegmentServer.stop()
  })

  it('can send a single event', async () => {
    const batches: any[] = []
    mockSegmentServer.on('batch', (batch) => {
      batches.push(batch)
    })

    const worker = await unstable_dev(
      joinPath(__dirname, 'workers', 'send-single-event.ts'),
      {
        experimental: {
          disableExperimentalWarning: true,
        },
        bundle: true,
      }
    )
    const response = await worker.fetch('http://localhost')
    await response.text()
    await worker.stop()

    expect(batches).toHaveLength(1)
    const events = batches[0].batch
    expect(events).toHaveLength(1)
    expect(batches).toMatchInlineSnapshot(
      batches.map(() => snapshotMatchers.getReqBody(1)),
      `
      [
        {
          "batch": [
            {
              "_metadata": {
                "jsRuntime": "cloudflare-worker",
              },
              "context": {
                "library": {
                  "name": "@snitcher/analytics-node",
                  "version": Any<String>,
                },
              },
              "event": "some-event",
              "integrations": {},
              "messageId": Any<String>,
              "properties": {},
              "timestamp": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
              "type": "track",
              "userId": "some-user",
            },
          ],
          "sentAt": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
        },
      ]
    `
    )
  })

  it('can send each event type in a batch', async () => {
    const batches: any[] = []
    mockSegmentServer.on('batch', (batch) => {
      batches.push(batch)
    })

    const worker = await unstable_dev(
      joinPath(__dirname, 'workers', 'send-each-event-type.ts'),
      {
        experimental: {
          disableExperimentalWarning: true,
        },
        bundle: true,
      }
    )
    const response = await worker.fetch('http://localhost')
    await response.text()
    await worker.stop()

    expect(batches).toHaveLength(1)
    const events = batches[0].batch
    expect(events).toHaveLength(6)
    expect(batches).toMatchInlineSnapshot(
      batches.map(() => snapshotMatchers.getReqBody(6)),
      `
      [
        {
          "batch": [
            {
              "_metadata": {
                "jsRuntime": "cloudflare-worker",
              },
              "context": {
                "library": {
                  "name": "@snitcher/analytics-node",
                  "version": Any<String>,
                },
              },
              "integrations": {},
              "messageId": Any<String>,
              "previousId": "other-user",
              "timestamp": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
              "type": "alias",
              "userId": "some-user",
            },
            {
              "_metadata": {
                "jsRuntime": "cloudflare-worker",
              },
              "context": {
                "library": {
                  "name": "@snitcher/analytics-node",
                  "version": Any<String>,
                },
              },
              "groupId": "some-group",
              "integrations": {},
              "messageId": Any<String>,
              "timestamp": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
              "traits": {},
              "type": "group",
              "userId": "some-user",
            },
            {
              "_metadata": {
                "jsRuntime": "cloudflare-worker",
              },
              "context": {
                "library": {
                  "name": "@snitcher/analytics-node",
                  "version": Any<String>,
                },
              },
              "integrations": {},
              "messageId": Any<String>,
              "timestamp": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
              "traits": {
                "favoriteColor": "Seattle Grey",
              },
              "type": "identify",
              "userId": "some-user",
            },
            {
              "_metadata": {
                "jsRuntime": "cloudflare-worker",
              },
              "context": {
                "library": {
                  "name": "@snitcher/analytics-node",
                  "version": Any<String>,
                },
              },
              "integrations": {},
              "messageId": Any<String>,
              "name": "Test Page",
              "properties": {},
              "timestamp": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
              "type": "page",
              "userId": "some-user",
            },
            {
              "_metadata": {
                "jsRuntime": "cloudflare-worker",
              },
              "context": {
                "library": {
                  "name": "@snitcher/analytics-node",
                  "version": Any<String>,
                },
              },
              "event": "some-event",
              "integrations": {},
              "messageId": Any<String>,
              "properties": {},
              "timestamp": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
              "type": "track",
              "userId": "some-user",
            },
            {
              "_metadata": {
                "jsRuntime": "cloudflare-worker",
              },
              "context": {
                "library": {
                  "name": "@snitcher/analytics-node",
                  "version": Any<String>,
                },
              },
              "integrations": {},
              "messageId": Any<String>,
              "name": "Test Screen",
              "properties": {},
              "timestamp": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
              "type": "screen",
              "userId": "some-user",
            },
          ],
          "sentAt": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
        },
      ]
    `
    )
  })

  it('can send multiple events in a multiple batches', async () => {
    const batches: any[] = []
    mockSegmentServer.on('batch', (batch) => {
      batches.push(batch)
    })

    const worker = await unstable_dev(
      joinPath(__dirname, 'workers', 'send-multiple-events.ts'),
      {
        experimental: {
          disableExperimentalWarning: true,
        },
        bundle: true,
      }
    )
    const response = await worker.fetch(
      'http://localhost?flushAt=2&eventCount=6'
    )
    await response.text()
    await worker.stop()

    expect(batches).toHaveLength(3)
    for (const { batch } of batches) {
      expect(batch).toHaveLength(2)
    }
    expect(batches).toMatchInlineSnapshot(
      batches.map(() => snapshotMatchers.getReqBody(2)),
      `
      [
        {
          "batch": [
            {
              "_metadata": {
                "jsRuntime": "cloudflare-worker",
              },
              "context": {
                "library": {
                  "name": "@snitcher/analytics-node",
                  "version": Any<String>,
                },
              },
              "event": "some-event",
              "integrations": {},
              "messageId": Any<String>,
              "properties": {
                "count": 0,
              },
              "timestamp": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
              "type": "track",
              "userId": "some-user",
            },
            {
              "_metadata": {
                "jsRuntime": "cloudflare-worker",
              },
              "context": {
                "library": {
                  "name": "@snitcher/analytics-node",
                  "version": Any<String>,
                },
              },
              "event": "some-event",
              "integrations": {},
              "messageId": Any<String>,
              "properties": {
                "count": 1,
              },
              "timestamp": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
              "type": "track",
              "userId": "some-user",
            },
          ],
          "sentAt": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
        },
        {
          "batch": [
            {
              "_metadata": {
                "jsRuntime": "cloudflare-worker",
              },
              "context": {
                "library": {
                  "name": "@snitcher/analytics-node",
                  "version": Any<String>,
                },
              },
              "event": "some-event",
              "integrations": {},
              "messageId": Any<String>,
              "properties": {
                "count": 2,
              },
              "timestamp": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
              "type": "track",
              "userId": "some-user",
            },
            {
              "_metadata": {
                "jsRuntime": "cloudflare-worker",
              },
              "context": {
                "library": {
                  "name": "@snitcher/analytics-node",
                  "version": Any<String>,
                },
              },
              "event": "some-event",
              "integrations": {},
              "messageId": Any<String>,
              "properties": {
                "count": 3,
              },
              "timestamp": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
              "type": "track",
              "userId": "some-user",
            },
          ],
          "sentAt": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
        },
        {
          "batch": [
            {
              "_metadata": {
                "jsRuntime": "cloudflare-worker",
              },
              "context": {
                "library": {
                  "name": "@snitcher/analytics-node",
                  "version": Any<String>,
                },
              },
              "event": "some-event",
              "integrations": {},
              "messageId": Any<String>,
              "properties": {
                "count": 4,
              },
              "timestamp": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
              "type": "track",
              "userId": "some-user",
            },
            {
              "_metadata": {
                "jsRuntime": "cloudflare-worker",
              },
              "context": {
                "library": {
                  "name": "@snitcher/analytics-node",
                  "version": Any<String>,
                },
              },
              "event": "some-event",
              "integrations": {},
              "messageId": Any<String>,
              "properties": {
                "count": 5,
              },
              "timestamp": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
              "type": "track",
              "userId": "some-user",
            },
          ],
          "sentAt": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\}T\\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\\\\\.\\\\d\\{3\\}Z\\$/,
        },
      ]
    `
    )
  })

  it('may exit without sending events if you forget closeAndFlush', async () => {
    const batches: any[] = []
    mockSegmentServer.on('batch', (batch) => {
      batches.push(batch)
    })

    const worker = await unstable_dev(
      joinPath(__dirname, 'workers', 'forgot-close-and-flush.ts'),
      {
        experimental: {
          disableExperimentalWarning: true,
        },
        bundle: true,
      }
    )
    const response = await worker.fetch('http://localhost')
    await response.text()
    await worker.stop()

    expect(batches).toHaveLength(0)
  })
})
