import {
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { deepStrictEqual } from "assert";
import { SinonStub, stub } from "sinon";
import { putImage } from "./putImage";

describe("putImage", () => {
  it("puts image in bucket", async () => {
    const client: S3Client = new S3Client({});
    const sendStub: SinonStub = stub(client, "send");
    const params: PutObjectCommandInput = {
      Bucket: "test",
      Key: "key",
      Body: Buffer.from(""),
    };
    const output: PutObjectCommandOutput = {
      $metadata: {},
    };
    sendStub.resolves(output);
    await putImage(
      client,
      String(params.Bucket),
      String(params.Key),
      Buffer.from("")
    );
    const command: PutObjectCommand = sendStub.args[0][0];
    deepStrictEqual(command.input, params);
  });
});
