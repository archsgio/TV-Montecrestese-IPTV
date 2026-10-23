# Audit comparativo webOS IPTV e comandi LG — 23 ottobre 2026

## Decisione

**Percorso principale consigliato: mantenere `lennylxx/webos-iptv-player` come motore di riproduzione e creare una versione personalizzata e reversibile, installabile tramite Developer Mode senza rooting.**

Motivo: il lettore attuale ha già riprodotto sulla LG numerosi canali della nostra lista, inclusi flussi e redirect misti, e l'utente ne ha confermato la stabilità funzionale su vari canali. L'obiettivo immediato è correggere tre difetti UI noti e la numerazione LCN, anziché sostituire contemporaneamente UI, parser, video e EPG. Il limite residuo dei tasti fisici è **di webOS**, non dimostrabilmente superabile da app non privilegiate.

**Percorso condizionale**: `mac-lucky/webos-iptv-native` è la migliore nuova architettura da considerare per futura migrazione, MA NON è ancora provato adatto al modello esatto della TV, né a due MPEG-DASH e quattro relinker Rai della nostra playlist. Nessun rooting basato su ipotesi modello/firmware.

## Limite ufficiale documentato da LG il 23 ottobre

https://forum.webostv.developer.lge.com/t/tv2026-impossible-to-use-number-keys/28325

Il supporto LG ha ribadito il 23/10/2026 che i tasti numerici non sono disponibili alle app terze; propone il tastierino a schermo. Un'app può possedere codice per `keydown 48..57` ma ciò NON implica che gli eventi arrivino dal telecomando della TV. Una tastiera Bluetooth/USB, il simulatore e l'app vera sono condizioni differenti.

## Dataset specifico

- Playlist confermata e preservata: `TV_Montecrestese_LCN_v7_XMLTV_TEST.m3u`, **64** canali IPTV candidati, 49 `tvg-id` preparati; EPG Rai2 allineata a **0 min**.
- Catalogo approvato **85** posizioni/canali, con numerazione personalizzata Telelombardia **72**, Top Calcio 24 **75**.
- La playlist v7 ha **57 URL HLS .m3u8**, **2 URL DASH .mpd** (LCN 22 Iris, 43 Rai Yoyo), **4 URL Rai relinker `.htm?output=7`** (LCN 23,24,25,58), **1 redirect diverso** (LCN 17); verificare l'intera catena di redirect e tutti gli stream con il lettore candidato.
- Canali confermati in riproduzione dall'utente in vari collaudi: 6 Italia 1, 13 Rete 7 Piemonte, 19 Video Novara, 46 Cartoonito, 18 Canale Italia, 37 Discovery, 53 Italia 53, 68 BOM Channel, 70 Radio Italia TV, 73 Radio Bruno TV, 96 Radio Birikina TV. I restanti non devono essere dichiarati tutti riproducibili per estrapolazione dai pallini verdi.
- Sei canali segnalati non funzionanti su LG: 14 Primantenna, 15 GRP TV, 41 K2, 44 Frisbee, 75 Top Calcio 24, 802 Rai 3 TGR Piemonte. La v8 diagnostica ha fallito tutte e tre le correzioni 15/41/802 e non va promossa a base.
- Un problema video del server remoto non è automaticamente riparato installando un player diverso. Primantenna ha restituito 404; 802 master con media playlist 404.

## Valutazione architetturale

