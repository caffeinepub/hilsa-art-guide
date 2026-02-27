export interface SketchStage {
  label: string;
  description: string;
  dataUrl: string;
}

// ─── Stage metadata — 4-step pencil drawing tutorial ─────────────────────────
export const STAGE_LABELS = [
  "Basic Construction",
  "Refined Line Art",
  "Hair & Detail Development",
  "Final Shaded Portrait",
];

export const STAGE_DESCRIPTIONS = [
  "Light sketch lines with face/head outline and construction guidelines",
  "Clean darker outlines with defined eyes, nose, lips, and hair shape",
  "Hair strand direction lines, eyebrow/eye details, and light contour shading",
  "Fully rendered graphite shading with smooth blending and hair volume",
];

export const STAGES = STAGE_LABELS.map((name, i) => ({
  number: i + 1,
  name,
  description: STAGE_DESCRIPTIONS[i],
}));

// Cream/parchment paper background color
const PAPER_R = 242;
const PAPER_G = 238;
const PAPER_B = 228;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getImageData(
  img: HTMLImageElement,
  width: number,
  height: number
): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

function toGrayscale(data: Uint8ClampedArray): Float32Array {
  const gray = new Float32Array(data.length / 4);
  for (let i = 0; i < gray.length; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return gray;
}

function sobelEdges(
  gray: Float32Array,
  width: number,
  height: number
): Float32Array {
  const edges = new Float32Array(gray.length);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx =
        -gray[(y - 1) * width + (x - 1)] +
        gray[(y - 1) * width + (x + 1)] +
        -2 * gray[y * width + (x - 1)] +
        2 * gray[y * width + (x + 1)] +
        -gray[(y + 1) * width + (x - 1)] +
        gray[(y + 1) * width + (x + 1)];
      const gy =
        -gray[(y - 1) * width + (x - 1)] +
        -2 * gray[(y - 1) * width + x] +
        -gray[(y - 1) * width + (x + 1)] +
        gray[(y + 1) * width + (x - 1)] +
        2 * gray[(y + 1) * width + x] +
        gray[(y + 1) * width + (x + 1)];
      edges[idx] = Math.min(255, Math.sqrt(gx * gx + gy * gy));
    }
  }
  return edges;
}

function gaussianBlur(
  data: Float32Array,
  width: number,
  height: number,
  radius: number
): Float32Array {
  const kernel: number[] = [];
  const sigma = Math.max(radius / 2, 0.5);
  let sum = 0;
  for (let i = -radius; i <= radius; i++) {
    const val = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(val);
    sum += val;
  }
  const norm = kernel.map((v) => v / sum);

  const temp = new Float32Array(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const nx = Math.max(0, Math.min(width - 1, x + k));
        acc += data[y * width + nx] * norm[k + radius];
      }
      temp[y * width + x] = acc;
    }
  }
  const result = new Float32Array(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const ny = Math.max(0, Math.min(height - 1, y + k));
        acc += temp[ny * width + x] * norm[k + radius];
      }
      result[y * width + x] = acc;
    }
  }
  return result;
}

