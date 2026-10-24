# Videogruppo 12 e TV8 8: esperienza senza browser esterno
24 ottobre 2026 — LG 24TQ510S-WZ, webOS 22, IPTV Montecrestese

## Requisito non negoziabile

**La visualizzazione dei canali deve avvenire nel player di IPTV Montecrestese, con un solo OK e controlli del telecomando, senza uscire nel browser LG.** Le pagine web esterne sono una soluzione eccezionale esplicitamente dichiarata tale, non una modalità equivalente al digitale terrestre.

## Tecnologie verificate
1. **HLS e HTML5 video**: LG webOS 22 supporta streaming HLS e codec/DRM compatibili. È la scelta primaria. Abbiamo già un player HLS nativo e 60 canali candidati in M3U, non serve aggiungere un secondo lettore.
   Fonte ufficiale: https://webostv.developer.lge.com/develop/specifications/streaming-protocol-drm
2. **Incorporamento di player autorizzati**: è possibile solo quando l'emittente offre un componente di riproduzione embeddabile per terzi che funziona su Chromium 87 e accetta le politiche iframe. L'incorporamento della **pagina del sito** non equivale all'incorporamento del suo player. Un sito con `X-Frame-Options` / CSP `frame-ancestors` restrittivi vieta i frame: non tentare bypass.
   Fonte tecnica: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors
3. **Video digitale terrestre nel DOM**: Homebrew descrive l'interfaccia non documentata `<source type="service/webos-broadcast" src="tv://">`. È un possibile esperimento separato su LG fisica. **Non** si è verificato che il tuner possa essere impostato da una normale app tramite LCN, e non è stato provato sul modello dell'utente; non attivarlo di default.
   Fonte: https://www.webosbrew.org/develop/guides/web-app/

## Stato per canale
| LCN | Emittente | Risorsa ufficiale | Player diretto integrabile confermato? | Trattamento |
|---|---|---|---|---|
| 8 | TV8 | https://www.tv8.it/streaming | **No**. La pagina mostra la diretta, ma non è stato identificato un componente standalone con permesso di embed o un HLS pubblico/stabile autorizzato. | LCN presente nella guida 85; opzione antenna nativa; browser solo *alternativa esterna* |
| 12 | Videogruppo Piemonte | https://www.mediapason.it/videogruppo/ | **No**. Pagina ufficiale con contenuti incorporati (riscontrato iframe YouTube), ma nessuna prova che il video incorporato sia la diretta 12, né che sia fruibile come player TV. | LCN presente nella guida 85; opzione antenna nativa; sito web etichettato **informativo** |
| 13 e 83 | Rete 7 Piemonte / Piemonte+ | Stream HLS identico già in playlist v10 | **Sì come sorgente candidata**; lo stesso media mantiene entrambi gli LCN nell'elenco. | Due canali distinti che condividono il video; nuova build elimina de-duplicazione per LCN differente |

## Decisione di progettazione

- Non mettere un iframe di `tv8.it` o `mediapason.it` nel lettore predefinito. Potrebbe essere bloccato o mostrare una pagina con pubblicità/cookie/menu e senza video controllabile.
- Integrare le trasmissioni nel player HTML5/HLS già presente **solo dopo** verifica su LG dell'effettivo media, delle condizioni di utilizzo e della stabilità dell'indirizzo, evitando URL temporanei/firmati recuperati da sessioni private.
- Quando l'HLS diretto non è disponibile, segnalare **sorgente IPTV assente** e non spacciarne la scheda web per trasmissione live. L'antenna LG può riprendere il suo ultimo canale senza Mac, ma non garantisce che sia LCN8/12.
- Mantenere il link del sito come **ultima alternativa esterna visibilmente etichettata**, non avviarlo automaticamente e non salvarlo come canale confermato visto.
- Nell'interfaccia **Diretta** rendere immediatamente accessibili tutte le 85 LCN tramite scorciatoia senza dover avviare un canale. Questa funzionalità è inclusa nel patcher del ramo.
- Prima di sperimentare player esterni dentro l'app, preferire una prova isolata con una singola emittente che **pubblichi una modalità embed esplicita**. Misurare se autoplay, BACK e D-pad funzionano; una pagina che si limita a caricarsi non conta come video riuscito.

## Verifica su TV

- Riproduzione di LCN 13 con tasto OK e ritorno BACK.
- Guida 85-LCN da Diretta e presenza 8 e 12, senza URL fake.
- Verifica 13/83 come due numeri distinte dopo **aggiornamento esplicito dei dati playlist**: la cache precedente può continuare a contenere 59 elementi fino al refresh.
- Prima di promuovere TV8 e Videogruppo a sorgenti dirette, occorre un manifesto video ufficiale e visione fisica con audio/video.

**Limite:** al 24/10/2026 non posso affermare che TV8 o Videogruppo dispongano di uno stream diretto fruibile fuori dai propri player web. Implementare un iframe cieco oggi sarebbe una regressione rispetto all'obiettivo di semplicità.
