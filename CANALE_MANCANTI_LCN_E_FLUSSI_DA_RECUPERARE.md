# Elenco LCN incompleto: recupero canali mancanti — 23 ottobre 2026

La playlist `TV_Montecrestese_LCN_v6_TEST_TRE_CANALI.m3u` contiene **54 canali**, il catalogo LCN approvato **84 posizioni**. Mancano **30 canali** dalla playlist non perché le posizioni debbano essere eliminate, ma perché non è disponibile un flusso IPTV utilizzabile e collaudato.

L'utente ha confermato che riceve effettivamente almeno:
- **LCN 8 — TV8** (attualmente assente da M3U).
- **LCN 12 — Videogruppo Piemonte** (attualmente assente da M3U).

## Riferimenti ufficiali

- TV8: https://www.tv8.it/streaming — diretta sul sito dell'emittente. **Nessun URL HLS diretto stabile e riutilizzabile verificato**.
- Videogruppo: https://www.mediapason.it/videogruppo/ — emittente alla LCN 12 in Piemonte. Player del sito disponibile, **nessun URL HLS diretto verificato**.
- Elenco trasmissione DVB-T piemontese di riferimento: https://sites.google.com/view/alessandriadigitale/home-page/info-mux-nit

## URL candidati TV8 verificati e non accettabili per una playlist stabile

- `https://uvotv-aniview.global.ssl.fastly.net/10010/live/hls/tv8/playlist.m3u8`: 403 nella prova esterna del 23/10/2026.
- `https://uvotv.zappr.stream/269.m3u8`: non raggiungibile nella prova esterna.
- URL skycdn firmati con parametri `hdnts` / `hdnea`: **temporanei**, non pubblicare come URL permanente.

Non usare TV8 turca (`TV8.tr`): è un'emittente differente.

## Elenco dei 30 LCN presenti nel catalogo ma senza flusso in v6

| LCN | Emittente |
|---:|---|
| 8 | TV8 |
| 11 | Telecupole |
| 12 | Videogruppo |
| 16 | Sesta Rete |
| 18 | Canale Italia |
| 26 | Cielo |
| 29 | LA7 Cinema |
| 37 | Discovery |
| 45 | Boing Plus |
| 50 | Sky TG24 |
| 53 | Italia 53 |
| 57 | Italiana |
| 59 | Discovery Turbo |
| 61 | Club TV |
| 62 | Donna Sport TV |
| 63 | Il Sole 24 Ore TV |
| 68 | Bom Channel |
| 70 | Radio Italia TV |
| 71 | Canale Italia Piemonte |
| 73 | Radio Bruno TV |
| 75 | Top Calcio 24 |
| 76 | Valenza TV |
| 78 | Motori TV |
| 82 | Giocabet |
| 83 | Piemonte+ |
| 84 | Telereporter |
| 87 | RBE-TV |
| 96 | Radio Birikina TV |
| 98 | Radio 4 You TV |
| 101 | Rai 4K |

## Quattro canali della v6 senza video funzionante nella LG

LCN 14 Primantenna, 15 GRP TV, 41 K2, 44 Frisbee. In controllo automatico v6: 50 disponibili, 4 non disponibili. Video Novara (19) e Cartoonito (46) sono stati confermati funzionanti dall'utente.

## Requisiti per i prossimi passi

1. Mantenere intatta la v6 e i canali già funzionanti.
2. Cercare HLS/DASH pubblici autorizzati e verificabili per LCN 8, 12 e gli altri mancanti; segnalare chiaramente quando c'è solo streaming ufficiale sul web.
3. Aggiungere a M3U solo canali dotati di URL effettivamente utilizzabile, mai inventare URL o puntare un sito HTML come se fosse un manifest video.
4. Registrare i risultati di riproduzione LG per ciascun candidato.
5. Non inserire canali fittizi per riempire salti LCN: il lettore gestisce attualmente indice progressivo, mentre `tvg-chno` conserva la numerazione nelle metadata.
6. Verificare mediante scansione DTT effettiva se altri canali ricevuti dall'utente mancano rispetto al catalogo: la lista regionale non garantisce la ricezione puntuale.

La correzione della numerazione nell'interfaccia webOS IPTV Player è indipendente dal recupero dei flussi e non è già implementata.
