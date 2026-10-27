"""
Genererar lokala demovideor till prototyperna.

Varje video blir ett enkelt bildspel: en bild per kapitel (kurs, föreläsning,
kapitelrubrik och stödpunkter) plus en löpande klocka. Kapitlens starttider
räknas ut på samma sätt som i prototyperna (jämnt fördelade över videons
längd), så att ett hopp till ett kapitel i spelaren visar rätt bild. Det gör
kapitelnavigeringen möjlig att verifiera visuellt vid användartester.

Videorna kodas med 1 bild/s så att även 50 minuter långa föreläsningar blir
små filer. "+faststart" gör att uppspelningen kan börja innan hela filen
laddats ned från webbservern.

Krav: Node.js (för att läsa mock-data.js), Python 3 med Pillow och ffmpeg.
Kör från projektroten:  python tools/generate_demo_media.py
"""
import json
import os
import platform
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'prototyper', 'shared', 'media')
W, H = 960, 540


def load_data():
    js = ("global.window={};require(process.argv[1]);"
          "process.stdout.write(JSON.stringify(window.ARCADA_DATA))")
    raw = subprocess.check_output(['node', '-e', js, os.path.join(ROOT, 'prototyper', 'shared', 'mock-data.js')])
    return json.loads(raw.decode('utf-8'))


def font_paths():
    if platform.system() == 'Windows':
        base = 'C:/Windows/Fonts/'
        return base + 'segoeui.ttf', base + 'segoeuib.ttf'
    for regular, bold in [
        ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),
        ('/System/Library/Fonts/Supplemental/Arial.ttf', '/System/Library/Fonts/Supplemental/Arial Bold.ttf'),
    ]:
        if os.path.exists(regular):
            return regular, bold
    sys.exit('Hittar inget typsnitt – ange sökväg i font_paths().')


REGULAR, BOLD = font_paths()


def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else REGULAR, size)


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def wrap(draw, text, fnt, width):
    words, lines, line = text.split(), [], ''
    for w in words:
        test = (line + ' ' + w).strip()
        if draw.textlength(test, font=fnt) <= width:
            line = test
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def slide(path, color, header, lecture, idx, total, title, bullets):
    c = hex_rgb(color)
    img = Image.new('RGB', (W, H))
    px = img.load()
    # Diagonal gradient från kursfärgen till en mörkare nyans
    for y in range(H):
        for x in range(0, W, 4):
            k = (x / W * 0.6 + y / H * 0.4)
            col = tuple(int(v * (1 - 0.55 * k)) for v in c)
            for dx in range(4):
                px[x + dx, y] = col
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 6], fill=(255, 255, 255))
    d.text((48, 36), header.upper(), font=font(18, True), fill=(255, 255, 255))
    d.text((48, 64), lecture, font=font(22), fill=(235, 235, 240))
    d.text((48, 150), f'KAPITEL {idx} AV {total}', font=font(20, True), fill=(255, 255, 255))
    y = 182
    for line in wrap(d, title, font(46, True), W - 96)[:2]:
        d.text((48, y), line, font=font(46, True), fill=(255, 255, 255))
        y += 58
    y += 18
    for b in bullets:
        for j, line in enumerate(wrap(d, b, font(24), W - 140)):
            if j == 0:
                d.ellipse([52, y + 11, 62, y + 21], fill=(255, 255, 255))
            d.text((80, y), line, font=font(24), fill=(240, 240, 245))
            y += 34
        y += 8
    # Kapitelindikator
    for i in range(total):
        x = 48 + i * 34
        dim = tuple(int(v * 0.6 + 100) for v in c)
        d.rounded_rectangle([x, H - 44, x + 26, H - 38], radius=3, fill=(255, 255, 255) if i + 1 == idx else dim)
    d.text((48 + total * 34 + 8, H - 54), 'Demovideo för prototyptest', font=font(16), fill=(230, 230, 235))
    img.save(path)


def build(video, course, duration, tmp, name):
    chapters = video['chapters']
    n = len(chapters)
    starts = [round(i * duration / n) for i in range(n)]
    lines = []
    for i, ch in enumerate(chapters):
        p = os.path.join(tmp, f'{name}_{i}.png')
        slide(p, course['color'], f"{course['code']} · {course['name']} · Vecka {video.get('week', 1)}",
              video['title'], i + 1, n, ch['title'], ch.get('lines', []))
        end = starts[i + 1] if i + 1 < n else duration
        lines.append(f"file '{p.replace(os.sep, '/')}'\nduration {end - starts[i]}")
    lines.append(f"file '{os.path.join(tmp, f'{name}_{n - 1}.png').replace(os.sep, '/')}'")
    lst = os.path.join(tmp, f'{name}.txt')
    with open(lst, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    fontfile = BOLD.replace('\\', '/').replace(':', '\\:')
    timer = (f"drawtext=fontfile='{fontfile}':"
             "text='%{eif\\:trunc(t/60)\\:d\\:2}\\:%{eif\\:mod(trunc(t)\\,60)\\:d\\:2}':"
             "x=w-tw-36:y=h-th-30:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.35:boxborderw=8")
    out = os.path.join(OUT, f'{name}.mp4')
    subprocess.check_call([
        'ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
        '-vf', f'fps=1,{timer},format=yuv420p', '-t', str(duration),
        '-c:v', 'libx264', '-preset', 'slow', '-tune', 'stillimage', '-crf', '32', '-g', '120',
        '-movflags', '+faststart', '-an', out])
    print(f'{name}.mp4  {duration // 60}:{duration % 60:02d}  {os.path.getsize(out) / 1e6:.1f} MB')


def main():
    data = load_data()
    os.makedirs(OUT, exist_ok=True)
    courses = {c['id']: c for c in data['courses']}
    with tempfile.TemporaryDirectory() as tmp:
        for v in data['videos']:
            build(v, courses[v['courseId']], v['duration'], tmp, v['id'])
        demo = {'title': 'Ny föreläsning', 'week': 1, 'chapters': [
            {'title': 'Demovideo', 'lines': ['Den här videon används när en uppladdning saknar egen fil.']}]}
        build(demo, {'code': 'DEMO', 'name': 'ArcadaTube', 'color': '#495057'},
              data['sources']['demo']['duration'], tmp, 'demo')


if __name__ == '__main__':
    main()
