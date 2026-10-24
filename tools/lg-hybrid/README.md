# LG DVB-T Hybrid: prova senza root (solo rete locale)

Questa piccola utilità, basata sulla libreria MIT [hobbyquaker/lgtv2](https://github.com/hobbyquaker/lgtv2), permette di verificare **se il LG 24TQ510S-WZ espone realmente i propri canali DTT all'API SSAP**. Lo strumento non sostituisce la lista IPTV e non richiede un dispositivo di acquisizione DVB.

## Perché il modello reale rende praticabile la soluzione

La scheda [LG 24TQ510S-WZ](https://www.lg.com/it/tv-soundbar/tv-fino-a-32-pollici/24tq510s-wz/) conferma sintonizzatori **DVB-T/T2 HEVC Main10, DVB-C e DVB-S/S2**, **HbbTV 2.0** e navigatore web. Quindi il televisore possiede già la parte hardware per la ricezione terrestre: per il **semplice passaggio al canale Live TV nativo**, non serve un ulteriore tuner.

I canali realmente disponibili dipendono dall'antenna, dalla copertura a Montecrestese e dalla scansione già eseguita sul televisore. DVB-S/S2 è un'altra potenziale sorgente se esiste un impianto satellitare compatibile; alcuni canali possono richiedere una CAM/smartcard autorizzata.

## Prima di tutto: Mac supportato, Windows non necessario

Per installare IPTV Montecrestese e per utilizzare il bridge **non serve Windows**: sono compatibili i Mac Intel e Apple Silicon. Il programma di installazione IPK consigliato è **webOS Dev Manager universal.dmg**; il bridge facoltativo è un programma Node.js portabile. Leggere anzitutto la [guida completa macOS](../../GUIDA_INSTALLAZIONE_MACOS_LG_HYBRID.md).

**La differenza importante:** il Mac può essere spento dopo l'installazione dell'IPK se si guardano i canali IPTV. Deve essere **acceso e non in stop** per comandare tramite bridge il DVB-T2 e i siti ufficiali o rilevare il cambio del canale DTT nativo. La guida IPTV e lo stato di salute non dipendono dal Mac.

## Procedura alternativa su Windows (stessa LAN della TV)
1. Individuare l'**indirizzo IPv4 privato della TV** nelle impostazioni di rete LG. Non inserirlo in GitHub.
2. Installare [Node.js](https://nodejs.org/) v22.12+ sul PC se assente.
3. Da PowerShell nella directory `tools/lg-hybrid` del repository:
   ```powershell
   npm install
   node lg-dtt.mjs --host 192.168.1.50 --list
   ```
   **192.168.1.50 è solo un esempio**, usare l'IP reale del proprio TV. La prima connessione mostrerà sul TV un prompt LG da approvare; la chiave di accoppiamento rimane sul PC (`lgtv2` usa la cartella applicativa del sistema operativo).
4. Con `--list` **non si cambia canale né app**. Verificare se il TV restituisce esattamente i canali DVB-T2 cercati, inclusi 8, 14, 15, 41, 44, 57, 72, 75 e 802. La disponibilità dipende dal segnale e dalla scansione digitale terrestre locale.
5. Solo dopo avere confermato corrispondenza LCN e nome, facoltativamente:
   ```powershell
   node lg-dtt.mjs --host 192.168.1.50 --tune 802
   ```
   Il televisore passa alla **sua app Live TV nativa**, sintonizzando Rai 3 Piemonte se davvero presente. Non rimane dentro la schermata del player IPTV.
6. Quando IPTV Montecrestese sarà installata, per ritornarci:
   ```powershell
   node lg-dtt.mjs --host 192.168.1.50 --return
   ```
   Il lancio richiede la presenza di `com.archsgio.iptv`.

## Aprire le dirette ufficiali nel browser LG (non sono URL M3U)

Oltre a `--list` (sola lettura) e `--tune LCN` (DTT nativo), è previsto:

```powershell
node lg-dtt.mjs --host 192.168.1.50 --web 8
node lg-dtt.mjs --host 192.168.1.50 --web 57
node lg-dtt.mjs --host 192.168.1.50 --web 72
```

Questi comandi aprono **solo URL HTTPS ufficiali** presenti in `official-fallbacks.json`. L'accesso web non è un flusso M3U8 e può non riprodurre video nel browser webOS a causa di compatibilità, DRM o geolocalizzazione. Alcuni link sono pagine informative o directory di dirette: la console segnala sempre la tipologia. Non avviene alcuna estrazione di manifest o aggiramento delle restrizioni.

## Collegare IPTV Montecrestese al servizio locale sul Mac o Windows

Per comandare antenna e siti ufficiali **direttamente dal catalogo dentro IPTV Montecrestese**, il bridge può funzionare sul Mac o su Windows, nella stessa rete locale della LG. Per macOS usare la [procedura Terminale dedicata](../../GUIDA_INSTALLAZIONE_MACOS_LG_HYBRID.md#b-funzioni-hybrid-con-il-mac-opzionali-ma-richiedono-mac-acceso); i comandi PowerShell qui sotto sono riportati solo come alternativa Windows.

1. In PowerShell, dalla cartella `tools/lg-hybrid`, eseguire `npm install` una sola volta.
2. Individuare l'IPv4 privato del PC con `ipconfig`; individuare l'IPv4 del televisore nelle impostazioni di rete LG.
3. Avviare il servizio, sostituendo **entrambi gli indirizzi di esempio**:

   ```powershell
   node bridge-server.mjs --tv 192.168.1.50 --bind 192.168.1.10
   ```

4. La console mostra `http://192.168.1.10:8927` e una **chiave esadecimale di 64 caratteri**, creata con generatore crittografico locale e salvata in `.local-bridge-secret` (esclusa da Git). Non copiarla in chat, su GitHub o in una playlist condivisa.
5. Sulla TV, dopo aver installato la nuova build: aprire un canale IPTV, premere **GIALLO**, lasciare il tastierino vuoto e premere **VAI**. Si apre il catalogo 85 LCN. Selezionare un LCN → **Configura collegamento locale**, inserire endpoint e chiave. Utilizzare eventualmente la tastiera remota dell'app LG ThinQ per semplificare la digitazione.
6. Il primo comando dal PC richiede l'autorizzazione **LG Connect Apps** sul televisore. La guida può interrogare l'elenco dei canali DVB ricevibili. La lista IPTV si può continuare a usare anche senza il servizio PC; DVB/web automatici saranno non disponibili.
7. Provare inizialmente **--list** dal PC e poi un solo LCN terrestre. In modalità ibrida, ogni cambio di sorgente è **esplicito**: mai eseguito per un evento accidentale di navigazione.

### Sicurezza della connessione

Il servizio ascolta soltanto l'**indirizzo privato specificato del PC**, sulla porta TCP **8927**, e accetta solo una chiave a 256 bit. Rifiuta comandi e URL arbitrari, IP pubblici e richieste CORS da origini web ordinarie. Le uniche origini browser consentite sono `null` e `file://com.archsgio.iptv`, per coprire le differenze dei contesti file delle app webOS (da confermare sul televisore). Sul Mac configurare il firewall applicazioni macOS, su Windows quello di sistema: consentire il traffico TCP 8927 **solo sulla rete domestica fidata**, preferibilmente dall'indirizzo del televisore. Non usare inoltro porte sul router, VPN pubbliche o Wi-Fi ospiti.

Il trasporto locale è **HTTP**: non offre crittografia end-to-end. La chiave non deve attraversare reti non fidate. Alcune politiche di sicurezza dei browser webOS possono bloccare accessi HTTP dal pacchetto installato; questa compatibilità va verificata sul TV. Il **Mac o il computer su cui gira il bridge** deve rimanere acceso e attivo durante il fallback automatico.

L'azione IPTV non passa dal bridge. L'azione DVB cambia schermata alla TV nativa e può sospendere l'app; per tornare usare HOME sul telecomando o `node lg-dtt.mjs --host <IP-TV> --return` dal PC.

## Limiti reali
- Il protocollo SSAP documenta `tv/getChannelList`, `tv/openChannel` e il lancio app, **ma non abbiamo verificato queste operazioni sulla TV dell'utente, firmware 04.60.91**. Può rispondere con 403, 404, oppure nessun elenco: registrare l'errore e non forzare nulla.
- webOS potrebbe sospendere l'app IPTV quando entra Live TV: per un'integrazione futura occorre scegliere come tornare al player, e gestire eventuale background bridge o controllo su rete locale. L'app include già la scelta tramite bridge, ma l'intero passaggio alla schermata nativa e il ritorno al lettore devono ancora essere collaudati sulla LG reale.
- Non equivale a redistribuire un segnale DTT come M3U8 e non crea URL pubblici. Per **vedere nello stesso lettore** il video DVB come IPTV servirebbe un ricevitore DVB-T2 di rete (TVHeadend/SAT>IP/HDHomeRun con hardware), che non è incluso nel televisore.
- La libreria effettua il pairing esplicito autorizzato sulla TV. Chiavi e IP non vanno committati. Non esporre le porte 3000/3001 su Internet. Non attiva root né fa downgrade firmware.
- Il comando `--tune` richiede corrispondenza univoca al numero canale registrato sul TV: se ci sono ambiguità la sintonizzazione viene rifiutata.

## Fonti
- https://github.com/hobbyquaker/lgtv2
- https://www.home-assistant.io/integrations/webostv
- https://rorygallagher2024.github.io/glasshouse/development/TV-RESEARCH/
- https://github.com/tvheadend/tvheadend/blob/master/docs/markdown/introduction.md
