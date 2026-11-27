#!/usr/bin/env python3
"""Gera src/data/municipalities.pt.json: os 308 concelhos de Portugal com o centro de cada um.

Fonte: Carta Administrativa Oficial de Portugal (CAOP 2020), Direção-Geral do Território (DGT).
Dados abertos (dados.gov.pt / DGT), reutilização livre com indicação da fonte.
Os limites dos concelhos não mudaram desde 2013 (308 concelhos).

Ficheiros usados (os ZIP oficiais da DGT; o código do repositório onde estão não é usado):
  Cont_AAD_CAOP2020, ArqMadeira_AAd_CAOP2020, ArqAcores_GOcidental/GCentral/GOriental_AAd_CAOP2020

Método:
  1. Lê .shp (polígonos) e .dbf (atributos) com um leitor próprio (sem bibliotecas externas).
  2. Agrega as freguesias pelo DICO (4 primeiros dígitos do DICOFRE).
  3. Centro = centroide ponderado pela área, calculado nas coordenadas projetadas (metros).
  4. Converte para graus (Transversa de Mercator inversa, elipsoide GRS80):
     continente em PT-TM06/ETRS89; Madeira (28N) e Açores (25N, 26N) em UTM/PTRA08.

Uso: python3 -I scripts/build-municipalities.py <pasta-com-os-zip-extraidos> src/data/municipalities.pt.json
"""
import json
import math
import struct
import sys
import unicodedata
from pathlib import Path

A = 6378137.0
F = 1 / 298.257222101
E2 = F * (2 - F)

DISTRICTS = {
    "01": "Aveiro", "02": "Beja", "03": "Braga", "04": "Bragança", "05": "Castelo Branco",
    "06": "Coimbra", "07": "Évora", "08": "Faro", "09": "Guarda", "10": "Leiria",
    "11": "Lisboa", "12": "Portalegre", "13": "Porto", "14": "Santarém", "15": "Setúbal",
    "16": "Viana do Castelo", "17": "Vila Real", "18": "Viseu",
    "31": "Madeira", "32": "Madeira",
    "41": "Açores", "42": "Açores", "43": "Açores", "44": "Açores", "45": "Açores",
    "46": "Açores", "47": "Açores", "48": "Açores", "49": "Açores",
}


def meridian_arc(phi):
    e4, e6 = E2 * E2, E2 ** 3
    return A * ((1 - E2 / 4 - 3 * e4 / 64 - 5 * e6 / 256) * phi
                - (3 * E2 / 8 + 3 * e4 / 32 + 45 * e6 / 1024) * math.sin(2 * phi)
                + (15 * e4 / 256 + 45 * e6 / 1024) * math.sin(4 * phi)
                - (35 * e6 / 3072) * math.sin(6 * phi))


def tm_inverse(x, y, lat0, lon0, k0, fe, fn):
    """Transversa de Mercator inversa (Snyder, 1987, eq. 8-18 a 8-25)."""
    ep2 = E2 / (1 - E2)
    m = meridian_arc(math.radians(lat0)) + (y - fn) / k0
    mu = m / (A * (1 - E2 / 4 - 3 * E2 ** 2 / 64 - 5 * E2 ** 3 / 256))
    e1 = (1 - math.sqrt(1 - E2)) / (1 + math.sqrt(1 - E2))
    phi1 = (mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * math.sin(2 * mu)
            + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * math.sin(4 * mu)
            + (151 * e1 ** 3 / 96) * math.sin(6 * mu)
            + (1097 * e1 ** 4 / 512) * math.sin(8 * mu))
    c1 = ep2 * math.cos(phi1) ** 2
    t1 = math.tan(phi1) ** 2
    n1 = A / math.sqrt(1 - E2 * math.sin(phi1) ** 2)
    r1 = A * (1 - E2) / (1 - E2 * math.sin(phi1) ** 2) ** 1.5
    d = (x - fe) / (n1 * k0)
    lat = phi1 - (n1 * math.tan(phi1) / r1) * (
        d ** 2 / 2 - (5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * ep2) * d ** 4 / 24
        + (61 + 90 * t1 + 298 * c1 + 45 * t1 ** 2 - 252 * ep2 - 3 * c1 ** 2) * d ** 6 / 720)
    lon = math.radians(lon0) + (
        d - (1 + 2 * t1 + c1) * d ** 3 / 6
        + (5 - 2 * c1 + 28 * t1 - 3 * c1 ** 2 + 8 * ep2 + 24 * t1 ** 2) * d ** 5 / 120) / math.cos(phi1)
    return math.degrees(lat), math.degrees(lon)


