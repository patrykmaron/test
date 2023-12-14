const Airtable = require("airtable");
const AWS = require("aws-sdk");
const axios = require("axios");
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
const rekognition = new AWS.Rekognition();

let count = 0; // Keep track of how many records have been processed

base("Videos")
  .select({
    view: "Grid view",
  })
  .eachPage(
    async (records, fetchNextPage) => {
      for (const record of records) {
        // Check if jobId field has a value and we haven't processed 100 records yet
        const jobId = record.get("jobId");
        if (jobId && count < 100) {
          count++;
          const params = {
            JobId: jobId,
          };
          rekognition.getLabelDetection(params, async (err, data) => {
            if (err) console.log(err, err.stack); // an error occurred
            else {
              // Extract unique label names
              let labelNames = [];
              if (data.Labels) {
                data.Labels.forEach((label) => {
                  if (label.Label && label.Label.Name) {
                    labelNames.push(label.Label.Name);
                  }
                });
              }

              // Remove duplicates
              labelNames = [...new Set(labelNames)];

              // success: update Airtable record with result
              base("Videos").update(
                [
                  {
                    id: record.id,
                    fields: {
                      rekognition: labelNames.join(", "),
                    },
                  },
                ],
                (err, records) => {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  console.log(records);
                }
              );
            }
          });
          await delay(5000); // delay in milliseconds
        }
      }

      // fetch next page of records if we haven't processed 100 records yet
      if (count < 100) {
        fetchNextPage();
      }
    },
    (err) => {
      if (err) console.error(err);
    }
  );
