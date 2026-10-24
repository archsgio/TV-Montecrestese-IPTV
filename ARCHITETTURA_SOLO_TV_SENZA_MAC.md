# IPTV Montecrestese — uso quotidiano SOLO sulla LG

**Regola di progetto (24 ottobre 2026): il Mac serve unicamente per installare e aggiornare l'IPK. Non deve essere acceso, né collegato, per guardare la televisione, aprire un canale terrestre, scegliere una fonte web ufficiale o tentare di riprendere l'ultima fonte aperta dalla nostra app.**

## Come funziona ora la build in sviluppo

1. **Fonte IPTV**: riproduzione interna. La nostra app salva LCN e ora solo dopo il reale evento `playing`; all'avvio riapre l'ultimo canale IPTV se questa è l'ultima sorgente registrata.
2. **Fonte antenna/DVB-T2**: usa direttamente il comando nativo `luna://com.webos.applicationManager/launch`, avviando `com.webos.app.livetv` dal televisore stesso. **LG conserva nativamente l'ultimo canale terrestre sintonizzato** e lo ripristina quando si apre Live TV, anche dopo lo spegnimento: la nostra app **non** deve risintonizzarlo. Nella memoria `source=dvb, lcn=0` indica intenzionalmente *numero effettivo gestito dalla LG*, senza inventare che l'LCN selezionata nella guida sia stata sintonizzata.
3. **Fonte web**: la stessa API apre `com.webos.app.browser` con la destinazione HTTPS ufficiale selezionata dalla whitelist del catalogo. L'apertura della pagina non garantisce la riproduzione del video.
4. **Ripresa**: se l'ultima sorgente *aperta tramite la nostra app* è DVB, l'app riapre Live TV e lascia che LG riprenda l'ultimo canale reale. Se è web, può riaprire la pagina ufficiale; se è IPTV, riproduce l'ultimo stream confermato. Nessuna chiamata LAN, PC, Mac, Node.js, pairing remoto o chiave d'accesso.
5. **Guida 85 LCN**: canali IPTV disponibili riprodotti internamente; per i restanti viene offerto il passaggio a **TV terrestre LG (ultimo canale terrestre reale)** o, ove disponibile, un sito ufficiale. La guida **non** promette che scegliere LCN 802 sintonizzi direttamente il tuner su 802.

## Limiti reali da verificare

- La documentazione ufficiale conferma l'API `applicationManager/launch` e l'apertura del browser. Bisogna comunque collaudare sul LG **24TQ510S-WZ webOS 22** l'apertura di `com.webos.app.livetv`, la sospensione/riapertura della nostra app e l'accesso ai siti.
- **Rilevazione automatica di ogni cambio LCN effettuato nella app Live TV**: una normale app sviluppatore sospesa non ha una API pubblica affidabile per osservarlo continuamente. Non occorre per riaprire **il canale terrestre** perché è la LG stessa a ricordarlo. Resta impossibile dimostrare che la nostra app sappia sempre se, nel frattempo, l'utente è passato dal launcher alla TV terrestre o al browser fuori dal nostro selettore.
- **Selezione diretta di una precisa LCN via guida ibrida**: non ancora disponibile. Dopo l'apertura della TV terrestre, il telecomando LG controlla il sintonizzatore e i numeri. L'accesso diretto a una LCN via servizi privilegiati non è previsto nell'app non-root.
- **Accensione → lancio automatico della app**: la LG webOS TV consumer non offre una API pubblica per far partire automaticamente la nostra applicazione all'accensione. Possibile Quick Access / icona ordinata nella Home, da verificare sul telecomando reale.
- Il tuner LG non viene re-trasmesso come M3U8 e il video DVB non appare *dentro* il lettore IPTV: si passa alla schermata Live TV di sistema.
- Il ripristino dell'ultima **pagina** web non garantisce che il canale web sia stato effettivamente visto.

## Stato dei componenti

- `webos-player-custom/native-tv-source.ts`: avvio fonti con API Luna TV nativa.
- `webos-player-custom/hybrid-guide-source.ts`: scelta senza opzioni di collegamento al Mac/PC.
- `webos-player-custom/hybrid-last-source.ts`: storia locale; nessuna richiesta HTTP al Mac.
- `tools/lg-hybrid/bridge-server.mjs`: prototipo sperimentale **non richiesto e non collegato alla nuova app TV-only**; mantenuto come codice di ricerca, ma **non** come prerequisito. Non avviarlo per il collaudo normale.

## Fonti tecniche

- LG ufficiale: https://webostv.developer.lge.com/develop/references/application-manager
- LG ufficiale: https://webostv.developer.lge.com/develop/guides/app-lifecycle-management
- LG ufficiale: https://webostv.developer.lge.com/develop/references/webostvjs-webosdev
- LG Developer Community (autolaunch all'accensione non disponibile): https://forum.webostv.developer.lge.com/t/how-to-make-the-app-launch-automatically-after-power-on/28121
