import Jimp, { read } from "jimp";

export const reduceImage = async (
  data: Buffer,
  quality: number
): Promise<Buffer> => {
  const image: Jimp = await read(data);
  return image.quality(quality).getBufferAsync(Jimp.MIME_JPEG);
};
