class AIService {
    constructor(userData) {
        this.userData = userData;
        this.context = {
            lastQuery: null,
            conversationHistory: [],
            currentTopic: null,
            learningGoals: [],
            learningStyle: null,
            currentSkillLevel: null,
            interests: [],
            challenges: []
        };

        this.initializeUserContext();
        
        // 預定義的回應模板
        this.responseTemplates = {
            greeting: [
                '您好！我是您的AI學習助手。有什麼我可以幫您的嗎？',
                '很高興見到您！讓我來協助您的學習之旅。',
                '歡迎回來！需要什麼協助嗎？'
            ],
            progress: [
                '您在{topic}的學習進展很好！要不要看看下一個主題？',
                '看來您對{topic}很有興趣，我可以推薦一些相關的進階內容。',
                '您已經完成了{progress}%的課程，繼續保持！'
            ],
            suggestion: [
                '根據您的學習模式，我建議您可以：\n{suggestions}',
                '這些資源可能對您有幫助：\n{suggestions}',
                '考慮嘗試這些學習方法：\n{suggestions}'
            ],
            error: [
                '抱歉，我現在無法處理這個請求。請稍後再試。',
                '發生了一些問題，讓我們換個話題吧。',
                '這部分內容我需要更多資訊，能詳細說明嗎？'
            ]
        };

        // 常見問題關鍵字映射
        this.keywordMap = {
            'progress': ['進度', '完成', '學習狀況', '情況'],
            'course': ['課程', '教學', '學習', '教材'],
            'project': ['專案', '實作', '練習', '作業'],
            'difficulty': ['難度', '困難', '問題', '不懂'],
            'recommendation': ['推薦', '建議', '介紹', '新的'],
            'review': ['複習', '回顧', '記得', '忘記'],
            'schedule': ['安排', '計畫', '時間', '規劃']
        };
    }

    async getResponse(query) {
        try {
            // 更新上下文
            this.updateContext(query);

            // 分析查詢意圖
            const intent = this.analyzeIntent(query);

            // 生成回應
            const response = await this.generateResponse(query, intent);

            // 保存對話歷史
            this.saveToHistory(query, response);

            return response;

        } catch (error) {
            console.error('AI回應生成失敗:', error);
            return this.getErrorResponse();
        }
    }

    updateContext(query) {
        this.context.lastQuery = query;
        this.context.conversationHistory.push({
            type: 'user',
            content: query,
            timestamp: new Date()
        });
    }

    async analyzeIntent(query) {
        try {
            // 使用更先進的NLP分析
            const analysis = await this.performNLPAnalysis(query);
            
            const intent = {
                type: analysis.intentType,
                topic: analysis.topic,
                keywords: analysis.keywords,
                sentiment: analysis.sentiment,
                complexity: analysis.complexity,
                context: this.context
            };

            // 更新學習上下文
            this.updateLearningContext(intent);

            return intent;
        } catch (error) {
            console.error('意圖分析失敗:', error);
            return this.fallbackIntentAnalysis(query);
        }
    }

    async generateResponse(query, intent) {
        try {
            // 分析學習情境
            const learningContext = await this.analyzeLearningContext(intent);
            
            // 生成個性化回應
            const response = await this.createPersonalizedResponse(query, intent, learningContext);
            
            // 添加適應性建議
            const suggestions = await this.generateAdaptiveSuggestions(intent, learningContext);
            
            // 整合額外學習資源
            const resources = await this.findRelevantResources(intent.topic, learningContext);
            
            // 組合完整回應
            return {
                content: response,
                suggestions,
                resources,
                context: {
                    skillLevel: learningContext.currentLevel,
                    nextMilestone: learningContext.nextMilestone,
                    recommendedPath: learningContext.recommendedPath
                }
            };
        } catch (error) {
            console.error('回應生成失敗:', error);
            return this.getErrorResponse();
        }
    }

