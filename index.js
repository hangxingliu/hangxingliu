//@ts-check

'use strict';

let hypertext = require('./libs/hypertext'),
	link = require('./libs/link'),
	github = require('./libs/github');

const PREFIX =`\n  <b>Liu Yue</b>\n  @hangxingliu\n`;

module.exports = { main: main };

/** @param {string[]} argv */
function main(argv) {
	argv = argv.slice(2);
	let isForGithub = argv.indexOf('github') >= 0;

	if (isForGithub) {
		console.log(hypertext.convert(PREFIX));
		github.listRepo();
		return;
	}

	console.log(hypertext.convert(PREFIX + [
		``,
		`    <dim>Life is too short to live happy with coding and travel.</dim>`,
		``,
		`  <cyan><b>Email:</b>  [${link.email}](mailto:${link.email}) </cyan>`,
		`  <cyan><b>Github:</b> [${link.github}](${link.github}) </cyan>`,
		``,
		`  <grey>tip: command <b><i>\`hangxingliu github\`</i></b> could display my github repositories </grey>`,
		``
	].join('\n')));
}
