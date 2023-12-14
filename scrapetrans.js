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

const mobileUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36";

const cookieHeader =
  "cookie-consent={%22ga%22:true%2C%22af%22:true%2C%22fbp%22:true%2C%22lip%22:true%2C%22bing%22:true%2C%22ttads%22:true%2C%22reddit%22:true%2C%22criteo%22:true%2C%22version%22:%22v9%22}; tta_attr_id=0.1675945331.7198130387388727298; tta_attr_id_mirror=0.1675945331.7198130387388727298; _abck=C231A4B040EB1F3A1EEBF4D070A6F524~-1~YAAQBnP8PnxPk+OGAQAAUnt96QnQRwlfQ7+oS4JZBpMqPiTKK+FSKFu3lZATTAcvim5rDi8t8lRYdvpkyTGcbUgeKfJgt7++8TwH3d61GHE+DS+8V93xwS8JKU9Dgp6YQCkLNQHJJQlaHvyqlRkXd5VCYxJ1X+Ep4VPCMU4LdtRluf3mUKCuElcqiSaopwQTdjps4w86/JKvTZrMvsnB/nyowEPY9UYTdSXFoIn4tBdOYgSZSmGhNBCqRzPAHE6ZEil28F6IkbobXpt6D7oks5TtvXHiXdly9plg4rL4vYzPvPxDLOXB+6q356AUUXMOjAuz5chFbe1oPGhbpr/Jtom+k1VPIieezYfIHR0XQfgzwjTIIUfH+VnbeUJuEb4OUrFPCOt9aqvprg==~-1~-1~-1; locale=en-US; _tt_enable_cookie=1; _ttp=2OdkbmcgBUdRERi1G91wCBNem6d; tt_chain_token=oebSVkAkoJVfGrMaiZYG5w==; _gid=GA1.2.1428860792.1684487449; _gat_UA-143770054-3=1; _hjSessionUser_2525957=eyJpZCI6IjBjMjMyOTE2LTg1NDEtNWNkOC05M2Y5LTY0NWE0ZmJkN2M4NyIsImNyZWF0ZWQiOjE2ODQ0ODc0NDk1NTgsImV4aXN0aW5nIjp0cnVlfQ==; cto_bundle=IiGEU195Y3ElMkJISDh1cENHUkFSMWZlNmclMkZNb29SeUpFamwyZ3lCaCUyRnFIJTJCSndlY0xmM3BFNyUyQks1THg5aWt5cWVNb29nT0dIeklENFRKM2hMJTJCJTJGczlhRFpwdVZGWDFabklLJTJGeGN5JTJGaWphTUhzU20wVHVheDBrZlRqT1NtbzZYRWJhbkFNVDdoVjk4eVVVOWElMkIlMkI4UjY3eWVHeHFtcEZLQUZoV20xZEluQnNvOHFEMXBzMzE3eXNWaVN4RGhkVmVLJTJCdzh4aFQ; _gac_UA-143770054-3=1.1684487458.CjwKCAjwvJyjBhApEiwAWz2nLcRGQWFH_0grITg_XRzgeaQqHDYPNYBIGDE3b0unGUdsfMcpKXZVJxoCqHQQAvD_BwE; _ga=GA1.1.66738151.1680251725; _ga_BZBQ2QHQSP=GS1.1.1688035199.1.1.1688035240.0.0.0; _ga_QQM0HPKD40=GS1.1.1691420404.3.1.1691420415.49.0.0; d_ticket=b07365117acd3127a62902e5a9c0c84ab3c5e; sid_guard=5184378ea96dbb45cce1b7e91a15a2e3%7C1691422452%7C15552000%7CSat%2C+03-Feb-2024+15%3A34%3A12+GMT; uid_tt=1b466aa2a35efd08d764b79ef20ba152769146f171ee4cb74eb03f381642a693; uid_tt_ss=1b466aa2a35efd08d764b79ef20ba152769146f171ee4cb74eb03f381642a693; sid_tt=5184378ea96dbb45cce1b7e91a15a2e3; sessionid=5184378ea96dbb45cce1b7e91a15a2e3; sessionid_ss=5184378ea96dbb45cce1b7e91a15a2e3; sid_ucp_v1=1.0.0-KDE3ZGI5YjczNjhkYzU0NjQwODEwOTFiYjFiNThlMWNiY2U4OGMxZTcKIAiGiJmC4eH79WIQ9J3EpgYYswsgDDDA3q-XBjgEQOoHEAMaCHVzZWFzdDJhIiA1MTg0Mzc4ZWE5NmRiYjQ1Y2NlMWI3ZTkxYTE1YTJlMw; ssid_ucp_v1=1.0.0-KDE3ZGI5YjczNjhkYzU0NjQwODEwOTFiYjFiNThlMWNiY2U4OGMxZTcKIAiGiJmC4eH79WIQ9J3EpgYYswsgDDDA3q-XBjgEQOoHEAMaCHVzZWFzdDJhIiA1MTg0Mzc4ZWE5NmRiYjQ1Y2NlMWI3ZTkxYTE1YTJlMw; tt-target-idc=useast2a; tt-target-idc-sign=FqFthJavBnhNWbsUtFPpLP2GGCkXMW8YonoBmRzzGE__kS67lWZLAZy29KG_A56lW2Sz5BOGygDxSxXrWxZGzThu4gyKwBc083QLFRJmGpjEZ4--n5aYAPo6tbzrjvwogmyD7krXvKnKcucQ_0Etfig0_KVZPVO8W0OuxNAXLlq0fxwPROCxhBmqWZ5cwsw5bDP_Et7q3Cvj8fhDJ74crOp3Bv-khlWOxC4-XOxIBUbTXHjTOOVsB1SJN4yf6vuuPXVd4Xo9Qhi8gkA_18n4amxeSjDOir10VlSaHc1AOrQBhbiZGHKi9JeNs8MbyI2_qhaRfflUSZ2RHCLFMdUM1BvgEiO9qXgsMEOVzx3IEU4PdQLKjTmbXf5E_01uDTETI21CK-IfYjwIYqUDil9sGmtj-k1bDcwi4Zp81ErWFnCjuy4L9629LnWg3GIlebl197ZUaATJMEbEcCYTqWgp_0AfVFrz6sRfXU51MIXkQjFCzssbnziZK-Sn_9T2t2uh; d_ticket_ads=5f6f2c74ca69c51bac1a79cda154c0a6b3c5e; passport_csrf_token=75a94707716196575a5667b25f2a2b19; passport_csrf_token_default=75a94707716196575a5667b25f2a2b19; lang=en; _ga_LVN0C1THGC=GS1.1.1695196996.3.0.1695196998.0.0.0; from_way=paid; _gcl_au=1.1.802059761.1695197012; _rdt_uuid=1695197012337.faf27883-6ee7-4386-bc1a-bd571bda22a5; _fbp=fb.1.1695197026790.1285021128; passport_auth_status_ads=6016aed5af22fd81896fde9d7eab70b0%2Cda36bc828a1f89b89624790ef76e298d; passport_auth_status_ss_ads=6016aed5af22fd81896fde9d7eab70b0%2Cda36bc828a1f89b89624790ef76e298d; uid_tt_ads=6f9b69eb21fd0c7f31c5d3a77145f4a8075b5941b84e5dee80e3025b24439a4b; uid_tt_ss_ads=6f9b69eb21fd0c7f31c5d3a77145f4a8075b5941b84e5dee80e3025b24439a4b; sid_tt_ads=c2040b1834a9f5598dc1e8635fad435f; sessionid_ads=c2040b1834a9f5598dc1e8635fad435f; sessionid_ss_ads=c2040b1834a9f5598dc1e8635fad435f; store-idc=useast2a; store-country-code=gb; store-country-code-src=uid; _gcl_aw=GCL.1696841140.CjwKCAjwyY6pBhA9EiwAMzmfwQnb7weBi2h-IpzyjLgJbSA74f3ezzjFRNGti7vhtkgPFxHxxrY2gRoCCV4QAvD_BwE; _uetvid=0c0115c0f62511ed81395d12082cbea2; _ga_R5EYE54KWQ=GS1.1.1696841140.4.0.1696841140.60.0.0; sid_guard_ads=c2040b1834a9f5598dc1e8635fad435f%7C1696841141%7C864000%7CThu%2C+19-Oct-2023+08%3A45%3A41+GMT; sid_ucp_v1_ads=1.0.0-KGJjNzNmMDY2NjJkZDIwNWYyZDlhOTJiZTgyOTFlOTk2NDNiMTA5NzAKGgiCiM3m8KOx6GQQtfuOqQYYrwwgDDgBQOsHEAMaA3NnMSIgYzIwNDBiMTgzNGE5ZjU1OThkYzFlODYzNWZhZDQzNWY; ssid_ucp_v1_ads=1.0.0-KGJjNzNmMDY2NjJkZDIwNWYyZDlhOTJiZTgyOTFlOTk2NDNiMTA5NzAKGgiCiM3m8KOx6GQQtfuOqQYYrwwgDDgBQOsHEAMaA3NnMSIgYzIwNDBiMTgzNGE5ZjU1OThkYzFlODYzNWZhZDQzNWY; _ga_ER02CH5NW5=GS1.1.1696844754.9.0.1696844754.60.0.0; _ga_HV1FL86553=GS1.1.1696851819.23.1.1696851861.18.0.0; tt_csrf_token=MIONCgBB-j1sWIeVSss-1OM7Ffaw8M42NCGk; s_v_web_id=verify_lnkeg3t3_hN1gUlfi_5bR7_4UjK_90rH_EQEhYmQ506em; odin_tt=6b1739078f36d6cd00676b543df9cc582c0b5a320817167ef52edc6108bed4685aec19f7fb081db9d0135a6617d6b21488c555f516ece49c5cfc26ec520304f88b036c42fe8aefb5c6d77f0c43e7d844; msToken=arzt2_oYprozNQ485wR0EvlGiilC1N245pNaKKs-LPcHLjfb1yV1oA8iJ4FoHefCQt3OjI5_kLmsW4ZLIS3DiKub9Mc8mp2qQQAvYAj4-XtJfIThf0B2; ttwid=1%7CImHTfO281EWFHlwwwC3iDH2Ys490_LbwZ0Z-9O6wVGg%7C1697116230%7Cd6b92331f4c6590c6d97c90021b600e066f52d1ac87ba08f69d17cb725f0b117";

(async () => {
  const response = await fetch(
    "https://v16-webapp.tiktok.com/34ca0ca8c6e09e3d7a248306cba0ed72/652844bd/video/tos/useast2a/tos-useast2a-v-0068/3765b69d430b4a36b55a9b17aed4abf2/",
    //"https://v16-webapp.tiktok.com/a492335cc04aa76befd160f90070a4b7/652849ee/video/tos/alisg/tos-alisg-pv-0037/5a71116eb16d4cfba2721515264d36b2/",
    {
      headers: {
        "User-Agent": mobileUserAgent,
        Cookie: cookieHeader,
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      agent: agent,
    }
  );

  const data = await response.text();

  console.log("data");
  console.log(data);
})();
