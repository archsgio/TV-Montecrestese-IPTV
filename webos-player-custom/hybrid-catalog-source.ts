/** Full LCN catalog approved for Montecrestese. No placeholder IPTV URLs.
 * Status comes from v10 inventory; web links from official-fallbacks.json.
 * All external actions require explicit operator selection and a local bridge.
 */
export interface HybridEntry {
  lcn: number;
  name: string;
  kind: 'INCLUSO' | 'SENZA_URL' | 'ESCLUSO_NON_FUNZIONANTE'
    | 'CANDIDATO_DA_COLLAUDARE' | 'CANDIDATO_SIMULCAST';
  web: string;
  webType: string;
}

export const HYBRID_CATALOG: HybridEntry[] = [
  {
    "lcn": 1,
    "name": "Rai 1",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 2,
    "name": "Rai 2",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 3,
    "name": "Rai 3 TGR Piemonte",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 4,
    "name": "Rete 4",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 5,
    "name": "Canale 5",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 6,
    "name": "Italia 1",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 7,
    "name": "LA7",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 8,
    "name": "TV8",
    "kind": "SENZA_URL",
    "web": "https://www.tv8.it/streaming",
    "webType": "official_live"
  },
  {
    "lcn": 9,
    "name": "NOVE",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 10,
    "name": "Telecity Piemonte",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 11,
    "name": "Telecupole",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 12,
    "name": "Videogruppo",
    "kind": "SENZA_URL",
    "web": "https://www.mediapason.it/videogruppo/",
    "webType": "official_info"
  },
  {
    "lcn": 13,
    "name": "Rete 7 Piemonte",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 14,
    "name": "Primantenna",
    "kind": "ESCLUSO_NON_FUNZIONANTE",
    "web": "https://www.primantenna.tv/diretta-tv/",
    "webType": "official_live_page"
  },
  {
    "lcn": 15,
    "name": "GRP TV",
    "kind": "ESCLUSO_NON_FUNZIONANTE",
    "web": "https://grp.it/diretta-tv",
    "webType": "official_live_page"
  },
  {
    "lcn": 16,
    "name": "Sesta Rete",
    "kind": "SENZA_URL",
    "web": "https://sestarete.tv.it/streaming/",
    "webType": "official_stream_page"
  },
  {
    "lcn": 17,
    "name": "VCO Azzurra TV",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 18,
    "name": "Canale Italia",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 19,
    "name": "Video Novara",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 20,
    "name": "20 Mediaset",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 21,
    "name": "Rai 4",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 22,
    "name": "Iris",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 23,
    "name": "Rai 5",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 24,
    "name": "Rai Movie",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 25,
    "name": "Rai Premium",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 26,
    "name": "Cielo",
    "kind": "SENZA_URL",
    "web": "https://www.cielotv.it/streaming",
    "webType": "official_live"
  },
  {
    "lcn": 27,
    "name": "27 Twentyseven",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 28,
    "name": "TV2000",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 29,
    "name": "LA7 Cinema",
    "kind": "SENZA_URL",
    "web": "https://www.la7.it/la7cinema",
    "webType": "official_live_page"
  },
  {
    "lcn": 30,
    "name": "La5",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 31,
    "name": "Real Time",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 32,
    "name": "QVC",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 33,
    "name": "Food Network",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 34,
    "name": "Cine34",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 35,
    "name": "Focus",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 36,
    "name": "RTL 102.5",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 37,
    "name": "Discovery",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 38,
    "name": "Giallo",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 39,
    "name": "Top Crime",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 40,
    "name": "Boing",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 41,
    "name": "K2",
    "kind": "ESCLUSO_NON_FUNZIONANTE",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 42,
    "name": "Rai Gulp",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 43,
    "name": "Rai Yoyo",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 44,
    "name": "Frisbee",
    "kind": "ESCLUSO_NON_FUNZIONANTE",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 45,
    "name": "Boing Plus",
    "kind": "SENZA_URL",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 46,
    "name": "Cartoonito",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 47,
    "name": "Super!",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 48,
    "name": "Rai News 24",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 49,
    "name": "Italia 2",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 50,
    "name": "Sky TG24",
    "kind": "SENZA_URL",
    "web": "https://tg24.sky.it/diretta",
    "webType": "official_live"
  },
  {
    "lcn": 51,
    "name": "TGCOM24",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 52,
    "name": "DMAX",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 53,
    "name": "Italia 53",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 54,
    "name": "Rai Storia",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 55,
    "name": "Mediaset Extra",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 56,
    "name": "HGTV",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 57,
    "name": "Italiana",
    "kind": "SENZA_URL",
    "web": "https://www.raiplay.it/dirette/italiana",
    "webType": "official_live"
  },
  {
    "lcn": 58,
    "name": "Rai Sport",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 59,
    "name": "Discovery Turbo",
    "kind": "CANDIDATO_DA_COLLAUDARE",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 60,
    "name": "Sportitalia",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 61,
    "name": "Club TV",
    "kind": "SENZA_URL",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 62,
    "name": "Donna Sport TV",
    "kind": "SENZA_URL",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 63,
    "name": "Il Sole 24 Ore TV",
    "kind": "SENZA_URL",
    "web": "https://www.ilsole24ore.tv/",
    "webType": "official_info"
  },
  {
    "lcn": 64,
    "name": "SuperTennis",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 65,
    "name": "Alma TV",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 66,
    "name": "Radio 105 TV",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 67,
    "name": "R101 TV",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 68,
    "name": "Bom Channel",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 69,
    "name": "Deejay TV",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 70,
    "name": "Radio Italia TV",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 71,
    "name": "Canale Italia Piemonte",
    "kind": "SENZA_URL",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 72,
    "name": "Telelombardia",
    "kind": "SENZA_URL",
    "web": "https://telelombardia.video/video/index",
    "webType": "official_live_directory"
  },
  {
    "lcn": 73,
    "name": "Radio Bruno TV",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 75,
    "name": "Top Calcio 24",
    "kind": "ESCLUSO_NON_FUNZIONANTE",
    "web": "https://telelombardia.video/video/index",
    "webType": "official_live_directory"
  },
  {
    "lcn": 76,
    "name": "Valenza TV",
    "kind": "SENZA_URL",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 78,
    "name": "Motori TV",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 80,
    "name": "Onda Novara TV",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 82,
    "name": "Giocabet",
    "kind": "SENZA_URL",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 83,
    "name": "Piemonte+",
    "kind": "CANDIDATO_SIMULCAST",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 84,
    "name": "Telereporter",
    "kind": "SENZA_URL",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 87,
    "name": "RBE-TV",
    "kind": "SENZA_URL",
    "web": "https://rbe.it/ascolta-rbe/",
    "webType": "official_stream_page"
  },
  {
    "lcn": 96,
    "name": "Radio Birikina TV",
    "kind": "INCLUSO",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 98,
    "name": "Radio 4 You TV",
    "kind": "SENZA_URL",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 101,
    "name": "Rai 4K",
    "kind": "SENZA_URL",
    "web": "",
    "webType": ""
  },
  {
    "lcn": 802,
    "name": "Rai 3 TGR Piemonte",
    "kind": "ESCLUSO_NON_FUNZIONANTE",
    "web": "",
    "webType": ""
  }
];

export function findHybridEntry(lcn: number): HybridEntry | undefined {
  return HYBRID_CATALOG.find(row => row.lcn === lcn);
}
export function isIptvCandidate(entry: HybridEntry): boolean {
  return entry.kind === 'INCLUSO' || entry.kind === 'CANDIDATO_DA_COLLAUDARE'
    || entry.kind === 'CANDIDATO_SIMULCAST';
}
export function isKnownBad(entry: HybridEntry): boolean {
  return entry.kind === 'ESCLUSO_NON_FUNZIONANTE';
}
