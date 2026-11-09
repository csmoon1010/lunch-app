import { describe, expect, it } from "vitest";
import { filterRestaurants, pickByWeight, recommendLunch, sortRestaurants } from "./recommend.js";
import { RESTAURANTS, type Restaurant } from "./restaurants.js";

const today = "2026-09-24";
const candidates: Restaurant[] = [
    { id: "c", name: "C", category: "test", price: 9000, walkMinutes: 2, emoji: "" },
    { id: "a", name: "A", category: "test", price: 9000, walkMinutes: 3, emoji: "" },
    { id: "d", name: "D", category: "test", price: 7000, walkMinutes: 2, emoji: "" },
    { id: "b", name: "B", category: "test", price: 8000, walkMinutes: 5, emoji: "" },
];

describe("recommendation sorting", () => {
    it("keeps the original selection order when sort is omitted", () => {
        expect(recommendLunch({ today, count: 3 }, candidates, () => 0).map((r) => r.id)).toEqual(["c", "a", "d"]);
    });

    it("sorts by price and preserves the selection set", () => {
        const original = recommendLunch({ today, count: 3 }, candidates, () => 0);
        const sorted = recommendLunch({ today, count: 3, sort: "price" }, candidates, () => 0);
        expect(sorted.map((r) => r.id)).toEqual(["d", "c", "a"]);
        expect(sorted.map((r) => r.id).sort()).toEqual(original.map((r) => r.id).sort());
    });

    it("sorts by walk while preserving ties in their previous order", () => {
        expect(sortRestaurants(candidates, "walk").map((r) => r.id)).toEqual(["c", "d", "a", "b"]);
    });

    it("sorts by price while preserving ties in their previous order", () => {
        expect(sortRestaurants(candidates, "price").map((r) => r.id)).toEqual(["d", "b", "c", "a"]);
    });

    it("returns the original array unchanged when no sort is selected", () => {
        expect(sortRestaurants(candidates)).toBe(candidates);
    });
});

describe("filterRestaurants", () => {
    it("도보 시간 조건을 넘는 식당은 제외한다", () => {
        const result = filterRestaurants(RESTAURANTS, { today, maxWalkMinutes: 3 });
        expect(result.map((r) => r.id)).toEqual(["r02", "r08", "r10", "r12"]);
    });

    it("최근 3일 안에 방문한 식당은 제외한다", () => {
        const result = filterRestaurants(RESTAURANTS, { today, recentVisits: [{ restaurantId: "r02", date: "2026-09-23" }] });
        expect(result.some((r) => r.id === "r02")).toBe(false);
    });
});

describe("recommendLunch", () => {
    it("서로 다른 후보를 요청한 개수만큼 고른다", () => {
        const result = recommendLunch({ today, count: 3 }, RESTAURANTS, () => 0.5);
        expect(new Set(result.map((r) => r.id)).size).toBe(3);
    });

    it("가중치가 큰 항목이 먼저 뽑힌다", () => {
        expect(pickByWeight(["a", "b"], (item) => (item === "a" ? 9 : 1), () => 0.5)).toBe("a");
    });
});
