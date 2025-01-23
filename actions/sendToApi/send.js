const core = require("@actions/core");
const github = require("@actions/github");
const path = require("path");

async function process() {
  const accessToken = core.getInput("token");
  const octokit = github.getOctokit(accessToken);
  const repoTree = await octokit.rest.git.getTree({
    owner: github.context.payload.repository.owner.name,
    repo: github.context.payload.repository.name,
    tree_sha: core.getInput("branch"),
    recursive: true,
    headers: {
      "User-Agent": "actions-sendToApi",
    },
  });
  const reviewersGuides = repoTree.data.tree.filter((file) => {
    return file.path.includes("Reviewers' Guide") && file.type === "blob";
  });
  console.log(`Processings ${reviewersGuides.length} files`);
  const reduced = reviewersGuides.reduce((acc, file) => {
    const ext = path.extname(file.path);
    const baseName = path.basename(file.path, ext);
    if (!acc[baseName]) {
      acc[baseName] = {
        name: baseName,
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
      url: `https://github.com/${github.context.payload.repository.full_name}/raw/master/${file.path}`,
      fileSizeBytes: file.size,
      hash: file.sha,
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
  const TENANT = core.getInput("tenant");
  const CLIENT_ID = core.getInput("client-id");
  const AUTH_SECRET = core.getInput("auth-secret");
  const apiScope = core.getInput("api-scope");
  const LOGIN_URL = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`;
  const options = {
    method: "POST",
    headers: {"content-type": "application/x-www-form-urlencoded"},
    body: new URLSearchParams({
      tenant: `${TENANT}`,
      client_id: `${CLIENT_ID}`,
      scope: `${apiScope}`,
      client_secret: `${AUTH_SECRET}`,
      grant_type: "client_credentials",
    }),
  };

  const response = await fetch(LOGIN_URL, options);
  const data = await response.json();
  console.log(data);
  const apiAccessToken = data.access_token;
  const apiUrl = core.getInput("api-url");
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
