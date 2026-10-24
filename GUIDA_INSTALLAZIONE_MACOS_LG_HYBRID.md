# Installazione IPTV Montecrestese dalla Mac — macOS Intel e Apple Silicon

Questa guida distingue due operazioni indipendenti: **installare una volta l'app IPK sulla LG** e, solo se si vogliono utilizzare le sorgenti terrestri / i siti ufficiali direttamente dal catalogo Hybrid, **tenere attivo un servizio locale facoltativo**.

## A. Installazione dell'app: Mac necessario soltanto per installare

1. Mettere **LG 24TQ510S-WZ e Mac sulla stessa rete locale**.
2. Sul televisore installare dal LG Content Store l'app ufficiale **Developer Mode**. Accedere al proprio account sviluppatore webOS, attivare **Dev Mode Status** e **Key Server**. Annotare l'indirizzo IP della TV e la passphrase/chiave presentati sul televisore, senza pubblicarli su GitHub o in chat. Per la procedura corretta fare riferimento alla [guida webOS Homebrew Developer Mode](https://www.webosbrew.org/devmode/).
3. Dal Mac installare **[webOS Dev Manager](https://github.com/webosbrew/dev-manager-desktop/releases/latest)**, scegliendo dalla release il file **`webOS.Dev.Manager_[VERSION]_universal.dmg`**, valido sia per Mac Intel sia per Apple Silicon. Nessun Windows e nessuna VM richiesta. Non è necessario installare Node.js per il solo caricamento del pacchetto IPK.
4. Aprire Dev Manager, aggiungere il televisore tramite IP di rete e credenziali Developer Mode/Key Server e verificare la connessione. In caso di prompt macOS sulle connessioni alla rete locale, consentire alla sola app Dev Manager.
5. Scaricare il nuovo **`com.archsgio.iptv_1.17.0_all.ipk`** dalla [build GitHub verificata](https://github.com/archsgio/TV-Montecrestese-IPTV/actions/runs/40076719422), se ancora disponibile, oppure utilizzare il file IPK già fornito nella conversazione. Se GitHub consegna uno ZIP dell'artifact, estrarre il file IPK prima di scegliere **Install** nel gestore.
6. Aprire l'app **IPTV Montecrestese** dal televisore e caricare la playlist [v10 EPG](TV_Montecrestese_LCN_v10_CANDIDATI_XMLTV_TEST.m3u), se non già configurata. Per l'IPTV ordinaria il Mac ora può essere spento.

**Importante:** Developer Mode non è root; il televisore può applicare scadenze della sessione Developer Mode e le normali restrizioni delle app installate in questo modo.

## B. Utilizzo normale: SOLO TV, Mac spento

**Dopo aver installato l'IPK, il Mac non serve per guardare o passare fra le sorgenti.** La versione TV-only usa direttamente i servizi di sistema della LG:

- **IPTV:** visualizzazione nella nostra app, con ripresa del canale IPTV memorizzato.
- **TV terrestre nativa:** apertura di Live TV LG, che — come già verificato dall'utente sulla sua LG — **riparte automaticamente dall'ultimo canale terrestre effettivamente sintonizzato**, anche dopo spegnimento e riaccensione.
- **Siti ufficiali:** apertura del browser nativo tramite webOS, quando disponibile nell'elenco approvato. La riproduzione vera del sito va provata.
- **Guida:** VERDE mostra tutte le 85 posizioni LCN; GIALLO consente l'immissione numerica virtuale.

Il catalogo **non** può ancora ordinare alla TV terrestre di selezionare direttamente uno specifico LCN (es. 802). Quando si apre Live TV, la LG riprende il *suo* canale terrestre più recente. Il numero viene poi selezionato con il telecomando LG, senza Mac.

La nostra app ricorda localmente se l'ultima sorgente **aperta da IPTV Montecrestese** era IPTV, DVB o web, e può tentare di riaprirla. Se invece si passa dal menu Home LG direttamente alla TV terrestre, la nostra app non osserva necessariamente quel passaggio: non promettiamo la conoscenza assoluta di tutti i cambi effettuati fuori dalla nostra app.

### Nessuna installazione del bridge per l'uso quotidiano

**NON serve eseguire `npm install`, Node.js, Terminale, `caffeinate` o `bridge-server.mjs`.** Sono strumenti di un vecchio prototipo di controllo via rete, conservato solo per ricerca. Non configurarli nella nuova build TV-only.

## C. Prova senza Mac acceso

1. Installare l'IPK dalla Mac tramite Dev Manager, poi scollegare/spegnere il Mac.
2. Aprire IPTV Montecrestese e riprodurre un canale IPTV già funzionante.
3. Premere VERDE e aprire la **TV terrestre LG**: dovrebbe mostrare il canale terrestre che la LG ha già memorizzato.
4. Cambiare numero con il telecomando terrestre, spegnere/riaccendere la TV e aprire Live TV: verificare che riparta da quell'ultimo canale, come già avviene normalmente.
5. Riaprire IPTV Montecrestese e verificare il corretto accesso alla guida e all'IPTV.
6. Provare facoltativamente una diretta web ufficiale, annotando se il browser LG riproduce davvero audio e video.

Questa verifica non richiede connessione a un computer: bisogna solo avere televisore e rete Internet per l'IPTV.

[Architettura aggiornata senza PC](ARCHITETTURA_SOLO_TV_SENZA_MAC.md) · [LG Application Manager](https://webostv.developer.lge.com/develop/references/application-manager)
