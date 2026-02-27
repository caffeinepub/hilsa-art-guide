export interface SketchStage {
  label: string;
  description: string;
  dataUrl: string;
}

export const STAGE_LABELS = [
  "Trace the outlines",
  "Draw the basic elements",
  "Have a slight shading",
  "Render and detail",
  "Polish",
];

export const STAGE_DESCRIPTIONS = [
  "Lightly trace the overall silhouette and major contours of the portrait as your foundational roadmap",
  "Draw in the basic facial elements with clean structural line work establishing correct placement and proportions",
  "Introduce light tonal shading to give the portrait form and dimension in the shadow areas",
  "Build up detailed rendering — refine features, add hair strand lines, and deepen shadow areas with hatching",
  "Smooth transitions, sharpen key edges, deepen dark values, and complete the full tonal range of the portrait.",
];

const STAGE_DEFINITIONS = STAGE_LABELS.map((label, i) => ({
  label,
  description: STAGE_DESCRIPTIONS[i],
}));

// Cream/parchment paper background color
const PAPER_R = 240;
const PAPER_G = 236;
const PAPER_B = 224;

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

// Add subtle paper texture grain
function paperGrain(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 8;
}

function fillPaperBackground(output: ImageData): void {
  for (let i = 0; i < output.data.length / 4; i++) {
    output.data[i * 4] = PAPER_R;
    output.data[i * 4 + 1] = PAPER_G;
    output.data[i * 4 + 2] = PAPER_B;
    output.data[i * 4 + 3] = 255;
  }
}

