import React, { useState, useEffect } from 'react';

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
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        localStorage.setItem('meals', JSON.stringify(mealRecords));
    }, [mealRecords]);

    const analyzeImage = async (imageBase64) => {
        setLoading(true);
        setAnalysisDone(false);
        setCameraContent(
            <div className="camera-overlay flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900 mb-2"></div>
                <p className="text-sm text-gray-600">GPT 분석 중...</p>
            </div>
        );

        try {
            const res = await fetch('http://localhost:4000/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64 }),
            });

            const data = await res.json();

            if (!data.result) {
                alert("GPT 응답이 없습니다.");
                return;
            }

            const content = data.result;

            const nameMatch = content.match(/이 음식은\s(.+?)입니다/);
            const name = nameMatch?.[1] || '음식';

            const kcalMatch = content.match(/칼로리(?:는|:)?\s*약?\s*(\d+)/i);
            const kcal = kcalMatch ? parseInt(kcalMatch[1]) : 0;

            const carbsMatch = content.match(/탄수화물(?:은|:)?\s*약?\s*(\d+)/i);
            const carbs = carbsMatch ? parseInt(carbsMatch[1]) : 0;

            const proteinMatch = content.match(/단백질(?:은|:)?\s*약?\s*(\d+)/i);
            const protein = proteinMatch ? parseInt(proteinMatch[1]) : 0;

            const fatMatch = content.match(/지방(?:은|:)?\s*약?\s*(\d+)/i);
            const fat = fatMatch ? parseInt(fatMatch[1]) : 0;

            const foodData = {
                name,
                kcal,
                emoji: '🍽️',
                nutrients: {
                    carbs: `${carbs}g`,
                    protein: `${protein}g`,
                    fat: `${fat}g`,
                },
            };

            setCurrentFood(foodData);
            setAnalysisDone(true);
            setCameraContent(
                <div className="flex justify-center items-center h-full bg-gray-100">
                    <img
                        src={imageBase64}
                        alt="분석 이미지"
                        className="max-h-full max-w-full object-contain rounded-lg"
                    />
                </div>
            );
        } catch (err) {
            alert('분석 실패: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTakePhoto = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => handleImageUpload(e);
        input.click();
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            setImagePreview(base64String);
            analyzeImage(base64String);
        };
        reader.readAsDataURL(file);
    };

    const saveMeal = () => {
        if (!selectedTime) {
            alert("식사 시간대를 선택해주세요.");
            return;
        }

        const newMeal = {
            time: selectedTime,
            name: currentFood.name,
            kcal: currentFood.kcal,
            nutrients: currentFood.nutrients,
            image: imagePreview, // ✅ 이미지 저장
        };

        setMealRecords([newMeal, ...mealRecords]);
        setCurrentFood(null);
        setSelectedTime('');
        setAnalysisDone(false);
        setCameraContent(null);
        setImagePreview(null);
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
                    <div className="camera-overlay text-gray-500 flex flex-col items-center justify-center h-full">
                        <p>사진을 선택하면 분석이 시작됩니다</p>
                    </div>
                )}
            </div>

            <div className="flex space-x-2 mb-4">
                <button
                    onClick={handleTakePhoto}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex-1"
                >
                    📷 사진 촬영
                </button>
                <button
                    onClick={() => document.getElementById('fileInput').click()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg flex-1"
                >
                    🖼️ 갤러리
                </button>
                <input
                    type="file"
                    accept="image/*"
                    id="fileInput"
                    className="hidden"
                    onChange={handleImageUpload}
                />
            </div>

            {analysisDone && currentFood && (
                <div className="bg-white rounded-lg p-4 mb-4 shadow">
                    <h3 className="font-semibold text-lg mb-2">분석 결과 (1인분 or 1조각 기준)</h3>
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
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-lg overflow-hidden">
                                        {meal.image ? (
                                            <img src={meal.image} alt="썸네일" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{meal.emoji}</span>
                                        )}
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
