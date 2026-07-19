import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);

// moves up from backend/src to the project root
const projectRoot = path.resolve(currentDirectory, "../..");
//tells the broswer how to execute the different file types
const CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
};

function getFilePath(requestUrl) {
    const url = new URL(requestUrl, "http://localhost");
    let requestedPath = decodeURIComponent(url.pathname);

    if (requestedPath === "/") {
        requestedPath = "/index.html";
    }

    const filePath = path.resolve(
        projectRoot,
        `.${requestedPath}`,
    );

    // stops requests from accessing files outside the project
    if (
        filePath !== projectRoot &&
        !filePath.startsWith(`${projectRoot}${path.sep}`)
    ) {
        return null;
    }

    return filePath;
}

export function startHttpServer(port) {
    const server = http.createServer(async (request, response) => {
        try {
            const filePath = getFilePath(request.url || "/");

            if (!filePath) {
                response.writeHead(403, {
                    "Content-Type": "text/plain; charset=utf-8",
                });
                response.end("Forbidden");
                return;
            }

            const fileContent = await readFile(filePath);
            const extension = path.extname(filePath).toLowerCase();

            response.writeHead(200, {
                "Content-Type":
                    CONTENT_TYPES[extension] ||
                    "application/octet-stream",
            });

            response.end(fileContent);
        } catch (error) {
            if (
                error.code === "ENOENT" ||
                error.code === "EISDIR"
            ) {
                response.writeHead(404, {
                    "Content-Type": "text/plain; charset=utf-8",
                });
                response.end("Not found"); //404
                return;
            }

            console.error("HTTP server error:", error); 

            response.writeHead(500, {
                "Content-Type": "text/plain; charset=utf-8",
            });
            response.end("Internal server error");
        }
    });

    server.listen(port, () => {
        console.log(
            `frontend available at http://localhost:${port}`,
        );
    });

    return server;
}