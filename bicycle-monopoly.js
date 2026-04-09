document.addEventListener('DOMContentLoaded', () => {
    const scenarios = [
        { title: '大車內輪差', desc: '大型車輛右轉時，後輪會向內偏，產生巨大的死角危機。請保持絕對的安全距離！' },
        { title: '無聲接近者', desc: '電動車或 Ubike 從後方安靜靠近。隨時注意環境音，不要戴耳機騎車。' },
        { title: '違停路障', desc: '前方有違停車輛！切勿直接切入快車道，應先確認後方車流並示意後再繞行。' },
        { title: '行穿線兩難', desc: '在斑馬線上，若要與行人共用，建議下車牽行以策安全。' },
        { title: '混合車流壓力', desc: '與汽機車共用狹窄巷道時，不要與車爭道，選擇相對安全的位置行駛。' },
        { title: '雨天視線不佳', desc: '雨天或黃昏視線模糊。穿著鮮豔雨衣及開啟車燈是生存關鍵。' },
        { title: '開門殺', desc: '路邊車輛可能突然開啟車門！騎乘時與路邊停放車輛保持一個車門以上的距離。' },
        { title: '坑洞與反光鏡', desc: '注意道路毀損或缺乏視角補償的轉角，利用反光鏡確認對向來車。' },
        { title: '人車爭道', desc: '在狹窄人行道上請減速慢行，禮讓行人是騎士的高尚美德。' },
        { title: '路口鬼探頭', desc: '巷口可能突然竄出人車。經過任何路口都要減速，準備好隨時剎車。' }
    ];

    const superpowers = [
        { name: '心靈感應', trans: '眼神交流', detail: '確認對方看到你。' },
        { name: '隱形斗篷', trans: '反光配件與車燈', detail: '拒絕成為透明人。' },
        { name: '超級大聲公', trans: '溫柔招呼', detail: '超車時輕聲提醒。' },
        { name: '全知之眼', trans: '加裝後照鏡', detail: '掌握後方車流。' },
        { name: '防護罩', trans: '正確配戴安全帽', detail: '保護關鍵部位。' },
        { name: '時空凍結', trans: '路口停看聽', detail: '預判風險後再通過。' },
        { name: '預知未來', trans: '打信號手勢', detail: '提早讓別人知道你的動向。' },
        { name: '聲納雷達', trans: '不戴耳機騎車', detail: '用耳朵聆聽環境音。' },
        { name: '重力控制', trans: '平穩減速', detail: '不緊急煞車造成後車追撞。' },
        { name: '英雄勳章', trans: '禮讓老人與小孩', detail: '展現高素養。' },
        { name: '雷射指引', trans: '保持安全間距', detail: '不貼車行駛。' },
        { name: '環境融合', trans: '順向行駛', detail: '不逆向操作。' }
    ];

    const boardGrid = document.getElementById('board-grid');
    const powerDeck = document.getElementById('power-deck');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.getElementById('close-modal');
    const rollBtn = document.getElementById('roll-btn');
    const diceEl = document.getElementById('dice');
    const gameStatus = document.getElementById('game-status');
    const playerPiece = document.getElementById('player-piece');
    const centerInfoBox = document.getElementById('center-info-box');
    const diceUI = document.getElementById('dice-ui');
    const centerTitle = document.getElementById('center-title');
    const centerDesc = document.getElementById('center-desc');

    let currentPos = 0;
    let isMoving = false;

    // Perimeter mapping for 5x5 grid (row, col) - 1-indexed
    const cellMap = [
        [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 5], [3, 5], [4, 5], [5, 5],
        [5, 4], [5, 3], [5, 2], [5, 1],
        [4, 1], [3, 1], [2, 1]
    ];

    const tiles = [];

    // 1. Initialize Board
    function initBoard() {
        // Prepare 16 tiles (Start + 15 scenarios repeated)
        const fullScenarios = [{ title: '🚩 START', desc: '安全起點：檢查自已的配備，準備出發！' }];
        
        // Fill the rest with scenarios (shuffled)
        const pool = [...scenarios, ...scenarios].sort(() => Math.random() - 0.5);
        for (let i = 0; i < 15; i++) {
            fullScenarios.push(pool[i]);
        }
        
        cellMap.forEach((pos, index) => {
            const tileEl = document.createElement('div');
            tileEl.className = 'tile hidden-tile'; // Start hidden
            tileEl.style.gridRow = pos[0];
            tileEl.style.gridColumn = pos[1];
            
            const data = fullScenarios[index];
            tileEl.innerHTML = `<div class="tile-inner">${data.title}</div>`;
            
            boardGrid.appendChild(tileEl);
            tiles.push({ el: tileEl, data: data });
        });

        // Set initial player position
        updatePlayerUI();
        // Start tile is always revealed and special
        tiles[0].el.classList.add('special');
        revealTile(0);
    }

    function updatePlayerUI() {
        const targetPos = cellMap[currentPos];
        // 5x5 grid, each cell is 20%
        playerPiece.style.top = `${(targetPos[0] - 1) * 20}%`;
        playerPiece.style.left = `${(targetPos[1] - 1) * 20}%`;
    }

    function revealTile(index) {
        tiles[index].el.classList.remove('hidden-tile');
    }

    // 2. Dice Rolling
    rollBtn.addEventListener('click', () => {
        if (isMoving) return;
        
        // Hide previous info box when starting a new roll
        centerInfoBox.classList.add('hidden');
        diceUI.classList.remove('hidden');
        
        rollBtn.disabled = true;
        const roll = Math.floor(Math.random() * 6) + 1;
        animateDice(roll);
        
        setTimeout(() => {
            movePlayer(roll);
        }, 600);
    });

    function animateDice(value) {
        diceEl.style.transform = 'rotate(360deg) scale(1.2)';
        setTimeout(() => {
            diceEl.style.transform = 'rotate(0deg) scale(1)';
            diceEl.innerHTML = `<span style="font-size:2rem; font-weight:bold; color:black;">${value}</span>`;
        }, 300);
    }

    async function movePlayer(steps) {
        isMoving = true;
        gameStatus.innerText = `向前前進 ${steps} 格...`;
        
        for (let i = 0; i < steps; i++) {
            // Hide previous tile (optional, but keep START revealed if index 0)
            if (currentPos !== 0) {
                hideTile(currentPos);
            }
            
            currentPos = (currentPos + 1) % 16;
            updatePlayerUI();
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        landOnTile();
    }

    function hideTile(index) {
        if (index === 0) return; // Keep START visible for orientation
        tiles[index].el.classList.add('hidden-tile');
    }

    function landOnTile() {
        revealTile(currentPos);
        const data = tiles[currentPos].data;
        gameStatus.innerText = `抵達：${data.title}！`;
        
        setTimeout(() => {
            showCenterInfo(data);
            isMoving = false;
            rollBtn.disabled = false;
        }, 300);
    }

    function showCenterInfo(data) {
        if (currentPos === 0) {
            // START tile doesn't need to obscure the dice necessarily, or just show start info
            centerTitle.innerText = "🚩 起點";
            centerDesc.innerText = "檢查自已的配備，準備出發！";
        } else {
            centerTitle.innerText = data.title;
            centerDesc.innerText = data.desc;
        }
        
        diceUI.classList.add('hidden');
        centerInfoBox.classList.remove('hidden');
    }

    // 3. Superpowers
    function initSuperpowers() {
        superpowers.forEach((power, index) => {
            const card = document.createElement('div');
            card.className = 'power-card';
            const num = (index + 1).toString().padStart(2, '0');
            card.innerHTML = `
                <div class="power-card-inner">
                    <div class="power-card-front">
                        <span>🔮</span>
                        <span class="power-name">秘法：尚未解鎖</span>
                        <div class="power-number">${num}</div>
                    </div>
                    <div class="power-card-back">
                        <h3 style="color:var(--accent-secondary); margin-bottom:10px;">${power.name}</h3>
                        <span class="translation-label">禮儀轉譯</span>
                        <div class="translation-content">${power.trans}</div>
                        <p style="font-size: 0.8rem; margin-top:5px; opacity:0.8;">${power.detail}</p>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
            });
            powerDeck.appendChild(card);
        });
    }

    // 4. Identities
    function initIdentities() {
        const cards = document.querySelectorAll('.identity-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('hidden-identity');
            });
        });
    }

    function showModal(data) {
        modalBody.innerHTML = `
            <h2 class="modal-scenario-title">${data.title}</h2>
            <p class="modal-scenario-desc">${data.desc}</p>
        `;
        modalOverlay.classList.remove('hidden');
    }

    closeModal.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
        }
    });

    initBoard();
    initSuperpowers();
    initIdentities();
});
