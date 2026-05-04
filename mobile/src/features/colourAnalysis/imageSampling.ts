import type { RGB } from './analyseSeason';

export type ImageSampleOptions = {
  size?: number; // square downsample size
  maxPixelsToRead?: number; // cap to avoid huge arrays
};

function base64ToUint8Array(base64: string): Uint8Array {
  const binString = typeof atob === 'function' ? atob(base64) : '';
  if (!binString) throw new Error('Unable to decode image data.');

  const bytes = new Uint8Array(binString.length);
  for (let i = 0; i < binString.length; i += 1) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

// RN-safe path: resize image -> export JPEG base64 -> decode with jpeg-js -> average RGB.
export async function averageRgbFromImageUri(
  uri: string,
  options: ImageSampleOptions = {},
): Promise<RGB> {
  const size = options.size ?? 80;
  const maxPixelsToRead = options.maxPixelsToRead ?? size * size;

  const ImageManipulator = await import('expo-image-manipulator');

  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: size, height: size } }],
    { base64: true, compress: 1, format: ImageManipulator.SaveFormat.JPEG },
  );

  if (!manipulated.base64) {
    throw new Error('Unable to read image data.');
  }

  const jpeg = await import('jpeg-js');
  const decoded = jpeg.decode(base64ToUint8Array(manipulated.base64), { useTArray: true });

  const data = decoded.data; // RGBA
  const totalPixels = Math.min(decoded.width * decoded.height, maxPixelsToRead);
  if (totalPixels <= 0) throw new Error('No pixels found in image.');

  let rSum = 0;
  let gSum = 0;
  let bSum = 0;

  // If we capped pixels, sample evenly.
  const stride = Math.max(1, Math.floor((decoded.width * decoded.height) / totalPixels));

  let counted = 0;
  for (let p = 0; p < decoded.width * decoded.height && counted < totalPixels; p += stride) {
    const i = p * 4;
    rSum += data[i];
    gSum += data[i + 1];
    bSum += data[i + 2];
    counted += 1;
  }

  return {
    r: rSum / counted,
    g: gSum / counted,
    b: bSum / counted,
  };
}

