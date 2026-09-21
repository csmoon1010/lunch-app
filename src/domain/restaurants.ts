export type Restaurant = {
    id: string;
    name: string;
    category: string;
    price: number;
    walkMinutes: number;
    emoji: string;
};

/** 회사 근처 식당 목록. lunch-data 저장소의 data/restaurants.json을 옮겨 온 스냅샷이다. */
export const RESTAURANTS: Restaurant[] = [
    { id: "r01", name: "골목 칼국수", category: "한식", price: 9000, walkMinutes: 4, emoji: "🍜" },
    { id: "r02", name: "한입 김밥", category: "분식", price: 6500, walkMinutes: 2, emoji: "🍙" },
    { id: "r03", name: "온기 순두부", category: "한식", price: 10000, walkMinutes: 6, emoji: "🍲" },
    { id: "r04", name: "버거 연구소", category: "양식", price: 12500, walkMinutes: 8, emoji: "🍔" },
    { id: "r05", name: "초록 샐러드", category: "샐러드", price: 11000, walkMinutes: 5, emoji: "🥗" },
    { id: "r06", name: "마라 공방", category: "중식", price: 13000, walkMinutes: 9, emoji: "🌶️" },
    { id: "r07", name: "돈카츠 하루", category: "일식", price: 11500, walkMinutes: 7, emoji: "🍱" },
    { id: "r08", name: "을지로 골목 끝 할머니 손맛 왕만두 칼국수 본점", category: "한식", price: 8500, walkMinutes: 3, emoji: "🥟" },
    { id: "r09", name: "쌀국수 포레스트", category: "아시안", price: 10500, walkMinutes: 6, emoji: "🍲" },
    { id: "r10", name: "제육 장인", category: "한식", price: 9000, walkMinutes: 3, emoji: "🍖" },
    { id: "r11", name: "스시 런치 오마카세", category: "일식", price: 25000, walkMinutes: 12, emoji: "🍣" },
    { id: "r12", name: "1층 편의점 도시락", category: "간편식", price: 4800, walkMinutes: 1, emoji: "🏪" },
];
