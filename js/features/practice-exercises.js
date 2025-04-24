class PracticeExercises {
    constructor() {
        this.exercises = {
            basics: [
                {
                    id: 'ai-concepts',
                    title: 'AI基礎概念',
                    description: '了解AI的基本概念和應用場景',
                    exercises: [
                        {
                            type: 'multiple-choice',
                            question: '什麼是機器學習？',
                            options: [
                                '讓電腦能夠自動編寫程式',
                                '通過數據和經驗讓系統自動改進',
                                '用電腦模擬人類大腦',
                                '自動化的數據處理過程'
                            ],
                            correctAnswer: 1,
                            explanation: '機器學習是讓系統通過數據和經驗自動改進其性能的過程，而不需要明確的程式設計。'
                        },
                        {
                            type: 'true-false',
                            question: '深度學習是機器學習的一個子集。',
                            correctAnswer: true,
                            explanation: '深度學習是機器學習的一個分支，專注於使用深層神經網絡進行學習。'
                        }
                    ],
                    resources: [
                        {
                            type: 'video',
                            title: 'AI簡介',
                            url: '#',
                            duration: '5:30'
                        },
                        {
                            type: 'article',
                            title: 'AI發展史',
                            url: '#',
                            readingTime: '10分鐘'
                        }
                    ]
                },
                {
                    id: 'ai-applications',
                    title: 'AI實際應用',
                    description: '探索AI在各個領域的實際應用案例',
                    exercises: [
                        {
                            type: 'case-study',
                            title: '智慧客服應用',
                            content: '分析一個真實的AI客服系統案例',
                            questions: [
                                {
                                    question: '這個系統使用了哪些AI技術？',
                                    type: 'checkbox',
                                    options: [
                                        '自然語言處理',
                                        '情感分析',
                                        '知識圖譜',
                                        '機器視覺'
                                    ],
                                    correctAnswers: [0, 1, 2]
                                }
                            ],
                            solution: '這個案例展示了NLP、情感分析和知識圖譜的綜合應用。'
                        }
                    ]
                }
            ],
            practical: [
                {
                    id: 'chatbot-basic',
                    title: '基礎聊天機器人',
                    description: '創建一個簡單的規則基礎聊天機器人',
                    steps: [
                        {
                            title: '設計對話流程',
                            content: '學習如何設計基本的對話流程和回應模式'
                        },
                        {
                            title: '實現基本功能',
                            content: '使用JavaScript實現簡單的對話邏輯'
                        },
                        {
                            title: '增加互動特性',
                            content: '添加更多互動元素和回應變化'
                        }
                    ],
                    code: {
                        initial: 
`// 基礎聊天機器人範例
class SimpleBot {
    constructor() {
        this.responses = {
            "你好": ["嗨！", "你好啊！", "很高興見到你"],
            "再見": ["再見！", "期待下次見面", "祝您有愉快的一天"]
        };
    }

    respond(input) {
        // 待實現
    }
}`,
                        solution:
`class SimpleBot {
    constructor() {
        this.responses = {
            "你好": ["嗨！", "你好啊！", "很高興見到你"],
            "再見": ["再見！", "期待下次見面", "祝您有愉快的一天"]
        };
    }

    respond(input) {
        const key = Object.keys(this.responses)
            .find(k => input.includes(k));
        
        if (key) {
            const responses = this.responses[key];
            return responses[Math.floor(Math.random() * responses.length)];
        }
        return "抱歉，我不太理解。能換個方式說嗎？";
    }
}`
                    }
                },
                {
                    id: 'sentiment-analysis',
                    title: '情感分析應用',
                    description: '使用簡單的規則實現文本情感分析',
                    steps: [
                        {
                            title: '理解情感分析',
                            content: '學習基本的情感分析概念和方法'
                        },
                        {
                            title: '實現分析邏輯',
                            content: '使用關鍵詞和簡單規則進行情感判斷'
                        },
                        {
                            title: '評估分析結果',
                            content: '學習如何評估情感分析的準確性'
                        }
                    ],
                    code: {
                        initial:
`// 簡單情感分析器
class SentimentAnalyzer {
    constructor() {
        this.positiveWords = ["喜歡", "開心", "棒", "讚"];
        this.negativeWords = ["討厭", "糟糕", "差", "爛"];
    }

    analyze(text) {
        // 待實現
    }
}`,
                        solution:
`class SentimentAnalyzer {
    constructor() {
        this.positiveWords = ["喜歡", "開心", "棒", "讚"];
        this.negativeWords = ["討厭", "糟糕", "差", "爛"];
    }

    analyze(text) {
        let score = 0;
        
        this.positiveWords.forEach(word => {
            if (text.includes(word)) score++;
        });
        
        this.negativeWords.forEach(word => {
            if (text.includes(word)) score--;
        });
        
        return {
            score: score,
            sentiment: score > 0 ? "正面" : score < 0 ? "負面" : "中性"
        };
    }
}`
                    }
                }
            ]
        };
    }

    async loadExercise(categoryId, exerciseId) {
        const category = Object.keys(this.exercises).find(cat => this.exercises[cat].some(ex => ex.id === exerciseId));
        
        if (!category) {
            throw new Error('練習未找到');
        }

        const exercise = this.exercises[category].find(ex => ex.id === exerciseId);
        return exercise;
    }

    async submitAnswer(exerciseId, answer) {
        const exercise = await this.loadExercise('basics', exerciseId);
        
        if (!exercise) {
            throw new Error('練習未找到');
        }

        // 檢查答案
        const question = exercise.exercises.find(q => q.id === answer.questionId);
        if (!question) {
            throw new Error('問題未找到');
        }

        const correct = this.checkAnswer(question, answer.value);
        
        return {
            correct,
            explanation: question.explanation,
            nextExercise: this.getNextExercise(exerciseId)
        };
    }

    checkAnswer(question, answer) {
        switch (question.type) {
            case 'multiple-choice':
                return answer === question.correctAnswer;
            case 'true-false':
                return answer === question.correctAnswer;
            case 'checkbox':
                return JSON.stringify(answer.sort()) === JSON.stringify(question.correctAnswers.sort());
            default:
                return false;
        }
    }

    getNextExercise(currentExerciseId) {
        // 在同一類別中找下一個練習
        const category = Object.keys(this.exercises).find(cat => 
            this.exercises[cat].some(ex => ex.id === currentExerciseId)
        );

        if (!category) return null;

        const exercises = this.exercises[category];
        const currentIndex = exercises.findIndex(ex => ex.id === currentExerciseId);
        
        if (currentIndex < exercises.length - 1) {
            return exercises[currentIndex + 1].id;
        }

        // 如果是該類別的最後一個練習，找下一個類別的第一個練習
        const categories = Object.keys(this.exercises);
        const categoryIndex = categories.indexOf(category);
        
        if (categoryIndex < categories.length - 1) {
            const nextCategory = categories[categoryIndex + 1];
            return this.exercises[nextCategory][0].id;
        }

        return null;
    }

    async saveProgress(userId, exerciseId, progress) {
        // 這裡可以擴展為保存到後端數據庫
        const progressData = {
            userId,
            exerciseId,
            progress,
            timestamp: new Date()
        };

        localStorage.setItem(`progress_${userId}_${exerciseId}`, JSON.stringify(progressData));
        return progressData;
    }

    async getProgress(userId) {
        // 獲取用戶的所有練習進度
        const progress = {
            completed: [],
            inProgress: []
        };

        // 模擬從存儲中獲取進度
        Object.keys(this.exercises).forEach(category => {
            this.exercises[category].forEach(exercise => {
                const savedProgress = localStorage.getItem(`progress_${userId}_${exercise.id}`);
                if (savedProgress) {
                    const data = JSON.parse(savedProgress);
                    if (data.progress === 100) {
                        progress.completed.push(exercise.id);
                    } else {
                        progress.inProgress.push({
                            id: exercise.id,
                            progress: data.progress
                        });
                    }
                }
            });
        });

        return progress;
    }
}

// 導出練習模組
window.PracticeExercises = PracticeExercises;
