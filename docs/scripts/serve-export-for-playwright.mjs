import http from "node:http";
import path from "node:path";
import handler from "serve-handler";

const port = Number(process.env.PORT ?? 3000);
const basePath = "/ai-native-engineering";
const publicDir = path.resolve("out");

const server = http.createServer((request, response) => {
  const host = request.headers.host ?? `127.0.0.1:${port}`;
  const url = new URL(request.url ?? "/", `http://${host}`);

  if (!url.pathname.startsWith(basePath)) {
    response.statusCode = 404;
    response.end("Not Found");
    return;
  }

  const requestPath = url.pathname.slice(basePath.length) || "/";
  request.url = `${requestPath}${url.search}`;

  handler(request, response, {
    public: publicDir,
    cleanUrls: true,
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(
    `Static export is available at http://127.0.0.1:${port}${basePath}`,
  );
});