    async generateProgressResponse() {
        const progress = await this.calculateUserProgress();
        const template = this.getRandomTemplate('progress');
        
        return {
            content: template
                .replace('{topic}', progress.currentTopic)
                .replace('{progress}', progress.percentage),
            suggestions: [
                '查看詳細進度報告',
                '設定新的學習目標',
                '探索下一個主題'
            ]
        };
    }

    async generateCourseResponse(topic) {
        const courses = await this.getRelevantCourses(topic);
        let content = '以下是一些相關的課程建議：\n';
        content += courses.map(course => `- ${course.title} (${course.duration})`).join('\n');

        return {
            content,
            suggestions: courses.map(course => `開始學習：${course.title}`)
        };
    }

    async generateProjectResponse() {
        const projects = await this.getRecommendedProjects();
        let content = '這些專案可能適合您目前的程度：\n';
        content += projects.map(project => `- ${project.title} (難度：${project.difficulty})`).join('\n');

        return {
            content,
            suggestions: [
                '查看專案詳情',
                '尋找合作夥伴',
                '瀏覽更多專案'
            ]
        };
    }

    async generateHelpResponse(query) {
        const resources = await this.findHelpResources(query);
        let content = '讓我幫您解決這個問題：\n';
        content += resources.map(resource => `- ${resource.title}\n  ${resource.description}`).join('\n');

        return {
            content,
            suggestions: [
                '查看相關教學',
                '尋求社群協助',
                '預約導師諮詢'
            ]
        };
    }

    async generateRecommendationResponse() {
        const recommendations = await this.getPersonalizedRecommendations();
        let content = '根據您的學習歷程，我推薦：\n';
        content += recommendations.map(rec => `- ${rec.title}: ${rec.reason}`).join('\n');

        return {
            content,
            suggestions: recommendations.map(rec => `了解更多：${rec.title}`)
        };
    }

    async generateReviewResponse(topic) {
        const materials = await this.getReviewMaterials(topic);
        let content = '以下是複習資料：\n';
        content += materials.map(material => `- ${material.title}`).join('\n');

        return {
            content,
            suggestions: [
                '開始複習測驗',
                '查看學習筆記',
                '複習重點整理'
            ]
        };
    }

    async generateScheduleResponse() {
        const schedule = await this.generateLearningSchedule();
        let content = '這是為您規劃的學習時程：\n';
        content += schedule.map(item => `- ${item.time}: ${item.activity}`).join('\n');

        return {
            content,
            suggestions: [
                '調整學習計畫',
                '設定提醒',
                '查看完整時程'
            ]
        };
    }

    async generateDefaultResponse() {
        return {
            content: this.getRandomTemplate('greeting'),
            suggestions: [
                '查看學習進度',
                '瀏覽課程內容',
                '尋找學習資源'
            ]
        };
    }

    getErrorResponse() {
        return {
            content: this.getRandomTemplate('error'),
            suggestions: [
                '返回主頁',
                '聯繫支援',
                '瀏覽常見問題'
            ]
        };
    }

