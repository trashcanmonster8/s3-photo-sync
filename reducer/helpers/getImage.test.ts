import { GetObjectOutput, S3Client } from "@aws-sdk/client-s3";
import { strictEqual } from "assert";
import { stub, SinonStub } from "sinon";
import { Readable } from "stream";
import { getImage } from "./getImage";

describe("getImage", () => {
  it("returns image buffer", async () => {
    const client: S3Client = new S3Client({});
    const bucketName = "testName";
    const objectKey = "testKey";
    const getObjectStub: SinonStub = stub(client, "send");
    const result: GetObjectOutput = {
      Body: new Readable(),
    };
    getObjectStub.resolves(result);
    strictEqual(await getImage(client, bucketName, objectKey), result.Body);
  });
});