def read_prj(path):
    txt = path.read_text()
    def param(name):
        key = f'PARAMETER["{name}",'
        i = txt.index(key) + len(key)
        return float(txt[i:txt.index("]", i)])
    return dict(lat0=param("Latitude_Of_Origin"), lon0=param("Central_Meridian"),
                k0=param("Scale_Factor"), fe=param("False_Easting"), fn=param("False_Northing"))


def read_dbf(path, encoding):
    data = path.read_bytes()
    nrec, hlen, rlen = struct.unpack("<IHH", data[4:12])
    fields, off = [], 32
    while data[off] != 0x0D:
        name = data[off:off + 11].split(b"\0")[0].decode("ascii")
        flen = data[off + 16]
        fields.append((name, flen))
        off += 32
    rows = []
    for i in range(nrec):
        rec = data[hlen + i * rlen: hlen + (i + 1) * rlen]
        pos, row = 1, {}
        for name, flen in fields:
            row[name] = rec[pos:pos + flen].decode(encoding, errors="replace").strip()
            pos += flen
        rows.append(row)
    return rows


def read_shp_polygons(path):
    """Devolve, por registo, a lista de anéis [(x, y), ...]."""
    data = path.read_bytes()
    off, out = 100, []
    while off < len(data):
        _, clen = struct.unpack(">ii", data[off:off + 8])
        body = data[off + 8: off + 8 + clen * 2]
        off += 8 + clen * 2
        stype = struct.unpack("<i", body[:4])[0]
        if stype == 0:
            out.append([])
            continue
        if stype not in (5, 15, 25):
            raise ValueError(f"tipo de geometria inesperado: {stype}")
        nparts, npoints = struct.unpack("<ii", body[36:44])
        parts = list(struct.unpack(f"<{nparts}i", body[44:44 + 4 * nparts]))
        p0 = 44 + 4 * nparts
        pts = [struct.unpack("<dd", body[p0 + 16 * i: p0 + 16 * i + 16]) for i in range(npoints)]
        parts.append(npoints)
        out.append([pts[parts[i]:parts[i + 1]] for i in range(nparts)])
    return out


def ring_moments(ring):
    """Área com sinal e momentos (shoelace). Os buracos têm sinal contrário e descontam sozinhos."""
    a = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(ring, ring[1:] + ring[:1]):
        cr = x0 * y1 - x1 * y0
        a += cr
        cx += (x0 + x1) * cr
        cy += (y0 + y1) * cr
    return a / 2, cx / 6, cy / 6


def find(folder, suffix):
    hits = [p for p in folder.iterdir() if p.suffix.lower() == suffix]
    if len(hits) != 1:
        raise SystemExit(f"esperava um {suffix} em {folder}")
    return hits[0]


def main(src, dest):
    acc = {}  # dico -> [area, mx, my, proj, name]
    for folder in sorted(p for p in Path(src).iterdir() if p.is_dir()):
        proj = read_prj(find(folder, ".prj"))
        cpg = [p for p in folder.iterdir() if p.suffix.lower() == ".cpg"]
        enc = cpg[0].read_text().strip() if cpg else "utf-8"
        enc = {"UTF-8": "utf-8"}.get(enc.upper(), enc)
        rows = read_dbf(find(folder, ".dbf"), enc)
        polys = read_shp_polygons(find(folder, ".shp"))
        if len(rows) != len(polys):
            raise SystemExit(f"dbf e shp com tamanhos diferentes em {folder}")
        for row, rings in zip(rows, polys):
            dicofre = row.get("Dicofre") or row.get("DICOFRE")
            name = row.get("Concelho") or row.get("CONCELHO") or row.get("Municipio")
            dico = dicofre[:4]
            a = mx = my = 0.0
            for ring in rings:
                ra, rx, ry = ring_moments(ring)
                a, mx, my = a + ra, mx + rx, my + ry
            if a < 0:  # anéis no sentido horário (convenção shapefile): normalizar o sinal
                a, mx, my = -a, -mx, -my
            cur = acc.setdefault(dico, [0.0, 0.0, 0.0, proj, name])
            if cur[3] != proj:
                raise SystemExit(f"concelho {dico} em duas projeções")
            cur[0] += a
            cur[1] += mx
            cur[2] += my

    out = []
    for dico, (a, mx, my, proj, name) in sorted(acc.items()):
        lat, lng = tm_inverse(mx / a, my / a, **proj)
        name = unicodedata.normalize("NFC", name.title() if name.isupper() else name)
        out.append({"code": dico, "name": name, "district": DISTRICTS[dico[:2]],
                    "lat": round(lat, 5), "lng": round(lng, 5)})
    Path(dest).write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(out)} concelhos escritos em {dest}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
