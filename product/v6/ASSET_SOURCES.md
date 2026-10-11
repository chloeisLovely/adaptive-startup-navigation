# V6 assets and dependencies

| Asset | Origin / version | License / treatment |
|---|---|---|
| `assets/founder-scenes-v6.webp` | AI-generated revision of the user-selected six-character image, approved in this conversation | Compressed approved image; no external stock photo or invented team identity. Original generation is not a psychological instrument. |
| Existing cosmic entry artwork | Preserved V5.1 `product/assets` assets | No replacement or new third-party imagery |
| `vendor/pdf-lib.min.js` | pdf-lib 1.17.1, https://www.npmjs.com/package/pdf-lib/v/1.17.1 | MIT; adjacent `pdf-lib-LICENSE` |
| `vendor/fontkit.umd.min.js` | @pdf-lib/fontkit 1.1.1, https://www.npmjs.com/package/@pdf-lib/fontkit/v/1.1.1 | MIT; adjacent `fontkit-LICENSE`; attribution retained |
| `vendor/NanumGothic-Regular.ttf` | Google Fonts Nanum Gothic, https://github.com/google/fonts/tree/main/ofl/nanumgothic | SIL Open Font License 1.1; adjacent `NanumGothic-OFL.txt` |
| Babylon / legacy Chart.js | Existing repository runtime / legacy pinned 4.4.0 CDN | Existing implementation and licensing retained |

The character scenes deliberately distinguish visionary direction, evidence analysis, community listening, technical construction, social impact and scalable operations through activities and props. Names have accessible text outside the image. English UI also supplies English labels; embedded Korean image labels remain part of the approved artwork.

PDF vendor JS is about 1.3 MB combined and the Korean font about 2.1 MB uncompressed. They are same-origin and lazy-loaded only for export. Full font embedding was necessary after visual QA found missing glyphs with font subsetting. There is no runtime Google Fonts request for PDF export. PDFs contain selectable text plus rasterized charts; they are not tagged PDF/UA documents.

Research sources and usage boundaries are recorded in [RESEARCH_AUDIT.md](RESEARCH_AUDIT.md). Dependencies should be reviewed and updated with repeat PDF visual QA; version pinning is not a security certification.
