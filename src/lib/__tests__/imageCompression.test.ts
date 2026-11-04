import { describe, it, expect } from "vitest";
import { fitWithin, toJpegName, compressImage, MAX_DIMENSION_PX } from "../imageCompression";

describe("fitWithin", () => {
  it("não aumenta imagens pequenas", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("reduz pelo lado maior e mantém a proporção (paisagem)", () => {
    expect(fitWithin(4032, 3024)).toEqual({ width: MAX_DIMENSION_PX, height: 1200 });
  });

  it("reduz pelo lado maior e mantém a proporção (retrato)", () => {
    expect(fitWithin(3024, 4032)).toEqual({ width: 1200, height: MAX_DIMENSION_PX });
  });
});

describe("toJpegName", () => {
  it("troca a extensão por .jpg", () => {
    expect(toJpegName("IMG_1234.HEIC")).toBe("IMG_1234.jpg");
    expect(toJpegName("jardim.abelhas.png")).toBe("jardim.abelhas.jpg");
  });

  it("acrescenta .jpg quando não há extensão", () => {
    expect(toJpegName("foto")).toBe("foto.jpg");
  });
});

describe("compressImage", () => {
  it("deixa GIFs intactos (podem ser animados)", async () => {
    const gif = new File(["GIF89a"], "anim.gif", { type: "image/gif" });
    expect(await compressImage(gif)).toBe(gif);
  });

  it("devolve o original quando a imagem não pode ser descodificada", async () => {
    const broken = new File(["não é uma imagem"], "x.jpg", { type: "image/jpeg" });
    expect(await compressImage(broken)).toBe(broken);
  });
});
