const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
const Airtable = require("airtable");
const axios = require("axios");
const headers = {
  "User-Agent": "TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet",
};
const async = require("async");

let cachedRecords = null;

async function refreshCache() {
  return new Promise((resolve, reject) => {
    base("Videos")
      .select()
      .all(function (err, records) {
        if (err) {
          console.error(err);
          return reject(err);
        }
        cachedRecords = records;
        resolve(records);
      });
  });
}

async function saveToAirtable(video_data, recordId) {
  try {
    if (cachedRecords === null) {
      // First time running, populate the cache
      await refreshCache();
    }

    // Check cache for existing record
    const existingRecord = cachedRecords.find(
      (record) => record.get("id") === video_data.id
    );

    // If no existing record was found in cache, save the new record
    if (!existingRecord) {
      await new Promise((resolve, reject) => {
        base("Videos").create(
          {
            ...video_data,
            Brand: [recordId],
          },
          function (err, record) {
            if (err) {
              console.error(err);
              return reject(err);
            }
            // Add new record to the cache
            cachedRecords.push(record);
            resolve(record);
          }
        );
      });
    }
  } catch (error) {
    console.error(error);
  }
}

let q = async.queue(function (task, callback) {
  saveToAirtable(task.video_data, task.recordIdSave).then(callback);
}, 1);

