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

function activateScannerTheme(label: string) {
  document.body.classList.add(scannerClassName)
  document.body.style.setProperty(scannerLabelProperty, JSON.stringify(label))
}

function deactivateScannerTheme() {
  document.body.classList.remove(scannerClassName)
  document.body.style.removeProperty(scannerLabelProperty)
}

export async function scanAttendanceQr(text: QrScanText): Promise<string> {
  activateScannerTheme(text.instructions)

  try {
    const result = await CapacitorBarcodeScanner.scanBarcode({
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
    })

    return result.ScanResult.trim()
  } finally {
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
