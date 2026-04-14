export async function loadImage(src: string): Promise<HTMLImageElement> {
  src = getAssetUrl(src);
  console.debug(`Loading image: ${src}`);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });
}

export function getAssetUrl(assetName: string): string {
  const baseUrl = new URL('.', import.meta.url).href;
  return `${baseUrl}${assetName}`;
}