// Blend a dark pencil stroke onto the paper background
function blendPencilStroke(
  paperR: number,
  paperG: number,
  paperB: number,
  strokeDarkness: number,
  opacity: number
): [number, number, number] {
  const graphiteR = 40;
  const graphiteG = 38;
  const graphiteB = 42;

  const blended = opacity * strokeDarkness;
  const r = Math.round(paperR * (1 - blended) + graphiteR * blended);
  const g = Math.round(paperG * (1 - blended) + graphiteG * blended);
  const b = Math.round(paperB * (1 - blended) + graphiteB * blended);
  return [
    Math.max(0, Math.min(255, r)),
    Math.max(0, Math.min(255, g)),
    Math.max(0, Math.min(255, b)),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 1 — Trace the outlines
// Lightly trace the overall silhouette and major contours of the portrait
// as your foundational roadmap. Very faint lines (~10% opacity), minimal
// contrast, no shading — only the broadest outer contour survives.
// ─────────────────────────────────────────────────────────────────────────────
function applyStage1(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  // Heavy blur to keep only the broadest silhouette contour
  const edges = sobelEdges(gray, width, height);
  const smoothEdges = gaussianBlur(edges, width, height, 5);

  // Very high threshold — only the outermost contour survives
  const threshold = 50;
  const opacity = 0.09;

  for (let i = 0; i < gray.length; i++) {
    const e = smoothEdges[i];
    if (e > threshold) {
      const strokeDarkness = Math.min(1, (e - threshold) / 120);
      const grain = paperGrain(i) * 0.3;
      const [r, g, b] = blendPencilStroke(
        PAPER_R, PAPER_G, PAPER_B,
        strokeDarkness,
        opacity + grain * 0.01
      );
      output.data[i * 4]     = r;
      output.data[i * 4 + 1] = g;
      output.data[i * 4 + 2] = b;
    }
  }

  // Draw faint guide lines to simulate tracing reference marks
  const guideOpacity = 0.07;
  const guideStroke = 0.5;

  // Horizontal centre line
  const cy = Math.round(height * 0.5);
  for (let x = Math.round(width * 0.15); x < Math.round(width * 0.85); x++) {
    const i = cy * width + x;
    const [r, g, b] = blendPencilStroke(PAPER_R, PAPER_G, PAPER_B, guideStroke, guideOpacity);
    output.data[i * 4]     = r;
    output.data[i * 4 + 1] = g;
    output.data[i * 4 + 2] = b;
  }

  // Vertical centre line
  const cx = Math.round(width * 0.5);
  for (let y = Math.round(height * 0.1); y < Math.round(height * 0.9); y++) {
    const i = y * width + cx;
    const [r, g, b] = blendPencilStroke(PAPER_R, PAPER_G, PAPER_B, guideStroke, guideOpacity);
    output.data[i * 4]     = r;
    output.data[i * 4 + 1] = g;
    output.data[i * 4 + 2] = b;
  }

  // 1/3 horizontal markers
  for (let t = 1; t <= 3; t++) {
    const lineY = Math.round(height * (t / 3) * 0.8 + height * 0.1);
    for (let x = Math.round(width * 0.2); x < Math.round(width * 0.8); x++) {
      const i = lineY * width + x;
      const [r, g, b] = blendPencilStroke(PAPER_R, PAPER_G, PAPER_B, guideStroke * 0.6, guideOpacity * 0.7);
      output.data[i * 4]     = r;
      output.data[i * 4 + 1] = g;
      output.data[i * 4 + 2] = b;
    }
  }

  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 2 — Draw the basic elements
// Draw in the basic facial elements with clean structural line work
// establishing correct placement and proportions. Moderate contrast (~22%),
// no fill or shading — only clean lines.
// ─────────────────────────────────────────────────────────────────────────────
function applyStage2(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const edges = sobelEdges(gray, width, height);
  // Moderate blur — structural contours visible, inner features still soft
  const smoothEdges = gaussianBlur(edges, width, height, 2);

  const threshold = 22;
  const opacity = 0.24;

  for (let i = 0; i < gray.length; i++) {
    const e = smoothEdges[i];
    if (e > threshold) {
      const strokeDarkness = Math.min(1, (e - threshold) / 70);
      const grain = paperGrain(i + 1000);
      const [r, g, b] = blendPencilStroke(
        PAPER_R, PAPER_G, PAPER_B,
        strokeDarkness,
        opacity + grain * 0.005
      );
      output.data[i * 4]     = r;
      output.data[i * 4 + 1] = g;
      output.data[i * 4 + 2] = b;
    }
  }

  // Retain very faint guide lines from stage 1
  const guideOpacity = 0.05;
  const guideStroke = 0.4;
  const cy = Math.round(height * 0.5);
  for (let x = Math.round(width * 0.15); x < Math.round(width * 0.85); x++) {
    const i = cy * width + x;
    const [r, g, b] = blendPencilStroke(PAPER_R, PAPER_G, PAPER_B, guideStroke, guideOpacity);
    output.data[i * 4]     = r;
    output.data[i * 4 + 1] = g;
    output.data[i * 4 + 2] = b;
  }
  const cx = Math.round(width * 0.5);
  for (let y = Math.round(height * 0.1); y < Math.round(height * 0.9); y++) {
    const i = y * width + cx;
    const [r, g, b] = blendPencilStroke(PAPER_R, PAPER_G, PAPER_B, guideStroke, guideOpacity);
    output.data[i * 4]     = r;
    output.data[i * 4 + 1] = g;
    output.data[i * 4 + 2] = b;
  }

  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 3 — Have a slight shading
// Introduce light tonal shading to give the portrait form and dimension
// in the shadow areas. Light-grey tones appear in darker facial regions
// on top of the structural lines (~40% opacity).
// ─────────────────────────────────────────────────────────────────────────────
function applyStage3(
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

      // Tonal shading: dark areas get light pencil tone
      const tonalDarkness = Math.max(0, (185 - g) / 185);
      const edgeDarkness = Math.min(1, Math.max(0, (e - 15) / 55));

      // Hair region (very dark in original) gets slight blocked strokes
      const isHairRegion = g < 85;
      const hairBlock =
        isHairRegion && (x + y * 2) % 5 < 2
          ? tonalDarkness * 0.38
          : 0;

      // Slight shading for mid-dark areas (eyes, nose, lips)
      const isFeatureRegion = g < 130 && g >= 85;
      const featureBlock =
        isFeatureRegion && (x + y) % 4 < 2
          ? tonalDarkness * 0.22
          : 0;

      const combinedDarkness = Math.max(
        edgeDarkness * 0.40,
        tonalDarkness * 0.18,
        hairBlock,
        featureBlock
      );

      if (combinedDarkness > 0.02) {
        const grain = paperGrain(i + 2000) * 0.008;
        const [r, g2, b] = blendPencilStroke(
          PAPER_R, PAPER_G, PAPER_B,
          Math.min(1, combinedDarkness),
          Math.min(1, combinedDarkness + grain)
        );
        output.data[i * 4]     = r;
        output.data[i * 4 + 1] = g2;
        output.data[i * 4 + 2] = b;
      }
    }
  }
  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 4 — Render and detail
// Build up detailed rendering — refine features, add hair strand lines,
// and deepen shadow areas with hatching. ~60% opacity with directional
// hatching and unsharp masking for refined edge detail.
// ─────────────────────────────────────────────────────────────────────────────
function applyStage4(
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

      // Unsharp mask for detail
      const sharpened = Math.max(0, Math.min(255, g + (g - bg) * 1.2));

      const tonalDarkness = Math.max(0, (200 - sharpened) / 200);
      const edgeDarkness = Math.min(1, Math.max(0, (e - 12) / 45));

      const isDark = g < 100;
      const isVeryDark = g < 55;

      // Hair strand lines — diagonal direction
      const hairStrand1 = isDark && (x + y) % 4 < 2 ? tonalDarkness * 0.52 : 0;
      // Cross-hatching for very dark hair areas
      const hairStrand2 = isVeryDark && (x - y + width) % 5 < 2 ? tonalDarkness * 0.42 : 0;
      // Fine mid-tone strokes for facial shading
      const midTone = g < 145 && g >= 80 && (x + y * 3) % 7 < 2 ? tonalDarkness * 0.22 : 0;

      const combinedDarkness = Math.max(
        edgeDarkness * 0.60,
        tonalDarkness * 0.32,
        hairStrand1,
        hairStrand2,
        midTone
      );

      if (combinedDarkness > 0.015) {
        const grain = paperGrain(i + 3000) * 0.006;
        const [r, g2, b] = blendPencilStroke(
          PAPER_R, PAPER_G, PAPER_B,
          Math.min(1, combinedDarkness),
          Math.min(1, combinedDarkness + grain)
        );
        output.data[i * 4]     = r;
        output.data[i * 4 + 1] = g2;
        output.data[i * 4 + 2] = b;
      }
    }
  }
  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 5 — Polish
// Smooth transitions, sharpen key edges, deepen dark values, and complete
// the full tonal range of the portrait. ~90% opacity, full tonal range
// with S-curve contrast enhancement from near-white to near-black.
// ─────────────────────────────────────────────────────────────────────────────
function applyStage5(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const edges = sobelEdges(gray, width, height);
  const smoothEdges = gaussianBlur(edges, width, height, 1);
  const blurredGray = gaussianBlur(gray, width, height, 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const g = gray[i];
      const bg = blurredGray[i];
      const e = smoothEdges[i];

      // Strong unsharp mask for crisp detail
      const sharpened = Math.max(0, Math.min(255, g + (g - bg) * 1.8));

      // S-curve contrast enhancement for full tonal range
      const normalized = sharpened / 255;
      const contrasted =
        normalized < 0.5
          ? 2 * normalized * normalized
          : 1 - Math.pow(-2 * normalized + 2, 2) / 2;
      const enhanced = contrasted * 255;

      const tonalDarkness = Math.max(0, (220 - enhanced) / 220);
      const edgeDarkness = Math.min(1, Math.max(0, (e - 10) / 35));

      const isHair = g < 70;
      const isShadow = g < 110;
      const isMidTone = g >= 110 && g < 170;

      // Rich multi-directional hair strokes
      const hairStroke1 = isHair && (x + y) % 3 < 2 ? tonalDarkness * 0.85 : 0;
      const hairStroke2 = isHair && (x * 2 + y) % 4 < 2 ? tonalDarkness * 0.75 : 0;
      // Shadow hatching
      const shadowHatch = isShadow && (x - y + width) % 5 < 2 ? tonalDarkness * 0.55 : 0;
      // Mid-tone fine strokes for skin texture
      const midToneStroke = isMidTone && (x + y * 2) % 8 < 2 ? tonalDarkness * 0.30 : 0;
      // Fine detail strokes for facial features
      const detailStroke = g < 150 && (x * 3 + y) % 11 < 2 ? tonalDarkness * 0.20 : 0;

      const combinedDarkness = Math.max(
        edgeDarkness * 0.90,
        tonalDarkness * 0.55,
        hairStroke1,
        hairStroke2,
        shadowHatch,
        midToneStroke,
        detailStroke
      );

      if (combinedDarkness > 0.01) {
        const grain = paperGrain(i + 4000) * 0.004;
        const [r, g2, b] = blendPencilStroke(
          PAPER_R, PAPER_G, PAPER_B,
          Math.min(1, combinedDarkness),
          Math.min(1, combinedDarkness + grain)
        );
        output.data[i * 4]     = r;
        output.data[i * 4 + 1] = g2;
        output.data[i * 4 + 2] = b;
      }
    }
  }
  return output;
}

function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

export async function generatePencilSketchStages(
  imageSrc: string,
  jobId: string,
  onStageComplete?: (stageIndex: number, stage: SketchStage) => void
): Promise<SketchStage[]> {
  // Check sessionStorage cache — bump key to v5 to invalidate old cached results
  const cacheKey = `sketch_stages_v5_${jobId}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as SketchStage[];
      if (Array.isArray(parsed) && parsed.length === 5) {
        if (onStageComplete) {
          parsed.forEach((stage, idx) => onStageComplete(idx, stage));
        }
        return parsed;
      }
    } catch {
      // ignore parse errors
    }
  }

  const img = await loadImage(imageSrc);

  // Preserve aspect ratio, max 800px
  const maxDim = 800;
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;
  if (width > maxDim || height > maxDim) {
    const scale = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const imageData = getImageData(img, width, height);
  const gray = toGrayscale(imageData.data);

  const stageFns = [applyStage1, applyStage2, applyStage3, applyStage4, applyStage5];
  const results: SketchStage[] = [];

  for (let i = 0; i < stageFns.length; i++) {
    const stageImageData = stageFns[i](gray, width, height);
    const dataUrl = imageDataToDataUrl(stageImageData);
    const stage: SketchStage = {
      label: STAGE_DEFINITIONS[i].label,
      description: STAGE_DEFINITIONS[i].description,
      dataUrl,
    };
    results.push(stage);
    if (onStageComplete) {
      onStageComplete(i, stage);
    }
    // Yield to the browser between stages
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(results));
  } catch {
    // ignore storage errors
  }

  return results;
}
