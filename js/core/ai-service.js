class AIService {
    constructor(userData) {
        this.userData = userData;
        this.context = {
            lastQuery: null,
            conversationHistory: [],
            currentTopic: null
        };
        
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

    analyzeIntent(query) {
        const intent = {
            type: null,
            topic: null,
            keywords: []
        };

        // 檢查每個關鍵字類別
        for (const [type, keywords] of Object.entries(this.keywordMap)) {
            if (keywords.some(keyword => query.includes(keyword))) {
                intent.type = type;
                intent.keywords.push(...keywords.filter(k => query.includes(k)));
            }
        }

        // 如果沒有找到明確意圖，嘗試進行模糊匹配
        if (!intent.type) {
            intent.type = this.fuzzyMatch(query);
        }

        // 提取可能的主題
        intent.topic = this.extractTopic(query);

        return intent;
    }

    async generateResponse(query, intent) {
        let response = {
            content: '',
            suggestions: []
        };

        // 根據意圖生成回應
        switch (intent.type) {
            case 'progress':
                response = await this.generateProgressResponse();
                break;
            case 'course':
                response = await this.generateCourseResponse(intent.topic);
                break;
            case 'project':
                response = await this.generateProjectResponse();
                break;
            case 'difficulty':
                response = await this.generateHelpResponse(query);
                break;
            case 'recommendation':
                response = await this.generateRecommendationResponse();
                break;
            case 'review':
                response = await this.generateReviewResponse(intent.topic);
                break;
            case 'schedule':
                response = await this.generateScheduleResponse();
                break;
            default:
                response = await this.generateDefaultResponse();
        }

        return response;
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

    // 輔助方法
    fuzzyMatch(query) {
        // 簡單的模糊匹配，可以根據需求擴充
        if (query.length < 5) return 'greeting';
        if (query.includes('?') || query.includes('？')) return 'help';
        return 'default';
    }

    extractTopic(query) {
        // 從查詢中提取主題，可以根據需求擴充
        const topics = ['AI', '機器學習', '深度學習', '神經網路', 'NLP', '電腦視覺'];
        return topics.find(topic => query.includes(topic)) || null;
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
}

// 匯出AI服務
window.AIService = AIService;
