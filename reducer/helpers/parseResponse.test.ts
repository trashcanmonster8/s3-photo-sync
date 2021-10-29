import { GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { ok } from "assert";
import { Readable } from "stream";
import { parseResponse } from "./parseResponse";

describe("parseResponse", () => {
  it("returns Buffer given Readable", async () => {
    const readableBody: Readable = new Readable();
    readableBody.push("this");
    readableBody.push("test");
    readableBody.push(null);
    const response: GetObjectCommandOutput = {
      $metadata: {},
      Body: readableBody,
    };
    ok(await parseResponse(response));
  });
});
