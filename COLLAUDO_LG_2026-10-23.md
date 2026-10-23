# Collaudo reale webOS IPTV Player — 23 ottobre 2026

## Risultati visibili sulla LG

Statistiche del controllo automatico nella schermata: **54 canali analizzati: 41 disponibili, 1 sospetto, 12 non disponibili**, 0 non verificati. Questi valori sono uno snapshot e possono cambiare con successivi controlli o errori di riproduzione.

### Pallini non verdi (lettura preliminare dalle fotografie)

> La resa fotografica dei colori non permette di distinguere con certezza il giallo dei sospetti dal rosso dei non disponibili. Le fotografie successive mostrano circa 15 indicatori chiari/non verdi, mentre il riepilogo ne conta 13; elenco **da usare per diagnosi, non come risultato automatico definitivo**.

- 002 Rai 2
- 014 Primantenna
- 015 GRP TV
- 019 Video Novara
- 020 20 Mediaset
- 021 Rai 4
- 022 Iris
- 025 Rai Premium
- 030 La5
- 039 Top Crime
- 041 K2
- 042 Rai Gulp
- 043 Rai Yoyo
- 046 Cartoonito
- 048 Rai News 24

### Problemi di riproduzione segnalati anche su canali con pallino verde

- 006 Italia 1: in precedenza non si vedeva; dopo la sostituzione URL, controllo automatico verde; **riproduzione non confermata**.
- 013 Rete 7 Piemonte: in precedenza non si vedeva; dopo la sostituzione URL, controllo automatico verde; **riproduzione non confermata**.
- 008 TV8: **manca dalla playlist**, perché non è stato trovato URL HLS stabile senza token temporanei.
- 002 Rai 2: nella versione precedente andava a scatti, nella fotografia attuale non verde; controllare sorgente alternativa.

## Significato degli stati

I pallini indicano il controllo automatico dei flussi effettuato dal player. Lo stato verde indica soltanto che il suo controllo ha avuto esito positivo: non equivale a riproduzione senza scatti, blocchi o restrizioni. Anche un canale verde può non vedersi.

## Piano di riparazione

1. Conservare su GitHub la v3 e la v4, **senza sovrascriverle**.
2. Cercare sorgenti alternativi per i 15 canali dubbi e per i canali verdi con riproduzione non funzionante.
3. Evitare stream provvisori, token scaduti, sorgenti che richiedono credenziali o flussi privi di autorizzazione.
4. Preparare v5 separata, da provare in parallelo; registrare per ogni canale il risultato reale su webOS.
5. Terminare solo dopo la verifica di riproduzione e EPG.
