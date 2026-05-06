import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner'
import { Geolocation } from '@capacitor/geolocation'

export interface QrScanText {
  instructions: string
  button: string
}

export interface QrLocationResult {
  latitude: number
  longitude: number
  accuracyMeters: number | null
}

const scannerClassName = 'employee-qr-scanner-active'
const scannerLabelProperty = '--employee-qr-scanner-label'
const scannerCloseButtonSelector = '#cap-os-barcode-scanner-close-button'

interface WebQrScanner {
  stop?: () => Promise<void> | void
  clear?: () => Promise<void> | void
}

declare global {
  interface Window {
    OSBarcodeWebScanner?: WebQrScanner | null
  }
}

function activateScannerTheme(label: string) {
  document.body.classList.add(scannerClassName)
  document.body.style.setProperty(scannerLabelProperty, JSON.stringify(label))
}

function deactivateScannerTheme() {
  forceCloseWebScanner()
  document.body.classList.remove(scannerClassName)
  document.body.style.removeProperty(scannerLabelProperty)
}

function forceCloseWebScanner() {
  hideWebScannerContainer()
  stopWebScannerCamera()
  stopWindowScanner()
}

function hideWebScannerContainer() {
  const dialog = document.getElementById('cap-os-barcode-scanner-container-dialog')
  if (dialog) {
    dialog.style.display = 'none'
  }
}

function stopWebScannerCamera() {
  const stopButton = document.querySelector<HTMLButtonElement>('#html5-qrcode-button-camera-stop')
  stopButton?.click()

  document
    .querySelectorAll<HTMLVideoElement>('#cap-os-barcode-scanner-container video')
    .forEach((video) => {
      const stream = video.srcObject
      if (isMediaStreamLike(stream)) {
        stream.getTracks().forEach((track) => track.stop())
      }
      video.pause()
      video.srcObject = null
    })
}

function stopWindowScanner() {
  const scanner = window.OSBarcodeWebScanner
  window.OSBarcodeWebScanner = null

  if (!scanner || typeof scanner.stop !== 'function') {
    return
  }

  try {
    void Promise.resolve(scanner.stop())
      .then(() => {
        if (typeof scanner.clear === 'function') {
          return scanner.clear()
        }
        return undefined
      })
      .catch(() => undefined)
  } catch {
    // The scanner UI has already been hidden; cleanup is best-effort.
  }
}

function isMediaStreamLike(value: unknown): value is MediaStream {
  return (
    typeof value === 'object' &&
    value !== null &&
    'getTracks' in value &&
    typeof (value as MediaStream).getTracks === 'function'
  )
}

function installWebScannerCloseGuard(onClose: () => void): () => void {
  const abortController = new AbortController()
  let handled = false

  const handleClose = (event: Event) => {
    if (!isScannerCloseTarget(event.target)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()

    if (handled) {
      return
    }

    handled = true
    onClose()
  }

  document.addEventListener('pointerdown', handleClose, {
    capture: true,
    signal: abortController.signal,
  })
  document.addEventListener('click', handleClose, {
    capture: true,
    signal: abortController.signal,
  })

  return () => abortController.abort()
}

function isScannerCloseTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(scannerCloseButtonSelector))
}

export async function scanAttendanceQr(text: QrScanText): Promise<string> {
  activateScannerTheme(text.instructions)

  let rejectClose: (error: Error) => void = () => undefined
  const closePromise = new Promise<never>((_, reject) => {
    rejectClose = reject
  })
  const cleanupCloseGuard = installWebScannerCloseGuard(() => {
    forceCloseWebScanner()
    rejectClose(new Error('QR scan cancelled.'))
  })

  try {
    const result = await Promise.race([
      CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
        scanInstructions: text.instructions,
        scanButton: true,
        scanText: text.button,
        cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
        scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
        web: {
          showCameraSelection: true,
          scannerFPS: 10,
        },
      }),
      closePromise,
    ])

    return result.ScanResult.trim()
  } finally {
    cleanupCloseGuard()
    deactivateScannerTheme()
  }
}

export async function getCurrentQrLocation(): Promise<QrLocationResult> {
  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10_000,
    maximumAge: 0,
  })

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracyMeters: position.coords.accuracy ?? null,
  }
}
