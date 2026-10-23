# IPTV Montecrestese Hybrid — architettura, collaudo e limiti (24 ottobre 2026)

## Obiettivo reale
Rendere **tutte e 85 le posizioni LCN richieste** consultabili dentro il lettore, senza aggiungere stream fittizi a una playlist M3U.

Un elenco IPTV puro **non** può contenere i canali del sintonizzatore LG: occorre un cambio di applicazione o un tuner di rete esterno. Per questo le sorgenti sono tipi distinti:
- IPTV: stream video autorizzato e presente nella M3U caricata (attualmente **60 candidati v10**, con alcuni ancora da provare sulla LG).
- DVB-T2: apertura del corrispondente LCN già sintonizzato tramite API SSAP, soltanto quando è presente e univoco sull'apparecchio; porta il televisore nella UI Live TV LG.
- Browser: apertura di una **pagina web ufficiale** del broadcaster, tra le 13 destinazioni selezionate. Non si tratta di URL HLS e il browser LG può non riprodurre la diretta.
- Senza soluzione: canale elencato ma nessun metodo disponibile; nessuna invenzione di URL.

Le sei voci 14, 15, 41, 44, 75, 802 sono marcate **IPTV non funzionante su LG**; la v10 le esclude dall'M3U ma il catalogo Hybrid le mantiene, con alternative. Le altre **19** sono senza URL IPTV confermato.

## Come si apre il catalogo sulla LG
1. Configurare e avviare IPTV Montecrestese, preferibilmente con la [v10 con EPG](TV_Montecrestese_LCN_v10_CANDIDATI_XMLTV_TEST.m3u).
2. Durante la riproduzione di un canale Live (non un film), premere **GIALLO**: compare il tastierino virtuale LCN.
3. Premere **VAI a tastierino vuoto** per vedere l'elenco completo delle **85 posizioni**, navigabile con frecce, OK e Indietro. Per raggiungere subito un canale non presente nella M3U, digitare invece la LCN e premere VAI.
4. All'interno delle azioni LCN, scegliere se riprodurre con **IPTV** (quando prevista) o passare a **TV terrestre** / **sito ufficiale**.
5. I tasti fisici numerici del telecomando LG potrebbero continuare a essere riservati dal sistema operativo: la navigazione ibrida evita questa dipendenza. I tasti virtuali continuano a funzionare via frecce+OK.
6. L'IPTV rimane utilizzabile senza configurazione aggiuntiva. Per DVB/siti da dentro l'app si richiede il **bridge opzionale** su PC Windows, da avviare soltanto quando necessario.

## Architettura e sorgenti
- `webos-player-custom/hybrid-catalog-source.ts` — inventario **85 LCN**, esportato nella copia upstream come `src/components/hybrid-catalog.ts`.
- `webos-player-custom/hybrid-guide-source.ts` — schermata D-pad e scelta sorgenti, client di un bridge opt-in.
- `webos-player-custom/hybrid-guide.css` — interfaccia ad alto contrasto, in coordinate grafiche webOS **1920×1080**.
- `webos-player-custom/apply-hybrid.mjs` — applicazione delle modifiche con stringhe di ancoraggio, **dopo** le patch originali, con modalità dry-run. Non sovrascrive mai il lettore GitHub esterno.
- `webos-player-custom/hybrid-guide-source.test.ts` — test per 85/60/6/19, input privati, tasti direzionali, prevenzione di cambi accidentali.
- `tools/lg-hybrid/bridge-server.mjs` — server HTTP LAN con chiave 256 bit, pairing LG ufficiale, CORS limitato e due sole azioni `tune` / `web`.
- `tools/lg-hybrid/official-fallbacks.json` — allowlist dei 13 URL ufficiali, **nessuna estrazione automatica di flussi**.
- `tools/lg-hybrid/lg-dtt.mjs` — comandi da terminale per leggere l'elenco DTT, sintonizzare una sola LCN oppure aprire la pagina ufficiale.

## Sicurezza
La chiave di collegamento è generata localmente sul PC con `randomBytes(32)`, salvata in un file ignorato da Git; l'app la registra nel proprio storage locale. La connessione è limitata a un indirizzo IPv4 **privato**, su porta 8927, scelta esplicita delle azioni, `Access-Control-Allow-Origin: null` per l'app caricata da `file://`, chiave richiesta per tutte le richieste effettive, e solo destinazioni HTTPS presenti in allowlist. Nessun root, firmware modificato, flusso DRM aggirato, trasmissione DVB redistribuita, scanner di porte o server esposto su Internet.

**Importante**: il bridge usa HTTP sulla LAN, **non** TLS: deve operare esclusivamente su una rete domestica attendibile. I browser webOS potrebbero applicare restrizioni CORS/mixed-content/private-network. Il pairing e la compatibilità end-to-end non sono ancora testati sul modello reale 24TQ510S-WZ firmware 04.60.91.

## Hardware
LG dispone già del ricevitore DVB-T2. Nessun acquisto aggiuntivo è richiesto per un **cambio applicazione verso la TV terrestre nativa**, ma occorre ricevere e aver memorizzato il canale tramite antenna.

Per **visualizzare il flusso DVB dentro la stessa finestra del player IPTV**, anziché aprire l'app TV nativa, è necessario un tuner di rete indipendente e autorizzato, eventualmente con TVHeadend/SAT>IP. Il bridge SSAP non può riprodurre o ri-trasmettere il video del tuner del televisore.

## Verifiche CI
- [LG Hybrid static safety](https://github.com/archsgio/TV-Montecrestese-IPTV/actions/workflows/lg-hybrid-qa.yml): sintassi controller e server, allowlist e controlli sulle operazioni.
- [Build IPTV Montecrestese](https://github.com/archsgio/TV-Montecrestese-IPTV/actions/workflows/lg-iptv-custom.yml): source versionata v1.17.0, patch dry-run, patch reale, test unitari, lint CSS/JS e pacchetto `.ipk`.
- [LCN QA](https://github.com/archsgio/TV-Montecrestese-IPTV/actions/workflows/lcn-playlist-qa.yml): non introduce modifiche ai 58 URL v9; v10 aggiunge soltanto LCN 59 e 83, nessun duplicato LCN, protezione undici URL LG confermati.
- Per rispettare GitHub Free è attivato `concurrency.cancel-in-progress` sulla build IPK, così i commit ravvicinati non portano a compilazioni parallele indefinite.

## Limiti da superare sul TV prima di dichiarare 100%
1. Il browser embedded consente richieste al bridge HTTP privato dall'app? Test reale.
2. La LG propone il pairing SSAP e consente `tv/getChannelList`, `tv/openChannel`, `system.launcher/open`? Test reale.
3. La LCN 802 è visibile nell'elenco DVB del TV e cambia correttamente? Dipende da frequenze e scansione.
4. Il browser LG riproduce il sito ufficiale scelto? Dipende da applicazioni e DRM; non deducibile dal semplice caricamento della pagina.
5. Le riproduzioni IPTV candidato 59 Discovery Turbo e simulcast 83 si vedono davvero?
6. Interfaccia e zoom su TV fisica 23,6 pollici: D-pad, scroll centrale, caratteri, frecce, focus e tasti numerici LG riservati.

La build precedente resta disponibile per ripristino. Nessuna dichiarazione di collaudo hardware riuscito senza prova sul televisore.
