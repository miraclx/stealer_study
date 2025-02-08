const { tmpdir } = require("os");
const { join, basename } = require("path");
const { createWriteStream } = require("fs");
const { randomBytes, createHash } = require("crypto");
const { stat, mkdir, mkdtemp, writeFile } = require("fs/promises");

let {encodeMsg, decodeMsg} = require("./stack_cmd.js");
let {sendMsg} = require("./htxp.js");

const GLOBAL = {
  STREAMS: {
    LOGS: undefined,
    RAW_IO: undefined,
  },
  ARTIFACTS_DIR: undefined,
};
const DEBUG = "DEBUG" in process.env && !["0", "no"].includes(process.env["DEBUG"]);

function $(...args) {
  GLOBAL.STREAMS.LOGS.write(pretty_payload(args).join(" ") + "\n");
  return args;
}

log = (...args) => console.log(...$(...args));
warn = (...args) => console.warn(...$("\x1b[33mWARN\x1b[0m", ...args));
debug = (...args) => void (DEBUG && console.debug(...$("\x1b[36mDEBUG\x1b[0m", ...args)));
error = (...args) => console.debug(...$("\x1b[31mERROR\x1b[0m", ...args));

const MSG = {
  MSG_INFO    : "fwe9",
  MSG_LOG     : "1q2w",
  LOG_SUCCESS : "true",
  LOG_FAIL    : "false",
  MSG_PING    : "poiu",
  MSG_FILE    : "qpwoe",
};
MSG.alt = Object.fromEntries(Object.entries(MSG).map(([k,v])=>[v,k]));

const COMMAND = {
  COMMAND_INFO          : "qwer",
  COMMAND_UPLOAD        : "asdf",
  COMMAND_DOWNLOAD      : "zxcv",
  COMMAND_OSSHELL       : "vbcx",
  SHELL_MODE_WAITGETOUT : "qmwn",
  SHELL_MODE_DETACH     : "qalp",
  COMMAND_WAIT          : "ghdj",
  COMMAND_AUTO          : "r4ys",
  AUTO_CHROME_GATHER    : "89io",
  AUTO_CHROME_PREFRST   : "7ujm",
  AUTO_CHROME_COOKIE    : "gi%#",
  AUTO_CHROME_KEYCHAIN  : "kyci",
  COMMAND_EXIT          : "dghh",
};
COMMAND.alt = Object.fromEntries(Object.entries(COMMAND).map(([k,v])=>[v,k]));

function display(codeOrMsg) {
  if (codeOrMsg in COMMAND.alt) return `> [\x1b[33m${COMMAND.alt[codeOrMsg]}\x1b[0m (${codeOrMsg})]`;
  if (codeOrMsg in MSG.alt) return `[${MSG.alt[codeOrMsg]} (${codeOrMsg})]`;
  return ` \x1b[34m?\x1b[0m ${codeOrMsg}`;
}

async function startLoop(id, url) {
  let alive = true;
  
  let cmd_data = [], cmd_type = COMMAND.COMMAND_INFO;
  
  while (alive) {
    let msg_type = "", msg_data = [];
    try {
      [msg_type, msg_data, alive] = await handleCommand(cmd_type, cmd_data, alive);
    } catch (e) {
      error(`caught error while handling \`${COMMAND.alt[cmd_type]}\``);
    }

    debug(" sending:", msg_type, msg_data);
    GLOBAL.STREAMS.RAW_IO.write(`> ${msg_type} ${pretty_payload(msg_data).join(" ")}\n`);

    let msg = encodeMsg(id, msg_type, msg_data);
    
    let cmd = await sendMsg(url, msg);
    
    [cmd_type, cmd_data] = decodeMsg(cmd);

    debug("received:", cmd_type, cmd_data);
    GLOBAL.STREAMS.RAW_IO.write(`< ${cmd_type} ${pretty_payload(cmd_data).join(" ")}\n`);
  }

  log("exit");
}

function pretty_payload(data) {
  if (typeof data === "string") return data;
  if (Buffer.isBuffer(data)) return data.toString("base64");
  if (Array.isArray(data)) {
    let out = [];
    for (let v of data) {
      v = pretty_payload(v);
      out.push(...(Array.isArray(v) ? v : [v]));
    }
    return out;
  }
  return data;
}

