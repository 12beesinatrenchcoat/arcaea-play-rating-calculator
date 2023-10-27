<script lang="ts">
	interface Difficulty {
		level: string;
		notes: number;
		constant: number;
		charter: string;
	}

	interface Song {
		artist: string;
		pack: string;
		side: 'Light' | 'Conflict' | 'Colorless';
		version: string;
		difficulties: {
			past?: Difficulty;
			present?: Difficulty;
			future?: Difficulty;
			beyond?: Difficulty;
		};
	}

	import packs from '$lib/assets/charts.json';

	// Position of point on graph.
	export let x: string;
	export let y: string;

	export let pttPosBounds: {
		[tier: string]: [startX: number, width: number, midpoint?: number];
	} = {
		blue: [0, 0],
		green: [0, 0],
		purple: [0, 0],
		'purple-deco': [0, 0],
		'tomato-deco': [0, 0],
		star1: [0, 0, 0],
		star2: [0, 0, 0],
		star3: [0, 0, 0],
	};

	/** Actually a stringified table. [pack: string, songTitle: string] */
	export let selectedSong: string;
	export let selectedPack: string = 'Arcaea';
	let selectedDifficulty: 'past' | 'present' | 'future' | 'beyond';
	export let songTitle =
		"if you're seeing, this, something probably went wrong";
	export let song: Song = {
		artist: "or just wait a bit, maybe it's loading",
		pack: 'whoops',
		side: 'Colorless',
		version: '-2',
		difficulties: {},
	};
	export let difficulty: Difficulty = {
		level: 'no',
		notes: 1,
		constant: 0,
		charter: 'no',
	};

	export let score: number;
	export let grade: 'EX+' | 'EX' | 'AA' | 'A' | 'B' | 'C' | 'D';
	export let scoreModifier: number;
	export let pure = 0;
	export let lost: number;

	export let potentialValue = 0;
	export let potentialTier:
		| 'blue'
		| 'green'
		| 'purple'
		| 'purple-deco'
		| 'tomato-deco'
		| 'star1'
		| 'star2'
		| 'star3';

	$: lost = difficulty.notes - pure;

	$: score = Math.ceil((pure / difficulty.notes) * 10e6);

	// Setting score modifier
	$: {
		if (score >= 10e6) {
			scoreModifier = 2;
		} else if (score > 9.8e6) {
			scoreModifier = 1 + (score - 9.8e6) / 0.2e6;
		} else {
			scoreModifier = (score - 9.5e6) / 0.3e6;
		}

		calculatePotential();
	}

	// Setting grade
	$: {
		if (score >= 9.9e6) {
			grade = 'EX+';
		} else if (score >= 9.8e6) {
			grade = 'EX';
		} else if (score >= 9.5e6) {
			grade = 'AA';
		} else if (score >= 9.2e6) {
			grade = 'A';
		} else if (score >= 8.9e6) {
			grade = 'B';
		} else if (score >= 8.6e6) {
			grade = 'C';
		} else {
			grade = 'D';
		}
	}

	// Moving position of graph
	$: {
		x = String(scoreToGraphX(score));
		const numberX = Number(x);
		if (score <= 9.8e6) {
			// EX or above
			y = String(70 - (numberX / 120) * 50);
		} else {
			// Below EX
			y = String(20 - ((numberX - 120) / 20) * 10);
		}
	}

	// Song change!
	$: if (selectedSong) {
		console.debug(selectedSong);
		const data = JSON.parse(selectedSong) as [
			pack: keyof typeof packs,
			songTitle: string,
		];
		songTitle = data[1];
		const pack = packs[data[0]];
		song = pack[data[1] as keyof typeof pack];
		const {difficulties} = song;

		if (
			(selectedDifficulty && !difficulties[selectedDifficulty]) ||
			Object.keys(difficulties).length === 1 ||
			!selectedDifficulty
		) {
			// Set difficulty to first difficulty if none chosen
			selectedDifficulty = Object.keys(difficulties)[0] as
				| 'past'
				| 'present'
				| 'future'
				| 'beyond';
		}

		changeDifficulty();
	}

	// Difficulty change!
	function changeDifficulty() {
		const oldPercent = pure / difficulty.notes;
		if (song.difficulties && selectedDifficulty) {
			difficulty = song.difficulties[selectedDifficulty]!;
			if (pure === 0) {
				pure = Math.floor(0.83 * difficulty.notes);
			} else {
				pure = Math.round(oldPercent * difficulty.notes);
			}
		}

		calculatePotential();

		// Calculating potential ranks, moving rectangles around
		const pttBounds: {[tier: string]: [number, number]} = {
			blue: [0, 3.5],
			green: [3.5, 7.0],
			purple: [7.0, 10.0],
			'purple-deco': [10.0, 11.0],
			'tomato-deco': [11.0, 12.0],
			star1: [12.0, 12.5],
			star2: [12.5, 13.0],
			star3: [13.0, 99.0],
		};

		function modifierToScore(modifier: number) {
			if (modifier >= 1) {
				return 0.2e6 * (modifier - 1) + 9.8e6;
			}

			return 0.3e6 * modifier + 9.5e6;
		}

		Object.keys(pttBounds).forEach((tier: string) => {
			const pttBound = pttBounds[tier];

			const startX =
				pttBound[0] === 0
					? 0 // If the lower bound is 0, start at 0
					: scoreToGraphX(modifierToScore(pttBound[0] - difficulty.constant));

			const endX = scoreToGraphX(
				modifierToScore(pttBound[1] - difficulty.constant),
			);

			console.log(
				tier,
				startX,
				modifierToScore(pttBound[0] - difficulty.constant),
				endX,
				modifierToScore(pttBound[1] - difficulty.constant),
				(startX + endX) / 2,
			);

			// Start X of rectangle, width, and midpoint
			pttPosBounds[tier][0] = startX;
			pttPosBounds[tier][1] = endX - startX;
			pttPosBounds[tier][2] = (startX + endX) / 2;
		});
	}

	/**
	 * Formats a score the way Arcaea does — 8 digits, separated with single ticks.
	 * @param {number} score
	 * @returns {string}
	 */
	function arcaeaScoreFormat(score: number) {
		score = Number(score);
		let output = score.toLocaleString('en-UK', {
			maximumFractionDigits: 0,
			minimumIntegerDigits: 8,
		});
		output = output.replaceAll(',', "'");
		return output;
	}

	function scoreToGraphX(score: number) {
		return score > 10e6 ? 150 : Math.min((score - 8.6e6) / 1e4, 150);
	}

	function calculatePotential() {
		potentialValue = Math.max(
			Math.round((difficulty.constant + scoreModifier) * 100) / 100,
			0.0,
		);
		potentialTier =
			potentialValue >= 13.0
				? 'star3'
				: potentialValue >= 12.5
				? 'star2'
				: potentialValue >= 12.0
				? 'star1'
				: potentialValue >= 11.0
				? 'tomato-deco'
				: potentialValue >= 10.0
				? 'purple-deco'
				: potentialValue >= 7.0
				? 'purple'
				: potentialValue >= 3.5
				? 'green'
				: 'blue';
	}
