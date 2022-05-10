
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

type Category = 'standard' | 'blitz' | 'rapid';
type Sex = 'M' | 'F' | 'O';

export interface FIDEPlayer {
	id: string;
	name: string;
	federation: string;
	country?: string;
	title?: string;
	sex: Sex;
	year: number;
	ratings: { category: Category, rating: number }[];
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
	const federation = find(FEDERAION, html) || 'FIDE';
	const country = find(COUNTRY, html);
	let title = find(TITLE, html);
	if (title == 'None') title = undefined;
	let sex = (find(SEX, html) || 'O')[0] as ('M' | 'F' | 'O');
	const year = parseInt(find(YEAR, html)!);
	let ratings = [];
	if (STANDARD.test(html)) ratings.push({
		category: 'standard' as Category, rating: parseInt(find(STANDARD, html)!)
	});
	if (BLITZ.test(html)) ratings.push({
		category: 'blitz' as Category, rating: parseInt(find(BLITZ, html)!)
	});
	if (RAPID.test(html)) ratings.push({
		category: 'rapid' as Category, rating: parseInt(find(RAPID, html)!)
	});
	return { id, name, federation, country, title, sex, year, ratings };
}
