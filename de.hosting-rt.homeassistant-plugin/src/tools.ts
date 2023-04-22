/**
 * Convert svg to base64
 * @param svg SVG String
 */
export function svgToBase64(svg: string): string {
  let b64svg = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${b64svg}`;
}
