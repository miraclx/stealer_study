// JS Port of the Go RC4 implementation
//
// https://cs.opensource.google/go/go/+/refs/tags/go1.23.6:src/crypto/rc4/rc4.go;drc=a0da9c00aeb51261b9845a46fbc9878870884ab6
//
// Miraculous Owonubi

let { randomBytes } = require("crypto");

class RC4 {
  #stream;
  #i = 0;
  #j = 0;
  
  constructor(key) {
    let k = key.length;
    if (k < 1 || k > 256)
      throw new Error("key size error, expected 1 < x < 256");
    let c = Buffer.alloc(256);
    for (let i = 0; i < 256; i ++) c[i] = i;
    let j = 0;
    for (let i = 0; i < 256; i ++) {
      j = (j + c[i] + key[i % k]) % 256;
      [c[i], c[j]] = [c[j], c[i]];
    }
    this.#stream = c;
  }

  xor(src) {
    src = Buffer.isBuffer(src) ? src : Buffer.from(src);
    if (!src.length) return src;
    let dst = Buffer.alloc(src.length);
    let [i, j] = [this.#i, this.#j];
    for (let [k, v] of Object.entries(src)) {
      i = (i + 1) % 256;
      let x = this.#stream[i];
      j = (j + x) % 256;
      let y = this.#stream[j];
      [this.#stream[i], this.#stream[j]] = [y, x];
      dst[k] = v ^ (this.#stream[(x + y) % 256] % 256);
    }
    [this.#i, this.#j] = [i, j];
    return dst;
  }

  reset() {
    this.#stream.fill(this.#i = this.#j = 0);
  }
}

module.exports = RC4;

if (module === require.main) {
  let [,, value, key] = process.argv;

  key = key ?? randomBytes(32);
  value = value ?? "Hello, World";

  console.log(`Secret Key : ${key.toString("base64")}`);

  console.log(`Plain Text : ${value}`);

  key = Buffer.alloc(128, key);

  let cipher = new RC4(key);

  let cipher_text = cipher.xor(value);
  
  console.log(`Cipher Text: ${cipher_text.toString("base64")}`);
  
  cipher.reset();

  let plain_text = cipher.xor(value);
  
  console.log(`Plain Text : ${plain_text.toString()}`);
}