| Progetto | Tipo / release | M3U + XMLTV | LCN reale da tvg-chno | Tasti fisici sulla TV | Maturità/criticità | Verdetto |
|---|---|---|---|---|---|---|
| [lennylxx/webos-iptv-player](https://github.com/lennylxx/webos-iptv-player) | Web app, **v1.17.0 del 20/10/2026** | Sì, già usati sulla LG | **No**, mostra `globalIdx + 1` e sintonizza con `event.number - 1`, ma il parser conserva `channelNumber` | LG li intercetta prima | Avanzata, ampia suite test, release regolari, buona continuità con lista | **Scelta principale per fork mirato** |
| [mac-lucky/webos-iptv-native](https://github.com/mac-lucky/webos-iptv-native) | Rust native/GPU, **v0.1.1 20/10/2026**, IPK ARM | Sì dichiarato | **Sì**, `channel.number`, `number::find()` | Non dimostrato | Test dell'autore C1 webOS6 e C5 webOS25; modello LG utente ancora incerto; motore HLS con FFmpeg network disabled, DASH da validare | **Seconda opzione, promettente ma più rischiosa** |
| [sharktie/lg-iptv](https://github.com/sharktie/lg-iptv) | Web app, **v1.0.32 19/10/2026** | Sì | **No**, `js/livetv/numpad.js` seleziona posizione nella lista | Non dimostrato | Issue #8 live stream freeze e #3 Back su 5.5 | Non conviene migrare rispetto alla base già funzionante |
| [ZUI-WebOS/ZUI-IPTV-Player](https://github.com/ZUI-WebOS/ZUI-IPTV-Player) | Rootless, v1.0.1 (settembre) | Sì | Non dimostrato | Non dimostrato | Issue compatibilità 4.5, minor esperienza riproduzione nota | Non prima scelta |
| [smartonaut/smartys-iptv-webos](https://github.com/smartonaut/smartys-iptv-webos) | Nuova 16/10, v1.1.2 | EPG dichiarata | Non dimostrato | Non dimostrato | README richiede pairing di servizio account/MAC e password; non prova import M3U pubbliche | Poco adatta |
| [lasharor/cleanyourtv-WebOS](https://github.com/lasharor/cleanyourtv-WebOS) | Launcher+Live TV **root**, v1.5.16 23/10 | Sì, HLS e XMLTV | **No**, numeri = posizione della playlist, non `tvg-chno` | Sì dichiarati in Live TV rooted | Modifiche di sistema invasive; problemi open del 23/10, #6 Freeze after start, #5 Not working G1, #4 webOS 5.6.2 | Non indicato come primo passo |
| [simbasjungles/free-my-tv](https://github.com/simbasjungles/free-my-tv) | Launcher rootless, v1.1.0 22/10 | **No**, non è il player IPTV richiesto | Non pertinente | Pressione lunga tasti per **aprire app**, non cambiare canale | Launcher interessante, un'altra categoria | Escluso dallo scopo |
| [ecklf/lg-luma](https://github.com/ecklf/lg-luma) | Launcher nativo root, v2.1.0 23/10 | Non pertinente | Non pertinente | Non risolve zapping IPTV | Root necessario, cambia home | Escluso |
| [brandon-irving/starter-webos-tv-app](https://github.com/brandon-irving/starter-webos-tv-app) | Template webOS 19/10 | Non player | Non pertinente | Solo gestione codici disponibili | Buoni pattern focus, deploy, test su TV | **Riferimento tecnico** |

## Punto critico del nuovo `webos-iptv-native`

Il codice `crates/screens/src/number.rs` usa il numero dichiarato dal canale (`tvg-chno`) e supporta fino a quattro cifre: è un vantaggio autentico per numerazioni 7, 9, 13, 75, 802. Il codice `crates/media/src/hls.rs` descrive un demuxer HLS in Rust su segmenti MPEG-TS/fMP4 con FFmpeg compilato senza demuxer HLS e senza network. **DASH in riproduzione non è dimostrato e va considerato rischio concreto**, specie per Iris e Rai Yoyo. `README.md` è in inglese/polacco; l'italiano è da implementare. Root non richiesto dalla documentazione dell'autore, ma un IPK nativo su architettura/firmware specifici è da verificare.

## Specifica di modifica della base attuale

1. **Focus televisivo chiaro**: separare `.active` (voce attiva/già in riproduzione) da `.focused` (destinazione attuale frecce/OK). Usare riempimento nettamente differente, bordo visibile solido >3 px, contrasto elevato, elevazione/ombra controllate per evitare due focus apparentemente identici; top tabs Diretta/Guida/Impostazioni e sidebar con focus coerente e test Magic Remote.
2. **Niente taglio ultimo elemento**: audit `css/channel-list.css` `.channel-main` overflow/padding e footer `.edit-hints` assoluto in basso; list virtualizzata con stride fisso **88 px** in `src/components/channel-list.ts`/`src/utils/virtual-list.ts`. In modalità con barra/hints usare viewport effettivo visibile o bottom safe padding includendo l'altezza footer + margine focus. Scorrere la riga selezionata interamente nel viewport; prove primo/ultimo canale, rapidi Up/Down e navigazione tab/sidebar, con risoluzione 1920x1080. Non cambiare l'altezza delle righe senza aggiornare virtualizer.
3. **LCN reali**: rendering `ch.channelNumber ?? globalIdx+1` nella lista e nell'OSD (non confondere LCN e indice), sintonizzazione per ricerca della LCN in `PlaylistService.channels` quando un evento numerico arriva, gestire `802` fino a tre cifre indipendentemente dal numero totale 64, lasciare buchi senza placeholder; CH+/CH- passa solo tra canali presenti. Fallback esplicito per fonti prive di numero. Test 7,9,10,13,17,41,44,72 assente,75,802.
4. **Tastierino a schermo no-root**: overlay numerico 0–9 richiamato con tasto disponibile, navigate Up/Down/Left/Right/OK, conferma diretta del numero; mostra anteprima del nome LCN e avviso 'nessun canale 72' senza saltare arbitrariamente. Questa parte è affidabile anche se webOS trattiene i tasti numerici fisici.
5. **Compatibilità**: nessun cambio alla configurazione EPG, alle liste, al player video e ai sorgenti flussi; ripristino immediato versione originale se l'app custom fallisce. Identificatore diverso per app custom così che possa coesistere con originale. Lingua italiana.
6. **Collaudo automatico**: typecheck, lint, unit test di LCN/overlay, Playwright 1920x1080 con screenshot dei focus e verifica geometrica che l'elemento selezionato non sia tagliato; controllo CSS su Chromium del webOS target; poi singolo collaudo finale su LG reale.

## Scelta root / non root

- Prima provare **solo una soluzione controllata**, il fork migliorativo del lettore attuale, che non richiede root, e non fare installazioni a raffica.
- Root è giustificabile soltanto se avere i tasti numerici fisici è **inderogabile** e se marca/modello esatti, OTAID e firmware supportano un exploit verificato. Registrato firmware 04.60.91, ma il **modello non è stato confermato**; è stata ipotizzata famiglia 24TQ510S senza certezza. Strumenti root: https://cani.rootmy.tv, https://www.webosbrew.org/rooting, lginputhook e Magic Mapper.
- Root comporta rischio concreto di impossibilità a usare TV/telecomando se la mappatura cambia in modo errato, fragilità aggiornamenti, SSH root da proteggere, eventuale blocco del sistema. Anche con root **non è dimostrato un reindirizzamento affidabile dei numeri fisici alla app IPTV specifica preservando DTT fuori app**.
- Nessuna proposta di eseguire rooting fino ad audit compatibilità hardware e strategia di recupero.

## Prove di accettazione

- Focus chiaramente univoco nei tre contesti: top bar, sidebar, canali.
- Nessuna riga parzialmente fuori schermo quando si scorre a prima/ultima, con e senza barra azioni.
- Numeri LCN mostrati: 7 LA7, 9 NOVE, 13 Rete 7; 72 assente (catalogo lo prevede, ma playlist v7 no), 75 Top Calcio presente ma stream non funzionante, 802 Rai 3 Piemonte presente ma stream non funzionante.
- Tastierino virtuale raggiunge per LCN e messaggio corretto per assenti; numeri hardware soltanto se il sistema li inoltra realmente, condizione distinta.
- Nessuna regressione dei canali già funzionanti; guida XMLTV Rai2 21:20 sincronizzata, offset **0 min**.
- Versione originale affiancata per ritorno sicuro.
- Compatibilità TV basata su modello reale confermato, non soltanto firmware.

## Fonti primarie

- LG forum 23/10: https://forum.webostv.developer.lge.com/t/tv2026-impossible-to-use-number-keys/28325
- Documentazione Magic Remote: https://webostv.developer.lge.com/develop/guides/magic-remote
- Repos, README, codice e release GitHub dei progetti nella matrice.
- Homebrew native Dev Mode: https://www.webosbrew.org/develop/guides/env-setup/
- Can I Root: https://cani.rootmy.tv/

## Approfondimento: Hearth (rudra-avatar/Hearth) — 23 ottobre 2026

- Repository https://github.com/rudra-avatar/Hearth, creato 17 ottobre 2026; release v1.1.0 pubblicata 22 ottobre 2026, MIT, Preact/TypeScript, IPK pubblico.
- È **un launcher**, non un player IPTV; non ha il supporto M3U, `tvg-chno`, LCN, XMLTV o i decoder HLS/DASH del nostro progetto. Non può sostituire l'app per guardare i canali.
- Senza root è una normale app in Developer Mode, con la sola schermata di lancio e servizi di base. Il README stesso dichiara che il funzionamento sul TV *non rooted* **non è ancora confermato sul campo**. Gestione Home, autostart, aggiunta fra gli input, lettura lista app reali e sfondi USB richiedono root + Homebrew Channel.
- `src/hooks/useKeys.ts`: la mappa dei tasti gestiti comprende frecce, Enter e Back, **non i numeri 0–9**; non offre un workaround per il tastierino numerico della LG.
- `src/components/OptionList.tsx`: esempio concreto per il **problema della riga tagliata**. Misura `window.innerHeight - getBoundingClientRect().top - BOTTOM_SPACE` con `BOTTOM_SPACE = 60`, verifica `row.offsetTop`, `row.offsetHeight` e include **8 px** per il focus. Aggiorna il translateY così la riga attiva è totalmente visibile. **Riutilizzare il principio nella nostra lista virtuale, non il componente**.
- `src/components/Row.tsx`: scorrimento orizzontale via `translate3d` con tile centrata e limite ai bordi; sulle frecce tenute premute preferisce movimento lineare corto (150ms) invece di continui easing che generano scatti.
- `src/theme/global.css`: separa stati `tab--active` e `tab--focused`; tile focus con anello bianco di 5 px, ingrandimento leggero e transizioni su transform/opacity (evita repaint pesante). **Adattare stile focus per Diretta/Guida/Impostazioni, sidebar e lista canali**.
- `src/homehook/README.md`: il bottone Home si fa reindirizzare da un helper background *root* che osserva app in primo piano; questa architettura **non** intercetta tasti numerici e non risolve il cambiocanale IPTV.
- Issue repository aperte per webOS 3.x e recensioni su webOS C5; il README e il changelog contengono alcune indicazioni discordanti sui numeri interni webOS testati. Non assumere compatibilità del modello specifico.

**Verdetto: OTTIMO DONATORE DI IDEE UI, non da installare per risolvere focus/scroll interni dell'app IPTV o numeri fisici.** Include soluzioni semplici e verificabili, da integrare nel fork selettivamente con test Playwright/Chromium legacy. Non cambia la raccomandazione principale: fork del lettore esistente + eventuale tastierino virtuale; evitare root senza necessità provata.


## Studio fattibilita: numeri fisici solo dentro IPTV (23 ottobre 2026)

### Conclusione verificata

Un launcher Preact/webOS non privilegiato (Hearth, Free My TV, webOS-vibehack) non può autonomamente far arrivare alla sua UI i tasti numerici fisici riservati da webOS. Il supporto sviluppatori LG lo conferma il **23 ottobre 2026**: https://forum.webostv.developer.lge.com/t/tv2026-impossible-to-use-number-keys/28325 .

L'idea di *modificare prima dell'installazione* è praticabile **solo se la distribuzione comprende anche una componente di intercettazione privilegiata/root**, ad esempio un servizio di input di sistema. Il launcher da solo non costituisce escalation di privilegi.

### Rilevamento concreto in Magic Mapper (supera l'ipotesi generica precedente)

- Repository https://github.com/andrewfraley/magic_mapper
- `magic_mapper.py`, `BUTTONS`, tasti codice evdev Linux **2..11 = 1..0**; supporta anche IR.
- `magic_mapper.py`, `handle_event()`: acquisisce l'app in primo piano con `luna://com.webos.applicationManager/getForegroundAppInfo`; filtra azioni in base a `appId`; se nessuna corrisponde, in exclusive mode **rimanda il normale evento all'OS**. Gli eventi mappati non vengono inoltrati alla UI di webOS; l'azione specificata viene eseguita sul rilascio del tasto.
- `README.md`, sezioni **Configuring buttons** e **IR input**: confermano regole `appId`, default pass-through e `exclusive_mode` necessario a impedire l'azione nativa sul DTT.
- Questo dimostra **il prerequisito del controllo per applicazione**, ma non ancora un collegamento con la nostra IPTV, né l'effettiva compatibilità con il telecomando/firmware LG dell'utente.
- `afonsojramos/magic-mapper-webos` è un'interfaccia che avvia una versione di Magic Mapper e fornisce gestione e ripristino; richiede comunque rooted TV.
- `Simon34545/lginputhook` offre analoga intercettazione root con possibile rimappatura; per questo scenario Magic Mapper ha documentazione più esplicita sulle condizioni di app foreground.

### Architettura proposta (DA IMPLEMENTARE E VERIFICARE)

1. Preparare un fork dell'app `lennylxx/webos-iptv-player` con ID distinto, mantenendo il playback video e XMLTV. Correggere focus, scrolling e LCN da `channelNumber`; supportare comando interno `tuneLcn(N)` senza basarsi su indice.
2. Riutilizzare/estendere il servizio Node.js incluso in `bundled-service/src/lan/server.ts` e `docs/lan-service.md`: questo ha già un server HTTP e la sottoscrizione Luna `serviceEvents` in foreground. Creare **un endpoint riservato al loopback**, limitato a cifre 0..9, con controllo del mittente ed autenticazione locale, e inviare `digit` alla UI tramite eventi del servizio. Non esporre la rotta all'intera LAN.
3. Su televisore rootato e solo dopo verifica di compatibilità, configurare un input mapper come Magic Mapper che riconosca `appId` del nostro fork IPTV. **Solo durante la sua visualizzazione**: non inoltra il comando numerico al DTT, ma invia la cifra al servizio loopback. Per tutte le altre app: nessuna azione personalizzata e **passaggio trasparente all'OS**. Predisporre restituzione automatica comportamento stock e un interruttore OFF in caso di problemi.
4. Il lettore accumula fino a 3-4 cifre (LCN massimo: 802), mostra un OSD di anteprima e risolve il numero per `tvg-chno`. Buca 72 -> «canale non presente in playlist», non seleziona una riga arbitraria.
5. Test di sicurezza: rilascio del grab sugli input in crash/stop, TV DTT normale quando IPTV chiusa, nessuna interferenza con Power/Back/OK/volume, pressione lunga non alterata, no binding rete visibile ad altri dispositivi, falsificazione comandi bloccata.

### Avvertenze e sequenza dei controlli

- Questa architettura **non è una funzione già pronta**, quindi non dichiarare che qualsiasi launcher modificato offre subito il tastierino desiderato.
- Le chiamate `curl` per ogni cifra possono aumentare la latenza; preferire un bridge localhost persistente e verificare ordine e tempi quando l'utente digita due o tre cifre rapidamente.
- Leggere il modello preciso, OTAID e firmware via strumenti di sola consultazione e verificare https://cani.rootmy.tv. Il firmware 04.60.91 senza modello non basta.
- Se il root non è compatibile o i rischi non sono accettati, fallback **tastierino a schermo D-pad**, che funziona senza accesso privilegiato.
- Non serve Hearth per implementare questo schema. Hearth può soltanto offrire la Home personalizzata, separata dalla questione dei tasti.
