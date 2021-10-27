import { S3Client } from "@aws-sdk/client-s3";
import { Handler, S3Event, S3EventRecord } from "aws-lambda";
import { getImage } from "./helpers/getImage";
import { parseResponse } from "./helpers/parseResponse";
import { putImage } from "./helpers/putImage";
import { reduceImage } from "./helpers/reduceImage";

export const handler: Handler<S3Event, void> = async (
  event: S3Event
): Promise<void> => {
  event.Records.forEach(async (record: S3EventRecord): Promise<void> => {
    const bucketName = record.s3.bucket.name;
    const reducedBucketName = bucketName + "-reduced";
    const key = record.s3.object.key;
    const client: S3Client = new S3Client({ region: record.awsRegion });
    return getImage(client, bucketName, key)
      .then(parseResponse)
      .then(reduceImage)
      .then((data: Buffer) => {
        putImage(client, reducedBucketName, key, data);
      });
  });
};
