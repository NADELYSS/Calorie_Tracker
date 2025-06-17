import React, { useState, useEffect } from 'react';

// 식사 시간 옵션
const mealTimes = ['아침', '점심', '저녁', '간식'];

export default function CameraTab() {
    // 상태 정의
    const [image, setImage] = useState(null); // 촬영된 이미지
    const [statusMessage, setStatusMessage] = useState("사진을 촬영하려면 클릭하세요"); // 상태 메시지
    const [loading, setLoading] = useState(false); // 로딩 여부
    const [analysisDone, setAnalysisDone] = useState(false); // 분석 완료 여부
    const [rawGPT, setRawGPT] = useState(''); // GPT 원본 응답
    const [result, setResult] = useState(null); // 분석 결과 저장
    const [selectedTime, setSelectedTime] = useState(''); // 선택된 식사 시간
    const [mealRecords, setMealRecords] = useState(() => {
        // 로컬스토리지에서 식사 기록 불러오기
        const saved = localStorage.getItem('meals');
        return saved ? JSON.parse(saved) : [];
    });
    const [expandedIndex, setExpandedIndex] = useState(null); // 상세 정보 확장 상태

    // 식사 기록 업데이트 시 로컬스토리지 저장
    useEffect(() => {
        localStorage.setItem('meals', JSON.stringify(mealRecords));
    }, [mealRecords]);

    // GPT 응답 파싱 함수
    const parseResult = (text) => {
        const nameMatch = text.match(/이 음식은\s*(.+?)\s*(입니다|입니다\.)/);
        const kcalMatch = text.match(/칼로리[:\s]*약?\s*(\d+)/i);
        const carbsMatch = text.match(/탄수\D*?(\d+)/i);
        const proteinMatch = text.match(/단백질\D*?(\d+)/i);
        const fatMatch = text.match(/지방\D*?(\d+)/i);

        return {
            name: nameMatch?.[1] || '이름 없음',
            kcal: Number(kcalMatch?.[1] || 0),
            nutrients: {
                carbs: `${carbsMatch?.[1] || 0}g`,
                protein: `${proteinMatch?.[1] || 0}g`,
                fat: `${fatMatch?.[1] || 0}g`
            },
        };
    };

    // GPT 분석 요청 함수
    const analyzeImageWithGPT = async (imageBase64) => {
        try {
            setLoading(true);
            setStatusMessage("GPT 분석 중...");
            setAnalysisDone(false);

            const res = await fetch('/api/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64 })
            });

            const data = await res.json();
            if (!res.ok) {
                setStatusMessage("분석 실패");
                console.error("GPT 응답 오류:", data.error);
                return;
            }

            setRawGPT(data.result);
            const parsed = parseResult(data.result);
            setResult({ ...parsed, image: imageBase64 });
            setAnalysisDone(true);
            setStatusMessage(null);
        } catch (err) {
            console.error("분석 요청 실패:", err);
            setStatusMessage("분석 에러");
        } finally {
            setLoading(false);
        }
    };

    // 이미지 파일 선택 처리
    const handleImage = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setImage(base64);
            analyzeImageWithGPT(base64);
        };
        reader.readAsDataURL(file);
    };

    // 식사 기록 저장
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
        setImage(null);
        setResult(null);
        setExpandedIndex(null);
        setSelectedTime('');
        setAnalysisDone(false);
        setStatusMessage("사진을 촬영하려면 클릭하세요");
    };

    // 상세 정보 토글
    const toggleExpand = (idx) => {
        setExpandedIndex(prev => prev === idx ? null : idx);
    };

    // 식사 기록 삭제
    const deleteMeal = (idx) => {
        setMealRecords(records => records.filter((_, i) => i !== idx));
        if (expandedIndex === idx) setExpandedIndex(null);
    };

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">음식 사진 분석</h2>

            {/* 이미지 영역 및 상태 표시 */}
            <div className="bg-gray-100 h-64 mb-4 rounded-lg flex items-center justify-center overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-500"></div>
                        <p className="mt-2 text-sm">{statusMessage}</p>
                    </div>
                ) : image && analysisDone ? (
                    <img src={image} alt="분석 이미지" className="w-full h-full object-cover" />
                ) : (
                    <p className="text-gray-500">{statusMessage}</p>
                )}
            </div>

            {/* 사진 업로드 버튼 */}
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

            {/* 분석 결과 출력 */}
            {analysisDone && result && (
                <div className="bg-white rounded-lg p-4 shadow mb-4">
                    <h3 className="font-semibold text-lg mb-2">분석 결과</h3>
                    <div className="flex justify-between mb-1">
                        <span>{result.name}</span>
                        <span className="font-bold">약 {result.kcal} kcal</span>
                    </div>
                    <div className="mb-3 flex space-x-2 text-xs">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">탄수화물 {result.nutrients.carbs}</span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">단백질 {result.nutrients.protein}</span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">지방 {result.nutrients.fat}</span>
                    </div>
                    <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full p-2 border rounded-lg mb-2">
                        <option value="">식사 시간대 선택</option>
                        {mealTimes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={saveMeal} className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">
                        식사 기록 저장하기
                    </button>
                </div>
            )}

            {/* 저장된 식사 기록 */}
            <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">식사 기록</h3>
                {mealRecords.map((meal, idx) => (
                    <div key={idx}>
                        <div onClick={() => toggleExpand(idx)} className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm cursor-pointer">
                            <div className="flex items-center">
                                {meal.image ? (
                                    <img src={meal.image} alt="meal" className="w-10 h-10 rounded-full object-cover mr-3" />
                                ) : (
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-lg">
                                        🍽️
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium">{meal.time}</p>
                                    <p className="text-xs text-gray-500">{meal.name}</p>
                                </div>
                            </div>
                            <span className="font-semibold">{meal.kcal} kcal</span>
                        </div>

                        {expandedIndex === idx && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2 mx-4">
                                <p className="text-sm font-semibold mb-1">영양소 분석</p>
                                <div className="flex space-x-2 text-xs mb-2">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">탄수화물 {meal.nutrients.carbs}</span>
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded">단백질 {meal.nutrients.protein}</span>
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">지방 {meal.nutrients.fat}</span>
                                </div>
                                <button onClick={() => deleteMeal(idx)} className="bg-red-100 hover:bg-red-200 text-red-800 text-xs px-3 py-1 rounded">
                                    삭제
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
