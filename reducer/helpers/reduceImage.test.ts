import { ok } from "assert";
import Jimp from "jimp";
import { reduceImage } from "./reduceImage";

describe('reduceImage', () => {
    it('returns a new buffer',async () => {
        const image: Buffer = await new Jimp(10, 10).getBufferAsync(Jimp.MIME_BMP);
        ok(await reduceImage(image, 25) instanceof Buffer)
    });
});