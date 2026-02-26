export interface SketchStage {
  label: string;
  description: string;
  dataUrl: string;
}

const STAGE_DEFINITIONS = [
  {
    label: "Stage 1 — Basic Outline",
    description: "Faint head and face contour lines on cream paper",
  },
  {
    label: "Stage 2 — Clean Line Art",
    description: "Defined facial features with clean pencil strokes",
  },
  {
    label: "Stage 3 — Refined Sketch",
    description: "Hair outline and facial contour shading begins",
  },
  {
    label: "Stage 4 — Detailed Shading",
    description: "Directional hair strokes and facial plane shading",
  },
  {
    label: "Stage 5 — Finished Portrait",
    description: "Rich dark hair, full shading, sharp eye detail",
  },
];

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
  // Deterministic pseudo-random for consistent texture
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
// opacity: 0..1, darkness: 0..1 (0=paper, 1=very dark graphite)
function blendPencilStroke(
  paperR: number,
  paperG: number,
  paperB: number,
  strokeDarkness: number, // 0=no stroke, 1=full dark
  opacity: number
): [number, number, number] {
  // Graphite pencil color: dark grey with slight cool tint
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

// Stage 1: Very faint basic outline — only major contour edges, ~12% opacity
// Matches reference: barely visible head/face shape outline on cream
function applyStage1(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  // Use blurred edges to get smooth, clean contour lines
  const edges = sobelEdges(gray, width, height);
  const smoothEdges = gaussianBlur(edges, width, height, 2);

  // High threshold — only the strongest edges (major contours)
  const threshold = 30;
  const opacity = 0.12;

  for (let i = 0; i < gray.length; i++) {
    const e = smoothEdges[i];
    if (e > threshold) {
      const strokeDarkness = Math.min(1, (e - threshold) / 80);
      const grain = paperGrain(i) * 0.3;
      const [r, g, b] = blendPencilStroke(
        PAPER_R,
        PAPER_G,
        PAPER_B,
        strokeDarkness,
        opacity + grain * 0.01
      );
      output.data[i * 4] = r;
      output.data[i * 4 + 1] = g;
      output.data[i * 4 + 2] = b;
    }
  }
  return output;
}

// Stage 2: Clean line art — defined facial features, ~30% opacity
// Matches reference: clear face outline, eyes, nose, mouth, eyebrows, hair outline
function applyStage2(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const edges = sobelEdges(gray, width, height);
  const smoothEdges = gaussianBlur(edges, width, height, 1);

  const threshold = 18;
  const opacity = 0.30;

  for (let i = 0; i < gray.length; i++) {
    const e = smoothEdges[i];
    if (e > threshold) {
      const strokeDarkness = Math.min(1, (e - threshold) / 60);
      const grain = paperGrain(i + 1000);
      const [r, g, b] = blendPencilStroke(
        PAPER_R,
        PAPER_G,
        PAPER_B,
        strokeDarkness,
        opacity + grain * 0.005
      );
      output.data[i * 4] = r;
      output.data[i * 4 + 1] = g;
      output.data[i * 4 + 2] = b;
    }
  }
  return output;
}

// Stage 3: Refined sketch — hair outline + light facial shading, ~48% opacity
// Matches reference: hair starts to show directional strokes, face has light shading
function applyStage3(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const edges = sobelEdges(gray, width, height);
  const smoothEdges = gaussianBlur(edges, width, height, 1);

  // Tonal shading based on original luminance
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const g = gray[i];
      const e = smoothEdges[i];

      // Shading: dark areas of the image get light pencil tone
      // Only shade areas that are significantly darker than paper
      const tonalDarkness = Math.max(0, (180 - g) / 180);
      const edgeDarkness = Math.min(1, Math.max(0, (e - 15) / 55));

      // Hair region (very dark in original) gets directional strokes
      const isHairRegion = g < 80;
      const hairStroke =
        isHairRegion && (x + y * 2) % 5 < 2
          ? tonalDarkness * 0.35
          : 0;

      const combinedDarkness = Math.max(
        edgeDarkness * 0.48,
        tonalDarkness * 0.22,
        hairStroke
      );

      if (combinedDarkness > 0.02) {
        const grain = paperGrain(i + 2000) * 0.008;
        const [r, g2, b] = blendPencilStroke(
          PAPER_R,
          PAPER_G,
          PAPER_B,
          Math.min(1, combinedDarkness),
          Math.min(1, combinedDarkness + grain)
        );
        output.data[i * 4] = r;
        output.data[i * 4 + 1] = g2;
        output.data[i * 4 + 2] = b;
      }
    }
  }
  return output;
}

