class PracticeManager {
    constructor(platform) {
        this.platform = platform;
        this.practiceExercises = new PracticeExercises();
        this.currentExercise = null;
        this.template = null;

        this.loadTemplate();
    }

    async loadTemplate() {
        try {
            const response = await fetch('components/practice-exercise.html');
            this.template = await response.text();
        } catch (error) {
            console.error('無法載入練習模板:', error);
        }
    }

    async initialize() {
        const container = document.querySelector('.practice-container');
        if (!container || !this.template) return;

        // 載入練習列表
        const exerciseList = this.createExerciseList();
        container.appendChild(exerciseList);
        
        // 載入練習區域
        const exerciseArea = document.createElement('div');
        exerciseArea.className = 'exercise-area';
        exerciseArea.innerHTML = this.template;
        container.appendChild(exerciseArea);

        this.initializeEventListeners();
    }

    createExerciseList() {
        const listContainer = document.createElement('div');
        listContainer.className = 'exercise-list';
        
        // 基礎練習
        const basicSection = this.createExerciseSection('基礎概念', this.practiceExercises.exercises.basics);
        listContainer.appendChild(basicSection);
        
        // 實戰練習
        const practicalSection = this.createExerciseSection('實戰練習', this.practiceExercises.exercises.practical);
        listContainer.appendChild(practicalSection);

        return listContainer;
    }

    createExerciseSection(title, exercises) {
        const section = document.createElement('div');
        section.className = 'exercise-section';
        
        const header = document.createElement('h3');
        header.textContent = title;
        section.appendChild(header);

        const list = document.createElement('ul');
        exercises.forEach(exercise => {
            const item = document.createElement('li');
            item.className = 'exercise-item';
            item.innerHTML = `
                <div class="exercise-info">
                    <h4>${exercise.title}</h4>
                    <p>${exercise.description}</p>
                </div>
                <button class="btn-start" data-exercise-id="${exercise.id}">
                    開始練習
                </button>
            `;
            list.appendChild(item);
        });
        section.appendChild(list);

        return section;
    }

