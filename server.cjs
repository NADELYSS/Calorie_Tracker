require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/analyze-image', async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: '이미지 데이터가 없습니다.' });
        }

        const result = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "이 음식의 이름과 칼로리, 탄수화물, 단백질, 지방을 대략 알려줘. 1인분 기준이면 좋아. 이 음식은 ~~ 입니다 형식으로만 말해줘",
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

        res.json({ result: content });

    } catch (error) {
        console.error('❌ 분석 에러:', error.message);
        res.status(500).json({ error: '서버 에러: GPT 요청 실패' });
    }
});

app.listen(4000, () => {
    console.log("✅ GPT API 서버 실행 중 → http://localhost:4000");
});
