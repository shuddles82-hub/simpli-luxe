#!/usr/bin/env python3
"""Simpli Luxe Footage to Reel.

Turns raw clips into a branded 9:16 rough cut: trims, crops, stitches,
adds the hook and on-screen text in the brand fonts, and closes on the
official SL logo with "Stay simpli luxe."

Usage
  Look at footage first (contact sheet of frames, one per second):
    python3 tools/reel/make_reel.py sheet clip.mov --out sheet.jpg

  Build a Reel from a plan file:
    python3 tools/reel/make_reel.py build plan.json

plan.json
  {
    "series": "Simpli Styled",
    "hook": "Three ways I wear one blazer",
    "out": "reel.mp4",
    "cover_at": 4.2,
    "clips": [
      {"file": "IMG_0001.MOV", "start": 1.0, "end": 5.5, "text": "Blazer + denim + loafers"},
      {"file": "IMG_0002.MOV", "start": 0.5, "end": 4.0}
    ]
  }
  Optional keys: "hook_y" (pixels from top, default 250), "loudnorm": true
  to even out quiet voice audio, "cover_from_clip": {"clip": 0, "at": 2.0}
  for a clean cover frame with no text, and per clip "overlays":
  [{"text": "...", "from": 4, "to": 10, "pos": "top|middle|bottom" or pixels}]
  with times in seconds after that clip's trim start.
  A clip can also be a photo (.jpg/.png) held for "duration" seconds.
  start/end are seconds within each clip and are optional. "text" is an
  optional lower-third line for that clip. cover_at is a time in the
  finished Reel to save as a cover frame (out name with .jpg).
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
FONTS = os.path.join(HERE, "fonts")
F_SERIF = os.path.join(FONTS, "cormorant-garamond-latin-500-normal.ttf")
F_SERIF_IT = os.path.join(FONTS, "cormorant-garamond-latin-500-italic.ttf")
F_SANS = os.path.join(FONTS, "jost-latin-400-normal.ttf")
F_SANS_MED = os.path.join(FONTS, "jost-latin-500-normal.ttf")
LOGO = os.path.join(REPO, "public", "logo.png")

W, H, FPS = 1080, 1920, 30
CREAM, GOLD, OBSIDIAN = "0xF5F0E8", "0xC9A96E", "0x0D0D0D"
HOOK_SECONDS = 3.0
END_SECONDS = 2.5


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("ffmpeg failed:\n" + r.stderr[-3000:])
    return r.stdout


def has_audio(path):
    out = run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries",
               "stream=index", "-of", "csv=p=0", path])
    return bool(out.strip())


def duration(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                      "-of", "csv=p=0", path]).strip())


def textfile(tmp, name, text):
    p = os.path.join(tmp, name)
    with open(p, "w", encoding="utf-8") as f:
        f.write(text)
    return p


def wrap(text, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > width and cur:
            lines.append(cur)
            cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur:
        lines.append(cur)
    return "\n".join(lines)


def esc(path):
    return path.replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")


def sheet(src, out):
    run(["ffmpeg", "-y", "-v", "error", "-i", src, "-vf",
         "fps=1,scale=270:-2,drawtext=fontfile='%s':text='%%{pts\\:hms}':x=8:y=8:fontsize=20:"
         "fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=4,tile=6x5" % esc(F_SANS),
         "-frames:v", "1", "-q:v", "3", out])
    print(out)


def normalize(clip, idx, tmp, series, hook, hook_y=250, loud=False):
    src = clip["file"]
    out = os.path.join(tmp, "seg%02d.mp4" % idx)
    vf = ["scale=%d:%d:force_original_aspect_ratio=increase" % (W, H),
          "crop=%d:%d" % (W, H), "fps=%d" % FPS, "setsar=1"]
    if idx == 0 and hook:
        eyebrow = textfile(tmp, "eyebrow.txt", "  ".join(" ".join(w) for w in series.upper().split()))
        hk = textfile(tmp, "hook.txt", wrap(hook, 26))
        fade = "if(lt(t,%.2f),1,max(0,1-(t-%.2f)/0.4))" % (HOOK_SECONDS, HOOK_SECONDS)
        vf.append("drawbox=x=0:y=0:w=iw:h=%d:color=black@0.28:t=fill:enable='lt(t,%.2f)'" % (hook_y + 300, HOOK_SECONDS + 0.4))
        vf.append("drawtext=fontfile='%s':textfile='%s':fontsize=34:fontcolor=%s:x=(w-tw)/2:y=%d:"
                  "alpha='%s'" % (esc(F_SANS_MED), esc(eyebrow), GOLD, hook_y, fade))
        vf.append("drawtext=fontfile='%s':textfile='%s':fontsize=88:line_spacing=6:fontcolor=%s:"
                  "x=(w-tw)/2:y=%d:shadowcolor=black@0.45:shadowx=0:shadowy=3:alpha='%s'"
                  % (esc(F_SERIF), esc(hk), CREAM, hook_y + 60, fade))
    if clip.get("text"):
        lt = textfile(tmp, "lt%02d.txt" % idx, wrap(clip["text"], 30))
        vf.append("drawtext=fontfile='%s':textfile='%s':fontsize=50:line_spacing=10:fontcolor=%s:"
                  "x=(w-tw)/2:y=h-430:box=1:boxcolor=0x0D0D0D@0.62:boxborderw=26"
                  % (esc(F_SANS), esc(lt), CREAM))
    for j, ov in enumerate(clip.get("overlays", [])):
        tf = textfile(tmp, "ov%02d_%02d.txt" % (idx, j), wrap(ov["text"], 30))
        pos = ov.get("pos", "top")
        y = {"top": "170", "middle": "(h-th)/2", "bottom": "h-430"}.get(pos, str(pos))
        vf.append("drawtext=fontfile='%s':textfile='%s':fontsize=48:line_spacing=10:fontcolor=%s:"
                  "x=(w-tw)/2:y=%s:box=1:boxcolor=0x0D0D0D@0.62:boxborderw=26:"
                  "enable='between(t,%.2f,%.2f)'" % (esc(F_SANS), esc(tf), CREAM, y, ov["from"], ov["to"]))
    cmd = ["ffmpeg", "-y", "-v", "error"]
    still = src.lower().endswith((".jpg", ".jpeg", ".png"))
    if still:
        # a photo held on screen, e.g. an outfit reveal
        cmd += ["-loop", "1", "-t", str(clip.get("duration", 2.5)), "-i", src]
        vf.append("fade=t=in:st=0:d=0.25")
    else:
        if clip.get("start") is not None:
            cmd += ["-ss", str(clip["start"])]
        if clip.get("end") is not None:
            cmd += ["-to", str(clip["end"])]
        cmd += ["-i", src]
    if not still and has_audio(src):
        amap = ["-map", "0:v:0", "-map", "0:a:0"]
    else:
        cmd += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]
        amap = ["-map", "0:v:0", "-map", "1:a:0", "-shortest"]
    if loud:
        cmd += ["-af", "loudnorm=I=-16:TP=-1.5:LRA=11"]
    cmd += ["-vf", ",".join(vf)] + amap + [
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "192k", out]
    run(cmd)
    return out


def end_card(tmp):
    out = os.path.join(tmp, "end.mp4")
    sign = textfile(tmp, "sign.txt", "Stay simpli luxe.")
    handle = textfile(tmp, "handle.txt", "simpliluxe.com   @simpli_staci")
    fc = ("[1:v]scale=440:-1:flags=lanczos[logo];[0:v][logo]overlay=(W-w)/2:620[v1];"
          "[v1]drawtext=fontfile='%s':textfile='%s':fontsize=84:fontcolor=%s:x=(w-tw)/2:y=1140,"
          "drawtext=fontfile='%s':textfile='%s':fontsize=34:fontcolor=%s:x=(w-tw)/2:y=1290,"
          "fade=t=in:st=0:d=0.4[v]"
          % (esc(F_SERIF_IT), esc(sign), GOLD, esc(F_SANS), esc(handle), CREAM))
    run(["ffmpeg", "-y", "-v", "error",
         "-f", "lavfi", "-i", "color=c=%s:s=%dx%d:r=%d:d=%.2f" % (OBSIDIAN, W, H, FPS, END_SECONDS),
         "-i", LOGO,
         "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
         "-filter_complex", fc, "-map", "[v]", "-map", "2:a", "-t", str(END_SECONDS),
         "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "192k", out])
    return out


def build(plan_path):
    with open(plan_path, encoding="utf-8") as f:
        plan = json.load(f)
    base = os.path.dirname(os.path.abspath(plan_path))
    out = os.path.join(base, plan.get("out", "reel.mp4"))
    with tempfile.TemporaryDirectory() as tmp:
        segs = []
        for i, c in enumerate(plan["clips"]):
            c = dict(c)
            c["file"] = os.path.join(base, c["file"])
            segs.append(normalize(c, i, tmp, plan.get("series", "Simpli Luxe"), plan.get("hook"),
                                  plan.get("hook_y", 250), plan.get("loudnorm", False)))
        if plan.get("end_card", True):
            segs.append(end_card(tmp))
        lst = os.path.join(tmp, "list.txt")
        with open(lst, "w") as f:
            f.writelines("file '%s'\n" % s for s in segs)
        run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst,
             "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
             "-r", str(FPS), "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
    print(out, "%.1fs" % duration(out))
    if plan.get("cover_from_clip") is not None:
        cf = plan["cover_from_clip"]
        cover = os.path.splitext(out)[0] + "-cover.jpg"
        run(["ffmpeg", "-y", "-v", "error", "-ss", str(cf["at"]), "-i",
             os.path.join(base, plan["clips"][cf.get("clip", 0)]["file"]), "-frames:v", "1",
             "-vf", "scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d" % (W, H, W, H),
             "-q:v", "2", cover])
        print(cover)
    elif plan.get("cover_at") is not None:
        cover = os.path.splitext(out)[0] + "-cover.jpg"
        run(["ffmpeg", "-y", "-v", "error", "-ss", str(plan["cover_at"]), "-i", out,
             "-frames:v", "1", "-q:v", "2", cover])
        print(cover)


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "sheet":
        out = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else "sheet.jpg"
        sheet(sys.argv[2], out)
    elif len(sys.argv) == 3 and sys.argv[1] == "build":
        build(sys.argv[2])
    else:
        sys.exit(__doc__)
