export default class PixelCount {
  static toPixels(value: string | number): string {
    if (typeof value === "number") {
      return `${value}px`;
    }
    if (!isNaN(Number(value))) {
      return `${Number(value)}px`;
    }
    return value;
  }
}
