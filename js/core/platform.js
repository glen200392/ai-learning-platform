class LearningPlatform {
    constructor() {
        // 初始化平台基本服務
        this.currentSection = 'dashboard';
        this.userData = null;
        this.analytics = null;
        this.aiService = null;
        this.practiceManager = null;
        this.achievementService = null;
        this.codeReviewService = null;
        this.cognitiveMap = null;

        // 代碼審查相關狀態
        this.currentReview = null;

        // 課程數據
        this.courseData = {
            'cognitive-science': [
                {
                    id: 'brain-learning',
                    title: '大腦學習機制',
                    modules: ['認知負荷理論', '記憶與學習', '注意力機制'],
                    duration: '3週',
                    description: '了解大腦如何處理和學習新信息，為AI學習打下基礎'
                },
                {
                    id: 'thinking-patterns',
                    title: '思維模式與框架',
                    modules: ['系統思維', '決策框架', '創造性思考'],
                    duration: '4週',
                    description: '建立結構化思維方式，提升解決問題的能力'
                },
                {
                    id: 'ai-cognition',
                    title: 'AI與人類認知',
                    modules: ['認知科學基礎', 'AI運作原理', '人機協作模式'],
                    duration: '4週',
                    description: '理解AI與人類認知的關係，掌握協作要點'
                }
            ],
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

    async init(retryCount = 0) {
        const loading = document.getElementById('loading');
        const MAX_RETRIES = 3;
        try {
            loading.style.display = 'flex';
            
            // 追蹤初始化進度
            const progress = {
                resources: false,
                userData: false,
                services: false,
                dashboard: false,
                cognitiveMap: false
            };

            // 更新載入狀態
            const updateLoadingStatus = (step) => {
                progress[step] = true;
                const completedSteps = Object.values(progress).filter(v => v).length;
                const totalSteps = Object.keys(progress).length;
                loading.querySelector('.loading-text').textContent =
                    `載入中... ${Math.round((completedSteps / totalSteps) * 100)}%`;
            };

            // 檢查並載入資源
            await this.checkResources();
            updateLoadingStatus('resources');

            // 確保用戶數據載入
            await this.loadUserData();
            updateLoadingStatus('userData');

            // 按順序初始化服務
            await this.initializeServicesInOrder();
            updateLoadingStatus('services');

            // 初始化事件監聽器
            this.initializeEventListeners();

            // 載入儀表板
            await this.loadDashboard();
            updateLoadingStatus('dashboard');
            
            // 初始化認知地圖
            await this.initializeCognitiveMap();
            updateLoadingStatus('cognitiveMap');

            loading.style.display = 'none';
        } catch (error) {
            console.error('平台初始化失敗:', error);
            
            // 如果還有重試機會，則重試
            if (retryCount < MAX_RETRIES) {
                console.log(`正在重試初始化 (${retryCount + 1}/${MAX_RETRIES})...`);
                loading.querySelector('.loading-text').textContent =
                    `初始化失敗，正在重試 (${retryCount + 1}/${MAX_RETRIES})...`;
                
                // 等待短暫時間後重試
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.init(retryCount + 1);
            }
            
            // 如果已超過重試次數，顯示錯誤訊息
            const errorMessage = this.getErrorMessage(error);
            loading.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>載入失敗</h3>
                    <p>${errorMessage.message}</p>
                    <div class="error-actions">
                        ${errorMessage.action}
                    </div>
                </div>
            `;
            
            // 在主控台記錄詳細錯誤信息
            console.error('初始化重試次數已達上限，系統無法正常啟動', {
                error,
                retryCount,
                failedAt: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
        }
    }

    async checkResources() {
        const TIMEOUT = 10000; // 10秒超時
        const resources = [
            'css/style.css',
            'css/practice-exercises.css',
            'js/core/platform.js',
            'js/core/learning-analytics.js',
            'js/core/ai-service.js',
            'js/core/practice-manager.js',
            'js/core/achievement-service.js',
            'js/features/assessment.js',
            'js/features/practice-exercises.js',
            'js/features/cognitive-map.js',
            'css/cognitive-map.css'
        ];

        const loadWithTimeout = async (resource) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

            try {
                const response = await fetch(resource, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return true;
            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error(`載入超時: ${resource}`);
                }
                throw error;
            }
        };

        try {
            await Promise.all(resources.map(loadWithTimeout));
        } catch (error) {
            console.error('資源載入失敗:', error);
            throw new Error(`資源載入失敗: ${error.message}`);
        }
    }

    async loadUserData() {
        // 檢查是否已在評估頁面
        if (window.location.pathname.includes('assessment.html')) {
            return;
        }

        const savedData = localStorage.getItem('userData');
        const redirectCount = parseInt(sessionStorage.getItem('redirectCount') || '0');

        if (savedData) {
            this.userData = JSON.parse(savedData);
            this.updateUserProfile();
            // 重置重定向計數
            sessionStorage.removeItem('redirectCount');
        } else if (redirectCount < 3) { // 防止無限重定向
            sessionStorage.setItem('redirectCount', (redirectCount + 1).toString());
            window.location.href = 'assessment.html';
        } else {
            console.error('重定向次數過多，可能存在配置問題');
            throw new Error('無法載入用戶數據');
        }
    }

    async initializeServicesInOrder() {
        try {
            // 按依賴順序初始化服務
            // 1. 首先初始化基礎分析服務
            this.analytics = new LearningAnalytics(this.userData);
            await this.waitForServiceReady(this.analytics, 'LearningAnalytics');
            
            // 2. 初始化AI助手服務（依賴分析服務）
            this.aiService = new AIService(this.userData);
            await this.waitForServiceReady(this.aiService, 'AIService');
            
            // 3. 初始化練習管理器（依賴AI助手和分析服務）
            this.practiceManager = new PracticeManager(this);
            await this.waitForServiceReady(this.practiceManager, 'PracticeManager');
            
            // 4. 初始化成就系統（依賴練習管理器）
            this.achievementService = new AchievementService(this);
            await this.achievementService.initialize();
            await this.waitForServiceReady(this.achievementService, 'AchievementService');
            
            // 5. 初始化代碼審查服務（依賴AI助手）
            this.codeReviewService = new CodeReviewService(this);
            await this.waitForServiceReady(this.codeReviewService, 'CodeReviewService');
            
            // 6. 最後初始化認知地圖（依賴所有其他服務）
            this.cognitiveMap = new CognitiveMap(this);
            await this.waitForServiceReady(this.cognitiveMap, 'CognitiveMap');
            
        } catch (error) {
            console.error('服務初始化失敗:', error);
            throw new Error(`服務初始化失敗: ${error.message}`);
        }
    }

    async waitForServiceReady(service, serviceName, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            
            const checkService = () => {
                // 檢查服務是否已初始化完成
                if (service && (!service.isInitializing || service.isReady)) {
                    resolve();
                } else if (Date.now() - start > timeout) {
                    reject(new Error(`${serviceName} 初始化超時`));
                } else {
                    setTimeout(checkService, 100);
                }
            };
            
            checkService();
        });
    }

    updateUserProfile() {
        const avatar = document.getElementById('user-avatar');
        const nickname = document.getElementById('user-nickname');
        
        if (this.userData && avatar && nickname) {
            // 添加用戶標記到body
            document.body.classList.add('has-user');
            
            // 更新頭像
            avatar.textContent = this.userData.nickname.charAt(0).toUpperCase();
            avatar.style.backgroundColor = this.getAvatarColor(this.userData.avatar);
            
            // 更新暱稱
            nickname.textContent = this.userData.nickname;
        } else {
            // 移除用戶標記
            document.body.classList.remove('has-user');
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

    getErrorMessage(error) {
        // 網絡相關錯誤
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            return {
                message: '無法連接到伺服器，請檢查您的網絡連接',
                action: `
                    <button onclick="window.location.reload()" class="btn-primary">重新連接</button>
                    <p class="error-help">如果問題持續存在，請：</p>
                    <ul>
                        <li>檢查網絡連接</li>
                        <li>確認是否開啟了VPN或代理</li>
                        <li>稍後再試</li>
                    </ul>
                `
            };
        }

        // 資源載入超時
        if (error.message.includes('載入超時')) {
            return {
                message: '資源載入超時，可能是網絡較慢或伺服器忙碌',
                action: `
                    <button onclick="window.location.reload()" class="btn-primary">重新載入</button>
                    <p class="error-help">建議：</p>
                    <ul>
                        <li>檢查網絡速度</li>
                        <li>關閉其他佔用網絡的應用</li>
                        <li>稍後再試</li>
                    </ul>
                `
            };
        }

        // 用戶數據相關錯誤
        if (error.message.includes('無法載入用戶數據')) {
            return {
                message: '無法載入或更新用戶資料',
                action: `
                    <button onclick="window.location.href='/ai-learning-platform/assessment.html'" class="btn-primary">重新開始</button>
                    <p class="error-help">或者您可以：</p>
                    <ul>
                        <li>清除瀏覽器快取</li>
                        <li>重新登入</li>
                        <li>聯繫客服支援</li>
                    </ul>
                `
            };
        }

        // 預設錯誤信息
        return {
            message: '發生未知錯誤，請稍後重試',
            action: `
                <button onclick="window.location.reload()" class="btn-primary">重新整理</button>
                <p class="error-help">如果問題持續存在，請聯繫客服支援</p>
            `
        };
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
    
    generateReviewUI(review) {
            return `
                <div class="code-review-panel">
                    <div class="review-header">
                        <div class="score-card">
                            <h2 class="score-value" style="color: ${this.getScoreColor(review.score)}">${review.score}</h2>
                            <div class="score-rating rating-${review.report.summary.overallQuality}">
                                ${this.formatQualityRating(review.report.summary.overallQuality)}
                            </div>
                        </div>
                    </div>
                    <div class="review-content">
                        <div class="review-section">
                            <h3 class="section-title">主要發現</h3>
                            <div class="issues-list">
                                ${this.generateIssuesList(review.report.details)}
                            </div>
                        </div>
                        <div class="review-section">
                            <h3 class="section-title">改進建議</h3>
                            <div class="suggestions-list">
                                ${this.generateSuggestionsList(review.suggestions)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    
    generateIssuesList(details) {
            let html = '';
            for (const [category, issues] of Object.entries(details)) {
                if (issues.length > 0) {
                    html += issues.map(issue => `
                        <div class="issue-card ${issue.severity}">
                            <div class="issue-header">
                                <h4 class="issue-title">${issue.title}</h4>
                                <span class="issue-severity severity-${issue.severity}">
                                    ${this.formatSeverity(issue.severity)}
                                </span>
                            </div>
                            <p class="issue-description">${issue.description}</p>
                            ${issue.solution ? `
                                <div class="issue-solution">
                                    <div class="solution-title">建議解決方案：</div>
                                    <p>${issue.solution}</p>
                                    ${issue.example ? `
                                        <pre class="code-example">${issue.example}</pre>
                                    ` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `).join('');
                }
            }
            return html;
        }
    
    generateSuggestionsList(suggestions) {
            return suggestions.map(suggestion => `
                <div class="suggestion-item">
                    <div class="suggestion-icon" style="background: ${this.getSuggestionColor(suggestion.type)}">
                        ${this.getSuggestionIcon(suggestion.type)}
                    </div>
                    <div class="suggestion-info">
                        <h4 class="suggestion-title">${suggestion.title}</h4>
                        <p class="suggestion-description">${suggestion.description}</p>
                    </div>
                    <div class="suggestion-metrics">
                        <div class="metric">
                            <span class="metric-label">難度</span>
                            <span class="metric-badge" style="background: ${this.getDifficultyColor(suggestion.difficulty)}">
                                ${this.formatDifficulty(suggestion.difficulty)}
                            </span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">預估時間</span>
                            <span class="metric-badge">${suggestion.timeEstimate}分鐘</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    
    getScoreColor(score) {
            if (score >= 90) return '#4CAF50';
            if (score >= 80) return '#8BC34A';
            if (score >= 70) return '#FFC107';
            if (score >= 60) return '#FF9800';
            return '#F44336';
        }
    
    formatQualityRating(quality) {
            const ratings = {
                excellent: '優秀',
                good: '良好',
                fair: '尚可',
                needs_improvement: '需要改進',
                poor: '待加強'
            };
            return ratings[quality] || quality;
        }
    
    formatSeverity(severity) {
            const severities = {
                critical: '嚴重',
                major: '主要',
                minor: '次要'
            };
            return severities[severity] || severity;
        }
    
    getSuggestionColor(type) {
            const colors = {
                quality: '#4CAF50',
                practice: '#2196F3',
                documentation: '#FF9800',
                testing: '#9C27B0'
            };
            return colors[type] || '#757575';
        }
    
    getSuggestionIcon(type) {
            const icons = {
                quality: '⚡',
                practice: '🎯',
                documentation: '📝',
                testing: '🔍'
            };
            return icons[type] || '💡';
        }
    
    getDifficultyColor(difficulty) {
            const colors = {
                1: '#4CAF50',
                2: '#8BC34A',
                3: '#FFC107',
                4: '#FF9800',
                5: '#F44336'
            };
            return colors[difficulty] || '#757575';
        }
    
    // 代碼審查相關方法
    generateReviewUI(review) {
        return `
            <div class="code-review-panel">
                <div class="review-header">
                    <div class="score-card">
                        <h2 class="score-value" style="color: ${this.getScoreColor(review.score)}">${review.score}</h2>
                        <div class="score-rating rating-${review.report.summary.overallQuality}">
                            ${this.formatQualityRating(review.report.summary.overallQuality)}
                        </div>
                    </div>
                </div>
                <div class="review-content">
                    <div class="review-section">
                        <h3 class="section-title">主要發現</h3>
                        <div class="issues-list">
                            ${this.generateIssuesList(review.report.details)}
                        </div>
                    </div>
                    <div class="review-section">
                        <h3 class="section-title">改進建議</h3>
                        <div class="suggestions-list">
                            ${this.generateSuggestionsList(review.suggestions)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateIssuesList(details) {
        let html = '';
        for (const [category, issues] of Object.entries(details)) {
            if (issues.length > 0) {
                html += issues.map(issue => `
                    <div class="issue-card ${issue.severity}">
                        <div class="issue-header">
                            <h4 class="issue-title">${issue.title}</h4>
                            <span class="issue-severity severity-${issue.severity}">
                                ${this.formatSeverity(issue.severity)}
                            </span>
                        </div>
                        <p class="issue-description">${issue.description}</p>
                        ${issue.solution ? `
                            <div class="issue-solution">
                                <div class="solution-title">建議解決方案：</div>
                                <p>${issue.solution}</p>
                                ${issue.example ? `
                                    <pre class="code-example">${issue.example}</pre>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            }
        }
        return html;
    }

    generateSuggestionsList(suggestions) {
        return suggestions.map(suggestion => `
            <div class="suggestion-item">
                <div class="suggestion-icon" style="background: ${this.getSuggestionColor(suggestion.type)}">
                    ${this.getSuggestionIcon(suggestion.type)}
                </div>
                <div class="suggestion-info">
                    <h4 class="suggestion-title">${suggestion.title}</h4>
                    <p class="suggestion-description">${suggestion.description}</p>
                </div>
                <div class="suggestion-metrics">
                    <div class="metric">
                        <span class="metric-label">難度</span>
                        <span class="metric-badge" style="background: ${this.getDifficultyColor(suggestion.difficulty)}">
                            ${this.formatDifficulty(suggestion.difficulty)}
                        </span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">預估時間</span>
                        <span class="metric-badge">${suggestion.timeEstimate}分鐘</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getScoreColor(score) {
        if (score >= 90) return '#4CAF50';
        if (score >= 80) return '#8BC34A';
        if (score >= 70) return '#FFC107';
        if (score >= 60) return '#FF9800';
        return '#F44336';
    }

    formatQualityRating(quality) {
        const ratings = {
            excellent: '優秀',
            good: '良好',
            fair: '尚可',
            needs_improvement: '需要改進',
            poor: '待加強'
        };
        return ratings[quality] || quality;
    }

    formatSeverity(severity) {
        const severities = {
            critical: '嚴重',
            major: '主要',
            minor: '次要'
        };
        return severities[severity] || severity;
    }

    getSuggestionColor(type) {
        const colors = {
            quality: '#4CAF50',
            practice: '#2196F3',
            documentation: '#FF9800',
            testing: '#9C27B0'
        };
        return colors[type] || '#757575';
    }

    getSuggestionIcon(type) {
        const icons = {
            quality: '⚡',
            practice: '🎯',
            documentation: '📝',
            testing: '🔍'
        };
        return icons[type] || '💡';
    }

    getDifficultyColor(difficulty) {
        const colors = {
            1: '#4CAF50',
            2: '#8BC34A',
            3: '#FFC107',
            4: '#FF9800',
            5: '#F44336'
        };
        return colors[difficulty] || '#757575';
    }

    formatDifficulty(difficulty) {
        const levels = {
            1: '簡單',
            2: '較簡單',
            3: '中等',
            4: '較難',
            5: '困難'
        };
        return levels[difficulty] || difficulty;
    }

    initializeCognitiveMap() {
        if (this.cognitiveMap && document.getElementById('cognitive-map-container')) {
            this.cognitiveMap.initialize('cognitive-map-container');
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

        // 載入用戶進度和成就
        if (this.userData) {
            const progress = await this.practiceManager.practiceExercises.getProgress(this.userData.id);
            
            // 檢查新的成就
            if (this.achievementService) {
                this.achievementService.checkNewAchievements();
            }
            
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
