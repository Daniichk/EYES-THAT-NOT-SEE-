let state = JSON.parse(localStorage.getItem('neu_v2')) || {
    cells: 0, auto: 0, mult: 1, prestige: 0, lastDaily: 0,
    currentSkin: '🫠', currentDim: 'cyber',
    items: { cursor: 0, eraser: 0, ruler: 0, prot: 0, ai: 0 },
    ownedSkins: ['🫠'], ownedDims: ['cyber']
};

const config = {
    items: {
        cursor: { n: 'Auto-Cursor', i: '🖱️', b: 15, p: 0.2, d: 110 },
        eraser: { n: 'Eraser', i: '🧽', b: 100, p: 1.5, d: 150 },
        ruler: { n: 'Ruler', i: '📏', b: 600, p: 8, d: 190 },
        prot: { n: 'Protractor', i: '📐', b: 3000, p: 30, d: 230 },
        ai: { n: 'AI Tutor', i: '🤖', b: 50000, p: 400, d: 270 }
    },
    skins: [{id:'🫠',c:0},{id:'🤡',c:5000},{id:'👽',c:25000},{id:'🤖',c:100000}],
    dims: [{id:'cyber',n:'Cyber',c:0,cls:'dim-cyber'},{id:'candy',n:'Candy',c:50000,cls:'dim-candy'},{id:'void',n:'Void',c:200000,cls:'dim-void'}]
};

// Toggle ESC
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('game-ui').classList.toggle('hidden');
        document.body.style.background = document.getElementById('game-ui').classList.contains('hidden') ? '#fff' : 'black';
    }
});

// Click & Particles
document.getElementById('big-brain').addEventListener('click', (e) => {
    let b = 1 + (state.prestige * 0.25);
    state.cells += (state.mult * b);
    createParticle(e.clientX, e.clientY);
    updateUI();
});

function createParticle(x, y) {
    const p = document.createElement('div');
    p.className = 'particle'; p.innerText = '+1';
    p.style.left = x + 'px'; p.style.top = y + 'px';
    p.style.setProperty('--x', (Math.random() - 0.5) * 80 + 'px');
    p.style.setProperty('--y', -(Math.random() * 80 + 20) + 'px');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 700);
}

function updateUI() {
    let b = 1 + (state.prestige * 0.25);
    document.getElementById('score').innerText = Math.floor(state.cells).toLocaleString();
    document.getElementById('bps').innerText = (state.auto * b).toFixed(1);
    document.getElementById('big-brain').innerText = state.currentSkin;
    document.getElementById('pres-val').innerText = state.prestige;
    
    // Dim Update
    const dim = config.dims.find(d => d.id === state.currentDim);
    document.getElementById('main-bg').className = 'click-area ' + dim.cls;

    renderShop();
    localStorage.setItem('neu_v2', JSON.stringify(state));
}

function renderShop() {
    let html = '';
    for(let id in config.items) {
        let p = Math.floor(config.items[id].b * Math.pow(1.15, state.items[id]));
        html += `<div class="item ${state.cells < p ? 'disabled' : ''}" onclick="buyItem('${id}')">
            <b>${config.items[id].n} (x${state.items[id]})</b><br><small>Cost: ${p}</small>
        </div>`;
    }
    document.getElementById('tab-shop').innerHTML = html;
}

function buyItem(id) {
    let p = Math.floor(config.items[id].b * Math.pow(1.15, state.items[id]));
    if(state.cells >= p) {
        state.cells -= p; state.items[id]++; state.auto += config.items[id].p;
        updateUI();
    }
}

function claimDaily() {
    if(Date.now() - state.lastDaily > 86400000) {
        state.cells += 5000; state.lastDaily = Date.now(); updateUI();
    } else alert("Try again tomorrow!");
}

// Start auto-loop
setInterval(() => {
    if(state.auto > 0) {
        state.cells += (state.auto * (1 + state.prestige * 0.25)) / 10;
        updateUI();
    }
}, 100);

updateUI();
