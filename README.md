# TV Montecrestese IPTV — catalogo LCN Piemonte/VCO

## Integrazione Hybrid nell'app — 24 ottobre 2026

Il ramo sperimentale ora include la **guida interna di tutte le 85 posizioni LCN**, un selettore **IPTV / DVB-T2 nativo / sito ufficiale** e un bridge opzionale da PC Windows. Durante un canale IPTV Live: **GIALLO → VAI senza cifre** apre il catalogo; **GIALLO → digita LCN → VAI** apre la scelta delle sorgenti per i canali mancanti o i sei flussi già bocciati. Tutti gli 85 numeri sono navigabili con ↑ ↓ e OK.

**Non installare questa nuova build come versione definitiva finché GitHub Actions non è verde e il collaudo sul TV non conferma la compatibilità.** La playlist v10 rimane 60 candidati IPTV: la guida 85 LCN non aggiunge segnaposto. Il passaggio DVB richiede un canale memorizzato nell'antenna e il servizio su PC; i siti ufficiali possono non riprodurre video nel browser LG.

- [Rapporto completo, limiti e checklist](REPORT_HYBRID_85_LCN_2026-10-24.md)
- [Procedura bridge locale e controlli di sicurezza](tools/lg-hybrid/README.md)
- [Build GitHub Actions del player custom](.github/workflows/lg-iptv-custom.yml)

---

## Ricerca alternativa: LG Hybrid senza root (24/10/2026)

**La copertura IPTV pura resta 60 canali candidati su 85 LCN richiesti**, con 19 LCN senza URL e 6 URL già respinti nella v7. Da oggi esiste una seconda strada, **solo in preparazione, non collaudata sulla LG**:

1. [Controllo DVB-T2 del sintonizzatore LG via SSAP](tools/lg-hybrid/README.md): utility per Windows/Node.js basata su `lgtv2`; `--list` legge la lista canali senza cambiare app, `--tune 802` passa alla TV terrestre nativa **solo su comando esplicito**, `--return` richiama IPTV Montecrestese. Richiede approvazione pairing sul TV e canali DTT già sintonizzati, **non root**.
2. [Destinazioni ufficiali web](tools/lg-hybrid/official-fallbacks.json): 13 destinazioni di broadcaster (TV8, Cielo, Sky TG24, Italiana, LA7 Cinema, Primantenna, GRP, Sesta Rete, Mediapason, RBE). `--web 57` apre la pagina ufficiale RaiPlay di Italiana; **non** trasforma HTML in HLS né garantisce compatibilità webOS del player online.
3. Possibile futura integrazione nella lista LCN della app (IPTV → DVB nativo oppure browser ufficiale, con indicatore di provenienza). **Non implementata né testata nel lettore IPK**. Il passaggio al DVB cambia applicazione: non si può incorporare il tuner nella WebApp senza ulteriore supporto hardware/firmware.

**Correzione LCN 57**: Italiana è effettivamente il canale Rai subentrato a Rai Scuola **1 ottobre 2026**, disponibile sul web in diretta ufficiale https://www.raiplay.it/dirette/italiana . Il catalogo Montecrestese originale aveva il nome giusto; è errata una vecchia ipotesi di ripristinare Rai Scuola.

Fonti tecniche: https://github.com/hobbyquaker/lgtv2 , https://www.home-assistant.io/integrations/webostv . Contributi e dettagli: [rapporto v10](REPORT_V10_RICERCA_IPTV_2026-10-24.md).

---

## Aggiornamento v10 — recuperati due candidati, 24/10/2026

**Nel solo ramo sperimentale**: 60 voci, 58 originali della v9 più **59 Discovery Turbo** (master HLS e playlist media raggiungibili) e **83 Piemonte+** (normale simulcast di Rete 7 LCN 13, possibili finestre regionali diverse). **19 posizioni senza URL**; i **6 stream bocciati sulla LG** restano esclusi dalla v10. Nessuna prova v10 sulla LG è stata ancora svolta.

