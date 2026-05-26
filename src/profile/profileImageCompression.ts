export const PROFILE_IMAGE_MAX_DIMENSION = 320
export const PROFILE_IMAGE_JPEG_QUALITY = 0.62
export const PROFILE_IMAGE_OUTPUT_TYPE = 'image/jpeg'

export interface ProfileImageSize {
  width: number
  height: number
}

export function resolveProfileImageTargetSize(
  width: number,
  height: number,
  maxDimension = PROFILE_IMAGE_MAX_DIMENSION,
): ProfileImageSize {
  if (width <= 0 || height <= 0 || maxDimension <= 0) {
    throw new Error('Invalid profile image size')
  }

  if (width <= maxDimension && height <= maxDimension) {
    return { width, height }
  }

  const scale = Math.min(maxDimension / width, maxDimension / height)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

export function buildCompressedProfileImageName(originalName: string): string {
  const baseName = originalName
    .replace(/\.[^.]+$/, '')
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${baseName || 'profile'}-profile.jpg`
}

export async function compressProfileImage(file: File): Promise<File> {
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Unsupported profile image file')
  }
  if (typeof document === 'undefined') {
    throw new Error('Profile image compression requires a browser runtime')
  }

  const loadedImage = await loadProfileImage(file)
  const targetSize = resolveProfileImageTargetSize(loadedImage.width, loadedImage.height)
  const canvas = document.createElement('canvas')
  canvas.width = targetSize.width
  canvas.height = targetSize.height

  const context = canvas.getContext('2d', { alpha: false })
  if (!context) {
    loadedImage.close()
    throw new Error('Could not create profile image canvas')
  }

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, targetSize.width, targetSize.height)
  context.drawImage(loadedImage.source, 0, 0, targetSize.width, targetSize.height)
  loadedImage.close()

  const blob = await canvasToBlob(canvas)
  return new File([blob], buildCompressedProfileImageName(file.name), {
    type: PROFILE_IMAGE_OUTPUT_TYPE,
    lastModified: Date.now(),
  })
}

async function loadProfileImage(file: File): Promise<{
  source: CanvasImageSource
  width: number
  height: number
  close: () => void
}> {
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file)
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    }
  }

  const objectUrl = URL.createObjectURL(file)
  const image = new Image()
  image.decoding = 'async'

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Could not load profile image'))
    image.src = objectUrl
  })

  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    close: () => URL.revokeObjectURL(objectUrl),
  }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not compress profile image'))
          return
        }
        resolve(blob)
      },
      PROFILE_IMAGE_OUTPUT_TYPE,
      PROFILE_IMAGE_JPEG_QUALITY,
    )
  })
}
