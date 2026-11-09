import { App } from "@modelcontextprotocol/ext-apps";
import { sortRestaurants, type RecommendSort } from "../domain/recommend.js";
import type { Restaurant } from "../domain/restaurants.js";

type LunchResult = { candidates?: Restaurant[] };

const root = document.querySelector<HTMLDivElement>("#root")!;
const app = new App({ name: "lunch-widget", version: "0.1.0" }, {});

let candidates: Restaurant[] = [];
let selectedSort: RecommendSort | undefined;

app.addEventListener("toolresult", ({ structuredContent }) => {
    candidates = ((structuredContent ?? {}) as LunchResult).candidates ?? [];
    selectedSort = undefined;
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
    const displayedCandidates = sortRestaurants(candidates, selectedSort);
    root.innerHTML = `
      <header class="widget-header">
        <h1>오늘의 점심 후보</h1>
        ${candidates.length > 0 ? `
          <label class="sort-control">정렬
            <select id="sort-order" aria-label="후보 정렬">
              <option value="" ${selectedSort === undefined ? "selected" : ""}>기본 순서</option>
              <option value="price" ${selectedSort === "price" ? "selected" : ""}>가격순</option>
              <option value="walk" ${selectedSort === "walk" ? "selected" : ""}>도보순</option>
            </select>
          </label>` : ""}
      </header>
      ${displayedCandidates.length === 0
        ? `<p class="empty">조건에 맞는 식당이 없어요. 예산이나 거리를 넓혀 보세요.</p>`
        : `<ul class="cards">${displayedCandidates.map(card).join("")}</ul>`}`;

    root.querySelector<HTMLSelectElement>("#sort-order")?.addEventListener("change", (event) => {
        const value = (event.currentTarget as HTMLSelectElement).value;
        selectedSort = value === "price" || value === "walk" ? value : undefined;
        render();
    });
}

render();
await app.connect();