// Stage 4: Detailed shading — visible directional pencil hatching, ~68% opacity
// Matches reference: dark hair with clear strokes, facial planes shaded, strong contrast
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

      // Tonal mapping: map luminance to pencil darkness
      const tonalDarkness = Math.max(0, (200 - sharpened) / 200);
      const edgeDarkness = Math.min(1, Math.max(0, (e - 12) / 45));

      // Directional hatching for dark areas (hair, shadows)
      const isDark = g < 100;
      const isVeryDark = g < 50;

      // Primary diagonal strokes (hair direction)
      const hatch1 = isDark && (x + y) % 4 < 2 ? tonalDarkness * 0.55 : 0;
      // Cross-hatching for very dark areas
      const hatch2 =
        isVeryDark && (x - y + width) % 5 < 2 ? tonalDarkness * 0.45 : 0;
      // Fine strokes for mid-tones
      const hatch3 =
        g < 140 && g >= 80 && (x + y * 3) % 7 < 2
          ? tonalDarkness * 0.25
          : 0;

      const combinedDarkness = Math.max(
        edgeDarkness * 0.68,
        tonalDarkness * 0.38,
        hatch1,
        hatch2,
        hatch3
      );

      if (combinedDarkness > 0.015) {
        const grain = paperGrain(i + 3000) * 0.006;
        const [r, g2, b] = blendPencilStroke(
          PAPER_R,
          PAPER_G,
          PAPER_B,
          Math.min(1, combinedDarkness),
          Math.min(1, combinedDarkness + grain)
        );
        output.data[i * 4] = r;
        output.data[i * 4 + 1] = g2;
        output.data[i * 4 + 2] = b;
      }
    }
  }
  return output;
}

// Stage 5: Finished portrait — rich dark hair, full shading, sharp details, ~90% opacity
// Matches reference: near-photorealistic pencil portrait with full tonal range
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

      // S-curve contrast enhancement
      const normalized = sharpened / 255;
      const contrasted =
        normalized < 0.5
          ? 2 * normalized * normalized
          : 1 - Math.pow(-2 * normalized + 2, 2) / 2;
      const enhanced = contrasted * 255;

      // Full tonal mapping
      const tonalDarkness = Math.max(0, (220 - enhanced) / 220);
      const edgeDarkness = Math.min(1, Math.max(0, (e - 10) / 35));

      // Rich hair strokes — multiple directions for realistic hair texture
      const isHair = g < 70;
      const isShadow = g < 110;
      const isMidTone = g >= 110 && g < 170;

      // Primary hair strokes (diagonal)
      const hairStroke1 =
        isHair && (x + y) % 3 < 2 ? tonalDarkness * 0.85 : 0;
      // Secondary hair strokes (slightly different angle)
      const hairStroke2 =
        isHair && (x * 2 + y) % 4 < 2 ? tonalDarkness * 0.75 : 0;
      // Shadow hatching
      const shadowHatch =
        isShadow && (x - y + width) % 5 < 2 ? tonalDarkness * 0.55 : 0;
      // Mid-tone fine strokes
      const midToneStroke =
        isMidTone && (x + y * 2) % 8 < 2 ? tonalDarkness * 0.30 : 0;
      // Fine detail strokes for facial features
      const detailStroke =
        g < 150 && (x * 3 + y) % 11 < 2 ? tonalDarkness * 0.20 : 0;

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
          PAPER_R,
          PAPER_G,
          PAPER_B,
          Math.min(1, combinedDarkness),
          Math.min(1, combinedDarkness + grain)
        );
        output.data[i * 4] = r;
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
  // Check sessionStorage cache
  const cacheKey = `sketch_stages_v2_${jobId}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as SketchStage[];
      if (Array.isArray(parsed) && parsed.length === 5) {
        // Fire callbacks for cached stages
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
    if (width > height) {
      height = Math.round((height / width) * maxDim);
      width = maxDim;
    } else {
      width = Math.round((width / height) * maxDim);
      height = maxDim;
    }
  }

  const imageData = getImageData(img, width, height);
  const gray = toGrayscale(imageData.data);

  const stageFunctions = [
    () => applyStage1(gray, width, height),
    () => applyStage2(gray, width, height),
    () => applyStage3(gray, width, height),
    () => applyStage4(gray, width, height),
    () => applyStage5(gray, width, height),
  ];

  const stages: SketchStage[] = [];

  for (let i = 0; i < stageFunctions.length; i++) {
    // Yield to browser between stages to keep UI responsive
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    const imageDataResult = stageFunctions[i]();
    const dataUrl = imageDataToDataUrl(imageDataResult);

    const stage: SketchStage = {
      label: STAGE_DEFINITIONS[i].label,
      description: STAGE_DEFINITIONS[i].description,
      dataUrl,
    };

    stages.push(stage);
    onStageComplete?.(i, stage);
  }

  // Cache results
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(stages));
  } catch {
    // sessionStorage might be full
  }

  return stages;
}
