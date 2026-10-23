# LG DVB-T Hybrid: prova senza root (solo rete locale)

Questa piccola utilità, basata sulla libreria MIT [hobbyquaker/lgtv2](https://github.com/hobbyquaker/lgtv2), permette di verificare **se il LG 24TQ510S-WZ espone realmente i propri canali DTT all'API SSAP**. Lo strumento non sostituisce la lista IPTV e non richiede un dispositivo di acquisizione DVB.

## Perché il modello reale rende praticabile la soluzione

La scheda [LG 24TQ510S-WZ](https://www.lg.com/it/tv-soundbar/tv-fino-a-32-pollici/24tq510s-wz/) conferma sintonizzatori **DVB-T/T2 HEVC Main10, DVB-C e DVB-S/S2**, **HbbTV 2.0** e navigatore web. Quindi il televisore possiede già la parte hardware per la ricezione terrestre: per il **semplice passaggio al canale Live TV nativo**, non serve un ulteriore tuner.

I canali realmente disponibili dipendono dall'antenna, dalla copertura a Montecrestese e dalla scansione già eseguita sul televisore. DVB-S/S2 è un'altra potenziale sorgente se esiste un impianto satellitare compatibile; alcuni canali possono richiedere una CAM/smartcard autorizzata.

## Preparazione sul PC Windows (stessa LAN della TV)
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

## Limiti reali
- Il protocollo SSAP documenta `tv/getChannelList`, `tv/openChannel` e il lancio app, **ma non abbiamo verificato queste operazioni sulla TV dell'utente, firmware 04.60.91**. Può rispondere con 403, 404, oppure nessun elenco: registrare l'errore e non forzare nulla.
- webOS potrebbe sospendere l'app IPTV quando entra Live TV: per un'integrazione futura occorre scegliere come tornare al player, e gestire eventuale background bridge o controllo su rete locale. Nessuna implementazione integrata nell'app è già pronta.
- Non equivale a redistribuire un segnale DTT come M3U8 e non crea URL pubblici. Per **vedere nello stesso lettore** il video DVB come IPTV servirebbe un ricevitore DVB-T2 di rete (TVHeadend/SAT>IP/HDHomeRun con hardware), che non è incluso nel televisore.
- La libreria effettua il pairing esplicito autorizzato sulla TV. Chiavi e IP non vanno committati. Non esporre le porte 3000/3001 su Internet. Non attiva root né fa downgrade firmware.
- Il comando `--tune` richiede corrispondenza univoca al numero canale registrato sul TV: se ci sono ambiguità la sintonizzazione viene rifiutata.

## Fonti
- https://github.com/hobbyquaker/lgtv2
- https://www.home-assistant.io/integrations/webostv
- https://rorygallagher2024.github.io/glasshouse/development/TV-RESEARCH/
- https://github.com/tvheadend/tvheadend/blob/master/docs/markdown/introduction.md
