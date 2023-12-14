const { sign } = require("./bog");
// const { brands } = require("./fashion");
// const { brands } = require("./gaming");
const { brands } = require("./entertainment");
const { handles } = require("./handles");
const { creators } = require("./gamercreators");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { writeFile, readFile } = require("fs/promises");
const fs = require("fs");
const path = require("path");
const Airtable = require("airtable");
const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");

const proxyUrl =
  "http://customer-patrykdev-cc-gb:CHELSEA1905fc@pr.oxylabs.io:7777";
const agent = new HttpsProxyAgent(proxyUrl);

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function extractEmail(inputString) {
  // Regular expression pattern to match most email addresses.
  const emailPattern = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;

  // Match the pattern with the input string
  const matches = inputString.match(emailPattern);

  // Return the matches as a comma-separated string or an empty string if no matches are found
  return matches ? matches.join(", ") : "";
}

const getVideoNoWM = async (idVideo) => {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
  };
  const API_URL = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}`;
  const res = await axios.get(API_URL, {
    headers: headers,
  });
  const body = res.data;
  const urlMedia = body.aweme_list[0].video.play_addr.url_list[0];

  return urlMedia;
};

async function saveImageLocally(imageUrl, fileName) {
  const response = await fetch(imageUrl, { agent: agent });
  const imageBuffer = await response.buffer();
  fs.writeFileSync(fileName, imageBuffer);
  console.log(`Image saved to ${fileName}`);
}

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36";
const mobileUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36";

const cookieHeader =
  "cookie-consent={%22ga%22:true%2C%22af%22:true%2C%22fbp%22:true%2C%22lip%22:true%2C%22bing%22:true%2C%22ttads%22:true%2C%22reddit%22:true%2C%22criteo%22:true%2C%22version%22:%22v9%22}; tta_attr_id=0.1675945331.7198130387388727298; tta_attr_id_mirror=0.1675945331.7198130387388727298; _abck=C231A4B040EB1F3A1EEBF4D070A6F524~-1~YAAQBnP8PnxPk+OGAQAAUnt96QnQRwlfQ7+oS4JZBpMqPiTKK+FSKFu3lZATTAcvim5rDi8t8lRYdvpkyTGcbUgeKfJgt7++8TwH3d61GHE+DS+8V93xwS8JKU9Dgp6YQCkLNQHJJQlaHvyqlRkXd5VCYxJ1X+Ep4VPCMU4LdtRluf3mUKCuElcqiSaopwQTdjps4w86/JKvTZrMvsnB/nyowEPY9UYTdSXFoIn4tBdOYgSZSmGhNBCqRzPAHE6ZEil28F6IkbobXpt6D7oks5TtvXHiXdly9plg4rL4vYzPvPxDLOXB+6q356AUUXMOjAuz5chFbe1oPGhbpr/Jtom+k1VPIieezYfIHR0XQfgzwjTIIUfH+VnbeUJuEb4OUrFPCOt9aqvprg==~-1~-1~-1; locale=en-US; _tt_enable_cookie=1; _ttp=2OdkbmcgBUdRERi1G91wCBNem6d; tt_chain_token=oebSVkAkoJVfGrMaiZYG5w==; _gid=GA1.2.1428860792.1684487449; _gat_UA-143770054-3=1; _hjSessionUser_2525957=eyJpZCI6IjBjMjMyOTE2LTg1NDEtNWNkOC05M2Y5LTY0NWE0ZmJkN2M4NyIsImNyZWF0ZWQiOjE2ODQ0ODc0NDk1NTgsImV4aXN0aW5nIjp0cnVlfQ==; cto_bundle=IiGEU195Y3ElMkJISDh1cENHUkFSMWZlNmclMkZNb29SeUpFamwyZ3lCaCUyRnFIJTJCSndlY0xmM3BFNyUyQks1THg5aWt5cWVNb29nT0dIeklENFRKM2hMJTJCJTJGczlhRFpwdVZGWDFabklLJTJGeGN5JTJGaWphTUhzU20wVHVheDBrZlRqT1NtbzZYRWJhbkFNVDdoVjk4eVVVOWElMkIlMkI4UjY3eWVHeHFtcEZLQUZoV20xZEluQnNvOHFEMXBzMzE3eXNWaVN4RGhkVmVLJTJCdzh4aFQ; _gac_UA-143770054-3=1.1684487458.CjwKCAjwvJyjBhApEiwAWz2nLcRGQWFH_0grITg_XRzgeaQqHDYPNYBIGDE3b0unGUdsfMcpKXZVJxoCqHQQAvD_BwE; _ga=GA1.1.66738151.1680251725; _ga_BZBQ2QHQSP=GS1.1.1688035199.1.1.1688035240.0.0.0; _ga_QQM0HPKD40=GS1.1.1691420404.3.1.1691420415.49.0.0; d_ticket=b07365117acd3127a62902e5a9c0c84ab3c5e; sid_guard=5184378ea96dbb45cce1b7e91a15a2e3%7C1691422452%7C15552000%7CSat%2C+03-Feb-2024+15%3A34%3A12+GMT; uid_tt=1b466aa2a35efd08d764b79ef20ba152769146f171ee4cb74eb03f381642a693; uid_tt_ss=1b466aa2a35efd08d764b79ef20ba152769146f171ee4cb74eb03f381642a693; sid_tt=5184378ea96dbb45cce1b7e91a15a2e3; sessionid=5184378ea96dbb45cce1b7e91a15a2e3; sessionid_ss=5184378ea96dbb45cce1b7e91a15a2e3; sid_ucp_v1=1.0.0-KDE3ZGI5YjczNjhkYzU0NjQwODEwOTFiYjFiNThlMWNiY2U4OGMxZTcKIAiGiJmC4eH79WIQ9J3EpgYYswsgDDDA3q-XBjgEQOoHEAMaCHVzZWFzdDJhIiA1MTg0Mzc4ZWE5NmRiYjQ1Y2NlMWI3ZTkxYTE1YTJlMw; ssid_ucp_v1=1.0.0-KDE3ZGI5YjczNjhkYzU0NjQwODEwOTFiYjFiNThlMWNiY2U4OGMxZTcKIAiGiJmC4eH79WIQ9J3EpgYYswsgDDDA3q-XBjgEQOoHEAMaCHVzZWFzdDJhIiA1MTg0Mzc4ZWE5NmRiYjQ1Y2NlMWI3ZTkxYTE1YTJlMw; tt-target-idc=useast2a; tt-target-idc-sign=FqFthJavBnhNWbsUtFPpLP2GGCkXMW8YonoBmRzzGE__kS67lWZLAZy29KG_A56lW2Sz5BOGygDxSxXrWxZGzThu4gyKwBc083QLFRJmGpjEZ4--n5aYAPo6tbzrjvwogmyD7krXvKnKcucQ_0Etfig0_KVZPVO8W0OuxNAXLlq0fxwPROCxhBmqWZ5cwsw5bDP_Et7q3Cvj8fhDJ74crOp3Bv-khlWOxC4-XOxIBUbTXHjTOOVsB1SJN4yf6vuuPXVd4Xo9Qhi8gkA_18n4amxeSjDOir10VlSaHc1AOrQBhbiZGHKi9JeNs8MbyI2_qhaRfflUSZ2RHCLFMdUM1BvgEiO9qXgsMEOVzx3IEU4PdQLKjTmbXf5E_01uDTETI21CK-IfYjwIYqUDil9sGmtj-k1bDcwi4Zp81ErWFnCjuy4L9629LnWg3GIlebl197ZUaATJMEbEcCYTqWgp_0AfVFrz6sRfXU51MIXkQjFCzssbnziZK-Sn_9T2t2uh; d_ticket_ads=5f6f2c74ca69c51bac1a79cda154c0a6b3c5e; passport_csrf_token=75a94707716196575a5667b25f2a2b19; passport_csrf_token_default=75a94707716196575a5667b25f2a2b19; lang=en; _ga_LVN0C1THGC=GS1.1.1695196996.3.0.1695196998.0.0.0; from_way=paid; _gcl_au=1.1.802059761.1695197012; _rdt_uuid=1695197012337.faf27883-6ee7-4386-bc1a-bd571bda22a5; _fbp=fb.1.1695197026790.1285021128; passport_auth_status_ads=6016aed5af22fd81896fde9d7eab70b0%2Cda36bc828a1f89b89624790ef76e298d; passport_auth_status_ss_ads=6016aed5af22fd81896fde9d7eab70b0%2Cda36bc828a1f89b89624790ef76e298d; sso_uid_tt_ads=1a58e4ff95c05fdefa1049c39e8632593d7628f092ba8e7ca990b0317f90ba80; sso_uid_tt_ss_ads=1a58e4ff95c05fdefa1049c39e8632593d7628f092ba8e7ca990b0317f90ba80; sso_user_ads=6559a0eddc0b89e735e16848780de3d2; sso_user_ss_ads=6559a0eddc0b89e735e16848780de3d2; sid_ucp_sso_v1_ads=1.0.0-KDhiYzljYjE5Nzk2NDRlYzg2MWFmMTRlNjQwODE1YTkxM2Y0YTM2N2EKIAiCiM3m8KOx6GQQjYLqqAYYrwwgDDDCisOmBjgBQOsHEAMaA3NnMSIgNjU1OWEwZWRkYzBiODllNzM1ZTE2ODQ4NzgwZGUzZDI; ssid_ucp_sso_v1_ads=1.0.0-KDhiYzljYjE5Nzk2NDRlYzg2MWFmMTRlNjQwODE1YTkxM2Y0YTM2N2EKIAiCiM3m8KOx6GQQjYLqqAYYrwwgDDDCisOmBjgBQOsHEAMaA3NnMSIgNjU1OWEwZWRkYzBiODllNzM1ZTE2ODQ4NzgwZGUzZDI; uid_tt_ads=6f9b69eb21fd0c7f31c5d3a77145f4a8075b5941b84e5dee80e3025b24439a4b; uid_tt_ss_ads=6f9b69eb21fd0c7f31c5d3a77145f4a8075b5941b84e5dee80e3025b24439a4b; sid_tt_ads=c2040b1834a9f5598dc1e8635fad435f; sessionid_ads=c2040b1834a9f5598dc1e8635fad435f; sessionid_ss_ads=c2040b1834a9f5598dc1e8635fad435f; store-idc=useast2a; store-country-code=gb; store-country-code-src=uid; _gcl_aw=GCL.1696841140.CjwKCAjwyY6pBhA9EiwAMzmfwQnb7weBi2h-IpzyjLgJbSA74f3ezzjFRNGti7vhtkgPFxHxxrY2gRoCCV4QAvD_BwE; _uetvid=0c0115c0f62511ed81395d12082cbea2; _ga_R5EYE54KWQ=GS1.1.1696841140.4.0.1696841140.60.0.0; sid_guard_ads=c2040b1834a9f5598dc1e8635fad435f%7C1696841141%7C864000%7CThu%2C+19-Oct-2023+08%3A45%3A41+GMT; sid_ucp_v1_ads=1.0.0-KGJjNzNmMDY2NjJkZDIwNWYyZDlhOTJiZTgyOTFlOTk2NDNiMTA5NzAKGgiCiM3m8KOx6GQQtfuOqQYYrwwgDDgBQOsHEAMaA3NnMSIgYzIwNDBiMTgzNGE5ZjU1OThkYzFlODYzNWZhZDQzNWY; ssid_ucp_v1_ads=1.0.0-KGJjNzNmMDY2NjJkZDIwNWYyZDlhOTJiZTgyOTFlOTk2NDNiMTA5NzAKGgiCiM3m8KOx6GQQtfuOqQYYrwwgDDgBQOsHEAMaA3NnMSIgYzIwNDBiMTgzNGE5ZjU1OThkYzFlODYzNWZhZDQzNWY; _ga_ER02CH5NW5=GS1.1.1696844754.9.0.1696844754.60.0.0; _ga_HV1FL86553=GS1.1.1696851819.23.1.1696851861.18.0.0; tt_csrf_token=MIONCgBB-j1sWIeVSss-1OM7Ffaw8M42NCGk; ttwid=1%7CImHTfO281EWFHlwwwC3iDH2Ys490_LbwZ0Z-9O6wVGg%7C1696945304%7C0247a34487356cad2f8cf826ba5145ecd3a00e902b9eae12aee7098986f73d01; odin_tt=8a766c43e833d97c32c5d374699d3d14fc18af3d0f3fd91fd0f85f6d902413218d46e3e70f21360f9946a2a7df702803711cb4edd3b0e8b22bf3d621a2715d761ce4fe0fb4f89c08919474e660d137a8; msToken=HSJ_k9_5csQArahXCVeOeJy-PO8CLTdKw_Mk-vNEFaPBcmAuWFVKvVa1hKNvXVZkqEbIE_-d6UB6l6Wy3I00GeXDAc7CQGNNjLY4_IufSMKeGJOOJ2_faYwPcE4SWxQ5ED_w5EmAcmrC5bmIpA==";

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

async function GetProfileData(profileUrl, brandName) {
  return fetchProfileData(profileUrl, brandName, MAX_RETRIES);
}

async function fetchProfileData(profileUrl, brandName, retries) {
  try {
    const response = await fetch(profileUrl, {
      headers: {
        "User-Agent": mobileUserAgent,
        // Cookie: cookieHeader,
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      agent: agent,
    });

    const data = await response.text();
    const $ = cheerio.load(data);

    // Check for WAF's elements
    const wafElement = $("#wci._wafchallengeid");

    if (wafElement.length > 0) {
      if (retries === 0) {
        throw new Error("Max retries reached. Unable to fetch data.");
      }

      console.log("WAF detection. Retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchProfileData(profileUrl, brandName, retries - 1);
    }

    const fileName = `bin/output-${brandName}.html`;
    await writeFile(fileName, data);
    console.log("👉", `HTML saved to ${fileName}`);
    const htmlContent = await readFile(fileName, "utf-8");

    const SIGI_DATA = JSON.parse(
      $("#__UNIVERSAL_DATA_FOR_REHYDRATION__").html()
    );

    if (SIGI_DATA) {
      if (!SIGI_DATA["__DEFAULT_SCOPE__"]["webapp.user-detail"]["userInfo"]) {
        console.log("aborted");
        return true;
      }
      const {
        userInfo: { user, stats },
      } = SIGI_DATA["__DEFAULT_SCOPE__"]["webapp.user-detail"];

      console.log("DATA");
      console.log(user);
      return {
        id: user.uniqueId,
        secUid: user.secUid,
        uniqueId: user.uniqueId,
        nickname: user.nickname,
        bio: user.signature,
        avatar: [
          {
            url: user.avatarLarger || "",
          },
        ],
        followerCount: stats.followerCount,
        followingCount: stats.followingCount,
        heartCount: stats.heartCount,
      };
    } else {
      console.log("❌", "Data not available or not in the expected format.");
      return false;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Initialize Airtable
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: "key0aVfVmWLnBm0dC",
});

// Gaming = apporaqM8EpKutG4k
// entertainment = appseN4tIfHnaAcHV
// Programs = appgmZ7CMJksLGQix

const base = Airtable.base("appRZZF1E64S9mXYA");

(async () => {
  for (const brand in handles) {
    const profileUrl = "https://www.tiktok.com/@" + handles[brand];
    await delay(3000);
    const data = await GetProfileData(profileUrl, handles[brand]);
    if (data) {
      console.log(data);

      // Create brand record here on Airtable.
      // Save record id in const
      const record = await base("Brands")
        .create(data)
        .catch((err) => console.log(err));

      const recordId = record ? record.getId() : false;
      console.log("Record is for brand is: ", recordId);

      //   const imageFileName = `bin/avatar-${brands[brand]}.jpg`;
      //   await saveImageLocally(data.avatar, imageFileName);
      let cursor = Date.now();
      const JanuaryFirst2023 = 1688193308000;

      let hasMore = true;
      let count = 0;

      let msToken =
        "pLCll9w7-M3r4rmn4areApjnSOelumsyhBacg3Ztf9AVW9dFJWqZH-TVHC08yBIDzt3ZI5pNVrVjG3hn-cWwGv49myL8OhTwmKu1O6svlZodNemsLgG8LrbKuy7YuacREzxtYK69YTgBP5HgQA==";

      let videosArr = [];

      do {
        await delay(3000);
        console.log(cursor);
        if (JanuaryFirst2023 - cursor >= 0) {
          hasmore = false;
          break;
        }

        const url = `https://www.tiktok.com/api/post/item_list/?aid=1988&app_language=en&app_name=tiktok_web&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=MacIntel&browser_version=5.0%20%28iPhone%3B%20CPU%20iPhone%20OS%2013_2_3%20like%20Mac%20OS%20X%29%20AppleWebKit%2F605.1.15%20%28KHTML%2C%20like%20Gecko%29%20Version%2F13.0.3%20Mobile%2F15E148%20Safari%2F604.1&channel=tiktok_web&cookie_enabled=true&count=35&coverFormat=1&cursor=${cursor}&device_id=7197785330517460485&device_platform=web_pc&focus_state=false&from_page=user&history_len=0&is_fullscreen=false&is_page_visible=true&language=en&os=ios&priority_region=&referer=&region=GB&screen_height=1169&screen_width=1800&secUid=${data.secUid}&tz_name=Europe%2FLondon&webcast_language=en&msToken=${msToken}`;
        const query = url.includes("?") ? url.split("?")[1] : "";
        const xbogus = sign(query, mobileUserAgent);

        console.log("stuff u need");
        console.log(query);
        console.log(mobileUserAgent);
        const verifiedUrl = url + "&X-Bogus=" + xbogus;
        fetch(verifiedUrl, {
          headers: {
            "User-Agent": mobileUserAgent,
            Referer: profileUrl,
            Accept: "/",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            "Sec-Ch-Ua":
              '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": "macOS",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            Cookie:
              "ttwid=1%7CImHTfO281EWFHlwwwC3iDH2Ys490_LbwZ0Z-9O6wVGg%7C1675865003%7Ca18ef7b1315e16f93add42b6076a8d96fe862b24bbcd070678c060e29ebbbe1d; tta_attr_id=0.1675945331.7198130387388727298; tta_attr_id_mirror=0.1675945331.7198130387388727298; tiktok_webapp_theme=dark; _abck=C231A4B040EB1F3A1EEBF4D070A6F524~-1~YAAQBnP8PnxPk+OGAQAAUnt96QnQRwlfQ7+oS4JZBpMqPiTKK+FSKFu3lZATTAcvim5rDi8t8lRYdvpkyTGcbUgeKfJgt7++8TwH3d61GHE+DS+8V93xwS8JKU9Dgp6YQCkLNQHJJQlaHvyqlRkXd5VCYxJ1X+Ep4VPCMU4LdtRluf3mUKCuElcqiSaopwQTdjps4w86/JKvTZrMvsnB/nyowEPY9UYTdSXFoIn4tBdOYgSZSmGhNBCqRzPAHE6ZEil28F6IkbobXpt6D7oks5TtvXHiXdly9plg4rL4vYzPvPxDLOXB+6q356AUUXMOjAuz5chFbe1oPGhbpr/Jtom+k1VPIieezYfIHR0XQfgzwjTIIUfH+VnbeUJuEb4OUrFPCOt9aqvprg==~-1~-1~-1; locale=en-US; _tt_enable_cookie=1; _ttp=2OdkbmcgBUdRERi1G91wCBNem6d; tt_chain_token=oebSVkAkoJVfGrMaiZYG5w==; _gid=GA1.2.1428860792.1684487449; _gat_UA-143770054-3=1; _hjSessionUser_2525957=eyJpZCI6IjBjMjMyOTE2LTg1NDEtNWNkOC05M2Y5LTY0NWE0ZmJkN2M4NyIsImNyZWF0ZWQiOjE2ODQ0ODc0NDk1NTgsImV4aXN0aW5nIjp0cnVlfQ==; cto_bundle=IiGEU195Y3ElMkJISDh1cENHUkFSMWZlNmclMkZNb29SeUpFamwyZ3lCaCUyRnFIJTJCSndlY0xmM3BFNyUyQks1THg5aWt5cWVNb29nT0dIeklENFRKM2hMJTJCJTJGczlhRFpwdVZGWDFabklLJTJGeGN5JTJGaWphTUhzU20wVHVheDBrZlRqT1NtbzZYRWJhbkFNVDdoVjk4eVVVOWElMkIlMkI4UjY3eWVHeHFtcEZLQUZoV20xZEluQnNvOHFEMXBzMzE3eXNWaVN4RGhkVmVLJTJCdzh4aFQ; _gac_UA-143770054-3=1.1684487458.CjwKCAjwvJyjBhApEiwAWz2nLcRGQWFH_0grITg_XRzgeaQqHDYPNYBIGDE3b0unGUdsfMcpKXZVJxoCqHQQAvD_BwE; _ga=GA1.1.66738151.1680251725; _ga_BZBQ2QHQSP=GS1.1.1688035199.1.1.1688035240.0.0.0; i18next=en; _ga_QQM0HPKD40=GS1.1.1691420404.3.1.1691420415.49.0.0; d_ticket=b07365117acd3127a62902e5a9c0c84ab3c5e; uid_tt=1b466aa2a35efd08d764b79ef20ba152769146f171ee4cb74eb03f381642a693; uid_tt_ss=1b466aa2a35efd08d764b79ef20ba152769146f171ee4cb74eb03f381642a693; sid_tt=5184378ea96dbb45cce1b7e91a15a2e3; sessionid=5184378ea96dbb45cce1b7e91a15a2e3; sessionid_ss=5184378ea96dbb45cce1b7e91a15a2e3; tt-target-idc=useast2a; tt-target-idc-sign=FqFthJavBnhNWbsUtFPpLP2GGCkXMW8YonoBmRzzGE__kS67lWZLAZy29KG_A56lW2Sz5BOGygDxSxXrWxZGzThu4gyKwBc083QLFRJmGpjEZ4--n5aYAPo6tbzrjvwogmyD7krXvKnKcucQ_0Etfig0_KVZPVO8W0OuxNAXLlq0fxwPROCxhBmqWZ5cwsw5bDP_Et7q3Cvj8fhDJ74crOp3Bv-khlWOxC4-XOxIBUbTXHjTOOVsB1SJN4yf6vuuPXVd4Xo9Qhi8gkA_18n4amxeSjDOir10VlSaHc1AOrQBhbiZGHKi9JeNs8MbyI2_qhaRfflUSZ2RHCLFMdUM1BvgEiO9qXgsMEOVzx3IEU4PdQLKjTmbXf5E_01uDTETI21CK-IfYjwIYqUDil9sGmtj-k1bDcwi4Zp81ErWFnCjuy4L9629LnWg3GIlebl197ZUaATJMEbEcCYTqWgp_0AfVFrz6sRfXU51MIXkQjFCzssbnziZK-Sn_9T2t2uh; d_ticket_ads=5f6f2c74ca69c51bac1a79cda154c0a6b3c5e; passport_csrf_token=75a94707716196575a5667b25f2a2b19; passport_csrf_token_default=75a94707716196575a5667b25f2a2b19; _ga_LVN0C1THGC=GS1.1.1695196996.3.0.1695196998.0.0.0; from_way=paid; _gcl_au=1.1.802059761.1695197012; _rdt_uuid=1695197012337.faf27883-6ee7-4386-bc1a-bd571bda22a5; _fbp=fb.1.1695197026790.1285021128; living_user_id=664212371198; __tea_cache_tokens_1988={%22user_unique_id%22:%227197785330517460485%22%2C%22timestamp%22:1695824475545%2C%22_type_%22:%22default%22}; store-idc=useast2a; store-country-code=gb; store-country-code-src=uid; _gcl_aw=GCL.1696841140.CjwKCAjwyY6pBhA9EiwAMzmfwQnb7weBi2h-IpzyjLgJbSA74f3ezzjFRNGti7vhtkgPFxHxxrY2gRoCCV4QAvD_BwE; _uetvid=0c0115c0f62511ed81395d12082cbea2; _ga_R5EYE54KWQ=GS1.1.1696841140.4.0.1696841140.60.0.0; sid_guard_ads=c2040b1834a9f5598dc1e8635fad435f%7C1696841141%7C864000%7CThu%2C+19-Oct-2023+08%3A45%3A41+GMT; _ga_HV1FL86553=GS1.1.1697476622.25.0.1697476622.60.0.0; _ga_ER02CH5NW5=GS1.1.1697476622.11.0.1697476622.60.0.0; sid_guard=5184378ea96dbb45cce1b7e91a15a2e3%7C1697618651%7C15552000%7CMon%2C+15-Apr-2024+08%3A44%3A11+GMT; sid_ucp_v1=1.0.0-KGI1YmIxZmNkZDMxOTc2ZjM2ODM4NmZiOTJiOGVlYzg1OWI3YzJiYzIKIAiGiJmC4eH79WIQ27W-qQYYswsgDDDA3q-XBjgEQOoHEAMaCHVzZWFzdDJhIiA1MTg0Mzc4ZWE5NmRiYjQ1Y2NlMWI3ZTkxYTE1YTJlMw; ssid_ucp_v1=1.0.0-KGI1YmIxZmNkZDMxOTc2ZjM2ODM4NmZiOTJiOGVlYzg1OWI3YzJiYzIKIAiGiJmC4eH79WIQ27W-qQYYswsgDDDA3q-XBjgEQOoHEAMaCHVzZWFzdDJhIiA1MTg0Mzc4ZWE5NmRiYjQ1Y2NlMWI3ZTkxYTE1YTJlMw; tt_csrf_token=1AT8XDz9-eOdwbKLGSUDVcbgIOktoDATfT2c; cookie-consent={%22ga%22:true%2C%22af%22:true%2C%22fbp%22:true%2C%22lip%22:true%2C%22bing%22:true%2C%22ttads%22:true%2C%22reddit%22:true%2C%22hubspot%22:true%2C%22version%22:%22v10%22}; csrfToken=V2eltG54-mFGEgq4nSmbDX2VMKLXE4P4InCU; ttwid=1%7CImHTfO281EWFHlwwwC3iDH2Ys490_LbwZ0Z-9O6wVGg%7C1698935988%7C743e8edcbcaca910c57c1210a0b4b64ff5401998594bb224b7b8774885841a17; passport_fe_beating_status=true; msToken=T8qeeK9lcDMn6Lo94e6Tcle8eiiPnPYiqkUKg59t5WWK4fgtEciyZowZ42Bwmikaot6pehrhse2RJFwS_sknRzYOVM9a6jOferxUgSmAg4QEph2fw_8koJm5wDVAhfAaT6TNeU8=; tea_sid=c0273383-e3b4-44ea-9079-052a7a51a6e6; odin_tt=167e249d27df07cb69d4da1412bdd9734a68a65ada9f55aee3fb10a433f189d3be5b4dd279a48dbfbde0a45ad915f17ce4efc200459e7b0829496bde3a2e2392ac5229a378fd7c8f267db47dc3f2338c; msToken=r9ouWUzrq1lOnjrkRnkzFfpzBTSofeNIRd9ETLfQwuOul4Dc4SBXsOcSWWfc5zE2DQpmZqTBafWwrjX1-iFursDhMEqNzIYRCksulrinRXVjKQEuRUJ7qE3ooKYAApLPBmRNSZY=",
          },
        })
          .then((response) => {
            msToken = response.headers.get("X-Ms-Token");

            return response.json();
          })
          .then(async (data) => {
            const { cursor: newCursor, hasMore: newHasMore, itemList } = data;

            // Reassign cursor to get the next page.
            cursor = newCursor;

            // Reassign hasMore incase no more videos
            hasMore = newHasMore;
            if (itemList) {
              const videos = await Promise.all(
                itemList.map(async (video) => {
                  if (JanuaryFirst2023 - video.createTime * 1000 >= 0) {
                    hasmore = false;
                    return null;
                  }
                  count = count + 1;
                  const elementsWithHashtag = (video.textExtra || []).filter(
                    function (item) {
                      return item && item.hashtagName !== "";
                    }
                  );

                  const hashtags = elementsWithHashtag.map(function (item) {
                    return item.hashtagName;
                  });

                  return {
                    author: video.author.uniqueId,
                    created: video.createTime * 1000, // Tiktok gives us this value in seconds instead of milliseconds...
                    title: video.desc,
                    id: video.id,
                    duration: video.video.duration,
                    // video: [
                    //   {
                    //     url: await getVideoNoWM(video.id),
                    //   },
                    // ],
                    shareCount: video.stats.shareCount,
                    commentCount: video.stats.commentCount,
                    viewCount: video.stats.playCount,
                    likeCount: video.stats.diggCount,
                    isAd: video.adAuthorization ? video.adAuthorization : false,
                    locationCreated: video.locationCreated,
                    hashtags: hashtags.join(", "),
                  };
                })
              );

              // Filter out null values if any
              const filteredVideos = videos.filter((video) => video !== null);

              // Add these videos to Airtable
              // Link them using record id from brand.
              const batches = Math.ceil(filteredVideos.length / 10);
              console.log("videos");
              console.log(filteredVideos[0]);
              // for (let i = 0; i < batches; i++) {
              //   const start = i * 10;
              //   const end = start + 10;
              //   const batch = filteredVideos.slice(start, end);
              //   await delay(2000);
              //   await base("Videos")
              //     .create(
              //       batch.map((video) => ({
              //         fields: {
              //           ...video,
              //           Brand: [recordId],
              //         },
              //       }))
              //     )
              //     .catch((err) => console.error(err));
              // }
            }
          })
          .catch((err) => console.error(err));
      } while (hasMore === true);
      console.log("TOTAL VIDEOS: ", count);
    }
  }
})();
