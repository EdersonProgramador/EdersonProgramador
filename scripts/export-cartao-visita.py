"""Exporta artes para cartão de visita Canva (3,5 x 2 in, sangria, alta resolução)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

# Canva: 3,5 x 2 in + sangria ~3,75 x 2,25 in @ 600 DPI (qualidade impressão)
WIDTH_IN = 3.75
HEIGHT_IN = 2.25
DPI = 600
OUT_W = int(round(WIDTH_IN * DPI))
OUT_H = int(round(HEIGHT_IN * DPI))

SOURCES = [
    (
        Path(
            r"C:\Users\EDERSON\.cursor\projects\c-Users-EDERSON-Documents-EdersonProgramador\assets"
            r"\c__Users_EDERSON_AppData_Roaming_Cursor_User_workspaceStorage_e427872f0839f0ea022d199d0ed2e9e9"
            r"_images_image-f99cd241-1557-4ded-95d5-e901f9fc6fc8.png"
        ),
        "cartao-visita-aula-gratuita-qr",
    ),
    (
        Path(
            r"C:\Users\EDERSON\.cursor\projects\c-Users-EDERSON-Documents-EdersonProgramador\assets"
            r"\c__Users_EDERSON_AppData_Roaming_Cursor_User_workspaceStorage_e427872f0839f0ea022d199d0ed2e9e9"
            r"_images_image-697553c4-1da5-4ac5-8cb4-2fe4b515b0a6.png"
        ),
        "cartao-visita-app-zero-lancamento",
    ),
]

OUT_DIR = Path(r"C:\Users\EDERSON\Downloads\cartao-visita-canva")


def flatten_rgba(img: Image.Image) -> Image.Image:
    if img.mode != "RGBA":
        return img.convert("RGB")
    bg = Image.new("RGB", img.size, (255, 255, 255))
    bg.paste(img, mask=img.split()[3])
    return bg


def fit_canvas(img: Image.Image, out_w: int, out_h: int) -> Image.Image:
    img = flatten_rgba(img)
    fitted = ImageOps.contain(img, (out_w, out_h), method=Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (out_w, out_h), (255, 255, 255))
    x = (out_w - fitted.width) // 2
    y = (out_h - fitted.height) // 2
    canvas.paste(fitted, (x, y))
    return canvas


def enhance_print(img: Image.Image) -> Image.Image:
    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=140, threshold=2))
    img = ImageEnhance.Contrast(img).enhance(1.04)
    img = ImageEnhance.Sharpness(img).enhance(1.08)
    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for src, stem in SOURCES:
        if not src.is_file():
            raise SystemExit(f"Arquivo não encontrado: {src}")
        im = Image.open(src)
        out = enhance_print(fit_canvas(im, OUT_W, OUT_H))
        png = OUT_DIR / f"{stem}-{OUT_W}x{OUT_H}px-{DPI}dpi.png"
        out.save(png, format="PNG", optimize=True, dpi=(DPI, DPI))
        # Versão extra grande para zoom no Canva (2x — ~equivalente a 1200 DPI na área útil)
        big_w, big_h = OUT_W * 2, OUT_H * 2
        big = enhance_print(fit_canvas(im, big_w, big_h))
        png_big = OUT_DIR / f"{stem}-{big_w}x{big_h}px-alta-resolucao.png"
        big.save(png_big, format="PNG", optimize=True, dpi=(DPI * 2, DPI * 2))
        # Largura ~8K (7680 px) — importe no Canva e reduza para o quadro do cartão
        ultra_w = 7680
        ultra_h = int(round(ultra_w * OUT_H / OUT_W))
        ultra = enhance_print(fit_canvas(im, ultra_w, ultra_h))
        png_ultra = OUT_DIR / f"{stem}-{ultra_w}x{ultra_h}px-8k-largura.png"
        ultra.save(png_ultra, format="PNG", optimize=True, dpi=(DPI, DPI))
        print(f"OK {src.name} -> {png.name}, {png_big.name}, {png_ultra.name}")


if __name__ == "__main__":
    main()
