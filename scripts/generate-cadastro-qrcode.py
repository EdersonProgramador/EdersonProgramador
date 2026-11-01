"""Gera QR code PNG apontando para a landing /cadastro (impressão e web)."""
from __future__ import annotations

from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_H
from qrcode.image.pil import PilImage

CADASTRO_URL = "https://www.edersonprogramador.com.br/cadastro"

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "apps" / "web" / "public" / "cadastro"
DOWNLOADS = Path.home() / "Downloads"


def make_qr(url: str, box_size: int, border: int) -> PilImage:
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=box_size,
        border=border,
    )
    qr.add_data(url)
    qr.make(fit=True)
    return qr.make_image(fill_color="#0a1628", back_color="#ffffff")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    variants = [
        ("qr-cadastro.png", 12, 4),
        ("qr-cadastro-print.png", 24, 4),
    ]
    for name, box_size, border in variants:
        img = make_qr(CADASTRO_URL, box_size, border)
        path = OUT_DIR / name
        img.save(path, format="PNG", optimize=True)
        print(f"Wrote {path} ({path.stat().st_size // 1024} KB)")

    dl = DOWNLOADS / "qr-cadastro-edersonprogramador.png"
    make_qr(CADASTRO_URL, 24, 4).save(dl, format="PNG", optimize=True)
    print(f"Wrote {dl}")
    print(f"URL encoded: {CADASTRO_URL}")


if __name__ == "__main__":
    main()
