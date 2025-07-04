const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Get the file path
    let filePath = req.url === '/' ? 'index.html' : req.url.slice(1);
    filePath = path.join(__dirname, filePath);
    
    // Get file extension to set correct content type
    const ext = path.extname(filePath);
    const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif'
    }[ext] || 'text/plain';

    // Read and serve the file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - File Not Found</h1>');
            return;
        }
        
        res.writeHead(200, { 
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end(data);
    });
});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`🚀 CheckinEcuador server running at http://localhost:${PORT}`);
    console.log('📱 Open this URL in your browser to test the app');
    console.log('⏹️  Press Ctrl+C to stop the server');
});
