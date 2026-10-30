"""Сборка видео для первого экрана ilsatao.ru из ролика с 6 сценами.

Жёсткие склейки заменяются динамичными переходами (~1 с): «рывок камеры» с размытием
в движении, «пролёт» с радиальным размытием, пролёт через затемнение (день → ночь).
Результат — одно непрерывное видео + список точек остановки (время конца каждого этапа).
В конце добавлен «хвост»: переход 6 → 1 и сцена 1, чтобы маршрут шёл по кругу без рывка.

Запуск: python tools/hero-video/build_hero.py исходник.mp4 out_dir
(нужны numpy, opencv-python и ffmpeg с libsvtav1 в PATH)
"""
import json
import math
import os
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

SRC = sys.argv[1]
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

FPS = 24
CUTS = [0, 59, 116, 179, 239, 295, 362]        # границы сцен (кадры)
W, H = 2560, 1440                               # рабочее разрешение: 1440p, 16:9 (исходник 2542×1440)
TR = 26                                         # длина перехода в кадрах (~1.08 с)
REAL = 12                                       # реальных кадров каждой сцены внутри перехода

# стиль перехода между сценами i → i+1 (последний — 6 → 1 для повтора)
STYLES = ['zoom', 'whip_left', 'zoom_dark', 'whip_right', 'zoom', 'dip']


def read_frames():
    cap = cv2.VideoCapture(SRC)
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(cv2.resize(f, (W, H), interpolation=cv2.INTER_AREA))  # uint8 — экономим память
    return frames


def ease(t):  # плавный старт и финиш
    return 4 * t ** 3 if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2


def bump(t):  # 0 → 1 → 0, пик посередине
    return math.sin(math.pi * t)


def scale_center(img, s):
    """Увеличение кадра относительно центра (s >= 1 — приближение)."""
    if abs(s - 1) < 1e-4:
        return img
    M = cv2.getRotationMatrix2D((W / 2, H / 2), 0, s)
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def zoom_blur(img, s, strength):
    """Радиальное размытие: среднее нескольких приближений от s до s*(1+strength)."""
    if strength < 0.004:
        return scale_center(img, s)
    k = 9
    acc = np.zeros_like(img)
    for j in range(k):
        acc += scale_center(img, s * (1 + strength * j / (k - 1)))
    return acc / k


def motion_blur_h(img, length):
    """Горизонтальное размытие в движении (длина в пикселях)."""
    length = int(length)
    if length < 3:
        return img
    kernel = np.ones((1, length), np.float32) / length
    return cv2.filter2D(img, -1, kernel, borderType=cv2.BORDER_REFLECT)


def shift_x(img, dx):
    M = np.float32([[1, 0, dx], [0, 1, 0]])
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def transition(a_frames, b_frames, style):
    """a_frames — последние REAL кадров уходящей сцены, b_frames — первые REAL входящей.
    Недостающее добирается стоп-кадром — его маскирует движение камеры."""
    out = []
    for f in range(TR):
        t = f / (TR - 1)
        e = ease(t)
        A = a_frames[min(f, REAL - 1)].astype(np.float32)
        B = b_frames[max(0, f - (TR - REAL))].astype(np.float32)
        if style.startswith('whip'):
            d = -1 if style == 'whip_left' else 1
            blur = 160 * bump(t) ** 1.5
            zoom = 1 + 0.06 * bump(t)
            a = motion_blur_h(scale_center(shift_x(A, d * W * e), zoom), blur)
            b = motion_blur_h(scale_center(shift_x(B, -d * W * (1 - e)), zoom), blur)
            # граница кадров движется вместе со сдвигом; мягкий край 120 px
            x = np.arange(W, dtype=np.float32)
            edge = (W * (1 - e)) if d < 0 else (W * e)   # стык уходящего и входящего кадра
            m = np.clip((x - edge) / 120 + 0.5, 0, 1) if d < 0 else np.clip((edge - x) / 120 + 0.5, 0, 1)
            m = m[None, :, None]
            frame = a * (1 - m) + b * m
            # лёгкая вспышка в момент рывка
            frame = frame * (1 + 0.08 * bump(t))
        else:
            # пролёт: уходящий кадр «улетает» вперёд, входящий приходит из приближения
            ka = ease(min(1, t / 0.62))
            kb = ease(max(0, (t - 0.38) / 0.62))
            a = zoom_blur(A, 1 + 0.55 * ka ** 2, 0.2 * ka)          # разгоняется — размытие растёт
            b = zoom_blur(B, 1.32 - 0.32 * kb, 0.18 * (1 - kb))     # тормозит — размытие уходит
            m = np.clip((t - 0.36) / 0.28, 0, 1)
            m = m * m * (3 - 2 * m)
            frame = a * (1 - m) + b * m
            if style in ('zoom_dark', 'dip'):
                frame = frame * (1 - 0.88 * bump(t) ** 1.3)
            else:
                frame = frame * (1 + 0.1 * bump(t))
        out.append(np.clip(frame, 0, 255).astype(np.uint8))
    return out


