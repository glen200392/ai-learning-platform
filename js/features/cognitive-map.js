class CognitiveMap {
    constructor(platform) {
        this.platform = platform;
        this.container = null;
        this.currentMap = null;
        this.connections = [];
        
        // 認知概念關聯定義
        this.conceptMaps = {
            'brain-learning': {
                core: '大腦學習機制',
                concepts: [
                    {
                        id: 'cognitive-load',
                        title: '認知負荷',
                        description: '大腦處理信息的容量限制',
                        connections: ['memory', 'attention']
                    },
                    {
                        id: 'memory',
                        title: '記憶系統',
                        description: '工作記憶與長期記憶的互動',
                        connections: ['attention', 'learning']
                    },
                    {
                        id: 'attention',
                        title: '注意力機制',
                        description: '信息過濾與選擇性處理',
                        connections: ['learning']
                    },
                    {
                        id: 'learning',
                        title: '學習過程',
                        description: '知識獲取與整合機制',
                        connections: ['cognitive-load']
                    }
                ]
            },
            'thinking-patterns': {
                core: '思維模式',
                concepts: [
                    {
                        id: 'systems-thinking',
                        title: '系統思維',
                        description: '整體視角與關係分析',
                        connections: ['decision-making', 'creative-thinking']
                    },
                    {
                        id: 'decision-making',
                        title: '決策框架',
                        description: '結構化問題解決方法',
                        connections: ['creative-thinking']
                    },
                    {
                        id: 'creative-thinking',
                        title: '創造性思考',
                        description: '突破常規的思維方式',
                        connections: ['systems-thinking']
                    },
                    {
                        id: 'meta-cognition',
                        title: '元認知',
                        description: '思考的思考',
                        connections: ['systems-thinking', 'decision-making']
                    }
                ]
            },
            'ai-cognition': {
                core: 'AI與認知',
                concepts: [
                    {
                        id: 'human-cognition',
                        title: '人類認知',
                        description: '人類思維與決策過程',
                        connections: ['ai-principles', 'collaboration']
                    },
                    {
                        id: 'ai-principles',
                        title: 'AI原理',
                        description: 'AI系統的運作機制',
                        connections: ['collaboration']
                    },
                    {
                        id: 'collaboration',
                        title: '人機協作',
                        description: '優勢互補與協同工作',
                        connections: ['human-cognition']
                    },
                    {
                        id: 'future-integration',
                        title: '未來整合',
                        description: '認知增強與共同演化',
                        connections: ['human-cognition', 'ai-principles']
                    }
                ]
            }
        };
    }

    initialize(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('找不到認知地圖容器');
            return;
        }

        this.createMapControls();
        this.loadMap('brain-learning'); // 默認加載大腦學習地圖
    }

    createMapControls() {
        const controls = document.createElement('div');
        controls.className = 'map-controls';
        controls.innerHTML = `
            <div class="map-selector">
                <button data-map="brain-learning" class="active">大腦學習機制</button>
                <button data-map="thinking-patterns">思維模式</button>
                <button data-map="ai-cognition">AI與認知</button>
            </div>
            <div class="view-controls">
                <button class="zoom-in"><i class="fas fa-plus"></i></button>
                <button class="zoom-out"><i class="fas fa-minus"></i></button>
                <button class="reset"><i class="fas fa-redo"></i></button>
            </div>
        `;

        controls.querySelectorAll('.map-selector button').forEach(button => {
            button.addEventListener('click', (e) => {
                controls.querySelectorAll('.map-selector button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadMap(e.target.dataset.map);
            });
        });

        this.container.appendChild(controls);
    }

    loadMap(mapId) {
        const mapData = this.conceptMaps[mapId];
        if (!mapData) return;

        this.currentMap = mapId;
        this.container.querySelector('.concept-map')?.remove();

        const mapContainer = document.createElement('div');
        mapContainer.className = 'concept-map';
        
        // 創建核心概念
        const core = document.createElement('div');
        core.className = 'concept core';
        core.innerHTML = `
            <div class="concept-content">
                <h3>${mapData.core}</h3>
            </div>
        `;
        mapContainer.appendChild(core);

        // 創建相關概念
        mapData.concepts.forEach((concept, index) => {
            const angle = (2 * Math.PI * index) / mapData.concepts.length;
            const conceptElement = document.createElement('div');
            conceptElement.className = 'concept';
            conceptElement.setAttribute('data-id', concept.id);
            conceptElement.style.transform = `rotate(${angle}rad) translate(200px) rotate(${-angle}rad)`;
            
            conceptElement.innerHTML = `
                <div class="concept-content">
                    <h4>${concept.title}</h4>
                    <p>${concept.description}</p>
                </div>
            `;
            
            mapContainer.appendChild(conceptElement);
            this.drawConnections(concept, mapContainer);
        });

        this.container.appendChild(mapContainer);
        this.initializeInteractions();
    }

    drawConnections(concept, container) {
        concept.connections.forEach(targetId => {
            const connection = document.createElement('div');
            connection.className = 'connection';
            connection.setAttribute('data-from', concept.id);
            connection.setAttribute('data-to', targetId);
            container.appendChild(connection);
            this.connections.push(connection);
        });
    }

    initializeInteractions() {
        const concepts = this.container.querySelectorAll('.concept');
        
        concepts.forEach(concept => {
            concept.addEventListener('mouseenter', () => {
                const id = concept.getAttribute('data-id');
                if (!id) return;
                
                // 高亮相關概念
                this.connections.forEach(conn => {
                    if (conn.getAttribute('data-from') === id || conn.getAttribute('data-to') === id) {
                        conn.classList.add('active');
                        const targetId = conn.getAttribute('data-from') === id ? 
                            conn.getAttribute('data-to') : conn.getAttribute('data-from');
                        this.container.querySelector(`[data-id="${targetId}"]`)?.classList.add('connected');
                    }
                });
            });

            concept.addEventListener('mouseleave', () => {
                this.connections.forEach(conn => conn.classList.remove('active'));
                concepts.forEach(c => c.classList.remove('connected'));
            });

            concept.addEventListener('click', () => {
                const id = concept.getAttribute('data-id');
                if (!id) return;
                this.showConceptDetails(id);
            });
        });
    }

    showConceptDetails(conceptId) {
        const mapData = this.conceptMaps[this.currentMap];
        const concept = mapData.concepts.find(c => c.id === conceptId);
        if (!concept) return;

        const modal = document.createElement('div');
        modal.className = 'concept-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${concept.title}</h2>
                <p class="description">${concept.description}</p>
                <div class="learning-resources">
                    <h3>學習資源</h3>
                    <ul>
                        ${this.getConceptResources(conceptId)}
                    </ul>
                </div>
                <div class="practice-exercises">
                    <h3>相關練習</h3>
                    <ul>
                        ${this.getConceptExercises(conceptId)}
                    </ul>
                </div>
                <button class="close-modal">關閉</button>
            </div>
        `;

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        this.container.appendChild(modal);
    }

    getConceptResources(conceptId) {
        // 這裡可以根據概念ID返回相關的學習資源
        return `
            <li>
                <a href="#" class="resource">
                    <i class="fas fa-book"></i>
                    <span>深入理解概念</span>
                </a>
            </li>
            <li>
                <a href="#" class="resource">
                    <i class="fas fa-video"></i>
                    <span>視頻教程</span>
                </a>
            </li>
        `;
    }

    getConceptExercises(conceptId) {
        // 這裡可以根據概念ID返回相關的練習
        return `
            <li>
                <a href="#" class="exercise">
                    <i class="fas fa-tasks"></i>
                    <span>實踐練習</span>
                </a>
            </li>
            <li>
                <a href="#" class="exercise">
                    <i class="fas fa-brain"></i>
                    <span>思維訓練</span>
                </a>
            </li>
        `;
    }
}

// 導出認知地圖模組
window.CognitiveMap = CognitiveMap;