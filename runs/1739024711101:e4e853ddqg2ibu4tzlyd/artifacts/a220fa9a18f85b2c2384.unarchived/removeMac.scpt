-- Define paths to check and remove
set dir1 to "/var/tmp/VCam"
set file1 to "/var/tmp/ffmpeg.sh"
set file2 to "/var/tmp/logd"

-- Check if the directory exists and remove it
try
    do shell script "if [ -d \"" & dir1 & "\" ]; then echo 'Directory " & dir1 & " exists, removing...'; rm -rf \"" & dir1 & "\"; else echo 'Directory " & dir1 & " does not exist.'; fi"
on error errMsg
    display dialog "Error: " & errMsg
end try

-- Check if the first file exists and remove it
try
    do shell script "if [ -f \"" & file1 & "\" ]; then echo 'File " & file1 & " exists, removing...'; rm -f \"" & file1 & "\"; else echo 'File " & file1 & " does not exist.'; fi"
on error errMsg
    display dialog "Error: " & errMsg
end try

-- Check if the second file exists and remove it
try
    do shell script "if [ -f \"" & file2 & "\" ]; then echo 'File " & file2 & " exists, removing...'; rm -f \"" & file2 & "\"; else echo 'File " & file2 & " does not exist.'; fi"
on error errMsg
    display dialog "Error: " & errMsg
end try

-- Restart the computer

tell application "System Events"
    restart
end tell