/*
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
 
const keys = await generateKeyPair("RS256");
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });
 
process.stdout.write(
  `JWT_PRIVATE_KEY="${privateKey.trimEnd().replace(/\n/g, " ")}"`,
);
process.stdout.write("\n");
process.stdout.write(`JWKS=${jwks}`);
process.stdout.write("\n");
*/

/*
import { exportJWK, generateKeyPair } from "jose";

const { publicKey, privateKey } = await generateKeyPair("EdDSA", {
  crv: "Ed25519",
  extractable: true,
});

const publicWebKey = await exportJWK(publicKey);
const privateWebKey = await exportJWK(privateKey);
const stringifiedPrivateWebKey = JSON.stringify(privateWebKey);

const jwk = {
  publicKey: JSON.stringify(publicWebKey),
  privateKey: stringifiedPrivateWebKey,
};

console.log(jwk);
*/

import { exportJWK, generateKeyPair } from "jose";

const { publicKey, privateKey } = await generateKeyPair("RS256", {
  extractable: true,
});

const publicWebKey = await exportJWK(publicKey);
const privateWebKey = await exportJWK(privateKey);
const stringifiedPrivateWebKey = JSON.stringify(privateWebKey);

const jwk = {
  publicKey: JSON.stringify(publicWebKey),
  privateKey: stringifiedPrivateWebKey,
};

console.log(jwk);
