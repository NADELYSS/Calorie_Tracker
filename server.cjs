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
            console.warn('❗ 요청에 이미지 데이터가 없음');
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
                            text: "이 음식의 이름과 칼로리, 탄수화물, 단백질, 지방을 대략 알려줘. 1인분 기준이면 좋아. 이 음식은 ~~ 입니다 형식으로만 말해줘. 그리고 무조건 칼로리, 탄수, 단백, 지방을 말할떄는 줄바꿈을 해줘. 여러 음식일때는 ~와 ~ 형식으로 말하고, 칼로리, 탄수, 단백, 지방도 합쳐서 말해줘.음식별로 말하지 말고. 그리고, 뭐든 간에 몇~몇 이런식 말고 평균 내서 딱 하나로만 내줘.",
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

        console.log('✅ GPT 분석 결과 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓');
        console.log(content);
        console.log('✅ ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑');

        if (!content) {
            console.error('❌ GPT 응답 없음 (result.choices[0].message.content 가 undefined)');
            return res.status(500).json({ error: 'GPT 응답 없음' });
        }

        res.json({ result: content });

    } catch (error) {
        console.error('❌ 분석 에러:', error);
        res.status(500).json({ error: '서버 에러: GPT 요청 실패' });
    }
});

app.listen(4000, () => {
    console.log("✅ GPT API 서버 실행 중 → http://localhost:4000");
});
