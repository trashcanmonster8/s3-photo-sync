import {
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectOutput,
  S3Client,
} from "@aws-sdk/client-s3";

export const getImage = async (
  client: S3Client,
  bucket: string,
  key: string
): Promise<GetObjectOutput> => {
  const params: GetObjectCommandInput = {
    Bucket: bucket,
    Key: key,
  };
  return await client.send(
    new GetObjectCommand(params)
  );
};
