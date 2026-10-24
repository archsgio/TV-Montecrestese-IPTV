# Decisione tecnica — Diretta unica 85 LCN e sorgenti video

**Data di verifica:** 24 ottobre 2026  
**Progetto:** IPTV Montecrestese (ambito personale)  
**Hardware:** LG 24TQ510S-WZ, webOS 22  
**Ramo:** `feature/webos-iptv-lcn-focus`

## Stato GitHub verificato prima di modificare
- HEAD di partenza: `bc687e91c67ea849016ab73d0c6d3c6943b766a9`.
- Ultima CI riuscita: https://github.com/archsgio/TV-Montecrestese-IPTV/actions/runs/40083310040, commit `1298f6a33b086f046bd1bdc383aac81519c16767`, artifact `12555598168`, scadenza 2026-11-07.
- Diff dal commit della CI a HEAD: **quattro commit esclusivamente documentali**, nessun sorgente app aggiornato.
- CI verde significa lint, TypeScript, test, packaging e controlli IPK completati; NON significa collaudo sulla LG.
- Ultimo collaudo fisico riportato: playlist v10 importata, 59 canali nella schermata Diretta per deduplicazione di 13/83, correzione già implementata sulla nuova build ma non ancora provata sulla LG; catalogo Hybrid da 85 LCN, tre sospetti nel precedente controllo. Non sostituire i dati osservati con stime.

## Confronto open source aggiornato, con LICENSE effettivamente letto
| Repository | Attività verificata al 24/10/2026 | Licenza dal file LICENSE | Caratteristiche | Decisione |
|---|---|---|---|---|
| https://github.com/lennylxx/webos-iptv-player | push 22/10; 6 issue aperte, fra cui #69 prestazioni TV economiche | Apache-2.0 | Già upstream v1.17.0, player HTML5 nativo, lista virtualizzata, EPG, HLS/DASH | **Conservare e adattare**, rischio minimo sulle sorgenti già viste |
| https://github.com/ZUI-WebOS/ZUI-IPTV-Player | push 19/10; issue #3 webOS 4.5 aperta, v1.0.1 con correzioni D-pad | MIT | React, Zustand, Norigin focus, hls.js; più layer runtime, prove fisiche su modello diverso | Studiare gestione focus e ritorno dal player, non migrare in blocco |
| https://github.com/mac-lucky/webos-iptv-native | push 20/10; nessuna issue aperta nel riepilogo GitHub | GPL-3.0 | Rust/player nativo, numerazione LCN del modello, possibili limiti DASH e specificità architettura | Solo riferimento: **licenza copyleft da valutare prima di riuso** e nessuna prova sulla nostra LG |
| https://github.com/video-dev/hls.js | push 24/10 | Apache-2.0 (testo del LICENSE) | HLS via MSE; dipendenza da manifest accessibile, compatibilità e CORS; CPU/RAM aggiuntive | Non introdurlo nel percorso TV nativo senza prova misurata |
| https://github.com/shaka-project/shaka-player | push 24/10 | Apache-2.0 | MSE/EME DASH/HLS, già usato a richiesta nell'upstream per specifici casi | Non duplica lo stream né concede licenze DRM |

Controllati il file LICENSE, i metadati repository GitHub e le issue; nessuno di questi progetti sblocca magicamente i numeri fisici intercettati dal firmware LG. I push non certificano compatibilità sul modello esatto.

## Diretta unificata: decisione d'architettura

**La schermata principale «Diretta / Tutti» deve mostrare direttamente e ordinatamente le 85 posizioni di `HYBRID_CATALOG`, incluse 8 TV8 e 12 Videogruppo.** La voce «Guida completa TV · 85 LCN» nella build precedente era un collegamento, non il requisito finale.

