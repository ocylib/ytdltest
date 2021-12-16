const ytcog = require('ytcog');
const http = require('http');
const miniget = require('miniget');
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
	try {
		const session = new ytcog.Session();
		await session.fetch();
		if (session.status === 'OK') {
			const video = new ytcog.Video(session, { id: 'oxFr7we3LC8' });
			await video.fetch();
			if (video.status === 'OK') {
				const format = video.formats.filter((f) => f.itag == 22)[0];
				console.log(format.url);
				res.writeHead(200, {
					'Content-Type': `video/mp4`,
				});
				miniget(format.url).pipe(res);
			}
		}
	} catch (error) {
		console.log('ERROR:', error);
		res.statusCode = 503;
	}
});

server.listen(PORT, () => console.log('running'));
