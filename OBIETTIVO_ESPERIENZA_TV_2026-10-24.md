# Obiettivo: esperienza televisore tradizionale — 24 ottobre 2026

Queste sono le regole di progetto per **tutti i prossimi aggiornamenti** di IPTV Montecrestese sulla LG 24TQ510S-WZ.

## Azioni immediate già implementate sul ramo di sviluppo
- **Accendi TV / avvia IPTV:** per una nuova installazione, riproduzione automatica abilitata di default; il lettore conserva `iptv_last_channel_key` e `iptv_last_channel` e riapre l'ultimo canale IPTV disponibile. Se l'utente ha esplicitamente impostato OFF (`iptv_auto_play=false`), la modifica **non** annulla la preferenza.
- **Guida unica**: mentre si guarda un canale live, un solo tasto **VERDE** apre direttamente il catalogo di **85 LCN**. Se sidebar o menu sono già visibili, il verde conserva il comportamento originale di cambio preferiti. In VOD il verde non apre la guida TV.
- **Scelta diretta numerica**: **GIALLO** apre il tastierino virtuale navigabile con frecce/OK; VAI con numero seleziona il canale LCN esatto (NON il numero della riga nella M3U); VAI a vuoto apre la guida 85 LCN.
- **Rimangono semplici**: FRECCE su/giù/OK nella guida; CH+/CH− per cambiare fra canali della playlist IPTV; BACK per tornare; la guida Hybrid non apre automaticamente il canale DVB nativo o un sito web quando il focus passa su una voce.
- **Configurazione persistente**: EPG, ultima visione, preferenze e playlist restano salvate nell'app locale e non devono essere reinserite a ogni avvio.
- **Test automatici**: `montecrestese-living-room.test.ts` per default-on e opt-out, recupero canale salvato e LCN sparse; verifiche esistenti di guida e telecomando; packaging IPK, TypeScript e CSS.

## Accesso all'app dalla Home della LG webOS 22
webOS 22 documenta **Quick Access**:
1. Aprire IPTV Montecrestese dalla Home.
2. Tenere premuto un tasto da **1 a 8** (consigliato 1) fino alla finestra di conferma.
3. Confermare **Sì**: dalle accensioni successive, una pressione lunga del tasto scelto può aprire direttamente l'app.
4. Tenendo premuto **0** si apre la gestione Quick Access; **9** è assegnato all'aiuto.
5. In caso di app Developer Mode non registrabile in Quick Access sul modello concreto, spostare la sua icona fra le prime della Home (ordinamento tramite matita). **Non considerare il supporto a Quick Access garantito prima del test LG**.

Fonti:
- [Guida ufficiale webOS 22 Quick Access](https://kr.eguide.lgappstv.com/manual/w22_mr3/global/Contents/control/quickaccess_k_u_b_e_c_a_t/eng/w22__control__quickaccess_k_u_b_e_c_a_t__eng.html)
- [Ordinare le applicazioni sulla Home](https://www.lg.com/it/supporto/guide-soluzioni/tv/webos-22/)
- [Home Auto Launch e Quick Start+](https://www.lg.com/us/support/help-library/how-to-set-the-startup-screen-on-your-lg-tv-CT10000030-20155412183664)

**Avvio automatico della nostra specifica app al solo comando Accensione** non è garantito da webOS 22: la funzione Home Auto Launch non è una preferenza per far partire una singola app Developer Mode. Evitare root o presunte impostazioni di avvio non documentate. Con Quick Access più auto-riproduzione si riduce a un comando fisico prolungato l'accesso al video.

## Tre esempi di uso quotidiano

| Obiettivo | Comandi previsti |
|---|---|
| Riaprire IPTV | Pressione prolungata del tasto Quick Access assegnato; auto-visione dell'ultimo IPTV |
| Consultare tutti gli 85 LCN | VERDE durante la visione Live; frecce; OK |
| Selezionare un LCN esatto | GIALLO; tastierino virtuale frecce/OK; VAI |
| Cambiare canale IPTV | CH+ / CH− o frecce su/giù se il player è a tutto schermo |
| Canale senza flusso | VERDE → LCN → opzione **TV terrestre** o **Sito ufficiale** con bridge configurato; **nessun cambio automatico improvviso** |

## Limiti da non confondere con funzioni pronte
- Il ripristino dell'ultimo canale **oggi riguarda IPTV**: se l'ultima sorgente aperta è la TV terrestre nativa LG, l'app non può sapere con certezza cosa è stato poi visto dentro Live TV. Per un ripristino completamente ibrido servirà memorizzare in modo sicuro anche la scelta DVB/sito e verificare su hardware.
- La guida dei canali è una lista di 85 posizioni, non 85 stream video certificati. I canali senza sorgente attendibile restano marcati come tali.
- I tasti numerici fisici 0–9 possono essere intercettati da webOS per la TV terrestre; il tastierino virtuale è il percorso robusto senza root.
- Il launcher Quick Access e l'uso del tasto Verde vanno provati con telecomando fisico e firmware LG reale. Quick Access funziona mediante pressione lunga, non con digitazione breve.
- Le icone di app e playlist vengono predisposte una volta; non dobbiamo chiedere di confermare o ricaricare le playlist a ogni accensione.

## Prossime evoluzioni da collaudare prima di integrare
1. Impostare un solo canale corrente a livello di guida, indipendente dalla sorgente (IPTV / antenna / web) e riaprirlo soltanto con preferenza esplicita e bridge disponibile.
2. Conservare CH+/CH−, immediato e coerente, nella lista di 85 LCN **senza finire su canali impossibili da vedere**, prendendo atto che saltare alla TV terrestre nativa interrompe la nostra schermata.
3. Offrire un feedback video «sorgente non disponibile» con un'unica proposta di alternativa, senza menu tecnici.
4. Ridurre menu e OSD durante la visione e rendere immediato il ritorno all'ultimo IPTV dopo la TV terrestre.
5. Verificare avvio a freddo e caldo, impatto delle pause Developer Mode, Quick Start+, stabilità stream e dimensione dei caratteri sulla TV.

Ogni nuova funzione va testata con un tasto e un flusso d'uso reali prima di dichiararla pronta.
