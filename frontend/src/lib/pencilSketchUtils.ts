export interface SketchStage {
  label: string;
  description: string;
  dataUrl: string;
}

export type StageProgressCallback = (stageIndex: number, stage: SketchStage) => void;

const STAGE_DEFINITIONS = [
  {
    label: "Stage 1 — Light Outline",
    description: "Barely-visible ghost contours on clean cream paper",
  },
  {
    label: "Stage 2 — Basic Structure",
    description: "Light sketch with sparse directional hatching",
  },
  {
    label: "Stage 3 — Defined Features",
    description: "Medium cross-hatching with stronger facial detail",
  },
  {
    label: "Stage 4 — Hair & Shading",
    description: "Dense hatching with hair strokes and tonal shading",
  },
  {
    label: "Stage 5 — Final Artwork",
    description: "Fully detailed portrait with graphite grain and vignette",
  },
];

// Cream/parchment paper background
const PAPER_R = 242;
const PAPER_G = 238;
const PAPER_B = 226;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function toGrayscale(data: Uint8ClampedArray): Float32Array {
  const len = data.length >> 2;
  const gray = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  return gray;
}

interface SobelResult {
  magnitude: Float32Array;
  angleX: Float32Array;
  angleY: Float32Array;
}

function sobelEdges(gray: Float32Array, width: number, height: number): SobelResult {
  const magnitude = new Float32Array(gray.length);
  const angleX = new Float32Array(gray.length);
  const angleY = new Float32Array(gray.length);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx =
        -gray[(y - 1) * width + (x - 1)] + gray[(y - 1) * width + (x + 1)] +
        -2 * gray[y * width + (x - 1)] + 2 * gray[y * width + (x + 1)] +
        -gray[(y + 1) * width + (x - 1)] + gray[(y + 1) * width + (x + 1)];
      const gy =
        -gray[(y - 1) * width + (x - 1)] - 2 * gray[(y - 1) * width + x] - gray[(y - 1) * width + (x + 1)] +
        gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + gray[(y + 1) * width + (x + 1)];
      magnitude[idx] = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      angleX[idx] = gx;
      angleY[idx] = gy;
    }
  }
  return { magnitude, angleX, angleY };
}

// Optimized 1D separable Gaussian blur
function gaussianBlur(data: Float32Array, width: number, height: number, radius: number): Float32Array {
  if (radius <= 0) return data.slice();
  const sigma = Math.max(radius / 2, 0.5);
  const kernel: number[] = [];
  let sum = 0;
  for (let i = -radius; i <= radius; i++) {
    const val = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(val);
    sum += val;
  }
  const norm = kernel.map((v) => v / sum);

  const temp = new Float32Array(data.length);
  // Horizontal pass
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
  // Vertical pass
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

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function paperGrain(seed: number, strength = 3): number {
  return (pseudoRandom(seed) - 0.5) * strength;
}

function graphiteGrain(seed: number, strength = 12): number {
  return (pseudoRandom(seed * 1.618 + 999.9) - 0.5) * strength;
}

function fillPaperBackground(output: ImageData): void {
  const len = output.data.length >> 2;
  for (let i = 0; i < len; i++) {
    const grain = paperGrain(i, 3);
    output.data[i * 4] = Math.max(0, Math.min(255, PAPER_R + grain));
    output.data[i * 4 + 1] = Math.max(0, Math.min(255, PAPER_G + grain * 0.9));
    output.data[i * 4 + 2] = Math.max(0, Math.min(255, PAPER_B + grain * 0.7));
    output.data[i * 4 + 3] = 255;
  }
}

function blendPencilStroke(
  pr: number, pg: number, pb: number,
  strokeDarkness: number, opacity: number
): [number, number, number] {
  const graphiteR = 35, graphiteG = 33, graphiteB = 40;
  const blended = Math.min(1, opacity * strokeDarkness);
  return [
    Math.max(0, Math.min(255, Math.round(pr * (1 - blended) + graphiteR * blended))),
    Math.max(0, Math.min(255, Math.round(pg * (1 - blended) + graphiteG * blended))),
    Math.max(0, Math.min(255, Math.round(pb * (1 - blended) + graphiteB * blended))),
  ];
}

function hatchingPattern(x: number, y: number, angle: number, spacing: number, lineWidth: number): number {
  const proj = x * Math.cos(angle) + y * Math.sin(angle);
  const mod = ((proj % spacing) + spacing) % spacing;
  const distFromLine = Math.abs(mod - spacing / 2) - (spacing / 2 - lineWidth);
  if (distFromLine < 0) return 1;
  return Math.max(0, 1 - distFromLine / 0.8);
}

function applyVignette(output: ImageData, width: number, height: number, strength: number): void {
  const cx = width / 2, cy = height / 2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const dx = (x - cx) / cx, dy = (y - cy) / cy;
      const vignette = Math.pow(Math.min(1, Math.sqrt(dx * dx + dy * dy)), 2.5) * strength;
      output.data[i * 4] = Math.max(0, output.data[i * 4] - vignette * 60);
      output.data[i * 4 + 1] = Math.max(0, output.data[i * 4 + 1] - vignette * 58);
      output.data[i * 4 + 2] = Math.max(0, output.data[i * 4 + 2] - vignette * 55);
    }
  }
}

