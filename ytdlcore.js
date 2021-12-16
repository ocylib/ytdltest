const { getInfo, downloadFromInfo, chooseFormat } = require('ytdl-core');
const rangeParser = require('range-parser');
const http = require('http');
const PORT = process.env.PORT || 3000;

const COOKIE =
	'HSID=A3TZvCxY8Jj5K1cN4; SSID=APHEIK0oT1PupOP3x; APISID=tX076O1X_ADIcKUG/ATQRenoQhuPAeIGrg; SAPISID=3yPEacNbaw3CfVTH/AYpxJrjJ_lYXgRIf6; __Secure-1PAPISID=3yPEacNbaw3CfVTH/AYpxJrjJ_lYXgRIf6; __Secure-3PAPISID=3yPEacNbaw3CfVTH/AYpxJrjJ_lYXgRIf6; VISITOR_INFO1_LIVE=UYdfOWWH8J8; PREF=tz=Asia.Shanghai; _ga=GA1.2.1975201126.1635152974; NID=511=uLfoAMI6lm7-dljyAMhtsfJ4Z8UScsg-TD3dNZGwOXDRvbsf6wgFO30-sGOLKkyFQR4T14LCAJ6M-i9RBGnQqCkGSrPTBU87AAlgV7YItow__mNC8JAjbM0b0t4f0jnc-Ctv9Uua3lh6eqX2Whzikk1c3YszY5IIMzdHl_NssbA; SID=Egjrbj3ahPONgQZFS3WgryfRUWy4byDil-rp8KqQH-g0K_fVcwYlXIqToG08phmpRPaZeQ.; __Secure-1PSID=Egjrbj3ahPONgQZFS3WgryfRUWy4byDil-rp8KqQH-g0K_fVtqa-dmm9IoSq-AoMHQzGgA.; LOGIN_INFO=AFmmF2swRQIgL5J2Tf4O_SLdGHSt9AsKXiGK6mZwZ2zJfQCe7xNLFPICIQDFKb-lcYT2pRlJjwAHRWk4I6k5lFyUPeVtFZOUa1s-nA:QUQ3MjNmeGxxTU9rODg5V1hLZmRBazlwbGZIcld1a0FCSG5iZ09BbTMwdUthSG1MUjBRcmhqSG8zR1JyVUJsR1hWX253RGdPcnluT2hnY3oyZGsxQnloSTU0aVdHc3JWWUtoSm5JbkFqQkhQTGFreWNPZF9nRm1HOWhmTnVkYlZPYkh3MkpGQ2xDVTZ0RnNrUFh4YWtycWpueE1VbTFrWldn; __Secure-3PSID=Egjrbj3ahPONgQZFS3WgryfRUWy4byDil-rp8KqQH-g0K_fVuJ8IHzoNPOBR4i5PdFKmDw.; YSC=Y4gunyIPN1U';

const server = http.createServer(async (req, res) => {
	try {
		const url = 'https://www.youtube.com/watch?v=oxFr7we3LC8';
		const {
			headers: { range },
		} = req;
		const options = {
			filter: 'audioandvideo',
			quality: 'highestvideo',
			requestOptions: {
				headers: {
					cookie: COOKIE,
				},
			},
		};
		const info = await getInfo(url);
		console.log(info.formats);
		let { contentLength, container } = chooseFormat(info.formats, options);

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
	} catch (error) {
		console.log('ERROR:', error);
		res.statusCode = 503;
	}
});

server.listen(PORT, () => console.log('running'));
