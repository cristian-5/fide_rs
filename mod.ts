
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

type Rating = number | 'UNR';
type Category = 'standard' | 'blitz' | 'rapid';
type Sex = 'M' | 'F' | 'O';

const STD = 'standard' as Category;
const BTZ = 'blitz' as Category;
const RAP = 'rapid' as Category;

export interface FIDEPlayer {
	id: string;
	name: string;
	federation: string;
	country?: string;
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
	const federation = find(FEDERAION, html) || 'FIDE';
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
	return { id, name, federation, country, title, sex, year, ratings };
}
