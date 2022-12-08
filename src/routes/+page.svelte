<svelte:head>
	<title>Arcaea Play Rating Calculator</title>
</svelte:head>

<script lang="ts">
	interface Difficulty {
		level: string
		notes: number
		constant: number
		charter: string
	}

	interface Song {
		artist: string
		length: string
		pack: string
		bpm: string
		side: "Light" | "Conflict" | "Colorless"
		version: string
		difficulties: {
			past?: Difficulty
			present?: Difficulty
			future?: Difficulty
			beyond?: Difficulty
		}
	}

	import packs from "$lib/assets/charts.json"

	// Position of point on graph.
	export let x: number;
	export let y: number;

	/**
	 * Actually a stringified table. [pack: string, songTitle: string]
	*/
	export let selectedsong: string;
	let selectedDifficulty: "past" | "present" | "future" | "beyond";
	export let songTitle = "if you're seeing, this, something probably went wrong";
	export let song: Song = {
		artist: "or just wait a bit, maybe it's loading",
		pack: "whoops",
		bpm: "at least 5",
		length: "no",
		side: "Colorless",
		version: "-2",
		difficulties: {},
	};
	export let Difficulty: Difficulty = {
		level: "no",
		notes: 1,
		constant: 0,
		charter: "no",
	}

	export let score: number;
	export let grade: "EX+" | "EX" | "AA" | "A" | "B" | "C" | "D";
	export let scoreModifier: number;
	export let pure = 0;
	export let lost: number;

	export let potentialValue = 0;
	export let potentialTier: "blue" | "green" | "purple" | "purple-deco" | "tomato-deco" | "1star" | "2star" | "3star";

	$: lost = Difficulty.notes - pure;

	$: score = Math.ceil((pure / Difficulty.notes) * 10e6)

	$: {
		if (score >= 10e6) {
			scoreModifier = 2;
		} else if (score > 9.8e6) {
			scoreModifier = 1 + ((score - 9.8e6) / 0.2e6);
		} else {
			scoreModifier = (score - 9.5e6) / 0.3e6;
		}

		calculatePotential();
	}
	

	$: {
		if (score >= 9.9e6) {
			grade = "EX+"
		} else if (score >= 9.8e6) {
			grade = "EX"
		} else if (score >= 9.5e6) {
			grade = "AA"
		} else if (score >= 9.2e6) {
			grade = "A"
		} else if (score >= 8.9e6) {
			grade = "B"
		} else if (score >= 8.6e6) {
			grade = "C"
		} else {
			grade = "D"
		}
	}

	$: {
		x = ((score - 8.6e6) / 1.4e6) * 150;
		if (score <= 9.8e6) {
			y = 70 - (x / 130 * 50)
		} else {
			y = 20 - ((x - 130) / 20 * 10)
		}
	}

	// Song change!
	$: if (selectedsong) {
		const data = JSON.parse(selectedsong) as [
			pack: keyof typeof packs, 
			songTitle: string
		]
		songTitle = data[1];
		const pack = packs[data[0]]
		song = pack[data[1] as keyof typeof pack];
		const {difficulties} = song;

		if(
			(selectedDifficulty && !difficulties[selectedDifficulty])
			|| Object.keys(difficulties).length === 1
			|| !selectedDifficulty
		) {
			// Set difficulty to first difficulty if none chosen
			selectedDifficulty = Object.keys(difficulties)[0] as "past" | "present" | "future" | "beyond";
		}

		changeDifficulty();
	}

	// Difficulty change!
	function changeDifficulty() {
		const oldPercent = pure / Difficulty.notes;
		if (song.difficulties && selectedDifficulty) {
			Difficulty = song.difficulties[selectedDifficulty]!;
			if (pure === 0) {
				pure = Math.floor(0.83 * Difficulty.notes)
			} else {
				pure = Math.round(oldPercent * Difficulty.notes)
			}
		}
		calculatePotential();
	}

	/**
	 * Formats a score the way Arcaea does — 8 digits, separated with single ticks.
	 * @param {number} score
	 * @returns {string}
	 */
	function arcaeaScoreFormat(score: number) {
		score = Number(score);
		let output = score.toLocaleString("en-UK", {
			maximumFractionDigits: 0,
			minimumIntegerDigits: 8
		})
		output = output.replaceAll(",", "'");
		return output;
	}

	function calculatePotential() {
		potentialValue = Math.max(
			Math.round((Difficulty.constant + scoreModifier) * 100) / 100, 
			0.0)
		potentialTier = 
			potentialValue >= 13.0 ? "3star" :
			potentialValue >= 12.5 ? "2star" :
			potentialValue >= 12.0 ? "1star" :
			potentialValue >= 11.0 ? "tomato-deco" :
			potentialValue >= 10.0 ? "purple-deco" :
			potentialValue >= 7.0  ? "purple" :
			potentialValue >= 3.5  ? "green" : "blue";
	}
	
