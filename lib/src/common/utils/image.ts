export function loadImage(src: string, img: HTMLImageElement): HTMLImageElement {
  src = getAssetUrl(src);
  img.src = src;

  return img;
  // return new Promise((resolve, reject) => {
  //   img.src = src;
  //   img.onload = () => resolve(img);
  //   img.onerror = (error) => reject(error);
  // });
}

export function getAssetUrl(assetName: string): string {
  const baseUrl = new URL('.', import.meta.url).href;
  return `${baseUrl}${assetName}`;
}