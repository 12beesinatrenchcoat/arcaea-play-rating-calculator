<svelte:head>
	<title>Arcaea Play Rating Calculator</title>
</svelte:head>

<style lang='sass' global>
	@import "../app.sass"
</style>

<script>
	let graph;
	let selectedDifficulty;

	export let x;
	export let y;

	export let selectedSong;
	export let songTitle = "";
	export let song = {
		artist: "there is no song here",
		pack: "nonexistent",
		bpm: "5?",
		difficulties: {},
	};
	export let difficulty = {
		level: "no",
		notes: 1,
		constant: 0,
		charter: "no",
	}

	export let score;
	export let grade;
	export let scoreModifier;
	export let pure = 0;
	export let lost;

	let pureLostDisplay;

	import packs from "$lib/assets/charts.json"

	$: lost = difficulty.notes - pure;

	$: score = Math.ceil((pure / difficulty.notes) * 10e6)

	$: {
		if (score >= 10e6) {
			scoreModifier = 2;
		} else if (score > 9.8e6) {
			scoreModifier = 1 + ((score - 9.8e6) / 0.2e6);
		} else {
			scoreModifier = (score - 9.5e6) / 0.3e6;
		}
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
	$: if (selectedSong) {
		const data = JSON.parse(selectedSong);
		songTitle = data[1];
		song = packs[data[0]][data[1]];
		const {difficulties} = song;

		if(
			(selectedDifficulty && !difficulties[selectedDifficulty])
			|| Object.keys(difficulties).length === 1
			|| !selectedDifficulty
		) {
			selectedDifficulty = Object.keys(difficulties)[0];
		}

		changeDifficulty();
	}

	// Difficulty change!
	function changeDifficulty() {
		const oldPercent = pure / difficulty.notes;
		if (song.difficulties && selectedDifficulty) {
			difficulty = song.difficulties[selectedDifficulty];
			if (pure === 0) {
				pure = Math.floor(0.83 * difficulty.notes)
			} else {
				pure = Math.round(oldPercent * difficulty.notes)
			}
		}
	}

	/**
	 * Formats a score the way Arcaea does — 8 digits, separated with single ticks.
	 * @param {number} score
	 * @returns {string}
	 */
	function arcaeaScoreFormat(score) {
		score = Number(score);
		let output = score.toLocaleString("en-UK", {
			maximumFractionDigits: 0,
			minimumIntegerDigits: 8
		})
		output = output.replaceAll(",", "'");
		return output;
	}
</script>

<svelte:window on:load={changeDifficulty}/>

<h1>Arcaea Play Rating Calculator</h1>
<a href='https://github.com/12beesinatrenchcoat/arcaea-potential-calculator'>Source Code</a>
<a href='https://arcaea.fandom.com/'>Arcaea Community Wiki</a>
<p>This is a fanmade project. It is unaffiliated with Arcaea and lowiro. Arcaea belongs to lowiro.</p>

<div class='two-column'>
	<div id='select-menu' class='flow'>
		<label>
			Song
			<select id="song-select" bind:value={selectedSong}>
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
			<p>Level: {difficulty.level} (constant {difficulty.constant.toFixed(1)})</p>
			<p>Note count: {difficulty.notes}</p>
			<p>Note design: {difficulty.charter}</p>
		</div>
	</div>
</div>

<div id="stats">
	<p id='result'><span id='score'>{arcaeaScoreFormat(score)}</span> <span id='grade' data-grade={grade}>{grade}</span></p>
	<p>ptt: {Math.max((difficulty.constant + scoreModifier), 0.0).toFixed(2)} ({difficulty.constant.toFixed(2)} + {scoreModifier.toFixed(2)})</p>
</div>

<span bind:this={pureLostDisplay}>PURE: {pure} / LOST: {lost}</span><br>
<input type='range' id='pure-slider' name='pure' bind:value={pure} step='1'
			 min={Math.max(Math.floor(difficulty.notes * 0.83), 0)} max={difficulty.notes}>
<svg id='chart' viewBox='0 0 160, 70' bind:this={graph}>
	<style>
		polyline {
				stroke: black;
				stroke-width: 2;
				vector-effect: non-scaling-stroke;
		}
		.dotted {
				stroke-dasharray: 4;
		}
	</style>
	<polyline points='0,70 130,20'/>
	<polyline points='130,20 150,10'/>
	<polyline class='dotted' points='150,10 160,10'/>
	<circle id='point' r='1.5' cx={x} cy={y}/>
</svg>

