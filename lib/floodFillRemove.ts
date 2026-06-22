type RGB = [number, number, number]

function getPixelRGB(data: Uint8ClampedArray, width: number, x: number, y: number): RGB {
  const i = (y * width + x) * 4
  return [data[i], data[i + 1], data[i + 2]]
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)
}

// Sample many pixels along all four edges and use the median — much more robust than
// averaging 4 corners, which breaks when design elements bleed to the image border.
function detectBackgroundColor(data: Uint8ClampedArray, width: number, height: number): RGB {
  const samples: RGB[] = []
  const step = Math.max(1, Math.round(Math.min(width, height) / 60))

  for (let x = 0; x < width; x += step) {
    samples.push(getPixelRGB(data, width, x, 0))
    samples.push(getPixelRGB(data, width, x, height - 1))
  }
  for (let y = step; y < height - step; y += step) {
    samples.push(getPixelRGB(data, width, 0, y))
    samples.push(getPixelRGB(data, width, width - 1, y))
  }

  const rs = samples.map((s) => s[0]).sort((a, b) => a - b)
  const gs = samples.map((s) => s[1]).sort((a, b) => a - b)
  const bs = samples.map((s) => s[2]).sort((a, b) => a - b)
  const mid = Math.floor(samples.length / 2)

  return [rs[mid], gs[mid], bs[mid]]
}

function floodFillEdges(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  bgColor: RGB,
  tolerance: number
): void {
  const visited = new Uint8Array(width * height)
  const queue: number[] = []
  let head = 0

  function enqueue(x: number, y: number) {
    const idx = y * width + x
    if (visited[idx]) return
    visited[idx] = 1
    queue.push(idx)
  }

  for (let x = 0; x < width; x++) {
    enqueue(x, 0)
    enqueue(x, height - 1)
  }
  for (let y = 1; y < height - 1; y++) {
    enqueue(0, y)
    enqueue(width - 1, y)
  }

  while (head < queue.length) {
    const idx = queue[head++]
    const x = idx % width
    const y = Math.floor(idx / width)
    const pixel = getPixelRGB(data, width, x, y)

    if (colorDistance(pixel, bgColor) > tolerance) continue

    data[idx * 4 + 3] = 0

    if (x > 0) enqueue(x - 1, y)
    if (x < width - 1) enqueue(x + 1, y)
    if (y > 0) enqueue(x, y - 1)
    if (y < height - 1) enqueue(x, y + 1)
  }
}

// After the main flood fill, opaque pixels sitting right on the transparency boundary
// often have JPEG compression artifacts that leave a visible "fringe" halo. This pass
// graduates their alpha based on how close they are to the background color, producing
// smooth anti-aliased edges instead of a hard jagged cutout.
function refineEdges(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  bgColor: RGB,
  tolerance: number
): void {
  const feather = Math.max(8, tolerance * 0.8)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      if (data[idx + 3] === 0) continue

      const adjToTransparent =
        (x > 0 && data[(y * width + (x - 1)) * 4 + 3] === 0) ||
        (x < width - 1 && data[(y * width + (x + 1)) * 4 + 3] === 0) ||
        (y > 0 && data[((y - 1) * width + x) * 4 + 3] === 0) ||
        (y < height - 1 && data[((y + 1) * width + x) * 4 + 3] === 0)

      if (!adjToTransparent) continue

      const pixel = getPixelRGB(data, width, x, y)
      const dist = colorDistance(pixel, bgColor)

      // Pixels clearly far from background (design elements) are never touched.
      // Only the transition zone [tolerance … tolerance+feather] gets graduated alpha.
      if (dist < tolerance + feather) {
        const t = (dist - tolerance) / feather
        data[idx + 3] = Math.round(Math.max(0, Math.min(1, t)) * 255)
      }
    }
  }
}

export async function removeBackgroundFloodFill(
  file: File,
  tolerance: number = 30
): Promise<string> {
  const bitmap = await createImageBitmap(file)

  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const bgColor = detectBackgroundColor(imageData.data, canvas.width, canvas.height)

  floodFillEdges(imageData.data, canvas.width, canvas.height, bgColor, tolerance)
  refineEdges(imageData.data, canvas.width, canvas.height, bgColor, tolerance)

  ctx.putImageData(imageData, 0, 0)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(URL.createObjectURL(blob!)), 'image/png')
  })
}
