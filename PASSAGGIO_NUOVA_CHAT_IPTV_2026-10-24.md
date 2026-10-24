# Passaggio di contesto — nuova chat IPTV Montecrestese
_Aggiornato al 24 ottobre 2026. Progetto ChatGPT: **04 - Personale**._

## Obiettivo vincolante
Creare una **app TV LG IPTV Montecrestese** per il televisore **LG 24TQ510S-WZ (webOS 22)**, con esperienza il più possibile uguale al digitale terrestre: **tutti gli 85 LCN locali/nazionali ricercati**, vera numerazione LCN e navigazione telecomando, avvio rapido e ripristino dell'ultima sorgente vista, pochi clic, cambio rapido, EPG, affidabilità video/audio e stato di salute canali con contatori e **liste dettagliate dei soli sospetti, non disponibili e non verificati**.

**Zero dipendenza quotidiana da Mac/PC/bridge/server esterno:** il Mac serve solo per installare l'IPK con webOS Dev Manager. Non usare root e non affermare che una funzionalità webOS privilegiata funzioni senza prova sul TV.

**No browser LG esterno nel flusso standard.** L'utente lo ha provato e giudicato molto scomodo: cerca prioritariamente riproduzione HLS/DASH legittima **all'interno del player**. Un eventuale riquadro web/iframe interno richiede prove su CSP, X-Frame-Options, autoplay, DRM, telecomando, licenza e prestazioni; non aggiungere un iframe alla cieca. Se impossibile, mostrare chiaramente i limiti, con la TV terrestre nativa come alternativa dove appropriato.

**Nuova regola esplicita dell'utente:** prima di implementare funzioni non familiari, cercare su GitHub 2–3 progetti open source simili, con attività e licenze chiare; confrontare architettura, dipendenze, limiti e issue. Preferire design verificati e funzioni già esistenti; non copiare codice incompatibile/di licenza incerta. Riferimento obbligatorio: [RICERCA_OPEN_SOURCE_PRIMA_DI_IMPLEMENTARE.md](RICERCA_OPEN_SOURCE_PRIMA_DI_IMPLEMENTARE.md).

