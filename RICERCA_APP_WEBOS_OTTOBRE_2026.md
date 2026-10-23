# App GitHub recenti per sostituire/migliorare webOS IPTV Player
**Ricognizione del 23 ottobre 2026** — dopo richiesta di migliorare focus D-pad, bordo selezionato tagliato in basso, numerazione LCN autentica e uso dei numeri fisici sulla LG.

## Risultato più importante — webos-iptv-native, pubblicato 19–20 ottobre 2026
- Repository: https://github.com/mac-lucky/webos-iptv-native
- Creato: 2026-10-19, release v0.1.1: 2026-10-20; IPK `io.github.maclucky.webosiptv_0.1.1_arm.ipk` pubblicato.
- Applicazione nativa Rust/GPU con player hardware LG, playlist M3U, XMLTV, zapping, gruppi e preferiti. **Non richiede necessariamente root**, installazione via Developer Mode dichiarata.
- Sviluppata/testata su LG C1 (webOS 6) e LG C5 (webOS 25). Su modello LG utente e firmware 04.60.91: **non verificata**.
- Risultato tecnico importante: `crates/iptv/src/model.rs` definisce `Channel.number: Option<u32>` da `tvg-chno` / `channel-number` / `tvg-num`. `crates/screens/src/number.rs` implementa `find(data,n)` con `draw::channel_number(c,i)`, numero dichiarato o fallback all'indice. **Il lookup LCN reale è già presente**: 7/9/13/75/802 senza canali segnaposto.
- Codice delle cifre esiste (`Key::Digit` e `NumberEntry`) ma su LG reale bisogna vedere se arrivano i keyevent; il simulatore Mac non prova il comportamento del telecomando fisico che webOS può intercettare.
- Versione giovane, 0.1.1; non è corretto dichiararla più stabile del player web attualmente utilizzato senza installazione e verifica.

## Altri IPTV
- https://github.com/sharktie/lg-iptv — release v1.0.32 del **19 ottobre 2026**, M3U, XMLTV, catch-up, multiview e installazione Dev Mode. `js/livetv/numpad.js` sintonizza PER POSIZIONE della lista, **non per tvg-chno**: non soddisfa automaticamente il requisito LCN.
- https://github.com/smartonaut/smartys-iptv-webos — creato il 16 ottobre 2026, release v1.1.2; IPTV/EPG, ma il README parla di pairing con pannello account/MAC e password. Non verificata compatibilità con nostra M3U pubblica.
- https://github.com/ZUI-WebOS/ZUI-IPTV-Player — rootless, M3U/XMLTV, **non nuova** (creato maggio 2026, release settembre); opzione secondaria.
- https://github.com/lennylxx/webos-iptv-player — attuale applicazione; release v1.17.0 del 20 ottobre 2026. Numeri da tastierino elaborati come posizione `event.number-1`, la lista mostra `globalIdx+1`. Ha supporto a M3U, XMLTV, gruppi, video/EPG e diagnostica funzionanti sulla TV, ma presenta i difetti UX segnalati.

## Soluzioni per telecomando/launcher
- https://github.com/lasharor/cleanyourtv-WebOS — creato il 21 ottobre 2026, release v1.5.16 del 23 ottobre; richiede root, integra Live TV M3U/XMLTV e numeri fisici (ordinamento playlist, NON `tvg-chno`). Può intercettare tasto Guida e personalizzare home. Alto impatto/rischio vs nostra esigenza.
- https://github.com/simbasjungles/free-my-tv — creato 19 ottobre, v1.1.0 del 22 ottobre 2026; **senza root**; nuovo launcher/home, associa una app ai numeri con **pressione lunga** (Quick Access). **NON** offre il cambio canale IPTV per numerazione LCN con pressione normale.
- https://github.com/OmkarK97/webos-vibehack — creato il 19 ottobre, senza root, nuovo launcher, hotkey app con tasto numerico tenuto premuto. Testato su webOS26, non sostituisce lettore IPTV.
- https://github.com/ecklf/lg-luma — creato il 19 ottobre, v2.1.0 pubblicata il 23 ottobre; launcher nativo root richiesto, test LG C5 webOS26; non risolve canali IPTV direttamente.
- https://github.com/brandon-irving/starter-webos-tv-app — creato 19 ottobre, template per app webOS con gestione focus D-pad e strumenti di installazione/debug e automatizzazione. Non è un lettore TV completo, ma **utile come riferimento tecnico** per migliorare contrasto focus e vista scorrimento dell'app attuale.
- https://github.com/Simon34545/lginputhook / https://github.com/afonsojramos/magic-mapper-webos — rimappatura input via root, da valutare solo dopo verifica hardware e firmware. Root non garantisce che i tasti fisici possano essere consegnati in modo pulito all'app.
- https://github.com/webosbrew/caniroot, https://cani.rootmy.tv — controlli root solo modello/OTAID/firmware esatto. Non tentare un exploit sul solo numero di firmware.

## Raccomandazione operativa

1. Prima della customizzazione/root della LG, **collaudare `webos-iptv-native v0.1.1` a fianco del player attuale**, senza disinstallarlo. Su Mac usare webOS Dev Manager, che è già configurato; installare pacchetto `.ipk` dalla release ufficiale, assicurandosi compatibilità dell'architettura.
2. Test senza rischi: importare playlist M3U v7 XMLTV dello stesso repository, verificare 5 stream noti funzionanti, EPG Rai2 e LCN 7/9/13/75/802, leggibilità focus/ultimo canale, numeri hardware. Evitare doppioni e salvare configurazione precedente.
3. Se il nativo soddisfa tutto tranne tasti fisici, modificare il software e, come alternativa no-root, tastierino virtuale con frecce/OK.
4. Solo se essenziale i tasti fisici e verificata rootabilità reale, analizzare `lginputhook` / `Magic Mapper` con protezione del DTT quando l'app è chiusa e piano di rollback; **nessun rooting eseguito**.
5. Evitare sostituzione del lettore corrente senza test completo, specialmente con fonti HLS-DASH, TV locale ed EPG in italiano.

Fonti: README, codice e release API GitHub consultate il 23/10/2026. Tutte le compatibilità LG sul televisore specifico rimangono da collaudare.
