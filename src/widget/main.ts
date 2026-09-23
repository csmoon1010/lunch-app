import { App } from "@modelcontextprotocol/ext-apps";
import type { Restaurant } from "../domain/restaurants.js";

type LunchResult = { candidates?: Restaurant[] };

const root = document.querySelector<HTMLDivElement>("#root")!;
const app = new App({ name: "lunch-widget", version: "0.1.0" }, {});

let candidates: Restaurant[] = [];

app.addEventListener("toolresult", ({ structuredContent }) => {
    candidates = ((structuredContent ?? {}) as LunchResult).candidates ?? [];
    render();
});

function card(restaurant: Restaurant): string {
    return `
      <li class="card" data-id="${restaurant.id}">
        <span class="emoji">${restaurant.emoji}</span>
        <strong class="name">${restaurant.name}</strong>
        <span class="meta">${restaurant.category} · 도보 ${restaurant.walkMinutes}분</span>
        <span class="price">${restaurant.price.toLocaleString("ko-KR")}원</span>
      </li>`;
}

function render(): void {
    root.innerHTML = `
      <header class="widget-header"><h1>오늘의 점심 후보</h1></header>
      ${candidates.length === 0
        ? `<p class="empty">조건에 맞는 식당이 없어요. 예산이나 거리를 늘려 보세요.</p>`
        : `<ul class="cards">${candidates.map(card).join("")}</ul>`}`;
}

render();
await app.connect();