# Выходные файлы с заданным битрейтом (вес предсказуем: ~8 МБ для ПК, ~3 МБ для телефона).
# AV1 — основной (лучше качество при том же весе; Chrome/Firefox/Edge, новые Safari),
# H.264 — запасной, в 2 прохода. Резкость — мягкий unsharp; зерно в AV1 (film-grain) прячет
# «ступеньки» на тёмных градиентах, в H.264 тот же эффект даёт tune=film + aq-mode=3.
OUTPUTS = [
    # имя,                  ширина, резкость,                кодек и битрейт,                                        проходы
    ('hero-1440.av1.mp4',    2560, 'unsharp=5:5:0.45:5:5:0', ['-c:v', 'libsvtav1', '-preset', '5', '-b:v', '3300k',
                                                              '-svtav1-params', 'tune=0:film-grain=5:film-grain-denoise=0'], 1),
    ('hero.mp4',             1920, 'unsharp=5:5:0.4:5:5:0',  ['-c:v', 'libx264', '-preset', 'slow', '-tune', 'film',
                                                              '-b:v', '3800k', '-maxrate', '6500k', '-bufsize', '9000k',
                                                              '-x264-params', 'aq-mode=3:aq-strength=0.9'], 2),
    ('hero-mobile.av1.mp4',  1280, 'unsharp=3:3:0.35:3:3:0', ['-c:v', 'libsvtav1', '-preset', '5', '-b:v', '1300k',
                                                              '-svtav1-params', 'tune=0:film-grain=4:film-grain-denoise=0'], 1),
    ('hero-mobile.mp4',      1280, 'unsharp=3:3:0.35:3:3:0', ['-c:v', 'libx264', '-preset', 'slow', '-tune', 'film',
                                                              '-b:v', '1700k', '-maxrate', '3000k', '-bufsize', '4000k',
                                                              '-x264-params', 'aq-mode=3:aq-strength=0.9'], 2),
]


def encode(raw, path, width, sharpen, codec, passes):
    """Кодирование из временного файла с кадрами (по очереди — кодировщики 1440p прожорливы)."""
    height = int(round(H * width / W / 2) * 2)
    vf = (f'scale={width}:{height}:flags=lanczos,' if width != W else '') + sharpen
    base = ['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24',
            '-s', f'{W}x{H}', '-r', str(FPS), '-i', str(raw), '-vf', vf, *codec,
            '-pix_fmt', 'yuv420p', '-g', '24', '-keyint_min', '24', '-movflags', '+faststart', '-an']
    if passes == 1:
        subprocess.run([*base, str(path)], check=True)
        return
    log = str(path.with_suffix('.passlog'))
    subprocess.run([*base, '-pass', '1', '-passlogfile', log, '-f', 'mp4', os.devnull], check=True)
    subprocess.run([*base, '-pass', '2', '-passlogfile', log, str(path)], check=True)
    for f in path.parent.glob(path.stem + '.passlog*'):
        f.unlink()


def main():
    frames = read_frames()
    scenes = [frames[CUTS[i]:CUTS[i + 1]] for i in range(6)]
    raw_path = OUT / '_frames.raw'
    raw = open(raw_path, 'wb')
    count = 0
    first = None

    def put(seq):
        nonlocal count, first
        for fr in seq:
            if first is None:
                first = fr
            raw.write(fr.tobytes())
            count += 1

    stops = []
    put(scenes[0][:len(scenes[0]) - REAL])
    stops.append(count - 1)
    for i in range(5):
        put(transition(scenes[i][-REAL:], scenes[i + 1][:REAL], STYLES[i]))
        put(scenes[i + 1][REAL:len(scenes[i + 1]) - (REAL if i + 1 < 5 else 0)])
        stops.append(count - 1)
    # хвост: 6 → 1 и тело сцены 1 до той же точки, что и в начале (кадры совпадают)
    loop_start = count
    # сцена 6 уже доиграла до конца — уходим из её последнего кадра
    put(transition([scenes[5][-1]] * REAL, scenes[0][:REAL], STYLES[5]))
    put(scenes[0][REAL:len(scenes[0]) - REAL])
    loop_stop = count - 1

    raw.close()
    poster = first.copy()
    del frames, scenes                      # освобождаем память перед кодированием
    for name, width, sharpen, codec, passes in OUTPUTS:
        encode(raw_path, OUT / name, width, sharpen, codec, passes)
        print('готово', name, flush=True)
    raw_path.unlink()
    first = poster
    cv2.imwrite(str(OUT / 'hero.jpg'), cv2.resize(first, (1920, 1080), interpolation=cv2.INTER_AREA),
                [cv2.IMWRITE_JPEG_QUALITY, 84])

    t = lambda i: round(i / FPS, 4)
    info = {
        'fps': FPS,
        'frames': count,
        'stops': [t(x) for x in stops],          # пауза в конце каждого этапа
        'loopStart': t(loop_start),               # начало перехода 6 → 1
        'loopStop': t(loop_stop),                 # кадр совпадает со stops[0]
    }
    (OUT / 'hero.json').write_text(json.dumps(info, ensure_ascii=False, indent=2))
    print(json.dumps(info, ensure_ascii=False))


main()
