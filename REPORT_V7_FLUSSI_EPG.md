# Consolidamento Montecrestese v7 – 23 ottobre 2026

## Cosa è stato realmente verificato

- Base: v6 con 54 canali; sulla LG l'utente ha mostrato il risultato **50 disponibili, 4 non disponibili**. I quattro non funzionanti sono **14 Primantenna, 15 GRP TV, 41 K2, 44 Frisbee**.
- Aggiunti **nove flussi HLS nuovi** dopo prova esterna diretta del manifest `#EXTM3U`; ciò **non prova** la riproduzione su LG.
- Aggiunto **75 Top Calcio 24** come candidato basato su fonte pubblica (Free-TV/IPTV); controllo esterno bloccato dal filtro anti-bot, **nessuna verifica di riproduzione**.
- Totale v7: **64 voci IPTV candidate**, numerate, senza segnaposto fittizi.
- **Nessuna modifica ai 54 URL della v6**.
- Nella versione con EPG: `49`/64 canali con tvg-id verificato contro la lista reale dei canali XMLTV di Open-EPG Italy3 del 23 ottobre 2026, `15` senza corrispondenza (guide locali/manualmente mancanti).

## Nove nuovi flussi HLS raggiungibili in test esterno

- 011 **Telecupole**: `https://load-balancer.azotosolutions.com/cdnedge40/telecupole/playlist.m3u8`
- 018 **Canale Italia**: `https://ovp-live.akamaized.net/ac115_live/canale1.smil/playlist.m3u8`
- 037 **Discovery**: `https://streaming.aurora.enhanced.live/live/mpc/enl0eG1mLmVncmVzcy5mZDJ2eHI=/out/v1/IT_SIMULCAST/DISCOVERYCHANNEL/CMAF/index.m3u8`
- 053 **Italia 53**: `https://ovp-live.akamaized.net/ac115_live/canale3.smil/playlist.m3u8`
- 068 **BOM Channel**: `https://5f22d76e220e1.streamlock.net/canale6/canale6/playlist.m3u8`
- 070 **Radio Italia TV**: `https://radioitaliatv.akamaized.net/hls/live/2093117/RadioitaliaTV/master.m3u8`
- 073 **Radio Bruno TV**: `https://router.xdevel.com/video0s975758-473/stream/playlist.m3u8`
- 078 **Motori TV**: `https://64b16f23efbee.streamlock.net/servizio01/servizio01/playlist.m3u8`
- 096 **Radio Birikina TV**: `https://tvd-bk.fluid.stream/RadioBirikinaTV/livestream/chunklist_w84398277.m3u8`

## In prova senza manifest confermato

- 075 Top Calcio 24: `https://sportitaliaamd.akamaized.net/live/Telelombardia/hls/1CCCD0BCA2F9C979BC0632230F8E31EAEA41562B/index.m3u8`. Pubblicato in Free-TV/IPTV; endpoint schermato da anti-bot per test esterno, potrebbe funzionare sulla LG.
- Non aggiungere questo stesso flusso al 072 **Telelombardia** solo perché l'URL contiene "Telelombardia": la fonte lo identifica come Top Calcio 24 e sono **due canali distinti**.

## Canali mancanti prioritari

- 008 TV8: le sorgenti firmate reperite sono temporanee o non verificabili senza autorizzazione, non inclusa.
- 012 Videogruppo: sito ufficiale Mediapason conferma la LCN, ma non è stato trovato un manifest HLS pubblico affidabile.
- 072 Telelombardia: sito ufficiale https://telelombardia.video/ ; manifest HLS indipendente non verificato.
- 014, 015, 041, 044 restano in elenco con stream della v6 ma sono indicati non funzionanti dal televisore.

## Guida programmi XMLTV

- **URL**: `https://www.open-epg.com/files/italy3.xml.gz` (servizio esterno, file XMLTV compresso).
- Controllata la disponibilità di identificatori XMLTV tramite il file `italy3.xml` (63 canali nella guida).
- Non serve aggiungere un'origine EPG manuale: la versione v7 EPG usa `x-tvg-url` nella riga iniziale della playlist.
- Non mescolare la playlist v7 EPG con un'altra playlist identica: usare una sola lista attiva per evitare doppioni.
- L'EPG non è stata collaudata sulla LG; alcune emittenti locali non compaiono nella guida; le correzioni sono possibili in Impostazioni > Guida programmi / Modifica elenco canali.
- L'orario EPG va inizialmente mantenuto su Dispositivo, correzione 0 min.

## Limiti e conformità

- IPTV pubblici indicizzati non implicano diritto di redistribuzione o affidabilità illimitata: utilizzare solo trasmissioni accessibili gratuitamente e nei termini dei broadcaster.
- Nessun bypass di DRM, autenticazione o token firmati. Manifest HLS verificati esternamente, non video/segmenti/codec della LG.
- I canali approvati senza un URL non devono essere riempiti con URL inventati, pagine HTML o fonti di canali dal nome simile ma differenti.
- La numerazione visualizzata come indice nella webOS app non rispetta automaticamente `tvg-chno`; l'LCN è nei metadati/nome. Una modifica del lettore sarebbe separata.
