import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { AppBridge, PostMessageTransport } from "@modelcontextprotocol/ext-apps/app-bridge";

const HOST_INFO = { name: "lunch-preview-host", version: "0.1.0" };
const form = document.querySelector<HTMLFormElement>("#request")!;
const iframe = document.querySelector<HTMLIFrameElement>("#widget")!;
const logList = document.querySelector<HTMLOListElement>("#log")!;
const prompt = document.querySelector<HTMLDivElement>("#prompt")!;
const assistant = document.querySelector<HTMLDivElement>("#assistant")!;
const workspace = document.querySelector<HTMLDivElement>("#workspace")!;
const lightThemeButton = document.querySelector<HTMLButtonElement>("#theme-light")!;
const darkThemeButton = document.querySelector<HTMLButtonElement>("#theme-dark")!;
const inlineButton = document.querySelector<HTMLButtonElement>("#mode-inline")!;
const fullscreenButton = document.querySelector<HTMLButtonElement>("#mode-fullscreen")!;
const submitButton = form.querySelector<HTMLButtonElement>(".submit-button")!;

function log(text: string): void {
    const item = document.createElement("li");
    item.textContent = `${new Date().toLocaleTimeString("ko-KR")}  ${text}`;
    logList.prepend(item);
}

const client = new Client(HOST_INFO);
type WidgetData = {
    args: Record<string, number>;
    result: Awaited<ReturnType<typeof client.callTool>>;
    html: string;
};

let currentWidget: WidgetData | null = null;

function themedWidget(html: string): string {
    const theme = document.body.dataset.theme === "dark" ? "dark" : "light";
    const themedDocument = html.replace(/<html\b([^>]*)>/i, `<html$1 data-host-theme="${theme}">`);
    const themeStyles = `<style>
      :root[data-host-theme="light"] { color-scheme: light; --bg: #ffffff; --surface: #f7f7f8; --text: #1f2328; --muted: #6b7280; --border: #e5e7eb; }
      :root[data-host-theme="dark"] { color-scheme: dark; --bg: #212121; --surface: #2a2a2a; --text: #ececec; --muted: #a1a1aa; --border: #3f3f46; }
    </style>`;
    return themedDocument.replace("</head>", `${themeStyles}</head>`);
}

async function mountWidget(widget: WidgetData): Promise<void> {
    const bridge = new AppBridge(client, HOST_INFO, { openLinks: {}, serverTools: {}, logging: {} });
    bridge.oninitialized = async () => {
        log("위젯 초기화 완료");
        await bridge.sendToolInput({ arguments: widget.args });
        await bridge.sendToolResult(widget.result);
    };
    bridge.onsizechange = ({ height }) => {
        if (height) iframe.style.height = `${height}px`;
    };
    bridge.onmessage = async (params) => {
        const message = params.content.map((content) => ("text" in content ? content.text : "")).join(" ");
        log(`위젯 메시지: ${message}`);
        prompt.textContent = message;
        return {};
    };
    iframe.srcdoc = themedWidget(widget.html);
    await bridge.connect(new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!));
}

/** ChatGPT 호스트가 수행하는 흐름을 흉내 낸다: 도구 호출, UI 리소스 로드, iframe 위젯 표시, 결과 전달. */
async function callRecommend(args: Record<string, number>): Promise<void> {
    const { tools } = await client.listTools();
    const tool = tools.find((candidate) => candidate.name === "recommend_lunch");
    const uri = (tool?._meta?.ui as { resourceUri?: string } | undefined)?.resourceUri;
    if (!uri) throw new Error("recommend_lunch 도구의 UI 리소스가 연결되어 있지 않습니다.");

    const result = await client.callTool({ name: "recommend_lunch", arguments: args });
    log(`도구 호출: recommend_lunch ${JSON.stringify(args)}`);
    const text = (result.content as { type: string; text?: string }[]).find((content) => content.type === "text")?.text ?? "";
    assistant.textContent = text;

    const resource = await client.readResource({ uri });
    currentWidget = { args, result, html: (resource.contents[0] as { text: string }).text };
    await mountWidget(currentWidget);
}

function setTheme(theme: "light" | "dark"): void {
    document.body.dataset.theme = theme;
    lightThemeButton.setAttribute("aria-pressed", String(theme === "light"));
    darkThemeButton.setAttribute("aria-pressed", String(theme === "dark"));
    if (currentWidget) void mountWidget(currentWidget).catch((error: unknown) => log(`오류: ${String(error)}`));
}

function setDisplayMode(mode: "inline" | "fullscreen"): void {
    workspace.dataset.displayMode = mode;
    inlineButton.setAttribute("aria-pressed", String(mode === "inline"));
    fullscreenButton.setAttribute("aria-pressed", String(mode === "fullscreen"));
}

lightThemeButton.addEventListener("click", () => setTheme("light"));
darkThemeButton.addEventListener("click", () => setTheme("dark"));
inlineButton.addEventListener("click", () => setDisplayMode("inline"));
fullscreenButton.addEventListener("click", () => setDisplayMode("fullscreen"));
document.querySelector<HTMLButtonElement>("#clear-log")!.addEventListener("click", () => logList.replaceChildren());

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const args = { budget: Number(data.get("budget")), maxWalkMinutes: Number(data.get("maxWalkMinutes")) };
    prompt.textContent = `${args.budget.toLocaleString("ko-KR")}원 이하로 ${args.maxWalkMinutes}분 안에 갈 수 있는 점심 추천해 줘`;
    assistant.textContent = "추천을 불러오는 중…";
    void callRecommend(args).catch((error: unknown) => {
        assistant.textContent = "추천을 불러오지 못했습니다. 호스트 로그를 확인해 주세요.";
        log(`오류: ${error instanceof Error ? error.message : String(error)}`);
    });
});

submitButton.disabled = true;
void client.connect(new StreamableHTTPClientTransport(new URL("/mcp", location.href))).then(() => {
    log("MCP 서버에 연결했습니다.");
    submitButton.disabled = false;
    form.requestSubmit();
}).catch((error: unknown) => {
    submitButton.disabled = false;
    assistant.textContent = "MCP 서버에 연결할 수 없습니다. 호스트 로그를 확인해 주세요.";
    log(`MCP 연결 오류: ${error instanceof Error ? error.message : String(error)}`);
});
