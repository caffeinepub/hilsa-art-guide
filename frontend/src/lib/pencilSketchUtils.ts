export interface SketchStage {
  label: string;
  description: string;
  dataUrl: string;
}

const STAGE_DEFINITIONS = [
  {
    label: "Stage 1 — Light Hatching",
    description: "Initial light pencil strokes with fine hatching on cream paper",
  },
  {
    label: "Stage 2 — Directional Strokes",
    description: "Structured edge-following directional pencil lines",
  },
  {
    label: "Stage 3 — Cross-Hatching & Detail",
    description: "Cross-hatched shadows with variable stroke thickness",
  },
  {
    label: "Stage 4 — Graphite Shading",
    description: "Soft blended shading with graphite grain texture",
  },
  {
    label: "Stage 5 — Final Pencil Artwork",
    description: "Polished hand-drawn look with paper grain and vignette",
  },
];

// Cream/parchment paper background color
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
): { magnitude: Float32Array; angleX: Float32Array; angleY: Float32Array } {
  const magnitude = new Float32Array(gray.length);
  const angleX = new Float32Array(gray.length);
  const angleY = new Float32Array(gray.length);

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
      magnitude[idx] = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      angleX[idx] = gx;
      angleY[idx] = gy;
    }
  }
  return { magnitude, angleX, angleY };
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

// Deterministic pseudo-random for consistent texture
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Paper grain noise
function paperGrain(seed: number, strength: number = 8): number {
  return (pseudoRandom(seed) - 0.5) * strength;
}

// Graphite grain — coarser than paper grain
function graphiteGrain(seed: number, strength: number = 12): number {
  return (pseudoRandom(seed * 1.618 + 999.9) - 0.5) * strength;
}

function fillPaperBackground(output: ImageData): void {
  for (let i = 0; i < output.data.length / 4; i++) {
    const grain = paperGrain(i, 3);
    output.data[i * 4] = Math.max(0, Math.min(255, PAPER_R + grain));
    output.data[i * 4 + 1] = Math.max(0, Math.min(255, PAPER_G + grain * 0.9));
    output.data[i * 4 + 2] = Math.max(0, Math.min(255, PAPER_B + grain * 0.7));
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
  // Graphite pencil color: dark grey with slight cool tint
  const graphiteR = 35;
  const graphiteG = 33;
  const graphiteB = 40;

  const blended = Math.min(1, opacity * strokeDarkness);
  const r = Math.round(paperR * (1 - blended) + graphiteR * blended);
  const g = Math.round(paperG * (1 - blended) + graphiteG * blended);
  const b = Math.round(paperB * (1 - blended) + graphiteB * blended);
  return [
    Math.max(0, Math.min(255, r)),
    Math.max(0, Math.min(255, g)),
    Math.max(0, Math.min(255, b)),
  ];
}

// Generate hatching pattern: returns 0..1 stroke intensity at (x,y)
function hatchingPattern(
  x: number,
  y: number,
  angle: number,
  spacing: number,
  lineWidth: number
): number {
  const proj = x * Math.cos(angle) + y * Math.sin(angle);
  const mod = ((proj % spacing) + spacing) % spacing;
  const distFromLine = Math.abs(mod - spacing / 2) - (spacing / 2 - lineWidth);
  if (distFromLine < 0) return 1;
  const softness = 0.8;
  return Math.max(0, 1 - distFromLine / softness);
}

// Apply vignette darkening from edges inward
function applyVignette(
  output: ImageData,
  width: number,
  height: number,
  strength: number
): void {
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const vignette = Math.pow(Math.min(1, dist), 2.5) * strength;

      output.data[i * 4] = Math.max(0, output.data[i * 4] - vignette * 60);
      output.data[i * 4 + 1] = Math.max(0, output.data[i * 4 + 1] - vignette * 58);
      output.data[i * 4 + 2] = Math.max(0, output.data[i * 4 + 2] - vignette * 55);
    }
  }
}

