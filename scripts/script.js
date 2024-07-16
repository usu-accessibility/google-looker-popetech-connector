import "dotenv/config";
import axios from "axios";
import { createArrayCsvWriter } from "csv-writer";

import { fields, titles } from "./fields.js";

const BASE_URL = process.env.BASE_URL;
const POPETECH_API_KEY = process.env.POPETECH_API_KEY;

async function main() {
  const csvWriter = createArrayCsvWriter({
    path: "./popetech-errors.csv",
    header: titles,
  });

  const errors = await getPopetechErrors();

  csvWriter.writeRecords(errors).then(() => console.log("CSV created!"));
}

main();

async function getPopetechErrors() {
  const websites = await getPopetechWebsites();

  const totals = [];
  for (const site of websites) {
    const details = await fetcher(
      BASE_URL + "/reports/result-details?website_filter=" + site.publicId,
    );

    const errors = details?.errors || [];
    const contrast = details?.contrast?.[0]?.count || 0;

    const row = fields.map((field) => {
      switch (field) {
        case "url":
          return site.url;
        case "publicId":
          return site.publicId;
        case "very_low_contrast":
          return contrast;
        default:
          const found = errors.find((err) => err.slug === field);

          if (found) {
            return found.count;
          } else {
            return 0;
          }
      }
    });

    totals.push(row);
  }

  return totals;
}

async function getPopetechWebsites() {
  const websites = [];
  let url = BASE_URL + "/websites?limit=250";

  while (url) {
    const sites = await fetcher(url);

    for (const site of sites.data) {
      websites.push({
        publicId: site.public_id,
        url: site.full_url,
      });
    }

    if (sites.meta.pagination.links.next) {
      url = sites.meta.pagination.links.next + "&limit=250";
    } else {
      url = null;
    }
  }

  return websites;
}

async function fetcher(url) {
  let retryCounts = {};
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: "Bearer " + POPETECH_API_KEY,
      },
    });

    return response.data;
  } catch {
    if (retryCounts[url]) {
      if (retryCounts[url] < 10) {
        retryCounts[url] = retryCounts[url] + 1;

        console.log("Limiting on url: " + url);
        sleep(20);
        return await fetcher(url);
      } else {
        throw new Error("Max retry count hit on url: " + url);
      }
    } else {
      retryCounts[url] = 1;

      console.log("Limiting on url: " + url);
      await sleep(20);
      return await fetcher(url);
    }
  }
}

async function sleep(sec) {
  return await new Promise((r) => setTimeout(r, sec * 1000));
}
