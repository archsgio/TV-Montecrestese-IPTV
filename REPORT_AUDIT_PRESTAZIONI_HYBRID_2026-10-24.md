# Audit tecnico e prestazionale — IPTV Montecrestese Hybrid
_Data: 24 ottobre 2026. Sviluppo isolato nel ramo `feature/webos-iptv-lcn-focus`; non sostituisce ancora un collaudo reale LG._

## Validazione finale del codice distribuito

- **[GitHub Actions 40076178473](https://github.com/archsgio/TV-Montecrestese-IPTV/actions/runs/40076178473): SUCCESS** (commit sorgenti `eb0eff9eef45b890eab553ca62a7181660154650`). **156 file di test, 3.427 test superati, 4 saltati**; TypeScript, lint, packaging e ispezione dell'IPK tutti verdi.
- **[Bridge LG static QA 40076007977](https://github.com/archsgio/TV-Montecrestese-IPTV/actions/runs/40076007977): SUCCESS**. Controlli locali senza contatto con il televisore.
- Artifact ufficiale `IPTV-Montecrestese-custom-IPK` ID **12552978674**, disponibile su GitHub Actions fino al **7 novembre 2026**.
- Archivio ZIP scaricato e ricontrollato, SHA256 `3e9eb0a28b447570191c3368bd054afa444d474c00bcd37f2cb50598c8e711dc` (identico al digest GitHub). Pacchetto `com.archsgio.iptv_1.17.0_all.ipk` estratto e verificato separatamente: SHA256 `9d887a0ef6e5f07189e58a8e456d411dd72c97bbef30afde42798cab7aa572b7`.
- L'IPK estratto contiene effettivamente `montecrestese_last_hybrid_channel_v1`, `/v1/last`, `/v1/remember`, `elapsed_ms=`, l'interfaccia delle tre liste diagnostiche, la CSS relativa e il titolo italiano corretto **IPTV Montecrestese**.

**Stato: collaudo software concluso; collaudo fisico LG e benchmark con cronometro ancora mancanti.** La verifica con SSAP non certifica che il browser LG riproduca una diretta web né che un flusso HLS sia stabile.

## Criteri funzionali fissati
- **Ultimo canale assoluto**: ogni canale deve essere identificato da `{source, lcn, at}` e ripreso dalla sorgente IPTV/DVB/web effettivamente registrata più di recente. Nessuna inferenza dall'indice nella playlist, nessun ripiego silenzioso su un canale diverso. Il video IPTV viene ricordato dopo il primo evento HTML5 `playing`, non al semplice click.
- **TV nativa**: con bridge Windows attivo e autorizzato, campionamento SSAP ogni **8 secondi** di foreground e canale sintonizzato. Cambi eseguiti con il telecomando nel tuner LG possono aggiornare la cronologia mentre il servizio PC è operativo. Se il PC è spento, disconnesso, l'API LG non risponde o la TV è spenta, **non è possibile certificare quale canale nativo sia stato visto dopo l'ultimo campionamento**.
- **Dirette ufficiali web**: memorizzazione a richiesta di apertura accettata dall'LG, non prova di avvenuta riproduzione AV della pagina. Spostamenti successivi del browser verso video diversi senza passare dal catalogo **non sono rilevabili in modo affidabile** attraverso l'attuale API.
- **Stato di salute**: sotto i quattro contatori sono visualizzate le tre liste per stato **Sospetti**, **Non disponibili**, **Non verificati**, ordinate per LCN, con `LCN + nome`; i disponibili non vengono ripetuti. Sono dati del medesimo `ChannelHealthService` già in uso; non vengono costruite URL false per i canali mancanti.

## Ottimizzazioni applicate nel codice

| Percorso | Prima | Dopo | Conseguenza attesa |
|---|---|---|---|
| SSAP cambio IPTV→DVB/web | Nuova connessione e pairing per ogni comando | Socket autorizzato riutilizzato finché resta connesso, con ripristino quando chiude | Meno handshake e minore attesa fra sorgenti |
| Ripristino all'avvio | Ultimo IPTV da indice/chiave, nessuna sorgente esterna | Registro cronologico IPTV/DVB/web condiviso con il PC; LCN esplicito; recupero solo se sorgente disponibile | Nessun canale diverso avviato al posto dell'ultimo |
| Lettura cronologia PC | Lettura dopo playlist, con attesa seriale | Lettura avviata **in parallelo** al caricamento del catalogo, timeout rete 1250 ms; ignorata se autoplay OFF | Meno blocchi a inizio visione |
| Scansione stato salute | Aggiornamento del pannello completo a ogni risposta di rete | Aggiornamento al massimo **4 volte al secondo**, con ultimo aggiornamento garantito | Riduzione del lavoro DOM e minore lag durante la scansione |
| Accesso alla guida LCN | Riapertura dalla posizione 1 | VERDE in Live apre sulla **LCN vista per ultima**, con pagine da 9 posizioni e tastierino LCN | Molte meno pressioni per raggiungere canali recenti |
| Chiusura dopo cambio sorgente | Modale rimane visibile sino al passaggio applicazione | Chiusura della guida appena il bridge conferma l'invio del comando | Minore ingombro UI nel cambio rapido |
| Validazione bridge | Duplicazione tra il form e la logica di avvio | Unico modulo `hybrid-bridge-config.ts` | Minor rischio di regole divergentI |
| Diagnostica video | Nessuna misura applicativa specifica del primo frame | `elapsed_ms` registrato fra `loadStream()` e primo evento `playing` | Possibilità di confrontare startup/switch su hardware |

## Verifiche software e limiti
- Suite automatica GitHub: TypeScript, lint CSS/JS compatibile webOS legacy, controlli LCN, test unitari e archivio IPK con metadati corretti.
- Test incrementali per ordinamento fonte più recente, DVB 802, condizioni PC spento, LCN mancante, credenziali locali e distinzione fra stati di salute.
- Il bridge deve avviarsi su una macchina attendibile in LAN; il file `.local-bridge-secret` e la cronologia `.local-bridge-last-source.json` sono esclusi dal repository. Nessun root, bypass DRM o ritrasmissione DVB.
- **Rischio da gestire prima di distribuzione ampia:** una compilazione delle dipendenze dell'upstream ha riportato **5 avvisi npm (3 moderati, 2 elevati)**; non è stato ancora accertato quali riguardino dipendenze distribuite anziché build tool. Evitare di eseguire automaticamente `npm audit fix` senza audit regressivo.
- Non sono riportati tempi in millisecondi per il televisore fisico: la pipeline CI può misurare solo attività di compilazione; rete Wi‑Fi, ricezione DVB, SSAP, decoder LG e flussi HLS richiedono un **benchmark sulla TV reale**.

## Prove A/B per accertare il miglioramento
Con la LG 24TQ510S-WZ e PC Windows:
1. Con la stessa playlist v10, eseguire **tre avvii a freddo** con ultimo canale 13 e tre con ultimo 802 tramite DVB. Annotare tempo dal comando Quick Access al primo video/audio; controllare se compare un altro canale nel frattempo.
2. Eseguire **dieci cambi IPTV→IPTV** fra 6, 13 e 83; rilevare `elapsed_ms` del player, verificare nessun flash del precedente video e latenza audio.
3. Eseguire **dieci cambi IPTV→DVB e viceversa** in condizioni di rete identiche, con bridge attivo; annotare tempo all'immagine e risposta effettiva del TV. Ripetere con bridge spento per verificare errore chiaro e nessuna sostituzione impropria.
4. Verificare LCN 57 sul browser LG: registrazione dell'ultima diretta avviata, ritorno dall'app e comportamento con pagina eventualmente incompatibile/DRM.
5. Avviare la verifica canali; confermare che contatori e liste problematiche coincidano e si aggiornino durante la scansione senza lag percepibile.
6. Provare cambio DTT da telecomando mentre il bridge è acceso, attendere un campionamento di 8 secondi, aprire IPTV e verificare ripresa di quell'LCN. Ripetere spegnendo il PC per documentare il limite della rilevazione.

## Regola di accettazione
Un verde CI con IPK installabile **non** equivale a collaudo hardware dei sei punti sopra. Non promuovere il ramo sperimentale a release definitiva prima delle prove LG, mantenere invariata la v7 funzionante e la precedente build come rollback.
