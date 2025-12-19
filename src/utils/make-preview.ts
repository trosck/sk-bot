import sharp from "sharp";

export async function makePreview(buf: Buffer) {
  const resized = await sharp(buf)
    .resize({ width: 128, height: 128, fit: "inside" })
    .jpeg({ quality: 70, mozjpeg: true })
    .toBuffer();

  return `data:image/jpeg;base64,${resized.toString("base64")}`;
}