async function handleCommand(cmd_type, cmd_data, alive) {
  let msg_type = "", msg_data = [];
  
  switch (cmd_type) {
    case COMMAND.COMMAND_INFO:
      log(display(cmd_type));
      [msg_type, msg_data] = processInfo();
      break;
    case COMMAND.COMMAND_UPLOAD:
      log(display(cmd_type));
      [msg_type, msg_data] = await processUpload(cmd_data);
      break;
    case COMMAND.COMMAND_DOWNLOAD:
      log(display(cmd_type));
      [msg_type, msg_data] = await processDownload(cmd_data);
      break;
    case COMMAND.COMMAND_OSSHELL:
      log(display(cmd_type));
      [msg_type, msg_data] = await processOsShell(cmd_data);
      break;
    case COMMAND.COMMAND_AUTO:
      log(display(cmd_type));
      [msg_type, msg_data] = processAuto(cmd_data);
      break;
    case COMMAND.COMMAND_WAIT:
      log(display(cmd_type));
      [msg_type, msg_data] = await processWait(cmd_data);
      break;
    case COMMAND.COMMAND_EXIT:
      log(display(cmd_type));
      [msg_type, msg_data] = processExit();
      alive = false;
      break;
    default:
      log(`Unhandled command: [${cmd_type}]`);
  }

  return [msg_type, msg_data, alive];
}

// $ tar -cf - --files-from=/dev/null | gzip | xxd -c0 -p
const EMPTY_TAR_GZ = Buffer.from("1f8b080064b2a6670003edc1010d000000c2a0f74f6d0e37a00000000000000000008037039ade1d2700280000", "hex");

async function processUpload(cmd_data) {
  log(display("The server attempted to put a file on this machine:"))

  let path = cmd_data[0].toString();
  let blob = cmd_data[1];
  
  log(display(` - Location: \`${path}\``));;
  log(display(` - Blob Size: \`${blob.length}\``));
  
  let digest = createHash("sha256");
  digest.update(blob);
  let hash = digest.digest();

  log(display(` - Hash: \`${hash.toString("base64")}\``));
  
  let file = join(GLOBAL.ARTIFACTS_DIR, randomBytes(10).toString("hex"));
  
  log(display(` - Saving To: \`${file}\``));

  await writeFile(file, blob);
  
  return [MSG.MSG_LOG, [MSG.LOG_SUCCESS, `${path} : ${blob.length}`]];
}

async function processDownload(cmd_data) {
  let path = cmd_data[0].toString();

  log(display("The server attempted to download a file from this machine:"));
  log(display(` - Location: \`${path}\``));
  
  let file = basename(path);
  let meta = await stat(file);

  let type = meta.isDirectory() ? "Directory" : meta.isFile() ? "File" : `Non-file/dir, dumping all stats: ${meta}`;
  
  log(display(` - Type: \`${type}\``));

  return [MSG.MSG_FILE, [MSG.LOG_SUCCESS, `${file}.tar.gz`, EMPTY_TAR_GZ]];
}

async function processOsShell(cmd_data) {
  log(display("The server attempted to run a command on this machine:"));
  
  let mode = cmd_data[0].toString();
  let timeout = parseInt(cmd_data[1], 16);
  let shell = cmd_data[2].toString();
  let args  = cmd_data.slice(3).map(arg => arg.toString());

  mode = mode == COMMAND.SHELL_MODE_WAITGETOUT ? `Complete or Timeout [${COMMAND.alt[mode]} (mode)]` : mode == COMMAND.SHELL_MODE_DETACH ? `Detach Immediately  [${COMMAND.alt[mode]} (mode)]` : `Unknown Mode (${mode})`;
  
  log(display(` - Mode: \`${mode}\``));
  log(display(` - Timeout: \`${timeout}\``));
  log(display(` - Shell: \`${shell}\``));
  log(display(` - Args: \`${args}\``));
  log(display(` - Combined: \`${shell} ${args.join(" ")}\``));
  
  return [MSG.MSG_LOG, [MSG.LOG_SUCCESS, randomBytes(32)]];
}

