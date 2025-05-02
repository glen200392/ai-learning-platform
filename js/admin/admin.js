class AdminPanel {
    constructor() {
        this.currentSection = 'content';
        this.currentPage = null;
        this.changes = {};
        this.mediaFiles = [];
        
        this.initializeEventListeners();
        this.loadContent();
    }

    initializeEventListeners() {
        // 導航切換
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // 內容編輯器事件
        this.initializeContentEditor();
        
        // 課程管理事件
        this.initializeCourseManager();
        
        // 媒體庫事件
        this.initializeMediaLibrary();
        
        // 設置保存
        this.initializeSettings();
    }

    switchSection(sectionId) {
        // 更新導航狀態
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // 更新內容區域
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionId}-section`).classList.add('active');
        
        this.currentSection = sectionId;
    }

    initializeContentEditor() {
        // 頁面切換
        document.querySelectorAll('.page-list li').forEach(page => {
            page.addEventListener('click', () => {
                this.switchPage(page.textContent);
            });
        });

        // 添加新頁面
        document.querySelector('.btn-add-page').addEventListener('click', () => {
            this.createNewPage();
        });

        // 內容編輯
        const editContent = document.querySelector('.edit-content');
        editContent.addEventListener('input', () => {
            this.changes[this.currentPage] = editContent.innerHTML;
        });

        // 保存更改
        document.querySelector('.btn-save').addEventListener('click', () => {
            this.saveChanges();
        });

        // 工具欄功能
        this.initializeEditorToolbar();
    }

    initializeEditorToolbar() {
        const toolbar = document.querySelector('.editor-toolbar');
        
        // 圖片上傳
        toolbar.querySelector('[title="上傳圖片"]').addEventListener('click', () => {
            this.showMediaUploader('image');
        });

        // 添加連結
        toolbar.querySelector('[title="添加連結"]').addEventListener('click', () => {
            this.showLinkDialog();
        });

        // 格式化
        toolbar.querySelector('[title="格式化"]').addEventListener('click', () => {
            this.formatContent();
        });
    }

    switchPage(pageName) {
        const pages = document.querySelectorAll('.page-list li');
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.textContent === pageName) {
                page.classList.add('active');
            }
        });

        // 更新編輯區域
        this.currentPage = pageName;
        document.querySelector('.page-title').value = pageName;
        this.loadPageContent(pageName);
    }

    async loadPageContent(pageName) {
        try {
            const response = await fetch(`/api/pages/${encodeURIComponent(pageName)}`);
            if (response.ok) {
                const content = await response.text();
                document.querySelector('.edit-content').innerHTML = content;
            }
        } catch (error) {
            console.error('載入頁面內容失敗:', error);
            alert('載入頁面內容時發生錯誤');
        }
    }

    async saveChanges() {
        try {
            for (const [page, content] of Object.entries(this.changes)) {
                const response = await fetch(`/api/pages/${encodeURIComponent(page)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content })
                });

                if (!response.ok) {
                    throw new Error(`保存 ${page} 失敗`);
                }
            }

            alert('更改已保存');
            this.changes = {};
        } catch (error) {
            console.error('保存更改失敗:', error);
            alert('保存更改時發生錯誤');
        }
    }

    initializeCourseManager() {
        // 課程過濾
        const filterSelect = document.querySelector('.filter-category');
        filterSelect.addEventListener('change', () => {
            this.filterCourses(filterSelect.value);
        });

        // 添加新課程
        document.querySelector('.btn-add-course').addEventListener('click', () => {
            this.showCourseDialog();
        });

        // 載入課程列表
        this.loadCourses();
    }

    async loadCourses() {
        try {
            const response = await fetch('/api/courses');
            if (response.ok) {
                const courses = await response.json();
                this.renderCourseGrid(courses);
            }
        } catch (error) {
            console.error('載入課程失敗:', error);
            alert('載入課程列表時發生錯誤');
        }
    }

    initializeMediaLibrary() {
        const uploadArea = document.querySelector('.upload-area');
        const fileInput = uploadArea.querySelector('input[type="file"]');

        // 拖放上傳
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });

        // 點擊上傳
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    async handleFileUpload(files) {
        try {
            const formData = new FormData();
            for (const file of files) {
                formData.append('files', file);
            }

            const response = await fetch('/api/media/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.updateMediaGrid(result.files);
                alert('文件上傳成功');
            }
        } catch (error) {
            console.error('上傳失敗:', error);
            alert('文件上傳時發生錯誤');
        }
    }

    initializeSettings() {
        const settingsForm = document.querySelector('.settings-form');
        const saveButton = document.querySelector('.btn-save-settings');

        saveButton.addEventListener('click', () => {
            const settings = {
                title: settingsForm.querySelector('input[type="text"]').value,
                description: settingsForm.querySelector('textarea').value,
                themeColor: settingsForm.querySelector('input[type="color"]').value
            };

            this.saveSettings(settings);
        });
    }

    async saveSettings(settings) {
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                alert('設置已保存');
            }
        } catch (error) {
            console.error('保存設置失敗:', error);
            alert('保存設置時發生錯誤');
        }
    }
}

// 初始化後台
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});