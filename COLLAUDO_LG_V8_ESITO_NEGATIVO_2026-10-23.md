# Esito v8: 0 interventi riusciti (23 ottobre 2026)

## Conferma dell'utente sul televisore LG

L'utente riferisce **tutte e tre le prove della playlist v8 negative**:

| LCN | Canale | Intervento v8 | Esito |
| ---: | --- | --- | --- |
| 15 | GRP TV | Variante HLS diretta `..._output_0.m3u8` | **Non funziona** |
| 41 | K2 | CloudFront HLS alternativo | **Non funziona** |
| 802 | Rai 3 TGR Piemonte | Header `#EXTVLCOPT:http-user-agent=HbbTV/1.6.1` | **Non funziona** |

**Conclusione**: v8 BOCCIATA, non usarla come nuova versione base. Non riproporre le stesse prove senza evidenze diverse.

## Playlist base

**v7** conservata intatta: 64 candidati, 49 con tvg-id XMLTV verificato. La versione senza EPG e quella EPG sono separate:
- `TV_Montecrestese_LCN_v7_FLUSSI_TEST.m3u`
- `TV_Montecrestese_LCN_v7_XMLTV_TEST.m3u`

## Altri canali ancora non funzionanti secondo collaudo v7

- 14 Primantenna — collegamenti pubblici noti restituiscono 404 in test esterno.
- 44 Frisbee — master e varianti HLS disponibili esternamente, ma video non riprodotto sulla LG.
- 75 Top Calcio 24 — URL indicizzato da Free-TV non riprodotto sulla LG, sonda esterna bot-blocked.
- 15 GRP TV, 41 K2, 802 TGR Piemonte — restano non funzionanti dopo le variazioni v8.

## Controlli di rete eseguiti

- GRP TV: risposta di master HLS valida con query `session` variabile per la qualità video; nessuna riproduzione verificata.
- K2: master CloudFront HLS e media playlist 360p raggiungibili, **ma non sulla LG**.
- Rai 3 Piemonte: master Rai HLS valido, ma media playlist secondaria del TGR Piemonte restituisce 404, quindi non può essere dichiarato funzionante; fonte primaria di questo URL: OpenIPTVItaly.
- In mancanza di nuove sorgenti distinte e affidabili, non creare una v9 con gli stessi URL.

## Conferme di canali funzionanti già ricevute

6 Italia 1, 13 Rete 7 Piemonte, 19 Video Novara, 46 Cartoonito, 18 Canale Italia, 37 Discovery, 53 Italia 53, 68 BOM Channel, 70 Radio Italia TV, 73 Radio Bruno TV, 96 Radio Birikina TV. **Non sovrascrivere questi URL**.

## Prossime mosse

1. Cercare sorgenti differenti dalle già bocciate per Primantenna, GRP TV, K2, Frisbee, Top Calcio 24 e Rai 3 Piemonte.
2. Tenere distinta la ricezione del TGR Piemonte su DVB-T dalla possibilità di IPTV HLS 24/7: la versione Rai 3 nazionale (LCN 3) non deve essere sostituita da un feed regionale non funzionante.
3. Mantenere v7 come riferimento per prosecuzione e XMLTV.
4. Per qualsiasi nuovo flusso richiedere verifica audio+video effettiva su LG, non soltanto stato di salute HTTP.
5. Evitare di cancellare canali funzionanti o introdurre placeholder fittizi.