// Apply paper texture (Perlin-like noise)
function applyPaperTexture(
  output: ImageData,
  width: number,
  height: number,
  strength: number
): void {
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

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 1: Barely-visible outlines only — NO hatching
// Very high edge threshold (200–220), extremely low opacity (~0.10–0.15)
// Result: faint ghost-like contour lines on clean cream paper
// ─────────────────────────────────────────────────────────────────────────────
function applyStage1(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const { magnitude: edges } = sobelEdges(gray, width, height);
  // Heavy blur to soften and reduce noise — only the boldest contours survive
  const smoothEdges = gaussianBlur(edges, width, height, 3);

  // Very high threshold: only the strongest 10% of edges show at all
  const edgeThreshold = 210;
  // Extremely low opacity — barely perceptible marks
  const maxEdgeOpacity = 0.12;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const e = smoothEdges[i];

      if (e > edgeThreshold) {
        // Ramp from 0 → maxEdgeOpacity over a narrow range above threshold
        const t = Math.min(1, (e - edgeThreshold) / 45);
        const opacity = t * maxEdgeOpacity;

        const pr = output.data[i * 4];
        const pg = output.data[i * 4 + 1];
        const pb = output.data[i * 4 + 2];
        const [r, gv, b] = blendPencilStroke(pr, pg, pb, 1, opacity);
        output.data[i * 4] = r;
        output.data[i * 4 + 1] = gv;
        output.data[i * 4 + 2] = b;
      }
    }
  }

  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 2: Light directional hatching + clearer outlines
// Edge threshold ~150–170, single-direction sparse hatching (opacity ~0.25–0.35)
// Result: visible outlines with light diagonal hatching in mid-tone areas
// ─────────────────────────────────────────────────────────────────────────────
function applyStage2(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const { magnitude: edges, angleX, angleY } = sobelEdges(gray, width, height);
  const smoothEdges = gaussianBlur(edges, width, height, 2);

  const edgeThreshold = 155;
  const maxEdgeOpacity = 0.32;

  // Sparse single-direction hatching
  const hatchAngle = Math.PI / 4; // 45°
  const hatchSpacing = 10;
  const hatchLineWidth = 0.7;
  const hatchMaxOpacity = 0.28;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const e = smoothEdges[i];
      const g = gray[i];

      // Edge contribution
      let edgeOpacity = 0;
      if (e > edgeThreshold) {
        const t = Math.min(1, (e - edgeThreshold) / 60);
        edgeOpacity = t * maxEdgeOpacity;
      }

      // Light hatching only in mid-tone and dark areas
      let hatchOpacity = 0;
      if (g < 190) {
        const tonalWeight = Math.max(0, (190 - g) / 190);
        const hatchIntensity = hatchingPattern(x, y, hatchAngle, hatchSpacing, hatchLineWidth);
        hatchOpacity = hatchIntensity * tonalWeight * hatchMaxOpacity;
      }

      const combinedOpacity = Math.max(edgeOpacity, hatchOpacity);

      if (combinedOpacity > 0.005) {
        const pr = output.data[i * 4];
        const pg = output.data[i * 4 + 1];
        const pb = output.data[i * 4 + 2];
        const [r, gv, b] = blendPencilStroke(pr, pg, pb, 1, combinedOpacity);
        output.data[i * 4] = r;
        output.data[i * 4 + 1] = gv;
        output.data[i * 4 + 2] = b;
      }
    }
  }

  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 3: Medium-density hatching + stronger edges
// Edge threshold ~120–140, two hatching directions (primary + secondary in shadows)
// Opacity ~0.45–0.55 — noticeably darker than Stage 2
// ─────────────────────────────────────────────────────────────────────────────
function applyStage3(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const { magnitude: edges, angleX, angleY } = sobelEdges(gray, width, height);
  const smoothEdges = gaussianBlur(edges, width, height, 1);

  const edgeThreshold = 125;
  const maxEdgeOpacity = 0.52;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const e = smoothEdges[i];
      const g = gray[i];

      const tonalDarkness = Math.max(0, (200 - g) / 200);

      // Edge contribution — stronger than stage 2
      let edgeOpacity = 0;
      if (e > edgeThreshold) {
        const t = Math.min(1, (e - edgeThreshold) / 55);
        edgeOpacity = t * maxEdgeOpacity;
      }

      // Primary hatching (45°) — medium density
      const strokeSpacing = Math.max(5, 11 - tonalDarkness * 5);
      const strokeThickness = 0.6 + tonalDarkness * 1.2;
      const hatch1 = g < 185
        ? hatchingPattern(x, y, Math.PI / 4, strokeSpacing, strokeThickness) * tonalDarkness * 0.42
        : 0;

      // Secondary hatching (-45°) only in shadow areas
      const hatch2 = g < 120
        ? hatchingPattern(x, y, -Math.PI / 4, strokeSpacing * 1.3, strokeThickness * 0.85) * tonalDarkness * 0.30
        : 0;

      const combinedOpacity = Math.max(edgeOpacity, hatch1, hatch2);

      if (combinedOpacity > 0.01) {
        const grain = paperGrain(i + 2000, 2) * 0.005;
        const pr = output.data[i * 4];
        const pg = output.data[i * 4 + 1];
        const pb = output.data[i * 4 + 2];
        const [r, gv, b] = blendPencilStroke(pr, pg, pb, 1, Math.min(1, combinedOpacity + grain));
        output.data[i * 4] = r;
        output.data[i * 4 + 1] = gv;
        output.data[i * 4 + 2] = b;
      }
    }
  }

  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 4: Dense cross-hatching + high-contrast edges