## Repository ed esiti verificati
- GitHub: **https://github.com/archsgio/TV-Montecrestese-IPTV**
- Ramo lavoro: **`feature/webos-iptv-lcn-focus`** (non sovrascrivere `main`).
- Upstream app: **lennylxx/webos-iptv-player v1.17.0**, adattamenti in `webos-player-custom/`, secondo stadio `apply-hybrid.mjs`, GitHub Actions `.github/workflows/lg-iptv-custom.yml`.
- **Ultima CI verificata positiva:** [run 40083310040](https://github.com/archsgio/TV-Montecrestese-IPTV/actions/runs/40083310040), commit **`1298f6a33b08`**, 24/10/2026, con artifact **`IPTV-Montecrestese-custom-IPK` ID `12555598168`**, scadenza **7 novembre 2026**. Il verde CI non prova che il video e il launcher nativo funzionino sulla LG.
- Playlist v10 EPG: `TV_Montecrestese_LCN_v10_CANDIDATI_XMLTV_TEST.m3u`, URL:
  `https://raw.githubusercontent.com/archsgio/TV-Montecrestese-IPTV/feature/webos-iptv-lcn-focus/TV_Montecrestese_LCN_v10_CANDIDATI_XMLTV_TEST.m3u`
- Catalogo completo 85 LCN in `webos-player-custom/hybrid-catalog-source.ts`: **60 candidati IPTV**, **19 senza URL affidabile**, **6 stream già bocciati su LG**. La playlist M3U non elenca tutte le posizioni; la guida Hybrid sì. Mai spacciare 85 LCN per 85 video funzionanti.

## Risultati reali già osservati sul televisore dall'utente
- App installata e aperta sulla **LG reale**.
- Playlist v10 importata; schermata **Diretta** mostrava **59 canali** e **saltava 8 TV8 e 12 Videogruppo**. Le due voci non erano presenti nella M3U perché mancava un URL video diretto verificato, benché siano nel catalogo a 85 LCN.
- **LCN 13 Rete 7 e 83 Piemonte+ condividono identico URL HLS**. L'upstream li accorpava per URL, producendo 59 anziché 60 righe. Sul ramo il dedup è stato corretto per preservare LCN distinti anche con lo stesso video e aggiunto test di regressione.
- **Stato di salute osservato**: 56 disponibili, 3 sospetti (Rai 5, Rai Movie, Radio Birikina TV), 0 non disponibili, 0 non verificati. Le liste dei problemi appaiono sotto i contatori. Dati di quel controllo, non valori garantiti adesso.
- La LG **ricorda già l'ultimo canale del digitale terrestre** quando si spegne e riaccende. Sfruttare questa funzione nativa; l'app non sa però il nuovo LCN scelto *dentro* Live TV o i passaggi effettuati fuori dall'app.
- Nessun collaudo certo del lancio `com.webos.app.livetv` da app Developer Mode, che può fallire con permesso **-104**. Il comando apre l'ultimo canale DVB della LG, **non un LCN esatto**.

## Modifiche software attuali (verificate dalla CI, non tutte sul TV)
- Riproduzione automatica ON nelle nuove configurazioni, con opt-out persistente.
- Memoria locale `montecrestese_last_hybrid_channel_v1` di sorgente IPTV/DVB/web scelta tramite app. IPTV aggiornata soltanto dopo evento `playing`; DVB usa sentinella LCN 0 per non inventare il canale reale. «Ultimo assoluto visto anche fuori app» resta **tecnicamente non certificabile** con le sole API disponibili.
- **VERDE** nel player IPTV apre la guida 85 LCN, **GIALLO** il tastierino virtuale. L'accesso alla guida anche da **Diretta** è stato aggiunto come voce «Guida completa TV · 85 LCN», selezionabile con OK. **Richiede reinstallazione nuova IPK** per essere provato sul TV.
- La guida 85 righe non ridisegna tutti i pulsanti a ogni pressione frecce.
- Diagnostica canali sotto contatori, tre gruppi di problemi con LCN/nome, aggiornamenti DOM limitati durante scansione.
- Opzioni per stream IPTV, apertura LG Live TV e, come ultima risorsa, browser nativo. **L'utente non vuole dipendere dal browser esterno.**
- Nessuna necessità di Node.js/bridge su Mac per usare la versione TV-only.

## Caso urgente ancora aperto: TV8 e Videogruppo dentro la app
- **LCN 8 TV8:** sito ufficiale `https://www.tv8.it/streaming`, ma **nessun manifest aperto stabile autorizzato verificato**. In una ricerca il sito mostrava errore player 320. Non dichiarare lo stream fruibile.
- **LCN 12 Videogruppo:** `https://www.mediapason.it/videogruppo/` è una pagina ufficiale, **non equivale ad HLS integrabile**. Verificare manifest e diritto/compatibilità prima di tentare integrazione.
- Ricerca già registrata in [RICERCA_OPEN_SOURCE_PRIMA_DI_IMPLEMENTARE.md](RICERCA_OPEN_SOURCE_PRIMA_DI_IMPLEMENTARE.md): upstream (Apache-2.0), ZUI-WebOS (MIT), hls.js (Apache-2.0), Shaka (Apache-2.0), Jellyfin webOS (MPL-2.0); riuso dell'attuale video nativo preferito, no iframe blindato e no riproduzioni non autorizzate.
- Obiettivo UI: **i canali senza video devono COMUNQUE comparire nell'elenco principale dei numeri** in modo onesto, con stato e scelta fonte, non soltanto nella guida separata. L'attuale shortcut verso la guida da Diretta è un progresso ma **non equivale ancora a un elenco nativo unificato di 85 righe**.
- **Prossima azione consigliata:** progettare e confrontare approcci all'elenco unificato LCN 85 nella schermata Diretta (con righe virtuali per canali senza stream e handler di azione, nessuna URL fittizia); indagare le fonti TV8/Videogruppo con l'ordine GitHub/licenza/manifest/compatibilità; poi prototipo, test CI e collaudo LG reale. Non fare cambi alla playlist v10 collaudata senza mantenere rollback.

## Collaudo e installazione
- Mac: usare **webOS Dev Manager** Developer Mode; scaricare IPK da Actions del ramo. Non passare link sandbox di vecchie sessioni, usare GitHub/artifact attuale.
- Indicare chiaramente quali prove sono **CI** e quali prove sono **fisiche**. Nessun video integrato TV8/12, apertura Live TV, tempi reali di primo frame/changing sono ancora verificati sulla LG.
- [ARCHITETTURA_SOLO_TV_SENZA_MAC.md](ARCHITETTURA_SOLO_TV_SENZA_MAC.md), [OBIETTIVO_ESPERIENZA_TV_2026-10-24.md](OBIETTIVO_ESPERIENZA_TV_2026-10-24.md), [COLLAUDO_LG_SENZA_MAC_3_PROVE.md](COLLAUDO_LG_SENZA_MAC_3_PROVE.md).

## Indicazioni per il nuovo assistente
Leggi il documento presente nel repo e l'ultima situazione GitHub **prima** di cambiare codice. Conserva contesto del progetto 04 - Personale. Rispondi in italiano, evita proposte Mac/PC sempre acceso, navigazione browser esterno come UX principale, supposizioni sul supporto hardware e «tutti 85 funzionanti» non documentato. Migliora percorso rapido al canale e richiedi fotografie del TV **solo per collaudi puntuali**.
