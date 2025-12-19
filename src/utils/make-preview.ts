import sharp from "sharp";

export async function makePreview(buf: Buffer) {
  return sharp(buf)
    .resize({ width: 128, height: 128, fit: "inside" })
    .jpeg({ quality: 70, mozjpeg: true })
    .toBuffer();
}
