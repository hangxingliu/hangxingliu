//@ts-check

/*
	Detect is output colorful. And color text.

	Reference:
		https://github.com/Marak/colors.js/blob/master/lib/system/supports-colors.js
		https://github.com/jamestalmage/supports-hyperlinks/blob/master/index.js
*/

'use strict';

let os = require('os');

let isColorful = initIsColorful(),
	isLinkful = initIsLinkful();

const COLOR = {
	reset: [0, 0],

	b: [1, 22],
	dim: [2, 22],
	i: [3, 23],
	u: [4, 24],
	inverse: [7, 27],
	hidden: [8, 28],
	strike: [9, 29],

	black: [30, 39],
	red: [31, 39],
	green: [32, 39],
	yellow: [33, 39],
	blue: [34, 39],
	magenta: [35, 39],
	cyan: [36, 39],
	white: [37, 39],
	gray: [90, 39],
	grey: [90, 39],

	bgBlack: [40, 49],
	bgRed: [41, 49],
	bgGreen: [42, 49],
	bgYellow: [43, 49],
	bgBlue: [44, 49],
	bgMagenta: [45, 49],
	bgCyan: [46, 49],
	bgWhite: [47, 49],
};

module.exports = {
	isColorful: isColorful,
	isLinkful: isLinkful,
	convert: convert,
	log: log
};

/**
 * @param {string|string[]} text
 */
function log(text) { console.log(convert(Array.isArray(text) ? text.join('\n') : text)); }

/**
 * @param {string} text
 * @returns {string}
 */
function convert(text) {
	let shouldColored = name => isColorful && (name in COLOR);

	return String(text)
		.replace(/\[(.+)\]\((\S+)\)/g, (_, title, url) =>
			isLinkful ? `\u001b]8;;${url}\u0007${title}\u001b]8;;\u0007` : title)
		.replace(/<(\w+)>/g, (_, name) => shouldColored(name) ? `\u001b[${COLOR[name][0]}m` : '')
		.replace(/<\/(\w+)>/g, (_, name) => shouldColored(name) ? `\u001b[${COLOR[name][1]}m` : '')
		.replace(/<(\w+)\s*\/>/g, (_, name) => shouldColored(name) ? `\u001b[${COLOR[name][1]}m` : '');
}

function initIsColorful() {
	let env = process.env;
	let stream = process.stdout;

	if (stream && !stream.isTTY) return false;

	if ('TERM_PROGRAM' in env) {
		let program = env.TERM_PROGRAM;
		if (program == 'iTerm.app' || program == 'Hyper' || program == 'Apple_Terminal')
			return true;
	}

	if (/-256(color)?$/i.test(env.TERM))
		return true;

	if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM))
		return true;

	if ('COLORTERM' in env)
		return true;
}

function initIsLinkful() {
	let env = process.env;
	let stream = process.stdout;

	if (!isColorful) return false;
	if (process.platform == 'win32') return false;

	if ('TERM_PROGRAM' in env) {
		const version = parseVersion(env.TERM_PROGRAM_VERSION);
		if (env.TERM_PROGRAM == 'iTerm.app') {
			if (version.major === 3) {
				return version.minor >= 1;
			}
			return version.major > 3;
		}
	}

	if ('VTE_VERSION' in env) {
		// 0.50.0 was supposed to support hyperlinks, but throws a segfault
		if (env.VTE_VERSION === '0.50.0')
			return false;
		const version = parseVersion(env.VTE_VERSION);
		return version.major > 0 || version.minor >= 50;
	}

	return false;
}

function parseVersion(versionString) {
	const versions = (versionString || '').split('.').map(n => parseInt(n, 10));
	return { major: versions[0], minor: versions[1], patch: versions[2] };
}
//echo -e ''
