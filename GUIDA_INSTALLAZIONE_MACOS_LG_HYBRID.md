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

## B. Funzioni Hybrid con il Mac: opzionali, ma richiedono Mac acceso

L'app contiene 85 LCN ed è utilizzabile con le sorgenti IPTV anche senza bridge. La funzione di **selezionare dal catalogo un canale del sintonizzatore LG** e seguire i cambi effettuati direttamente nella TV nativa, invece, utilizza attualmente un **bridge HTTP privato**. Può girare su macOS, ma non continua a funzionare quando il Mac dorme, è spento, è su un'altra rete oppure Terminale è chiuso.

1. Installare dal sito ufficiale **[Node.js](https://nodejs.org/)** versione 22.12 o successiva (compatibile con l'architettura del Mac).
2. Sul Mac aprire il repository GitHub nella branch `feature/webos-iptv-lcn-focus`, scegliere **Code → Download ZIP**, estrarlo e aprire **Terminale**. Digitare `cd ` (con spazio finale), trascinare dal Finder la cartella **`tools/lg-hybrid`** nella finestra Terminale, quindi premere Invio. Evita di scrivere percorsi complessi.
3. Installare le dipendenze locali, **una sola volta**:
   ```sh
   npm install
   ```
4. Prima effettuare il test **di sola lettura**, sostituendo l'IP d'esempio con quello reale della TV:
   ```sh
   node lg-dtt.mjs --host 192.168.1.50 --list
   ```
   Approva sul TV il collegamento LG Connect Apps solo se compare la richiesta prevista. `--list` non cambia canale.
5. Individuare l'indirizzo IPv4 del Mac in **Impostazioni di Sistema → Rete → Wi-Fi → Dettagli → TCP/IP** (o nell'adattatore Ethernet utilizzato). Esempio: `192.168.1.10`.
6. Avviare il bridge sostituendo sia IP TV sia IP Mac:
   ```sh
   caffeinate -i node bridge-server.mjs --tv 192.168.1.50 --bind 192.168.1.10
   ```
   `caffeinate -i` impedisce la sospensione *per inattività* del Mac mentre il comando è in esecuzione; non garantisce funzionamento a Mac spento, chiuso in stop forzato o con Terminale terminato. La porta usata è la **8927/TCP**, solo sull'IPv4 privato specificato. Sul firewall macOS ammettere l'app Node **solo sulla rete domestica fidata**, quando il sistema chiede autorizzazione.
7. La console mostra il collegamento `http://IP-MAC:8927` e una chiave esadecimale da 64 caratteri. Immetterli nella voce **Configura collegamento locale** della guida Hybrid sul televisore. **Non inviare la chiave in chat o su GitHub**.
8. Per terminare il bridge, tornare al Terminale e premere **Control+C**. La riproduzione IPTV non dipende dal bridge.

## C. Cosa funziona con Mac spento?

| Funzione | Con Mac spento |
|---|---|
| Avvio IPTV e riproduzione automatica dell'ultimo canale IPTV | **Sì** |
| Guida 85 LCN, selezione IPTV con telecomando, stato di salute | **Sì** |
| Scelta della sorgente DVB/web dall'app e invio comando alla LG | **No**, richiede bridge attivo |
| Rilevazione del numero terrestre cambiato via CH+/CH− nell'app Live TV LG | **No**, richiede bridge attivo |
| Ripristino di un ultimo canale DVB/web già ricordato | La memoria locale può persistere, ma il **cambio automatico** richiede il bridge |

### Obiettivo futuro

Per ottenere davvero una esperienza con **solo televisore**, senza Mac sempre acceso, occorre eliminare la dipendenza dal bridge oppure collocarlo su un dispositivo domestico sempre acceso (non necessario per iniziare le prove). Nessuna soluzione autonoma è stata ancora verificata sul firmware reale della LG. Il bridge **non installa un servizio sul televisore**.

## Riferimenti

- [webOS Dev Manager: supporto Mac universale](https://github.com/webosbrew/dev-manager-desktop)
- [Documentazione Developer Mode](https://www.webosbrew.org/devmode/)
- [Libreria lgtv2](https://github.com/hobbyquaker/lgtv2)
- [Comandi dettagliati del bridge](tools/lg-hybrid/README.md)
