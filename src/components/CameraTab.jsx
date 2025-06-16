import React, { useState, useEffect, useRef } from 'react';

const mealTimes = ['아침', '점심', '저녁', '간식'];

export default function CameraTab() {
    const [analysisDone, setAnalysisDone] = useState(false);
    const [cameraContent, setCameraContent] = useState(null);
    const [currentFood, setCurrentFood] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [mealRecords, setMealRecords] = useState(() => {
        const saved = localStorage.getItem('meals');
        return saved ? JSON.parse(saved) : [];
    });
    const [expandedIndex, setExpandedIndex] = useState(null);

    const cameraInputRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('meals', JSON.stringify(mealRecords));
    }, [mealRecords]);

    const handleImageUpload = async (file) => {
        if (!file) return;

        setCameraContent(
            <div className="camera-overlay">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="mt-2">GPT 분석 중...</p>
                </div>
            </div>
        );

        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });

        const res = await fetch("http://localhost:4000/analyze-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64 }),
        });

        const data = await res.json();
        const text = data.result || "분석 실패";

        const nameMatch = text.match(/이 음식은\s(.+?)입니다/);
        const name = nameMatch?.[1]?.trim() || "알 수 없음";

        const kcalMatch = text.match(/칼로리.*?(\d+)/);
        const carbsMatch = text.match(/탄수화물.*?(\d+)/);
        const proteinMatch = text.match(/단백질.*?(\d+)/);
        const fatMatch = text.match(/지방.*?(\d+)/);

        const result = {
            name,
            kcal: kcalMatch?.[1] || '??',
            nutrients: {
                carbs: carbsMatch?.[1] ? carbsMatch[1] + 'g' : '??',
                protein: proteinMatch?.[1] ? proteinMatch[1] + 'g' : '??',
                fat: fatMatch?.[1] ? fatMatch[1] + 'g' : '??',
            },
        };

        setCurrentFood(result);
        setAnalysisDone(true);
        setCameraContent(
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-2xl mb-2">{result.name}</p>
                </div>
            </div>
        );
    };


    const saveMeal = () => {
        if (!selectedTime) {
            alert('식사 시간대를 선택해주세요.');
            return;
        }

        const newMeal = {
            time: selectedTime,
            name: currentFood.name,
            kcal: currentFood.kcal,
            nutrients: currentFood.nutrients,
        };

        const updated = [newMeal, ...mealRecords];
        setMealRecords(updated);
        setAnalysisDone(false);
        setSelectedTime('');
        setCurrentFood(null);
        setCameraContent(null);
    };

    const toggleExpand = (index) => {
        setExpandedIndex((prev) => (prev === index ? null : index));
    };

    const deleteMeal = (index) => {
        const updated = mealRecords.filter((_, i) => i !== index);
        setMealRecords(updated);
        if (expandedIndex === index) setExpandedIndex(null);
    };

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">음식 사진 분석</h2>

            <div className="camera-container bg-gray-200 h-64 mb-4 rounded-xl overflow-hidden relative">
                {cameraContent || (
                    <div className="camera-overlay flex flex-col items-center justify-center h-full text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p>사진을 촬영하려면 클릭하세요</p>
                    </div>
                )}
            </div>

            <div className="flex space-x-2 mb-4">
                <button
                    onClick={() => cameraInputRef.current.click()}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex-1"
                >
                    📷 사진 촬영
                </button>
                <button
                    onClick={() => fileInputRef.current.click()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg flex-1"
                >
                    🖼️ 갤러리
                </button>
            </div>

            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="hidden"
            />
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="hidden"
            />

            {analysisDone && currentFood && (
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-lg mb-2">분석 결과</h3>
                    <div className="flex justify-between mb-1">
                        <span>{currentFood.name}</span>
                        <span className="font-bold">약 {currentFood.kcal} kcal</span>
                    </div>
                    <div className="mb-3">
                        <p className="mb-1 text-sm">영양소 분석</p>
                        <div className="flex space-x-2 text-xs">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                탄수화물 {currentFood.nutrients.carbs}
                            </span>
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                단백질 {currentFood.nutrients.protein}
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                지방 {currentFood.nutrients.fat}
                            </span>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="block mb-1 text-sm font-medium">식사 시간대 선택</label>
                        <select
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="">선택하세요</option>
                            {mealTimes.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={saveMeal}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg mt-2"
                    >
                        식사 기록 저장하기
                    </button>
                </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">식사 기록</h3>
                <div className="space-y-2">
                    {mealRecords.map((meal, index) => (
                        <div key={index}>
                            <div
                                onClick={() => toggleExpand(index)}
                                className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm cursor-pointer"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-lg">
                                        <span>🍽️</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{meal.time}</p>
                                        <p className="text-xs text-gray-500">{meal.name}</p>
                                    </div>
                                </div>
                                <span className="font-semibold">{meal.kcal} kcal</span>
                            </div>

                            {expandedIndex === index && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2 ml-4 mr-4">
                                    <p className="text-sm font-semibold mb-1">영양소 분석</p>
                                    <div className="flex space-x-2 text-xs mb-2">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            탄수화물 {meal.nutrients?.carbs || '??'}
                                        </span>
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                            단백질 {meal.nutrients?.protein || '??'}
                                        </span>
                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                            지방 {meal.nutrients?.fat || '??'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteMeal(index)}
                                        className="bg-red-100 hover:bg-red-200 text-red-800 text-xs px-3 py-1 rounded"
                                    >
                                        삭제
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
