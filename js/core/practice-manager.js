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
        if (!editor || !output) return;

        try {
            // 創建一個安全的執行環境
            const sandbox = new Function('return ' + editor.value)();
            
            // 模擬測試用例
            const testCases = [
                {input: "你好", expected: ["嗨！", "你好啊！", "很高興見到你"]},
                {input: "再見", expected: ["再見！", "期待下次見面", "祝您有愉快的一天"]}
            ];

            let results = [];
            for (const test of testCases) {
                const result = sandbox.respond(test.input);
                const passed = test.expected.includes(result);
                results.push({
                    input: test.input,
                    output: result,
                    passed
                });
            }

            // 顯示結果
            output.innerHTML = results.map(result => `
                <div class="test-case ${result.passed ? 'passed' : 'failed'}">
                    <div>輸入: "${result.input}"</div>
                    <div>輸出: "${result.output}"</div>
                    <div>狀態: ${result.passed ? '✓ 通過' : '✗ 未通過'}</div>
                </div>
            `).join('');

        } catch (error) {
            output.innerHTML = `<div class="error">錯誤: ${error.message}</div>`;
        }
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

    // 保存進度
    async saveProgress() {
        if (!this.currentExercise || !this.platform.userData) return;

        const progress = {
            exerciseId: this.currentExercise.id,
            completed: true,
            timestamp: new Date()
        };

        await this.practiceExercises.saveProgress(
            this.platform.userData.id,
            this.currentExercise.id,
            progress
        );
    }
}

// 導出練習管理器
window.PracticeManager = PracticeManager;
