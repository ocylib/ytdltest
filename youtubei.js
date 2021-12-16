const Innertube = require('youtubei.js');
const rangeParser = require('range-parser');
const http = require('http');
const PORT = process.env.PORT || 3000;
(async () => {
	const server = http.createServer(async (req, res) => {
		try {
			const youtube = await new Innertube();
			let range = req.headers.range;
			let options = {};
			if (range) {
				let { start, end } = rangeParser(1024 * 1024 * 1024, range)[0];
				end = Math.min(start + 1024 * 1024, end);
				options.range = { start, end };
				res.writeHead(206, {
					'Accept-Ranges': 'bytes',
					'Content-Length': end - start + 1,
					'Content-Type': `video/mp4`,
					'Content-Range': `bytes ${start}-${end}/${1024 * 1024 * 1024}`,
				});
			} else {
				res.writeHead(200, {
					'Content-Type': `video/mp4`,
				});
			}
			console.log(options);
			const stream = youtube.download('oxFr7we3LC8', options);

			stream.pipe(res);
		} catch (error) {
			console.log('ERROR:', error);
		}
	});
	server.listen(PORT, () => console.log('running'));
})();
