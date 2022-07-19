# arcaea-play-rating-calculator
A little web thing that calculates the play rating of any given play in Arcaea (the New Dimension Rhythm Game).

Also an excuse to play around with [Svelte](https://svelte.dev).

This project is unofficial and fanmade — Arcaea belongs to lowiro. [Go check it out!](https://arcaea.lowiro.com/)

# developing
```bash
npm ci # install dependencies
npm run fetch:charts # get chart data
npm run dev # start vite dev server
```
Stylesheet is in the [/static](/static) directory, all the important stuff is in the [/src](/src) directory.

Look around! Have fun!

## on chart data
The chart data (from [this csv](https://gist.github.com/12beesinatrenchcoat/1bb2081eb2d6857254f06d3cf228e0c9)) is mostly sourced from the [Arcaea Community Wiki](https://arcaea.fandom.com). Thank you to the contributors there!

If any data is wrong, please feel free to file an issue.

# license
[MIT](./LICENSE.txt).
