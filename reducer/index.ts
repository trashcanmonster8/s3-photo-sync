import {
  GetObjectOutput,
  PutObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { Handler, S3Event, S3EventRecord } from "aws-lambda";
import { getImage } from "./helpers/getImage";
import { parseResponse } from "./helpers/parseResponse";
import { putImage } from "./helpers/putImage";
import { reduceImage } from "./helpers/reduceImage";

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
      const client: S3Client = new S3Client({ region: record.awsRegion });
      return getImage(client, bucketName, key)
        .then((response: GetObjectOutput) => {
          console.log(`Body is of type: ${typeof response.Body}`);
          console.log(`Received ${key} etag: ${response.ETag}`);
          return response;
        })
        .then(parseResponse)
        .then(reduceImage)
        .then((data: Buffer) => {
          return putImage(client, reducedBucketName, key, data);
        })
        .then((response: PutObjectCommandOutput) => {
          console.log(`Put reduced object etag: ${response.ETag}`);
        });
    })
  );
};
