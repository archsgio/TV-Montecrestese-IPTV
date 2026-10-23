# Numerazione LCN reale senza posizioni vuote

## Requisito

Mostrare i numeri LCN originali del digitale terrestre, consentendo buchi: 7 LA7, 9 NOVE, 10 Telecity, 13 Rete 7, 15 GRP, 17 VCO Azzurra. Con CH+/CH− il player deve saltare direttamente ai canali successivi effettivamente presenti, senza righe vuote. Il televisore LG attualmente intercetta i tasti numerici fisici e passa al DTT: il codice dell'app potrebbe non poter impedire tale comportamento.

## Risultato dell'ispezione del progetto open source

Repository: https://github.com/lennylxx/webos-iptv-player

- `src/parsers/m3u-parser.ts`: il parser riconosce `tvg-chno` e lo memorizza in `channel.channelNumber`.
- `src/components/channel-list.ts`: la lista visualizza `globalIdx + 1` anziché `channel.channelNumber` per il numero a sinistra.
- `src/components/channel-list.ts` azione `number`: utilizza `event.number - 1` (indice).
- `src/components/player.ts`: il numero nel player è `this.currentIndexAnchor + 1`, e il salto numerico usa `number - 1`.
- `src/navigation/key-handler.ts`: il massimo numero di cifre si basa sul conteggio dei canali anziché sul maggiore LCN.

## Correzione da realizzare nell'app

1. Mostrare `channel.channelNumber ?? (globalIdx + 1)` nella colonna numerazione, in OSD e nella sidebar.
2. Se l'app riceve tasti numerici, individuare il canale per `channel.channelNumber`; fallback al numero progressivo soltanto se manca il metadato.
3. Adattare la lunghezza massima del numero a `Math.max(...channel.channelNumber)`, compreso 802.
4. Conservare CH+/CH− navigazione sequenziale tra canali reali (i buchi non generano righe).
5. Aggiornare tests/playlist M3U, test con numeri 1,7,9,10,13,17,48,802 e liste con buchi.
6. Verificare su LG webOS se i tasti numerici vengono ancora intercettati dal sistema: questa limitazione potrebbe richiedere un telecomando/dispositivo esterno.

Questa è **una specifica tecnica**, non una modifica già installata o disponibile all'utente. La playlist v6 continua a riportare correttamente `tvg-chno` ma il player corrente mostra numeri progressivi a sinistra.

## URL canali rossi v6

Sono modificati soltanto i canali 15, 19 e 46. Conservo la v5 come precedente testata.

- **LCN 15 015 GRP TV**: `https://webstream.multistream.it/memfs/a3195c96-f884-4c74-924f-2648814fc0b5.m3u8` — fonte: GRP official streaming player / Free-TV; precedente `https://5cbd3bc28341f.streamlock.net:444/grp/live/playlist.m3u8`
- **LCN 19 019 Video Novara**: `https://ed04.top-ix.org/avtvlive/videonovara/streaming/playlist.m3u8` — fonte: Video Novara official player TOP-IX / Free-TV; precedente `https://sb.top-ix.org/avtv04/_definst_/streaming/playlist.m3u8`
- **LCN 46 046 Cartoonito**: `https://live02-col.msf.cdn.mediaset.net/live/ch-la/la-clr.isml/index.m3u8` — fonte: Public Mediaset HLS alternate CDN / playlist IPTVSAT; precedente `https://live03-col.msf.cdn.mediaset.net/live/ch-la/la-clr.isml/manifest.mpd`

Ancora sospetti: LCN 14 Primantenna (sorgente nota segnalata come non funzionante) e 41 K2 (due sorgenti già testate con esito incerto); non sovrascrivere con URL non affidabili.

**Nota**: i 3 nuovi URL sono candidati da verificare nel player. L'esito dei ping/probe non garantisce il video.
