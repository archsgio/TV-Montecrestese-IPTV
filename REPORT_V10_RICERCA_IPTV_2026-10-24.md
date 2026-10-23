# Montecrestese IPTV v10: due aggiunte controllate — 24 ottobre 2026

## Stato
**Sviluppo; da collaudare su LG 24TQ510S-WZ.** Conservate integralmente le v7 e v9. v10 contiene **60 posizioni LCN**, tra le quali **58 URL identici alla v9** e due nuove voci da provare. La numerazione, il catalogo originale approvato e le sorgenti EPG v7/v9 non sono stati sovrascritti.

- [M3U v10 con EPG](TV_Montecrestese_LCN_v10_CANDIDATI_XMLTV_TEST.m3u) — 60 voci, 45 `tvg-id` già mappati a XMLTV.
- [M3U v10 senza EPG](TV_Montecrestese_LCN_v10_CANDIDATI_FLUSSI_TEST.m3u) — stesso set di 60 URL per isolare i problemi video.
- [Catalogo v10 (85 LCN)](Catalogo_LCN_Montecrestese_v10_STATO.csv) — 60 presenti/19 senza fonte, 6 bocciati inclusi **solo nella v7 storica**, segnalazione per 98 rimosso dal mux.

## 59 — Discovery Turbo (NUOVO)
**HLS pubblico con prova esterna del manifest, non prova su LG.**

URL: `https://streaming.aurora.enhanced.live/live/mpc/enl0eG1mLmVncmVzcy5mZDJ2eHI=/out/v1/IT_SIMULCAST/TURBO/CMAF/index.m3u8`

Provenienza: Free-TV Italia `Turbo`, identificato `Motor.Trend.it`, LCN 59; iptv-org `Discovery Turbo`. Il 24 ottobre la verifica ha ottenuto un master HLS con ladder video **1080p, 720p, 540p, 360p** H.264/AAC e una media playlist effettiva (`index__3.m3u8`) con segmenti fMP4 e data/ora programma. Questo comprova che le playlist rispondono: **non abbiamo visto audio/video su LG**, non conosciamo la durata della stabilità del link. Usato `tvg-id=""` nella v10: EPG non inventata. LCN 59 presente nel catalogo approvato.

Riferimenti:
- https://github.com/Free-TV/IPTV/blob/master/playlists/playlist_italy.m3u8
- https://github.com/iptv-org/iptv/blob/master/streams/it.m3u

## 83 — Piemonte+ (NUOVO, simulcast con differenze occasionali)
Sorgente: lo stesso stream Rete 7 Piemonte (LCN 13), **già confermato funzionante sulla LG**:
`https://stream.ets-sistemi.it:2020/hls/rete7-live/rete7-live.m3u8`

È un **simulcast documentato**, non una sostituzione casuale. Il 08/04/2026 L'Italia in Digitale ha documentato la contemporanea PIEMONTE+ LCN 83 / Rete 7 LCN 13; il 03/10/2026 Alessandria Digitale ha riportato una programmazione specifica sulla 83, per cui **le due emittenti non sono identiche in ogni fascia oraria**. L'alias IPTV è utile per la normale trasmissione condivisa ma **non garantisce** la programmazione particolare di Piemonte+. Il catalogo v10 distingue questo caso in `CANDIDATO_SIMULCAST`; nessuna nuova URL del broadcaster è stata trovata.

Riferimenti:
- https://www.litaliaindigitale.it/news-regionali/piemonte-news/piemonte-news-anno-2026/260408-mux-locale-2-piemonte-alternanza-di-loghi-per-piemonte-hd/
- https://sites.google.com/view/alessandriadigitale/osservatorio-radiotv/osservatorio-radiotv-alessandria-dtt

