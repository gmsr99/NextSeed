# Kit de arranque do Financinhas

Os PDFs em `public/financinhas/kit/` saem daqui. A app só os serve (botão
"Kit de arranque (PDF)" na página Financinhas); nada é desenhado no browser.

## De onde vêm
- **Caderninho, Etiquetas e Folha de contas**: o desenho original do Financinhas,
  convertido em vetores a partir dos PDFs originais. Só se muda: o valor do chão
  da família (€5) passa a espaço para preencher, e entra o logótipo NexSeed.
- **Mapa de Moedas (5–6) e Fotografia inicial**: folhas novas (`mapa_moedas.html`,
  `fotografia.html`) com as mesmas letras, cores e medidas.

Os PDFs originais **não estão no repositório** (são da família do fundador):
estão no Drive, em Financinhas › Materiais e protótipos.

## Gerar outra vez
```
python3 scripts/financinhas-kit/build.py <pasta-com-os-3-PDFs-originais>
```
Precisa de `pdftocairo` (poppler), `qpdf`, `google-chrome` e Python com `fontTools`.

## Letras
Fredoka, Nunito e Quicksand (SIL Open Font License, ficheiros `OFL-*.txt`).