function applyPaperTexture(output: ImageData, width: number, height: number, strength: number): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const n1 = pseudoRandom(x * 0.1 + y * 0.13 + 1) - 0.5;
      const n2 = pseudoRandom(x * 0.3 + y * 0.37 + 2) - 0.5;
      const n3 = pseudoRandom(x * 0.7 + y * 0.71 + 3) - 0.5;
      const noise = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * strength;
      output.data[i * 4] = Math.max(0, Math.min(255, output.data[i * 4] + noise));
      output.data[i * 4 + 1] = Math.max(0, Math.min(255, output.data[i * 4 + 1] + noise * 0.9));
      output.data[i * 4 + 2] = Math.max(0, Math.min(255, output.data[i * 4 + 2] + noise * 0.7));
    }
  }
}

function imageDataToDataUrl(imageData: ImageData, width: number, height: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

// ─── STAGE 1: Ghost outlines only — no hatching ───────────────────────────────
function applyStage1(
  gray: Float32Array,
  smoothEdges: Float32Array, // pre-blurred with radius 3
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const edgeThreshold = 210;
  const maxEdgeOpacity = 0.12;

  for (let i = 0, len = width * height; i < len; i++) {
    const e = smoothEdges[i];
    if (e > edgeThreshold) {
      const t = Math.min(1, (e - edgeThreshold) / 45);
      const opacity = t * maxEdgeOpacity;
      const pr = output.data[i * 4], pg = output.data[i * 4 + 1], pb = output.data[i * 4 + 2];
      const [r, gv, b] = blendPencilStroke(pr, pg, pb, 1, opacity);
      output.data[i * 4] = r; output.data[i * 4 + 1] = gv; output.data[i * 4 + 2] = b;
    }
  }
  return output;
}

// ─── STAGE 2: Light directional hatching + clearer outlines ──────────────────
function applyStage2(
  gray: Float32Array,
  smoothEdges: Float32Array, // pre-blurred with radius 2
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const edgeThreshold = 155;
  const maxEdgeOpacity = 0.32;
  const hatchAngle = Math.PI / 4;
  const hatchSpacing = 10;
  const hatchLineWidth = 0.7;
  const hatchMaxOpacity = 0.28;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const e = smoothEdges[i];
      const g = gray[i];

      let edgeOpacity = 0;
      if (e > edgeThreshold) {
        edgeOpacity = Math.min(1, (e - edgeThreshold) / 60) * maxEdgeOpacity;
      }

      let hatchOpacity = 0;
      if (g < 190) {
        const tonalWeight = (190 - g) / 190;
        hatchOpacity = hatchingPattern(x, y, hatchAngle, hatchSpacing, hatchLineWidth) * tonalWeight * hatchMaxOpacity;
      }

      const combinedOpacity = Math.max(edgeOpacity, hatchOpacity);
      if (combinedOpacity > 0.005) {
        const pr = output.data[i * 4], pg = output.data[i * 4 + 1], pb = output.data[i * 4 + 2];
        const [r, gv, b] = blendPencilStroke(pr, pg, pb, 1, combinedOpacity);
        output.data[i * 4] = r; output.data[i * 4 + 1] = gv; output.data[i * 4 + 2] = b;
      }
    }
  }
  return output;
}

