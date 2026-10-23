# Playlist Montecrestese v9 — ottimizzazione conservativa (23/10/2026)

## Stato: **candidata alla prova**, non playlist completa né collaudata
Sono stati analizzati i 64 flussi della v7 e gli 85 LCN del catalogo approvato. Le due playlist v7 **restano intatte**; le tre modifiche bocciate nella v8 **non vengono riproposte**.

### File di prova v9 (nel branch, senza toccare main)
- [v9 pulita con EPG](TV_Montecrestese_LCN_v9_PULITA_XMLTV_TEST.m3u): 58 canali conservati, 45 con `tvg-id` di Italy3, numeri LCN originali.
- [v9 pulita senza EPG](TV_Montecrestese_LCN_v9_PULITA_FLUSSI_TEST.m3u): gli stessi 58 flussi.
- [Stato per tutti gli 85 LCN](Catalogo_LCN_Montecrestese_v9_STATO.csv): per ogni posizione, presenza URL, conferma reale LG, inclusione/esclusione, stato XMLTV.
- [Validatore automatico senza rete](scripts/audit-playlist-montecrestese.mjs): `node scripts/audit-playlist-montecrestese.mjs`, eseguire dalla copia locale del repository.

### Decisioni applicate
1. Esclusi **solo** i sei LCN già confermati non funzionanti dall'utente sulla LG: **14 Primantenna, 15 GRP TV, 41 K2, 44 Frisbee, 75 Top Calcio 24, 802 Rai 3 TGR Piemonte**.
2. Conservati **identici** tutti i restanti 58 stream video e i metadati. Gli **11 LCN** con riproduzione esplicitamente confermata (6, 13, 18, 19, 37, 46, 53, 68, 70, 73, 96) sono protetti da controllo automatico. Gli altri 47 non hanno una conferma singola audio+video, anche se la prova di stato della v6 aveva restituito 50/54 disponibili.
3. **21 posizioni del catalogo rimangono senza URL diretto**. Non sono stati inseriti canali sbagliati, pagine HTML, stream tokenizzati/DRM o segnaposto.
4. EPG: 45 identificativi non vuoti, contro 49 nella v7. Le associazioni sono state conservate, non nuovamente validate contro la guida online e non provate sul TV. Lasciare fuso orario Dispositivo e offset 0 min inizialmente.
5. Il numero 802 non viene sostituito con il flusso nazionale di Rai 3; è assente dalla v9 finché non sarà trovato un vero TGR Piemonte compatibile.

### Indagini mirate sulle sorgenti esterne (23 ottobre 2026)
| LCN | Ricerca | Esito e decisione |
|---:|---|---|
| 14 | Vecchio alternativo `https://585b674743bbb.streamlock.net/9062/9062/playlist.m3u8` | **HTTP 404** nella sonda, scartato. L'URL v7 Primantenna è già noto 404. |
| 15 | Alternate storico `https://5cbd3bc28341f.streamlock.net:444/grp/live/playlist.m3u8` | **Proxy error**, non verificabile: non aggiunto. Il sito ufficiale di GRP incorpora `https://webstream.multistream.it/a3195c96-f884-4c74-924f-2648814fc0b5.html` (stessa infrastruttura della v7, non fonte alternativa dimostrata). |
| 50 | Vecchio indirizzo Sky TG24 `https://skyanywhere3-i.akamaihd.net/hls/live/510696/tg24/playlist.m3u8` | **HTTP 400**, scartato. Su Free-TV compare un indirizzo Sky con `hdnts` firmato, non candidato permanente affidabile. |
| 84 | Telereporter `https://5f22d76e220e1.streamlock.net/telereporter/telereporter/playlist.m3u8` | Fonte pubblica etichettata **blocked** dal monitor Free-TV (1 ottobre 2026); **non inserita**. |
| 98 | URL storico Radio 4 You `https://5926fc9c7c5b2.streamlock.net/9018/9018/playlist.m3u8` | **HTTP 404**, scartato. Il diverso canale `4 You Tv` non viene sostituito senza confermare l'identità. |
| 87 | RBE-TV | Trasmissione TV su LCN 87 riportata dal broadcaster; sono emersi stream **solo audio**, che non soddisfano il requisito TV. |
| 12, 72 | Videogruppo e Telelombardia | Siti in diretta presenti, ma nessun HLS diretto autenticato e verificato separatamente; non inseriti. |

Le sonde HTTP/HTML non dimostrano riproduzione con video e audio sulla LG. Le risposte di errore possono dipendere anche dal client, dal paese o dal servizio anti-bot: in tal caso non cambiamo la playlist per tentativi.

### Collegamenti
- Broadcaster Primantenna: https://www.primantenna.tv/diretta-tv/
- Broadcaster GRP: https://grp.it/diretta-tv
- Broadcaster RBE-TV: https://rbe.it/ascolta-rbe/
- Elenco stream Free-TV: https://github.com/Free-TV/IPTV/blob/master/playlists/playlist_italy.m3u8
- Monitor stream Free-TV: https://free-tv.github.io/IPTV/
- Fonti diagnostiche precedenti: [collaudo v8](COLLAUDO_LG_V8_ESITO_NEGATIVO_2026-10-23.md), [rapporto v7](REPORT_V7_FLUSSI_EPG.md)

### Collaudo domani su LG 24TQ510S-WZ
Installare prima il player custom, senza rimuovere il lettore originale. Caricare **una sola** delle v9 dalla URL raw del branch e **non eliminare v7**; controllare numeri LCN, video+audio, EPG e i principali confermati. Se qualcosa peggiora, disattivare v9 e riattivare la v7. Valutare solo dopo l'esito se proporre la v9 in `main`. Nessuna prova sul televisore effettuata finora.
