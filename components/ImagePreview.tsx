import { ImageResult } from '@/types'

interface Props {
  result: ImageResult
}

export default function ImagePreview({ result }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-500 text-center">Original</p>
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
          <img src={result.originalUrl} alt="Original" className="w-full h-auto object-contain" />
        </div>
        <p className="text-xs text-gray-400 text-center">{result.width} × {result.height}px</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-500 text-center">Background Removed</p>
        <div
          className="rounded-xl overflow-hidden border border-gray-200"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            backgroundColor: '#fff',
          }}
        >
          <img src={result.resultUrl} alt="Result" className="w-full h-auto object-contain" />
        </div>
        <p className="text-xs text-gray-400 text-center">Same size · Transparent PNG</p>
      </div>
    </div>
  )
}
