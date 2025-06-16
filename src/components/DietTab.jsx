import React, { useState, useEffect } from 'react';

export default function DietTab() {
    const [goalCalories, setGoalCalories] = useState(2000);
    const [intakeCalories, setIntakeCalories] = useState(0);
    const [nutrients, setNutrients] = useState({ carbs: 0, protein: 0, fat: 0 });
    const [selectedRecommend, setSelectedRecommend] = useState(null);

    const meals = JSON.parse(localStorage.getItem('meals')) || [];

    const recommendedMeals = [
        {
            name: '에그 샌드위치',
            kcal: 350,
            emoji: '🥪',
            nutrients: { carbs: 40, protein: 18, fat: 12 },
            recipe: {
                ingredients: ['계란 2개', '식빵 2장', '버터 약간', '소금/후추'],
                steps: [
                    '계란을 삶거나 스크램블한다',
                    '식빵을 굽고 버터를 바른다',
                    '계란을 올리고 소금/후추로 간한다',
                    '식빵으로 덮고 반으로 자른다',
                ],
            },
        },
        {
            name: '닭가슴살 도시락',
            kcal: 480,
            emoji: '🍛',
            nutrients: { carbs: 45, protein: 30, fat: 15 },
            recipe: {
                ingredients: ['닭가슴살 150g', '현미밥 1공기', '브로콜리 데침'],
                steps: [
                    '닭가슴살을 구워 준비한다',
                    '브로콜리를 데친다',
                    '현미밥과 함께 도시락에 담는다',
                ],
            },
        },
        {
            name: '현미밥 + 된장국',
            kcal: 500,
            emoji: '🍚',
            nutrients: { carbs: 60, protein: 20, fat: 10 },
            recipe: {
                ingredients: ['현미밥', '된장', '두부', '애호박', '양파'],
                steps: [
                    '된장국을 끓인다 (된장 + 야채 + 두부)',
                    '현미밥과 함께 그릇에 담는다',
                ],
            },
        },
        {
            name: '단백질바',
            kcal: 200,
            emoji: '🍫',
            nutrients: { carbs: 15, protein: 20, fat: 6 },
            recipe: {
                ingredients: ['단백질 파우더', '귀리', '코코넛 오일', '견과류'],
                steps: [
                    '재료를 섞고 틀에 눌러 담는다',
                    '냉장 보관 후 꺼낸다',
                ],
            },
        },
    ];

    useEffect(() => {
        const total = meals.reduce((sum, meal) => sum + Number(meal.kcal || 0), 0);
        setIntakeCalories(total);

        const nutrientSum = meals.reduce(
            (acc, meal) => {
                if (meal.nutrients) {
                    acc.carbs += parseInt(meal.nutrients.carbs, 10) || 0;
                    acc.protein += parseInt(meal.nutrients.protein, 10) || 0;
                    acc.fat += parseInt(meal.nutrients.fat, 10) || 0;
                }
                return acc;
            },
            { carbs: 0, protein: 0, fat: 0 }
        );

        setNutrients(nutrientSum);
    }, [meals]);

    const remaining = Math.max(goalCalories - intakeCalories, 0);
    const percentage = (value) => Math.min((value / goalCalories) * 100, 100);

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">식단 정보</h2>

            {/* 목표 칼로리 */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <label className="block mb-2 font-medium">목표 칼로리</label>
                <input
                    type="range"
                    min={1000}
                    max={3000}
                    step={100}
                    value={goalCalories}
                    onChange={(e) => setGoalCalories(Number(e.target.value))}
                    className="w-full"
                />
                <p className="mt-2 text-sm text-gray-700">{goalCalories} kcal</p>
            </div>

            {/* 섭취 현황 */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="flex justify-between mb-2">
                    <span>섭취한 칼로리</span>
                    <span className="font-semibold">{intakeCalories.toLocaleString()} kcal</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span>남은 칼로리</span>
                    <span className="font-semibold">{remaining.toLocaleString()} kcal</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div
                        className="h-full bg-green-400"
                        style={{ width: `${percentage(intakeCalories)}%` }}
                    />
                </div>
            </div>

            {/* 영양소 바 */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <p className="font-medium mb-2">영양소 섭취량</p>
                <div className="mb-2">
                    <label className="text-sm">탄수화물</label>
                    <div className="h-3 bg-gray-200 rounded-full">
                        <div className="h-full bg-blue-400" style={{ width: `${percentage(nutrients.carbs * 4)}%` }} />
                    </div>
                </div>
                <div className="mb-2">
                    <label className="text-sm">단백질</label>
                    <div className="h-3 bg-gray-200 rounded-full">
                        <div className="h-full bg-red-400" style={{ width: `${percentage(nutrients.protein * 4)}%` }} />
                    </div>
                </div>
                <div>
                    <label className="text-sm">지방</label>
                    <div className="h-3 bg-gray-200 rounded-full">
                        <div className="h-full bg-yellow-400" style={{ width: `${percentage(nutrients.fat * 9)}%` }} />
                    </div>
                </div>
            </div>

            {/* 추천 식단 */}
            <div className="bg-white p-4 rounded-lg shadow mb-2">
                <p className="font-medium mb-2">추천 식단</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {recommendedMeals.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedRecommend(item)}
                            className="border p-2 rounded hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                        >
                            <span>{item.emoji} {item.name}</span>
                            <span className="text-xs text-gray-500">{item.kcal} kcal</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 선택된 식단 상세 */}
            {selectedRecommend && (
                <div className="bg-white p-5 rounded-lg shadow border border-blue-200 mt-4">
                    <p className="text-xl font-bold mb-2">{selectedRecommend.emoji} {selectedRecommend.name}</p>
                    <p className="text-gray-700 mb-3 text-sm">총 칼로리: {selectedRecommend.kcal} kcal</p>

                    <div className="flex gap-2 text-xs mb-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            탄수화물 {selectedRecommend.nutrients.carbs}g
                        </span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                            단백질 {selectedRecommend.nutrients.protein}g
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            지방 {selectedRecommend.nutrients.fat}g
                        </span>
                    </div>

                    <div className="mb-4">
                        <p className="font-semibold text-sm mb-1">🧂 재료</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                            {selectedRecommend.recipe.ingredients.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="font-semibold text-sm mb-1">🍳 조리 방법</p>
                        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                            {selectedRecommend.recipe.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
}
