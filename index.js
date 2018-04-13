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
	let otherParams = [];
	for (let i = 0; i < argv.length; i ++) {
		let arg = argv[i];
		if (arg == 'github') {
			otherParams.push.apply(otherParams, argv.slice(i + 1));
			let opt = {};
			let rawOpt = otherParams[0],
				rawOptAsNum = parseInt(rawOpt, 10);

			if (rawOptAsNum && rawOptAsNum > 0)
				opt.top = rawOptAsNum;
			else if (rawOpt)
				opt.keyword = rawOpt;

			// for github:
			console.log(hypertext.convert(PREFIX));
			github.listRepo(opt);
			return;

		}
		otherParams.push(arg);
	}

	console.log(hypertext.convert(PREFIX + [
		``,
		`    <dim>Life is too short to live happy with coding and travel.</dim>`,
		``,
		`  <cyan><b>Email:</b>  [${link.email}](mailto:${link.email}) </cyan>`,
		`  <cyan><b>Github:</b> [${link.github}](${link.github}) </cyan>`,
		``,
		`  <grey>tip, commands to show my github repositories: `,
		``,
		`    <b><i>hangxingliu github</i></b>           # show all my repo`,
		`    <b><i>hangxingliu github 10</i></b>        # show my latest 10 repo`,
		`    <b><i>hangxingliu github keyword</i></b>   # show my repo with keyword`,
		``,
		`</grey>`
	].join('\n')));
}
