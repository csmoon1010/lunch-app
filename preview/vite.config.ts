import { defineConfig } from "vite";

/** 개발용 미리보기 호스트. /mcp 요청은 MCP 서버(3000번 포트)로 넘긴다. */
export default defineConfig({
    root: "preview",
    server: { port: 5180, proxy: { "/mcp": "http://127.0.0.1:3000" } },
});
