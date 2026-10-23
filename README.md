# TV Montecrestese IPTV — playlist sperimentale

Playlist M3U per SmartOne IPTV su LG webOS. La numerazione LCN per Montecrestese (VB) segue l'elenco concordato il 23 ottobre 2026. **Non contiene video né dati di accesso.**

## Collegamenti

- [Playlist di prima prova senza EPG](TV_Montecrestese_LCN_v3_PRIMA_PROVA.m3u)
- [Playlist sperimentale con EPG](TV_Montecrestese_LCN_v3_EPG_LEGGERA.m3u)
- [Catalogo numerazioni e copertura](Catalogo_LCN_Montecrestese_APPROVATO_v3.csv)

## Impostare SmartOne

1. Aprire il portale SmartOne per le playlist M3U.
2. Inserire il TV MAC *solo sul portale SmartOne*, mai su GitHub.
3. Dare un nome (es. "Montecrestese LCN TEST").
4. Usare come M3U il link **Raw** della playlist PRIMA_PROVA, non il link della pagina GitHub.
5. Lasciare vuoto il campo EPG URL e ricaricare SmartOne.
6. Verificare il caricamento, alcuni canali e i tasti CH+/-.
7. Solo se la prima prova funziona, testare EPG_LEGGERA in una seconda lista; anche qui lasciare vuoto l'EPG URL perché è già in x-tvg-url.

## Avvertenze

- Il catalogo riporta 84 posizioni approvate; 54 hanno link di streaming **candidati**, 30 non hanno un URL. **Nessuno dei 54 link è stato testato sul televisore**.
- I link possono cessare di funzionare, essere soggetti a blocchi geografici, autenticazione, DRM o restrizioni del titolare dei contenuti. Non aggirare controlli di accesso e usare solo sorgenti autorizzate.
- L'EPG rimane sperimentale: alcuni tvg-id potrebbero non corrispondere. Non è stato verificato l'esito della guida sulla LG.
- La lista locale deriva dalle numerazioni regionali approvate, non da una scansione effettiva dell'antenna a domicilio. Rai 3 (LCN 3) non è garantito con TGR Piemonte; esiste anche la sorgente candidata LCN 802.
- Canali assenti dal file M3U non sono stati riempiti con URL inventati.
- GitHub Free è sufficiente; nessuna GitHub Actions, account IPTV o proxy è richiesto.

## Fonti

- https://www.mimit.gov.it/index.php/it/comunicazioni/televisione/fornitori-di-servizi-di-media-audiovisivi-fsma/banda-700-fsma
- https://github.com/iptv-org/iptv
- https://github.com/Free-TV/IPTV
- https://www.vcoazzurratv.it/live.php
- https://smartone-iptv.com/
