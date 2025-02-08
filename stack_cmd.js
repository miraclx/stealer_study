function encodeMsg(id, reqtype, data) {
  let encoded = [id];
  encoded.push(Buffer.from(reqtype).toString("base64"));
  for (let item of data)
    encoded.push(Buffer.from(item).toString("base64"));
  return encoded.join(" ");
}

function decodeMsg(data) {
  let parts = data.split(" ");
  for (let [k, v] of Object.entries(parts))
    parts[k] = Buffer.from(v, "base64");
  if (data.length == 1) return parts;
  return [parts[0].toString(), parts.slice(1)];
}

module.exports = {encodeMsg, decodeMsg};
