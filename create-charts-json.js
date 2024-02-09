import * as csv from '@fast-csv/parse';
import fetch from 'node-fetch';
import {writeFile} from 'node:fs';

const packList = {};
const packOrder = {
	'Memory Archive': 0.1,
	'Extend Archive': 0.2,
	Arcaea: 1,
	'World Extend': 2,
	'Final Verdict': 3,
	'Silent Answer': 3.1,
	'Black Fate': 4,
	'Adverse Prelude': 5,
	'Luminous Sky': 6,
	'Vicious Labyrinth': 7,
	'Eternal Core': 8,
	'Lasting Eden': 41,
	'Lasting Eden Chapter 2': 41.1,
	'Shifting Veil': 41.2,
	'Esoteric Order': 42,
	'Pale Tapestry': 42.1,
	'Light of Salvation': 43.2,
	'Divided Heart': 44,
	'Ephemeral Page': 45,
	'The Journey Onwards': 45.1,
	'Sunset Radiance': 46,
	'Absolute Reason': 47,
	'Binary Enfold': 48,
	'Shared Time': 48.1,
	'Ambivalent Vision': 49,
	'Crimson Solace': 50,
	'Cytus II Collaboration': 91,
	'Cytus II Collaboration Chapter 2': 91.1,
	'Muse Dash Collaboration': 92,
	'WACCA Collaboration': 93,
	'WACCA Collaboration Chapter 2': 93.1,
	'maimai Collaboration': 94,
	'maimai Collaboration Chapter 2': 94.1,
	'O.N.G.E.K.I. Collaboration': 95,
	'O.N.G.E.K.I. Collaboration Chapter 2': 95.1,
	'CHUNITHM Collaboration': 96,
	'CHUNITHM Collaboration Chapter 2': 96.1,
	'CHUNITHM Collaboration Chapter 3': 96.2,
	'Groove Coaster Collaboration': 97,
	'Tone Sphere Collaboration': 98,
	'Lanota Collaboration': 99,
	'Lanota Collaboration Chapter 2': 99.1,
	'Dynamix Collaboration': 100,
};

async function getCSVObject() {
	const response = await fetch(
		'https://gist.githubusercontent.com/12beesinatrenchcoat/1bb2081eb2d6857254f06d3cf228e0c9/raw/',
	);
	csv
		.parseStream(response.body, {headers: true})
		.on('data', async row => {
			// Not included: length, bpm, version
			const {
				title,
				artist,
				difficulty,
				level,
				notes,
				constant,
				charter,
				side,
				pack,
			} = row;

			// Only include charts with a chart constant.
			if (Number(constant)) {
				packList[pack] ??= {};

				packList[pack][title] ??= {artist, pack, side};

				packList[pack][title].difficulties =
					packList[pack][title].difficulties || {};

				packList[pack][title].difficulties[difficulty] = {
					level,
					notes: Number(notes),
					constant: Number(constant),
					charter,
				};
			} else {
				console.log(
					`${artist} - ${title} [${difficulty}] has no chart constant, skipping…`,
				);
			}
		})
		.on('end', rowCount => {
			console.log(`Parsed ${rowCount} rows`);

			// And now we sort… (<3 https://stackoverflow.com/a/31102605/10873246)
			const sortedPackList = Object.keys(packList)
				.sort((a, b) => (packOrder[a] || 999) - (packOrder[b] || 999))
				.reduce((obj, key) => {
					obj[key] = packList[key];
					return obj;
				}, {});

			writeFile(
				'./src/lib/assets/charts.json',
				JSON.stringify(sortedPackList),
				err => {
					if (err) {
						throw err;
					}

					console.log('Saved charts.json!');
				},
			);
		});
}

getCSVObject();