    // 進階分析方法
    async performNLPAnalysis(query) {
        // 這裡將來可以接入更強大的NLP模型
        const response = await fetch('/api/nlp/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query,
                context: this.context
            })
        });

        return await response.json();
    }

    fallbackIntentAnalysis(query) {
        // 備用的意圖分析邏輯
        return {
            type: this.basicIntentDetection(query),
            topic: this.extractMainTopic(query),
            keywords: this.extractKeywords(query),
            sentiment: this.basicSentimentAnalysis(query),
            complexity: 'medium',
            context: this.context
        };
    }

    initializeUserContext() {
        if (this.userData) {
            this.context.learningGoals = this.userData.goals || [];
            this.context.learningStyle = this.userData.learningStyle || 'visual';
            this.context.currentSkillLevel = this.userData.skillLevel || 'beginner';
            this.context.interests = this.userData.interests || [];
            this.context.challenges = [];
        }
    }

    updateLearningContext(intent) {
        // 根據用戶互動更新學習上下文
        if (intent.sentiment) {
            this.updateChallenges(intent);
        }
        if (intent.topic) {
            this.updateInterests(intent.topic);
        }
        this.updateSkillLevel(intent);
    }

    basicIntentDetection(query) {
        const patterns = {
            help: /如何|怎麼|教學|幫助/,
            learn: /學習|教材|課程|練習/,
            problem: /問題|錯誤|不懂|困難/,
            progress: /進度|完成|達成|改善/
        };

        for (const [intent, pattern] of Object.entries(patterns)) {
            if (pattern.test(query)) return intent;
        }
        return 'general';
    }

    extractMainTopic(query) {
        const topics = {
            'AI基礎': /人工智慧|AI|基礎|入門/,
            '機器學習': /機器學習|ML|算法|模型/,
            '深度學習': /深度學習|DL|神經網路|CNN|RNN/,
            'NLP': /自然語言|NLP|文本|語言處理/,
            '電腦視覺': /視覺|CV|圖像|影像處理/
        };

        for (const [topic, pattern] of Object.entries(topics)) {
            if (pattern.test(query)) return topic;
        }
        return null;
    }

    basicSentimentAnalysis(query) {
        const positivePatterns = /好|棒|讚|有趣|明白|懂/;
        const negativePatterns = /難|不懂|困難|問題|錯誤/;

        if (positivePatterns.test(query)) return 'positive';
        if (negativePatterns.test(query)) return 'negative';
        return 'neutral';
    }

    getRandomTemplate(type) {
        const templates = this.responseTemplates[type];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    saveToHistory(query, response) {
        this.context.conversationHistory.push({
            type: 'assistant',
            content: response.content,
            suggestions: response.suggestions,
            timestamp: new Date()
        });

        // 限制歷史記錄長度
        if (this.context.conversationHistory.length > 50) {
            this.context.conversationHistory = this.context.conversationHistory.slice(-50);
        }
    }

    // 數據獲取方法
    async calculateUserProgress() {
        // 模擬從學習分析服務獲取數據
        return {
            currentTopic: '機器學習基礎',
            percentage: 65,
            nextMilestone: '完成監督學習單元'
        };
    }

    async getRelevantCourses(topic) {
        // 模擬課程數據
        return [
            {
                title: 'Python機器學習入門',
                duration: '4週',
                level: '入門'
            },
            {
                title: '深度學習實戰',
                duration: '6週',
                level: '進階'
            }
        ];
    }

    async getRecommendedProjects() {
        // 模擬專案推薦
        return [
            {
                title: '圖像分類器',
                difficulty: '入門',
                duration: '2週'
            },
            {
                title: '聊天機器人',
                difficulty: '中級',
                duration: '3週'
            }
        ];
    }

    async findHelpResources(query) {
        // 模擬資源搜尋
        return [
            {
                title: '概念解釋',
                description: '包含詳細的圖解和範例'
            },
            {
                title: '相關教學影片',
                description: '步驟式的操作示範'
            }
        ];
    }

    async getPersonalizedRecommendations() {
        // 模擬個人化推薦
        return [
            {
                title: '深度學習基礎',
                reason: '適合您目前的程度'
            },
            {
                title: 'TensorFlow實踐',
                reason: '符合您的學習目標'
            }
        ];
    }

    async getReviewMaterials(topic) {
        // 模擬複習資料
        return [
            {
                title: '核心概念摘要',
                type: 'summary'
            },
            {
                title: '練習題集',
                type: 'quiz'
            }
        ];
    }

    async generateLearningSchedule() {
        // 模擬生成學習時程
        return [
            {
                time: '週一 19:00',
                activity: '觀看課程影片'
            },
            {
                time: '週三 20:00',
                activity: '完成練習作業'
            },
            {
                time: '週五 18:00',
                activity: '參與討論會'
            }
        ];
    }

    async analyzeLearningContext(intent) {
        const userProgress = await this.getUserProgress();
        const learningHistory = await this.getLearningHistory();
        const currentChallenges = await this.getCurrentChallenges();

        return {
            currentLevel: this.determineCurrentLevel(userProgress, learningHistory),
            nextMilestone: this.predictNextMilestone(userProgress, intent),
            learningStyle: this.context.learningStyle,
            challengeAreas: this.identifyChallengeAreas(currentChallenges),
            recommendedPath: this.generateLearningPath(userProgress, intent)
        };
    }

    async getUserProgress() {
        try {
            const response = await fetch('/api/user/progress', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('獲取用戶進度失敗:', error);
            return {
                completedTopics: [],
                currentTopic: null,
                overallProgress: 0
            };
        }
    }

    async getLearningHistory() {
        try {
            const response = await fetch('/api/user/learning-history', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('獲取學習歷史失敗:', error);
            return {
                activities: [],
                completedExercises: [],
                assessments: []
            };
        }
    }

    async getCurrentChallenges() {
        return this.context.challenges;
    }

    determineCurrentLevel(progress, history) {
        const completedTopics = progress.completedTopics.length;
        const exerciseSuccess = this.calculateExerciseSuccessRate(history.completedExercises);
        
        if (completedTopics >= 5 && exerciseSuccess > 0.8) {
            return 'advanced';
        } else if (completedTopics >= 2 && exerciseSuccess > 0.6) {
            return 'intermediate';
        }
        return 'beginner';
    }

    calculateExerciseSuccessRate(exercises) {
        if (!exercises.length) return 0;
        const successful = exercises.filter(ex => ex.status === 'completed');
        return successful.length / exercises.length;
    }

    predictNextMilestone(progress, intent) {
        const currentLevel = this.determineCurrentLevel(progress);
        const learningPath = this.generateLearningPath(progress, intent);
        
        return learningPath[0] || {
            title: '完成當前主題',
            estimatedTime: '2週',
            difficulty: 'appropriate'
        };
    }

    generateLearningPath(progress, intent) {
        const basePath = this.getBaseLearningPath(progress.currentTopic);
        return this.customizePath(basePath, {
            level: this.context.currentSkillLevel,
            interests: this.context.interests,
            learningStyle: this.context.learningStyle
        });
    }

    getBaseLearningPath(currentTopic) {
        const paths = {
            'AI基礎': ['機器學習基礎', '深度學習入門', 'AI應用實踐'],
            '機器學習': ['監督學習', '非監督學習', '強化學習'],
            '深度學習': ['神經網路基礎', 'CNN架構', 'RNN應用'],
            'NLP': ['文本處理', '詞向量模型', '序列模型'],
            '電腦視覺': ['圖像處理', '目標檢測', '影像分割']
        };
        return paths[currentTopic] || paths['AI基礎'];
    }

    customizePath(basePath, userPreferences) {
        return basePath.map(topic => ({
            title: topic,
            format: this.determineFormat(userPreferences.learningStyle),
            difficulty: this.adjustDifficulty(topic, userPreferences.level),
            resources: this.getCustomizedResources(topic, userPreferences)
        }));
    }

    determineFormat(learningStyle) {
        const formats = {
            'visual': '視頻教程',
            'practical': '實戰練習',
            'theoretical': '理論講解',
            'interactive': '互動練習'
        };
        return formats[learningStyle] || '混合學習';
    }

    adjustDifficulty(topic, userLevel) {
        const difficultyMap = {
            'beginner': '基礎',
            'intermediate': '進階',
            'advanced': '專家'
        };
        return difficultyMap[userLevel] || '基礎';
    }

    getCustomizedResources(topic, preferences) {
        return [
            {
                type: this.determineFormat(preferences.learningStyle),
                title: `${topic}${preferences.level === 'beginner' ? '入門' : '進階'}課程`,
                duration: '2小時'
            },
            {
                type: 'practice',
                title: `${topic}實戰練習`,
                difficulty: this.adjustDifficulty(topic, preferences.level)
            }
        ];
    }

    identifyChallengeAreas(challenges) {
        return challenges.reduce((areas, challenge) => {
            if (!areas[challenge.topic]) {
                areas[challenge.topic] = {
                    count: 0,
                    difficulties: []
                };
            }
            areas[challenge.topic].count++;
            areas[challenge.topic].difficulties.push(challenge.type);
            return areas;
        }, {});
    }
}

// 匯出AI服務
window.AIService = AIService;
