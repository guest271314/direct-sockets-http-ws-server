// @bun
// src/index.ts
import { BundleBuilder as BundleBuilder2 } from "wbn";

// shared/utils.ts
import * as fs from "fs";
import * as path from "path";
import mime from "mime";
import { combineHeadersForUrl } from "wbn";
import { IntegrityBlockSigner, WebBundleId } from "wbn-sign-webcrypto";

// shared/iwa-headers.ts
var headerNamesToLowerCase = function (headers) {
  const lowerCaseHeaders = {};
  for (const [headerName, headerValue] of Object.entries(headers)) {
    lowerCaseHeaders[headerName.toLowerCase()] = headerValue;
  }
  return lowerCaseHeaders;
};
function checkAndAddIwaHeaders(headers) {
  const lowerCaseHeaders = headerNamesToLowerCase(headers);
  for (
    const [iwaHeaderName, iwaHeaderValue] of Object.entries(iwaHeaderDefaults)
  ) {
    if (!lowerCaseHeaders[iwaHeaderName]) {
      console.log(
        `For Isolated Web Apps, ${iwaHeaderName} header was automatically set to ${iwaHeaderValue}. ${ifNotIwaMsg}`,
      );
      headers[iwaHeaderName] = iwaHeaderValue;
    }
  }
  for (
    const [iwaHeaderName, iwaHeaderValue] of Object.entries(
      invariableIwaHeaders,
    )
  ) {
    if (
      lowerCaseHeaders[iwaHeaderName] &&
      lowerCaseHeaders[iwaHeaderName].toLowerCase() !== iwaHeaderValue
    ) {
      throw new Error(
        `For Isolated Web Apps ${iwaHeaderName} should be ${iwaHeaderValue}. Now it is ${
          headers[iwaHeaderName]
        }. ${ifNotIwaMsg}`,
      );
    }
  }
}
/*!
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var coep = Object.freeze({
  "cross-origin-embedder-policy": "require-corp",
});
var coop = Object.freeze({
  "cross-origin-opener-policy": "same-origin",
});
var corp = Object.freeze({
  "cross-origin-resource-policy": "same-origin",
});
var CSP_HEADER_NAME = "content-security-policy";
var csp = Object.freeze({
  [CSP_HEADER_NAME]:
    "base-uri 'none'; default-src 'self'; object-src 'none'; frame-src 'self' https: blob: data:; connect-src 'self' https: wss:; script-src 'self' 'wasm-unsafe-eval'; img-src 'self' https: blob: data:; media-src 'self' https: blob: data:; font-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; require-trusted-types-for 'script'; frame-ancestors 'self';",
});
var invariableIwaHeaders = Object.freeze({
  ...coep,
  ...coop,
  ...corp,
});
var iwaHeaderDefaults = Object.freeze({
  ...csp,
  ...invariableIwaHeaders,
});
var ifNotIwaMsg =
  "If you are bundling a non-IWA, set `integrityBlockSign: { isIwa: false }` in the plugin's configuration.";

// shared/utils.ts
function addAsset(
  builder,
  baseURL,
  relativeAssetPath,
  assetContentBuffer,
  pluginOptions,
) {
  const parsedAssetPath = path.parse(relativeAssetPath);
  const isIndexHtmlFile = parsedAssetPath.base === "index.html";
  const shouldCheckIwaHeaders =
    typeof pluginOptions.headerOverride === "function" &&
    "integrityBlockSign" in pluginOptions &&
    pluginOptions.integrityBlockSign.isIwa;
  if (isIndexHtmlFile) {
    const combinedIndexHeaders = combineHeadersForUrl(
      { Location: "./" },
      pluginOptions.headerOverride,
      baseURL + relativeAssetPath,
    );
    if (shouldCheckIwaHeaders) {
      checkAndAddIwaHeaders(combinedIndexHeaders);
    }
    builder.addExchange(
      baseURL + relativeAssetPath,
      301,
      combinedIndexHeaders,
      "",
    );
  }
  const baseURLWithAssetPath = baseURL +
    (isIndexHtmlFile ? parsedAssetPath.dir : relativeAssetPath);
  const combinedHeaders = combineHeadersForUrl(
    {
      "Content-Type": mime.getType(relativeAssetPath) ||
        "application/octet-stream",
    },
    pluginOptions.headerOverride,
    baseURLWithAssetPath,
  );
  if (shouldCheckIwaHeaders) {
    checkAndAddIwaHeaders(combinedHeaders);
  }
  builder.addExchange(
    baseURLWithAssetPath,
    200,
    combinedHeaders,
    assetContentBuffer,
  );
}
function addFilesRecursively(
  builder,
  baseURL,
  dir,
  pluginOptions,
  recPath = "",
) {
  const files = fs.readdirSync(dir);
  files.sort();
  for (const fileName of files) {
    const filePath = path.join(dir, fileName);
    if (fs.statSync(filePath).isDirectory()) {
      addFilesRecursively(
        builder,
        baseURL,
        filePath,
        pluginOptions,
        recPath + fileName + "/",
      );
    } else {
      const fileContent = fs.readFileSync(filePath);
      addAsset(
        builder,
        baseURL,
        recPath + fileName,
        fileContent,
        pluginOptions,
      );
    }
  }
}
async function getSignedWebBundle(webBundle, opts, infoLogger) {
  const { signedWebBundle } = await new IntegrityBlockSigner(
    webBundle,
    opts.integrityBlockSign.strategy,
  ).sign();
  const origin = await new WebBundleId(
    await opts.integrityBlockSign.strategy.getPublicKey(),
  ).serializeWithIsolatedWebAppOrigin();
  infoLogger(origin);
  return signedWebBundle;
}
/*!
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// src/index.ts
var infoLogger = function (text) {
  console.log(`${consoleLogColor.green}${text}${consoleLogColor.reset}\n`);
};
/*!
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var consoleLogColor = { green: "\x1B[32m", reset: "\x1B[0m" };
async function bundleIsolatedWebApp(opts) {
  const builder = new BundleBuilder2(opts.formatVersion);
  if ("primaryURL" in opts && opts.primaryURL) {
    builder.setPrimaryURL(opts.primaryURL);
  }
  if (opts.static) {
    addFilesRecursively(
      builder,
      opts.static.baseURL ?? opts.baseURL,
      opts.static.dir,
      opts,
    );
  }
  let webBundle = builder.createBundle();
  if ("integrityBlockSign" in opts) {
    webBundle = await getSignedWebBundle(webBundle, opts, infoLogger);
  }
  return {
    fileName: opts.output,
    source: webBundle,
  };
}
export { bundleIsolatedWebApp as default };

//# debugId=C89D2538F4A0883964756e2164756e21
