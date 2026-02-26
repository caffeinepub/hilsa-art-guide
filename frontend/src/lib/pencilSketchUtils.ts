export type StageProgressCallback = (stageIndex: number, dataUrl: string) => void;

// Yield to browser between heavy operations
function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Gaussian blur kernel
function gaussianKernel(sigma: number): number[] {
  const radius = Math.ceil(sigma * 3);
  const size = 2 * radius + 1;
  const kernel: number[] = [];
  let sum = 0;
  for (let i = 0; i < size; i++) {
    const x = i - radius;
    const val = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel.push(val);
    sum += val;
  }
  return kernel.map((v) => v / sum);
}

// Apply 1D separable Gaussian blur
function gaussianBlur(data: Float32Array, width: number, height: number, sigma: number): Float32Array {
  const kernel = gaussianKernel(sigma);
  const radius = Math.floor(kernel.length / 2);
  const temp = new Float32Array(width * height);
  const out = new Float32Array(width * height);

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) {
        const xi = Math.min(Math.max(x + k, 0), width - 1);
        sum += data[y * width + xi] * kernel[k + radius];
      }
      temp[y * width + x] = sum;
    }
  }

  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) {
        const yi = Math.min(Math.max(y + k, 0), height - 1);
        sum += temp[yi * width + x] * kernel[k + radius];
      }
      out[y * width + x] = sum;
    }
  }

  return out;
}

// Compute Sobel edge magnitude (0-1)
function sobelEdges(gray: Float32Array, width: number, height: number): Float32Array {
  const edges = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const tl = gray[(y - 1) * width + (x - 1)];
      const tm = gray[(y - 1) * width + x];
      const tr = gray[(y - 1) * width + (x + 1)];
      const ml = gray[y * width + (x - 1)];
      const mr = gray[y * width + (x + 1)];
      const bl = gray[(y + 1) * width + (x - 1)];
      const bm = gray[(y + 1) * width + x];
      const br = gray[(y + 1) * width + (x + 1)];
      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
      const gy = -tl - 2 * tm - tr + bl + 2 * bm + br;
      edges[y * width + x] = Math.min(Math.sqrt(gx * gx + gy * gy) / 4, 1);
    }
  }
  return edges;
}

// Draw hatching lines onto a canvas context
function drawHatching(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  darkMap: Float32Array,
  angle: number,
  spacing: number,
  threshold: number,
  opacity: number,
  strokeWidth: number
) {
  ctx.save();
  ctx.strokeStyle = `rgba(20, 20, 20, ${opacity})`;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const diag = Math.sqrt(width * width + height * height);

  for (let d = -diag; d < diag; d += spacing) {
    ctx.beginPath();
    let started = false;
    const steps = Math.ceil(diag * 2);
    for (let t = 0; t < steps; t++) {
      const px = Math.round(width / 2 + cos * t - sin * d);
      const py = Math.round(height / 2 + sin * t + cos * d);
      if (px < 0 || px >= width || py < 0 || py >= height) {
        if (started) {
          ctx.stroke();
          ctx.beginPath();
          started = false;
        }
        continue;
      }
      const darkness = darkMap[py * width + px];
      if (darkness > threshold) {
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      } else {
        if (started) {
          ctx.stroke();
          ctx.beginPath();
          started = false;
        }
      }
    }
    if (started) ctx.stroke();
  }
  ctx.restore();
}