    initializeEventListeners() {
        // 練習選擇
        document.querySelectorAll('.btn-start').forEach(button => {
            button.addEventListener('click', () => {
                const exerciseId = button.dataset.exerciseId;
                this.loadExercise(exerciseId);
            });
        });

        // 程式碼編輯器控制
        const codeEditor = document.querySelector('.code-editor');
        if (codeEditor) {
            const runButton = codeEditor.querySelector('.btn-run');
            const resetButton = codeEditor.querySelector('.btn-reset');
            const clearButton = codeEditor.querySelector('.btn-clear');

            runButton?.addEventListener('click', () => this.runCode());
            resetButton?.addEventListener('click', () => this.resetCode());
            clearButton?.addEventListener('click', () => this.clearOutput());
        }

        // 導航按鈕
        document.querySelectorAll('.navigation-buttons button').forEach(button => {
            button.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-previous')) {
                    this.navigateExercise('prev');
                } else if (e.target.classList.contains('btn-next')) {
                    this.navigateExercise('next');
                }
            });
        });
    }

    async loadExercise(exerciseId) {
        try {
            this.currentExercise = await this.practiceExercises.loadExercise(null, exerciseId);
            if (!this.currentExercise) return;

            // 更新UI
            document.querySelector('.exercise-title').textContent = this.currentExercise.title;
            document.querySelector('.exercise-description').textContent = this.currentExercise.description;

            // 載入練習內容
            if (this.currentExercise.exercises) {
                this.loadTheoryExercise(this.currentExercise);
            } else if (this.currentExercise.code) {
                this.loadPracticalExercise(this.currentExercise);
            }

            // 更新導航按鈕
            this.updateNavigationButtons();

        } catch (error) {
            console.error('載入練習失敗:', error);
            // 顯示錯誤信息
        }
    }

    loadTheoryExercise(exercise) {
        const container = document.querySelector('.theory-section');
        if (!container) return;

        const questionContainer = container.querySelector('.question-container');
        const resourceContainer = container.querySelector('.resource-container');

        // 載入問題
        if (questionContainer && exercise.exercises) {
            questionContainer.innerHTML = exercise.exercises.map(q => `
                <div class="question">
                    <h4>${q.question}</h4>
                    ${this.createOptionsHTML(q)}
                </div>
            `).join('');
        }

        // 載入資源
        if (resourceContainer && exercise.resources) {
            resourceContainer.innerHTML = `
                <h4>相關資源</h4>
                <div class="resources-list">
                    ${exercise.resources.map(resource => `
                        <div class="resource-item">
                            <i class="resource-icon ${resource.type}-icon"></i>
                            <div class="resource-info">
                                <h5>${resource.title}</h5>
                                <span class="resource-meta">
                                    ${resource.type === 'video' ? resource.duration : resource.readingTime}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    loadPracticalExercise(exercise) {
        const editor = document.querySelector('#code-input');
        if (!editor) return;

        // 載入初始代碼
        editor.value = exercise.code.initial;

        // 載入步驟說明
        const container = document.querySelector('.theory-section');
        if (container && exercise.steps) {
            container.innerHTML = `
                <div class="steps-container">
                    <h4>實作步驟</h4>
                    <ol class="steps-list">
                        ${exercise.steps.map(step => `
                            <li class="step-item">
                                <h5>${step.title}</h5>
                                <p>${step.content}</p>
                            </li>
                        `).join('')}
                    </ol>
                </div>
            `;
        }
    }

    createOptionsHTML(question) {
        switch (question.type) {
            case 'multiple-choice':
                return `
                    <div class="options-list">
                        ${question.options.map((option, index) => `
                            <label class="option-item">
                                <input type="radio" name="q${question.id}" value="${index}">
                                <span>${option}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
            case 'true-false':
                return `
                    <div class="options-list">
                        <label class="option-item">
                            <input type="radio" name="q${question.id}" value="true">
                            <span>正確</span>
                        </label>
                        <label class="option-item">
                            <input type="radio" name="q${question.id}" value="false">
                            <span>錯誤</span>
                        </label>
                    </div>
                `;
            case 'checkbox':
                return `
                    <div class="options-list">
                        ${question.options.map((option, index) => `
                            <label class="option-item">
                                <input type="checkbox" name="q${question.id}" value="${index}">
                                <span>${option}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
            default:
                return '';
        }
    }

    async runCode() {
        const editor = document.querySelector('#code-input');
        const output = document.querySelector('#code-output');
        const debugInfo = document.querySelector('#debug-info');
        if (!editor || !output) return;

        try {
            // 更新UI狀態
            output.innerHTML = '<div class="running">執行代碼中...</div>';
            debugInfo.innerHTML = '';

            // 準備執行環境
            const executionContext = await this.prepareExecutionContext(editor.value);
            
            // 獲取測試用例
            const testCases = await this.getTestCases(this.currentExercise);
            
            // 執行測試
            const results = await this.runTests(executionContext, testCases);
            
            // 分析執行結果
            const analysis = this.analyzeResults(results);
            
            // 更新UI
            this.updateExecutionUI(output, debugInfo, results, analysis);
            
            // 保存結果
            await this.saveExecutionResults(results, analysis);

        } catch (error) {
            console.error('代碼執行錯誤:', error);
            output.innerHTML = `
                <div class="error">
                    <h4>執行錯誤</h4>
                    <div class="error-message">${error.message}</div>
                    <div class="error-help">
                        <h5>可能的原因：</h5>
                        <ul>
                            ${this.getErrorSuggestions(error)}
                        </ul>
                    </div>
                </div>
            `;
        }
    }

    async prepareExecutionContext(code) {
        // 創建沙箱環境
        const sandbox = {
            console: {
                log: (...args) => this.handleConsoleLog(args),
                error: (...args) => this.handleConsoleError(args),
                warn: (...args) => this.handleConsoleWarn(args)
            },
            setTimeout: (callback, delay) => setTimeout(callback, Math.min(delay, 5000)),
            fetch: this.createSafeFetch()
        };

        // 注入必要的依賴
        return new Promise((resolve) => {
            const worker = new Worker(URL.createObjectURL(new Blob([`
                self.onmessage = function(e) {
                    const code = e.data;
                    try {
                        eval(code);
                        self.postMessage({ type: 'success' });
                    } catch (error) {
                        self.postMessage({ type: 'error', error: error.message });
                    }
                }
            `], { type: 'application/javascript' })));

            worker.onmessage = (e) => {
                if (e.data.type === 'success') {
                    resolve(sandbox);
                } else {
                    throw new Error(e.data.error);
                }
            };

            worker.postMessage(code);
        });
    }

    async getTestCases(exercise) {
        // 獲取練習相關的測試用例
        const defaultCases = exercise.code.testCases || [];
        
        // 根據用戶級別添加進階測試
        if (this.platform.userData.skillLevel === 'advanced') {
            const advancedCases = await this.loadAdvancedTestCases(exercise.id);
            return [...defaultCases, ...advancedCases];
        }
        
        return defaultCases;
    }

    async runTests(context, testCases) {
        const results = [];
        const startTime = performance.now();

        for (const test of testCases) {
            try {
                const result = await this.executeTest(context, test);
                results.push({
                    ...result,
                    executionTime: performance.now() - startTime
                });
            } catch (error) {
                results.push({
                    input: test.input,
                    error: error.message,
                    passed: false
                });
            }
        }

        return results;
    }

    analyzeResults(results) {
        return {
            totalTests: results.length,
            passedTests: results.filter(r => r.passed).length,
            averageExecutionTime: results.reduce((acc, r) => acc + (r.executionTime || 0), 0) / results.length,
            errorPatterns: this.identifyErrorPatterns(results),
            suggestions: this.generateImprovementSuggestions(results)
        };
    }

    updateExecutionUI(output, debugInfo, results, analysis) {
        // 更新測試結果
        output.innerHTML = `
            <div class="test-summary">
                <h4>測試結果摘要</h4>
                <div class="stats">
                    <div class="stat">通過率: ${(analysis.passedTests / analysis.totalTests * 100).toFixed(1)}%</div>
                    <div class="stat">平均執行時間: ${analysis.averageExecutionTime.toFixed(2)}ms</div>
                </div>
            </div>
            <div class="test-details">
                ${results.map(this.formatTestResult).join('')}
            </div>
        `;

        // 更新除錯信息
        debugInfo.innerHTML = `
            <div class="debug-suggestions">
                <h4>改進建議</h4>
                <ul>
                    ${analysis.suggestions.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    formatTestResult(result) {
        return `
            <div class="test-case ${result.passed ? 'passed' : 'failed'}">
                <div class="test-header">
                    <span class="test-status">${result.passed ? '✓ 通過' : '✗ 未通過'}</span>
                    <span class="test-time">${result.executionTime?.toFixed(2)}ms</span>
                </div>
                <div class="test-body">
                    <div>輸入: ${JSON.stringify(result.input)}</div>
                    <div>輸出: ${JSON.stringify(result.output)}</div>
                    ${result.error ? `<div class="error-message">錯誤: ${result.error}</div>` : ''}
                </div>
            </div>
        `;
    }

    getErrorSuggestions(error) {
        const suggestions = {
            'ReferenceError': [
                '檢查變量是否已經宣告',
                '確認變量名稱拼寫是否正確',
                '檢查變量的作用域'
            ],
            'SyntaxError': [
                '檢查括號是否配對',
                '確認所有語句結尾是否有分號',
                '檢查關鍵字拼寫是否正確'
            ],
            'TypeError': [
                '確認使用的方法適用於該數據類型',
                '檢查對像或變量是否為null或undefined',
                '確認函數調用方式是否正確'
            ]
        };

        const errorType = error.name || 'General';
        return (suggestions[errorType] || ['檢查代碼邏輯', '確認輸入輸出格式'])
            .map(s => `<li>${s}</li>`).join('');
    }

    resetCode() {
        if (!this.currentExercise?.code?.initial) return;
        
        const editor = document.querySelector('#code-input');
        if (editor) {
            editor.value = this.currentExercise.code.initial;
        }
    }

    clearOutput() {
        const output = document.querySelector('#code-output');
        if (output) {
            output.innerHTML = '';
        }
    }

    updateNavigationButtons() {
        const prevButton = document.querySelector('.btn-previous');
        const nextButton = document.querySelector('.btn-next');
        
        if (!this.currentExercise) return;

        const nextExercise = this.practiceExercises.getNextExercise(this.currentExercise.id);
        if (nextButton) {
            nextButton.disabled = !nextExercise;
        }
    }

    async navigateExercise(direction) {
        if (!this.currentExercise) return;

        const exerciseId = direction === 'next' 
            ? this.practiceExercises.getNextExercise(this.currentExercise.id)
            : this.practiceExercises.getPreviousExercise(this.currentExercise.id);

        if (exerciseId) {
            await this.loadExercise(exerciseId);
        }
    }

    async saveExecutionResults(results, analysis) {
        if (!this.currentExercise || !this.platform.userData) return;

        const progress = {
            exerciseId: this.currentExercise.id,
            results: results,
            analysis: analysis,
            timestamp: new Date(),
            completed: analysis.passedTests === analysis.totalTests,
            metrics: {
                accuracy: analysis.passedTests / analysis.totalTests,
                performance: analysis.averageExecutionTime,
                complexity: this.calculateCodeComplexity(),
                quality: this.evaluateCodeQuality()
            }
        };

        // 保存到本地存儲
        await this.practiceExercises.saveProgress(
            this.platform.userData.id,
            this.currentExercise.id,
            progress
        );

        // 更新學習分析
        await this.platform.analytics.updatePracticeMetrics(progress);

        // 如果完成度高，建議下一個練習
        if (progress.completed) {
            this.suggestNextExercise(analysis);
        }
    }

    calculateCodeComplexity() {
        const code = document.querySelector('#code-input')?.value;
        if (!code) return 0;

        // 分析代碼複雜度
        const metrics = {
            lines: code.split('\n').length,
            branches: (code.match(/if|else|switch|case|while|for/g) || []).length,
            functions: (code.match(/function|\=\>/g) || []).length,
            complexity: this.calculateCyclomaticComplexity(code)
        };

        // 計算綜合分數
        return {
            ...metrics,
            score: this.calculateComplexityScore(metrics)
        };
    }

    calculateCyclomaticComplexity(code) {
        const controlFlowKeywords = [
            /\bif\b/g,
            /\belse\s+if\b/g,
            /\bfor\b/g,
            /\bwhile\b/g,
            /\bdo\b/g,
            /\bcase\b/g,
            /\bcatch\b/g,
            /\b&&\b/g,
            /\b\|\|\b/g,
            /\?\b/g
        ];

        return 1 + controlFlowKeywords.reduce((sum, pattern) =>
            sum + (code.match(pattern) || []).length, 0);
    }

    calculateComplexityScore(metrics) {
        const weights = {
            lines: 0.1,
            branches: 0.3,
            functions: 0.2,
            complexity: 0.4
        };

        const scores = {
            lines: Math.min(1, metrics.lines / 100),
            branches: Math.min(1, metrics.branches / 20),
            functions: Math.min(1, metrics.functions / 10),
            complexity: Math.min(1, metrics.complexity / 15)
        };

        return Object.entries(weights).reduce((score, [key, weight]) =>
            score + (1 - scores[key]) * weight, 0);
    }

    evaluateCodeQuality() {
        const code = document.querySelector('#code-input')?.value;
        if (!code) return 0;

        const criteria = {
            formatting: this.checkFormatting(code),
            naming: this.checkNamingConventions(code),
            comments: this.checkComments(code),
            duplication: this.checkDuplication(code)
        };

        // 計算總體代碼質量分數
        return {
            ...criteria,
            score: Object.values(criteria).reduce((sum, {score}) => sum + score, 0) / 4
        };
    }

    checkFormatting(code) {
        let score = 1.0;
        const issues = [];

        // 檢查縮排一致性
        const indentPattern = /^( {2}|\t)/gm;
        const inconsistentIndent = code.split('\n').some(line =>
            line.length > 0 && !line.match(indentPattern)
        );
        if (inconsistentIndent) {
            score -= 0.2;
            issues.push('縮排不一致');
        }

        // 檢查行尾空格
        const trailingSpaces = /[ \t]+$/m.test(code);
        if (trailingSpaces) {
            score -= 0.1;
            issues.push('存在行尾空格');
        }

        // 檢查空行過多
        const multipleEmptyLines = /\n{3,}/.test(code);
        if (multipleEmptyLines) {
            score -= 0.1;
            issues.push('過多連續空行');
        }

        return {
            score: Math.max(0, score),
            issues
        };
    }

    checkNamingConventions(code) {
        let score = 1.0;
        const issues = [];

        // 檢查變量命名
        const variablePattern = /\b(?:let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
        let match;
        while ((match = variablePattern.exec(code)) !== null) {
            const varName = match[1];
            if (!/^[a-z][a-zA-Z0-9]*$/.test(varName)) {
                score -= 0.1;
                issues.push(`變量名 "${varName}" 不符合命名規範`);
            }
        }

        // 檢查函數命名
        const functionPattern = /\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
        while ((match = functionPattern.exec(code)) !== null) {
            const funcName = match[1];
            if (!/^[a-z][a-zA-Z0-9]*$/.test(funcName)) {
                score -= 0.1;
                issues.push(`函數名 "${funcName}" 不符合命名規範`);
            }
        }

        return {
            score: Math.max(0, score),
            issues
        };
    }

    checkComments(code) {
        let score = 1.0;
        const issues = [];

        // 計算註釋覆蓋率
        const codeLines = code.split('\n').length;
        const commentLines = (code.match(/\/\/.*$|\/\*[\s\S]*?\*\//gm) || []).length;
        const commentRatio = commentLines / codeLines;

        if (commentRatio < 0.1) {
            score -= 0.3;
            issues.push('註釋太少');
        } else if (commentRatio > 0.4) {
            score -= 0.1;
            issues.push('註釋可能過多');
        }

        // 檢查無意義的註釋
        const meaninglessComments = code.match(/\/\/\s*(todo|fixme|xxx)/gi);
        if (meaninglessComments) {
            score -= 0.2;
            issues.push('存在待完成的標記');
        }

        return {
            score: Math.max(0, score),
            issues
        };
    }

    checkDuplication(code) {
        let score = 1.0;
        const issues = [];

        // 分割代碼為行
        const lines = code.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        // 檢查重複行
        const duplicates = new Map();
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.length > 10) { // 忽略過短的行
                if (duplicates.has(line)) {
                    duplicates.get(line).count++;
                    duplicates.get(line).lines.push(i + 1);
                } else {
                    duplicates.set(line, { count: 1, lines: [i + 1] });
                }
            }
        }

        // 評估重複情況
        for (const [line, info] of duplicates) {
            if (info.count > 1) {
                score -= 0.1 * (info.count - 1);
                issues.push(`代碼行在第 ${info.lines.join(', ')} 行重複出現`);
            }
        }

        return {
            score: Math.max(0, score),
            issues
        };
    }

    calculateCodeComplexity() {
        const code = document.querySelector('#code-input')?.value;
        if (!code) return 0;

        // 簡單的複雜度計算
        const metrics = {
            lines: code.split('\n').length,
            branches: (code.match(/if|else|switch|case|while|for/g) || []).length,
            functions: (code.match(/function|\=\>/g) || []).length
        };

        return {
            ...metrics,
            score: (metrics.lines + metrics.branches * 2 + metrics.functions * 3) / 10
        };
    }

    evaluateCodeQuality() {
        const code = document.querySelector('#code-input')?.value;
        if (!code) return 0;

        const criteria = {
            formatting: this.checkFormatting(code),
            naming: this.checkNamingConventions(code),
            comments: this.checkComments(code),
            duplication: this.checkDuplication(code)
        };

        return {
            ...criteria,
            score: Object.values(criteria).reduce((acc, val) => acc + val, 0) / 4
        };
    }

    async suggestNextExercise(analysis) {
        const nextExercises = await this.practiceExercises.getRecommendedExercises(
            this.platform.userData,
            analysis
        );

        if (nextExercises.length > 0) {
            const suggestionContainer = document.createElement('div');
            suggestionContainer.className = 'exercise-suggestion';
            suggestionContainer.innerHTML = `
                <h4>恭喜完成！建議下一個練習：</h4>
                <div class="suggested-exercises">
                    ${nextExercises.map(ex => `
                        <div class="exercise-card">
                            <h5>${ex.title}</h5>
                            <p>${ex.description}</p>
                            <button onclick="practiceManager.loadExercise('${ex.id}')" class="btn-primary">
                                開始練習
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;

            document.querySelector('.exercise-area').appendChild(suggestionContainer);
        }
    }
    // 社群功能相關方法
    async initializeCommunityFeatures() {
        try {
            // 初始化WebSocket連接
            this.initializeCollaborationSocket();
            
            // 載入社群統計
            await this.loadCommunityStats();
            
            // 載入討論
            await this.loadDiscussions();
            
            // 載入分享的解決方案
            await this.loadSharedSolutions();
            
            // 更新評審統計
            await this.updateReviewStats();
            
            // 初始化事件監聽器
            this.initializeCommunityEventListeners();
            
        } catch (error) {
            console.error('初始化社群功能失敗:', error);
        }
    }

    initializeCollaborationSocket() {
        this.collaborationSocket = new WebSocket('wss://your-server/collaboration');
        
        this.collaborationSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleCollaborationMessage(data);
        };

        this.collaborationSocket.onclose = () => {
            console.log('協作連接已關閉');
            setTimeout(() => this.initializeCollaborationSocket(), 5000);
        };
    }

    async loadCommunityStats() {
        const response = await fetch(`/api/exercises/${this.currentExercise.id}/stats`);
        const stats = await response.json();
        this.updateCommunityStatsUI(stats);
    }

    updateCommunityStatsUI(stats) {
        const completionCount = document.querySelector('.stat-value:first-child');
        const discussionCount = document.querySelector('.stat-value:last-child');

        if (completionCount) completionCount.textContent = stats.completions;
        if (discussionCount) discussionCount.textContent = stats.discussions;
    }

    async postDiscussion(content) {
        try {
            const response = await fetch('/api/discussions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exerciseId: this.currentExercise.id,
                    content,
                    userId: this.platform.userData.id,
                    timestamp: new Date()
                })
            });

            if (response.ok) {
                await this.loadDiscussions();
                this.showSuccessMessage('討論發布成功！');
            }
        } catch (error) {
            console.error('發布討論失敗:', error);
            this.showErrorMessage('發布失敗，請稍後重試');
        }
    }

    initializePeerReview() {
        const requestReviewButton = document.querySelector('.btn-request-review');
        const reviewOthersButton = document.querySelector('.btn-review-others');

        requestReviewButton?.addEventListener('click', () => this.requestPeerReview());
        reviewOthersButton?.addEventListener('click', () => this.startReviewingOthers());
    }

    async requestPeerReview() {
        const code = document.querySelector('#code-input')?.value;
        if (!code) {
            this.showErrorMessage('請先完成程式碼再請求評審');
            return;
        }

        try {
            const response = await fetch('/api/peer-reviews/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exerciseId: this.currentExercise.id,
                    code,
                    userId: this.platform.userData.id,
                    metrics: {
                        complexity: this.calculateCodeComplexity(),
                        quality: this.evaluateCodeQuality()
                    }
                })
            });

            if (response.ok) {
                this.showSuccessMessage('評審請求已發送！');
                await this.updateReviewStats();
            }
        } catch (error) {
            console.error('請求評審失敗:', error);
            this.showErrorMessage('請求失敗，請稍後重試');
        }
    }

    async startReviewingOthers() {
        try {
            const response = await fetch('/api/peer-reviews/available');
            const reviews = await response.json();
            
            if (reviews.length === 0) {
                this.showMessage('目前沒有待評審的程式碼');
                return;
            }

            this.showReviewInterface(reviews[0]);
        } catch (error) {
            console.error('載入評審失敗:', error);
            this.showErrorMessage('載入評審失敗，請稍後重試');
        }
    }

    showReviewInterface(review) {
        const container = document.createElement('div');
        container.className = 'review-interface';
        container.innerHTML = `
            <div class="review-header">
                <h3>程式碼評審</h3>
                <div class="code-metrics">
                    <span>複雜度: ${review.metrics.complexity.score.toFixed(2)}</span>
                    <span>代碼質量: ${review.metrics.quality.score.toFixed(2)}</span>
                </div>
            </div>
            <div class="code-display">
                <pre><code>${this.escapeHtml(review.code)}</code></pre>
            </div>
            <div class="review-form">
                <div class="rating-section">
                    <h4>評分項目</h4>
                    <div class="rating-items">
                        <label>
                            代碼品質
                            <input type="range" name="quality" min="1" max="5" value="3">
                        </label>
                        <label>
                            可讀性
                            <input type="range" name="readability" min="1" max="5" value="3">
                        </label>
                        <label>
                            效能
                            <input type="range" name="performance" min="1" max="5" value="3">
                        </label>
                    </div>
                </div>
                <div class="comment-section">
                    <h4>評審意見</h4>
                    <textarea placeholder="請提供具體的改進建議..."></textarea>
                </div>
                <div class="review-actions">
                    <button class="btn-submit-review">提交評審</button>
                    <button class="btn-skip-review">跳過</button>
                </div>
            </div>
        `;

        document.querySelector('.exercise-area').appendChild(container);

        // 添加評審提交事件處理
        container.querySelector('.btn-submit-review').addEventListener('click', () =>
            this.submitReview(review.id, this.collectReviewData(container)));
        
        container.querySelector('.btn-skip-review').addEventListener('click', () =>
            this.skipReview(review.id));
    }

    collectReviewData(container) {
        return {
            quality: parseInt(container.querySelector('input[name="quality"]').value),
            readability: parseInt(container.querySelector('input[name="readability"]').value),
            performance: parseInt(container.querySelector('input[name="performance"]').value),
            comment: container.querySelector('textarea').value
        };
    }

    async submitReview(reviewId, reviewData) {
        try {
            const response = await fetch(`/api/peer-reviews/${reviewId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });

            if (response.ok) {
                this.showSuccessMessage('評審已提交！');
                await this.updateReviewStats();
                await this.startReviewingOthers();
            }
        } catch (error) {
            console.error('提交評審失敗:', error);
            this.showErrorMessage('提交失敗，請稍後重試');
        }
    }

    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        document.body.appendChild(messageElement);

        setTimeout(() => messageElement.remove(), 3000);
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }
}

// 導出練習管理器
window.PracticeManager = PracticeManager;
