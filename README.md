# stealer study

After careful analysis of the source, I prepared this mocked client to observe further dynamic behaviour of the server.

The code suggests the server can, at any random point, request a file from the machine or upload one to it.

As well as being able to execute arbitrary commands. None of which are statically defined in the source code.

This client is carefully written to avoid unintentional effects on the host machine.

None of what is supposed to happen will, and the server will be replied with simulated responses.

Enough to trigger the next command. But no further.

## Usage

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
 ?  - Hash: `Y2g4QxYfOd7XexJVxbgK4OXCKePyWYWpNCUt+ooFRCY=`
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
