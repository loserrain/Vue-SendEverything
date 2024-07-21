import rfc3526 from "./Diffie-Hellman-groups";

function modPow(base, exponent, modulus) {
  let result = BigInt(1);
  base = base % modulus;
  
  while (exponent > 0) {
    if (exponent % BigInt(2) === BigInt(1)) {
      result = (result * base) % modulus;
    }
    exponent = exponent / BigInt(2);
    base = (base * base) % modulus;
  }
  
  return result;
}

export function rfc3526roomPrime() {
  const p = rfc3526.modp15.prime.replace(/\s/g, '');
  return BigInt("0x" + p);
}

function rfc3526HexToDecimal (math) {
  const p = math.prime.replace(/\s/g, '');
  const g = math.generator;
  return { p, g }
}

export function generatePrivateKey(bits = 256) {
  let privateKey = BigInt(0);
  for (let i = 0; i < bits; i++) {
    if (Math.random() < 0.5) {
      privateKey |= BigInt(1) << BigInt(i);
    }
  }
  return privateKey;
}

export function generatePublicKey(privateKey) {
  const { p, g } = rfc3526HexToDecimal(rfc3526.modp15)
  const gBigInt = BigInt(g);
  const pBigInt = BigInt("0x" + p);
  // console.log("pBigInt: ", pBigInt.toString())
  return modPow(gBigInt, privateKey, pBigInt);
}

export function generateSharedSecretKey(publicKey, privateKey) {
  const { p } = rfc3526HexToDecimal(rfc3526.modp15)
  const pBigInt = BigInt("0x" + p);
  return modPow(publicKey, privateKey, pBigInt)
}

export async function digestMessage(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

export async function aesGcmEncrypt(plaintext, keyBuffer, initVector) {
  const key = await crypto.subtle.importKey(
    'raw', // raw format of the key - no need for wrapping
    keyBuffer,
    { name: 'AES-GCM', length: 256 }, // algorithm details
    false, // whether the key is extractable (i.e. can be used in exportKey)
    ['encrypt', 'decrypt'] // can be used to encrypt and decrypt
  );

  // const iv = crypto.getRandomValues(new Uint8Array(12)); // generate a new iv for every encryption
  const data = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: initVector },
    key,
    data
  );

  return new Uint8Array(encrypted);
}

export async function aesGcmDecrypt(ciphertext, keyBuffer, iv) {
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

(async () => {
  // User A's keys
  const privateKeyA = generatePrivateKey();
  const publicKeyA = generatePublicKey(privateKeyA);

  // Simulate another user (User B)
  const privateKeyB = generatePrivateKey();
  const publicKeyB = generatePublicKey(privateKeyB);

  // Calculate the shared secret key
  const sharedKeyA = generateSharedSecretKey(publicKeyB, privateKeyA) // User A computes shared secret using B's public key
  const sharedKeyB = generateSharedSecretKey(publicKeyA, privateKeyB) // User B computes shared secret using A's public key

  // console.log("Shared Key as computed by User A:", sharedKeyA.toString());
  // console.log("Shared Key as computed by User B:", sharedKeyB.toString());

  const aesKey = await digestMessage(sharedKeyB.toString()); // Hash the shared key to get AES key
  // console.log("aeskey: ", aesKey)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iv2 = Uint8Array.from(btoa(String.fromCharCode.apply(null, iv)), c => c.charCodeAt(0));
  // Encryption
  const encrypted = await aesGcmEncrypt('Hello, world!', aesKey, iv2);
  // console.log('Encrypted:', encrypted);

  // Decryption
  // const decrypted = await aesGcmDecrypt(encrypted, aesKey, iv);
  // console.log('Decrypted:', decrypted);
})();
