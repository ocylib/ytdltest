const { getInfo, downloadFromInfo, chooseFormat } = require('ytdl-core');
const rangeParser = require('range-parser');
const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
	const url = 'https://www.youtube.com/watch?v=oxFr7we3LC8&t=1640s';
	const {
		headers: { range },
	} = req;
	const options = {
		filter: 'audioandvideo',
		quality: 'highestvideo',
	};
	const info = await getInfo(url);
	const formatInfo = chooseFormat(info.formats, options);
	let { contentLength, container } = formatInfo;

	const stream = downloadFromInfo(info, options);
	if (!contentLength) {
		const p = new Promise((res) =>
			stream.once('progress', (a, b, t) => res(t))
		);
		contentLength = await p;
	}
	if (range) {
		let { start, end } = rangeParser(contentLength, range)[0];
		end = Math.min(start + 1024 * 1024, end);
		res.writeHead(206, {
			'Accept-Ranges': 'bytes',
			'Content-Length': end - start + 1,
			'Content-Type': `video/${container}`,
			'Content-Range': `bytes ${start}-${end}/${contentLength}`,
		});
		const rangeStream = downloadFromInfo(info, {
			...options,
			range: { start, end },
		});
		rangeStream.pipe(res);
	} else {
		res.writeHead(200, {
			'Content-Length': contentLength,
			'Content-Type': `video/${container}`,
		});
		stream.pipe(res);
	}
});

server.listen(PORT, () => console.log('running'));
