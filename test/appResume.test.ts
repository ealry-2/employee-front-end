import test from 'node:test'
import assert from 'node:assert/strict'
import { registerBrowserResumeHandler } from '../src/runtime/appResume.ts'

test('registerBrowserResumeHandler invokes callback when page becomes visible', () => {
  const documentRef = new FakeDocument()
  let resumeCount = 0

  const cleanup = registerBrowserResumeHandler(() => {
    resumeCount += 1
  }, documentRef)

  documentRef.visibilityState = 'hidden'
  documentRef.dispatch('visibilitychange')
  assert.equal(resumeCount, 0)

  documentRef.visibilityState = 'visible'
  documentRef.dispatch('visibilitychange')
  assert.equal(resumeCount, 1)

  documentRef.dispatch('pageshow')
  assert.equal(resumeCount, 2)

  cleanup()
  documentRef.dispatch('visibilitychange')
  assert.equal(resumeCount, 2)
})

class FakeDocument {
  visibilityState: DocumentVisibilityState = 'visible'
  private readonly listeners = new Map<string, Set<EventListenerOrEventListenerObject>>()

  addEventListener = (type: string, listener: EventListenerOrEventListenerObject): void => {
    const listeners = this.listeners.get(type) ?? new Set<EventListenerOrEventListenerObject>()
    listeners.add(listener)
    this.listeners.set(type, listeners)
  }

  removeEventListener = (type: string, listener: EventListenerOrEventListenerObject): void => {
    this.listeners.get(type)?.delete(listener)
  }

  dispatch(type: string): void {
    for (const listener of this.listeners.get(type) ?? []) {
      if (typeof listener === 'function') {
        listener(new Event(type))
      } else {
        listener.handleEvent(new Event(type))
      }
    }
  }
}
