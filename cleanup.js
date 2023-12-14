const Airtable = require("airtable");
const base = new Airtable({ apiKey: "key0aVfVmWLnBm0dC" }).base(
  "appUt5CHVK6Q1kZFR"
);

const brandsTable = base("Brands");
const videosTable = base("Videos");

const getRecords = (table) => {
  return new Promise((resolve, reject) => {
    const records = [];
    table.select().eachPage(
      (recs, fetchNextPage) => {
        records.push(...recs);
        fetchNextPage();
      },
      (err) => {
        if (err) {
          reject(err);
        }
        resolve(records);
      }
    );
  });
};

const run = async () => {
  console.log("start");
  try {
    const brands = await getRecords(brandsTable);

    for (const brand of brands) {
      const videoIds = brand.get("Videos"); // This will get array of Video IDs linked to the brand
      const brandId = brand.get("uniqueId");
      console.log(`=== ${brandId} ===`);

      if (!videoIds) {
        console.log(`No videos for brand ${brand.id}`);
        continue;
      }

      let filteredVideoIds = [...videoIds]; // Create a copy of videoIds to modify
      for (const videoId of videoIds) {
        const videoRecord = await videosTable.find(videoId); // Fetch Video record using ID
        console.log(`Video ID: ${videoRecord.id}`); // Logs the Video ID
        const author = videoRecord.get("author");

        if (brandId !== author) {
          filteredVideoIds = filteredVideoIds.filter((id) => id !== videoId); // Filter out this videoId
          console.log("filtered out the video");
        }
      }

      // If any videos were unlinked, update the brand
      if (filteredVideoIds.length !== videoIds.length) {
        await brandsTable.update([
          {
            id: brand.id,
            fields: {
              Videos: filteredVideoIds,
            },
          },
        ]);
        console.log(`Updated brand ${brand.id} with new video links`);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

run();
