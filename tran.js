const Airtable = require("airtable");
const AWS = require("aws-sdk");
const axios = require("axios");
const s3 = new AWS.S3();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Initialize Airtable
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: "key0aVfVmWLnBm0dC",
});

const base = Airtable.base("appWveOREcCzpb8yt");

// Initialize AWS
AWS.config.update({ region: "eu-west-2" });
const transcribeservice = new AWS.TranscribeService();

base("Videos")
  .select({
    view: "Grid view",
  })
  .eachPage(
    async (records, fetchNextPage) => {
      for (const record of records) {
        // Only process records where tranJobId is empty
        const tranJobId = record.get("tranJobId");
        if (tranJobId) continue;

        const videoField = record.get("video");
        if (videoField) {
          try {
            // download video and check its content type
            const videoUrl = videoField[0].url;
            const videoName = videoField[0].filename;

            // Get video from url
            const response = await axios.get(videoUrl, {
              responseType: "arraybuffer",
            });
            const videoBuffer = response.data;

            const contentType = response.headers["content-type"];
            if (!contentType.startsWith("video/")) {
              // This is not a video file, skip it
              console.log(`File ${videoName} is not a video, skipping...`);
              continue;
            }

            // Upload video to S3
            const s3Params = {
              Bucket: "drpcrd-dashboard",
              Key: `tran/${videoName}`,
              Body: videoBuffer,
              ContentType: contentType,
            };

            const uploadResult = await s3.upload(s3Params).promise();

            // start transcription job
            const transcribeParams = {
              LanguageCode: "en-US", // set language code
              Media: {
                MediaFileUri: `s3://drpcrd-dashboard/tran/${videoName}`,
              },
              MediaFormat: "mp4", // or other format as per your video file
              TranscriptionJobName: `${record.getId()}-transcription`,
            };
            const transcribeResponse = await transcribeservice
              .startTranscriptionJob(transcribeParams)
              .promise();

            // Update the Airtable record with the TranscriptionJobName (Job ID)
            base("Videos").update(
              [
                {
                  id: record.id,
                  fields: {
                    tranJobId:
                      transcribeResponse.TranscriptionJob.TranscriptionJobName,
                  },
                },
              ],
              (err, records) => {
                if (err) {
                  throw err; // throw error to be caught in outer catch block
                }
                // console.log(records);
              }
            );
          } catch (err) {
            // log error and continue with the next record
            console.error(`Error processing record ${record.id}: ${err}`);
            continue;
          }

          await delay(1000); // delay in milliseconds
        }
      }

      // fetch next page of records
      fetchNextPage();
    },
    (err) => {
      if (err) console.error(err);
    }
  );
