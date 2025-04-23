class AssessmentModule {
    constructor() {
        this.currentScreen = 'welcome-screen';
        this.currentQuestion = 0;
        this.userData = {
            avatar: null,
            avatarText: '',
            nickname: '',
            interests: [],
            answers: []
        };
        
        this.questions = [
            {
                id: 1,
                type: 'scale',
                question: '您對AI技術的熟悉程度如何？',
                options: ['完全不熟悉', '略有了解', '中等程度', '相當熟悉', '專業水平']
            },
            {
                id: 2,
                type: 'multiple',
                question: '您希望通過AI學習獲得什麼？（可多選）',
                options: [
                    '提升工作效率',
                    '開發創新解決方案',
                    '理解AI發展趨勢',
                    '實踐專案經驗'
                ]
            },
            {
                id: 3,
                type: 'single',
                question: '您偏好的學習方式是？',
                options: [
                    '觀看視頻教程',
                    '閱讀文檔資料',
                    '動手實踐練習',
                    '參與討論交流'
                ]
            },
            {
                id: 4,
                type: 'scale',
                question: '您每週可投入的學習時間？',
                options: ['<2小時', '2-5小時', '5-10小時', '10-15小時', '>15小時']
            },
            {
                id: 5,
                type: 'multiple',
                question: '您在工作中最常遇到的AI相關需求是？（可多選）',
                options: [
                    '數據分析與預測',
                    '流程自動化',
                    '智能客服應用',
                    '文件處理自動化',
                    '決策輔助系統'
                ]
            }
        ];

        this.avatarTypes = {
            '1': { text: '探索', color: '#4A90E2' },
            '2': { text: '創新', color: '#48BB78' },
            '3': { text: '專注', color: '#9F7AEA' },
            '4': { text: '合作', color: '#ED8936' }
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Welcome Screen
        document.getElementById('start-assessment').addEventListener('click', () => {
            this.switchScreen('character-creation');
        });

        // Character Creation
        document.querySelectorAll('.avatar').forEach(avatar => {
            avatar.addEventListener('click', (e) => {
                this.selectAvatar(e.target);
            });
        });

        document.getElementById('create-character').addEventListener('click', () => {
            this.createCharacter();
        });

        // Assessment Navigation
        document.getElementById('prev-question').addEventListener('click', () => {
            this.navigateQuestion('prev');
        });

        document.getElementById('next-question').addEventListener('click', () => {
            this.navigateQuestion('next');
        });

        // Start Learning Button
        document.getElementById('start-learning').addEventListener('click', () => {
            this.startLearning();
        });
    }

    switchScreen(screenId) {
        document.getElementById(this.currentScreen).classList.remove('active');
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;

        if (screenId === 'assessment-questions') {
            this.loadQuestion();
        }
    }

    selectAvatar(avatarElement) {
        document.querySelectorAll('.avatar').forEach(avatar => {
            avatar.classList.remove('selected');
        });
        avatarElement.classList.add('selected');
        const avatarId = avatarElement.getAttribute('data-avatar');
        this.userData.avatar = avatarId;
        this.userData.avatarText = this.avatarTypes[avatarId].text;
    }

    createCharacter() {
        const nickname = document.getElementById('nickname').value;
        const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
            .map(checkbox => checkbox.value);

        if (!this.userData.avatar || !nickname || interests.length === 0) {
            alert('請完成所有必要資訊！');
            return;
        }

        this.userData.nickname = nickname;
        this.userData.interests = interests;
        this.switchScreen('assessment-questions');
    }

    loadQuestion() {
        const question = this.questions[this.currentQuestion];
        const container = document.querySelector('.question-container');
        const progress = (this.currentQuestion / this.questions.length) * 100;
        
        document.querySelector('.progress').style.width = `${progress}%`;

        container.innerHTML = `
            <h3>問題 ${question.id}/${this.questions.length}</h3>
            <p class="question-text">${question.question}</p>
            ${this.createOptionsHTML(question)}
        `;

        this.updateNavigationButtons();
    }

    createOptionsHTML(question) {
        let optionsHTML = '<div class="options-container">';
        
        if (question.type === 'scale') {
            optionsHTML += `
                <div class="scale-options">
                    ${question.options.map((option, index) => `
                        <label class="scale-option">
                            <input type="radio" name="q${question.id}" value="${index}">
                            <span>${option}</span>
                        </label>
                    `).join('')}
                </div>
            `;
        } else if (question.type === 'multiple') {
            optionsHTML += question.options.map((option, index) => `
                <label class="checkbox-option">
                    <input type="checkbox" name="q${question.id}" value="${index}">
                    <span>${option}</span>
                </label>
            `).join('');
        } else {
            optionsHTML += question.options.map((option, index) => `
                <label class="radio-option">
                    <input type="radio" name="q${question.id}" value="${index}">
                    <span>${option}</span>
                </label>
            `).join('');
        }

        return optionsHTML + '</div>';
    }

    updateNavigationButtons() {
        const prevButton = document.getElementById('prev-question');
        const nextButton = document.getElementById('next-question');

        prevButton.style.visibility = this.currentQuestion === 0 ? 'hidden' : 'visible';
        nextButton.textContent = this.currentQuestion === this.questions.length - 1 ? '完成評估' : '下一題';
    }

    navigateQuestion(direction) {
        const currentAnswers = this.collectCurrentAnswers();
        
        if (direction === 'next' && !currentAnswers.length) {
            alert('請回答當前問題！');
            return;
        }

        this.userData.answers[this.currentQuestion] = currentAnswers;

        if (direction === 'next') {
            if (this.currentQuestion === this.questions.length - 1) {
                this.showResults();
                return;
            }
            this.currentQuestion++;
        } else {
            this.currentQuestion--;
        }

        this.loadQuestion();
    }

    collectCurrentAnswers() {
        const question = this.questions[this.currentQuestion];
        const answers = [];

        if (question.type === 'multiple') {
            document.querySelectorAll(`input[name="q${question.id}"]:checked`).forEach(input => {
                answers.push(parseInt(input.value));
            });
        } else {
            const selectedAnswer = document.querySelector(`input[name="q${question.id}"]:checked`);
            if (selectedAnswer) {
                answers.push(parseInt(selectedAnswer.value));
            }
        }

        return answers;
    }

    showResults() {
        this.switchScreen('results-screen');
        
        const profileAvatar = document.getElementById('profile-avatar');
        profileAvatar.textContent = this.userData.avatarText;
        profileAvatar.style.backgroundColor = this.avatarTypes[this.userData.avatar].color;
        
        document.getElementById('profile-nickname').textContent = this.userData.nickname;

        const statsContainer = document.getElementById('stats-container');
        statsContainer.innerHTML = this.generateLearningStats();

        const pathContainer = document.getElementById('path-container');
        pathContainer.innerHTML = this.generateRecommendedPath();
    }

    generateLearningStats() {
        const stats = [
            {label: 'AI熟悉度', value: this.calculateFamiliarity()},
            {label: '學習投入度', value: this.calculateCommitment()},
            {label: '實踐導向性', value: this.calculatePracticalOrientation()}
        ];

        return stats.map(stat => `
            <div class="stat-item">
                <label>${stat.label}</label>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${stat.value}%"></div>
                </div>
            </div>
        `).join('');
    }

    calculateFamiliarity() {
        return (this.userData.answers[0][0] + 1) * 20;
    }

    calculateCommitment() {
        return (this.userData.answers[3][0] + 1) * 20;
    }

    calculatePracticalOrientation() {
        const practicalAnswers = this.userData.answers[2][0] === 2 ? 100 : 
                               this.userData.answers[2][0] === 3 ? 80 : 60;
        return practicalAnswers;
    }

    generateRecommendedPath() {
        const familiarity = this.calculateFamiliarity();
        const commitment = this.calculateCommitment();
        
        let modules = [];
        
        if (familiarity <= 40) {
            modules.push('AI基礎概念入門');
            modules.push('常見AI應用案例介紹');
        } else if (familiarity <= 80) {
            modules.push('AI技術深度理解');
            modules.push('實務應用開發');
        } else {
            modules.push('AI創新方案設計');
            modules.push('企業AI策略規劃');
        }

        if (commitment >= 60) {
            modules.push('進階專案實作');
        }

        return `
            <div class="recommended-modules">
                <h4>推薦學習模組</h4>
                <ul>
                    ${modules.map(module => `<li>${module}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    startLearning() {
        localStorage.setItem('userData', JSON.stringify(this.userData));
        // 更新路徑到整合後的主平台
        window.location.href = '/';
    }
}

// 初始化評估模組
document.addEventListener('DOMContentLoaded', () => {
    window.assessment = new AssessmentModule();
});
