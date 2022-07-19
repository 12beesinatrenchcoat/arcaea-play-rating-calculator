import * as csv from "@fast-csv/parse"
import fetch from "node-fetch";
import {writeFile} from "node:fs";
import {dirname} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const packList = {};
const packOrder = {
	"Arcaea": 1,
	"World Extend": 2,
	"Memory Archive": 2.5,
	"Final Verdict": 3,
	"Silent Answer": 3.1,
	"Black Fate": 4,
	"Adverse Prelude": 5,
	"Luminous Sky" : 6,
	"Vicious Labyrinth": 7,
	"Eternal Core": 8,
	"Esoteric Order": 9,
	"Pale Tapestry": 9.1,
	"Light of Salvation": 9.2,
	"Divided Heart": 10,
	"Ephemeral Page": 11,
	"The Journey Onwards": 11.1,
	"Sunset Radiance": 12,
	"Absolute Reason": 13,
	"Binary Enfold": 14,
	"Shared Time": 14.1,
	"Ambivalent Vision": 15,
	"Crimson Solace": 16,
	"Muse Dash Collaboration": 17,
	"WACCA Collaboration": 18,
	"maimai Collaboration": 19,
	"O.N.G.E.K.I. Collaboration": 20,
	"CHUNITHM Collaboration": 21,
	"CHUNITHM Collaboration Chapter 2": 21.1,
	"Groove Coaster Collaboration": 22,
	"Tone Sphere Collaboration": 23,
	"Lanota Collaboration": 24,
	"Lanota Collaboration Chapter 2": 24.1,
	"Dynamix Collaboration": 25,
}

async function getCSVObject() {
	const response = await fetch("https://gist.githubusercontent.com/12beesinatrenchcoat/1bb2081eb2d6857254f06d3cf228e0c9/raw/")
	csv.parseStream(response.body, {headers: true})
		.on("data", async row => {
			const {title, artist, length, difficulty, level, notes, constant, charter, bpm, side, pack, version} = row;

			if (Number(constant)) {
				packList[pack] ??= {};

				packList[pack][title] ??= {artist, length, pack, bpm, side, version};

				packList[pack][title].difficulties = packList[pack][title].difficulties || {};

				packList[pack][title].difficulties[difficulty] = {
					level,
					notes: Number(notes),
					constant: Number(constant),
					charter,
				};
			} else {
				console.log(`${artist} - ${title} [${difficulty}] has no chart constant, skipping…`)
			}


		})
		.on("end", rowCount => {
			console.log(`Parsed ${rowCount} rows`);

			// And now we sort… (<3 https://stackoverflow.com/a/31102605/10873246)
			const sortedPackList = Object.keys(packList)
				.sort((a, b) => (packOrder[a] || 999) - (packOrder[b] || 999))
				.reduce((obj, key) => {
				obj[key] = packList[key]
				return obj;
				},
				{}
			);

			writeFile(__dirname + "/src/lib/assets/charts.json", JSON.stringify(sortedPackList), err => {
				if (err) {
					throw err;
				}

				console.log("Saved charts.json!");
			})
		});
}

getCSVObject();
