
const ENDPOINT = 'https://ratings.fide.com/profile/';

const NAME = /profile-top-title">\s*(.+?)\s*</;
const STANDARD = /std\s*<\/span>\s*(\d{3,4})/;
const BLITZ = /blitz\s*<\/span>\s*(\d{3,4})/;
const RAPID = /rapid\s*<\/span>\s*(\d{3,4})/;
const TITLE = /FIDE title:<\/div>(?:(?:.|\n)+?)>(.+?)</;
const FEDERAION = /Federation:<\/div>(?:(?:.|\n)+?)>(.+?)</m;
const COUNTRY = /src="?\/svg\/(.{3})\.svg"?\s+class="?flg"?/;
const SEX = /Sex:<\/div>(?:(?:.|\n)+?)>(.+?)</m;
const YEAR = /B-Year:<\/div>(?:(?:.|\n)+?)>(\d{4})</m;

type Federation = string | 'FIDE';
type Rating = number | 'UNR';
type Category = 'standard' | 'blitz' | 'rapid';
type Sex = 'M' | 'F' | 'O';

const STD = 'standard' as Category;
const BTZ = 'blitz' as Category;
const RAP = 'rapid' as Category;

export interface FIDEPlayer {
	id: string;
	name: string;
	federation: Federation;
	country?: string;
	flag?: string;
	title?: string;
	sex: Sex;
	year: number;
	ratings: { category: Category, rating: Rating }[];
}

function find(regex: RegExp, html: string): string | undefined {
	let data = regex.exec(html);
	if (data == null) return undefined;
	else return data[1].trim();
}

/// FIDE Player Profile
/// - returns `null` on error or exception.
/// - returns `undefined` on player not found.
export async function FIDE(id: string): Promise<FIDEPlayer | null | undefined> {
	if (!/^\d+$/.test(id)) return null;
	const url = ENDPOINT + id;
	let html = null;
	try { html = await fetch(url); }
	catch { return null; }
	if (html.status != 200) return null;
	html = await html.text();
	if (!NAME.test(html)) return undefined;
	const name = find(NAME, html)!;
	const federation = (find(FEDERAION, html) || 'FIDE') as Federation;
	const country = find(COUNTRY, html);
	let title = find(TITLE, html);
	if (title == 'None') title = undefined;
	let sex = (find(SEX, html) || 'O')[0] as ('M' | 'F' | 'O');
	const year = parseInt(find(YEAR, html)!);
	let ratings = [];
	if (STANDARD.test(html)) {
		ratings.push({ category: STD, rating: parseInt(find(STANDARD, html)!) });
	} else ratings.push({ category: STD, rating: 'UNR' as Rating });
	if (RAPID.test(html)) {
		ratings.push({ category: RAP, rating: parseInt(find(RAPID, html)!) });
	} else ratings.push({ category: RAP, rating: 'UNR' as Rating });
	if (BLITZ.test(html)) {
		ratings.push({ category: BTZ, rating: parseInt(find(BLITZ, html)!) });
	} else ratings.push({ category: BTZ, rating: 'UNR' as Rating });
	const flag = country! in countries ? countries[country!][1]: undefined;
	return { id, name, federation, country, flag, title, sex, year, ratings };
}

