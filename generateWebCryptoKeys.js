import { writeFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
const algorithm = { name: "Ed25519" };
const encoder = new TextEncoder();
const cryptoKey = await webcrypto.subtle.generateKey(
  algorithm,
  true, /* extractable */
  ["sign", "verify"],
);
const privateKey = JSON.stringify(
  await webcrypto.subtle.exportKey("jwk", cryptoKey.privateKey),
);
writeFileSync("./privateKey.json", encoder.encode(privateKey));
const publicKey = JSON.stringify(
  await webcrypto.subtle.exportKey("jwk", cryptoKey.publicKey),
);
writeFileSync("./publicKey.json", encoder.encode(publicKey));
