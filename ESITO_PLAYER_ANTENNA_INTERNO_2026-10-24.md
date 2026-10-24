# TV Montecrestese — player antenna integrato sperimentale (24 ottobre 2026)

## Build installabile verificata
- Branch: `feature/webos-iptv-lcn-focus`.
- Commit applicativo: `d866f1383973fcd5ae47caef0f850ee3c272c5aa`.
- GitHub Actions run: https://github.com/archsgio/TV-Montecrestese-IPTV/actions/runs/40090954283 — **completed/success**.
- Artifact ID: **12559425157** (`IPTV-Montecrestese-custom-IPK`), scade il 7 novembre 2026 alle 11:44 UTC.
- IPK effettiva estratta dall'artefatto: `com.archsgio.iptv_1.17.0_all.ipk` (736924 byte), SHA256 **`5e3c1b6b7cd77b498aa658526bc3fd4fdeaf679f6008db2c664b700a7b4304c8`**.
- Verifica locale: struttura ar con `debian-binary`, `control.tar.gz`, `data.tar.gz`; appinfo ID `com.archsgio.iptv`, titolo `IPTV Montecrestese`, versione `1.17.0`; JS pacchettizzato contiene `tv://` e `service/webos-broadcast`; CSS incorporato. Controlli CI: TypeScript, lint, unit tests, package, verify-ipk.sh tutti superati.
- Una sola nuova esecuzione CI per questo aggiornamento. Playlist v10/v9/v7 invariata, nessuna dipendenza nuova, `main` invariato.

## Novità
Il menu per LCN senza streaming verificato (es. 8 TV8, 12 Videogruppo) propone la nuova opzione **«Prova antenna integrata (resta nell’app · sperimentale)»**, prima dell'apertura del televisore terrestre o del sito ufficiale esterno. Questo fa comparire un riquadro <video> usando il tipo speciale webOS `service/webos-broadcast` e l'URI `tv://` senza aprire il browser o un servizio locale. Il riquadro mostra la LCN richiesta a scopo informativo, ma **non pretende che il tuner sia già su quella LCN**. La navigazione BACK/GIALLO chiude soltanto il riquadro, ritorna nel selettore sorgenti e libera la risorsa video. Numeri fisici non intercettati dal riquadro (webOS potrebbe gestirli per DTT).

## Limite tecnologico confermato
- La normale API LG webOS per app Developer Mode non consente di elencare/selezionare un canale DTT. SSAP esterno `ssap://tv/openChannel` esiste per client **abbinati** su LAN, ma le app webOS stesse che tentano il socket verso il TV possono subire errore `1008 invalid origin`; non inserirlo senza una prova positiva sul dispositivo e non fare bypass delle policy.
- `tv://` è una funzionalità **non documentata ufficialmente**, menzionata da Homebrew. Potrebbe non funzionare sul modello LG 24TQ510S-WZ webOS22; solo il collaudo hardware può confermare video/audio.
- TV8 sito ufficiale ha restituito errore player 320; stream Sky HLS trovati in liste terze sono protetti da token / segnalati blocked, non inseriti. Videogruppo ufficiale incorpora un iframe YouTube (non dimostrato essere la diretta del canale). Non è stato trovato e testato un HLS/DASH ufficiale stabile per LCN 8 o 12. Perciò **85 righe non significano 85 video funzionanti**.
- La voce «Apri sito ufficiale» è ancora presente **solo come scelta esterna esplicita**; la nuova opzione antenna non la richiama mai.

## Prova TV da fare dopo installazione
1. Aprire Diretta > Tutti, confermare 85 LCN.
2. LCN 8 TV8 > OK > «Prova antenna integrata»: il video deve restare nell'app. Se mostra un canale diverso, tentare con tasto fisico `8`; verificare se il tuner cambia senza uscire. **Non assumere** che funzioni.
3. BACK: deve restituire il menu sorgenti, senza uscire dall'app. Ripetere su Videogruppo 12 con tasto fisico `12` se la LG supporta ingresso numerico.
4. Se lo schermo resta nero o appare errore, annotare il messaggio; non equivale a mancanza di canale in antenna.
5. Verificare un vero IPTV 13 o 83 (immagine/audio), focus su Diretta e YELLOW/GREEN. Sui 8/12 la navigazione al browser continua ad essere solo un fallback esplicito.
6. Installazione IPK via webOS Dev Manager; **Mac/PC non necessari durante l'uso**.

## Fonti tecniche verificate
- https://www.webosbrew.org/develop/guides/web-app/ (documenta `tv://` con `service/webos-broadcast`).
- https://forum.webostv.developer.lge.com/t/channels-with-os-6-53-47/28057 (LG: broadcast APIs non esposte).
- https://forum.webostv.developer.lge.com/t/socket-connection-to-lg-tv/3360 (WebSocket dalla stessa app TV: origin invalida 1008).
- https://www.mediapason.it/videogruppo/ (sito broadcaster LCN 12).
- https://www.tv8.it/streaming (sito ufficiale LCN 8).
