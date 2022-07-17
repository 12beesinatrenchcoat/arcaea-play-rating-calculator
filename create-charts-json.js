import * as csv from "@fast-csv/parse"
import fetch from "node-fetch";
import {writeFile} from "node:fs";
import {dirname} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const songList = {};

async function getCSVObject() {
	const response = await fetch("https://gist.githubusercontent.com/12beesinatrenchcoat/1bb2081eb2d6857254f06d3cf228e0c9/raw/")
	csv.parseStream(response.body, {headers: true})
		.on("data", async row => {
			const {title, artist, length, difficulty, level, notes, constant, charter, bpm, side, pack, version} = row;

			songList[title] ??= {artist, length, pack, bpm, side, version};

			songList[title].difficulties = songList[title].difficulties || {};

			songList[title].difficulties[difficulty] = {
				level,
				notes: Number(notes),
				constant: Number(constant),
				charter,
			};


		})
		.on("end", rowCount => {
			console.log(`Parsed ${rowCount} rows`);
			writeFile(__dirname + "/src/lib/assets/charts.json", JSON.stringify(songList), err => {
				if (err) {
					throw err;
				}

				console.log("Saved charts.json!");
			})
		});
}

getCSVObject();