</script>

<svelte:window on:load={changeDifficulty}/>

<h1>Arcaea Play Rating Calculator</h1>
<a href='https://github.com/12beesinatrenchcoat/arcaea-potential-calculator'>Source Code</a>
<a href='https://arcaea.fandom.com/'>Arcaea Community Wiki</a>
<p>This is a fanmade project. It is unaffiliated with Arcaea and lowiro. Arcaea belongs to lowiro. Check it out <a href="https://arcaea.lowiro.com">here!</a></p>

<div class='two-column'>
	<div id='select-menu' class='flow'>
		<label>
			song
			<select id="song-select" bind:value={selectedsong}>
				{#each Object.entries(packs) as [pack, songs]}
					<optgroup label={pack}>
						{#each Object.keys(songs) as song}
							<option value='{`["${pack}","${song}"]`}'>{song}</option>
						{/each}
					</optgroup>
				{/each}
			</select>
		</label>
		<div id='difficulty-select'>
			<label>
				<input type="radio" on:change={changeDifficulty} bind:group={selectedDifficulty} name="difficulty" data-level={song.difficulties.past ? song.difficulties.past.level : ""} value="past" disabled={!song.difficulties.past}>
				PAST
			</label>
			<label>
				<input type="radio" on:change={changeDifficulty} bind:group={selectedDifficulty} name="difficulty" data-level={song.difficulties.present ? song.difficulties.present.level : ""} value="present" disabled={!song.difficulties.present}>
				PRESENT
			</label>
			<label>
				<input type="radio" on:change={changeDifficulty} bind:group={selectedDifficulty} name="difficulty" data-level={song.difficulties.future ? song.difficulties.future.level : ""} value="future" disabled={!song.difficulties.future}>
				FUTURE
			</label>
			<label>
				<input type="radio" on:change={changeDifficulty} bind:group={selectedDifficulty} name="difficulty" data-level={song.difficulties.beyond ? song.difficulties.beyond.level : ""} value="beyond" disabled={!song.difficulties.beyond}>
				BEYOND
			</label>
		</div>
	</div>
	<div class='flow'>
		<div id='song-info'>
			<p>{song.pack}</p>
			<h2 id='song-title'>{songTitle}</h2>
			<p>{song.artist}</p>
			<p>BPM: {song.bpm}</p>
		</div>
		<div id='diff-info'>
			<p id="difficulty" class={selectedDifficulty}>{(selectedDifficulty || "").toUpperCase()}</p>
			<p>Level: {Difficulty.level} (constant {Difficulty.constant.toFixed(1)})</p>
			<p>Note count: {Difficulty.notes}</p>
			<p>Note design: {Difficulty.charter}</p>
		</div>
	</div>
</div>

<!-- Score, grade, potential, note counts -->
<div id="stats">
	<p id='result'>
		<span id='score'>{arcaeaScoreFormat(score)}</span> 
		<span id='grade' data-grade={grade}>{grade}</span>
	</p>
	<div id='potential'>
		<div 
			id='potential-diamond' 
			data-ptt={potentialValue.toFixed(2)}
			data-tier={potentialTier}>
		</div>
		<!-- ({Difficulty.constant.toFixed(2)} + {scoreModifier.toFixed(2)}) -->
	</div>
	<div id='judge'>
		<span>PURE: {pure}</span>
		<span>LOST: {lost}</span>
	</div>
</div>

<input type='range' id='pure-slider' name='pure' bind:value={pure} step='1'
			 min={Math.max(Math.floor(Difficulty.notes * 0.83), 0)} max={Difficulty.notes}>
<svg id='chart' viewBox='0 0 160, 70'>
	<style>
		* {
				fill: currentColor;
		}
		polyline {
				stroke: currentColor;
				stroke-width: 2;
				vector-effect: non-scaling-stroke;
		}
		text {
			font: 0.33em 'Exo';
		}
		.dotted {
			stroke-dasharray: 4;
		}
	</style>
	<polyline points='0,70 130,20'/>
	<polyline points='130,20 150,10'/>
	<polyline class='dotted' points='150,10 160,10'/>
	<polyline class='dotted' points='130,0 130,70'/>
	<text x='131' y='70'>EX</text>
	<circle id='point' r='1.5' cx={x} cy={y}/>
</svg>

