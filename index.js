const { getInfo, downloadFromInfo, chooseFormat } = require('ytdl-core');
const rangeParser = require('range-parser');
const { slice } = require('stream-slice');
const http = require('http');

const server = http.createServer(async (req, res) => {
	const url = 'http://www.youtube.com/watch?v=aqz-KE-bpKQ';
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
		res.writeHead(206, {
			'Accept-Ranges': 'bytes',
			'Content-Length': end - start + 1,
			'Content-Type': `video/${container}`,
			'Content-Range': `bytes ${start}-${end}/${contentLength}`,
		});
		stream.pipe(slice(start, end)).pipe(res);
	} else {
		res.writeHead(200, {
			'Content-Length': contentLength,
			'Content-Type': `video/${container}`,
		});
		stream.pipe(res);
	}
});

server.listen(80, () => console.log('running'));
