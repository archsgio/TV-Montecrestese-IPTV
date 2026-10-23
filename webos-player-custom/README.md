# IPTV Montecrestese: patch personalizzata del lettore webOS

**Stato: codice predisposto e verificato sugli anchor GitHub il 23 ottobre 2026; non compilato, non installato né collaudato sulla LG.** La v7 M3U rimane invariata.

## Perché qui e non in main
Lo sviluppo avviene nel branch `feature/webos-iptv-lcn-focus`. Il codice applica modifiche a una **copia separata** di [lennylxx/webos-iptv-player](https://github.com/lennylxx/webos-iptv-player), versione `1.17.0`, licenza Apache-2.0. Non abbiamo permessi di scrittura sul repository dell'autore.

## Funzioni preparate
- LCN visibile e ricercabile da `tvg-chno`: il canale n. 13 è il vero LCN 13, non la tredicesima riga; funziona anche con LCN 802 su 64 canali. Nessun canale segnaposto per LCN mancanti.
- Focus remoto ad alto contrasto: bordo giallo e sfondo blu nelle liste, gruppi, colonne laterali e barra superiore; la voce in riproduzione resta distinta dal focus.
- Scorrimento: calcolo altezza effettiva della lista considerando footer e margini del focus, padding di sicurezza sul fondo senza cambiare la geometria virtualizzata.
- Pacchetto con identificatore diverso dall'app originale (`com.archsgio.iptv` e servizio `com.archsgio.iptv.service`) per limitare interferenze. L'app originale NON viene disinstallata.
- Test Vitest aggiunto per LCN sparsi, buchi e fallback.
- **Tastierino virtuale funzionante a livello di implementazione**: mentre guardi un canale live, il tasto giallo apre un pannello 0–9 navigabile con frecce, OK e Indietro. Consente LCN 802 e segnala un LCN non presente; non richiede root. Durante VOD il tasto giallo mantiene l'OSD originale.
- È predisposto il trattamento logico dei numeri fisici **solo quando il sistema li consegna all'app**; non cattura i numeri sottratti dal firmware webOS. Per questi serve una fase separata, con eventuale root e bridge locale.

## Applicare al checkout della versione originale (su Mac o altro PC)
```bash
git clone --branch v1.17.0 --depth 1 https://github.com/lennylxx/webos-iptv-player.git webos-iptv-montecrestese
cd webos-iptv-montecrestese
node /PERCORSO/TV-Montecrestese-IPTV/webos-player-custom/apply-patches.mjs "$PWD" --dry-run
node /PERCORSO/TV-Montecrestese-IPTV/webos-player-custom/apply-patches.mjs "$PWD"
npm ci
npm run typecheck
npm run lint
npm test
npm run service:typecheck
npm run package
```

Sostituire `/PERCORSO/TV-Montecrestese-IPTV` con un checkout del nostro repository sul branch `feature/webos-iptv-lcn-focus`. Lo script arresta tutto alla prima differenza rispetto agli anchor attesi, prima di sovrascrivere file: **non eseguire sulle sorgenti sbagliate**. Usa `git diff` nel clone del lettore per controllare le modifiche.

**Nessuna installazione automatica sulla TV**: il pacchetto può essere installato usando webOS Dev Manager dopo verifica di build, nome e ID. Lo script di build contiene ora l'ID personalizzato, ma è preferibile installare a mano solo dopo verifica.

## Verifica statica eseguita in questa sessione
- Il manifesto è stato verificato **contro il codice del tag upstream v1.17.0** (non soltanto contro il branch main).
- **34 modifiche** su **13 file** esistenti e **4 file nuovi**; nessun riferimento mancante.
- Il processo di applicazione è stato simulato due volte sul testo integrale degli originali: **13/13 file trasformati, 13/13 riapplicazioni identiche, 0 errori di anchor**.
- Non equivale a compilazione né a collaudo reale di video / focus / EPG.

## Cosa manca
- Verifica automatica complessiva su una copia completa dei sorgenti: questa sessione non dispone di accesso di rete Git dal container, dunque sono stati confrontati gli anchor col contenuto reale tramite il connettore GitHub, ma **non eseguiti tsc, ESLint, Vitest o un build IPK**.
- Layout/reflow reale nella LG: solo un test su TV può garantire che il focus non sia tagliato ai bordi durante scorrimento rapido.
- Il tastierino virtuale è implementato ma non ancora collaudato sulla LG; il **bridge numerico root** non è ancora implementato.
- Compatibilità del rooting: mancano modello LG e identificativo OTA/firmware verificati. Non installare Magic Mapper senza controllo di compatibilità e piano di recupero.
- Con un ID app diverso la migrazione manuale della playlist originale può essere necessaria. Caricare la URL v7 con XMLTV: https://raw.githubusercontent.com/archsgio/TV-Montecrestese-IPTV/main/TV_Montecrestese_LCN_v7_XMLTV_TEST.m3u
- I 6 canali storicamente non funzionanti non sono riparati da queste modifiche (problemi di stream remoti).

## Perché il root non è richiesto nella prima fase
Il root riguarda soltanto la cattura dei tasti numerici fisici. Il sistema di condizioni per applicazione è implementato in `andrewfraley/magic_mapper` (eventi Linux 2..11, filtro `appId`, passthrough quando l'app è diversa). **Senza root questa tecnica non può funzionare**. Una possibile integrazione futura richiede un servizio loopback autenticato e disabilitato quando IPTV non è in primo piano; non è una funzione della patch corrente.

## Sicurezza / ripristino
- Conservare e usare l'app originale per una ripresa immediata.
- Non cambiare i flussi video o i relativi diritti.
- Non attivare l'intercettazione `EVIOCGRAB` senza test di pass-through, monitoraggio e kill switch.
- Il progetto custom conserva l'avviso licenza Apache-2.0 dell'autore nel clone.