</script>

<svelte:head>
	<title>Arcaea Play Rating Calculator</title>
</svelte:head>

<svelte:window on:load={changeDifficulty} />

<h1>Arcaea Play Rating Calculator</h1>
<a href="https://github.com/12beesinatrenchcoat/arcaea-potential-calculator">
	Source Code
</a>
<a href="https://arcaea.fandom.com/">Arcaea Community Wiki</a>
<p>
	This is a fanmade project. It is unaffiliated with Arcaea and lowiro. Arcaea
	belongs to lowiro. Check it out <a href="https://arcaea.lowiro.com">here!</a>
</p>

<!-- Song select -->
<div class="two-column">
	<div id="select-menu" class="flow">
		<label>
			pack
			<select id="pack-select" bind:value={selectedPack}>
				{#each Object.keys(packs) as pack}
					<option value={pack}>{pack}</option>
				{/each}
			</select>
		</label>
		<label>
			song
			<select id="song-select" bind:value={selectedSong}>
				{#each Object.keys(packs[selectedPack]) as song}
					<option value={`["${selectedPack}","${song}"]`}>{song}</option>
				{/each}
			</select>
		</label>
		<div id="difficulty-select">
			<label>
				<input
					type="radio"
					on:change={changeDifficulty}
					bind:group={selectedDifficulty}
					name="difficulty"
					data-level={song.difficulties.past
						? song.difficulties.past.level
						: ''}
					value="past"
					disabled={!song.difficulties.past}
				/>
				PAST
			</label>
			<label>
				<input
					type="radio"
					on:change={changeDifficulty}
					bind:group={selectedDifficulty}
					name="difficulty"
					data-level={song.difficulties.present
						? song.difficulties.present.level
						: ''}
					value="present"
					disabled={!song.difficulties.present}
				/>
				PRESENT
			</label>
			<label>
				<input
					type="radio"
					on:change={changeDifficulty}
					bind:group={selectedDifficulty}
					name="difficulty"
					data-level={song.difficulties.future
						? song.difficulties.future.level
						: ''}
					value="future"
					disabled={!song.difficulties.future}
				/>
				FUTURE
			</label>
			<label>
				<input
					type="radio"
					on:change={changeDifficulty}
					bind:group={selectedDifficulty}
					name="difficulty"
					data-level={song.difficulties.beyond
						? song.difficulties.beyond.level
						: ''}
					value="beyond"
					disabled={!song.difficulties.beyond}
				/>
				BEYOND
			</label>
		</div>
	</div>
	<div class="flow">
		<div id="song-info">
			<p>{song.pack}</p>
			<h2 id="song-title">{songTitle}</h2>
			<p>{song.artist}</p>
		</div>
		<div id="diff-info">
			<p id="difficulty" class={selectedDifficulty}>
				{(selectedDifficulty || '').toUpperCase()}
			</p>
			<p>
				Level: {difficulty.level} (constant {difficulty.constant.toFixed(1)})
			</p>
			<p>Note count: {difficulty.notes}</p>
			<p>Note design: {difficulty.charter}</p>
		</div>
	</div>
</div>

<!-- Score, grade, potential, note counts -->
<div id="stats">
	<p id="result">
		<span id="score">{arcaeaScoreFormat(score)}</span>
		<span id="grade" data-grade={grade}>{grade}</span>
	</p>
	<div id="potential">
		<div
			id="potential-diamond"
			data-ptt={potentialValue.toFixed(2)}
			data-tier={potentialTier}
		/>
		<!-- ({difficulty.constant.toFixed(2)} + {scoreModifier.toFixed(2)}) -->
	</div>
	<div id="judge">
		<span>PURE: {pure}</span>
		<span>LOST: {lost}</span>
	</div>
</div>

<input
	type="range"
	id="pure-slider"
	name="pure"
	bind:value={pure}
	step="1"
	min={Math.max(Math.floor(difficulty.notes * 0.83), 0)}
	max={difficulty.notes}
/>

<!-- 10x = 100k points -->
<!-- starts at  8.6m @ x = 0, ends at 10.0m @ x = 140 -->
<svg id="chart" viewBox="0 0 150, 70">
	<style>
		* {
			fill: currentColor;
		}
		polyline {
			stroke: currentColor;
			stroke-width: 2;
			vector-effect: non-scaling-stroke;
		}
		rect {
			z-index: -1;
			fill: var(--color);
		}
		text {
			font: 0.33em 'Exo';
			user-select: none;
		}
		g > text {
			color: white;
			font-size: 1.5em;
			text-anchor: middle;
			dominant-baseline: middle;
			opacity: 0.2;
		}
		/* Hide stars when at the right edge of the graph. */
		text[x='150'] {
			display: none;
		}

		.dotted {
			stroke-dasharray: 4;
		}

		#purple-deco {
			fill: url(#purple-deco-gradient);
		}
		#tomato-deco {
			fill: url(#tomato-deco-gradient);
		}
		#star1 {
			fill: url(#star1-gradient);
		}
		#star2 {
			fill: url(#star2-gradient);
		}
		#star3 {
			fill: url(#star3-gradient);
		}
	</style>
	<defs>
		<linearGradient id="purple-deco-gradient" x1="0" x2="0" y1="0" y2="1">
			<stop offset="0%" stop-color="#8e1ee5" />
			<stop offset="100%" stop-color="#451e62" />
		</linearGradient>
		<linearGradient id="tomato-deco-gradient" x1="0" x2="0" y1="0" y2="1">
			<stop offset="0%" stop-color="#ff4444" />
			<stop offset="100%" stop-color="#661b1b" />
		</linearGradient>
		<linearGradient id="star1-gradient" x1="0" x2="0" y1="0" y2="1">
			<stop offset="0%" stop-color="#f4447a" />
			<stop offset="100%" stop-color="#681830" />
		</linearGradient>
		<linearGradient id="star2-gradient" x1="0" x2="0" y1="0" y2="1">
			<stop offset="0%" stop-color="#fe3b92" />
			<stop offset="100%" stop-color="#691931" />
		</linearGradient>
		<linearGradient id="star3-gradient" x1="0" x2="0" y1="0" y2="1">
			<stop offset="0%" stop-color="#f645b0" />
			<stop offset="100%" stop-color="#642047" />
		</linearGradient>

		<clipPath id="star1-clip">
			<rect
				x={pttPosBounds.star1[0]}
				width={pttPosBounds.star1[1]}
				y="0"
				height="70"
			/>
		</clipPath>
		<clipPath id="star2-clip">
			<rect
				x={pttPosBounds.star2[0]}
				width={pttPosBounds.star2[1]}
				y="0"
				height="70"
			/>
		</clipPath>
		<clipPath id="star3-clip">
			<rect
				x={pttPosBounds.star3[0]}
				width={pttPosBounds.star3[1]}
				y="0"
				height="70"
			/>
		</clipPath>
	</defs>
	<rect
		id="blue"
		x={pttPosBounds.blue[0]}
		y="0"
		width={pttPosBounds.blue[1]}
		height="70"
	/>
	<rect
		id="green"
		x={pttPosBounds.green[0]}
		y="0"
		width={pttPosBounds.green[1]}
		height="70"
	/>
	<rect
		id="purple"
		x={pttPosBounds.purple[0]}
		y="0"
		width={pttPosBounds.purple[1]}
		height="70"
	/>
	<rect
		id="purple-deco"
		x={pttPosBounds['purple-deco'][0]}
		y="0"
		width={pttPosBounds['purple-deco'][1]}
		height="70"
	/>
	<rect
		id="tomato-deco"
		x={pttPosBounds['tomato-deco'][0]}
		y="0"
		width={pttPosBounds['tomato-deco'][1]}
		height="70"
	/>
	<g>
		<rect
			id="star1"
			x={pttPosBounds.star1[0]}
			y="0"
			width={pttPosBounds.star1[1]}
			height="70"
		/>
		<text x={pttPosBounds.star1[2]} y="35" clip-path="url(#star1-clip)">★</text>
	</g>

	<g>
		<rect
			id="star2"
			x={pttPosBounds.star2[0]}
			y="0"
			width={pttPosBounds.star2[1]}
			height="70"
		/>
		<g clip-path="url(#star2-clip)">
			<text x={pttPosBounds.star2[2]} y="25">★</text>
			<text x={pttPosBounds.star2[2]} y="45">★</text>
		</g>
	</g>

	<g>
		<rect
			id="star3"
			x={pttPosBounds.star3[0]}
			y="0"
			width={pttPosBounds.star3[1]}
			height="70"
		/>
		<g clip-path="url(#star3-clip)">
			<text x={pttPosBounds.star3[2]} y="15">★</text>
			<text x={pttPosBounds.star3[2]} y="35">★</text>
			<text x={pttPosBounds.star3[2]} dy="55">★</text>
		</g>
	</g>
	<polyline points="0,70 120,20" />
	<!-- Score before 9.8m -->
	<polyline points="120,20 140,10" />
	<!-- Score 9.8m-10.0m -->
	<polyline class="dotted" points="140,10 150,10" />
	<!-- Score after 10.0m -->
	<polyline class="dotted" points="120,0 120,70" />
	<!-- EX Rank line -->
	<text x="121" y="69">EX</text>
	<circle id="point" r="1.5" cx={x} cy={y} />
</svg>
