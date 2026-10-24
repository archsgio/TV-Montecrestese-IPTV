# Esito implementazione Diretta unica 85 LCN — 24/10/2026

## Stato verificato GitHub
- Ramo: `feature/webos-iptv-lcn-focus`.
- Commit applicativo **`942440928f5e75691a68f2d6c0a6c1e5a70832f8`**.
- Pipeline: https://github.com/archsgio/TV-Montecrestese-IPTV/actions/runs/40088324252
- Run **40088324252**, conclusa **success** alle 2026-10-24 11:05:22 UTC.
- Verificati `apply-patches`, `apply-hybrid`, `apply-unified-lcn` (dry-run e applicazione), TypeScript, lint, tutti i test inclusi i nuovi regressivi, package, verifica IPK effettivo, ID applicativo e servizio separati.
- Artifact **`IPTV-Montecrestese-custom-IPK`**, ID **`12557873322`**, dimensione ZIP **735545 byte**, **non scaduto** alla verifica, scadenza **2026-11-07 11:05:17 UTC**.
- `main` e le playlist v10/v7 non sono stati modificati. GitHub Free: questa iterazione ha generato una sola nuova esecuzione CI.
- **Non installato ancora né collaudato fisicamente sulla LG.**

## Funzionalità implementata
- Nella vista «Diretta» / gruppo «Tutti» senza filtro playlist, lista virtualizzata dei **85 LCN**; dato ricavato da `HYBRID_CATALOG`, collegato alle sorgenti IPTV **solo per LCN dichiarata**, senza righe fake nel servizio playlist.
- `enableUnifiedLcn: true` è un'opzione attivata soltanto nell'app personalizzata: gli altri utenti/test e le altre viste continuano a usare le liste originali.
- LCN 8 TV8 e 12 Videogruppo appaiono anche quando non esiste video integrato; OK apre il selettore fonti interno, **non** il browser. L'apertura LG Live TV, se richiesta, è sempre l'ultimo canale terrestre, non la LCN selezionata.
- OK su riga con sorgente IPTV candidata avvia il consueto callback player interno; l'effettivo primo frame, audio e tempo di zapping sono da provare sulla TV.
- Numeri 13 e 83 distinti nonostante HLS uguale, 802 non riattivato dopo test negativo. Le voci non ufficialmente validate non sono promosse a riproducibili.
- Regressioni pure sul mapping 85 LCN e regressione UI effettiva sul gruppo tutti e su OK per LCN 8/13.
- Conservati tasti verdi/gialli, Hybrid Guide, memoria ultimo canale e diagnostica, senza introdurre HLS.js, iframe o root.

## Collaudo fisico essenziale con telecomando LG
1. Installare via webOS Dev Manager l'IPK della run **40088324252**, senza cancellare l'app precedente né la playlist precedente. Il Mac serve **solo all'installazione**, non alla visione.
2. In «Diretta» selezionare **Tutti** (e non un filtro per una playlist): verificare contatore **85**, numeri in ordine, **8 TV8**, **12 Videogruppo**, **13 Rete 7**, **83 Piemonte+**, **802 Rai3**.
3. Su TV8 e Videogruppo premere OK: deve comparire un pannello interno di scelta con video IPTV non disponibile. Nessuna pagina web deve aprirsi automaticamente.
4. Su LCN 13 premere OK: controllare **video e audio effettivi dentro l'app**. Tornare e controllare che focus e scorrimento non si perdano; ripetere su 83.
5. Verificare su/giù e ultimo LCN 802 per clipping, focus e assenza schermo nero. Verificare tasti GIALLO/VERDE, ripresa ultimo IPTV e dati diagnostici.
6. Apertura antenna LG è una **prova distinta**, manuale, con possibile errore privilegi `-104`. Non dichiarare che sintonizza direttamente la LCN scelta.

## Limiti ancora aperti
- **TV8 (8) e Videogruppo (12): nessun manifesto HLS/DASH autorizzato, stabile e funzionante sulla LG è stato verificato.** Le righe visibili non equivalgono a video integrato. No browser esterno nel flusso ordinario.
- **85 LCN nell'elenco** non significa 85 flussi disponibili.
- La CI non certifica riproduzione, tasti fisici intercettati da webOS, latenza o compatibilità dell'apertura Live TV sul modello reale.
- L'etichetta «IPTV in lista» indica presenza sorgente, **non prova di audio/video**.
- Se la vecchia playlist era già stata importata con deduplicazione 13/83, potrebbe servire un refresh esplicito della playlist sul TV.

## Prossima azione
**Installare e collaudare la IPK della run 40088324252 sulla LG 24TQ510S-WZ webOS 22**; annotare solo risultati osservati. Ricercare TV8/Videogruppo soltanto su fonti ufficiali/manifest autorizzati; nessun iframe blindato, URL effimero o streaming decriptato.
