function toUtf8Bytes(value: string): number[] {
  const bytes: number[] = [];

  for (let index = 0; index < value.length; index += 1) {
    let codePoint = value.charCodeAt(index);

    if (codePoint >= 0xd800 && codePoint <= 0xdbff && index + 1 < value.length) {
      const low = value.charCodeAt(index + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (low - 0xdc00);
        index += 1;
      }
    }
    if (codePoint >= 0xd800 && codePoint <= 0xdfff) {
      codePoint = 0xfffd;
    }

    if (codePoint <= 0x7f) {
      bytes.push(codePoint);
    } else if (codePoint <= 0x7ff) {
      bytes.push(0xc0 | (codePoint >>> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint <= 0xffff) {
      bytes.push(
        0xe0 | (codePoint >>> 12),
        0x80 | ((codePoint >>> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    } else {
      bytes.push(
        0xf0 | (codePoint >>> 18),
        0x80 | ((codePoint >>> 12) & 0x3f),
        0x80 | ((codePoint >>> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    }
  }

  return bytes;
}

function rotateLeft(value: number, bits: number): number {
  return (value << bits) | (value >>> (32 - bits));
}

function sha1(bytes: number[]): number[] {
  const message = bytes.slice();
  const bitLengthHigh = Math.floor(bytes.length / 0x20000000);
  const bitLengthLow = (bytes.length << 3) >>> 0;

  message.push(0x80);
  while (message.length % 64 !== 56) {
    message.push(0);
  }

  for (let shift = 24; shift >= 0; shift -= 8) {
    message.push((bitLengthHigh >>> shift) & 0xff);
  }
  for (let shift = 24; shift >= 0; shift -= 8) {
    message.push((bitLengthLow >>> shift) & 0xff);
  }

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;
  const words = new Array(80);

  for (let offset = 0; offset < message.length; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      const wordOffset = offset + index * 4;
      words[index] = (
        (message[wordOffset] << 24) |
        (message[wordOffset + 1] << 16) |
        (message[wordOffset + 2] << 8) |
        message[wordOffset + 3]
      );
    }
    for (let index = 16; index < 80; index += 1) {
      words[index] = rotateLeft(
        words[index - 3] ^ words[index - 8] ^ words[index - 14] ^ words[index - 16],
        1
      );
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let index = 0; index < 80; index += 1) {
      let value;
      let constant;

      if (index < 20) {
        value = (b & c) | (~b & d);
        constant = 0x5a827999;
      } else if (index < 40) {
        value = b ^ c ^ d;
        constant = 0x6ed9eba1;
      } else if (index < 60) {
        value = (b & c) | (b & d) | (c & d);
        constant = 0x8f1bbcdc;
      } else {
        value = b ^ c ^ d;
        constant = 0xca62c1d6;
      }

      const next = (rotateLeft(a, 5) + value + e + constant + words[index]) | 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = next;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }

  const digest: number[] = [];
  [h0, h1, h2, h3, h4].forEach((word) => {
    digest.push(
      (word >>> 24) & 0xff,
      (word >>> 16) & 0xff,
      (word >>> 8) & 0xff,
      word & 0xff
    );
  });
  return digest;
}

function toBase64(bytes: number[]): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = index + 1 < bytes.length ? bytes[index + 1] : 0;
    const third = index + 2 < bytes.length ? bytes[index + 2] : 0;
    const chunk = (first << 16) | (second << 8) | third;

    output += alphabet[(chunk >>> 18) & 0x3f];
    output += alphabet[(chunk >>> 12) & 0x3f];
    output += index + 1 < bytes.length ? alphabet[(chunk >>> 6) & 0x3f] : "=";
    output += index + 2 < bytes.length ? alphabet[chunk & 0x3f] : "=";
  }

  return output;
}

export function hmacSha1Base64(key: string, message: string): string {
  let keyBytes = toUtf8Bytes(key);
  if (keyBytes.length > 64) {
    keyBytes = sha1(keyBytes);
  }

  const innerKey = new Array(64);
  const outerKey = new Array(64);
  for (let index = 0; index < 64; index += 1) {
    const value = index < keyBytes.length ? keyBytes[index] : 0;
    innerKey[index] = value ^ 0x36;
    outerKey[index] = value ^ 0x5c;
  }

  const innerDigest = sha1(innerKey.concat(toUtf8Bytes(message)));
  return toBase64(sha1(outerKey.concat(innerDigest)));
}
