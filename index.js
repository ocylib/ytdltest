const { getInfo, downloadFromInfo, chooseFormat } = require('ytdl-core');
const rangeParser = require('range-parser');
const { slice } = require('stream-slice');
const streamLength = require('stream-length');
const http = require('http');
const PORT = process.env.PORT || 80;

const server = http.createServer(async (req, res) => {
	const url = 'https://www.youtube.com/watch?v=uVwtVBpw7RQ';
	const {
		headers: { range },
	} = req;
	const options = {
		filter: 'audioandvideo',
		quality: 'highestvideo',
		highWaterMark: 1 << 25,
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
		end = end < streamLength(stream) ? end : streamLength(stream);
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

server.listen(PORT, () => console.log('running'));
