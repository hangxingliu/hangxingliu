//@ts-check
/// <reference path="../node.d.ts" />
/// <reference path="../github.d.ts" />

'use strict';

let https = require("https"),
	url = require('url'),
	fs = require('fs'),
	path = require('path'),
	os = require('os');

let link = require('./link'),
	hypertext = require('./hypertext');

const cache = path.join(os.tmpdir(), 'hangxingliu.cache');
const cacheTime = 5 * 60 * 1000; // 5 min

module.exports = {
	listRepo: listRepo
};

/**
 * @param {{top?: number; keyword?: string}} [opts]
 */
function listRepo(opts) {
	let uri = url.parse(link.githubRepoAPI);
	let options = {
		method: 'GET',
		host: uri.host,
		path: uri.path,
		port: 443,
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': `Node.js ${process.version}`
		}
	};

	let cacheResponse = getCache();
	if (cacheResponse)
		return display(cacheResponse, opts);

	console.log(hypertext.convert(`  <dim>fetching hangxingliu's repositories ...</dim>\n`));

	let request = https.request(options, response => {
		if (response.statusCode != 200)
			return oops(`Github API response ${response.statusCode} (${response.statusMessage}), but not 200`);

		let body = '';

		response.setEncoding('utf8');

		response.on('error', oops);
		response.on('data', chunk => { body += chunk; });
		response.on('end', () => {
			setCache(body);
			display(body, opts)
		});
	});

	request.on('error', oops);
	request.end();
}

/**
 * @param {string} json
 * @param {{top?: number; keyword?: string}} [opts]
 */
function display(json, opts) {
	opts = opts || {};

	/** @type {GithubRepo[]} */
	let repositories = parseJSON(json);

	if (!Array.isArray(repositories))
		return oops(`Github API response is not an array!`);

	// remove empty repository item
	repositories.filter(repo => !!repo);

	hypertext.log("  <b><cyan>Repositories:</cyan></b>\n");

	if (opts.keyword) {
		let keyword = opts.keyword.trim().toLowerCase();
		repositories = repositories.filter(repo =>
			(repo.name || '').toLowerCase().indexOf(keyword) >= 0||
			(repo.description || '').toLowerCase().indexOf(keyword) >= 0);
	}

	if (opts.top)
		repositories = repositories.slice(0, opts.top);

	repositories.forEach(repo => {
		let url = repo.html_url;

		let description = String(repo.description || '')
			.replace(/\s*:\w+:\s*/g, ''); // remove emoji icon

		hypertext.log(`    <cyan>${repo.name}</cyan>`);
		hypertext.log(`      <dim>${repo.pushed_at}</dim>`);
		hypertext.log(`      <dim>[${url}](${url})</dim>`);
		if (description)
			hypertext.log(`      <grey>${description}</grey>`);
		console.log('');

	});
}

/** @param {string} json */
function parseJSON(json) {
	try {
		return JSON.parse(json);
	} catch (error) {
		oops(error);
	}
}

function getCache() {
	try {
		if (fs.existsSync(cache)) {
			let stat = fs.statSync(cache);
			if ((Date.now() - stat.mtime.getTime()) > cacheTime)
				return;
			return fs.readFileSync(cache, 'utf8');
		}
	} catch (error) {
		oops(error, 'Get Github response cache failed!');
	}
}

function setCache(cacheJSON) {
	try {
		fs.writeFileSync(cache, cacheJSON);
	} catch (error) {
		oops(error, 'Save Github response cache failed!');
	}
}

/**
 * @param {string|Error} message
 * @param {string} [step]
 */
function oops(message, step) {
	if (message instanceof Error)
		message = String(message.stack || message.message || message);

	let array = [`<red>  <b>Oops!</b> ${step||"fetch failed"}`];
	array.push(String(message).split('\n').map(line => `    ${line}`).join('\n'));
	array.push(`</red>\n`);

	hypertext.log(array);
	process.exit(1);
}
