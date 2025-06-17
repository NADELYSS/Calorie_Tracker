import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
Chart.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function ProfileTab() {
    const { userId, setUserId } = useContext(UserContext);

    const [profile, setProfile] = useState({
        name: '조윤재',
        status: '다이어트 중 · 목표: 5kg',
        height: 178,
        weight: 62,
        goalWeight: 67,
        activity: '보통',
        followers: 0,
        following: 0,
        posts: 0,
    });

    const [editMode, setEditMode] = useState(false);
    const [editProfile, setEditProfile] = useState({
        height: profile.height,
        weight: profile.weight,
        goalWeight: profile.goalWeight,
        activity: profile.activity,
    });

    const saveProfile = () => {
        setProfile((prev) => ({
            ...prev,
            ...editProfile,
        }));
        setEditMode(false);
    };

    const bmi = ((profile.weight / ((profile.height / 100) ** 2)).toFixed(1));
    const bmiStatus =
        bmi < 18.5 ? '저체중' : bmi < 25 ? '정상' : bmi < 30 ? '과체중' : '비만';

    const weightData = [71, 70.5, 71.2, 72, 73, 72.6];
    const labels = ['1주 전', '6일 전', '5일 전', '3일 전', '어제', '오늘'];

    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    const recentMeals = meals
        .slice()
        .reverse()
        .slice(0, 3)
        .map((m, i) => ({ ...m, date: `${i === 0 ? '어제' : `${i + 1}일 전`}` }));

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            {/* 상단 프로필 */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-xl p-6 text-center shadow space-y-2">
                <div className="w-20 h-20 bg-blue-100 text-blue-700 rounded-full mx-auto flex items-center justify-center text-2xl font-bold">
                    {userId.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="text-lg font-semibold">{profile.name}</h2>
                <p className="text-sm">{profile.status}</p>
                <div className="flex justify-center gap-6 text-sm pt-2">
                    <div><span className="font-bold">{profile.followers}</span><div>팔로워</div></div>
                    <div><span className="font-bold">{profile.following}</span><div>팔로잉</div></div>
                    <div><span className="font-bold">{profile.posts}</span><div>게시물</div></div>
                </div>
            </div>

            {/* 내 정보 */}
            <div className="bg-white rounded-xl shadow p-4 space-y-2">
                <h3 className="font-semibold mb-1">내 정보</h3>
                {editMode ? (
                    <div className="space-y-2 text-sm">
                        <div>
                            키:{' '}
                            <input
                                type="number"
                                className="border rounded px-2 py-1 w-24"
                                value={editProfile.height}
                                onChange={(e) =>
                                    setEditProfile({ ...editProfile, height: Number(e.target.value) })
                                }
                            />{' '}
                            cm
                        </div>
                        <div>
                            몸무게:{' '}
                            <input
                                type="number"
                                className="border rounded px-2 py-1 w-24"
                                value={editProfile.weight}
                                onChange={(e) =>
                                    setEditProfile({ ...editProfile, weight: Number(e.target.value) })
                                }
                            />{' '}
                            kg
                        </div>
                        <div>
                            목표 체중:{' '}
                            <input
                                type="number"
                                className="border rounded px-2 py-1 w-24"
                                value={editProfile.goalWeight}
                                onChange={(e) =>
                                    setEditProfile({ ...editProfile, goalWeight: Number(e.target.value) })
                                }
                            />{' '}
                            kg
                        </div>
                        <div>
                            활동 수준:{' '}
                            <select
                                className="ml-2 border rounded px-2 py-1 text-sm"
                                value={editProfile.activity}
                                onChange={(e) =>
                                    setEditProfile({ ...editProfile, activity: e.target.value })
                                }
                            >
                                <option>낮음</option>
                                <option>보통</option>
                                <option>높음</option>
                            </select>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={saveProfile}
                                className="bg-blue-500 text-white px-4 py-1 rounded text-sm"
                            >
                                저장
                            </button>
                            <button
                                onClick={() => setEditMode(false)}
                                className="bg-gray-200 px-4 py-1 rounded text-sm"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-sm space-y-1">
                            <div>키: {profile.height}cm</div>
                            <div>몸무게: {profile.weight}kg</div>
                            <div>BMI: {bmi} ({bmiStatus})</div>
                            <div>목표 체중: {profile.goalWeight}kg</div>
                            <div>활동 수준: {profile.activity}</div>
                        </div>
                        <button
                            onClick={() => {
                                setEditProfile({
                                    height: profile.height,
                                    weight: profile.weight,
                                    goalWeight: profile.goalWeight,
                                    activity: profile.activity,
                                });
                                setEditMode(true);
                            }}
                            className="mt-2 w-full py-2 text-sm bg-gray-100 text-gray-600 rounded"
                        >
                            정보 수정하기
                        </button>
                    </>
                )}
            </div>

            {/* 체중 변화 */}
            <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-semibold mb-2">체중 변화</h3>
                <div className="h-48">
                    <Line
                        data={{
                            labels,
                            datasets: [
                                {
                                    label: '체중 (kg)',
                                    data: weightData,
                                    borderColor: '#6366f1',
                                    backgroundColor: '#c7d2fe',
                                    tension: 0.3,
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { beginAtZero: false },
                            },
                        }}
                    />
                </div>
            </div>

            {/* 식단 기록 */}
            <div className="bg-white rounded-xl shadow p-4 space-y-2">
                <h3 className="font-semibold">나의 식단 기록</h3>
                {recentMeals.length === 0 && <p className="text-sm text-gray-500">식단 기록이 없습니다.</p>}
                {recentMeals.map((meal, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b py-2">
                        <div>
                            <div className="font-medium">{meal.name}</div>
                            <div className="text-xs text-gray-500">{meal.date}</div>
                        </div>
                        <div className="font-bold">{meal.kcal} kcal</div>
                    </div>
                ))}
                {meals.length > 3 && (
                    <button className="text-blue-500 text-xs mt-1">더 보기</button>
                )}
            </div>

            {/* 설정 */}
            <div className="bg-white rounded-xl shadow p-4 space-y-1">
                <h3 className="font-semibold mb-2">설정</h3>

                {[
                    { label: '알림 설정', icon: '🔔' },
                    { label: '개인정보 설정', icon: '👤' },
                    { label: '도움말', icon: '❓' },
                ].map((item, idx) => (
                    <button
                        key={idx}
                        className="w-full flex justify-between items-center px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                        <span className="flex items-center gap-2">
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </span>
                        <span className="text-gray-400">›</span>
                    </button>
                ))}

                <button
                    onClick={() => {
                        localStorage.clear();
                        setUserId('guest');
                        window.location.reload();
                    }}
                    className="w-full flex justify-between items-center px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded font-semibold mt-2"
                >
                    <span className="flex items-center gap-2">
                        <span>🚪</span>
                        <span>로그아웃</span>
                    </span>
                </button>
            </div>
        </div>
    );
}