// ─── STAGE 3: Medium cross-hatching + stronger edges ─────────────────────────
function applyStage3(
  gray: Float32Array,
  smoothEdges: Float32Array, // pre-blurred with radius 1
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const edgeThreshold = 125;
  const maxEdgeOpacity = 0.52;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const e = smoothEdges[i];
      const g = gray[i];
      const tonalDarkness = Math.max(0, (200 - g) / 200);

      let edgeOpacity = 0;
      if (e > edgeThreshold) {
        edgeOpacity = Math.min(1, (e - edgeThreshold) / 55) * maxEdgeOpacity;
      }

      const strokeSpacing = Math.max(5, 11 - tonalDarkness * 5);
      const strokeThickness = 0.6 + tonalDarkness * 1.2;
      const hatch1 = g < 185
        ? hatchingPattern(x, y, Math.PI / 4, strokeSpacing, strokeThickness) * tonalDarkness * 0.42
        : 0;
      const hatch2 = g < 120
        ? hatchingPattern(x, y, -Math.PI / 4, strokeSpacing * 1.3, strokeThickness * 0.85) * tonalDarkness * 0.30
        : 0;

      const combinedOpacity = Math.max(edgeOpacity, hatch1, hatch2);
      if (combinedOpacity > 0.01) {
        const grain = paperGrain(i + 2000, 2) * 0.005;
        const pr = output.data[i * 4], pg = output.data[i * 4 + 1], pb = output.data[i * 4 + 2];
        const [r, gv, b] = blendPencilStroke(pr, pg, pb, 1, Math.min(1, combinedOpacity + grain));
        output.data[i * 4] = r; output.data[i * 4 + 1] = gv; output.data[i * 4 + 2] = b;
      }
    }
  }
  return output;
}

// ─── STAGE 4: Dense cross-hatching + hair strokes ────────────────────────────
function applyStage4(
  gray: Float32Array,
  smoothEdges: Float32Array, // pre-blurred with radius 1
  blurredGray: Float32Array, // pre-blurred with radius 2
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const edgeThreshold = 88;
  const maxEdgeOpacity = 0.72;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const e = smoothEdges[i];
      const g = gray[i];
      const bg = blurredGray[i];
      const tonalDarkness = Math.max(0, (210 - g) / 210);
      const softTone = Math.max(0, (210 - bg) / 210);

      let edgeOpacity = 0;
      if (e > edgeThreshold) {
        edgeOpacity = Math.min(1, (e - edgeThreshold) / 45) * maxEdgeOpacity;
      }

      const strokeSpacing = Math.max(3, 8 - tonalDarkness * 4);
      const strokeThickness = 0.7 + tonalDarkness * 1.6;
      const hatch1 = g < 200
        ? hatchingPattern(x, y, Math.PI / 4, strokeSpacing, strokeThickness) * tonalDarkness * 0.58
        : 0;
      const hatch2 = g < 160
        ? hatchingPattern(x, y, -Math.PI / 4, strokeSpacing * 1.1, strokeThickness * 0.9) * tonalDarkness * 0.48
        : 0;
      const hatch3 = g < 90
        ? hatchingPattern(x, y, 0, strokeSpacing * 1.4, strokeThickness * 0.75) * tonalDarkness * 0.38
        : 0;
      const blendedShade = softTone * 0.28;
      const gGrain = graphiteGrain(i + 3000, 12);
      const grainContrib = tonalDarkness > 0.1 ? gGrain * tonalDarkness * 0.012 : 0;

      const combinedOpacity = Math.max(edgeOpacity, blendedShade, hatch1, hatch2, hatch3) + grainContrib;
      if (combinedOpacity > 0.01) {
        const pr = output.data[i * 4], pg = output.data[i * 4 + 1], pb = output.data[i * 4 + 2];
        const [r, gv, b] = blendPencilStroke(pr, pg, pb, 1, Math.min(1, combinedOpacity));
        output.data[i * 4] = r; output.data[i * 4 + 1] = gv; output.data[i * 4 + 2] = b;
      }
    }
  }
  return output;
}

