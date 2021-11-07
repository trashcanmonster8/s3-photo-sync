import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Handler, S3Event, S3EventRecord } from "aws-lambda";
import Jimp from "jimp";

export const handler: Handler<S3Event, PutObjectCommandOutput[]> = async (
  event: S3Event
): Promise<PutObjectCommandOutput[]> => {
  return Promise.all(
    event.Records.map(
      async (record: S3EventRecord): Promise<PutObjectCommandOutput> => {
        const bucketName = record.s3.bucket.name;
        console.log(`Received event: ${record.eventName}`);
        const reducedBucketName = bucketName + "-reduced";
        const key = record.s3.object.key;
        console.log(`S3 object to reduct: ${bucketName}/${key}`);
        const client: S3Client = new S3Client({
          region: record.awsRegion,
          bucketEndpoint: false,
        });
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        const url: string = await getSignedUrl(client, command, {
          expiresIn: 60,
        });
        const image: Jimp = await Jimp.read(url);
        const putImage: PutObjectCommandInput = {
          Bucket: reducedBucketName,
          Key: key,
          Body: await image.quality(0.25).getBufferAsync(image.getMIME()),
        };
        return client.send(new PutObjectCommand(putImage));
      }
    )
  );
};
