
# Unofficial FIDE Rating Scraper

This module allows you to scrape the FIDE Elo ratings of chess players,
knowing their `FIDE ID`.
It fetches the rating from the [FIDE website](https://ratings.fide.com/)
and processes the page with regexes to extract the data.
This module is extremely lightweight and doesn't require any additional modules.

If you like this module give it a star ⭐️ on
[GitHub](https://github.com/Cristian-A/fide_rs).

### The result is a `FidePlayer` object:

```ts
export interface FIDEPlayer {
    id: string;
    name: string;
    federation: string;
    country?: string;
    title?: string;
    flag?: string;
    sex: Sex;
    year: number;
    ratings: { category: Category, rating: Rating }[];
}

type Federation = string | 'FIDE';
type Rating = number | 'UNR';
type Category = 'standard' | 'blitz' | 'rapid';
type Sex = 'M' | 'F' | 'O';
```

The `federation` and `country` fields can hold different values.\
The `federation` field is the country of the player or the
value 'FIDE' where no federation is specified.\
The `country` field is the 3-letter country code of the player.\
The `flag` field is a flag emoji based on the country.\
The `country`, `title`, `flag` fields can be undefined.\
The `year` field is the year of birth of the player.\

### Usage:

```ts

import { FIDE } from './mod.ts';

// Magnus Carlsen:
let user = await FIDE('1503014');

```
