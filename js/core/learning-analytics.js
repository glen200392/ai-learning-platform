class LearningAnalytics {
    constructor(userData) {
        this.userData = userData;
    }

    async analyzeLearningPattern(activities) {
        if (!activities || activities.length === 0) {
            return this.getDefaultAnalysis();
        }

        // 分析學習進度率
        const progressionRate = this.calculateProgressionRate(activities);
        
        // 分析學習強項和弱項
        const { strengths, weaknesses } = this.analyzeStrengthsAndWeaknesses(activities);
        
        // 生成學習建議
        const recommendations = this.generateLearningRecommendations(strengths, weaknesses);

        // 分析知識保留率
        const knowledgeRetention = this.analyzeKnowledgeRetention(activities);

        // 分析學習效率
        const learningEfficiency = this.analyzeLearningEfficiency(activities);

        // 分析學習時間分布
        const timeDistribution = this.analyzeTimeDistribution(activities);

        return {
            progressionRate,
            strengths,
            weaknesses,
            recommendations,
            knowledgeRetention,
            learningEfficiency,
            timeDistribution
        };
    }

    getDefaultAnalysis() {
        return {
            progressionRate: {
                overall: 0,
                byTopic: {
                    'AI基礎': [{timestamp: new Date(), progress: 0}],
                    '機器學習': [{timestamp: new Date(), progress: 0}],
                    '深度學習': [{timestamp: new Date(), progress: 0}]
                }
            },
            strengths: ['開始探索AI學習之旅'],
            weaknesses: ['需要建立學習基礎'],
            recommendations: [
                '從AI基礎概念開始',
                '建立穩固的數學基礎',
                '參與社群討論增進理解'
            ],
            knowledgeRetention: {
                overall: 0,
                byTopic: {}
            },
            learningEfficiency: {
                overall: 0,
                scoreProgress: {}
            },
            timeDistribution: {
                hourly: new Array(24).fill(0),
                weekly: new Array(7).fill(0)
            }
        };
    }

    calculateProgressionRate(activities) {
        const topics = {};
        let totalProgress = 0;
        let topicCount = 0;

        activities.forEach(activity => {
            if (!topics[activity.topic]) {
                topics[activity.topic] = [];
            }
            topics[activity.topic].push({
                timestamp: activity.timestamp,
                progress: activity.progress
            });
        });

        // 計算每個主題的最新進度
        for (const topic in topics) {
            const sortedProgress = topics[topic].sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            totalProgress += sortedProgress[0].progress;
            topicCount++;
        }

        return {
            overall: topicCount ? (totalProgress / topicCount) : 0,
            byTopic: topics
        };
    }

    analyzeStrengthsAndWeaknesses(activities) {
        const topicScores = {};
        const strengths = [];
        const weaknesses = [];

        // 計算每個主題的平均分數
        activities.forEach(activity => {
            if (!topicScores[activity.topic]) {
                topicScores[activity.topic] = [];
            }
            if (activity.score) {
                topicScores[activity.topic].push(activity.score);
            }
        });

        // 識別強項和弱項
        for (const topic in topicScores) {
            const scores = topicScores[topic];
            if (scores.length > 0) {
                const avgScore = scores.reduce((a, b) => a + b) / scores.length;
                if (avgScore >= 80) {
                    strengths.push(`在${topic}領域表現優異`);
                } else if (avgScore <= 60) {
                    weaknesses.push(`需要加強${topic}的基礎知識`);
                }
            }
        }

        // 如果沒有足夠數據，提供默認建議
        if (strengths.length === 0) {
            strengths.push('展現學習熱誠', '願意接受新挑戰');
        }
        if (weaknesses.length === 0) {
            weaknesses.push('需要更多實踐經驗', '可以增加學習時間');
        }

        return { strengths, weaknesses };
    }

    generateLearningRecommendations(strengths, weaknesses) {
        const recommendations = [];

        // 根據弱項提供針對性建議
        weaknesses.forEach(weakness => {
            if (weakness.includes('基礎知識')) {
                recommendations.push('建議完成相關基礎課程');
                recommendations.push('可以觀看入門視頻教程');
            }
            if (weakness.includes('實踐經驗')) {
                recommendations.push('參與實戰專案練習');
                recommendations.push('嘗試解決實際問題');
            }
            if (weakness.includes('學習時間')) {
                recommendations.push('制定每週學習計畫');
                recommendations.push('設置學習提醒');
            }
        });

        // 根據強項提供進階建議
        strengths.forEach(strength => {
            if (strength.includes('優異')) {
                recommendations.push('可以嘗試更具挑戰性的專案');
                recommendations.push('考慮分享經驗幫助他人');
            }
        });

        return recommendations;
    }

    analyzeKnowledgeRetention(activities) {
        const retentionData = {
            overall: 0,
            byTopic: {}
        };

        if (!activities || activities.length === 0) {
            return retentionData;
        }

        // 按主題分組計算保留率
        activities.forEach(activity => {
            if (activity.quiz && activity.topic) {
                if (!retentionData.byTopic[activity.topic]) {
                    retentionData.byTopic[activity.topic] = [];
                }
                retentionData.byTopic[activity.topic].push(activity.quiz.score);
            }
        });

        // 計算每個主題的平均保留率
        let totalRetention = 0;
        let topicCount = 0;

        for (const topic in retentionData.byTopic) {
            const scores = retentionData.byTopic[topic];
            if (scores.length > 0) {
                const avgScore = scores.reduce((a, b) => a + b) / scores.length;
                retentionData.byTopic[topic] = avgScore;
                totalRetention += avgScore;
                topicCount++;
            }
        }

        retentionData.overall = topicCount ? (totalRetention / topicCount) : 0;

        return retentionData;
    }

    analyzeLearningEfficiency(activities) {
        const efficiency = {
            overall: 0,
            scoreProgress: {}
        };

        if (!activities || activities.length === 0) {
            return efficiency;
        }

        // 按主題分組分析得分進展
        activities.forEach(activity => {
            if (activity.score && activity.topic) {
                if (!efficiency.scoreProgress[activity.topic]) {
                    efficiency.scoreProgress[activity.topic] = [];
                }
                efficiency.scoreProgress[activity.topic].push({
                    timestamp: activity.timestamp,
                    score: activity.score
                });
            }
        });

        // 計算每個主題的學習效率
        let totalEfficiency = 0;
        let topicCount = 0;

        for (const topic in efficiency.scoreProgress) {
            const scores = efficiency.scoreProgress[topic];
            if (scores.length >= 2) {
                // 計算分數提升速度
                const firstScore = scores[0].score;
                const lastScore = scores[scores.length - 1].score;
                const timeSpan = new Date(scores[scores.length - 1].timestamp) - new Date(scores[0].timestamp);
                const daysSpan = timeSpan / (1000 * 60 * 60 * 24);
                
                const improvementRate = (lastScore - firstScore) / daysSpan;
                totalEfficiency += improvementRate;
                topicCount++;
            }
        }

        efficiency.overall = topicCount ? (totalEfficiency / topicCount) : 0;

        return efficiency;
    }

    analyzeTimeDistribution(activities) {
        const distribution = {
            hourly: new Array(24).fill(0),
            weekly: new Array(7).fill(0)
        };

        if (!activities || activities.length === 0) {
            return distribution;
        }

        activities.forEach(activity => {
            const date = new Date(activity.timestamp);
            distribution.hourly[date.getHours()]++;
            distribution.weekly[date.getDay()]++;
        });

        return distribution;
    }

    async generateRecommendations(userData) {
        // 根據用戶數據和學習模式生成個人化推薦
        return {
            courses: this.recommendCourses(userData),
            materials: this.recommendMaterials(userData)
        };
    }

    recommendCourses(userData) {
        const recommendations = [];
        
        // 根據用戶興趣推薦課程
        if (userData.interests.includes('machinelearning')) {
            recommendations.push({
                id: 'ml-basics',
                title: '機器學習基礎',
                reason: '符合您的學習興趣',
            });
        }

        if (userData.interests.includes('nlp')) {
            recommendations.push({
                id: 'nlp-intro',
                title: '自然語言處理入門',
                reason: '基於您的興趣領域'
            });
        }

        // 根據學習進度推薦
        const progress = this.calculateOverallProgress(userData);
        if (progress < 30) {
            recommendations.push({
                id: 'ai-fundamentals',
                title: 'AI基礎概念',
                reason: '建立穩固基礎'
            });
        } else if (progress < 60) {
            recommendations.push({
                id: 'advanced-ml',
                title: '進階機器學習',
                reason: '提升專業技能'
            });
        }

        return recommendations;
    }

    recommendMaterials(userData) {
        const recommendations = [];

        // 根據用戶偏好推薦學習資源
        userData.interests.forEach(interest => {
            switch (interest) {
                case 'machinelearning':
                    recommendations.push({
                        id: 'ml-papers',
                        title: '經典機器學習論文導讀',
                        reason: '深入理解核心概念'
                    });
                    break;
                case 'nlp':
                    recommendations.push({
                        id: 'nlp-projects',
                        title: 'NLP實戰專案集',
                        reason: '實踐應用能力'
                    });
                    break;
                case 'computer-vision':
                    recommendations.push({
                        id: 'cv-tutorials',
                        title: '電腦視覺教程合集',
                        reason: '系統化學習'
                    });
                    break;
            }
        });

        return recommendations;
    }

    calculateOverallProgress(userData) {
        if (!userData.activities || userData.activities.length === 0) {
            return 0;
        }

        const progressValues = userData.activities
            .filter(activity => activity.type === 'course' && activity.progress)
            .map(activity => activity.progress);

        if (progressValues.length === 0) {
            return 0;
        }

        return progressValues.reduce((a, b) => a + b) / progressValues.length;
    }

    async generateReport(userData) {
        const analysis = await this.analyzeLearningPattern(userData.activities);
        
        return {
            learningProgress: {
                overall: analysis.progressionRate.overall,
                byTopic: analysis.progressionRate.byTopic
            },
            skillsAssessment: {
                strengths: analysis.strengths,
                weaknesses: analysis.weaknesses,
                recommendations: analysis.recommendations
            },
            timeAnalysis: analysis.timeDistribution,
            predictions: {
                nextMilestone: this.predictNextMilestone(userData),
                completionDate: this.predictCompletionDate(userData)
            }
        };
    }

    predictNextMilestone(userData) {
        // 基於當前進度預測下一個里程碑
        const progress = this.calculateOverallProgress(userData);
        
        if (progress < 30) {
            return {
                title: '完成基礎概念學習',
                requiredHours: 20,
                estimatedDate: this.calculateEstimatedDate(20)
            };
        } else if (progress < 60) {
            return {
                title: '完成進階技能培養',
                requiredHours: 40,
                estimatedDate: this.calculateEstimatedDate(40)
            };
        } else {
            return {
                title: '專案實戰階段',
                requiredHours: 60,
                estimatedDate: this.calculateEstimatedDate(60)
            };
        }
    }

    predictCompletionDate(userData) {
        const progress = this.calculateOverallProgress(userData);
        const remainingProgress = 100 - progress;
        
        // 假設每10%進度需要20小時
        const remainingHours = (remainingProgress / 10) * 20;
        
        return this.calculateEstimatedDate(remainingHours);
    }

    calculateEstimatedDate(requiredHours) {
        // 假設每天可以學習2小時
        const daysRequired = Math.ceil(requiredHours / 2);
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + daysRequired);
        return estimatedDate;
    }
}

// 匯出分析服務
window.LearningAnalytics = LearningAnalytics;
