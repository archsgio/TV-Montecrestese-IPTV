# LG 24TQ510S-WZ — identificazione e collaudo IPTV (23 ottobre 2026)

## Identificazione confermata dall'utente
- Modello: **LG 24TQ510S-WZ** (link acquisto condiviso: https://www.amazon.it/dp/B09ZV7BJJM).
- Scheda tecnica del produttore: https://www.lg.com/it/tv-soundbar/tv-fino-a-32-pollici/24tq510s-wz/
- Smart TV webOS 22 (famiglia webOS 7); display effettivo 23,6 pollici, 1366 × 768 pixel; telecomando standard in dotazione (infrarossi).
- Supporto specifico modello: https://www.lg.com/it/supporto/supporto-prodotto/cs-24TQ510S-WZ.API/
- Firmware **04.60.91**: versione segnalata in precedenti verifiche sull'apparecchio; LG la elenca sul supporto per questo modello con data 15/09/2026. Da riconfermare sul televisore prima di ogni valutazione su root.

## Implicazioni tecniche per il ramo feature/webos-iptv-lcn-focus
1. Verificare su hardware reale a **1366 × 768** che lo scroll centrato rispetti il footer, lasci il focus sempre interamente visibile anche all'ultima riga e distingua focus, selezione e canale in riproduzione. I test con altezze simulate non sostituiscono il collaudo a 768 px.
2. Installare **com.archsgio.iptv** come app separata in LG Developer Mode; non disinstallare o sovrascrivere l'app precedente.
3. Collaudare LCN 13 e 802, tastierino virtuale con pulsante GIALLO, EPG e riproduzione reale. I tasti numerici fisici sono ancora gestiti da webOS, non dalla versione IPK attuale.
4. Per i tasti fisici 0–9: Magic Mapper supporta numeri, input IR e filtro appId per il foreground; **richiede root** e un bridge verso il lettore ancora da progettare e testare. Non installare alla cieca.
5. I metodi RootMyTV v1/v2 sono notoriamente patchati. faultmanager-autoroot documenta che firmware recenti webOS 7 sono quasi tutti patchati (stato dichiarato 24/08/2025); non inferire compatibilità dall'intervallo generale webOS. jsbro-autoroot è una possibilità documentata per alcuni webOS 7+ con servizio dangbei-overlay, da **verificare per questo modello e firmware**, non è garanzia di root.
6. Solo dopo consultazione delle matrici di compatibilità e verifica dello stato reale del TV decidere se vale la pena procedere; evitare modifiche firmware, downgrade, forzature e interventi irreversibili.

## Fonti per la verifica
- LG modello: https://www.lg.com/it/tv-soundbar/tv-fino-a-32-pollici/24tq510s-wz/
- LG firmware: https://www.lg.com/it/supporto/supporto-prodotto/cs-24TQ510S-WZ.API/
- webOS Developer Mode: https://webostv.developer.lge.com/develop/getting-started/developer-mode-app
- Magic Mapper: https://github.com/andrewfraley/magic_mapper
- Root check: https://cani.rootmy.tv/
- RootMyTV stato: https://rootmy.tv/
- faultmanager patch status: https://github.com/throwaway96/faultmanager-autoroot
- jsbro-autoroot: https://github.com/raws0kil/jsbro-autoroot

Questo file documenta lo stato di analisi: non dichiara installazione, root riuscito né compatibilità root del firmware 04.60.91.