### Implementazione proposta, senza stream segnaposto
1. **Sorgente dati unica:** usare `webos-player-custom/hybrid-catalog-source.ts` come anagrafe LCN; collegare per LCN esatta le sole righe che hanno una `Channel` reale da `PlaylistService.channels`. Non inserire `about:blank`, `data:`, URL fasulle, doppi canali o placeholder nella M3U; preservare 13 e 83 se condividono l'HLS.
2. **Interfaccia:** introdurre nella `ChannelList` un modo `builtin:all` a 85 righe, riutilizzando `VirtualList`, stride di 88 px, scorrimento/focus esistenti. Preferiti, modifiche alla playlist, Recently Watched, gruppi e anteprima continuano a usare le `Channel` reali e non le righe virtuali. Distinguere `catalog:lcn` da `ch:index` nelle chiavi del focus. Nessun ridisegno integrale per ogni freccia.
3. **OK su una riga IPTV candidata con URL effettivo:** passare direttamente al player integrato, con un OK, soggetto ai controlli esistenti di privacy/parental control/health. Non annunciare «video disponibile» fino all'evento `playing`.
4. **OK su riga senza stream, o stream bocciato:** pannello interno compatto con indicazione «Video IPTV non disponibile/verifica necessaria». La TV terrestre nativa è un'alternativa esplicita; `com.webos.app.livetv` apre l'**ultimo canale reale della LG**, NON necessariamente l'LCN evidenziata. Se il permesso `-104` blocca, mostrare messaggio praticabile, senza loop.
5. **Siti esterni:** restano eventuale voce secondaria chiaramente etichettata, MAI attivati tramite normale OK di riproduzione. Nessun iframe non verificato e nessun browser LG come percorso ordinario.
6. **Cambio canale:** CH+/CH− durante la riproduzione continua temporaneamente sui canali IPTV riproducibili; prima di estenderlo ai 85 numeri, definire scelta esplicita sulle posizioni senza video e verificare l'effetto sul focus. Non aprire in automatico Live TV e non cambiare sorgente silenziosamente.
7. **Prestazioni/rollback:** conservare la playlist v10 e la v7, test dei primi/ultimi LCN, salti numerici, 13/83, 8/12, collaudo focus via LG; non cambiare upstream tag durante questa iterazione.

### Test minimi necessari prima di promuovere la nuova IPK
- Le 85 righe appaiono **in Diretta** anche se la playlist corrente ne contiene 60 o 59, ordinamento e LCN reali; nessuna voce fittizia in `PlaylistService.channels`.
- LCN 8 e 12 risultano visibili e selezionabili senza video nero o apertura browser automatica.
- Due distinti LCN 13 e 83 possono selezionare lo stesso URL; l'EPG rimane associato alle identità e non al solo URL.
- OK da riga IPTV -> riproduzione interna; Back ripristina la selezione. Focus reale D-pad, ultimo elemento tutto visibile e no loop scroll; controllo delle condizioni di lista vuota.
- Numerazione tastierino virtuale, GIALLO/VERDE, preferiti, sidebar, salvataggio ultima sorgente, salute canali e impostazioni non regrediscono.
- Prova LG fisica della build candidata: video+audio, primo frame, cambio canale, Wake/Resume, errore `-104` se si presenta, nessuna dipendenza dal Mac.

## TV8 LCN 8 e Videogruppo LCN 12: matrice evidenze
| LCN | Fonte ufficiale | Evidenza disponibile | Conclusione |
|---|---|---|---|
| 8 TV8 | https://www.tv8.it/streaming | Pagina live ufficiale, in una scansione ha esposto errore player 320; URL firmati `hdnts/hdnea` in playlist terze non provati come stabili/autorizzati | **Nessun manifest integrabile verificato. Non promuovere a IPTV** |
| 12 Videogruppo | https://www.mediapason.it/videogruppo/ | Pagina ufficiale dell'emittente; TVdream dichiara presenza di player fornito dal gruppo, senza conferma di componente embeddabile o manifesto riutilizzabile su LG | **Nessun stream integrabile verificato. Non equiparare la pagina a un video** |

### Condizioni per aggiungere un nuovo flusso al player
Evidenza della fonte ufficiale o permesso di riuso; manifesto HTTPS stabile (HLS/DASH) non dipendente da sessioni/tokens di terzi; verifica risposte e compatibilità con webOS 22 (codec, segmenti, redirect, CORS, DRM); prova sulla TV con evento `playing` e audio; rollback documentato. Autorizzazione al sito web ≠ autorizzazione all'embed del suo video.

## Decisione esecutiva
**Non migrare player, non aggiungere HLS.js/iframe, non alterare M3U v10.** Il primo intervento software deve essere la lista primaria unificata 85 LCN con modello dati separato da `PlaylistService`, test mirati, solo dopo nuova CI e collaudo LG.

Questo documento è una decisione di progettazione, non una certificazione di una nuova funzione installata.

## Documenti da mantenere
- `PASSAGGIO_NUOVA_CHAT_IPTV_2026-10-24.md`
- `RICERCA_OPEN_SOURCE_PRIMA_DI_IMPLEMENTARE.md`
- `VALUTAZIONE_VISUALIZZATORE_INTERNO_2026-10-24.md`
- `OBIETTIVO_ESPERIENZA_TV_2026-10-24.md`
- `COLLAUDO_LG_SENZA_MAC_3_PROVE.md`

Fonti ufficiali webOS: https://webostv.developer.lge.com/develop/specifications/streaming-protocol-drm e https://webostv.developer.lge.com/develop/specifications/web-api-and-web-engine.
