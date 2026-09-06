const http = require('http');
const url = require('url');
const fs = require('fs');
const querystring = require('querystring');
const pathFile = require('path');

const mime = {
   'html' : 'text/html',
   'css'  : 'text/css',
   'png'  : 'image/png',
   'mp3'  : 'audio/mpeg3',
   'mp4'  : 'video/mp4'
};

const server = http.createServer((request, response) => {
  const requestedurl = url.parse(request.url);
  let path = requestedurl.pathname;

  if (path == '/' || path == '/index.html') {
      path = 'index.html';
    route(request, response, path);
  } else if (path == '/register.html') {
    route(request, response, path);
  } else if (path == '/showInfo') {
    readFileComment(response);
  } else {
    route(request, response, path);
  }
});

server.listen(3000);

function route(request, response, path) {
  console.log(path);
  switch (path) {
    case '/save': {
      retrieve(request, response);
      break;
    }
    default: {
      const filePath = pathFile.join(__dirname, path);
      fs.stat(filePath, error => {
        if (!error) {
          fs.readFile(filePath, (error, content) => {
            if (error) {
              response.writeHead(500, {'Content-Type': 'text/plain'});
              response.write('Server internal error');
              response.end();
            } else {
              const vec = filePath.split('.');
              const extension = vec[vec.length - 1];
              const mimefile = mime[extension] || 'text/html';
              response.writeHead(200, {'Content-Type': mimefile});
              response.write(content);
              response.end();
            }
          });
        } else {
          response.writeHead(404, {'Content-Type': 'text/html'});
          response.write('<!doctype html><html><head></head><body>Resource not found</body></html>');
          response.end();
        }
      });
    }
  } 
}



function retrieve(request, response) {
  request.setEncoding('UTF-8')
  let info = '';
  request.on('data', partialdata => {
    info += partialdata;
  });
  request.on('end', () => {
    const form = querystring.parse(info);

    let username = form['name'];
    let password = form['password'];
    let sex = form['gender'];
    
    const commentData = `<p>username: ${username}<br>password: ${password}<br> sex: ${sex}</p><hr>\n`;
    const filePath = pathFile.join(__dirname, 'users.txt');

    fs.appendFile(filePath, commentData, err => {
      if (err) {
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.write('Server internal error');
        response.end();
      } else {
        console.log('File written successfully');
        response.writeHead(200, {'Content-Type': 'text/html'});
        const page = `
        <!doctype html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <p>Information successfully stored</p>
          <a href="/index.html">Back to main page</a>
        </body>
        </html>
      `;
        response.end(page);
      }
    });

  });
}

function readFileComment(response){
  const filePath = pathFile.join(__dirname, 'users.txt');
  fs.readFile(filePath, (error, content) => {
    if (error) {
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.write('Server internal error');
        response.end();
    } else {
        response.writeHead(200, {'Content-Type': 'text/html'});
        const stringData = content.toString('utf-8');
        let page = `
        <!doctype html>
        <html>
          <head><meta charset="UTF-8"></head>
          <body>
            ${stringData}
            <a href="/index.html">Back to main page</a>
          </body>
        </html>`;
        response.end(page);
    }
  });
}

console.log('Web server started');
