import {
  GetObjectCommand,
  GetObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { deepStrictEqual, strictEqual } from "assert";
import { stub, SinonStub } from "sinon";
import { getImage } from "./getImage";

describe("getImage", () => {
  it("returns image buffer", async () => {
    const client: S3Client = new S3Client({});
    const params: GetObjectCommandInput = {
      Bucket: "testBucket",
      Key: "testKey",
    };
    const sendStub: SinonStub = stub(client, "send");
    sendStub.resolves({});
    await getImage(client, String(params.Bucket), String(params.Key));
    const command: GetObjectCommand = sendStub.args[0][0];
    deepStrictEqual(command.input, params);
  });
});
