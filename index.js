// import statement at top-level for 
// Nodes.js' ES module Syntax detection https://nodejs.org/api/packages.html#syntax-detection 
// when not using --experimental-default-type=module
import { bundleIsolatedWebApp, WebBundleId } from "./wbn-bundle.js";
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import * as path from "node:path";
globalThis.Buffer ??= (await import("node:buffer")).Buffer; // For Deno
const algorithm = { name: "Ed25519" };
const decoder = new TextDecoder();
const script = readFileSync("./assets/script.js");
const privateKey = readFileSync("./privateKey.json");
const publicKey = readFileSync("./publicKey.json");
// https://github.com/tQsW/webcrypto-curve25519/blob/master/explainer.md
const cryptoKey = {
  privateKey: await webcrypto.subtle.importKey(
    "jwk",
    JSON.parse(decoder.decode(privateKey)),
    algorithm.name,
    true,
    ["sign"],
  ),
  publicKey: await webcrypto.subtle.importKey(
    "jwk",
    JSON.parse(decoder.decode(publicKey)),
    algorithm.name,
    true,
    ["verify"],
  ),
};

const webBundleId = await new WebBundleId(
    cryptoKey.publicKey,
  ).serialize();

const isolatedWebAppURL = await new WebBundleId(
    cryptoKey.publicKey,
  ).serializeWithIsolatedWebAppOrigin();

writeFileSync(
  "./assets/script.js",
  decoder.decode(script).replace(
     /USER_AGENT\s=\s"?.+"/g,
    `USER_AGENT = "Built with ${navigator.userAgent}"`,
  ),
);

const { fileName, source } = await bundleIsolatedWebApp({
  baseURL: isolatedWebAppURL,
  static: { dir: "assets" },
  formatVersion: "b2",
  output: "signed.swbn",
  integrityBlockSign: {
    webBundleId,
    isIwa: true,
    // https://github.com/GoogleChromeLabs/webbundle-plugins/blob/d251f6efbdb41cf8d37b9b7c696fd5c795cdc231/packages/rollup-plugin-webbundle/test/test.js#L408
    // wbn-sign/lib/signers/node-crypto-signing-strategy.js
    strategies: [new (class CustomSigningStrategy {
      async sign(data) {
        return new Uint8Array(
          await webcrypto.subtle.sign(algorithm, cryptoKey.privateKey, data),
        );
      }
      async getPublicKey() {
        return cryptoKey.publicKey;
      }
    })()],
  },
  headerOverride: {
    "cross-origin-embedder-policy": "require-corp",
    "cross-origin-opener-policy": "same-origin",
    "cross-origin-resource-policy": "same-origin",
    "content-security-policy":
      "base-uri 'none'; default-src 'self'; object-src 'none'; frame-src 'self' https: blob: data:; connect-src 'self' https: wss:; script-src 'self' 'wasm-unsafe-eval'; img-src 'self' https: blob: data:; media-src 'self' https: blob: data:; font-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; require-trusted-types-for 'script';",
  },
});
writeFileSync(fileName, source);
console.log(`${fileName}, ${source.byteLength} bytes.`);
