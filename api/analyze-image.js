// api/analyze.js
import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '허용되지 않은 메서드입니다.' });
    }

    const { imageBase64 } = req.body;

    if (!imageBase64) {
        console.warn('❗ 요청에 이미지 데이터가 없음');
        return res.status(400).json({ error: '이미지 데이터가 없습니다.' });
    }

    console.log("📥 Received image for analysis");

    try {
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

        if (!content) {
            return res.status(500).json({ error: 'GPT 응답 없음' });
        }

        console.log('✅ GPT 분석 결과 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓');
        console.log(content);
        console.log('✅ ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑');

        return res.status(200).json({ result: content });

    } catch (error) {
        console.error('❌ 분석 에러:', error.message);
        return res.status(500).json({ error: 'GPT 요청 실패' });
    }
}
