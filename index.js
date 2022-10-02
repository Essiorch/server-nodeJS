import http from 'http';
import fs from 'fs';

function getMimeType(path) {
	let mimes = {
		html: 'text/html',
		jpeg: 'image/jpeg',
		jpg:  'image/jpeg',
		png:  'image/png',
		svg:  'image/svg+xml',
		json: 'application/json',
		js:   'text/javascript',
		css:  'text/css',
		ico:  'image/x-icon',
	};
	
	let exts = Object.keys(mimes);
	let extReg = new RegExp('\\.(' + exts.join('|') + ')$');
	
	let ext = path.match(extReg)[1];
	
	if (ext) {
		return mimes[ext];
	} else {
		return 'text/plain';
	}
}
	
http.createServer(async (request, response) => {
	let text;
	let type;
	let path = 'root' + request.url;

	let arr = await fs.promises.readdir('root', (err, files) => {
			return files;
	});

	try {
		for(let elem of arr) {
			if (new RegExp(elem.split('.')[0]).test(path)) {
				if(path.split('.').length > 1) {
					type = getMimeType(path);
					text = await fs.promises.readFile(path);
				} else {
					let layout  = await fs.promises.readFile('layout.html', 'utf8');
					let nav = await fs.promises.readFile(path + '/nav.txt', 'utf8');
					let main = await fs.promises.readFile(path + '/main.txt', 'utf8');
					text = layout.replace(/\{% get element 'nav' %\}/, nav);
					text = text.replace(/\{% get element 'main' %\}/, main);
					type = 'text/html';
				}
				response.writeHead(200, {'Content-Type': type});
				response.write(text);
				
			}
			
		}
	}catch (err) {
		response.writeHead(404, {'Content-Type': 'text/plain'});
		response.write('page not found');
	}
	response.end();
}).listen(3000);
// node index.js