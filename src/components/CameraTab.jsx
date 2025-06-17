import React, { useState, useEffect } from 'react';

const mealTimes = ['아침', '점심', '저녁', '간식'];

export default function CameraTab() {
    const [image, setImage] = useState(null);
    const [statusMessage, setStatusMessage] = useState("사진을 촬영하려면 클릭하세요");
    const [loading, setLoading] = useState(false);
    const [analysisDone, setAnalysisDone] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [mealRecords, setMealRecords] = useState(() => {
        const saved = localStorage.getItem('meals');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('meals', JSON.stringify(mealRecords));
    }, [mealRecords]);

    const analyzeImageWithGPT = async (imageBase64) => {
        try {
            setLoading(true);
            setStatusMessage("GPT 분석 중...");

            const response = await fetch('/api/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64 })
            });

            const data = await response.json();

            if (response.ok) {
                setStatusMessage(null);
                setResult(parseResult(data.result));
                setAnalysisDone(true);
            } else {
                setStatusMessage("분석 실패");
                console.error("GPT 응답 오류:", data.error);
            }
        } catch (err) {
            console.error("분석 요청 실패:", err);
            setStatusMessage("분석 에러");
        } finally {
            setLoading(false);
        }
    };

    const parseResult = (text) => {
        const nameMatch = text.match(/이 음식은\s*(.*?)입니다/);
        const kcalMatch = text.match(/칼로리:.*?(\d+)\s?kcal/);
        const carbsMatch = text.match(/탄수화물:.*?(\d+)\s?g/);
        const proteinMatch = text.match(/단백질:.*?(\d+)\s?g/);
        const fatMatch = text.match(/지방:.*?(\d+)\s?g/);

        return {
            name: nameMatch ? nameMatch[1] : '이름 없음',
            kcal: kcalMatch ? parseInt(kcalMatch[1]) : 0,
            nutrients: {
                carbs: carbsMatch ? parseInt(carbsMatch[1]) : 0,
                protein: proteinMatch ? parseInt(proteinMatch[1]) : 0,
                fat: fatMatch ? parseInt(fatMatch[1]) : 0,
            },
        };
    };


    const handleImage = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setImage(base64);
            analyzeImageWithGPT(base64);
        };
        reader.readAsDataURL(file);
    };

    const saveMeal = () => {
        if (!selectedTime || !result) return;
        const newMeal = {
            time: selectedTime,
            name: result.name,
            kcal: result.kcal,
            nutrients: result.nutrients,
            image: result.image
        };
        setMealRecords([newMeal, ...mealRecords]);
        setResult(null);
        setImage(null);
        setSelectedTime('');
        setAnalysisDone(false);
        setStatusMessage("사진을 촬영하려면 클릭하세요");
    };

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">음식 사진 분석</h2>

            {/* 미리보기 / 분석 중 */}
            <div className="bg-gray-100 h-64 mb-4 rounded-lg flex items-center justify-center overflow-hidden relative">
                {loading ? (
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-500"></div>
                        <p className="mt-2 text-sm">{statusMessage}</p>
                    </div>
                ) : image && analysisDone ? (
                    <img src={image} alt="분석 이미지" className="w-full h-full object-cover" />
                ) : (
                    <p className="text-gray-500">{statusMessage}</p>
                )}
            </div>

            {/* 버튼 */}
            <div className="flex space-x-2 mb-4">
                <label className="flex-1">
                    <div className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-center">
                        📷 사진 촬영
                    </div>
                    <input type="file" accept="image/*" capture="environment" hidden onChange={e => handleImage(e.target.files[0])} />
                </label>
                <label className="flex-1">
                    <div className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-center">
                        🖼️ 갤러리
                    </div>
                    <input type="file" accept="image/*" hidden onChange={e => handleImage(e.target.files[0])} />
                </label>
            </div>

            {/* 결과 */}
            {analysisDone && result && (
                <div className="bg-white rounded-lg p-4 shadow mb-4">
                    <h3 className="font-semibold text-lg mb-2">분석 결과</h3>
                    <div className="flex justify-between mb-1">
                        <span>{result.name}</span>
                        <span className="font-bold">약 {result.kcal} kcal</span>
                    </div>
                    <div className="mb-3">
                        <p className="mb-1 text-sm">영양소 분석</p>
                        <div className="flex space-x-2 text-xs">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                탄수화물 {result.nutrients.carbs}
                            </span>
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                단백질 {result.nutrients.protein}
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                지방 {result.nutrients.fat}
                            </span>
                        </div>
                    </div>
                    <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-2 border rounded-lg mb-2"
                    >
                        <option value="">식사 시간대 선택</option>
                        {mealTimes.map((time) => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                    <button onClick={saveMeal} className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg">
                        식사 기록 저장하기
                    </button>
                </div>
            )}

            {/* 기록 */}
            <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">식사 기록</h3>
                <div className="space-y-2">
                    {mealRecords.map((meal, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white rounded-lg p-2 shadow-sm">
                            <div className="flex items-center">
                                <img src={meal.image} className="w-10 h-10 rounded-full object-cover mr-3" alt="meal" />
                                <div>
                                    <p className="font-medium">{meal.time}</p>
                                    <p className="text-xs text-gray-500">{meal.name}</p>
                                </div>
                            </div>
                            <span className="font-semibold">{meal.kcal} kcal</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
