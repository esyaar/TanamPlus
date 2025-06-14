import { TCollections } from "@/constants/Firebase";
import { db } from "@/services/firebaseConfig"; 
import { collection, doc } from "firebase/firestore";

/**
 * @returns {string} An ID Firestore string
 */
export function generateID(collectionName: TCollections): string {
  const newDocRef = doc(collection(db, collectionName)); // Gunakan db yang sudah diimpor
  const generatedId = newDocRef.id; 
  return generatedId;
}

export function createHashSHA1(str: string): string {
  function rotate_left(n: number, s: number) {
    return (n << s) | (n >>> (32 - s));
  }

  function cvt_hex(val: number) {
    let str = '';
    let i: number;
    let v: number;

    for (i = 7; i >= 0; i--) {
      v = (val >>> (i * 4)) & 0x0f;
      str += v.toString(16);
    }
    return str;
  }

  // UTF-8 encode
  str = unescape(encodeURIComponent(str));

  const word_array: number[] = [];
  let i: number;

  for (i = 0; i < str.length - 3; i += 4) {
    const j = (str.charCodeAt(i) << 24) |
      (str.charCodeAt(i + 1) << 16) |
      (str.charCodeAt(i + 2) << 8) |
      str.charCodeAt(i + 3);
    word_array.push(j);
  }

  let remainder = 0;
  switch (str.length % 4) {
    case 0:
      remainder = 0x080000000;
      break;
    case 1:
      remainder = (str.charCodeAt(i) << 24) | 0x0800000;
      break;
    case 2:
      remainder = (str.charCodeAt(i) << 24) | (str.charCodeAt(i + 1) << 16) | 0x08000;
      break;
    case 3:
      remainder = (str.charCodeAt(i) << 24) |
        (str.charCodeAt(i + 1) << 16) |
        (str.charCodeAt(i + 2) << 8) |
        0x80;
      break;
  }

  word_array.push(remainder);

  while ((word_array.length % 16) !== 14) word_array.push(0);

  word_array.push(str.length >>> 29);
  word_array.push((str.length << 3) & 0x0ffffffff);

  const W = new Array(80);
  let H0 = 0x67452301;
  let H1 = 0xEFCDAB89;
  let H2 = 0x98BADCFE;
  let H3 = 0x10325476;
  let H4 = 0xC3D2E1F0;

  for (let blockstart = 0; blockstart < word_array.length; blockstart += 16) {
    for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
    for (i = 16; i < 80; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

    let A = H0;
    let B = H1;
    let C = H2;
    let D = H3;
    let E = H4;

    for (i = 0; i < 80; i++) {
      let temp: number;
      if (i < 20) {
        temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
      } else if (i < 40) {
        temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
      } else if (i < 60) {
        temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
      } else {
        temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
      }

      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    H0 = (H0 + A) & 0x0ffffffff;
    H1 = (H1 + B) & 0x0ffffffff;
    H2 = (H2 + C) & 0x0ffffffff;
    H3 = (H3 + D) & 0x0ffffffff;
    H4 = (H4 + E) & 0x0ffffffff;
  }

  return cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
}