// OpenAI 라이브러리 import
import { OpenAI } from 'openai';

// OpenAI API 설정 (환경변수에서 키를 불러옴)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// POST 요청만 허용하는 API 핸들러 함수
export default async function handler(req, res) {
    // POST 이외의 요청 차단
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '허용되지 않은 메서드입니다.' });
    }

    const { imageBase64 } = req.body;

    // 이미지 데이터가 없을 경우 에러 처리
    if (!imageBase64) {
        console.warn('❗ 요청에 이미지 데이터가 없음');
        return res.status(400).json({ error: '이미지 데이터가 없습니다.' });
    }

    console.log("📥 Received image for analysis");

    try {
        // GPT-4o에게 이미지와 프롬프트를 함께 전달하여 분석 요청
        const result = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `이 음식의 이름과 칼로리, 탄수화물, 단백질, 지방을 대략 알려줘. 1인분 기준이면 좋아. 
이 음식은 ~~ 입니다 형식으로만 말해줘. 무조건 줄바꿈해서

- 칼로리:
- 탄수화물:
- 단백질:
- 지방:

이렇게만 말해줘. 그리고 음식이 여러 개일 경우 이름은 '~~와 ~~' 형식으로, 수치는 모두 더해서 말해줘.
수치는 반드시 1개로만 말해줘 (예: 20g, 300kcal).`,
                        },
                        {
                            type: "image_url",
                            image_url: { url: imageBase64 }
                        }
                    ]
                }
            ],
            max_tokens: 500
        });

        const content = result.choices?.[0]?.message?.content;

        // 응답이 없을 경우 에러 처리
        if (!content) {
            return res.status(500).json({ error: 'GPT 응답 없음' });
        }

        // 결과 콘솔에 출력
        console.log('✅ GPT 분석 결과 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓');
        console.log(content);
        console.log('✅ ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑');

        // 클라이언트에게 결과 응답
        return res.status(200).json({ result: content });

    } catch (error) {
        // 에러 발생 시 응답 처리
        console.error('❌ 분석 에러:', error.message);
        return res.status(500).json({ error: 'GPT 요청 실패' });
    }
}
