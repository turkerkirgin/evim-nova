"""Alarm sesleri (yerel üretim, telifsiz): siren.wav (döngü), uyari.wav (giriş gecikmesi bip'i, 1 sn döngü), kurulum.wav (alarm kurulurken)."""
import wave, struct, math
SR = 22050
def yaz(ad, ornek):
    with wave.open(ad, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, x)) * 32000)) for x in ornek))
def ton(f, faz):  # kare dalgaya yakın, kulak tırmalamasın diye yumuşatılmış (3 harmonik)
    return (math.sin(faz) + math.sin(3 * faz) / 3 + math.sin(5 * faz) / 5) * 0.85
# siren: 650 → 1450 Hz yükselip inen (1,6 sn), iki tur = 3,2 sn; faz sürekli → kusursuz döngü
o, faz, N = [], 0.0, int(SR * 3.2)
for i in range(N):
    t = (i / SR) % 1.6; u = t / 0.8 if t < 0.8 else (1.6 - t) / 0.8
    f = 650 + 800 * (0.5 - 0.5 * math.cos(math.pi * u))
    faz += 2 * math.pi * f / SR; o.append(ton(f, faz))
yaz("siren.wav", o)
# uyarı: 2 kısa bip (2000 Hz) + sessizlik = 1 sn
o = []
for i in range(SR):
    t = i / SR; acik = t < 0.12 or 0.2 <= t < 0.32
    zarf = min(1, (t % 0.2) / 0.005) if acik else 0
    o.append(math.sin(2 * math.pi * 2000 * t) * 0.9 * zarf)
yaz("uyari.wav", o)
# kurulum: yükselen iki ton (ding-dong ters)
o = []
for i in range(int(SR * 0.9)):
    t = i / SR; f = 880 if t < 0.35 else 1320; tt = t if t < 0.35 else t - 0.35
    o.append(math.sin(2 * math.pi * f * t) * math.exp(-tt * 5) * 0.8)
yaz("kurulum.wav", o)
print("tamam")
# devrede: alarm devreye girince — yükselen üç ton (Do-Mi-Sol) + son ton uzun
o, N = [], int(SR * 1.25)
for i in range(N):
    t = i / SR; x = 0.0
    for f, bas, uz in [(523, 0.0, 0.22), (659, 0.24, 0.22), (784, 0.48, 0.75)]:
        if bas <= t < bas + uz:
            tt = t - bas; zarf = min(1, tt / 0.01) * (math.exp(-tt * 3) if uz > 0.5 else 1) * min(1, (bas + uz - t) / 0.03)
            x += (math.sin(2 * math.pi * f * t) + 0.3 * math.sin(4 * math.pi * f * t)) * 0.7 * zarf
    o.append(x)
yaz("devrede.wav", o)
print("devrede tamam")
