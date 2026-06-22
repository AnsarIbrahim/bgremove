interface Props {
  progress: number
}

export default function ProcessingSpinner({ progress }: Props) {
  const isDownloading = progress > 0 && progress < 100

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />

      {isDownloading ? (
        <>
          <p className="text-sm text-slate-400">Downloading AI model... {progress}%</p>
          <div className="w-full h-1 bg-white/6 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-700">First run only — cached after this</p>
        </>
      ) : (
        <p className="text-sm text-slate-400">Removing background...</p>
      )}
    </div>
  )
}