## Candidati NON aggiunti
- **LA7 Cinema LCN 29:** `https://d15umi5iaezxgx.cloudfront.net/LA7D/CLN/HLS-B/Live.m3u8` restituisce HTTP **403** al test; `https://viamotionhsi.netplus.ch/live/eds/la7d/browser-HLS8/la7d.m3u8` è irraggiungibile (timeout); l'HLS alternativo su IP numerico e porta 81 mostra un master 720p ma ha provenienza, autorizzazione e stabilità non verificabili. Anche l'altro MPD indicizzato contiene segnali DRM e non va aggirato: **nessuna fonte inserita**.
- **Sesta Rete LCN 16:** pagina ufficiale https://sestarete.tv.it/streaming/ usa iframe https://play.xdevel.com/13241, ma il vecchio HLS https://stream10.xdevel.com/video0s977089-1792/stream/playlist.m3u8 restituisce **404**. L'iframe non è automaticamente un URL M3U. Nessuna inserzione.
- **GRP LCN 15:** ufficiale https://grp.it/diretta-tv incorpora l'infrastruttura `webstream.multistream.it` già risultata inutilizzabile sulla LG, nessun nuovo stream separato provato.
- **RBE TV LCN 87:** il sito ufficiale conferma diretta TV al numero 87, ma gli stream OGG/MP3 pubblicati sono **solo audio** e non soddisfano il requisito. Nessuna aggiunta.
- **Il Sole 24 Ore TV LCN 63:** il mux ha spostato IlSole24ORE TV alla **63** nel giugno 2026, mentre **Radio24TV** rimane sul **246**. Il manifest `https://ilsole24ore-radiovisual.akamaized.net/hls/live/2035302/persidera/master.m3u8` e la variante `master-3500.m3u8` rispondono, ma sono etichettati `Radio24TV.it`, LCN 246, nelle directory IPTV: senza provare che trasmetta IlSole24ORE TV 63 e non la radiovisione 246, **non assegnarlo alla 63**.
- **Radio 4 You TV LCN 98:** segnalata **rimossa** dal multiplex regionale il 23 settembre 2026. Il catalogo conserva il nome richiesto, ma ne contrassegna la possibile obsolescenza. La vecchia alternativa HLS è 404; non rimpiazzarla con `4 You TV` di altra regione.
- **Italiana LCN 57:** la denominazione della playlist è **corretta**. Dal **1° ottobre 2026** Rai Scuola è stata sostituita da Italiana (powered by Rai) sul canale 57, come confermano le notizie RAI MUX B. Diretta ufficiale: https://www.raiplay.it/dirette/italiana . Senza manifest pubblico attendibile utilizzare fallback browser/DVB, **non uno stream Rai Scuola**.
- **41 K2, 44 Frisbee, 802 Rai 3 TGR Piemonte**: rifiutati in v7/v8 sul televisore. Non riproposti senza una fonte effettivamente distinta; le pagine HTML, i feed DRM, gli URL di terze parti privi di autorizzazione non sono stati inseriti.
- **8 TV8, 26 Cielo, 50 Sky TG24:** URL `hdnts` con token/firmati nel catalogo Free-TV non idonei a una playlist permanente stabile senza gestione ufficiale; non copiati.

## Controlli
Il repository dispone dello script `scripts/audit-playlist-montecrestese.mjs` che ora confronta v7/v9/v10, verifica ordine/duplicati LCN, identifica le due sole aggiunte 59 e 83, conserva tutte le **58** voci precedenti, protegge gli **11** canali dichiarati funzionanti sulla LG, e garantisce EPG e stream uguali nelle v10 con/senza guida. Sono vietati i 6 LCN già bocciati nella nuova lista. Lo script non richiede connessione ai flussi; i controlli della logica sono indipendenti dal collaudo TV.

## Prova sul televisore
Non eliminare v7. Importare temporaneamente una sola v10, prima senza EPG se il video non parte, poi con EPG; dare priorità ai LCN **59** e **83** e controllare audio+video effettivi. LCN 83 potrà mostrare la normale programmazione Rete7, non eventuali finestre speciali di Piemonte+. Controllare infine i canali già confermati 6/13/18/19/37/46/53/68/70/73/96, senza modificarli. **Nessuna prova reale v10 è stata svolta.**
