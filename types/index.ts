export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error'

export type Mode = 'photo' | 'graphic'

export type ItemStatus = 'pending' | 'processing' | 'done' | 'error'

export type ItemPhase = 'downloading' | 'inferring'

export type ExportFormat = 'png' | 'jpg' | 'webp'

export interface BatchItem {
  id: string
  file: File
  originalUrl: string
  resultUrl: string | null
  status: ItemStatus
  phase?: ItemPhase
  downloadProgress?: number
  width: number
  height: number
}

export interface ImageResult {
  originalUrl: string
  resultUrl: string
  fileName: string
  width: number
  height: number
}
