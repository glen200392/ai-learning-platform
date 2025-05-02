class AdminAuth {
    constructor() {
        this.isAuthenticated = false;
        this.adminConfig = {
            username: 'admin',  // 預設管理員帳號
            password: 'admin'   // 預設管理員密碼
        };
        
        // 檢查是否已有自定義設定
        this.loadConfig();
    }

    loadConfig() {
        const savedConfig = localStorage.getItem('adminConfig');
        if (savedConfig) {
            this.adminConfig = JSON.parse(savedConfig);
        }
    }

    saveConfig(username, password) {
        this.adminConfig = { username, password };
        localStorage.setItem('adminConfig', JSON.stringify(this.adminConfig));
    }

    login(username, password) {
        if (username === this.adminConfig.username && 
            password === this.adminConfig.password) {
            this.isAuthenticated = true;
            sessionStorage.setItem('adminAuthenticated', 'true');
            return true;
        }
        return false;
    }

    logout() {
        this.isAuthenticated = false;
        sessionStorage.removeItem('adminAuthenticated');
    }

    checkAuth() {
        return sessionStorage.getItem('adminAuthenticated') === 'true';
    }

    showLoginForm() {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="login-overlay">
                <div class="login-form">
                    <h2>管理員登入</h2>
                    <form id="admin-login-form">
                        <div class="form-group">
                            <label>帳號</label>
                            <input type="text" id="username" required>
                        </div>
                        <div class="form-group">
                            <label>密碼</label>
                            <input type="password" id="password" required>
                        </div>
                        <button type="submit">登入</button>
                        <button type="button" id="setup-admin">首次設置</button>
                    </form>
                </div>
            </div>
        `);

        // 登入表單處理
        document.getElementById('admin-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (this.login(username, password)) {
                document.querySelector('.login-overlay').remove();
                window.location.reload();
            } else {
                alert('帳號或密碼錯誤');
            }
        });

        // 首次設置處理
        document.getElementById('setup-admin').addEventListener('click', () => {
            this.showSetupForm();
        });
    }

    showSetupForm() {
        const loginForm = document.querySelector('.login-form');
        loginForm.innerHTML = `
            <h2>設置管理員帳號</h2>
            <form id="admin-setup-form">
                <div class="form-group">
                    <label>設置帳號</label>
                    <input type="text" id="new-username" required>
                </div>
                <div class="form-group">
                    <label>設置密碼</label>
                    <input type="password" id="new-password" required>
                </div>
                <div class="form-group">
                    <label>確認密碼</label>
                    <input type="password" id="confirm-password" required>
                </div>
                <button type="submit">確認設置</button>
            </form>
        `;

        document.getElementById('admin-setup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('new-username').value;
            const password = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert('兩次輸入的密碼不一致');
                return;
            }

            this.saveConfig(username, password);
            alert('管理員帳號設置成功，請重新登入');
            window.location.reload();
        });
    }
}

// 初始化驗證系統
document.addEventListener('DOMContentLoaded', () => {
    const auth = new AdminAuth();
    
    // 如果未登入，顯示登入表單
    if (!auth.checkAuth()) {
        auth.showLoginForm();
    }

    // 登出按鈕處理
    document.querySelector('.btn-logout')?.addEventListener('click', () => {
        auth.logout();
        window.location.reload();
    });
});