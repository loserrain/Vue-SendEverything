// Test File.
import CryptoJS from "crypto-js";
import rfc3526 from "./Diffie-Hellman-groups";

export function encryptMessage(message) {
  const keyStr = "tdjyyxxytdjyyxxy";
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const srcs = CryptoJS.enc.Utf8.parse(message);
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

export function decrypt(word) {
  const keyStr = "tdjyyxxytdjyyxxy";
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const decrypt = CryptoJS.AES.decrypt(word, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

// // 假設 DH 演算法生成的共享密鑰是一個數字
// const sharedKey = 123456;

// // 定義一個函數來將數字密鑰轉換為 AES 加密算法所需的字串密鑰
// function convertToAESKey(sharedKey) {
//   // 使用 SHA-256 哈希函數作為 KDF
//   // const hash = CryptoJS.SHA3(sharedKey.toString());
//   const hash = generateKey(32);
//   // 將 SHA-256 哈希值轉換為字串形式作為 AES 密鑰
//   const aesKey = hash.toString(CryptoJS.enc.Hex).substring(0, 32); // AES 密鑰需要 256 位，即 32 字節
//   return aesKey;
// }

// 將 DH 共享密鑰轉換為 AES 加密算法所需的字串密鑰
// const aesKey = convertToAESKey(sharedKey);

// console.log("AES Key:", aesKey);

// function generateKey(num) {
//   let library =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let key = "";
//   for (let i = 0; i < num; i++) {
//     let randomPoz = Math.floor(Math.random() * library.length);
//     key += library.substring(randomPoz, randomPoz + 1);
//   }
//   return key;
// }
// console.log(generateKey(32));


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

function rfc3526HexToDecimal (math) {
  const p = math.prime.replace(/\s/g, '');
  const g = math.generator;
  return { p, g }
}

function generatePrivateKey(bits = 256) {
  let privateKey = BigInt(0);
  for (let i = 0; i < bits; i++) {
    if (Math.random() < 0.5) {
      privateKey |= BigInt(1) << BigInt(i);
    }
  }
  return privateKey;
}

function generatePublicKey(privateKey) {
  const { p, g } = rfc3526HexToDecimal(rfc3526.modp40)
  const gBigInt = BigInt(g);
  const pBigInt = BigInt("0x" + p);
  return modPow(gBigInt, privateKey, pBigInt);
}

function generateSharedSecretKey(publicKey, privateKey) {
  const { p } = rfc3526HexToDecimal(rfc3526.modp40)
  const pBigInt = BigInt("0x" + p);
  return modPow(publicKey, privateKey, pBigInt)
}

async function digestMessage(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

async function aesGcmEncrypt(plaintext, keyBuffer) {
  const key = await crypto.subtle.importKey(
    'raw', // raw format of the key - no need for wrapping
    keyBuffer,
    { name: 'AES-GCM', length: 256 }, // algorithm details
    false, // whether the key is extractable (i.e. can be used in exportKey)
    ['encrypt', 'decrypt'] // can be used to encrypt and decrypt
  );

  const iv = crypto.getRandomValues(new Uint8Array(12)); // generate a new iv for every encryption
  const data = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  );

  return { encrypted: new Uint8Array(encrypted), iv };
}

async function aesGcmDecrypt(ciphertext, keyBuffer, iv) {
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

// function sha256(buffer) {
//   return crypto.createHash('sha256').update(buffer).digest();
// }

(async () => {
  // User A's keys
  const privateKeyA = generatePrivateKey();
  const publicKeyA = generatePublicKey(privateKeyA);

  // Simulate another user (User B)
  const privateKeyB = generatePrivateKey();
  const publicKeyB = generatePublicKey(privateKeyB);

  // console.log("User A's Public Key (A):", publicKeyA.toString());
  // console.log("User B's Public Key (B):", publicKeyB.toString());

  // Calculate the shared secret key
  const sharedKeyA = generateSharedSecretKey(publicKeyB, privateKeyA) // User A computes shared secret using B's public key
  const sharedKeyB = generateSharedSecretKey(publicKeyA, privateKeyB) // User B computes shared secret using A's public key

  // console.log("Shared Key as computed by User A:", sharedKeyA.toString());
  // console.log("Shared Key as computed by User B:", sharedKeyB.toString());

  // console.log("Shared Key decimal length by User A:", sharedKeyA.toString().length);
  // console.log("Shared Key decimal length by User B:", sharedKeyB.toString().length);
  // console.log("Shared Key binary length by User A:", sharedKeyA.toString(2).length);
  // console.log("Shared Key binary length by User B:", sharedKeyB.toString(2).length);

  // Convert shared secret to AES key
  // const aesKeyA = sha256(Buffer.from(sharedKeyA.toString()));
  // const aesKeyB = sha256(Buffer.from(sharedKeyB.toString()));

  // const aesKeyA = await digestMessage(sharedKeyA.toString());
  // const aesKeyB = await digestMessage(sharedKeyB.toString());

  // console.log("AES Key for User A (SHA-256 of Shared Key):", aesKeyA);
  // console.log("AES Key for User B (SHA-256 of Shared Key):", aesKeyB);

  const aesKey = await digestMessage(sharedKeyB.toString()); // Hash the shared key to get AES key
  // console.log("aeskey: ", aesKey)

  // Encryption
  const { encrypted, iv } = await aesGcmEncrypt('Hello, world!', aesKey);
  // console.log('Encrypted:', encrypted);

  // Decryption
  const decrypted = await aesGcmDecrypt(encrypted, aesKey, iv);
  // console.log('Decrypted:', decrypted);
})();
