#!/usr/bin/env python3
"""Builds the zip package for the Chrome Web Store."""

import json
import pathlib
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
INCLUDE = ['manifest.json', 'LICENSE', 'PRIVACY.md']
INCLUDE_DIRS = ['src', 'icons', '_locales']
SKIP_SUFFIXES = {'.svg'}


def files():
    for name in INCLUDE:
        path = ROOT / name
        if path.is_file():
            yield path
    for name in INCLUDE_DIRS:
        for path in sorted((ROOT / name).rglob('*')):
            if path.is_file() and path.suffix not in SKIP_SUFFIXES:
                yield path


def main():
    version = json.loads((ROOT / 'manifest.json').read_text())['version']
    out = ROOT / 'dist' / f'youtube-focus-{version}.zip'
    out.parent.mkdir(exist_ok=True)

    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as archive:
        for path in files():
            archive.write(path, path.relative_to(ROOT).as_posix())

    print(out.relative_to(ROOT))
    with zipfile.ZipFile(out) as archive:
        print(f'{len(archive.namelist())} files, {out.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