export const countries: { [code: string]: string[]; } = {
	"AND": [ "AD", "🇦🇩" ], "ARE": [ "AE", "🇦🇪" ], "AFG": [ "AF", "🇦🇫" ],
	"ATG": [ "AG", "🇦🇬" ], "AIA": [ "AI", "🇦🇮" ], "ALB": [ "AL", "🇦🇱" ],
	"ARM": [ "AM", "🇦🇲" ], "AGO": [ "AO", "🇦🇴" ], "ATA": [ "AQ", "🇦🇶" ],
	"ARG": [ "AR", "🇦🇷" ], "ASM": [ "AS", "🇦🇸" ], "AUT": [ "AT", "🇦🇹" ],
	"AUS": [ "AU", "🇦🇺" ], "ABW": [ "AW", "🇦🇼" ], "ALA": [ "AX", "🇦🇽" ],
	"AZE": [ "AZ", "🇦🇿" ], "BIH": [ "BA", "🇧🇦" ], "BRB": [ "BB", "🇧🇧" ],
	"BGD": [ "BD", "🇧🇩" ], "BEL": [ "BE", "🇧🇪" ], "BFA": [ "BF", "🇧🇫" ],
	"BGR": [ "BG", "🇧🇬" ], "BHR": [ "BH", "🇧🇭" ], "BDI": [ "BI", "🇧🇮" ],
	"BEN": [ "BJ", "🇧🇯" ], "BLM": [ "BL", "🇧🇱" ], "BMU": [ "BM", "🇧🇲" ],
	"BRN": [ "BN", "🇧🇳" ], "BOL": [ "BO", "🇧🇴" ], "BES": [ "BQ", "🇧🇶" ],
	"BRA": [ "BR", "🇧🇷" ], "BHS": [ "BS", "🇧🇸" ], "BTN": [ "BT", "🇧🇹" ],
	"BVT": [ "BV", "🇧🇻" ], "BWA": [ "BW", "🇧🇼" ], "BLR": [ "BY", "🇧🇾" ],
	"BLZ": [ "BZ", "🇧🇿" ], "CAN": [ "CA", "🇨🇦" ], "CCK": [ "CC", "🇨🇨" ],
	"COD": [ "CD", "🇨🇩" ], "CAF": [ "CF", "🇨🇫" ], "COG": [ "CG", "🇨🇬" ],
	"CHE": [ "CH", "🇨🇭" ], "CIV": [ "CI", "🇨🇮" ], "COK": [ "CK", "🇨🇰" ],
	"CHL": [ "CL", "🇨🇱" ], "CMR": [ "CM", "🇨🇲" ], "CHN": [ "CN", "🇨🇳" ],
	"COL": [ "CO", "🇨🇴" ], "CRI": [ "CR", "🇨🇷" ], "CUB": [ "CU", "🇨🇺" ],
	"CPV": [ "CV", "🇨🇻" ], "CUW": [ "CW", "🇨🇼" ], "CXR": [ "CX", "🇨🇽" ],
	"CYP": [ "CY", "🇨🇾" ], "CZE": [ "CZ", "🇨🇿" ], "DEU": [ "DE", "🇩🇪" ],
	"DJI": [ "DJ", "🇩🇯" ], "DNK": [ "DK", "🇩🇰" ], "DMM": [ "DM", "🇩🇲" ],
	"DOM": [ "DO", "🇩🇴" ], "DZA": [ "DZ", "🇩🇿" ], "ECU": [ "EC", "🇪🇨" ],
	"EST": [ "EE", "🇪🇪" ], "EGY": [ "EG", "🇪🇬" ], "ESH": [ "EH", "🇪🇭" ],
	"ERI": [ "ER", "🇪🇷" ], "ESP": [ "ES", "🇪🇸" ], "ETH": [ "ET", "🇪🇹" ],
	"FIN": [ "FI", "🇫🇮" ], "FJI": [ "FJ", "🇫🇯" ], "FLK": [ "FK", "🇫🇰" ],
	"FSM": [ "FM", "🇫🇲" ], "FRO": [ "FO", "🇫🇴" ], "FRA": [ "FR", "🇫🇷" ],
	"GAB": [ "GA", "🇬🇦" ], "GBR": [ "GB", "🇬🇧" ], "GRD": [ "GD", "🇬🇩" ],
	"GEO": [ "GE", "🇬🇪" ], "GUF": [ "GF", "🇬🇫" ], "GGY": [ "GG", "🇬🇬" ],
	"GHA": [ "GH", "🇬🇭" ], "GIB": [ "GI", "🇬🇮" ], "GRL": [ "GL", "🇬🇱" ],
	"GMB": [ "GM", "🇬🇲" ], "GIN": [ "GN", "🇬🇳" ], "GLP": [ "GP", "🇬🇵" ],
	"GNQ": [ "GQ", "🇬🇶" ], "GRC": [ "GR", "🇬🇷" ], "SGS": [ "GS", "🇬🇸" ],
	"GTM": [ "GT", "🇬🇹" ], "GUM": [ "GU", "🇬🇺" ], "GNB": [ "GW", "🇬🇼" ],
	"GUY": [ "GY", "🇬🇾" ], "HKG": [ "HK", "🇭🇰" ], "HMD": [ "HM", "🇭🇲" ],
	"HND": [ "HN", "🇭🇳" ], "HRV": [ "HR", "🇭🇷" ], "HTI": [ "HT", "🇭🇹" ],
	"HUN": [ "HU", "🇭🇺" ], "IDN": [ "ID", "🇮🇩" ], "IRL": [ "IE", "🇮🇪" ],
	"ISR": [ "IL", "🇮🇱" ], "IMN": [ "IM", "🇮🇲" ], "IND": [ "IN", "🇮🇳" ],
	"IOT": [ "IO", "🇮🇴" ], "IRQ": [ "IQ", "🇮🇶" ], "IRN": [ "IR", "🇮🇷" ],
	"ISL": [ "IS", "🇮🇸" ], "ITA": [ "IT", "🇮🇹" ], "JEY": [ "JE", "🇯🇪" ],
	"JAM": [ "JM", "🇯🇲" ], "JOR": [ "JO", "🇯🇴" ], "JPN": [ "JP", "🇯🇵" ],
	"KEN": [ "KE", "🇰🇪" ], "KGZ": [ "KG", "🇰🇬" ], "KHM": [ "KH", "🇰🇭" ],
	"KIR": [ "KI", "🇰🇮" ], "COM": [ "KM", "🇰🇲" ], "KNA": [ "KN", "🇰🇳" ],
	"PRK": [ "KP", "🇰🇵" ], "KOR": [ "KR", "🇰🇷" ], "KWT": [ "KW", "🇰🇼" ],
	"CYM": [ "KY", "🇰🇾" ], "KAZ": [ "KZ", "🇰🇿" ], "LAO": [ "LA", "🇱🇦" ],
	"LBN": [ "LB", "🇱🇧" ], "LCA": [ "LC", "🇱🇨" ], "LIE": [ "LI", "🇱🇮" ],
	"LKA": [ "LK", "🇱🇰" ], "LBR": [ "LR", "🇱🇷" ], "LSO": [ "LS", "🇱🇸" ],
	"LTU": [ "LT", "🇱🇹" ], "LUX": [ "LU", "🇱🇺" ], "LVA": [ "LV", "🇱🇻" ],
	"LBY": [ "LY", "🇱🇾" ], "MAR": [ "MA", "🇲🇦" ], "MCO": [ "MC", "🇲🇨" ],
	"MDA": [ "MD", "🇲🇩" ], "MNE": [ "ME", "🇲🇪" ], "MAF": [ "MF", "🇲🇫" ],
	"MDG": [ "MG", "🇲🇬" ], "MHL": [ "MH", "🇲🇭" ], "MKD": [ "MK", "🇲🇰" ],
	"MLI": [ "ML", "🇲🇱" ], "MMR": [ "MM", "🇲🇲" ], "MNG": [ "MN", "🇲🇳" ],
	"MAC": [ "MO", "🇲🇴" ], "MNP": [ "MP", "🇲🇵" ], "MTQ": [ "MQ", "🇲🇶" ],
	"MRT": [ "MR", "🇲🇷" ], "MSR": [ "MS", "🇲🇸" ], "MLT": [ "MT", "🇲🇹" ],
	"MUS": [ "MU", "🇲🇺" ], "MDV": [ "MV", "🇲🇻" ], "MWI": [ "MW", "🇲🇼" ],
	"MEX": [ "MX", "🇲🇽" ], "MYS": [ "MY", "🇲🇾" ], "MOZ": [ "MZ", "🇲🇿" ],
	"NAM": [ "NA", "🇳🇦" ], "NCL": [ "NC", "🇳🇨" ], "NER": [ "NE", "🇳🇪" ],
	"NFK": [ "NF", "🇳🇫" ], "NGA": [ "NG", "🇳🇬" ], "NIC": [ "NI", "🇳🇮" ],
	"NLD": [ "NL", "🇳🇱" ], "NOR": [ "NO", "🇳🇴" ], "NPL": [ "NP", "🇳🇵" ],
	"NRU": [ "NR", "🇳🇷" ], "NIU": [ "NU", "🇳🇺" ], "NZL": [ "NZ", "🇳🇿" ],
	"OMN": [ "OM", "🇴🇲" ], "PAN": [ "PA", "🇵🇦" ], "PER": [ "PE", "🇵🇪" ],
	"PYF": [ "PF", "🇵🇫" ], "PNG": [ "PG", "🇵🇬" ], "PHL": [ "PH", "🇵🇭" ],
	"PAK": [ "PK", "🇵🇰" ], "POL": [ "PL", "🇵🇱" ], "SPM": [ "PM", "🇵🇲" ],
	"PCN": [ "PN", "🇵🇳" ], "PRI": [ "PR", "🇵🇷" ], "PSE": [ "PS", "🇵🇸" ],
	"PRT": [ "PT", "🇵🇹" ], "PLW": [ "PW", "🇵🇼" ], "PRY": [ "PY", "🇵🇾" ],
	"QAT": [ "QA", "🇶🇦" ], "REU": [ "RE", "🇷🇪" ], "ROU": [ "RO", "🇷🇴" ],
	"SRB": [ "RS", "🇷🇸" ], "RUS": [ "RU", "🇷🇺" ], "RWA": [ "RW", "🇷🇼" ],
	"SAU": [ "SA", "🇸🇦" ], "SLB": [ "SB", "🇸🇧" ], "SYC": [ "SC", "🇸🇨" ],
	"SDN": [ "SD", "🇸🇩" ], "SWE": [ "SE", "🇸🇪" ], "SGP": [ "SG", "🇸🇬" ],
	"SHN": [ "SH", "🇸🇭" ], "SVN": [ "SI", "🇸🇮" ], "SJM": [ "SJ", "🇸🇯" ],
	"SVK": [ "SK", "🇸🇰" ], "SLE": [ "SL", "🇸🇱" ], "SMR": [ "SM", "🇸🇲" ],
	"SEN": [ "SN", "🇸🇳" ], "SOM": [ "SO", "🇸🇴" ], "SUR": [ "SR", "🇸🇷" ],
	"SSD": [ "SS", "🇸🇸" ], "STP": [ "ST", "🇸🇹" ], "SLV": [ "SV", "🇸🇻" ],
	"SXM": [ "SX", "🇸🇽" ], "SYR": [ "SY", "🇸🇾" ], "SWZ": [ "SZ", "🇸🇿" ],
	"TCA": [ "TC", "🇹🇨" ], "TCD": [ "TD", "🇹🇩" ], "ATF": [ "TF", "🇹🇫" ],
	"TGO": [ "TG", "🇹🇬" ], "THA": [ "TH", "🇹🇭" ], "TJK": [ "TJ", "🇹🇯" ],
	"TKL": [ "TK", "🇹🇰" ], "TLS": [ "TL", "🇹🇱" ], "TKM": [ "TM", "🇹🇲" ],
	"TUN": [ "TN", "🇹🇳" ], "TON": [ "TO", "🇹🇴" ], "TUR": [ "TR", "🇹🇷" ],
	"TTO": [ "TT", "🇹🇹" ], "TUV": [ "TV", "🇹🇻" ], "TWN": [ "TW", "🇹🇼" ],
	"TZA": [ "TZ", "🇹🇿" ], "UKR": [ "UA", "🇺🇦" ], "UGA": [ "UG", "🇺🇬" ],
	"UMI": [ "UM", "🇺🇲" ], "USA": [ "US", "🇺🇸" ], "URY": [ "UY", "🇺🇾" ],
	"UZB": [ "UZ", "🇺🇿" ], "VAT": [ "VA", "🇻🇦" ], "VCT": [ "VC", "🇻🇨" ],
	"VEN": [ "VE", "🇻🇪" ], "VGB": [ "VG", "🇻🇬" ], "VIR": [ "VI", "🇻🇮" ],
	"VNM": [ "VN", "🇻🇳" ], "VUT": [ "VU", "🇻🇺" ], "WLF": [ "WF", "🇼🇫" ],
	"WSM": [ "WS", "🇼🇸" ], "KOS": [ "XK", "🇽🇰" ], "YEM": [ "YE", "🇾🇪" ],
	"MYT": [ "YT", "🇾🇹" ], "ZAF": [ "ZA", "🇿🇦" ], "ZMB": [ "ZM", "🇿🇲" ],
	"ZWE": [ "ZW", "🇿🇼" ], "BUL": [ "BG", "🇧🇬" ],
};
