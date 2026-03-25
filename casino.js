let curBet = 0;
let tMult = 1.0;
let isSpinning = false;

function toggleCasino(show) {
    document.getElementById('casino-overlay').classList.toggle('hidden', !show);
    if(show) enterGame('lobby');
}

function setBet(pct) {
    document.getElementById('bet-val').value = Math.floor(state.cells * pct);
}

function enterGame(g) {
    if(isSpinning) return;
    
    // Скрываем всё
    ['cas-lobby','cas-tower','cas-roulette','cas-bj'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });

    if(g === 'lobby') {
        document.getElementById('cas-lobby').classList.remove('hidden');
        return;
    }

    let b = parseInt(document.getElementById('bet-val').value);
    if(b > 0 && b <= state.cells) {
        state.cells -= b;
        curBet = b;
        document.getElementById('cas-' + g).classList.remove('hidden');
        if(g === 'tower') initTower();
        if(g === 'roulette') initRoulette();
        if(g === 'bj') initBJ();
    } else {
        alert("Invalid bet!");
        enterGame('lobby');
    }
    updateUI();
}

// --- TOWER ---
function initTower() {
    tMult = 1.0;
    document.getElementById('t-mult').innerText = 'x1.0';
    document.getElementById('t-visual').innerHTML = '';
}

function towerBuild() {
    if(Math.random() > 0.25) {
        tMult += 0.5;
        document.getElementById('t-mult').innerText = 'x' + tMult.toFixed(1);
        const b = document.createElement('div');
        b.className = 'tower-block';
        document.getElementById('t-visual').appendChild(b);
    } else {
        alert("CRASHED!");
        toggleCasino(false);
    }
}

function towerCashOut() {
    state.cells += Math.floor(curBet * tMult);
    toggleCasino(false);
    updateUI();
}

// --- ROULETTE ---
const rCols = ['green','red','black','red','black','red','black','red','black','red','black','red','black','red','black'];
function initRoulette() {
    const track = document.getElementById('r-track');
    track.innerHTML = '';
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    for(let i=0; i<60; i++) {
        rCols.forEach(c => {
            const s = document.createElement('div');
            s.className = `r-slot r-${c}`;
            track.appendChild(s);
        });
    }
}

function spinR(choice) {
    if(isSpinning) return;
    isSpinning = true;
    const track = document.getElementById('r-track');
    const target = Math.floor(Math.random() * 15) + 600;
    const win = rCols[target % 15];
    
    track.style.transition = 'transform 4s cubic-bezier(0.1, 0, 0.1, 1)';
    track.style.transform = `translateX(-${target * 60 - 200}px)`;

    setTimeout(() => {
        isSpinning = false;
        if(choice === win) {
            state.cells += (win === 'green' ? curBet * 14 : curBet * 2);
        }
        toggleCasino(false);
        updateUI();
    }, 4500);
}

// --- BLACKJACK ---
let pHand = [], dHand = [], deck = [];
function initBJ() {
    deck = []; for(let i=0; i<4; i++) for(let v=2; v<=11; v++) deck.push(v > 10 ? 10 : v);
    deck.sort(() => Math.random() - 0.5);
    pHand = [deck.pop(), deck.pop()];
    dHand = [deck.pop(), deck.pop()];
    renderBJ(false);
}

function renderBJ(rev) {
    document.getElementById('bj-p-cards').innerHTML = pHand.map(c => `<div class="bj-card">${c}</div>`).join('');
    document.getElementById('bj-p-score').innerText = getScore(pHand);
    document.getElementById('bj-d-cards').innerHTML = rev ? dHand.map(c => `<div class="bj-card">${c}</div>`).join('') : `<div class="bj-card">${dHand[0]}</div><div class="bj-card">?</div>`;
}

function getScore(h) {
    let s = h.reduce((a,b) => a+b, 0);
    if(s > 21 && h.includes(11)) s -= 10;
    return s;
}

function bjAction(a) {
    if(a === 'hit') {
        pHand.push(deck.pop());
        renderBJ(false);
        if(getScore(pHand) > 21) { alert("BUST!"); toggleCasino(false); updateUI(); }
    } else {
        while(getScore(dHand) < 17) dHand.push(deck.pop());
        renderBJ(true);
        let ps = getScore(pHand), ds = getScore(dHand);
        if(ds > 21 || ps > ds) state.cells += curBet * 2;
        else if(ps === ds) state.cells += curBet;
        toggleCasino(false);
        updateUI();
    }
}