// Pseudo-random noise for pencil grain texture
function pencilNoise(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Simulate a wobbly freehand line by jittering pixel positions
function freehandJitter(x: number, y: number, amplitude: number): [number, number] {
  const jx = (pencilNoise(x * 0.3 + y * 0.7 + 1.1) - 0.5) * amplitude;
  const jy = (pencilNoise(x * 0.7 + y * 0.3 + 2.3) - 0.5) * amplitude;
  return [x + jx, y + jy];
}

function fillPaperBackground(output: ImageData): void {
  for (let i = 0; i < output.data.length / 4; i++) {
    const grain = (pencilNoise(i * 0.01) - 0.5) * 4;
    output.data[i * 4]     = Math.max(0, Math.min(255, PAPER_R + grain));
    output.data[i * 4 + 1] = Math.max(0, Math.min(255, PAPER_G + grain * 0.9));
    output.data[i * 4 + 2] = Math.max(0, Math.min(255, PAPER_B + grain * 0.8));
    output.data[i * 4 + 3] = 255;
  }
}

function blendPencilStroke(
  pr: number,
  pg: number,
  pb: number,
  strokeDarkness: number,
  opacity: number
): [number, number, number] {
  const graphiteR = 38;
  const graphiteG = 36;
  const graphiteB = 44;

  const blended = Math.min(1, opacity * strokeDarkness);
  const r = Math.round(pr * (1 - blended) + graphiteR * blended);
  const g = Math.round(pg * (1 - blended) + graphiteG * blended);
  const b = Math.round(pb * (1 - blended) + graphiteB * blended);
  return [
    Math.max(0, Math.min(255, r)),
    Math.max(0, Math.min(255, g)),
    Math.max(0, Math.min(255, b)),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 1 — Basic Construction
// Light sketch lines only. Face/head outline with vertical and horizontal
// guidelines. Very faint pencil strokes. Minimal facial details.
// ─────────────────────────────────────────────────────────────────────────────
function processStage1(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const edges = sobelEdges(gray, width, height);
  const blurredEdges = gaussianBlur(edges, width, height, 7);

  const threshold = 45;
  const maxOpacity = 0.08;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const e = blurredEdges[i];

      if (e > threshold) {
        const [jx, jy] = freehandJitter(x, y, 2.5);
        const ji = Math.round(jy) * width + Math.round(jx);
        const safeIdx = Math.max(0, Math.min(gray.length - 1, ji));

        const strokeDarkness = Math.min(1, (e - threshold) / 100);
        const pressureVariation = 0.6 + pencilNoise(i * 0.05) * 0.4;
        const opacity = maxOpacity * pressureVariation;

        const pr = output.data[safeIdx * 4];
        const pg = output.data[safeIdx * 4 + 1];
        const pb = output.data[safeIdx * 4 + 2];
        const [r, g, b] = blendPencilStroke(pr, pg, pb, strokeDarkness, opacity);
        output.data[safeIdx * 4]     = r;
        output.data[safeIdx * 4 + 1] = g;
        output.data[safeIdx * 4 + 2] = b;
      }
    }
  }

  // Draw faint construction guide lines
  const guideOpacity = 0.06;
  const guideStroke = 0.45;

  // Horizontal centre line
  const cy = Math.round(height * 0.5);
  for (let x = Math.round(width * 0.12); x < Math.round(width * 0.88); x++) {
    const wobble = Math.round((pencilNoise(x * 0.1) - 0.5) * 3);
    const iy = Math.max(0, Math.min(height - 1, cy + wobble));
    const idx = iy * width + x;
    const pr = output.data[idx * 4];
    const pg = output.data[idx * 4 + 1];
    const pb = output.data[idx * 4 + 2];
    const [r, g, b] = blendPencilStroke(pr, pg, pb, guideStroke, guideOpacity);
    output.data[idx * 4]     = r;
    output.data[idx * 4 + 1] = g;
    output.data[idx * 4 + 2] = b;
  }

  // Vertical centre line
  const cx = Math.round(width * 0.5);
  for (let y = Math.round(height * 0.08); y < Math.round(height * 0.92); y++) {
    const wobble = Math.round((pencilNoise(y * 0.1 + 50) - 0.5) * 3);
    const ix = Math.max(0, Math.min(width - 1, cx + wobble));
    const idx = y * width + ix;
    const pr = output.data[idx * 4];
    const pg = output.data[idx * 4 + 1];
    const pb = output.data[idx * 4 + 2];
    const [r, g, b] = blendPencilStroke(pr, pg, pb, guideStroke, guideOpacity);
    output.data[idx * 4]     = r;
    output.data[idx * 4 + 1] = g;
    output.data[idx * 4 + 2] = b;
  }

  // Thirds horizontal markers (eye-line, nose-line)
  for (let t = 1; t <= 2; t++) {
    const lineY = Math.round(height * (0.15 + t * 0.25));
    for (let x = Math.round(width * 0.18); x < Math.round(width * 0.82); x++) {
      const wobble = Math.round((pencilNoise(x * 0.08 + t * 10) - 0.5) * 2);
      const iy = Math.max(0, Math.min(height - 1, lineY + wobble));
      const idx = iy * width + x;
      if (pencilNoise(x * 0.2 + t) > 0.35) {
        const pr = output.data[idx * 4];
        const pg = output.data[idx * 4 + 1];
        const pb = output.data[idx * 4 + 2];
        const [r, g, b] = blendPencilStroke(pr, pg, pb, guideStroke * 0.5, guideOpacity * 0.6);
        output.data[idx * 4]     = r;
        output.data[idx * 4 + 1] = g;
        output.data[idx * 4 + 2] = b;
      }
    }
  }

  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 2 — Refined Line Art
// Clean darker outlines. Defined eyes, nose, lips, hair shape.
// Construction lines mostly removed. No heavy shading.
// ─────────────────────────────────────────────────────────────────────────────
function processStage2(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const edges = sobelEdges(gray, width, height);
  const smoothEdges = gaussianBlur(edges, width, height, 2);

  const threshold = 20;
  const baseOpacity = 0.22;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const e = smoothEdges[i];

      if (e > threshold) {
        const [jx, jy] = freehandJitter(x, y, 1.2);
        const ji = Math.round(jy) * width + Math.round(jx);
        const safeIdx = Math.max(0, Math.min(gray.length - 1, ji));

        const strokeDarkness = Math.min(1, (e - threshold) / 65);
        const lineWeight = 0.7 + strokeDarkness * 0.3;
        const pressure = 0.75 + pencilNoise(i * 0.03 + 500) * 0.25;
        const opacity = baseOpacity * lineWeight * pressure;

        const pr = output.data[safeIdx * 4];
        const pg = output.data[safeIdx * 4 + 1];
        const pb = output.data[safeIdx * 4 + 2];
        const [r, g, b] = blendPencilStroke(pr, pg, pb, strokeDarkness, opacity);
        output.data[safeIdx * 4]     = r;
        output.data[safeIdx * 4 + 1] = g;
        output.data[safeIdx * 4 + 2] = b;
      }
    }
  }

  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 3 — Hair & Detail Development
// Hair strand direction lines, eyebrow/eye details, light contour shading.
// Maintains clean pencil texture.
// ─────────────────────────────────────────────────────────────────────────────
function processStage3(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const edges = sobelEdges(gray, width, height);
  const smoothEdges = gaussianBlur(edges, width, height, 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const g = gray[i];
      const e = smoothEdges[i];

      const edgeDarkness = Math.min(1, Math.max(0, (e - 18) / 60));

      const isShadow = g < 120;
      const isDeepShadow = g < 70;

      const hatchSpacing = 4;
      const hatchWidth = 2;
      const hatchPhase = (x + y) % hatchSpacing;
      const primaryHatch = isShadow && hatchPhase < hatchWidth
        ? Math.max(0, (120 - g) / 120) * 0.42
        : 0;

      const crossHatchPhase = (x - y + width) % hatchSpacing;
      const crossHatch = isDeepShadow && crossHatchPhase < hatchWidth
        ? Math.max(0, (70 - g) / 70) * 0.35
        : 0;

      const isMidDark = g >= 70 && g < 140;
      const tonalFill = isMidDark
        ? Math.max(0, (140 - g) / 140) * 0.12
        : 0;

      const combinedDarkness = Math.max(
        edgeDarkness * 0.38,
        primaryHatch,
        crossHatch,
        tonalFill
      );

      if (combinedDarkness > 0.015) {
        const grain = (pencilNoise(i * 0.07 + 2000) - 0.5) * 0.06;
        const finalDarkness = Math.min(1, combinedDarkness + grain);

        const pr = output.data[i * 4];
        const pg = output.data[i * 4 + 1];
        const pb = output.data[i * 4 + 2];
        const [r, g2, b] = blendPencilStroke(pr, pg, pb, finalDarkness, Math.min(1, finalDarkness));
        output.data[i * 4]     = r;
        output.data[i * 4 + 1] = g2;
        output.data[i * 4 + 2] = b;
      }
    }
  }
  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 4 — Final Shaded Portrait
// Fully rendered graphite shading. Smooth skin blending.
// Hair shaded with depth and volume. Soft shadow under chin and neck.
// Professional pencil realism finish.
// ─────────────────────────────────────────────────────────────────────────────
function processStage4(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const edges = sobelEdges(gray, width, height);
  const smoothEdges = gaussianBlur(edges, width, height, 1);
  const blurredGray = gaussianBlur(gray, width, height, 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const g = gray[i];
      const bg = blurredGray[i];
      const e = smoothEdges[i];

      const sharpened = Math.max(0, Math.min(255, g + (g - bg) * 1.5));

      // S-curve contrast for richer tonal range
      const normalized = sharpened / 255;
      const sCurve = normalized < 0.5
        ? 2 * normalized * normalized
        : 1 - Math.pow(-2 * normalized + 2, 2) / 2;
      const contrastGray = sCurve * 255;

      const edgeDarkness = Math.min(1, Math.max(0, (e - 10) / 40));
      const tonalDarkness = Math.max(0, (220 - contrastGray) / 220);

      // Smooth skin shading
      const isMidTone = g >= 80 && g < 185;
      const skinShading = isMidTone ? tonalDarkness * 0.45 : 0;

      // Dense shadow hatching
      const isShadow = g < 110;
      const isDeepShadow = g < 55;

      const hatchSpacing = 3;
      const hatchWidth = 2;
      const primaryHatch = isShadow && (x + y) % hatchSpacing < hatchWidth
        ? tonalDarkness * 0.62
        : 0;

      const crossHatch = isDeepShadow && (x - y + width) % hatchSpacing < hatchWidth
        ? tonalDarkness * 0.55
        : 0;

      // Multi-directional hair strokes
      const isHairRegion = g < 80;
      const hairStroke1 = isHairRegion && (x * 3 + y) % 5 < 2
        ? tonalDarkness * 0.7
        : 0;
      const hairStroke2 = isHairRegion && (x + y * 2) % 4 < 1
        ? tonalDarkness * 0.5
        : 0;

      // Fine detail strokes
      const isFeature = g < 150 && g >= 55;
      const detailStroke = isFeature && (x * 2 + y * 3) % 9 < 2
        ? tonalDarkness * 0.28
        : 0;

      // Soft shadow under chin (bottom quarter of image)
      const chinShadow = y > height * 0.75
        ? Math.max(0, (y - height * 0.75) / (height * 0.25)) * tonalDarkness * 0.3
        : 0;

      const combinedDarkness = Math.max(
        edgeDarkness * 0.72,
        tonalDarkness * 0.38,
        skinShading,
        primaryHatch,
        crossHatch,
        hairStroke1,
        hairStroke2,
        detailStroke,
        chinShadow
      );

      if (combinedDarkness > 0.01) {
        // Pencil grain + paper fiber overlay
        const grain = (pencilNoise(i * 0.05 + 4000) - 0.5) * 0.04;
        const fiber = (pencilNoise(i * 0.003 + 7777) - 0.5) * 0.02;
        const finalDarkness = Math.min(1, combinedDarkness + grain + fiber);

        const pr = output.data[i * 4];
        const pg = output.data[i * 4 + 1];
        const pb = output.data[i * 4 + 2];
        const [r, g2, b] = blendPencilStroke(pr, pg, pb, finalDarkness, Math.min(1, finalDarkness));
        output.data[i * 4]     = r;
        output.data[i * 4 + 1] = g2;
        output.data[i * 4 + 2] = b;
      }
    }
  }
  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export — generate all 4 stages progressively
// Cache key bumped to v7 to reflect 4-stage pipeline
// ─────────────────────────────────────────────────────────────────────────────
export async function generatePencilSketchStages(
  imageSrc: string,
  jobId: string,
  onStageComplete: (stageIndex: number, stage: SketchStage) => void
): Promise<SketchStage[]> {
  const CACHE_KEY = `sketch_stages_v7_${jobId}`;

  // Check session cache
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as SketchStage[];
      if (Array.isArray(parsed) && parsed.length === 4) {
        parsed.forEach((stage, i) => onStageComplete(i, stage));
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  const img = await loadImage(imageSrc);
  const SIZE = 600;
  const imageData = getImageData(img, SIZE, SIZE);
  const gray = toGrayscale(imageData.data);

  const stageFns = [processStage1, processStage2, processStage3, processStage4];
  const results: SketchStage[] = [];

  for (let i = 0; i < stageFns.length; i++) {
    const stageImageData = stageFns[i](gray, SIZE, SIZE);

    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(stageImageData, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");

    const stage: SketchStage = {
      label: STAGE_LABELS[i],
      description: STAGE_DESCRIPTIONS[i],
      dataUrl,
    };

    results.push(stage);
    onStageComplete(i, stage);

    // Yield to browser between stages
    await new Promise((r) => setTimeout(r, 0));
  }

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(results));
  } catch {
    // storage quota exceeded — ignore
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate the 2x2 tutorial grid image from 4 stage data URLs
// ─────────────────────────────────────────────────────────────────────────────
export async function generateTutorialGrid(
  stages: SketchStage[],
  size = 600
): Promise<string> {
  const gridSize = size * 2;
  const canvas = document.createElement("canvas");
  canvas.width = gridSize;
  canvas.height = gridSize;
  const ctx = canvas.getContext("2d")!;

  // Paper background
  ctx.fillStyle = `rgb(${PAPER_R}, ${PAPER_G}, ${PAPER_B})`;
  ctx.fillRect(0, 0, gridSize, gridSize);

  const positions = [
    [0, 0],
    [size, 0],
    [0, size],
    [size, size],
  ];

  for (let i = 0; i < Math.min(stages.length, 4); i++) {
    const [px, py] = positions[i];
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = stages[i].dataUrl;
    });
    ctx.drawImage(img, px, py, size, size);
  }

  // Draw grid divider lines
  ctx.strokeStyle = `rgba(${PAPER_R - 30}, ${PAPER_G - 30}, ${PAPER_B - 30}, 0.5)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(size, gridSize);
  ctx.moveTo(0, size);
  ctx.lineTo(gridSize, size);
  ctx.stroke();

  return canvas.toDataURL("image/png");
}
