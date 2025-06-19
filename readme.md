
# Unofficial FIDE Rating Scraper

This module allows you to scrape the FIDE Elo ratings of chess players,
knowing their `FIDE ID`.
It fetches the rating from the [FIDE website](https://ratings.fide.com/)
and processes the page with regexes to extract the data.
This module is extremely lightweight and doesn't require any additional modules.

### The result is a `FidePlayer` object:

```ts
export interface FIDEPlayer {
	id: string;
	name: string;
	country: string; // defaults to None
	flag: string;    // defaults to 🏳️
	title: string;   // defaults to None
	sex: 'M' | 'F' | 'O';
	year: number;
	ratings: { [category: string]: { rating: number } };
}
```

### Usage:

```ts
import { FIDE } from './mod.ts';

let user = await FIDE('1503014'); // Magnus Carlsen
console.log(user);
```

### Output

```json
{
    "id": "1503014",
    "name": "Carlsen, Magnus",
    "country": "NO",
    "flag": "🇳🇴",
    "title": "Grandmaster",
    "sex": "M",
    "year": 1990,
    "ratings": {
        "standard": { "rating": 2837 },
        "rapid": { "rating": 2819 },
        "blitz": { "rating": 2883 }
    }
}
```
