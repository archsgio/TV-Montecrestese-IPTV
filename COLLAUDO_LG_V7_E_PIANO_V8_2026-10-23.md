# Collaudo reale della v7 e diagnostica v8 — 23 ottobre 2026

## Canali confermati funzionanti su LG dopo caricamento della v7
- 006 Italia 1, 013 Rete 7 Piemonte: già confermati funzionanti dall'utente nelle sessioni precedenti; URL NON modificati.
- 019 Video Novara, 046 Cartoonito: confermati funzionanti dall'utente con la v6; URL NON modificati.
- 018 Canale Italia, 037 Discovery, 053 Italia 53, 068 BOM Channel, 070 Radio Italia TV, 073 Radio Bruno TV, 096 Radio Birikina TV: riproduzione confermata dall'utente con v7; URL NON modificati.
- 011 Telecupole e 078 Motori TV: la loro riproduzione LG NON è stata confermata esplicitamente nel messaggio v7; non inventare un risultato.

## Non funzionano su LG (messaggio v7)
- 014 Primantenna — entrambe le sorgenti note restituivano 404 (test esterno 23 ottobre)
- 015 GRP TV — manifest HLS raggiungibile ma playback non disponibile
- 041 K2 — vecchio endpoint Samsung/Amagi non valido al controllo esterno
- 044 Frisbee — manifest CloudFront 200 ma playback LG non disponibile
- 075 Top Calcio 24 — endpoint Mediapason via SportitaliaAMD blocca il controllo automatico esterno; playback LG non disponibile
- 802 Rai 3 TGR Piemonte — manifest principale HLS 200, ma playlist media interna restituisce 404 nel controllo esterno; problema possibile di disponibilità a orario TGR o user-agent. NON dimostrato che l'instradamento 802 sia 24/7.

## Nuova playlist v8 — **DIAGNOSTICA, NON CORREZIONE GARANTITA**

Restano tutti i 64 canali v7, ordine LCN, zero posizioni segnaposto. Modificati solo:

1. **LCN 15 GRP TV**: usare la variante diretta `https://webstream.multistream.it/memfs/a3195c96-f884-4c74-924f-2648814fc0b5_output_0.m3u8` (manifest pubblico scaricato correttamente; successivo playback da verificare).
2. **LCN 41 K2**: sostituire il Samsung/Amagi non valido con `https://d1pmpe0hs35ka5.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-39hsskpppgf72/K2_IT.m3u8` (manifest HLS CloudFront e playlist qualità 360p verificati; questo collegamento era già stato provato nelle versioni iniziali senza certezza di video).
3. **LCN 802 Rai 3 TGR Piemonte**: mantenere URL video attuale e aggiungere `#EXTVLCOPT:http-user-agent=HbbTV/1.6.1`, come nella raccolta OpenIPTVItaly. Il parser del lettore open source supporta questa direttiva, ma il player webOS potrebbe comunque non applicarla e il flusso media era 404. Ritestare preferibilmente durante un'edizione del TGR (alle 14:00 e alle 19:30).

**LCN 14, 44, 75 invariati perché non è disponibile una sostituzione credibile. Non caricare un canale diverso col nome del canale richiesto**.

Versioni v6 e v7 conservate. La v8 è una playlist alternativa, non sovrascrivere le precedenti e non disattivare la playlist EPG funzionante eventualmente presente prima di verificare il video.

## Risultati esterni di verifica

- Primantenna https://5f22d76e220e1.streamlock.net/primantenna14/primantenna14/playlist.m3u8 → 404.
- GRP source attuale https://webstream.multistream.it/memfs/a3195c96-f884-4c74-924f-2648814fc0b5.m3u8 → HLS master valido; variante output_0 → HLS valido; niente test riproduzione LG.
- K2 CloudFront HLS master 200, child m3u8 200 (non equivale a video decoder LG riuscito).
- Frisbee CloudFront HLS master 200, child m3u8 200; LG dice non funziona.
- TGR Piemonte master https://tgrpiemonte-live.akamaized.net/hls/live/2025569/tgrpiemonte/tgrpiemonte/playlist.m3u8 → 200; child `tgrpiemonte_1300/chunklist.m3u8` → 404. Fonte HbbTV ufficiale Rai: https://www.servizitelevideo.rai.it/televideo/pub/articolo.jsp?id=20115
- Top Calcio 24 https://sportitaliaamd.akamaized.net/live/Telelombardia/hls/1CCCD0BCA2F9C979BC0632230F8E31EAEA41562B/index.m3u8 → bot-blocked; playback LG non funziona.

## EPG

La v7 XMLTV predispone 49 `tvg-id` coerenti con https://www.open-epg.com/files/italy3.xml.gz . La v8 diagnostica NON include EPG, così si può isolare il problema video. Le sorgenti EPG sono da collaudare più avanti.
