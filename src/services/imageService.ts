const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 192;
const JPEG_QUALITY = 0.82;
const MAX_DATA_URL_LENGTH = 400_000;

const CHAT_MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const CHAT_MAX_DIMENSION = 1280;
const CHAT_MAX_DATA_URL_LENGTH = 700_000;

/**
 * Converts an uploaded image into a small Base64 data URL suitable for
 * storing in Firestore (1 MiB document limit). The image is downscaled to
 * 192px and re-encoded as JPEG, typically producing 10-25 KB.
 */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("Image must be smaller than 10 MB.");
  }

  const sourceDataUrl = await readAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Your browser could not process this image.");
  }

  // White background so transparent PNGs don't turn black in JPEG.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    dataUrl = canvas.toDataURL("image/jpeg", 0.6);
  }
  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    throw new Error("That image is too detailed. Please choose a simpler one.");
  }

  return dataUrl;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Converts an uploaded photo into a compressed Base64 data URL for a chat
 * message (Firestore documents cap at 1 MiB). Resizes to 1280px and steps the
 * JPEG quality down until it fits, typically landing at 100-400 KB.
 */
export async function fileToChatImageDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > CHAT_MAX_SOURCE_BYTES) {
    throw new Error("Image must be smaller than 15 MB.");
  }

  const sourceDataUrl = await readAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);

  const scale = Math.min(
    1,
    CHAT_MAX_DIMENSION / Math.max(image.width, image.height)
  );
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Your browser could not process this image.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  for (const quality of [0.82, 0.65, 0.5]) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= CHAT_MAX_DATA_URL_LENGTH) {
      return dataUrl;
    }
  }

  throw new Error("That photo is too detailed to send. Try a smaller one.");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That file is not a valid image."));
    image.src = src;
  });
}
