import { S3EventRecord, Context } from "aws-lambda";
import { handler } from ".";
import { back, BackContext, Definition, Scope } from "nock";
import { ok } from "assert";
import { PutObjectCommandOutput } from "@aws-sdk/client-s3";

const exampleEvent: S3EventRecord = {
  eventVersion: "2.0",
  eventSource: "aws:s3",
  awsRegion: "us-east-2",
  eventTime: "1970-01-01T00:00:00.000Z",
  eventName: "ObjectCreated:Put",
  userIdentity: {
    principalId: "EXAMPLE",
  },
  requestParameters: {
    sourceIPAddress: "127.0.0.1",
  },
  responseElements: {
    "x-amz-request-id": "EXAMPLE123456789",
    "x-amz-id-2":
      "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH",
  },
  s3: {
    s3SchemaVersion: "1.0",
    configurationId: "testConfigRule",
    bucket: {
      name: "photo-sync-trashcanmonster8",
      ownerIdentity: {
        principalId: "EXAMPLE",
      },
      arn: "arn:aws:s3:::example-bucket",
    },
    object: {
      key: "roomsHolidayValley.png",
      size: 1024,
      eTag: "0123456789abcdef0123456789abcdef",
      sequencer: "0A1B2C3D4E5F678901",
    },
  },
};

back.fixtures = "./data";
back.setMode("lockdown");

describe("endToEnd", () => {
  it("compresses", async () => {
    process.env['AWS_ACCESS_KEY_ID'] = 'test'
    process.env['AWS_SECRET_ACCESS_KEY'] = 'test'
    const after: (scope: Scope) => void = (scope: Scope) => {
      scope.filteringPath(() => "/image.jpg");
    };
    const afterRecord: (defs: Definition[]) => Definition[] = (
      defs: Definition[]
    ) => {
      return defs.map((def: Definition) => {
        def.path = "/image.jpg";
        if (def.method == "GET") {
          def.response = undefined;
        } else if (def.method == "PUT") {
          def.body = undefined;
        }
        return def;
      });
    };
    const {
      nockDone,
      context,
    }: {
      nockDone: () => void;
      context: BackContext;
    } = await back("s3PutPhoto.json", { after, afterRecord });
    const result: PutObjectCommandOutput[] | void = await handler(
      { Records: [exampleEvent] },
      {} as Context,
      (error?: string | Error | null, result?: PutObjectCommandOutput[]) => {
        if (error) {
          throw error;
        }

        return result;
      }
    );
    ok(result);
    context.assertScopesFinished();
    nockDone();
  });
});
