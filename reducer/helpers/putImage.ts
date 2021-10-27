import { PutObjectCommand, PutObjectCommandInput, PutObjectCommandOutput, S3Client } from "@aws-sdk/client-s3"

export const putImage = async (client: S3Client, bucket: string, key: string, data: Buffer): Promise<PutObjectCommandOutput> => {
    const param: PutObjectCommandInput = {
        Bucket: bucket,
        Key: key,
        Body: data
    }
    return client.send(new PutObjectCommand(param))
}