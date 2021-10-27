import { GetObjectCommand, GetObjectCommandInput, GetObjectOutput, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";

export const getImage = async (client: S3Client, bucket: string, key: string): Promise<Readable | ReadableStream | Blob | undefined> => {
    const params: GetObjectCommandInput = {
        Bucket: bucket,
        Key: key
    };
    const result: GetObjectOutput = await client.send(new GetObjectCommand(params))
    return result.Body;
}