
const ENDPOINT = 'https://ratings.fide.com/profile/';

const NAME = /player-title"\s*>\s*(.+?)\s*</;
const STANDARD = />(\d{3,4})\s*<\/\s*p\s*>\s*<p[^>]*>STANDARD/m;
const BLITZ = />(\d{3,4})\s*<\/\s*p\s*>\s*<p[^>]*>BLITZ/m;
const RAPID = />(\d{3,4})\s*<\/\s*p\s*>\s*<p[^>]*>RAPID/m;
const TITLE = /profile-info-title\s*"\s*>\s*<p>\s*(.+?)\s*</m;
const COUNTRY = /src="\/images\/flags\/(.{2})\.svg"/;
const SEX = /profile-info-sex\s*"\s*>\s*(.*?)\s*</m;
const YEAR = /profile-info-byear\s*"\s*>\s*(\d{4})\s*</m;

export interface FIDEPlayer {
	id: string;
	name: string;
	country: string;
	flag: string;
	title: string;
	sex: 'M' | 'F' | 'O';
	year: number;
	ratings: { [category: string]: { rating: number } };
}

function find(regex: RegExp, html: string): string | null {
	let data = regex.exec(html);
	if (data === null) return null;
	else return data[1].trim();
}

/// FIDE Player Profile
/// - returns `null` on error or exception.
/// - returns `undefined` on player not found.
export async function FIDE(id: string): Promise<FIDEPlayer | null> {
	if (!/^\d+$/.test(id)) return null;
	const url = ENDPOINT + id;
	let html = null;
	try { html = await fetch(url); }
	catch { return null; }
	if (html.status != 200) return null;
	html = await html.text();
	if (!NAME.test(html)) return null;
	const name = find(NAME, html)!;
	const country = (find(COUNTRY, html) || "").toUpperCase();
	const title = find(TITLE, html) || "None";
	const sex = (find(SEX, html) || 'O')[0] as ('M' | 'F' | 'O');
	const year = parseInt(find(YEAR, html)!);
	const ratings: { [category: string]: { rating: number } } = {};
	if (STANDARD.test(html)) {
		ratings["standard"] = { rating: parseInt(find(STANDARD, html)!) };
	} else ratings["standard"] = { rating: 0 };
	if (RAPID.test(html)) {
		ratings["rapid"] = { rating: parseInt(find(RAPID, html)!) };
	} else ratings["rapid"] = { rating: 0 };
	if (BLITZ.test(html)) {
		ratings["blitz"] = { rating: parseInt(find(BLITZ, html)!) };
	} else ratings["blitz"] = { rating: 0 };
	const flag = country.length === 2 ? String.fromCodePoint(
		country.charCodeAt(0) + 127397, country.charCodeAt(1) + 127397
	) : "🏳️"; // defaults to white flag in case country is invalid
	return { id, name, country: country || "None", flag, title, sex, year, ratings };
}
