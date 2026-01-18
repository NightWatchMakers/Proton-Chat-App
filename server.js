const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3141;
const ROOT_DIR = path.resolve(__dirname, "public"); // only serve from /public

const server = http.createServer((req, res) => {
  try {
    // Decode URL safely
    const decodedPath = decodeURIComponent(req.url.split("?")[0]);

    // Resolve requested path
    let filePath = path.resolve(ROOT_DIR, "." + decodedPath);

    // 🚫 Block path traversal
    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403);
      return res.end("403 Forbidden");
    }

    // Default to index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("404 Not Found");
      }

      res.writeHead(200, { "Content-Type": getContentType(filePath) });
      res.end(data);
    });
  } catch {
    res.writeHead(400);
    res.end("400 Bad Request");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Basic MIME types
function getContentType(file) {
  const ext = path.extname(file);
  return {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
  }[ext] || "application/octet-stream";
}
