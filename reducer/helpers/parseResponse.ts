import { GetObjectOutput } from "@aws-sdk/client-s3";
import { Readable } from "stream";

export const parseResponse = async (
  response: GetObjectOutput
): Promise<Buffer | Readable> => {
  if (response.Body instanceof Readable) {
    return response.Body;
  } else if (response.Body instanceof ReadableStream) {
    return Buffer.from(await new Response(response.Body).arrayBuffer());
  } else if (response.Body instanceof Blob) {
    return Buffer.from(response.Body.stream().read());
  } else {
    throw new Error("Response body is undefined");
  }
};
