export type ResumeHandlerCleanup = () => void

export interface BrowserResumeDocument {
  visibilityState: DocumentVisibilityState
  addEventListener: Document['addEventListener']
  removeEventListener: Document['removeEventListener']
}

export function registerBrowserResumeHandler(
  onResume: () => void,
  documentRef: BrowserResumeDocument = document,
): ResumeHandlerCleanup {
  const handleVisibilityChange = (): void => {
    if (documentRef.visibilityState === 'visible') {
      onResume()
    }
  }

  const handlePageShow = (): void => {
    if (documentRef.visibilityState === 'visible') {
      onResume()
    }
  }

  documentRef.addEventListener('visibilitychange', handleVisibilityChange)
  documentRef.addEventListener('pageshow', handlePageShow)

  return () => {
    documentRef.removeEventListener('visibilitychange', handleVisibilityChange)
    documentRef.removeEventListener('pageshow', handlePageShow)
  }
}
