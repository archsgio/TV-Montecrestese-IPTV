# Verifiche indipendenti Hybrid — 24 ottobre 2026

## Risultati ottenuti senza collegare la LG reale

| Verifica | Esito | Evidenza |
|---|---|---|
| Build app base | **Superata** | GitHub Actions [40035803988](https://github.com/archsgio/TV-Montecrestese-IPTV/actions/runs/40035803988): 3.410 unit test superati, 4 saltati, 153 suite, typecheck e lint |
| Struttura archivio scaricato | **Superata** | Scaricato ZIP artifact ID 12536399237. SHA256 `136c43225714f17142ff59eca62117ccd48afb76eb62f1b517fea6f57580eb3e`, identica all'impronta GitHub |
| Integrità IPK | **Superata** | Il file `com.archsgio.iptv_1.17.0_all.ipk` da 733300 B contiene archivio Debian `debian-binary`, `control.tar.gz`, `data.tar.gz`; estrazione corretta |
| Identità app e servizio | **Superata** | `usr/palm/applications/com.archsgio.iptv/appinfo.json` e `usr/palm/services/com.archsgio.iptv.service/services.json` verificati |
| Funzioni Hybrid incluse nei byte distribuiti | **Superata** | Il file compilato `js/app.js` contiene `montecrestese_hybrid_connection_v1`, `Catalogo Montecrestese`, `Rai 3 TGR Piemonte`; CSS `hybrid-guide.css` e `virtual-numpad.css` inclusi e linkati |
| Metadati in lingua italiana | **Difetto trovato e corretto nel sorgente** | Nel primo IPK `resources/it/appinfo.json` mostrava ancora il titolo `webOS IPTV Player`. Patch correttiva nel ramo; la build aggiornata con `verify-ipk.sh` deve confermare il titolo nuovo |
| Interoperabilità SSAP lgtv2 | **API verificata, non sul TV** | Biblioteca `lgtv2` 2.1.0: request Promise, certificate TOFU, pairing con consenso, `tv/getChannelList`, `tv/openChannel`, `system.launcher/open`; pairing manifest include `READ_TV_CHANNEL_LIST` e `CONTROL_INPUT_TV` |
| Bridge: selezione DVB | **Simulazione superata** | Test pure `bridge-core.test.mjs`: LCN 802, channelId, assenza/duplicati, canali skipped |
| Bridge: sicurezza | **Simulazione superata** | RFC1918, CORS origini limitate `null`/`file://com.archsgio.iptv`, URL HTTPS allowlist, azioni limitate `tune`/`web` |
| Browser webOS | **Verificata compatibilità nominale, hardware da provare** | Specifiche ufficiali LG: webOS 22 usa Chromium 87; test del player sono più conservativi e includono controlli per Chromium 53 |
| Canali IPTV | **Non sostituibile con test automatici** | M3U v10 contiene 60 candidati; 6 stream risultavano bocciati su LG, 19 LCN non hanno fonte video attendibile; solo il collaudo AV sul TV conferma 59/83 e gli altri |
| Esecuzione su LG 24TQ510S-WZ | **NON VERIFICATA** | Nessun accesso alla rete privata del televisore in questa sessione; no pairing, no installazione TV, nessuna simulazione presentata come test fisico |

## Collaudo reale minimo — sequenza ad alto valore

1. Verificare il TV acceso, collegato ad antenna e stessa rete Wi-Fi/LAN del PC, senza modificare firmware, root o router.
2. Nelle impostazioni LG controllare che la scansione canali DVB-T2 sia stata eseguita. [LG: sintonizzazione automatica](https://www.lg.com/it/supporto/supporto-prodotto/risoluzione-anomalie/help-library/cs-CT52001074-20155512848978/).
3. Sul PC nella cartella `tools/lg-hybrid` installare Node.js 22.12+ ed eseguire `npm install`, poi `node lg-dtt.mjs --host <IP-TV> --list`. Sulla LG autorizzare **LG Connect Apps**. Il comando **non** sintonizza né cambia app. Annotare solo quali LCN sono presenti, in particolare **14, 15, 41, 44, 75, 802**; nessun bisogno di pubblicare l'indirizzo IP, chiave di pairing o dati personali.
4. Se e solo se `802` compare nell'elenco senza duplicati, provare `node lg-dtt.mjs --host <IP-TV> --tune 802`. Ci si aspetta l'apertura della TV nativa, non video inserito nel player IPTV.
5. Per confermare la restituzione all'app, `node lg-dtt.mjs --host <IP-TV> --return` con IPK Hybrid installato. Controllare che l'app parta correttamente, non soltanto che SSAP confermi il comando.
6. Installare l'IPK dopo che la build post-audit sarà verde. Caricare **solo** playlist v10 con EPG, mantenendo la v7 per ripristino. Aprire un canale live funzionante e premere **GIALLO → VAI (senza cifre)**; verificare focus, scroll, testo e 85 righe sull'LG 24TQ510S-WZ. Inserire **802** e poi **14** per confermare l'alternativa (nessuna riproduzione dello stream già bocciato).
7. Avviare sul PC il bridge con `node bridge-server.mjs --tv <IP-TV> --bind <IP-PC>`; collegarlo nelle impostazioni Hybrid sul televisore con endpoint `http://<IP-PC>:8927` e la chiave generata sulla console locale. Configurare il firewall Windows per la sola rete privata e possibilmente per il singolo IP TV.
8. Aprire **57 Italiana** con l'opzione ufficiale RaiPlay, **solo su comando esplicito**. Controllare se il browser webOS riproduce realmente video e audio (possibili limiti DRM/browser). Provare la DTT via bridge solo dopo il passo 4 positivo.
9. Collaudare le sorgenti IPTV 59 Discovery Turbo e 83 Piemonte+ (simulcast di Rete7) con almeno un breve ascolto audio e verifica video. Il link HTTP HLS raggiungibile non equivale a video su TV.
10. Non testare il telecomando numerico mediante root o modifica firmware: continuare a usare le frecce e il tastierino virtuale. Il comportamento dei tasti fisici 0-9 dipende da webOS e rimane non confermato.

## Alternative ulteriori, NON implementate

[webOS Homebrew — Input/TV embedding](https://www.webosbrew.org/develop/guides/web-app/) cita il tipo HTML non documentato `service/webos-broadcast` con `src="tv://"` per visualizzare il tuner nel DOM. **Non è verificato su LG 24TQ510S-WZ, né è garantito per app developer non-root**. Va eventualmente valutato con un esperimento isolato, prima di cambiare il lettore stabile.

## Rischi che restano

- Il browser e l'app TV potrebbero impedire fetch HTTP privati o applicare differenti politiche CORS; necessaria prova su webOS 22.
- SSAP `getChannelList` può chiudere la websocket se sul TV non ci sono canali sintonizzati (segnalato nella documentazione lgtv2); comando read-only può fallire e non equivale a blocco permanente.
- La connessione PC–LG via bridge è HTTP, con credenziale nel solo ambiente domestico: non esporre porta 8927 su Internet e non copiare la chiave nelle chat.
- La libreria lgtv2 usa un pairing manifest con più permessi di quelli necessari al bridge; il server limita i **comandi effettivamente disponibili** a leggere la lista e a sintonizzare/aprire siti ufficiali.
- Una playlist di 85 LCN non equivale a **85 video disponibili**: dove il tuner non riceve e il player web non è compatibile, il sistema deve mostrare un messaggio chiaro, non inventare un flusso.

Il file `webos-player-custom/verify-ipk.sh` è ora un controllo di build che apre l'IPK finale e ne valida i componenti e il titolo italiano; l'evidenza definitiva è il suo esito nella nuova esecuzione Actions.
