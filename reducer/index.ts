import {
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { Handler, S3Event, S3EventRecord } from "aws-lambda";
import { IncomingMessage } from "http";
import Jimp from "jimp";

async function getObject(client: S3Client, Bucket: string, Key: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const getObjectCommand = new GetObjectCommand({ Bucket, Key })

    try {
      // const response: GetObjectCommandOutput = await client.send(getObjectCommand)
      client.send(getObjectCommand).then((response: GetObjectCommandOutput) => {
          // Store all of data chunks returned from the response data stream 
          // into an array then use Array#join() to use the returned contents as a String
          const responseDataChunks: unknown[] =[];
          const incoming: IncomingMessage = <IncomingMessage>response.Body;
      
          // Attach a 'data' listener to add the chunks of data to our array
          // Each chunk is a Buffer instance
          incoming.on('data', (chunk: unknown) => responseDataChunks.push(chunk))
      
          // Once the stream has no more data, join the chunks into a string and return the string
          incoming.once('end', () => resolve(Buffer.concat(<Uint8Array[]>responseDataChunks)));
      }).catch((reason) => {
        reject(reason)
      })
    } catch (err) {
      // Handle the error or throw
      return reject(err)
    } 
  })
}

export const handler: Handler<S3Event, void[]> = async (
  event: S3Event
): Promise<void[]> => {
  return Promise.all(
    event.Records.map(async (record: S3EventRecord): Promise<void> => {
      const bucketName = record.s3.bucket.name;
      console.log(`Received event: ${record.eventName}`);
      const reducedBucketName = bucketName + "-reduced";
      const key = record.s3.object.key;
      console.log(`S3 object to reduct: ${bucketName}/${key}`);
      const client: S3Client = new S3Client({
        region: record.awsRegion
      });
      const imageBuf: Buffer = await getObject(client, bucketName, key);
      console.log('Got image data - %d', imageBuf.length);
      const image: Jimp = await Jimp.read(imageBuf);
      const reducedImage: Buffer = await image.quality(0.25).getBufferAsync(image.getMIME());
      console.log('Transformed image = %d', reducedImage.length);
      const putImage: PutObjectCommandInput = {
        Bucket: reducedBucketName,
        Key: key,
        Body: reducedImage,
      };
      try {
        await client.send(new PutObjectCommand(putImage));
        console.log('Upload image to %s/%s', putImage.Bucket, putImage.Key);
      } catch (e) {
        console.error('Upload failed - %s', e);
        throw e;
      }
    })
  );
};
