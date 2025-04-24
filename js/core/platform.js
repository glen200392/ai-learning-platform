class LearningPlatform {
    constructor() {
        this.currentSection = 'dashboard';
        this.userData = null;
        this.analytics = null;
        this.aiService = null;
        this.practiceManager = null;

        // 課程數據
        this.courseData = {
            'smart-life': [
                {
                    id: 'home-assistant',
                    title: '打造個人智慧助手',
                    modules: ['智慧家居入門', 'AI日程管理', '生活自動化'],
                    duration: '4週',
                    description: '學習如何讓AI協助管理日常生活，提升生活品質'
                },
                {
                    id: 'life-automation',
                    title: '生活自動化實戰',
                    modules: ['智慧提醒系統', '個人資訊整理', '智慧家居連動'],
                    duration: '6週',
                    description: '實作各種自動化腳本，打造個人化智慧生活圈'
                }
            ],
            'creative': [
                {
                    id: 'ai-art',
                    title: 'AI藝術創作',
                    modules: ['AI繪圖基礎', '提示詞設計', '風格轉換'],
                    duration: '6週',
                    description: '探索AI藝術創作的無限可能'
                },
                {
                    id: 'ai-music',
                    title: 'AI音樂製作',
                    modules: ['音樂生成基礎', '曲風混合', '配樂創作'],
                    duration: '8週',
                    description: '學習使用AI協助音樂創作和編曲'
                }
            ],
            'work': [
                {
                    id: 'productivity',
                    title: 'AI工作效率提升',
                    modules: ['文件自動化', 'AI輔助寫作', '智能數據分析'],
                    duration: '6週',
                    description: '運用AI工具提升工作效率'
                },
                {
                    id: 'code-assistant',
                    title: 'AI程式助手應用',
                    modules: ['程式碼生成', 'AI除錯協助', '智能重構'],
                    duration: '8週',
                    description: '學習使用AI協助程式開發'
                }
            ],
            'social': [
                {
                    id: 'chat-assistant',
                    title: '智慧對話系統',
                    modules: ['對話設計基礎', '情緒辨識應用', '多語言互動'],
                    duration: '6週',
                    description: '學習開發智能對話系統'
                },
                {
                    id: 'social-analytics',
                    title: '社群互動分析',
                    modules: ['社群數據分析', '輿情監測', '互動優化'],
                    duration: '8週',
                    description: '運用AI分析和優化社群互動'
                }
            ]
        };
    }

    async init() {
        try {
            await this.loadUserData();
            this.initializeServices();
            this.initializeEventListeners();
            this.loadDashboard();
        } catch (error) {
            console.error('平台初始化失敗:', error);
        }
    }

    async loadUserData() {
        const savedData = localStorage.getItem('userData');
        if (savedData) {
            this.userData = JSON.parse(savedData);
            this.updateUserProfile();
        } else {
            window.location.href = '/assessment';
        }
    }

    initializeServices() {
        // 初始化分析服務
        this.analytics = new LearningAnalytics(this.userData);
        
        // 初始化AI助手服務
        this.aiService = new AIService(this.userData);

        // 初始化練習管理器
        this.practiceManager = new PracticeManager(this);
    }

    updateUserProfile() {
        const avatar = document.getElementById('user-avatar');
        const nickname = document.getElementById('user-nickname');
        
        if (this.userData) {
            avatar.textContent = this.userData.avatarText;
            avatar.style.backgroundColor = this.getAvatarColor(this.userData.avatar);
            nickname.textContent = this.userData.nickname;
        }
    }

    getAvatarColor(avatarId) {
        const colors = {
            '1': '#4A90E2',
            '2': '#48BB78',
            '3': '#9F7AEA',
            '4': '#ED8936'
        };
        return colors[avatarId] || '#4A90E2';
    }

    initializeEventListeners() {
        // 導航事件
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').slice(1);
                this.switchSection(section);
            });
        });

        // 專案篩選
        document.querySelectorAll('.project-filters .filter').forEach(button => {
            button.addEventListener('click', () => {
                this.filterProjects(button.dataset.filter);
            });
        });

        // AI助手輸入
        const input = document.querySelector('.input-container input');
        const sendButton = document.querySelector('.send-button');
        
        sendButton.addEventListener('click', () => {
            this.handleAssistantQuery(input.value);
            input.value = '';
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAssistantQuery(input.value);
                input.value = '';
            }
        });
    }

    async switchSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.classList.remove('active');
        });

        document.getElementById(sectionId).classList.add('active');
        document.querySelector(`a[href="#${sectionId}"]`).classList.add('active');
        this.currentSection = sectionId;

        await this.loadSectionContent(sectionId);
    }

    async loadSectionContent(sectionId) {
        const loadingIndicator = document.getElementById(`${sectionId}-loading`);
        if (loadingIndicator) loadingIndicator.style.display = 'block';

        try {
            switch (sectionId) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'courses':
                    await this.loadCourses();
                    break;
                case 'projects':
                    await this.loadProjects();
                    break;
                case 'community':
                    await this.loadCommunity();
                    break;
                case 'analytics':
                    await this.loadAnalytics();
                    break;
                case 'practice':
                    await this.loadPractice();
                    break;
            }
        } catch (error) {
            console.error(`載入${sectionId}內容失敗:`, error);
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }

    async loadDashboard() {
        // 獲取學習分析
        const learningAnalysis = await this.analytics.analyzeLearningPattern(this.userData.activities);
        
        // 更新儀表板各區塊
        this.updateLearningProgress(learningAnalysis);
        this.updateLearningInsights(learningAnalysis);
        this.updateRecommendations();
        this.updateActivityFeed();
    }

    updateLearningProgress(analysis) {
        const progressSection = document.getElementById('learning-progress');
        if (!progressSection) return;

        const { overall, byTopic } = analysis.progressionRate;
        let html = `
            <div class="progress-summary">
                <h3>學習進度摘要</h3>
                <div class="overall-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${overall}%"></div>
                    </div>
                    <p>整體完成度：${overall.toFixed(1)}%</p>
                </div>
            </div>
        `;

        progressSection.innerHTML = html;
    }

    updateLearningInsights(analysis) {
        const insightsSection = document.getElementById('learning-insights');
        if (!insightsSection) return;

        const { strengths, weaknesses, recommendations } = analysis;
        let html = `
            <div class="insights-container">
                <h3>學習分析洞察</h3>
                <div class="strengths-section">
                    <h4>💪 學習優勢</h4>
                    <ul>${strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                </div>
                <div class="weaknesses-section">
                    <h4>🎯 待改進項目</h4>
                    <ul>${weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
                </div>
                <div class="recommendations-section">
                    <h4>💡 學習建議</h4>
                    <ul>${recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
                </div>
            </div>
        `;

        insightsSection.innerHTML = html;
    }

    async updateRecommendations() {
        const recommendationsSection = document.getElementById('personalized-recommendations');
        if (!recommendationsSection) return;

        const recommendations = await this.analytics.generateRecommendations(this.userData);
        
        let html = '<div class="recommendations-container">';
        html += '<h3>個人化推薦</h3>';

        // 課程推薦
        if (recommendations.courses.length > 0) {
            html += `
                <div class="recommended-courses">
                    <h4>推薦課程</h4>
                    ${recommendations.courses.slice(0, 3).map(rec => `
                        <div class="course-card">
                            <h5>${rec.title}</h5>
                            <p>${rec.reason}</p>
                            <button onclick="platform.startCourse('${rec.id}')" class="btn-primary">
                                開始學習
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        recommendationsSection.innerHTML = html;
    }

    updateActivityFeed() {
        const feedSection = document.getElementById('activity-feed');
        if (!feedSection || !this.userData.activities) return;

        const recentActivities = this.userData.activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        let html = `
            <div class="activity-feed">
                <h3>最近活動</h3>
                ${recentActivities.map(activity => `
                    <div class="feed-item">
                        <div class="activity-icon ${this.getActivityIcon(activity.type)}"></div>
                        <div class="activity-content">
                            <p>${this.formatActivityMessage(activity)}</p>
                            <span class="timestamp">${this.formatTimestamp(activity.timestamp)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        feedSection.innerHTML = html;
    }

    getActivityIcon(type) {
        const icons = {
            'course': 'book',
            'quiz': 'edit',
            'project': 'code',
            'discussion': 'message'
        };
        return `icon-${icons[type] || 'activity'}`;
    }

    formatActivityMessage(activity) {
        const messages = {
            'course': '完成了課程',
            'quiz': '完成了測驗',
            'project': '提交了專案',
            'discussion': '參與了討論'
        };
        return `${messages[activity.type]} "${activity.title}"`;
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '剛剛';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分鐘前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小時前`;
        return `${Math.floor(diff / 86400000)}天前`;
    }

    async loadCourses() {
        const coursesContainer = document.getElementById('courses-container');
        if (!coursesContainer) return;

        const loadCourseList = (courses) => {
            return courses.map(course => `
                <div class="course-card">
                    <h3>${course.title}</h3>
                    <p>持續時間: ${course.duration}</p>
                    <ul>
                        ${course.modules.map(module => `<li>${module}</li>`).join('')}
                    </ul>
                    <button class="btn-primary" onclick="platform.startCourse('${course.id}')">
                        開始學習
                    </button>
                </div>
            `).join('');
        };

        let html = '';
        for (const [category, courses] of Object.entries(this.courseData)) {
            html += `
                <div class="course-category" id="${category}">
                    <h2>${this.formatCategoryTitle(category)}</h2>
                    <div class="course-list">
                        ${loadCourseList(courses)}
                    </div>
                </div>
            `;
        }

        coursesContainer.innerHTML = html;
    }

    formatCategoryTitle(category) {
        const titles = {
            'smart-life': '智慧生活助手',
            'creative': 'AI創意與娛樂',
            'work': '工作效率提升',
            'social': '智慧社交互動'
        };
        return titles[category] || category;
    }

    async loadProjects() {
        const projectsList = document.getElementById('projects-list');
        if (!projectsList) return;

        const projects = await this.fetchProjects();
        
        projectsList.innerHTML = projects.map(project => `
            <div class="project-card" data-difficulty="${project.difficulty}">
                <h3>${project.title}</h3>
                <p>難度：${this.formatDifficulty(project.difficulty)}</p>
                <p>預計時間：${project.duration}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <button class="btn-primary" onclick="platform.openProject('${project.id}')">
                    查看詳情
                </button>
            </div>
        `).join('');
    }

    formatDifficulty(level) {
        const difficulties = {
            'beginner': '入門級',
            'intermediate': '進階級',
            'advanced': '專家級'
        };
        return difficulties[level] || level;
    }

    async loadAnalytics() {
        if (!this.analytics) return;
        
        const data = await this.analytics.generateReport(this.userData);
        
        // 更新圖表
        this.updateLearningChart(data.learningProgress);
        this.updateSkillsRadar(data.skillsAssessment);
        this.updateTimeDistribution(data.timeAnalysis);
        this.updatePredictiveMetrics(data.predictions);
    }

    async handleAssistantQuery(query) {
        if (!query.trim() || !this.aiService) return;

        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;

        // 添加用戶訊息
        chatContainer.innerHTML += `
            <div class="chat-message user">
                <p>${query}</p>
            </div>
        `;

        try {
            // 獲取AI回覆
            const response = await this.aiService.getResponse(query);
            
            chatContainer.innerHTML += `
                <div class="chat-message assistant">
                    <p>${response.content}</p>
                    ${response.suggestions ? `
                        <div class="suggestions">
                            ${response.suggestions.map(suggestion => 
                                `<button class="suggestion-btn">${suggestion}</button>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            `;

            // 添加建議按鈕事件
            chatContainer.querySelectorAll('.suggestion-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.handleAssistantQuery(btn.textContent);
                });
            });

        } catch (error) {
            console.error('AI助手回覆失敗:', error);
            chatContainer.innerHTML += `
                <div class="chat-message error">
                    <p>抱歉，處理您的問題時發生錯誤。請稍後再試。</p>
                </div>
            `;
        }

        // 滾動到底部
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    filterProjects(filter) {
        document.querySelectorAll('.filter').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeFilter = document.querySelector(`.filter[data-filter="${filter}"]`);
        if (activeFilter) {
            activeFilter.classList.add('active');
        }

        document.querySelectorAll('.project-card').forEach(card => {
            if (filter === 'all' || card.dataset.difficulty === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    async fetchProjects() {
        // 模擬從API獲取專案數據
        return [
            {
                id: 'chatbot-basic',
                title: 'AI聊天機器人',
                difficulty: 'beginner',
                duration: '2週',
                tags: ['NLP', 'API整合', '前端開發']
            },
            {
                id: 'image-recognition',
                title: '圖像識別系統',
                difficulty: 'intermediate',
                duration: '4週',
                tags: ['電腦視覺', '深度學習', 'Python']
            }
        ];
    }

    async loadPractice() {
        if (!this.practiceManager) {
            this.practiceManager = new PracticeManager(this);
        }

        // 初始化練習區域
        document.getElementById('practice-screen').classList.add('active');
        
        // 初始化練習管理器
        await this.practiceManager.initialize();

        // 載入用戶進度
        if (this.userData) {
            const progress = await this.practiceManager.practiceExercises.getProgress(this.userData.id);
            
            // 更新進度顯示
            const completedCount = progress.completed.length;
            const inProgressCount = progress.inProgress.length;
            
            document.querySelector('.practice-stats').innerHTML = `
                <div class="stats-item">
                    <span class="stats-value">${completedCount}</span>
                    <span class="stats-label">已完成練習</span>
                </div>
                <div class="stats-item">
                    <span class="stats-value">${inProgressCount}</span>
                    <span class="stats-label">進行中</span>
                </div>
            `;
        }
    }
}

// 初始化平台
document.addEventListener('DOMContentLoaded', async () => {
    window.platform = new LearningPlatform();
    await platform.init();
});
