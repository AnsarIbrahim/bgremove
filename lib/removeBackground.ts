/* eslint-disable @typescript-eslint/no-explicit-any */

interface ModelCache {
  model: any
  processor: any
  RawImage: any
}

// Loaded once per browser session, then reused for every image
let _cache: ModelCache | null = null
let _loadPromise: Promise<ModelCache> | null = null

async function loadModel(onProgress?: (p: number) => void): Promise<ModelCache> {
  if (_cache) return _cache

  if (!_loadPromise) {
    _loadPromise = (async (): Promise<ModelCache> => {
      const { env, AutoModel, AutoProcessor, RawImage } =
        await import('@huggingface/transformers')

      env.allowLocalModels = false
      env.useBrowserCache = true

      const model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
        config: { model_type: 'custom' } as any,
        progress_callback: (data: any) => {
          if (onProgress && data.status === 'progress' && data.progress != null) {
            onProgress(Math.round(data.progress))
          }
        },
      })

      const processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
        config: {
          do_normalize: true,
          do_pad: false,
          do_rescale: true,
          do_resize: true,
          image_mean: [0.5, 0.5, 0.5],
          image_std: [1, 1, 1],
          resample: 2,
          rescale_factor: 0.00392156862745098,
          size: { width: 1024, height: 1024 },
        } as any,
      })

      _cache = { model, processor, RawImage }
      return _cache
    })()
  }

  return _loadPromise
}

export async function processImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const { model, processor, RawImage } = await loadModel(onProgress)

  const objectUrl = URL.createObjectURL(file)

  // Load image for model inference
  const image = await RawImage.fromURL(objectUrl)

  const { pixel_values } = await processor(image)
  const { output } = await model({ input: pixel_values })

  // Resize the alpha mask to the original image dimensions
  const mask = await RawImage
    .fromTensor(output[0].mul(255).to('uint8'))
    .resize(image.width, image.height)

  // Draw the original image to a canvas
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')!

  await new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => { ctx.drawImage(img, 0, 0); resolve() }
    img.onerror = reject
    img.src = objectUrl
  })
  URL.revokeObjectURL(objectUrl)

  // Set alpha channel from mask
  const imageData = ctx.getImageData(0, 0, image.width, image.height)
  for (let i = 0; i < mask.data.length; i++) {
    imageData.data[4 * i + 3] = mask.data[i]
  }
  ctx.putImageData(imageData, 0, 0)

  return new Promise<string>((resolve) => {
    canvas.toBlob((blob) => resolve(URL.createObjectURL(blob!)), 'image/png')
  })
}
