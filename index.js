const Innertube = require('youtubei.js');
const http = require('http');
(async () => {
	const server = http.createServer(async (req, res) => {
		try {
			const youtube = await new Innertube();
			const stream = youtube.download('oxFr7we3LC8', {
				type: 'videoandaudio',
			});
			res.writeHead(200, {
				'Content-Type': `video/mp4`,
			});
			stream.pipe(res);
		} catch (error) {
			console.log('ERROR:', error);
		}
	});
	server.listen(3000, () => console.log('running'));
})();
