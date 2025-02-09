# Run Analysis

The logs and artifacts for runs mentioned here are in the [runs](runs) folder.

1. `1738990085747:f1665684MyzFhC9suQL4`

    | Identity | `f1665684MyzFhC9suQL4` |            |                    |
    | -------- | ---------------------- | :--------: | :----------------: |
    | Username |         `jake`         | Start Time | Feb 8th 2025 05:48 |
    | Hostname |       `jake-pc`        |  End Time  | Feb 8th 2025 15:14 |
    | OS, Arch |     `darwin arm64`     |  Duration  |     9h 26m 7s      |

    ## Notes:

    - Steals Extension Settings for Chromium-based browsers
    - Steals Metamask Extension data for Chromium-based browsers
    - Steals login data for Chromium-based browsers
    - Steals the macOS login keychain file
    - No Uploads, No Downloads, No Arbitrary Execution

2. `1739024711101:e4e853ddqg2ibu4tzlyd`

    | Identity | `e4e853ddqg2ibu4tzlyd` |            |                    |
    | -------- | ---------------------- | :--------: | :----------------: |
    | Username |        `janet`         | Start Time | Feb 8th 2025 15:25 |
    | Hostname |      `workspace`       |  End Time  | Feb 8th 2025 18:30 |
    | OS, Arch |     `darwin arm64`     |  Duration  |      3h 5m 5s      |

    ## Notes:

    While it does everything mentioned with `f1665684MyzFhC9suQL4`, 1 hour into the runtime, we got an upload from the server.

    This could suggest it's not an automated process - someone initiated the execution.

    They attemped to unarchive a `449` byte gzip-compressed tar archive to `/var/tmp` (saved as `a220fa9a18f85b2c2384`).

    This archive contained one file, named `removeMac.scpt` which is an Apple Script.

    ```console
    $ file a220fa9a18f85b2c2384
    a220fa9a18f85b2c2384: gzip compressed data, original size modulo 2^32 3072

    $ tar tzvf a220fa9a18f85b2c2384
    -rw-r--r-- root/root      1125 2024-12-12 03:01 removeMac.scpt

    $ tar xzvf a220fa9a18f85b2c2384 --one-top-level a220fa9a18f85b2c2384.unarchived
    removeMac.scpt

    $ sha256sum a220fa9a18f85b2c2384.unarchived/removeMac.scpt
    f77dd827814d2fd810c55c49a7da17a43f0a1e4206c7c673f63eae33f1118e21  a220fa9a18f85b2c2384.unarchived/removeMac.scpt

    $ stat a220fa9a18f85b2c2384.unarchived/removeMac.scpt
      File: a220fa9a18f85b2c2384.unarchived/removeMac.scpt
      Size: 1125      	Blocks: 8          IO Block: 4096   regular file
    Device: 1,13	Inode: ---------------   Links: 1
    Access: (0644/-rw-r--r--)  Uid: (  501/ <user>)   Gid: (   20/   staff)
    Access: 2025-02-08 17:53:37.000000000 +0100
    Modify: 2024-12-12 03:01:37.000000000 +0100
    Change: 2025-02-08 17:53:37.813992788 +0100
    Birth: 2024-12-12 03:01:37.000000000 +0100
    ```

    They then attempted to execute this script using `osascript`. Which would've deleted the following:

    - `/var/tmp/VCam`
    - `/var/tmp/ffmpeg.sh`
    - `/var/tmp/logd`

    Effectively erasing all traces of the compromise, and restarting the machine.

    A point of concern is this won't remove the launch service it injected as part of the `ffmpeg.sh` script.

3. `1739040732677:d06e23f89wwmMAMUp082`

    | Identity | `d06e23f89wwmMAMUp082` |            |                    |
    | -------- | ---------------------- | :--------: | :----------------: |
    | Username |        `emily`         | Start Time | Feb 8th 2025 19:52 |
    | Hostname |      `emily-mbp`       |  End Time  | Feb 9th 2025 15:13 |
    | OS, Arch |     `darwin arm64`     |  Duration  |    21h 20m 48s     |

    ## Notes:

    Same observations with `e4e853ddqg2ibu4tzlyd`, except the upload and subsequent command execution occurred after 3 hours.

    The downloaded artifact is the same, as well as the command executed right after.

    This makes me suspect it might be the final stage of the exploit, cleanup.
