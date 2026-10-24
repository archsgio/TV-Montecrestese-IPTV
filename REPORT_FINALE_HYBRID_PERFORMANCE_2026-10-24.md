# IPTV Montecrestese Hybrid — audit finale codice, prestazioni e collaudo
Data: 24 ottobre 2026
Ramo: `feature/webos-iptv-lcn-focus`

## Verifica software conclusa

Ultima build del ramo: [Actions 40076719422](https://github.com/archsgio/TV-Montecrestese-IPTV/actions/runs/40076719422), **SUCCESS**, commit `aabb1b20e7ef`. Totali: **156 suite, 3.428 test passati, 4 saltati**; controlli TypeScript, lint CSS/JS compatibile con webOS, pacchettizzazione, identificativi `com.archsgio.iptv` e titolo italiano superati.

Artefatto GitHub `IPTV-Montecrestese-custom-IPK` ID **12553408134**, ZIP SHA-256 `24b385fe8a228ff4d68ac68775e722be72ee846cbab2bcdb8d42960ad660eee2`, disponibile fino al **7 novembre 2026**. Verifica indipendente dello ZIP scaricato effettuata: impronta identica. IPK estratto `com.archsgio.iptv_1.17.0_all.ipk` da **735082 byte**; SHA-256 `fe062d75f2fac2ec4628cdd135d918cc0534b13d441caad0e2c551dc500614c1`. Archivio Debian `debian-binary`, `control.tar.gz`, `data.tar.gz`; codice app `js/app.js`, guide Hybrid, fogli di stile `hybrid-guide.css` e `channel-health-issues.css`, servizio LG, `appinfo.json` e `resources/it/appinfo.json` presenti con titolo corretto `IPTV Montecrestese`.

Il test statico LAN bridge [Actions 40076638875](https://github.com/archsgio/TV-Montecrestese-IPTV/actions/runs/40076638875) è **SUCCESS**. Comprende selezione LCN univoca, reti private, allowlist URL ufficiali e protezione da registrazioni IPTV fuori ordine.

## Obiettivi implementati

### Ultimo canale globale
- Memoria `montecrestese_last_hybrid_channel_v1`, con sorgente `iptv`, `dvb` o `web`, LCN e istante. Confronto tra ultima memoria locale e ultima memoria del PC; scelta dell'evento più recente.
- IPTV: aggiornamento solo dopo l'evento media `playing`, **non quando un canale viene soltanto evidenziato**.
- DVB: registrazione dopo accettazione del comando SSAP; successivo campionamento in TV nativa circa ogni **8 secondi** se bridge acceso e paired, per intercettare i cambi con il telecomando senza modificare canale.
- Web: registrazione dopo conferma dell'apertura della pagina ufficiale, non certificazione dell'effettiva riproduzione. Limitazione intrinseca del browser LG.
- Memoria su TV salvata anche dopo azione DVB/web riuscita, così PC temporaneamente offline non causa ritorno indesiderato al vecchio canale IPTV.
- Il bridge rifiuta un rapporto IPTV arrivato in ritardo con istante precedente all'ultimo evento già salvato.
- Auto Play ON sulle **nuove configurazioni**; un OFF esplicito permane. Startup recupera in parallelo la storia dal bridge e usa la fonte più recente. Se l'ultima fonte esterna non è raggiungibile, offre il canale in guida anziché aprire una fonte differente.

### Stato di salute
- Sotto i contatori, elenco separato dei soli `Sospetti`, `Non disponibili` e `Non verificati`, ognuno con **numero LCN e nome**.
- I `Disponibili` restano conteggiati ma non occupano spazio nell'elenco.
- I gruppi derivano dagli stessi record usati dai quattro contatori; nessun secondo database e nessuna diagnosi fittizia.
- Ridisegno UI degli esiti limitato a circa **4 aggiornamenti al secondo**, con aggiornamento finale obbligatorio.

## Audit prestazioni: interventi effettuati
| Sottosistema | Prima | Ora | Prova |
|---|---|---|---|
| Guida 85 LCN | Ricreava 85 pulsanti e listener per ogni pressione delle frecce | Aggiorna solo classi focus e posizione di scorrimento | Test conserva l'identità dei nodi durante 8 pressioni |
| Ponte LAN LG | Possibile riaccoppiamento/apertura socket per ogni azione | Riuso della connessione SSAP autorizzata | Test statici e sintassi, non misurazione reale LG |
| Ultimo canale | Fonte IPTV salvata, con rischio di dimenticare fonte nativa se PC offline | Memoria sorgente comune, salvataggio doppio e gestione risposte fuori ordine | Test unitari backend+frontend |
| Startup | Leggeva solo l'ultima IPTV | Richiesta storia PC parallela al caricamento playlist, con limite di **1,25 s** per il solo recupero remoto | Codice e test; nessuna metrica sul TV |
| Ripristino esterno | Timeout rete troppo aggressivo (**1,25 s**) | Attesa massima di **9,5 s** per invio cambio sorgente esterna; lettura stato resta breve | Test, non tempi reali |
| Diagnostica salute | Numeri soltanto | Elenchi problematici senza duplicare gli stream sani, aggiornati in modo controllato | Test automatici |
| Misure IPTV | Mancava il dato di prima riproduzione | Log `elapsed_ms` fra richiesta del flusso e primo evento media `playing` | Strumentazione inclusa |

**Non sono disponibili millisecondi effettivi di primo fotogramma, cambio IPTV, avvio da Home o cambio DVB/web sul televisore.** I tempi teorici o del CI non devono essere spacciati per risultati hardware.

## Collaudo concreto, in ordine e senza prove inutili

1. **Prima apertura IPK**: installare il pacchetto Hybrid `com.archsgio.iptv_1.17.0_all.ipk` mediante webOS Developer Mode/Dev Manager. Non cancellare la build precedente. Caricare la playlist di prova v10 una sola volta e verificare che le preferenze rimangano salvate.
2. **Auto-ripresa IPTV**: guardare un canale funzionante, ad esempio LCN 13 Rete 7. Uscire e aprire l'app: deve partire Rete 7 senza conferme. Poi cambiare LCN, ripetere. Provare OFF di Auto Play e verificare che sia rispettato.
3. **Guida e telecomando**: dalla diretta premere VERDE e vedere 85 LCN; 10 pressioni giù e poi su devono scorrere rapidamente senza perdere il focus. GIALLO apre tastierino LCN; inserire numero reale e VAI. Gli eventuali tasti fisici riservati LG non giustificano root.
4. **Salute**: eseguire la scansione in Impostazioni; verificare 4 contatori e i 3 elenchi relativi con LCN/nome. I sani non devono comparire sotto.
5. **Bridge PC**: mettere TV e PC sulla stessa LAN. In `tools/lg-hybrid` eseguire `npm install`, `node lg-dtt.mjs --host <IP-TV> --list`; confermare pairing sul TV. Non condividere in chat la chiave generata. Avviare `node bridge-server.mjs --tv <IP-TV> --bind <IP-PC>` e collegarlo nell'app.
6. **Ripresa DVB**: passare a un canale antenna ricevibile (per es. LCN 802 se sintonizzato). Cambiare con CH+ o CH− nella TV nativa, attendere almeno 8–15 s affinché il bridge rilevi la LCN. Riavviare IPTV: deve sintonizzare il nuovo canale DVB effettivo senza aprire una vecchia IPTV.
7. **PC spento**: dopo aver aperto DVB tramite l'app e memorizzato la sorgente, spegnere il bridge; al riavvio IPTV deve **ricordare la scelta** ma segnalare l'impossibilità di cambiar sorgente automaticamente. Non deve partire un altro canale ingannevolmente.
8. **Web ufficiale**: aprire l'opzione web per LCN 57 Italiana e verificare se la pagina e il video funzionano sul browser LG; il comando certifica solo la richiesta di apertura, NON la visione video.
9. **Prestazioni misurate**: ripetere almeno 5 volte IPTV 13→19 e 19→13; annotare tempo dalla pressione tasto al primo audio/video. Ripetere IPTV→DVB→IPTV con bridge già collegato e con bridge spento. Per misure sullo stesso setup, riportare almeno mediana e massimo (in secondi); il log app `elapsed_ms` può supportare la diagnostica IPTV.
10. **Resilienza**: verificare standby/riaccensione, rete temporaneamente assente e app riconnessa, prima di promuovere la build da prova a definitiva.

## Confini di correttezza

- Le **85 posizioni** non corrispondono a 85 stream IPTV: playlist v10 ha 60 candidate, 19 senza stream e 6 sorgenti LG bocciate. DVB e browser possono colmare l'esperienza solo dove i servizi sono effettivamente disponibili.
- **Browser**: l'API SSAP conferma l'apertura della pagina, non un video avviato. Finché manca un segnale osservabile, la memoria "web" rappresenta l'ultima destinazione aperta, non una certificazione dell'ultimo fotogramma visto.
- **DVB nativo**: durante il funzionamento senza bridge l'app può ricordare l'ultima LCN comandata, ma non osservare cambi fatti dopo direttamente nel Live TV LG.
- Nessun root, firmware patch, DRM bypass o distribuzione pubblica di stream.
- Le playlist e la versione `main` non sono state modificate da questo intervento. Nessun test fisico è stato dichiarato superato senza accesso al TV.

## Esito
**Codice, CI e IPK: verificati.** **Ultimo canale fra sorgenti: test simulati passati, hardware da confermare.** **Tempi avvio/cambio: ottimizzazioni realizzate, confronto quantitativo su LG ancora necessario.** La promozione a versione definitiva deve dipendere da questi controlli.
