# Regola progettuale: ricerca open source prima di funzionalità nuove

**Ambito:** progetto IPTV Montecrestese, LG 24TQ510S-WZ (webOS 22), 24 ottobre 2026.

## Procedura obbligatoria per ogni funzione non familiare

1. **Descrivere il comportamento osservabile** (telecomando, numero di clic, canale su schermo) e ciò che è veramente richiesto. Distinguere *apertura di una pagina*, *stream in riproduzione*, *canale DVB sintonizzato* e *canale soltanto presente in guida*.
2. **Cercare prima su GitHub** almeno 2–3 progetti comparabili: verificare licenza nel file LICENSE (non fidarsi solo della scheda GitHub), manutenzione (ultimo push, issue aperte, versioni), architettura, compatibilità con il browser webOS 22 Chromium 87 e con il vincolo di build più conservativo dell'app (Chromium 53).
3. **Confrontare in modo esplicito**: esperienza telecomando, player utilizzato, dipendenze aggiunte, consumo CPU/RAM, vincoli MSE/DRM/HLS, autorizzazioni richieste, sicurezza, licenza e costo reale di manutenzione.
4. **Preferire funzioni esistenti nel codice corrente**, poi una dipendenza diffusa con licenza verificata, e solo infine codice dedicato. Non incorporare blocchi di codice di licenza incompatibile/sconosciuta; documentare origine e attribuzioni dei frammenti usati.
5. **Prototipo isolato** prima dell'integrazione nel player stabile; test automatici (TypeScript, lint, regressione) e sul dispositivo LG con telecomando. Non dichiarare compatibilità col solo passaggio della CI.
6. **Fallimento sicuro**: mai video nero prolungato, cambio a una sorgente diversa senza consenso o falso stato «disponibile». Conservare la versione funzionante e la playlist precedente.
7. **Promuovere** una funzionalità soltanto quando è verificata sull'hardware reale, in particolare avvio video e tempi di passaggio tra canali.

## Ricerca svolta per il visualizzatore video dentro l'app

| Repository, attività al 24/10/2026 | Licenza verificata | Approccio / dipendenze | Opportunità e rischi |
|---|---|---|---|
| [lennylxx/webos-iptv-player](https://github.com/lennylxx/webos-iptv-player), push 22/10/2026 | Apache-2.0 (`package.json`, GitHub) | Il nostro upstream; player `<video>` nativo sul TV; HLS.js/Shaka per percorsi specifici e preview desktop | **Preferito:** già integrato, minimo lavoro/CPU/ritardo. [Analisi native vs HLS.js](https://github.com/lennylxx/webos-iptv-player/blob/main/docs/native-vs-hls.js.md) effettuata su *altro* televisore; non certifica il nostro |
| [ZUI-WebOS/ZUI-IPTV-Player](https://github.com/ZUI-WebOS/ZUI-IPTV-Player), push 19/10/2026 | MIT (GitHub) | React, HLS.js 1.5, navigazione Norigin, Zustand, playlist-parser e più dipendenze | Buon confronto UX/focus; **non sostituire** il nostro player con una seconda UI React senza un vantaggio provato |
| [video-dev/hls.js](https://github.com/video-dev/hls.js), push 24/10/2026 | Apache-2.0 (`LICENSE`) | Riproduzione HLS tramite MSE, demux JS di MPEG-TS | Adatto a manifest **accessibile e autorizzato**; non inventa flussi, non bypassa CORS, DRM né limiti d'incorporamento. Carico CPU/heap extra sull'LG |
| [shaka-project/shaka-player](https://github.com/shaka-project/shaka-player), push 24/10/2026 | Apache-2.0 (`LICENSE`) | DASH/HLS MSE/EME, Widevine/PlayReady ove consentiti | È **già usato** dal nostro upstream per DASH selezionati; non risolve licenze DRM assenti, geoblocchi o HTTPS player privati |
| [jellyfin/jellyfin-webos](https://github.com/jellyfin/jellyfin-webos), push 14/07/2026 | MPL-2.0 (`LICENSE`) | Client TV per media server Jellyfin | Buona ispirazione per telecomando/lifecycle, ma richiede un ecosistema server: **non** adatto al vincolo «solo TV» |
| [sharktie/lg-iptv](https://github.com/sharktie/lg-iptv), push 19/10/2026 | ISC dichiarata in `package.json`; verificare ulteriormente file LICENSE prima di riuso | Player LG più leggero basato su JavaScript/Babel | Utile come confronto delle interazioni, non serve importarlo ora |

### Vincoli webOS e incorporamento dei siti

- LG webOS 22 = **Chromium 87**, supporta HLS e MSE (documentazione LG, link sotto).
- Il player attuale usa già il video nativo dentro l'app, quindi l'integrazione ideale di nuove dirette resta **una voce M3U con URL HLS/DASH realmente raggiungibile e autorizzato**. Gli URL non funzionanti o effimeri non sono idonei per una lista stabile.
- Aprire il sito TV8 o Videogruppo dentro un semplice `iframe` **non equivale** a integrare il video: il sito può vietare il framing con `X-Frame-Options` o CSP `frame-ancestors`; possono inoltre fallire telecomando, autoplay, cookies, pubblicità, DRM, geolocalizzazione e audio/video. Non aggirare queste protezioni.
- **TV8 LCN 8**: il sito ufficiale [tv8.it/streaming](https://www.tv8.it/streaming) offre una pagina di diretta ma alla ricerca effettuata restituiva **errore video 320**. Nessun manifest aperto stabile e autorizzato è stato validato.
- **Videogruppo Piemonte LCN 12**: la [scheda ufficiale Mediapason](https://www.mediapason.it/videogruppo/) descrive LCN 12 e contiene un player in pagina, ma URL/media, autorizzazione al riuso e funzionamento nella LG non sono stati ancora dimostrati.
- [Mediapason](https://www.mediapason.it/) pubblica streaming ufficiali di alcuni canali. La presenza di un player sul sito non autorizza automaticamente la riproduzione incorporata nella nostra app.

### Decisione per questa iterazione

**Non aggiungere ora nuovi engine, iframe o flussi non verificati.** Tenere il player video esistente, correggere numerazione/LCN e accesso alla guida da Diretta; evitare il browser esterno come esperienza standard. Cercare manifest delle singole emittenti soltanto da fonti attendibili e legalmente riutilizzabili; collaudare sulla LG reale prima di qualunque promozione. Per canali senza fonte, mostrare il LCN nella guida con stato reale «sorgente video non disponibile» e accesso manuale al DVB nativo dove necessario.

### Fonti

- [LG: web engine/versioni](https://webostv.developer.lge.com/develop/specifications/web-api-and-web-engine)
- [LG: streaming protocol/DRM](https://webostv.developer.lge.com/develop/specifications/streaming-protocol-drm)
- [MDN: X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options)
- [LG upstream: native vs HLS.js](https://github.com/lennylxx/webos-iptv-player/blob/main/docs/native-vs-hls.js.md)
- [TV8 streaming](https://www.tv8.it/streaming)
- [Videogruppo ufficiale](https://www.mediapason.it/videogruppo/)
