let { randomBytes, createHash } = require("crypto");

let RC4 = require("./rc4.js");

async function sendMsg(url, data) {
  let f = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body: packetEncode(data),
  });

  let buf = Buffer.from(await f.arrayBuffer());

  return packetDecode(buf).toString();
}

const KEY_LENGTH = 128;
const SUM_LENGTH = 16;

function packetEncode(data) {
  let key = randomBytes(KEY_LENGTH);
  let dst = Buffer.alloc(SUM_LENGTH + KEY_LENGTH + data.length);
  key.copy(dst, SUM_LENGTH, 0, SUM_LENGTH + KEY_LENGTH);
  new RC4(key).xor(data).copy(dst, SUM_LENGTH + KEY_LENGTH);
  let digest = createHash("md5");
  digest.update(dst.subarray(SUM_LENGTH));
  digest.digest().copy(dst);
  return dst;
}

function packetDecode(data) {
  if (data.length < (SUM_LENGTH + KEY_LENGTH)) {
    let err = new Error(`response is less than expected ${data.length} < ${SUM_LENGTH + KEY_LENGTH}`);
    err.responseBody = data.toString("hex");
    throw err;
  }
  let digest = createHash("md5");
  digest.update(data.subarray(SUM_LENGTH));
  let [actual, expected] = [digest.digest(), data.subarray(0, SUM_LENGTH)];
  if (!actual.equals(expected)) {
    let err = new Error("checksum doesn't match?");
    err.actual = actual;
    err.expected = expected;
    err.responseBody = data.toString("hex");
    throw err;
  }
  let key = data.subarray(SUM_LENGTH, SUM_LENGTH + KEY_LENGTH);
  return new RC4(key).xor(data.subarray(SUM_LENGTH + KEY_LENGTH));
}

module.exports = {sendMsg, packetDecode, packetEncode};
