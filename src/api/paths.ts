function encodedPath(prefix: string, ...segments: string[]): string {
  return [prefix, ...segments.map((segment) => encodeURIComponent(segment))].join('/')
}

export function appStorePath(storeId: string, ...segments: string[]): string {
  return encodedPath('/api/app/stores', storeId, ...segments)
}

export function albaStorePath(storeId: string, ...segments: string[]): string {
  return encodedPath('/api/alba/stores', storeId, ...segments)
}

export function albaAttendancePath(recordId: string, ...segments: string[]): string {
  return encodedPath('/api/alba/attendance', recordId, ...segments)
}
