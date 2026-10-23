# Test v5 — sostituzioni flussi (23 ottobre 2026)

Prima di questa versione, l'utente ha confermato che **Italia 1 (6) e Rete 7 Piemonte (13) si vedono**: entrambe le sorgenti rimangono **identiche alla v4**.

## Canali sostituiti (non ancora verificati sulla TV)

| LCN | Emittente | Origine del flusso alternativo |
|---:|---|---|
| 2 | 002 Rai 2 | xN1ckuz/OpenIPTVItaly (Rai 2 HLS) |
| 14 | 014 Primantenna | iptv-org; Free-TV (Primantenna Torino HLS) |
| 20 | 020 20 Mediaset | Free-TV (Mediaset HLS) |
| 21 | 021 Rai 4 | xN1ckuz/OpenIPTVItaly (Rai 4 HLS) |
| 22 | 022 Iris | Tundrak/IPTV-Italia (Iris MPEG-DASH) |
| 25 | 025 Rai Premium | Free-TV (Rai Premium relinker) |
| 30 | 030 La5 | Free-TV (La5 HLS) |
| 39 | 039 Top Crime | Free-TV (Top Crime HLS) |
| 41 | 041 K2 | Tundrak/IPTV-Italia (K2 FAST HLS) |
| 42 | 042 Rai Gulp | xN1ckuz/OpenIPTVItaly (Rai Gulp HLS) |
| 43 | 043 Rai YoYo | xN1ckuz/OpenIPTVItaly (Rai Yoyo MPEG-DASH) |
| 46 | 046 Cartoonito | Tundrak/IPTV-Italia (Cartoonito MPEG-DASH) |
| 48 | 048 Rai News 24 | Free-TV; iptv-org (Rai News 24 HLS) |

**Protocolli DASH da collaudare particolarmente:** 22 Iris, 43 Rai Yoyo, 46 Cartoonito. L'app webOS IPTV Player documenta supporto DASH, ma ciò non prova l'effettiva riproducibilità dei flussi, che possono richiedere autorizzazioni/DRM.

**Senza alternativa sicura:** 15 GRP TV e 19 Video Novara restano sulla sorgente precedente, perché non è stato individuato un nuovo indirizzo live sufficientemente fondato. 8 TV8 manca perché non è disponibile una sorgente IPTV pubblica stabile priva di token temporanei.

## EPG

La playlist v5 EPG TEST inserisce l'URL XMLTV compresso `https://www.open-epg.com/files/italy3.xml.gz` nell'intestazione M3U (nessuna EPG manuale richiesta). Per i primi sette canali i `tvg-id` sono adattati alle denominazioni note del file italy3, che usano spazi. Gli altri sono ancora **da associare/validare**.

Fonte: https://www.open-epg.com/app/epgguide.php

La sorgente italy3 aggiorna i dati una volta al giorno e ha circa due giorni di palinsesto. La EPG è una prova separata da fare **solo dopo il test dei flussi v5 senza EPG**. Evitare di aggiungere URL di guida duplicate manualmente.

## Istruzioni

1. Aggiungere come playlist **nuova** `TV_Montecrestese_LCN_v5_TEST_ROSSI.m3u`, senza eliminare o sovrascrivere la v4.
2. In Diretta, verificare la riproduzione dei 13 canali sostituiti e annotare gli insuccessi.
3. Per tutti i flussi rossi/sospetti usare la diagnostica di app e test di avvio, perché un punto verde garantisce solo l'esito del probe HTTP e non il video.
4. Dopo il test video, aggiungere `TV_Montecrestese_LCN_v5_EPG_TEST.m3u` come seconda playlist di prova e controllare programmi di Rai1/2/3, Rete4, Canale5, Italia1 e LA7.
