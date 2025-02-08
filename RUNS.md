# Run Analysis

The logs and artifacts for runs mentioned here are in the [runs](runs) folder.

1. `1738990085747:f1665684MyzFhC9suQL4`

    Start Time: Feb 8th 2025 05:48
    End Time: Feb 8th 2025 15:14
    Runtime: 9h 26m 7s

    ID: `f1665684MyzFhC9suQL4`
    Username: `jake`
    Hostname: `jake-pc`
    OS, Arch: `darwin arm64`

    Notes: Nothing Remarkable

2. `1739024711101:e4e853ddqg2ibu4tzlyd`

    Start Time: Feb 8th 2025 15:25
    End Time: Feb 8th 2025 18:30
    Runtime: 3h 5m 5s

    ID: `e4e853ddqg2ibu4tzlyd`
    Username: `janet`
    Hostname: `workspace`
    OS, Arch: `darwin arm64`

    ## Notes:
    
    Unlike `f1665684MyzFhC9suQL4`, 1h into the runtime, we got an upload from the server.

    They attemped to unarchive a `449` byte gzip-compressed tar archive to `/var/tmp` (saved as `a220fa9a18f85b2c2384`).

    This archive contained one file, named `removeMac.scpt` which is an Apple Script.

    <details>
    <summary>Analysis</summary>

    ```console
    $ file a220fa9a18f85b2c2384
    a220fa9a18f85b2c2384: gzip compressed data, original size modulo 2^32 3072

    $ tar tzvf a220fa9a18f85b2c2384
    -rw-r--r-- root/root      1125 2024-12-12 03:01 removeMac.scpt

    $ tar xzvf a220fa9a18f85b2c2384 --one-top-level a220fa9a18f85b2c2384.unarchived
    removeMac.scpt

    $ sha256sum a220fa9a18f85b2c2384.unarchived/removeMac.scpt
    f77dd827814d2fd810c55c49a7da17a43f0a1e4206c7c673f63eae33f1118e21  a220fa9a18f85b2c2384.unarchived/removeMac.scpt

    $ stat removeMac.scpt
      File: a220fa9a18f85b2c2384.unarchived/removeMac.scpt
      Size: 1125      	Blocks: 8          IO Block: 4096   regular file
    Device: 1,13	Inode: ---------------   Links: 1
    Access: (0644/-rw-r--r--)  Uid: (  501/ <user>)   Gid: (   20/   staff)
    Access: 2025-02-08 17:53:37.000000000 +0100
    Modify: 2024-12-12 03:01:37.000000000 +0100
    Change: 2025-02-08 17:53:37.813992788 +0100
    Birth: 2024-12-12 03:01:37.000000000 +0100
    ```

    </details>

    They then attempted to execute this script using `osascript`. Which would've deleted the following:

    - `/var/tmp/VCam`
    - `/var/tmp/ffmpeg.sh`
    - `/var/tmp/logd`

    Effectively erasing all traces of the compromise, and restarting the machine.

    A worrying concern is this won't remove the launch service it injected as part of the `ffmpeg.sh` script.

    Even though the binary it points to, which was in `/var/tmp/VCam` no longer exists.
