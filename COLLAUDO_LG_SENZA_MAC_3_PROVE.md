# Collaudo prioritario IPTV Montecrestese — solo LG, Mac spento

Questa procedura serve a **verificare il cambio fonte diretto** su LG 24TQ510S-WZ, webOS 22, prima di dichiarare IPTV Montecrestese un sostituto reale del digitale terrestre. Nessun root, nessun bridge, nessun computer acceso durante la visione.

## Prima: installazione una tantum

1. Dal Mac, scaricare l'IPK **dall'ultima build riuscita** su [GitHub Actions — LG IPTV Montecrestese](https://github.com/archsgio/TV-Montecrestese-IPTV/actions/workflows/lg-iptv-custom.yml?query=branch%3Afeature%2Fwebos-iptv-lcn-focus+is%3Asuccess) (sezione **Artifacts**, ZIP contenente `com.archsgio.iptv_1.17.0_all.ipk`).
2. Installarlo con [webOS Dev Manager](https://github.com/webosbrew/dev-manager-desktop/releases/latest) via Developer Mode/Key Server e autorizzazione TV. Non serve Node.js o `bridge-server.mjs`.
3. Se non esiste ancora una playlist configurata, caricare la [v10 EPG](TV_Montecrestese_LCN_v10_CANDIDATI_XMLTV_TEST.m3u) una volta.
4. Terminata l'installazione, il Mac può essere spento: tutte le prove seguenti si svolgono sul televisore.

## Prova 1 — 1 tasto per guida + riproduzione IPTV

Aprire un canale IPTV **già collaudato** come LCN 13 Rete 7. Premere **VERDE**; verificare che si apra la guida completa delle 85 posizioni. Navigare con SU/GIÙ e tornare all'IPTV. Spegnere/riaccendere o riaprire IPTV Montecrestese: se l'ultima sorgente aperta nell'app era IPTV e Auto Play è ON, deve ripartire il canale IPTV salvato.

**Risultato da riferire**: «VERDE apre guida? sì/no; riparte il 13 automaticamente? sì/no».

## Prova 2 — IPTV → TV terrestre senza computer

Da IPTV, premere VERDE, selezionare un canale privo di stream IPTV (per esempio LCN 802), scegliere **Apri TV terrestre LG (ultimo canale sintonizzato)**.

- **Esito A:** si apre Live TV LG con il canale antenna che il televisore già ricorda. Questo è il percorso desiderato, senza Mac.
- **Esito B:** viene mostrato un messaggio **permesso -104**. La documentazione LG vieta a determinate app Developer Mode di lanciare applicazioni native privilegiate. In questo caso premere HOME e aprire TV/Live TV **direttamente dal telecomando**; la riproduzione antenna non dipende dal Mac, ma il cambio automatico dall'app non è permesso.
- **Esito C:** altro errore o non succede nulla: fotografare **solo il messaggio d'errore della TV**, senza dati sensibili, così possiamo identificare un problema di API/app.

**Nota essenziale:** LCN 802 è solo la *voce usata per aprire la TV nativa*: il tuner torna sul **proprio ultimo canale terrestre reale**, non viene impostato automaticamente su 802. Per scegliere una LCN terrestre usare poi i tasti numerici della LG.

**Risultato da riferire**: «A/B/C; messaggio esatto se B/C».

## Prova 3 — Ultimo canale terrestre gestito dalla LG

Dentro Live TV, scegliere un canale terrestre diverso tramite tastierino numerico. Spegnere/riaccendere la LG e riaprire Live TV: il televisore dovrebbe ripartire da quell'ultimo canale (comportamento già osservato dall'utente).

Tornando poi in IPTV Montecrestese, verificare che l'app mantenga la guida e i canali IPTV. La nostra app può sapere che era stata aperta la fonte DVB; **non può sapere quale numero hai cambiato nella app Live TV fuori dal nostro controllo**, né tutti i passaggi fatti dalla Home.

**Risultato da riferire**: «LG riprende il DVB giusto? sì/no; ritorno a IPTV senza problemi? sì/no».

## Criteri di accettazione / limiti

- **Requisito obbligatorio**: uso quotidiano senza computer acceso.
- **Nessuna promessa falsa**: i 60 candidati IPTV della v10 non sono tutti collaudati; la guida ha 85 LCN ma 19 senza URL e 6 stream già bocciati.
- **TV nativa**: l'API `applicationManager/launch` è documentata da LG, ma può rifiutare il lancio di un'app privilegiata con codice -104 su Developer Mode. [Riferimento ufficiale](https://webostv.developer.lge.com/develop/references/application-manager).
- **Nessuna misura di velocità inventata**: solo la TV reale può quantificare il primo fotogramma e i passaggi fra sorgenti.
- **Se il passaggio nativo è bloccato**: rivalutare opzioni compatibili senza root, oppure usare il tasto TV sul telecomando; non reintrodurre un Mac o un bridge per mascherare la limitazione.
