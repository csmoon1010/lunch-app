import { describe, expect, it } from "vitest";
import { filterRestaurants, pickByWeight, recommendLunch } from "./recommend.js";
import { RESTAURANTS } from "./restaurants.js";

const today = "2026-09-24";

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