- [Playlist v10 con guida XMLTV](TV_Montecrestese_LCN_v10_CANDIDATI_XMLTV_TEST.m3u), 45 `tvg-id` mappati come nella v9.
- [Playlist v10 senza guida](TV_Montecrestese_LCN_v10_CANDIDATI_FLUSSI_TEST.m3u), utile per isolare il playback.
- [Catalogo completo v10 con 85 posizioni](Catalogo_LCN_Montecrestese_v10_STATO.csv).
- [Rapporto ricerca, prove dei manifest e sorgenti scartate](REPORT_V10_RICERCA_IPTV_2026-10-24.md).
- [Validazione automatizzata](.github/workflows/lcn-playlist-qa.yml).

URL importazione in player:
```
https://raw.githubusercontent.com/archsgio/TV-Montecrestese-IPTV/feature/webos-iptv-lcn-focus/TV_Montecrestese_LCN_v10_CANDIDATI_XMLTV_TEST.m3u
https://raw.githubusercontent.com/archsgio/TV-Montecrestese-IPTV/feature/webos-iptv-lcn-focus/TV_Montecrestese_LCN_v10_CANDIDATI_FLUSSI_TEST.m3u
```

La v7 su `main` e la v9 nel ramo restano disponibili per ripristino. Non caricare insieme due copie dello stesso elenco.

---

## Nuova v9 — elenco operativo di prova (23/10/2026)

**Solo in questo ramo sperimentale; la v7 di riferimento su `main` resta invariata.** La v9 conserva gli URL dei **58** canali non bocciati sul televisore e omette i **6** già confermati non funzionanti (14, 15, 41, 44, 75, 802). Non è la lista completa: **21 LCN** restano ancora senza URL verificato.

- [v9 pulita con EPG](TV_Montecrestese_LCN_v9_PULITA_XMLTV_TEST.m3u) — 58 canali, 45 identificativi XMLTV.
- [v9 pulita senza EPG](TV_Montecrestese_LCN_v9_PULITA_FLUSSI_TEST.m3u) — stessi 58 URL.
- [Catalogo completo aggiornato: 85 LCN e risultati reali](Catalogo_LCN_Montecrestese_v9_STATO.csv).
- [Rapporto di ricerca e motivazioni delle esclusioni](REPORT_V9_OTTIMIZZAZIONE_LCN_2026-10-23.md).
- [Validatore statico e regressioni](scripts/audit-playlist-montecrestese.mjs).

Le URL dirette per configurare il lettore domani (attivare una sola playlist per volta):

```
https://raw.githubusercontent.com/archsgio/TV-Montecrestese-IPTV/feature/webos-iptv-lcn-focus/TV_Montecrestese_LCN_v9_PULITA_XMLTV_TEST.m3u
https://raw.githubusercontent.com/archsgio/TV-Montecrestese-IPTV/feature/webos-iptv-lcn-focus/TV_Montecrestese_LCN_v9_PULITA_FLUSSI_TEST.m3u
```

**Non è ancora stato fatto il collaudo sulla LG della v9.** La mancanza di un canale dall'IPTV non implica la sua assenza dal digitale terrestre.

---


> **Esito collaudo v8 (23/10/2026): nessuna delle tre modifiche (15 GRP TV, 41 K2, 802 Rai 3 TGR Piemonte) ha funzionato sulla LG. La v8 è bocciata; usare la v7 come riferimento.** Dettagli: [Collaudo v8 negativo](COLLAUDO_LG_V8_ESITO_NEGATIVO_2026-10-23.md).


**Ultimo aggiornamento: 23 ottobre 2026 • Playlist v7 di prova.**

La playlist è personalizzata per la numerazione dei canali digitali terrestri approvata dall'utente. Le sorgenti IPTV sono riferimenti esterni, **non sono distribuiti video, file di accesso, token personali né password**.

## Quale lista caricare sulla LG