// Edge threshold ~80–100, perpendicular cross-hatching with increased opacity (~0.65–0.75)
// Clearly darker than Stage 3 with richer tonal range
// ─────────────────────────────────────────────────────────────────────────────
function applyStage4(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const { magnitude: edges, angleX, angleY } = sobelEdges(gray, width, height);
  const smoothEdges = gaussianBlur(edges, width, height, 1);
  const blurredGray = gaussianBlur(gray, width, height, 2);

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

      // Strong edge contribution
      let edgeOpacity = 0;
      if (e > edgeThreshold) {
        const t = Math.min(1, (e - edgeThreshold) / 45);
        edgeOpacity = t * maxEdgeOpacity;
      }

      // Dense primary hatching (45°)
      const strokeSpacing = Math.max(3, 8 - tonalDarkness * 4);
      const strokeThickness = 0.7 + tonalDarkness * 1.6;
      const hatch1 = g < 200
        ? hatchingPattern(x, y, Math.PI / 4, strokeSpacing, strokeThickness) * tonalDarkness * 0.58
        : 0;

      // Cross-hatching (-45°) in mid-tones and shadows
      const hatch2 = g < 160
        ? hatchingPattern(x, y, -Math.PI / 4, strokeSpacing * 1.1, strokeThickness * 0.9) * tonalDarkness * 0.48
        : 0;

      // Third direction (horizontal) in deep shadows
      const hatch3 = g < 90
        ? hatchingPattern(x, y, 0, strokeSpacing * 1.4, strokeThickness * 0.75) * tonalDarkness * 0.38
        : 0;

      // Soft tonal base from blurred gray
      const blendedShade = softTone * 0.28;

      // Graphite grain
      const gGrain = graphiteGrain(i + 3000, 12);
      const grainContrib = tonalDarkness > 0.1 ? gGrain * tonalDarkness * 0.012 : 0;

      const combinedOpacity = Math.max(edgeOpacity, blendedShade, hatch1, hatch2, hatch3) + grainContrib;

      if (combinedOpacity > 0.01) {
        const pr = output.data[i * 4];
        const pg = output.data[i * 4 + 1];
        const pb = output.data[i * 4 + 2];
        const [r, gv, b] = blendPencilStroke(pr, pg, pb, 1, Math.min(1, combinedOpacity));
        output.data[i * 4] = r;
        output.data[i * 4 + 1] = gv;
        output.data[i * 4 + 2] = b;
      }
    }
  }

  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 5: Full detailed cross-hatched artwork
