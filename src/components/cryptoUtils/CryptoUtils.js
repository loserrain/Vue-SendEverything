import CryptoJS from "crypto-js";

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