const getVideoNoWM = async (idVideo) => {
  const API_URL = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}`;
  const res = await axios.get(API_URL, {
    headers: headers,
  });
  const body = res.data;
  const urlMedia = body.aweme_list[0].video.play_addr.url_list[0];

  return urlMedia;
};

async function downloadVideo(videoUrl, fileName) {
  const response = await axios({
    method: "GET",
    url: videoUrl,
    responseType: "stream",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
    },
  });

  const writer = fs.createWriteStream(fileName);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// Initialize Airtable
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: "key0aVfVmWLnBm0dC",
});

const base = Airtable.base("appUt5CHVK6Q1kZFR"); // Replace with your base ID

const fs = require("fs");

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36";

const handles = [
  // "channel4",
  // "disneyplus",
  // "primevideouk",
  // "amazonfreevee",
  // "bbc",
  // "sonypicturesuk",
  // "netflix",
  // "crunchyroll",
  // "skyuk",
  // "spotify",
  // "universalmusicgroup",
  // "warnerbrosuk",
  // "amazonmusic",
  // "redbulluk",
  // "nbc",
  // "statsports",
  // "bbcthree",
  // "ladbible",
  // "spotifyforpodcasters",
  // "paramountplusuk",
  // "fiaformulae",
  // "refinery29",
  // "appletv",
  // "hulu",
  // "paramountplusuk",
  // "sonymusicuk",
  // "disneyuk",
  // "warnerbrosuk",
  // "hypebeast",
  // "uktvplay",
  // "lionsgateuk",
  // "sonypicturesuk",
  // "itvx",
  // "picoxr",
  // "vt",
  // "odeoncinemas",
  // "starmaker_officialpage",
  // "todaytix",
  // "discoveryplusuk",
  // "hbo",
  // "marvel",
  // "disneylandparis",
  // "global",
  // "audible",
  // "streamonmax",
  // "disney",
  // "paramountpicturesuk",
  // "now",
  // "soundcloud",
  // "buzzfeeduk",
  // "vinylboxofficial",
  // "junglecreations",
  // "cineworld",
  // "sixnationsrugby",
  // "mancity",
  // "cbbc",
  // "emiratesfacup",
  // "spursofficial",
  // "highsnobiety",
  // "goalglobal",
  // "nbc",
  // "lta",
  // "peacocktvuk",
  // "thesun",
  // "arsenal",
  // "disneymusic",
  // "cymru",
  // "paniniukofficial",
  // "topgear",
  // "mtvuk",
  // "thetimes",
  // "vue.cinemas",
  // "multiversusgame",
];

//Enable stealth mode
puppeteer.use(StealthPlugin());

/**
 * Run Scraper
 */

(async () => {
  let browser;
  let page;

  const baseURL = "https://www.tiktok.com/@";

  let recordIdSave;

  try {
    browser = await puppeteer.launch({
      args: [
        "--start-maximized",
        "disable-gpu",
        "--disable-infobars",
        "--disable-extensions",
        "--ignore-certificate-errors",
      ],
      headless: "new",
      ignoreDefaultArgs: ["--enable-automation"],
      defaultViewport: null,
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // path for Google Chrome on macOS
    });
    page = await browser.newPage();

    await page.setUserAgent(USER_AGENT);
    await page.setJavaScriptEnabled(true);

    // Create a variable to store whether there's more content to load
    let hasMore = true;

    // Create a dictionary to keep track of whether each handle has more content
    const hasMoreForHandle = {};

    for (const handle of handles) {
      const url = `${baseURL}${handle}`;

      console.log("⌛️ Loading ", url);

      await page.goto(url, { waitUntil: "domcontentloaded" });

      console.log("✅ Loaded page of ", `@${handle}`);

      // Register the response listener for this handle
      page.on("response", responseListener);

      async function responseListener(response) {
        const url = response.request().url();

        if (url.startsWith("https://www.tiktok.com/api/post/item_list/")) {
          const data = await response.json();

          for (const item of data.itemList) {
            const lastPostDate = item.createTime;
            const cutOffDate = new Date("2023-01-01");

            if (
              Math.floor(cutOffDate.getTime() / 1000) -
                parseInt(lastPostDate) >=
              0
            ) {
              // if the post is before the cutoff date, we say that we don't have more content for this handle
              hasMoreForHandle[handle] = false;
              continue;
            }

            const elementsWithHashtag = (item.textExtra || []).filter(function (
              item
            ) {
              return item && item.hashtagName !== "";
            });

            const hashtags = elementsWithHashtag.map(function (item) {
              return item.hashtagName;
            });

            const video_data = {
              id: item.id,
              author: item.author.uniqueId,
              title: item.desc,
              created: new Date(item.createTime * 1000),
              video: [
                {
                  url: await getVideoNoWM(item.id),
                },
              ],
              duration: item.video.duration,
              locationCreated: item.locationCreated,
              isAd: item.adAuthorization ? item.adAuthorization : false,
              shareCount: item.stats.shareCount,
              commentCount: item.stats.commentCount,
              viewCount: item.stats.playCount,
              likeCount: item.stats.diggCount,
              hashtags: hashtags.join(", "),
              savedCount: parseInt(item.stats.collectCount),
            };

            try {
              await q.push({ video_data, recordIdSave });
            } catch (error) {
              console.error("Error while saving to Airtable:", error);
            }
          }

          // hasMoreForHandle[handle] = data.hasMore;
        }
      }

      // Get the contents of the script tag (first 30 videos preloaded via SSR)
      console.log("👀 Grabbing pre rendered video data");
      const data = await page.evaluate(() => {
        const element = document.querySelector("#SIGI_STATE");
        if (element) {
          return JSON.parse(element.textContent || "");
        } else {
          console.error("Element not found");
        }
      });

      // Loop the SSR provided data
      if (data) {
        if (!data.UserModule) {
          continue;
        }
        if (data.UserModule === undefined) {
          continue;
        }
        const users = data.UserModule.users;
        const UserModule = Object.values(users)[0];
        const stats = data?.UserModule.stats;
        const UserStats = Object.values(stats)[0];
        if (UserModule) {
          if (!UserModule.id) {
            console.log("====== NO ID FOUND FOR USER MODULE! ======");
          }
        }
        const UserData = {
          id: UserModule.id || "",
          uniqueId: UserModule.uniqueId || "",
          nickname: UserModule.nickname || "",
          followerCount: UserStats.followerCount || 0,
          followingCount: UserStats.followingCount || 0,
          heartCount: UserStats.heartCount || 0,
          bio: UserModule.signature || "",
          avatar: [
            {
              url: UserModule.avatarLarger || "",
            },
          ],
        };

        const record = await new Promise((resolve, reject) => {
          base("Brands").create(UserData, function (err, record) {
            if (err) {
              console.error(err);
              return reject(err);
            }

            resolve(record);
          });
        });

        let recordId = record.getId();
        recordIdSave = record.getId();

        for (let [key, item] of Object.entries(data.ItemModule)) {
          console.log("🎥 Found video: ");

          //   const videoFileName = `${item.id}.mp4`; // Or whatever file type the video is
          //   await downloadVideo(item.video.playAddr, videoFileName);
          const cutOffDate = new Date("2023-01-01");

          // Get the creation time in milliseconds
          const createTime = item.createTime;

          if (
            Math.floor(cutOffDate.getTime() / 1000) - parseInt(createTime) >
            0
          ) {
            continue;
          }

          // Use the filter method to get all elements with a non-empty hashtagName property
          const elementsWithHashtag = item.textExtra.filter(function (item) {
            return item.hashtagName !== "";
          });

          // Use the map method to get an array of the hashtagName strings
          const hashtags = elementsWithHashtag.map(function (item) {
            return item.hashtagName;
          });

          const video_data = {
            id: item.id,
            author: item.author,
            title: item.desc,
            created: new Date(item.createTime * 1000),
            video: [
              {
                url: await getVideoNoWM(item.id),
              },
            ],
            duration: item.video.duration,
            shareCount: item.stats.shareCount,
            commentCount: item.stats.commentCount,
            locationCreated: item.locationCreated,
            isAd: item.adAuthorization ? item.adAuthorization : false,
            viewCount: item.stats.playCount,
            likeCount: item.stats.diggCount,
            hashtags: hashtags.join(", "),
            savedCount: parseInt(item.stats.collectCount),
          };

          await new Promise((resolve, reject) => {
            base("Videos").create(
              {
                ...video_data,
                Brand: [recordId],
              },
              function (err, record) {
                if (err) {
                  console.error(err);
                  return reject(err);
                }
                resolve(record);
              }
            );
          });
        }

        const itemEntries = Object.entries(data.ItemModule);

        if (itemEntries.length < 25) {
          console.log(`Skipping handle "@${handle}" due to less than 30 items`);
          continue; // Move to the next handle iteration
        }
      }

      hasMoreForHandle[handle] = true;

      while (hasMoreForHandle[handle]) {
        console.log("extra videos loaded!");
        // Scroll down
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight); // Scroll to the bottom of the page
        });

        // you might want to add a delay here, to emulate more human-like behavior
        await delay(500);

        await page.evaluate(() => {
          window.scrollTo(0, 0); // Scroll to the top of the page
        });

        // you might want to add a delay here, to emulate more human-like behavior
        await delay(1000);

        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight); // Scroll to the bottom of the page
        });

        // Wait for the page to load more data
        await delay(1500); // adjust the delay as needed
      }

      console.log("No more scrolling! Completed profile!");
      page.removeListener("response", responseListener);
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
