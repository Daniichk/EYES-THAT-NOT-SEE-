// Ждем полной загрузки DOM, чтобы кнопки и элементы были доступны
document.addEventListener('DOMContentLoaded', () => {
    
    // Проверка: загрузились ли данные
    console.log("System initialized. Press ESC to toggle.");

    window.addEventListener('keydown', (e) => {
        // Проверяем клавишу Escape (Esc)
        if (e.key === 'Escape' || e.keyCode === 27) {
            const gameUI = document.getElementById('game-ui');
            const mathUI = document.getElementById('math-ui');

            if (gameUI && mathUI) {
                // Переключаем видимость
                gameUI.classList.toggle('hidden');
                
                // Если игра открыта, меняем фон на темный, если нет - на белый (маскировка)
                if (!gameUI.classList.contains('hidden')) {
                    document.body.style.background = 'black';
                } else {
                    document.body.style.background = 'white';
                }
                
                // Отправляем событие в Vercel Analytics (если подключено)
                if (window.va) {
                    window.va('event', { name: 'toggle_game' });
                }
            } else {
                console.error("UI Elements not found! Check IDs in HTML.");
            }
        }
    });
});

// --- ИНИЦИАЛИЗАЦИЯ ДАННЫХ ---
let state = JSON.parse(localStorage.getItem('neu_v3')) || {
    cells: 0, auto: 0, mult: 1, prestige: 0, lastDaily: 0,
    currentSkin: '🫠', currentDim: 'cyber',
    items: { cursor: 0, eraser: 0, ruler: 0, prot: 0, ai: 0 },
    ownedSkins: ['🫠'], ownedDims: ['cyber']
};

const config = {
    items: {
        cursor: { n: 'Auto-Cursor', i: '🖱️', b: 15, p: 0.2 },
        eraser: { n: 'Eraser', i: '🧽', b: 100, p: 1.5 },
        ruler: { n: 'Ruler', i: '📏', b: 600, p: 8 },
        prot: { n: 'Protractor', i: '📐', b: 3000, p: 30 },
        ai: { n: 'AI Tutor', i: '🤖', b: 50000, p: 400 }
    },
    skins: [
        {id:'🫠', c:0}, {id:'👽', c:10000}, {id:'🤖', c:50000}, 
        {id:'👑', c:250000}, {id:'💎', c:1000000}
    ],
    dims: [
        {id:'cyber', n:'Cyber World', c:0, cls:'dim-cyber'},
        {id:'candy', n:'Candy Hell', c:50000, cls:'dim-candy'},
        {id:'void', n:'The Void', c:500000, cls:'dim-void'}
    ]
};

// --- УПРАВЛЕНИЕ UI ---
function updateUI() {
    const boost = 1 + (state.prestige * 0.25);
    document.getElementById('score').innerText = Math.floor(state.cells).toLocaleString();
    document.getElementById('bps').innerText = (state.auto * boost).toFixed(1);
    document.getElementById('big-brain').innerText = state.currentSkin;
    document.getElementById('pres-val').innerText = state.prestige;
    
    // Обновление мира
    const dim = config.dims.find(d => d.id === state.currentDim);
    document.getElementById('main-bg').className = 'click-area ' + dim.cls;
    document.getElementById('dim-label').innerText = dim.n.toUpperCase();

    // Сохранение
    localStorage.setItem('neu_v3', JSON.stringify(state));
    
    // Обновляем текущую открытую вкладку
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    renderTab(activeTab);
}

// Рендер контента вкладок
function renderTab(tabName) {
    const container = document.getElementById('tab-' + tabName);
    if (!container) return;
    let html = '';

    if (tabName === 'shop') {
        for (let id in config.items) {
            let p = Math.floor(config.items[id].b * Math.pow(1.15, state.items[id]));
            html += `
                <div class="item ${state.cells < p ? 'disabled' : ''}" onclick="buyItem('${id}')">
                    <b>${config.items[id].i} ${config.items[id].n} (x${state.items[id]})</b><br>
                    <small>Cost: ${p.toLocaleString()} | +${config.items[id].p}/s</small>
                </div>`;
        }
    } else if (tabName === 'skins') {
        config.skins.forEach(s => {
            const owned = state.ownedSkins.includes(s.id);
            html += `
                <div class="item ${!owned && state.cells < s.c ? 'disabled' : ''}" onclick="buySkin('${s.id}', ${s.c})">
                    <span style="font-size: 20px;">${s.id}</span>
                    <b>${owned ? (state.currentSkin === s.id ? 'ACTIVE' : 'EQUIP') : 'BUY: ' + s.c}</b>
                </div>`;
        });
    } else if (tabName === 'dims') {
        config.dims.forEach(d => {
            const owned = state.ownedDims.includes(d.id);
            html += `
                <div class="item ${!owned && state.cells < d.c ? 'disabled' : ''}" onclick="buyDim('${d.id}', ${d.c})">
                    <b>${d.n}</b><br>
                    <small>${owned ? (state.currentDim === d.id ? 'STAYING' : 'TRAVEL') : 'UNLOCK: ' + d.c}</small>
                </div>`;
        });
    }
    container.innerHTML = html;
}

// --- ЛОГИКА ПОКУПОК ---
function buyItem(id) {
    let p = Math.floor(config.items[id].b * Math.pow(1.15, state.items[id]));
    if (state.cells >= p) {
        state.cells -= p;
        state.items[id]++;
        state.auto += config.items[id].p;
        updateUI();
    }
}

function buySkin(id, cost) {
    if (state.ownedSkins.includes(id)) {
        state.currentSkin = id;
    } else if (state.cells >= cost) {
        state.cells -= cost;
        state.ownedSkins.push(id);
        state.currentSkin = id;
    }
    updateUI();
}

function buyDim(id, cost) {
    if (state.ownedDims.includes(id)) {
        state.currentDim = id;
    } else if (state.cells >= cost) {
        state.cells -= cost;
        state.ownedDims.push(id);
        state.currentDim = id;
    }
    updateUI();
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function claimDaily() {
    const now = Date.now();
    if (now - state.lastDaily > 86400000) {
        state.cells += 10000;
        state.lastDaily = now;
        alert("🎁 10,000 Neurons received!");
        updateUI();
    } else {
        alert("Wait " + Math.ceil((86400000 - (now - state.lastDaily)) / 3600000) + "h for next bonus!");
    }
}

// Переключение табов
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        if (btn.hasAttribute('onclick')) return; // Игнорим казино
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
        updateUI();
    };
});

// Клик и частицы
document.getElementById('big-brain').onclick = (e) => {
    const boost = 1 + (state.prestige * 0.25);
    state.cells += (state.mult * boost);
    createParticle(e.clientX, e.clientY);
    updateUI();
};

function createParticle(x, y) {
    const p = document.createElement('div');
    p.className = 'particle'; p.innerText = '+1';
    p.style.left = x + 'px'; p.style.top = y + 'px';
    p.style.setProperty('--x', (Math.random() - 0.5) * 100 + 'px');
    p.style.setProperty('--y', -(Math.random() * 100 + 50) + 'px');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 700);
}

// Авто-клик
setInterval(() => {
    if (state.auto > 0) {
        const boost = 1 + (state.prestige * 0.25);
        state.cells += (state.auto * boost) / 10;
        updateUI();
    }
}, 100);

// Запуск
updateUI();
