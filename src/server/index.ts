import { createMcpExpressApp } from "@modelcontextprotocol/express";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { createLunchServer } from "./lunchServer.js";

const PORT = Number(process.env.PORT ?? 3000);
const app = createMcpExpressApp();

app.post("/mcp", async (req, res) => {
    const server = createLunchServer();
    const transport = new NodeStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
        void transport.close();
        void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

// 무상태 서버라서 SSE 스트림(GET)과 세션 종료(DELETE)는 지원하지 않는다.
app.get("/mcp", (_req, res) => res.status(405).set("Allow", "POST").end());
app.delete("/mcp", (_req, res) => res.status(405).set("Allow", "POST").end());

app.listen(PORT, () => console.log(`lunch-app MCP 서버: http://localhost:${PORT}/mcp`));
