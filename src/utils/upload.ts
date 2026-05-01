/**
 * Image processing for the card photo / logo fields.
 *
 * Storage strategy:
 * --------------------------------------------------------------------------
 * Firebase Storage now requires the Blaze (paid) plan, so we don't use it.
 * Instead we:
 *   1. Compress aggressively in the browser (max 400px on the longest edge,
 *      ~75% JPEG quality → typically 20–60 KB).
 *   2. Re-encode through a canvas, which strips ALL EXIF metadata
 *      (including GPS coordinates, device info, timestamps).
 *   3. Return a base64 data URL that lives directly in the Firestore card
 *      document. Firestore allows 1 MB per doc — two images here cost
 *      ~50–120 KB total.
 *
 * Privacy:
 *   - No file ever leaves the user's device unprocessed.
 *   - GPS / device tags are dropped at the canvas re-encode step.
 *   - Card photos are public (the public card page renders them) — same
 *      as before, only authenticated users can write to their own card.
 */

export const MAX_RAW_BYTES = 8 * 1024 * 1024; // 8MB ingress limit before compression
export const MAX_OUTPUT_BYTES = 200 * 1024;   // 200KB safety ceiling after compression

interface CompressOpts {
  maxDim?: number;
  quality?: number;
}

async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read file"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("Couldn't decode image"));
    img.onload = () => resolve(img);
    img.src = src;
  });
}

function canvasToDataURL(img: HTMLImageElement, maxDim: number, quality: number): string {
  let { width, height } = img;
  if (width > height && width > maxDim) {
    height = Math.round((height * maxDim) / width);
    width = maxDim;
  } else if (height > maxDim) {
    width = Math.round((width * maxDim) / height);
    height = maxDim;
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Compress an image and return a base64 data URL. Iteratively shrinks if
 * the result would still exceed the size ceiling.
 */
export async function compressImageToDataURL(file: File, opts: CompressOpts = {}): Promise<string> {
  const { maxDim = 400, quality = 0.75 } = opts;
  if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed.');
  if (file.size > MAX_RAW_BYTES) throw new Error('Image is too large (max 8MB).');

  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);

  let dim = maxDim;
  let q = quality;
  let out = canvasToDataURL(img, dim, q);

  // If output is too big, downscale further. Two passes is plenty.
  let attempts = 0;
  while (out.length > MAX_OUTPUT_BYTES * 1.37 /* ~base64 overhead */ && attempts < 4) {
    dim = Math.max(200, Math.round(dim * 0.8));
    q = Math.max(0.5, q - 0.1);
    out = canvasToDataURL(img, dim, q);
    attempts++;
  }

  if (out.length > MAX_OUTPUT_BYTES * 1.37) {
    throw new Error('Image is too dense — try a smaller photo.');
  }
  return out;
}

/**
 * Public API used by PhotoUpload. Returns a data URL that gets written
 * straight into the card document.
 */
export async function uploadImage(
  _uid: string,
  _kind: 'profile' | 'logo',
  file: File
): Promise<string> {
  return compressImageToDataURL(file);
}
