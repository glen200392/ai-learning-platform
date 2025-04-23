class LearningPlatform {
    constructor() {
        this.currentSection = 'dashboard';
        this.userData = null;
        this.analytics = null;
        this.aiService = null;

        // 課程數據
        this.courseData = {
            foundation: [
                {
                    id: 'ai-basics',
                    title: 'AI基礎概念',
                    modules: ['AI發展歷史', '機器學習基礎', '深度學習入門'],
                    duration: '4週'
                },
                {
                    id: 'data-basics',
                    title: '數據科學基礎',
                    modules: ['數據分析基礎', '統計學概論', 'Python程式設計'],
                    duration: '6週'
                }
            ],
            applications: [
                {
                    id: 'nlp-basic',
                    title: '自然語言處理應用',
                    modules: ['文字處理基礎', '情感分析', '聊天機器人開發'],
                    duration: '8週'
                },
                {
                    id: 'cv-basic',
                    title: '電腦視覺應用',
                    modules: ['圖像處理基礎', '物件偵測', '人臉辨識'],
                    duration: '8週'
                }
            ],
            advanced: [
                {
                    id: 'ai-architecture',
                    title: 'AI系統架構',
                    modules: ['模型部署', '系統整合', '效能優化'],
                    duration: '10週'
                },
                {
                    id: 'ai-ethics',
                    title: 'AI倫理與治理',
                    modules: ['倫理準則', '隱私保護', '法規遵循'],
                    duration: '6週'
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
            'foundation': '基礎課程',
            'applications': '應用課程',
            'advanced': '進階課程'
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
}

// 初始化平台
document.addEventListener('DOMContentLoaded', async () => {
    window.platform = new LearningPlatform();
    await platform.init();
});
