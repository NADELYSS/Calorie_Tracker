// 전역 상태를 관리할 수 있도록 Context 생성
import { createContext } from 'react';

// 기본 사용자 정보와 사용자 ID 변경 함수 초기화
export const UserContext = createContext({
    userId: 'guest',
    setUserId: () => { },
});