- **Prima prova senza EPG (64 canali)**: https://raw.githubusercontent.com/archsgio/TV-Montecrestese-IPTV/main/TV_Montecrestese_LCN_v7_FLUSSI_TEST.m3u
- **Dopo, prova con EPG XMLTV (64 canali)**: https://raw.githubusercontent.com/archsgio/TV-Montecrestese-IPTV/main/TV_Montecrestese_LCN_v7_XMLTV_TEST.m3u
- **Catalogo completo, con stato per ogni posizione LCN (85 voci)**: [CSV](Catalogo_LCN_Montecrestese_v7_STATO.csv)
- **Rapporto delle verifiche**: [REPORT_V7_FLUSSI_EPG.md](REPORT_V7_FLUSSI_EPG.md)
- **Specifiche per mostrare LCN reali nell'app**: [PIANO_CORREZIONE_NUMERAZIONE_LCN_PLAYER.md](PIANO_CORREZIONE_NUMERAZIONE_LCN_PLAYER.md)

## Stato: *non ancora definitivo*

- 54 canali della v6 mantenuti esattamente come prima.
- 9 URL HLS nuovi con **manifest scaricato e riconosciuto nel controllo esterno**: 11 Telecupole, 18 Canale Italia, 37 Discovery, 53 Italia 53, 68 BOM Channel, 70 Radio Italia TV, 73 Radio Bruno TV, 78 Motori TV, 96 Radio Birikina TV.
- 1 nuovo URL come **candidato NON verificato**: 75 Top Calcio 24.
- Totale 64 candidati in playlist; 21 emittenti del catalogo ancora senza URL credibile.
- Non risolti nella v6 anche i canali 14 Primantenna, 15 GRP TV, 41 K2 e 44 Frisbee; mantenuti ma l'utente segnala che non si vedono.
- Mancano ancora 8 TV8, 12 Videogruppo e 72 Telelombardia: NON sostituire con l'URL di un'emittente diversa.
- L'EPG usa formato **XMLTV gzip**: https://www.open-epg.com/files/italy3.xml.gz. **49 dei 64 tvg-id** sono stati abbinati ai canali presenti in questa fonte. Gli altri restano senza mappatura, inclusi diversi canali locali.
- La EPG, come i 10 canali aggiuntivi, **non è stata verificata sulla LG**.

## Prova sulla TV

1. Aprire webOS IPTV Player → **Impostazioni → Sorgenti**.
2. Aggiungere una playlist M3U con il primo URL (`v7_FLUSSI_TEST.m3u`) e **salvare le modifiche**.
3. Disabilitare temporaneamente la vecchia playlist per non creare doppioni (non eliminarla).
4. In **Impostazioni → Canali**, avviare **Verifica lo stato dei canali**, poi verificare anche la riproduzione con il telecomando. Annotare i nuovi canali che non si vedono.
5. Se la v7 è utilizzabile, **modificare la stessa playlist** passando al secondo URL (`v7_XMLTV_TEST.m3u`) e salvare.
6. La versione EPG scopre automaticamente la guida dall'intestazione M3U `x-tvg-url`; non aggiungerla nuovamente come sorgente manuale, a meno che l'importazione automatica non fallisca.
7. Aprire **Guida**, attendere l'aggiornamento. Fuso orario: **Dispositivo** e correzione **0 minuti** inizialmente.

## Numerazione e tasti sul telecomando

Il numero nel **nome** del canale e nel metadato `tvg-chno` preserva la LCN italiana, **con salti numerici**. L'attuale lettore open source visualizza invece anche una posizione progressiva nella colonna sinistra e i tasti numerici LG sono intercettati da webOS: questi limiti **non** sono risolti modificando soltanto la playlist.

## Fonti

- [Trasmissione DVB-T e LCN locali](https://sites.google.com/view/alessandriadigitale/home-page/info-mux-nit)
- [Free-TV/IPTV](https://github.com/Free-TV/IPTV)
- [webOS IPTV Player](https://github.com/lennylxx/webos-iptv-player)
- [Guida XMLTV Italy3](https://www.open-epg.com/app/epgguide.php)

URL che richiedono autenticazione, DRM o token temporanei non sono stati inseriti come sorgenti permanenti. Il test esterno di un manifest è solo un'indicazione: la verifica finale deve essere fatta con video e audio sulla LG e non sostituisce un controllo dei diritti d'uso.
