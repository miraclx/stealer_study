# Stealer Study

> [!WARNING]
> While this repo does not include the malware, and the mocked-out client code is careful to prevent unintentional behavior,
>
> Employ maximum caution when operating with potentially hazardous material.

While looking into a compromise, I noticed they left behind a back door, which was just Go code.

Further analysis revealed more about its behavior, most of which is baked into the code itself:

1. Steal metamask extension data.
2. Stealing macOS keychain data and other login data.
3. Patch chrome settings, arbitrarily giving permissions, to for example, the microphone.
4. Steal chrome cookies.
5. Determine all installed extensions and their directory sizes.
6. Download any file to any location on the compromised machine.
7. Upload any file in any location from the compromised machine.
8. Execute arbitrary commands.

Seeing this, I decided to build a mocked-out client that mimics a compromised system, to understand how the orchestration server behaves.

Especially the dynamic bits of the code, upload, download, and arbitrary execution.

This client is carefully written to avoid unintentional effects on the host machine.

None of what is supposed to happen will, and every instruction received from the server will be explained in the console.

The server will then be replied to with simulated responses. Enough to trigger the next command. But no further.

## Usage

> See [RUNS.md](RUNS.md) for analysis of live runs.

```console
$ node client.js
Work Dir: /var/folders/nx/6whq7tfd2x7_zlsnj1q8w8g00000gn/T/bits/1739024711101:e4e853ddqg2ibu4tzlyd
> [COMMAND_INFO (qwer)]
 ? Connecting as `janet` via `workspace` on `darwin arm64`
> [COMMAND_INFO (qwer)]
 ? Connecting as `janet` via `workspace` on `darwin arm64`
> [COMMAND_AUTO (r4ys)]
> [AUTO_CHROME_GATHER (89io)]
 ? This will archive and steal the following:
 ?  - `Local Extension Settings` directory of any Chrome-like browser
 ?  - All files owned and managed by any Metamask installation
> [COMMAND_AUTO (r4ys)]
> [AUTO_CHROME_COOKIE (gi%#)]
 ? This will list all installed extensions for any Chrome-like browser
 ? Check their directory sizes, and send it to the server
> [COMMAND_AUTO (r4ys)]
> [AUTO_CHROME_KEYCHAIN (kyci)]
 ? This will archive and steal the following:
 ?  - `Login Data` database of any Chrome-like browser
 ?  - The login keychain file at `~/Library/Keychains/login.keychain-db`
> [COMMAND_WAIT (ghdj)]
 ? Waiting 60 seconds..
 ? Waited 60 seconds, resuming..
> [COMMAND_WAIT (ghdj)]
 ? Waiting 60 seconds..
 ? Waited 60 seconds, resuming..
> [COMMAND_UPLOAD (asdf)]
 ? The server attempted to put a file on this machine:
 ?  - Location: `/var/tmp`
 ?  - Blob Size: `449`
 ?  - Hash (sha256): `63683843161f39ded77b1255c5b80ae0e5c229e3f25985a934252dfa8a054426`
 ?  - Saving To: `/var/folders/nx/6whq7tfd2x7_zlsnj1q8w8g00000gn/T/bits/1739024711101:e4e853ddqg2ibu4tzlyd/artifacts/a220fa9a18f85b2c2384`
> [COMMAND_OSSHELL (vbcx)]
 ? The server attempted to run a command on this machine:
 ?  - Mode: `Complete or Timeout [SHELL_MODE_WAITGETOUT (mode)]`
 ?  - Timeout: `20 seconds`
 ?  - Command: `osascript`
 ?  - Args: `/var/tmp/removeMac.scpt`
 ?  - Combined: `osascript /var/tmp/removeMac.scpt`
> [COMMAND_WAIT (ghdj)]
 ? Waiting 60 seconds..
 ? Waited 60 seconds, resuming..
```

Looking at the temp dir:

```console
$ tree /var/folders/nx/6whq7tfd2x7_zlsnj1q8w8g00000gn/T/bits/1738990085747:f1665684MyzFhC9suQL4
/var/folders/nx/6whq7tfd2x7_zlsnj1q8w8g00000gn/T/bits/1738990085747:f1665684MyzFhC9suQL4
├── artifacts
├── logs
└── raw_io

2 directories, 2 files
```

Any artifacts the server attempts to send to the local machine will be in the `artifacts` directory.

The raw exchange between the local machine and the server can be seen in `raw_io`.

And the logs, no different from what's printed on the console, will be in `logs`.

See [RUNS.md](RUNS.md) for some live runs, with analysis.

## Appendix

Quick search on GitHub revealed https://github.com/mthcht/ThreatIntel-Reports/tree/affaf32bfec281cedc7055ddddf159218f9d133e/Intel%20Reports/dmpdump_github_io/posts_NorthKorea_Backdoor_Stealer

Which links to https://dmpdump.github.io/posts/NorthKorea_Backdoor_Stealer/

Also linking to https://x.com/tayvano_/status/1872980032752415227

Which seems to suggest it's a;

> "Contagious Interview" campaign conducted by North Korea-nexus threat actors

### IOCs

- `VCAM.zip` (stealer) - f3d2a2a31097efbf41a0e2728db943f33af751c347abed9aedf13a0e08ef4cfc
- `ffmpeg.sh` (initiation script) - cf15c380fa299241410c98c181860a50131b03a5a3dd47058bdc5e5e34474efd
- `DriverEasy.app` - e1bdb6a878dc5a81a74f7178259571d6c1c89fd8163185e6ccc61732d64b6338
- `http://api.vidtechdrivers[.]com`
- `http://72.5.42[.]93:8080`