// ─── STAGE 5: Full detailed artwork with paper texture + vignette ─────────────
function applyStage5(
  gray: Float32Array,
  smoothEdges: Float32Array, // pre-blurred with radius 1
  blurredGray: Float32Array, // pre-blurred with radius 3
  blurredGray2: Float32Array, // pre-blurred with radius 1
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const edgeThreshold = 58;
  const maxEdgeOpacity = 0.90;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const e = smoothEdges[i];
      const g = gray[i];
      const bg = blurredGray[i];
      const bg2 = blurredGray2[i];

      // Unsharp mask
      const sharpened = Math.max(0, Math.min(255, g + (g - bg2) * 1.0));
      // S-curve tonal compression
      const normalized = sharpened / 255;
      const sCurve = normalized < 0.5
        ? 2 * normalized * normalized
        : 1 - Math.pow(-2 * normalized + 2, 2) / 2;
      const tonalDarkness = Math.max(0, 1 - sCurve);
      const softTone = Math.max(0, (220 - bg) / 220);

      let edgeOpacity = 0;
      if (e > edgeThreshold) {
        edgeOpacity = Math.min(1, (e - edgeThreshold) / 40) * maxEdgeOpacity;
      }

      const strokeSpacing = Math.max(2, 7 - tonalDarkness * 4);
      const strokeThickness = 0.8 + tonalDarkness * 2.0;
      const hatch1 = hatchingPattern(x, y, Math.PI / 4, strokeSpacing, strokeThickness) * tonalDarkness * 0.70;
      const hatch2 = tonalDarkness > 0.25
        ? hatchingPattern(x, y, -Math.PI / 4, strokeSpacing * 1.1, strokeThickness * 0.9) * tonalDarkness * 0.60
        : 0;
      const hatch3 = tonalDarkness > 0.45
        ? hatchingPattern(x, y, 0, strokeSpacing * 1.3, strokeThickness * 0.8) * tonalDarkness * 0.50
        : 0;
      const hatch4 = tonalDarkness > 0.60
        ? hatchingPattern(x, y, Math.PI / 6, strokeSpacing * 1.5, strokeThickness * 0.7) * tonalDarkness * 0.40
        : 0;
      const hatch5 = tonalDarkness > 0.75
        ? hatchingPattern(x, y, -Math.PI / 6, strokeSpacing * 1.7, strokeThickness * 0.65) * tonalDarkness * 0.35
        : 0;
      const blendedShade = softTone * 0.45;
      const gGrain = graphiteGrain(i + 5000, 14);
      const grainContrib = tonalDarkness > 0.05 ? gGrain * tonalDarkness * 0.018 : 0;

      const combinedOpacity = Math.max(edgeOpacity, blendedShade, hatch1, hatch2, hatch3, hatch4, hatch5) + grainContrib;
      if (combinedOpacity > 0.005) {
        const pr = output.data[i * 4], pg = output.data[i * 4 + 1], pb = output.data[i * 4 + 2];
        const [r, gv, b] = blendPencilStroke(pr, pg, pb, 1, Math.min(1, combinedOpacity));
        output.data[i * 4] = r; output.data[i * 4 + 1] = gv; output.data[i * 4 + 2] = b;
      }
    }
  }

  applyPaperTexture(output, width, height, 18);
  applyVignette(output, width, height, 0.55);
  return output;
}

// ─── Yield to browser between heavy stages ────────────────────────────────────
function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// ─── Main export: generates all 5 stages with progressive callbacks ───────────
export async function generatePencilSketchStages(
  imageSrc: string,
  onStageComplete?: StageProgressCallback
): Promise<SketchStage[]> {
  const img = await loadImage(imageSrc);

  // Downscale for speed: max 600px on longest side
  const MAX_DIM = 600;
  const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
  const width = Math.round((img.naturalWidth || img.width) * scale);
  const height = Math.round((img.naturalHeight || img.height) * scale);

  // Draw source image once
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext("2d")!;
  srcCtx.drawImage(img, 0, 0, width, height);
  const srcData = srcCtx.getImageData(0, 0, width, height);

  // ── Shared pre-computations (run ONCE) ──────────────────────────────────────
  const gray = toGrayscale(srcData.data);
  await yieldToMain();

  const { magnitude: rawEdges } = sobelEdges(gray, width, height);
  await yieldToMain();

  // Pre-blur at different radii — reused across stages
  const edges_r3 = gaussianBlur(rawEdges, width, height, 3); // Stage 1
  await yieldToMain();
  const edges_r2 = gaussianBlur(rawEdges, width, height, 2); // Stage 2
  await yieldToMain();
  const edges_r1 = gaussianBlur(rawEdges, width, height, 1); // Stages 3, 4, 5
  await yieldToMain();
  const blurGray_r2 = gaussianBlur(gray, width, height, 2);  // Stage 4
  await yieldToMain();
  const blurGray_r3 = gaussianBlur(gray, width, height, 3);  // Stage 5
  await yieldToMain();
  // blurGray_r1 reuses edges_r1 concept but on gray
  const blurGray_r1 = gaussianBlur(gray, width, height, 1);  // Stage 5 unsharp
  await yieldToMain();

  // ── Generate each stage, yield between them ──────────────────────────────────
  const results: SketchStage[] = [];

  const stageProcessors = [
    () => applyStage1(gray, edges_r3, width, height),
    () => applyStage2(gray, edges_r2, width, height),
    () => applyStage3(gray, edges_r1, width, height),
    () => applyStage4(gray, edges_r1, blurGray_r2, width, height),
    () => applyStage5(gray, edges_r1, blurGray_r3, blurGray_r1, width, height),
  ];

  for (let i = 0; i < 5; i++) {
    const imageData = stageProcessors[i]();
    const dataUrl = imageDataToDataUrl(imageData, width, height);
    const stage: SketchStage = {
      label: STAGE_DEFINITIONS[i].label,
      description: STAGE_DEFINITIONS[i].description,
      dataUrl,
    };
    results.push(stage);
    if (onStageComplete) onStageComplete(i, stage);
    await yieldToMain(); // yield between stages so UI can update
  }

  return results;
}
