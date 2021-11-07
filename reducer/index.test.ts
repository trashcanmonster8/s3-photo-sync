import { S3EventRecord, Context } from "aws-lambda";
import { handler } from ".";
import { back, BackContext, Definition, Scope } from "nock";
import { readFileSync } from "fs";
import { join } from "path";

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

interface Nocking {
  nockDone: () => void;
  context: BackContext;
}

back.fixtures = join(__dirname, "data");
back.setMode("lockdown");

describe("endToEnd", () => {
  let nocking: Nocking;
  let picturePath: string;
  beforeEach(async () => {
    if (back.currentMode !== "record") {
      process.env["AWS_ACCESS_KEY_ID"] = "test";
      process.env["AWS_SECRET_ACCESS_KEY"] = "test";
    }
    picturePath = join(__dirname, "data", "dumpsterFire.jpg");
    const before: (def: Definition) => void = (def: Definition) => {
      if (def.method == "GET") {
        def.response = readFileSync(picturePath, { encoding: "hex" });
      }
    };
    const after: (scope: Scope) => void = (scope: Scope) => {
      scope.filteringPath(() => "/image.jpg");
      scope.filteringRequestBody(/.+/g, "image");
    };
    const afterRecord: (defs: Definition[]) => Definition[] = (
      defs: Definition[]
    ) => {
      return defs.map((def: Definition) => {
        def.path = "/image.jpg";
        if (def.method == "GET") {
          def.response = "image";
        } else if (def.method == "PUT") {
          def.body = "image";
        }
        return def;
      });
    };
    nocking = await back("s3PutPhoto.json", { before, after, afterRecord });
  });
  afterEach(() => {
    nocking.nockDone();
  });
  it("sends image to AWS", async () => {
    await handler(
      { Records: [exampleEvent] },
      {} as Context,
      (error?: string | Error | null) => {
        if (error) {
          throw error;
        }
      }
    );
    nocking.context.assertScopesFinished();
  });
});
