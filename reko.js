const Airtable = require("airtable");
const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const axios = require("axios");

// Initialize Airtable
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: "key0aVfVmWLnBm0dC",
});

const base = Airtable.base("appWveOREcCzpb8yt");

// Initialize AWS
AWS.config.update({ region: "eu-west-2" });
const rekognition = new AWS.Rekognition();

let jobsCount = 0;
const JOBS_LIMIT = 20;

async function processVideos(videos) {
  for (const record of videos) {
    await processVideo(record);
  }
}

async function processVideo(record) {
  const id = record.id;
  const attachment = record.get("video");

  if (attachment && attachment[0] && attachment[0].url) {
    const params = {
      Bucket: "drpcrd-dashboard",
      Key: `rek/${id}`,
      Body: (await axios({ url: attachment[0].url, responseType: "stream" }))
        .data,
    };

    const upload = await S3.upload(params).promise();

    const rekognitionParams = {
      Video: {
        S3Object: {
          Bucket: "drpcrd-dashboard",
          Name: `rek/${id}`,
        },
      },
      JobTag: `${id}`,
      MinConfidence: 90,
    };

    while (jobsCount >= JOBS_LIMIT) {
      // Wait for a bit before checking again
      await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 seconds
      await checkJobs();
    }

    const rekognitionResponse = await rekognition
      .startLabelDetection(rekognitionParams)
      .promise();

    jobsCount += 1;

    base("Videos").update(
      [
        {
          id: record.id,
          fields: {
            jobId: rekognitionResponse.JobId,
          },
        },
      ],
      function (err, records) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
  }
}

async function checkJobs() {
  base("Videos")
    .select({
      view: "Grid view",
      maxRecords: JOBS_LIMIT,
      sort: [{ field: "jobId", direction: "desc" }],
    })
    .eachPage(
      async function page(records, fetchNextPage) {
        for (const record of records) {
          const jobId = record.get("jobId");
          if (jobId) {
            const response = await rekognition
              .getLabelDetection({ JobId: jobId })
              .promise();
            if (["SUCCEEDED", "FAILED"].includes(response.JobStatus)) {
              jobsCount -= 1;
            }
          }
        }
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
        }
      }
    );
}

base("Videos")
  .select({
    view: "Grid view",
  })
  .firstPage(function (err, records) {
    if (err) {
      console.error(err);
      return;
    }
    processVideos(records);
  });
