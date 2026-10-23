# IPTV Montecrestese custom: primo pacchetto compilato (23 ottobre 2026)

## Stato reale

Il ramo `feature/webos-iptv-lcn-focus` conserva tutte le playlist preesistenti e porta un [patch manifest](webos-player-custom/patch-manifest.json) versionato che modifica il codice di `lennylxx/webos-iptv-player` al tag **v1.17.0**, lasciando intatti i sorgenti video e l'EPG.

**Build GitHub Actions n. 2: riuscita**:
https://github.com/archsgio/TV-Montecrestese-IPTV/actions/runs/40024638137

- Test: **3.389 passati**, **4 skipped**, **150 file di test**.
- `npm run package`: superati lint, typecheck, controllo compatibilità Chromium 53, service build/smoke, impacchettamento IPK.
- Pacchetto: `com.archsgio.iptv_1.17.0_all.ipk` (circa 712 KiB); sotto `IPTV-Montecrestese-custom-IPK` come artifact della build.
- AppId: `com.archsgio.iptv`; serviceId: `com.archsgio.iptv.service` (diversi dalla versione originale).
- L'IPK **non è stato installato sulla TV** e quindi le prove su tasti/scroll/stream webOS non sono ancora completate.
- Una prima esecuzione aveva 3.386 test passati e due aspettative incompatibili con i nuovi comportamenti; dopo l'aggiornamento intenzionale dei test la seconda è verde.

## Funzioni implementate

1. Focus giallo ad alto contrasto e sfondo blu nelle liste e nella barra Diretta/Guida/Impostazioni; distinzione da voce attiva e canale in riproduzione.
2. Calcolo viewport del canale con margine inferiore e spazio per barra/hints; verifica di visibilità per le frecce e maggior spazio di scorrimento alla fine.
3. LCN reale da `tvg-chno`, anche per liste con buchi e numeri superiori al numero totale di righe; 802 corretto e 72 assente/non inventato in playlist v7.
4. Tastierino virtuale azionato dal tasto **GIALLO** durante il video live, frecce/OK/Indietro, messaggio per LCN assente; resta il normale OSD giallo durante contenuti VOD.
5. Il video e le playlist restano quelli dell'upstream: non vengono aggiunte origini video nuove o modificati stream della v7.

## Prove finali ancora necessarie

- Installare **solo la build custom** come nuova app, senza eliminare l'originale, e caricare v7 XMLTV con offset EPG 0.
- Verificare con le frecce almeno il primo e ultimo canale, anche con barra inferiore presente. Se il focus viene tagliato, raccogliere fotografia e indicare la modalità schermo.
- Verificare contrasto focus dei tab superiore e colonna sinistra; tastierino GIALLO + frecce/OK: LCN 13 e 802. Il secondo può non riprodursi per URL difettoso, ma deve essere trovato correttamente dalla UI.
- Verificare senza regressioni i canali di cui l'utente ha confermato audio+video: 18 Canale Italia, 37 Discovery, 53 Italia 53, 68 BOM, 70 Radio Italia TV, 73 Radio Bruno TV, 96 Radio Birikina TV.
- EPG Rai2: orari sincronizzati, correzione 0 minuti.
- I tasti numerici **fisici** restano riservati da webOS: lo sblocco condizionale non è ancora pronto né installato.

## Rooting sospeso per compatibilità

L'unico dato già noto è il firmware **04.60.91**. Il produttore lo distribuisce anche per la famiglia 24TQ510S, **ma non identifica l'esatto modello della TV dell'utente**: https://www.lg.com/ro/suport/produs/lg-24TQ510S-PZ.AEU

Serve leggere il vero modello e (se disponibile) OTA ID. Prima del root consultare https://cani.rootmy.tv e verificare che una tecnica sia specificamente supportata, con un percorso di ripristino. Il componente `andrewfraley/magic_mapper` sa limitare i numeri 0–9 al foreground app, ma integrare un bridge locale per portare la cifra al nostro lettore è un lavoro separato e non ancora eseguito.

## Costi

Repository pubblico; job eseguito su standard runner `ubuntu-latest`. Secondo le regole GitHub Actions i runner standard per progetti pubblici non hanno addebito di minuti. Nessuna release pubblicata, nessun piano a pagamento richiesto. **Build n. 3 riuscita**: https://github.com/archsgio/TV-Montecrestese-IPTV/actions/runs/40024927430 . Artifact `IPTV-Montecrestese-custom-IPK` (ZIP ~728 KB), disponibile fino al **6 novembre 2026 ore 21:13 UTC** (22:13 ora italiana). Contiene `com.archsgio.iptv_1.17.0_all.ipk`. Nessuna release ufficiale creata, nessun rooting eseguito.

## Riferimenti
- [Documentazione e patch](webos-player-custom/README.md)
- [Audit comparativo](AUDIT_COMPARATIVO_APP_WEBOS_2026-10-23.md)
- [Playlist v7 con XMLTV](TV_Montecrestese_LCN_v7_XMLTV_TEST.m3u)