// Load image from URL into an HTMLImageElement
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function generatePencilSketchStages(
  imageUrl: string,
  onProgress?: StageProgressCallback
): Promise<string[]> {
  const img = await loadImage(imageUrl);

  // Downscale to max 700px for performance
  const MAX = 700;
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (w > MAX || h > MAX) {
    const scale = MAX / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  // Source canvas
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = w;
  srcCanvas.height = h;
  const srcCtx = srcCanvas.getContext("2d")!;
  srcCtx.drawImage(img, 0, 0, w, h);
  const srcData = srcCtx.getImageData(0, 0, w, h);

  // Grayscale
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = srcData.data[i * 4] / 255;
    const g = srcData.data[i * 4 + 1] / 255;
    const b = srcData.data[i * 4 + 2] / 255;
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Pre-compute blurs
  const blurLight = gaussianBlur(gray, w, h, 1.0);
  const blurMed = gaussianBlur(gray, w, h, 2.5);
  const blurHeavy = gaussianBlur(gray, w, h, 5.0);

  // Edges from lightly blurred source (cleaner lines)
  const edges = sobelEdges(blurLight, w, h);

  // Darkness map: inverted grayscale (how dark each pixel is)
  const darkMap = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    darkMap[i] = 1 - gray[i];
  }

  // Smoothed darkness for shading regions
  const darkMapSmooth = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    darkMapSmooth[i] = 1 - blurMed[i];
  }

  const results: string[] = [];

  // Helper: create a white canvas
  const makeCanvas = () => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    return { c, ctx };
  };

  // ─── STAGE 1: Basic Outline ───────────────────────────────────────────────
  // Clean thin grey lines on pure white background — no shading
  await yieldToBrowser();
  {
    const { c, ctx } = makeCanvas();
    const imgData = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < w * h; i++) {
      const e = edges[i];
      // Only draw edges above a low threshold — thin, clean lines
      if (e > 0.06) {
        // Map edge strength to a grey value (stronger edge = darker line)
        const lineStrength = Math.min(e * 3.5, 1);
        const grey = Math.round(255 - lineStrength * 180); // range ~75-255
        imgData.data[i * 4] = grey;
        imgData.data[i * 4 + 1] = grey;
        imgData.data[i * 4 + 2] = grey;
        imgData.data[i * 4 + 3] = 255;
      }
      // else stays white
    }
    ctx.putImageData(imgData, 0, 0);
    const dataUrl = c.toDataURL("image/png");
    results.push(dataUrl);
    onProgress?.(0, dataUrl);
  }

  // ─── STAGE 2: Light Hatching ──────────────────────────────────────────────
  // Outline + light directional hatching in shadow areas
  await yieldToBrowser();
  {
    const { c, ctx } = makeCanvas();

    // Draw base outlines
    const imgData = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < w * h; i++) {
      const e = edges[i];
      if (e > 0.06) {
        const lineStrength = Math.min(e * 3.5, 1);
        const grey = Math.round(255 - lineStrength * 180);
        imgData.data[i * 4] = grey;
        imgData.data[i * 4 + 1] = grey;
        imgData.data[i * 4 + 2] = grey;
        imgData.data[i * 4 + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Light hatching at 45°
    drawHatching(ctx, w, h, darkMapSmooth, Math.PI / 4, 5, 0.25, 0.18, 0.6);

    const dataUrl = c.toDataURL("image/png");
    results.push(dataUrl);
    onProgress?.(1, dataUrl);
  }

  // ─── STAGE 3: Cross-Hatching ──────────────────────────────────────────────
  // Outline + two-direction hatching for mid-tones
  await yieldToBrowser();
  {
    const { c, ctx } = makeCanvas();

    // Base outlines
    const imgData = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < w * h; i++) {
      const e = edges[i];
      if (e > 0.06) {
        const lineStrength = Math.min(e * 3.5, 1);
        const grey = Math.round(255 - lineStrength * 200);
        imgData.data[i * 4] = grey;
        imgData.data[i * 4 + 1] = grey;
        imgData.data[i * 4 + 2] = grey;
        imgData.data[i * 4 + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Two-direction hatching
    drawHatching(ctx, w, h, darkMapSmooth, Math.PI / 4, 5, 0.20, 0.22, 0.7);
    drawHatching(ctx, w, h, darkMapSmooth, -Math.PI / 4, 5, 0.35, 0.18, 0.6);

    const dataUrl = c.toDataURL("image/png");
    results.push(dataUrl);
    onProgress?.(2, dataUrl);
  }

  // ─── STAGE 4: Deep Shading ────────────────────────────────────────────────
  // Dense cross-hatching + tonal fill for dark regions
  await yieldToBrowser();
  {
    const { c, ctx } = makeCanvas();

    // Tonal base: blend grayscale into the white canvas for mid-tones
    const imgData = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < w * h; i++) {
      const dark = darkMapSmooth[i];
      if (dark > 0.15) {
        // Soft tonal fill — lighter than final
        const tone = Math.round(255 - dark * 160);
        imgData.data[i * 4] = tone;
        imgData.data[i * 4 + 1] = tone;
        imgData.data[i * 4 + 2] = tone;
        imgData.data[i * 4 + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Dense hatching in multiple directions
    drawHatching(ctx, w, h, darkMapSmooth, Math.PI / 4, 4, 0.15, 0.28, 0.7);
    drawHatching(ctx, w, h, darkMapSmooth, -Math.PI / 4, 4, 0.25, 0.24, 0.65);
    drawHatching(ctx, w, h, darkMapSmooth, 0, 5, 0.40, 0.18, 0.55);

    // Strong outlines on top
    const outlineData = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < w * h; i++) {
      const e = edges[i];
      if (e > 0.05) {
        const lineStrength = Math.min(e * 4, 1);
        const grey = Math.round(255 - lineStrength * 220);
        const cur = outlineData.data[i * 4];
        outlineData.data[i * 4] = Math.min(cur, grey);
        outlineData.data[i * 4 + 1] = Math.min(cur, grey);
        outlineData.data[i * 4 + 2] = Math.min(cur, grey);
        outlineData.data[i * 4 + 3] = 255;
      }
    }
    ctx.putImageData(outlineData, 0, 0);

    const dataUrl = c.toDataURL("image/png");
    results.push(dataUrl);
    onProgress?.(3, dataUrl);
  }

  // ─── STAGE 5: Finished Portrait ───────────────────────────────────────────
  // Full tonal rendering: near-black shadows, bright white highlights
  await yieldToBrowser();
  {
    const { c, ctx } = makeCanvas();

    // Full tonal fill — deep shadows approaching near-black
    const imgData = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < w * h; i++) {
      const dark = darkMapSmooth[i];
      // Aggressive tone mapping: shadows go very dark
      const tone = Math.round(255 - Math.pow(dark, 0.75) * 230);
      const clamped = Math.max(10, Math.min(255, tone));
      imgData.data[i * 4] = clamped;
      imgData.data[i * 4 + 1] = clamped;
      imgData.data[i * 4 + 2] = clamped;
      imgData.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    // Very dense hatching layers
    drawHatching(ctx, w, h, darkMapSmooth, Math.PI / 4, 3, 0.10, 0.30, 0.7);
    drawHatching(ctx, w, h, darkMapSmooth, -Math.PI / 4, 3, 0.20, 0.28, 0.65);
    drawHatching(ctx, w, h, darkMapSmooth, 0, 4, 0.30, 0.22, 0.6);
    drawHatching(ctx, w, h, darkMapSmooth, Math.PI / 6, 4, 0.45, 0.20, 0.55);

    // Final strong outlines
    const outlineData = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < w * h; i++) {
      const e = edges[i];
      if (e > 0.04) {
        const lineStrength = Math.min(e * 5, 1);
        const grey = Math.round(255 - lineStrength * 240);
        const cur = outlineData.data[i * 4];
        outlineData.data[i * 4] = Math.min(cur, grey);
        outlineData.data[i * 4 + 1] = Math.min(cur, grey);
        outlineData.data[i * 4 + 2] = Math.min(cur, grey);
        outlineData.data[i * 4 + 3] = 255;
      }
    }
    ctx.putImageData(outlineData, 0, 0);

    const dataUrl = c.toDataURL("image/png");
    results.push(dataUrl);
    onProgress?.(4, dataUrl);
  }

  return results;
}
