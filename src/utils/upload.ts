/**
 * Image upload utilities with client-side compression + EXIF strip for privacy.
 *
 * - Client compresses to max 800px on the longest edge (good enough for card photos).
 * - Re-encodes as JPEG via canvas, which strips ALL EXIF (incl. GPS).
 * - Storage rules constrain file size and content type server-side.
 */
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export const MAX_RAW_BYTES = 8 * 1024 * 1024; // 8MB ingress limit before compression

export async function compressImage(
  file: File,
  maxDim = 800,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't decode image"));
      img.onload = () => {
        try {
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
          if (!ctx) return reject(new Error('Canvas not supported'));
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            blob => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
            'image/jpeg',
            quality
          );
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(
  uid: string,
  kind: 'profile' | 'logo',
  file: File
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }
  if (file.size > MAX_RAW_BYTES) {
    throw new Error('Image is too large (max 8MB).');
  }
  const blob = await compressImage(file);
  // Stable filename per kind so re-uploads replace the previous file.
  const path = `users/${uid}/${kind}.jpg`;
  const r = ref(storage, path);
  try {
    await uploadBytes(r, blob, {
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=3600',
    });
  } catch (e: any) {
    // Friendlier error if Storage isn't enabled on the Firebase project yet.
    const code = e?.code || '';
    if (code.includes('unauthorized') || code.includes('storage/unauthorized')) {
      throw new Error("Storage access denied. Please re-sign-in or contact the admin.");
    }
    if (code.includes('storage/unknown') || code.includes('storage/object-not-found') || /not.*set.*up/i.test(e?.message || '')) {
      throw new Error("Photo upload isn't ready yet. Paste an image URL instead.");
    }
    throw new Error(e?.message || 'Upload failed.');
  }
  // Add cache buster so the new image shows immediately.
  const url = await getDownloadURL(r);
  return `${url}&t=${Date.now()}`;
}