// Edge threshold ~50–70, multi-direction dense hatching, high opacity (~0.85–0.95)
// Paper texture, vignette, S-curve tonal compression — hand-drawn pencil look
// ─────────────────────────────────────────────────────────────────────────────
function applyStage5(
  gray: Float32Array,
  width: number,
  height: number
): ImageData {
  const output = new ImageData(width, height);
  fillPaperBackground(output);

  const { magnitude: edges, angleX, angleY } = sobelEdges(gray, width, height);
  const smoothEdges = gaussianBlur(edges, width, height, 1);
  const blurredGray = gaussianBlur(gray, width, height, 3);
  const blurredGray2 = gaussianBlur(gray, width, height, 1);

  const edgeThreshold = 58;
  const maxEdgeOpacity = 0.90;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const e = smoothEdges[i];
      const g = gray[i];
      const bg = blurredGray[i];
      const bg2 = blurredGray2[i];

      // Unsharp mask for fine detail
      const sharpened = Math.max(0, Math.min(255, g + (g - bg2) * 1.0));

      // S-curve tonal compression: boost mid-tones, deepen shadows
      const normalized = sharpened / 255;
      const sCurve = normalized < 0.5
        ? 2 * normalized * normalized
        : 1 - Math.pow(-2 * normalized + 2, 2) / 2;
      const tonalDarkness = Math.max(0, 1 - sCurve);

      const softTone = Math.max(0, (215 - bg) / 215);

      // Very strong edge contribution
      let edgeOpacity = 0;
      if (e > edgeThreshold) {
        const t = Math.min(1, (e - edgeThreshold) / 35);
        edgeOpacity = t * maxEdgeOpacity;
      }

      // Dense primary hatching (45°)
      const strokeSpacing = Math.max(2.5, 7 - tonalDarkness * 4);
      const strokeThickness = 0.8 + tonalDarkness * 1.8;
      const hatch1 = g < 220
        ? hatchingPattern(x, y, Math.PI / 4, strokeSpacing, strokeThickness) * tonalDarkness * 0.72
        : 0;

      // Cross-hatching (-45°) in mid-tones and shadows
      const hatch2 = g < 175
        ? hatchingPattern(x, y, -Math.PI / 4, strokeSpacing * 1.05, strokeThickness * 0.92) * tonalDarkness * 0.62
        : 0;

      // Horizontal hatching in shadows
      const hatch3 = g < 120
        ? hatchingPattern(x, y, 0, strokeSpacing * 1.2, strokeThickness * 0.80) * tonalDarkness * 0.52
        : 0;

      // Vertical hatching in deep shadows
      const hatch4 = g < 75
        ? hatchingPattern(x, y, Math.PI / 2, strokeSpacing * 1.35, strokeThickness * 0.70) * tonalDarkness * 0.42
        : 0;

      // Directional strokes following edge gradient in darkest areas
      const ax = angleX[i];
      const ay = angleY[i];
      const edgeMag = Math.sqrt(ax * ax + ay * ay) + 0.001;
      const edgeAngle = Math.atan2(ay / edgeMag, ax / edgeMag);
      const hatch5 = g < 60
        ? hatchingPattern(x, y, edgeAngle, strokeSpacing * 0.9, strokeThickness * 1.1) * tonalDarkness * 0.65
        : 0;

      // Soft tonal base
      const blendedShade = softTone * 0.38;

      // Graphite grain — prominent in Stage 5
      const gGrain = graphiteGrain(i + 4000, 18);
      const grainContrib = tonalDarkness > 0.05 ? gGrain * tonalDarkness * 0.018 : 0;

      const combinedOpacity = Math.max(
        edgeOpacity,
        blendedShade,
        hatch1,
        hatch2,
        hatch3,
        hatch4,
        hatch5
      ) + grainContrib;

      if (combinedOpacity > 0.008) {
        const pr = output.data[i * 4];
        const pg = output.data[i * 4 + 1];
        const pb = output.data[i * 4 + 2];
        const [r, gv, b] = blendPencilStroke(pr, pg, pb, 1, Math.min(1, combinedOpacity));
        output.data[i * 4] = r;
        output.data[i * 4 + 1] = gv;
        output.data[i * 4 + 2] = b;
      }
    }
  }

  // Multi-frequency paper texture for authentic feel
  applyPaperTexture(output, width, height, 10);
  // Subtle vignette to frame the artwork
  applyVignette(output, width, height, 0.6);

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
  imageSrc: string
): Promise<SketchStage[]> {
  const img = await loadImage(imageSrc);

  // Cap at 600px for performance while preserving aspect ratio
  const maxDim = 600;
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;
  if (width > maxDim || height > maxDim) {
    const scale = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const imageData = getImageData(img, width, height);
  const gray = toGrayscale(imageData.data);

  const stageFunctions = [
    applyStage1,
    applyStage2,
    applyStage3,
    applyStage4,
    applyStage5,
  ];

  const stages: SketchStage[] = [];

  for (let s = 0; s < 5; s++) {
    const stageImageData = stageFunctions[s](gray, width, height);
    const dataUrl = imageDataToDataUrl(stageImageData);
    stages.push({
      label: STAGE_DEFINITIONS[s].label,
      description: STAGE_DEFINITIONS[s].description,
      dataUrl,
    });
  }

  return stages;
}
