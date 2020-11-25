g.clear();
g.drawString("Hello",0,0);
g.setFontAlign(-1,-1,1).drawString("Hello",32,0);
g.setFontAlign(-1,-1,2).drawString("Hello",32,32);
g.setFontAlign(-1,-1,3).drawString("Hello",0,32);
g.drawRect(10,10,22,22);
g.fillRect(13,13,19,19);
g.flip()
var res = btoa(require("heatshrink").compress(g.buffer));
if (res=="0HMgEPwAPK0lEoECD5fuomgD5moB4I/M03uoEGKR0LB50KQT0IL5YACN5kAn/+hAdMkCeMB4Y/Nk/yH5kwB4I/MpAPBHxgfCX5oPBhKcMD534H52IR6LcNX4IPM/D8OxAPOAB8oB51oB50wgM72T/MgWRhQPL/APBnYPLkEBiMSD5kAjOCH5gA/AH4A/AH4A/AH4A/AFwA==") print("PASS"); else print("FAIL");
