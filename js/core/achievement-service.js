class AchievementService {
    constructor(platform) {
        this.platform = platform;
        this.achievements = {
            learning: [
                {
                    id: 'first-step',
                    title: '起步探索',
                    description: '完成首次學習評估',
                    icon: 'fas fa-flag-checkered',
                    condition: (userData) => userData.activities.some(a => a.type === 'assessment')
                },
                {
                    id: 'brain-master',
                    title: '認知大師',
                    description: '完成所有認知科學課程',
                    icon: 'fas fa-brain',
                    condition: (userData) => this.checkCourseCompletion(userData, 'cognitive-science')
                }
            ],
            practice: [
                {
                    id: 'practice-starter',
                    title: '實踐先鋒',
                    description: '完成首次實戰練習',
                    icon: 'fas fa-code',
                    condition: (userData) => userData.activities.some(a => a.type === 'practice')
                }
            ],
            social: [
                {
                    id: 'team-player',
                    title: '團隊精神',
                    description: '參與首次社群討論',
                    icon: 'fas fa-users',
                    condition: (userData) => userData.activities.some(a => a.type === 'discussion')
                }
            ]
        };
        
        this.unlockedAchievements = new Set();
    }

    initialize() {
        // 從本地存儲加載已解鎖的成就
        const savedAchievements = localStorage.getItem('unlockedAchievements');
        if (savedAchievements) {
            this.unlockedAchievements = new Set(JSON.parse(savedAchievements));
        }
        
        // 初始檢查成就
        this.checkAchievements();
    }

    checkAchievements() {
        if (!this.platform.userData) return;

        Object.values(this.achievements).flat().forEach(achievement => {
            if (!this.unlockedAchievements.has(achievement.id) && 
                achievement.condition(this.platform.userData)) {
                this.unlockAchievement(achievement);
            }
        });
    }

    unlockAchievement(achievement) {
        if (this.unlockedAchievements.has(achievement.id)) return;

        this.unlockedAchievements.add(achievement.id);
        this.saveAchievements();
        this.showAchievementNotification(achievement);
        
        // 更新UI
        this.updateAchievementsDisplay();
    }

    saveAchievements() {
        localStorage.setItem('unlockedAchievements', 
            JSON.stringify(Array.from(this.unlockedAchievements)));
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <i class="${achievement.icon}"></i>
            <div class="achievement-info">
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }, 100);
    }

    updateAchievementsDisplay() {
        const container = document.getElementById('achievements-container');
        if (!container) return;

        container.innerHTML = this.getAchievementsHTML();
    }

    getAchievementsHTML() {
        let html = '<h3>成就進度</h3>';
        
        Object.entries(this.achievements).forEach(([category, achievements]) => {
            html += `
                <div class="achievement-category">
                    <h4>${this.getCategoryTitle(category)}</h4>
                    <div class="achievements-grid">
                        ${achievements.map(achievement => this.getAchievementHTML(achievement)).join('')}
                    </div>
                </div>
            `;
        });

        return html;
    }

    getCategoryTitle(category) {
        const titles = {
            learning: '學習成就',
            practice: '實戰成就',
            social: '社群成就'
        };
        return titles[category] || category;
    }

    getAchievementHTML(achievement) {
        const unlocked = this.unlockedAchievements.has(achievement.id);
        return `
            <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-details">
                    <h5>${achievement.title}</h5>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `;
    }

    checkCourseCompletion(userData, courseType) {
        if (!userData.activities) return false;
        
        const courseActivities = userData.activities.filter(
            activity => activity.type === 'course' && 
                       activity.courseType === courseType
        );

        return courseActivities.length >= 3; // 假設完成3個相關活動即算完成課程
    }
}

// 導出成就服務
window.AchievementService = AchievementService;