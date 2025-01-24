const path = require("path");
const fs = require("fs");
// used against local version of language api. from root, node ./actions/sendToApi/sendDev.js
async function process() {
  // const accessToken = core.getInput("token");
  // const octokit = github.getOctokit(accessToken);

  function findReviewersGuides(dir, filelist = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        findReviewersGuides(filePath, filelist);
      } else if (file.includes("Reviewers' Guide")) {
        filelist.push(filePath);
      }
    });
    return filelist;
  }

  const reviewersGuides = findReviewersGuides("./");
  console.log(`Found ${reviewersGuides.length} files:`);
  console.log(reviewersGuides);

  console.log(`Processings ${reviewersGuides.length} files`);
  const reduced = reviewersGuides.reduce((acc, file) => {
    const ext = path.extname(file);
    const baseName = path.basename(file, ext);
    if (!acc[baseName]) {
      acc[baseName] = {
        name: `${baseName}`,
        namespace: "github",
        type: "text",
        languageId: "en",
        renderings: [],
        title: baseName,
        domain: "peripheral",
        resourceType: "reviewers-guide",
        renderings: [],
      };
    }
    acc[baseName].renderings.push({
      namespace: "github",
      fileType: ext.substring(1).toLowerCase(),
      url: encodeURI(`https://github.com/WA/raw/master/PATH/${file}`),
      fileSizeBytes: 1000,
      hash: "AAA",
      nonScripturalMeta: {
        name: `${baseName}${ext}`,
      },
    });
    return acc;
  }, {});
  const arrOfObj = Object.values(reduced);
  if (arrOfObj.length === 0) {
    console.log("No files to process");
    return;
  }
  // Auth api
  // put in 1p 'https://login.microsoftonline.com/wycliffeassociates.org/oauth2/v2.0/token';
  // const TENANT = core.getInput("tenant");
  // const CLIENT_ID = core.getInput("client-id");
  // const AUTH_SECRET = core.getInput("auth-secret");
  // const apiScope = core.getInput("api-scope");
  // const LOGIN_URL = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`;
  // const options = {
  //   method: "POST",
  //   headers: {"content-type": "application/x-www-form-urlencoded"},
  //   body: new URLSearchParams({
  //     tenant: `${TENANT}`,
  //     client_id: `${CLIENT_ID}`,
  //     scope: `${apiScope}`,
  //     client_secret: `${AUTH_SECRET}`,
  //     grant_type: "client_credentials",
  //   }),
  // };

  // const response = await fetch(LOGIN_URL, options);
  // const data = await response.json();
  // const apiAccessToken = data.access_token;
  const apiAccessToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IllUY2VPNUlKeXlxUjZqekRTNWlBYnBlNDJKdyIsImtpZCI6IllUY2VPNUlKeXlxUjZqekRTNWlBYnBlNDJKdyJ9.eyJhdWQiOiJhcGk6Ly9iOTE3MWVkNC05ZTJlLTQ2Y2EtYTYxYS1mZmZlMDAxMDQ0YWYiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83YmFhMTEwOC02YWRiLTRiZTItOTljZi0wMGE0ODcyYWIxY2YvIiwiaWF0IjoxNzM3NzMzNDc2LCJuYmYiOjE3Mzc3MzM0NzYsImV4cCI6MTczNzczNzM3NiwiYWlvIjoiazJSZ1lQaFNXeDR5OFV0NTBQN01tS1k1aSsrcEFBQT0iLCJhcHBpZCI6ImI5MTcxZWQ0LTllMmUtNDZjYS1hNjFhLWZmZmUwMDEwNDRhZiIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzdiYWExMTA4LTZhZGItNGJlMi05OWNmLTAwYTQ4NzJhYjFjZi8iLCJvaWQiOiIxYjhmYWU2MC1iODllLTRmNzAtYmRkOC05NzI1ZTg5MjJhZTgiLCJyaCI6IjEuQVZBQUNCR3FlOXRxNGt1Wnp3Q2toeXF4ejlRZUY3a3Vuc3BHcGhyX19nQVFSSy0yQUFCUUFBLiIsInN1YiI6IjFiOGZhZTYwLWI4OWUtNGY3MC1iZGQ4LTk3MjVlODkyMmFlOCIsInRpZCI6IjdiYWExMTA4LTZhZGItNGJlMi05OWNmLTAwYTQ4NzJhYjFjZiIsInV0aSI6IjJiX0g2T2JYLVVLTGFSVnJPc1EwQUEiLCJ2ZXIiOiIxLjAifQ.R4uYtgBpaDmbmRZX8WG290B-tZoblNs-y2wdbYqSjnY54PPUfANItEZFwx7zAtvatg4B6_ZyCrvMnEyA_Jbn1rxyVR-mXpxPg260KfMml6rYkB6bzbTPgQhrMcyPd0ijietkAufjR_WxG_-wFNnf9V68nj_ZA8YGGaGft3Gn0A63E2HwbLaSLMKUGkYtXsNr-9mff1V1M3dBSHg2ve7vTTwMaEft9fZqvDE1NVOZQwHvRl7-O7nQwQIVe987o_Cig_L3BhE6A-gmbLN2CqBgnEg_HV7APfFpQyRFhYIuyt5GJc8Hm-2MY4aeNjIex2GSsdrLb3CezDVh9LD-2bhL3g";
  const apiUrl = "http://localhost:7071/api";

  // console.log(JSON.stringify(arrOfObj));
  console.log(`Sending ${arrOfObj.length} files to pub data api`);
  const res = await fetch(`${apiUrl}/contentWithRendering`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiAccessToken}`,
    },
    body: JSON.stringify(arrOfObj),
  });
  console.log(`Api res status: ${res.status}`);
  if (res.status !== 200) {
    throw new Error(
      `Api res status: ${res.status} and text: ${res.statusText}`
    );
  }

  //
  // schema for api is Array of
  /*
  name: string;
    namespace: string;
    type: "text" | "audio" | "video" | "braille";
    renderings: {
        namespace: string;
        contentId: string;
        fileType: string;
        url: string;
        tempId: string;
        id?: number | undefined;
        modifiedOn?: string | null | undefined;
        fileSizeBytes?: number | null | undefined;
        hash?: string | null | undefined;
        createdAt?: string | null | undefined;
        scripturalMeta?: {
            tempId: string;
            isWholeBook: boolean;
            isWholeProject: boolean;
            id?: number | undefined;
            sort?: number | null | undefined;
            renderingId?: number | undefined;
            bookSlug?: string | null | undefined;
            bookName?: string | null | undefined;
            chapter?: number | null | undefined;
        } | undefined;
        nonScripturalMeta?: {
            tempId: string;
            id?: number | undefined;
            name?: string | null | undefined;
            renderingId?: number | undefined;
            additionalData?: unknown;
        } | undefined;
    }[];
    id?: string | undefined;
    createdOn?: string | null | undefined;
    modifiedOn?: string | null | undefined;
    languageId?: string | null | undefined;
    title?: string | null | undefined;
    domain?: "scripture" | "gloss" | "parascriptural" | "peripheral" | null | undefined;
    resourceType?: string | null | undefined;
    level?: string | null | undefined;
    meta?: {
        showOnBiel: boolean;
        status: string;
        id?: number | ...
} | undefined
  */
}

process();