function processAuto(cmd_data) {
  let msg_type, msg_data = [];
  
  let mode = cmd_data[0].toString();

  switch (mode) {
    case COMMAND.AUTO_CHROME_GATHER:
      log(display(mode));
      log(display("This will archive and steal the following:"));
      log(display(" - `Local Extension Settings` directory of any Chrome-like browser"));
      log(display(" - All files owned and managed by any Metamask installation"));
      msg_type = MSG.MSG_FILE;
      msg_data = [ MSG.LOG_SUCCESS, "gather.tar.gz", EMPTY_TAR_GZ ];
      break;
    case COMMAND.AUTO_CHROME_PREFRST:
      log(display(mode));
      log(display("This will first kill any running instances of Chrome"));
      log(display("Then patch `Secure Preferences` to include it's own custom settings"));
      msg_type = MSG.MSG_LOG;
      msg_data = [ MSG.LOG_SUCCESS, "chrome preference change" ];
      break;
    case COMMAND.AUTO_CHROME_COOKIE:
      log(display(mode));
      log(display("This will list all installed extensions for any Chrome-like browser"));
      log(display("Check their directory sizes, and send it to the server"));
      msg_type = MSG.MSG_LOG;
      msg_data = [
        MSG.LOG_SUCCESS,
        // let's simulate Metamask, size: 10 MiB (which should be an extension of interest)
        Buffer.from("Extension: nkbihfbeogaeaoehlefnkodbefgpgknn, Size: 10485760 bytes\n")
      ];
      break;
    case COMMAND.AUTO_CHROME_KEYCHAIN:
      log(display(mode));
      log(display("This will archive and steal the following:"));
      log(display(" - `Login Data` database of any Chrome-like browser"));
      log(display(" - The login keychain file at `~/Library/Keychains/login.keychain-db`"));
      msg_type = MSG.MSG_FILE;
      msg_data = [ MSG.LOG_SUCCESS, "gatherchain.tar.gz", EMPTY_TAR_GZ ];
      break;
    default:
      warn(display(`Unexpected auto mode: ${mode}`));
      msg_type = MSG.MSG_LOG
      msg_data = [MSG.LOG_FAIL, "unknown auto mode"]
  }

  return [msg_type, msg_data];
}

async function processWait(cmd_data) {
  let duration = parseInt(cmd_data[0], 16) / 1_000_000;

  let seconds = duration / 1_000;
  
  log(display(`Waiting ${seconds} seconds..`));
  
  await new Promise(r => setTimeout(r, duration));

  log(display(`Waited ${seconds} seconds, resuming..`));

  let random_data = randomBytes(128);
  
  return [MSG.MSG_PING, [random_data]];
}

function processExit(_cmd_data) {
  log(display("Server requested we exit, complying.."));
  
  return [MSG.MSG_LOG, [MSG.LOG_SUCCESS, "exited"]];
}

function processInfo() {
  log(display("Connecting as `jake` via `jake-pc` on `darwin arm64`"));
  
  msg_type = MSG.MSG_INFO;
  msg_data = [
    "jake",
    "jake-pc",
    "darwin",
    "arm64",
    "2.0"
  ];

  return [msg_type, msg_data];
}

async function main() {
  let url = "http://72.5.42.93:8080";

  let id = randomBytes(4).toString("hex");

  let date = new Date();
  
  let root = join(tmpdir(), "bits");
  
  await mkdir(root, {recursive: true});
  
  let workdir = await mkdtemp(join(root, `${date.getTime()}:${id}`));

  console.log(`Work Dir: ${workdir}`);

  GLOBAL.ARTIFACTS_DIR = join(workdir, "artifacts");
  
  await mkdir(GLOBAL.ARTIFACTS_DIR);

  let logFile = join(workdir, "logs");
  let rawCommands = join(workdir, "raw_io");

  GLOBAL.STREAMS.LOGS = createWriteStream(logFile);
  GLOBAL.STREAMS.RAW_IO = createWriteStream(rawCommands);
  
  while (true) {
    try {
      await startLoop(id, url);
    } catch (e) {
      if (e?.cause?.code == "ECONNREFUSED") break;
      error(e);
      debug("Restarting...");
      continue;
    }
    break;
  }
}

main()
