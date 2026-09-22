import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { recommendLunch } from "../domain/recommend.js";

/** 요청마다 새 MCP 서버를 만든다(무상태 Streamable HTTP). */
export function createLunchServer(): McpServer {
    const server = new McpServer({ name: "lunch-app", version: "0.1.0" });

    server.registerTool("recommend_lunch", {
        title: "점심 추천",
        description: "회사 근처 식당 중에서 예산, 도보 시간, 최근 방문 기록을 고려해 점심 후보를 추천한다.",
        inputSchema: z.object({
            budget: z.number().int().positive().optional().describe("1인 예산(원)"),
            maxWalkMinutes: z.number().int().positive().optional().describe("최대 도보 시간(분)"),
            recentVisits: z.array(z.object({ restaurantId: z.string(), date: z.string() })).optional().describe("최근 방문 기록"),
        }),
        annotations: { readOnlyHint: true, openWorldHint: false },
    }, async (args) => {
        const candidates = recommendLunch({ ...args, today: new Date().toISOString().slice(0, 10) });
        return {
            content: [{ type: "text", text: candidates.length > 0 ? `추천 후보: ${candidates.map((c) => c.name).join(", ")}` : "조건에 맞는 식당이 없습니다." }],
            structuredContent: { candidates },
        };
    });

    return server;
}
