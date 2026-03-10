const UIManager = {
    init() { this.initBackground(); this.updateCurrencyUI(); this.applyAvatarSkin(); this.initCheckinButton(); document.getElementById('profile-nickname-display').innerText = GameState.nickname; this.updateIdleUI(); },
    triggerHaptic() { if(window.navigator && window.navigator.vibrate) window.navigator.vibrate(40); },
    triggerHeavyHaptic() { if(window.navigator && window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]); },
    showToast(m) { const t = document.getElementById('toast'); t.innerText = m; t.style.opacity = '1'; setTimeout(() => t.style.opacity = '0', 2500); },
    
    navTo(s, el) {
        if (GameState.isBattling) { this.showToast("⚔️ 전투 중에는 이동할 수 없습니다!"); return; }
        AudioEngine.sfx.click(); this.triggerHaptic();
        document.querySelectorAll('.screen').forEach(sc => sc.classList.remove('active'));
        document.getElementById(s).classList.add('active'); window.scrollTo(0,0);
        if(el) { document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); el.classList.add('active'); }
        if(s === 'screen-arena') this.updateRpgLobbyUI();
        if(s === 'screen-profile') { this.renderInventory(); document.getElementById('profile-nickname-display').innerText = GameState.nickname; }
        if(s === 'screen-ranking') GameSystem.Ranking.loadRanking();
        if(s === 'screen-home') this.updateIdleUI();
    },
    
    switchTab(t) {
        AudioEngine.sfx.click(); this.triggerHaptic();
        document.getElementById('panel-forge').classList.add('hidden'); document.getElementById('panel-shop').classList.add('hidden');
        document.getElementById(`panel-${t}`).classList.remove('hidden');
        document.getElementById('tab-forge').className = t === 'forge' ? "py-2 bg-slate-700 text-white font-bold rounded-lg text-sm border border-slate-500" : "py-2 bg-slate-800 text-slate-400 font-bold rounded-lg text-sm border border-slate-700";
        document.getElementById('tab-shop').className = t === 'shop' ? "py-2 bg-slate-700 text-white font-bold rounded-lg text-sm border border-slate-500" : "py-2 bg-slate-800 text-slate-400 font-bold rounded-lg text-sm border border-slate-700";
    },
    
    switchInvTab(t) {
        AudioEngine.sfx.click(); this.triggerHaptic();
        document.getElementById('inv-panel-gear').classList.add('hidden'); document.getElementById('inv-panel-skin').classList.add('hidden');
        document.getElementById(`inv-panel-${t}`).classList.remove('hidden');
        document.getElementById('inv-tab-gear').className = t === 'gear' ? "py-2 bg-slate-700 text-white font-bold rounded-lg text-sm border border-slate-500" : "py-2 bg-slate-800 text-slate-400 font-bold rounded-lg text-sm border border-slate-700";
        document.getElementById('inv-tab-skin').className = t === 'skin' ? "py-2 bg-slate-700 text-white font-bold rounded-lg text-sm border border-slate-500" : "py-2 bg-slate-800 text-slate-400 font-bold rounded-lg text-sm border border-slate-700";
    },
    
    updateCurrencyUI() {
        document.getElementById('gold-display').innerText = Math.min(GameState.gold, 999999).toLocaleString();
        document.getElementById('gem-display').innerText = Math.min(GameState.gem, 999999).toLocaleString();
    },

    updateIdleUI() {
        const display = document.getElementById('idle-amount-display');
        if (display) {
            const amount = Math.floor(GameState.pendingIdleGold);
            display.innerText = `${amount} / 100 G`;
            if (amount >= 100) display.className = "text-sm font-black text-yellow-400";
            else display.className = "text-sm font-black text-slate-400";
        }
    },
    
    initCheckinButton() { 
        if(GameState.lastCheckIn === new Date().toDateString()) {
            const btn = document.getElementById('btn-checkin');
            if(btn) btn.innerHTML = '<span>✅</span> 내일 다시 오세요'; 
        }
    },
    
    updateRpgLobbyUI() {
        const stats = GameState.getTotalStats(); 
        document.getElementById('rpg-stage-display').innerText = GameState.rpgStage;
        document.getElementById('lobby-hp-text').innerText = `${Math.max(0, GameState.currentHp)} / ${stats.hp}`;
        document.getElementById('lobby-hp-bar').style.width = (GameState.currentHp / stats.hp * 100) + "%";
        document.getElementById('stat-atk-display').innerText = GameState.rpgAtk;
        document.getElementById('stat-hp-display').innerText = GameState.rpgMaxHp;
        document.getElementById('cost-atk-display').innerText = GameSystem.Lobby.getUpgradeCost('atk').toLocaleString();
        document.getElementById('cost-hp-display').innerText = GameSystem.Lobby.getUpgradeCost('hp').toLocaleString();
        document.getElementById('potion-count-display').innerText = GameState.potions;
    },
    
    applyAvatarSkin() {
        const skin = GameState.equippedSkin;
        const avatars = document.querySelectorAll('.master-avatar');
        avatars.forEach(a => {
            a.className = "master-avatar rounded-full flex items-center justify-center font-black text-white shadow-md transition-all " + (a.id === 'profile-big-icon' ? 'w-20 h-20 text-3xl' : 'w-8 h-8 text-sm');
            if(skin && GameData.items[skin]) a.classList.add('skin-' + GameData.items[skin].rarity);
            else a.classList.add('bg-gradient-to-tr', 'from-slate-600', 'to-slate-400');
        });
    },
    
    renderInventory() {
        const pGear = document.getElementById('inv-panel-gear'); const pSkin = document.getElementById('inv-panel-skin');
        const emptyState = document.getElementById('inv-empty-state');
        pGear.innerHTML = ''; pSkin.innerHTML = '';
        let hasGear = false; let hasSkin = false;
        const counts = {}; GameState.inventory.forEach(i => counts[i] = (counts[i] || 0) + 1);
        for(const [id, count] of Object.entries(counts)) {
            const item = GameData.items[id]; if(!item) continue;
            const isEquipped = GameState.equippedGear === id || GameState.equippedSkin === id;
            const synthBtn = (count >= 3 && item.rarity !== 'legendary') ? `<button onclick="event.stopPropagation(); GameSystem.Lobby.synthesizeItem('${id}')" class="mt-2 bg-indigo-600 text-white text-[10px] py-1 px-2 rounded w-full">✨ 3개 합성</button>` : '';
            const card = `<div onclick="GameSystem.Lobby.toggleEquip('${id}')" class="item-card rarity-${item.rarity} ${isEquipped ? 'equipped' : ''} p-2 relative">${isEquipped ? '<div class="item-equipped-badge">E</div>':''}<div class="text-3xl">${item.emoji}</div><h4 class="text-[10px] text-white font-bold">${item.name}</h4>${synthBtn}<div class="absolute bottom-1 right-2 text-[10px] text-slate-500">x${count}</div></div>`;
            if(item.type === 'gear') { pGear.innerHTML += card; hasGear = true; } else { pSkin.innerHTML += card; hasSkin = true; }
        }
        if(!hasGear && !hasSkin) emptyState.classList.remove('hidden'); else emptyState.classList.add('hidden');
        const stats = GameState.getTotalStats(); document.getElementById('profile-total-power').innerText = stats.atk; document.getElementById('profile-total-hp').innerText = stats.hp;
    },
    
    initBackground() { 
        const canvas = document.getElementById('dynamic-bg'); if(!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height; let particles = [];
        const resizeBg = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
        window.addEventListener('resize', resizeBg); resizeBg();
        for(let i=0; i<30; i++) particles.push({ x: Math.random()*width, y: Math.random()*height, vy: Math.random()*0.5+0.2 });
        const draw = () => {
            ctx.clearRect(0,0,width,height); ctx.fillStyle = "rgba(168,85,247,0.2)";
            particles.forEach(p => { p.y -= p.vy; if(p.y < -10) p.y = height+10; ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI*2); ctx.fill(); });
            requestAnimationFrame(draw);
        }; draw();
    }
};

const GameSystem = {
    Lobby: {
        claimDailyReward() {
            if (GameState.lastCheckIn === new Date().toDateString()) return UIManager.showToast("이미 받았습니다!");
            GameState.gold += 100; GameState.lastCheckIn = new Date().toDateString(); GameState.save();
            UIManager.updateCurrencyUI(); UIManager.initCheckinButton(); AudioEngine.sfx.coin();
        },
        claimIdleReward() {
            const reward = Math.floor(GameState.pendingIdleGold);
            if (reward < 1) return UIManager.showToast("보상이 부족합니다!");
            GameState.gold += reward; GameState.pendingIdleGold = 0; GameState.save();
            UIManager.updateCurrencyUI(); UIManager.updateIdleUI(); AudioEngine.sfx.coin();
            alert(`🪙 오프라인 보상 ${reward}G 획득!`);
        },
        rewardForPlay() { GameState.gold += 10; GameState.save(); UIManager.updateCurrencyUI(); AudioEngine.sfx.coin(); },
        getUpgradeCost(t) { return t === 'atk' ? Math.floor(GameState.rpgAtk * 5) : Math.floor(GameState.rpgMaxHp * 0.5); },
        upgradeStat(t) {
            const cost = this.getUpgradeCost(t); if(GameState.gold < cost) return UIManager.showToast("골드 부족!");
            GameState.gold -= cost; if(t==='atk') GameState.rpgAtk += 5; else GameState.rpgMaxHp += 20;
            GameState.save(); UIManager.updateCurrencyUI(); UIManager.updateRpgLobbyUI(); AudioEngine.sfx.coin();
        },
        buyItem(t) {
            if(t==='potion') { if(GameState.gold < 30) return; GameState.gold -= 30; GameState.potions++; }
            else { if(GameState.gold < 20) return; GameState.gold -= 20; GameState.currentHp = GameState.getTotalStats().hp; }
            GameState.save(); UIManager.updateCurrencyUI(); UIManager.updateRpgLobbyUI(); AudioEngine.sfx.coin();
        },
        toggleEquip(id) {
            const item = GameData.items[id]; 
            if(item.type === 'gear') GameState.equippedGear = GameState.equippedGear === id ? null : id;
            else GameState.equippedSkin = GameState.equippedSkin === id ? null : id;
            GameState.save(); UIManager.renderInventory(); UIManager.applyAvatarSkin(); UIManager.updateRpgLobbyUI(); AudioEngine.sfx.equip();
        },
        synthesizeItem(id) {
            const item = GameData.items[id];
            let count = GameState.inventory.filter(i => i === id).length;
            if (count < 3) return;
            let removed = 0; GameState.inventory = GameState.inventory.filter(i => { if(i===id && removed < 3){removed++; return false;} return true; });
            const tiers = ['common', 'rare', 'epic', 'legendary'];
            const nextRarity = tiers[tiers.indexOf(item.rarity) + 1];
            const pool = Object.values(GameData.items).filter(it => it.rarity === nextRarity && it.type === item.type);
            const result = pool[Math.floor(Math.random()*pool.length)];
            GameState.inventory.push(result.id); GameState.save(); UIManager.renderInventory();
            alert(`✨ 합성 성공! [${result.name}] 획득!`);
        }
    },
    Gacha: {
        performGacha(times) {
            const cost = times * 50; if(GameState.gem < cost) return UIManager.showToast("젬 부족!");
            GameState.gem -= cost; GameState.save(); UIManager.updateCurrencyUI();
            const over = document.getElementById('gacha-overlay'); const resBox = document.getElementById('gacha-results-container');
            over.classList.add('active'); resBox.classList.add('hidden'); resBox.innerHTML = '';
            AudioEngine.sfx.gacha_build();
            setTimeout(() => {
                AudioEngine.sfx.gacha_reveal(); resBox.classList.remove('hidden'); document.getElementById('gacha-close-btn').classList.remove('hidden');
                document.getElementById('gacha-animation').classList.add('hidden');
                for(let i=0; i<times; i++) {
                    const roll = Math.random(); let rarity = roll < 0.05 ? 'legendary' : roll < 0.2 ? 'epic' : roll < 0.5 ? 'rare' : 'common';
                    const pool = Object.values(GameData.items).filter(it => it.rarity === rarity);
                    const item = pool[Math.floor(Math.random()*pool.length)];
                    GameState.inventory.push(item.id);
                    resBox.innerHTML += `<div class="item-card rarity-${rarity} p-2 text-[10px]"><div class="text-2xl">${item.emoji}</div>${item.name}</div>`;
                }
                GameState.save();
            }, 1500);
        },
        closeGacha() { document.getElementById('gacha-overlay').classList.remove('active'); document.getElementById('gacha-animation').classList.remove('hidden'); document.getElementById('gacha-close-btn').classList.add('hidden'); }
    },
    Ranking: {
        async loadRanking() {
            const list = document.getElementById('ranking-list'); list.innerHTML = '<div class="loader"></div>';
            try {
                const q = window.query(window.collection(window.db, "rankings"));
                const snap = await window.getDocs(q);
                let all = []; snap.forEach(d => all.push(d.data()));
                all.sort((a,b) => b.stage - a.stage);
                list.innerHTML = '';
                all.slice(0, 10).forEach((d, i) => {
                    list.innerHTML += `<div class="flex justify-between p-3 bg-slate-900 rounded mb-2"><span>${i+1}위 ${d.nickname}</span><span>${d.stage}F</span></div>`;
                });
            } catch(e) { list.innerHTML = '불러오기 실패'; }
        }
    },
    Battle: {
        battleInterval: null, monsterHp: 0,
        enterDungeon() { 
            if(GameState.currentHp <= 0) return;
            GameState.isBattling = true; UIManager.navTo('screen-rpg-battle'); this.initBattle(); 
        },
        initBattle() {
            this.monsterHp = GameState.rpgStage * 50;
            document.getElementById('battle-stage-title').innerText = "STAGE " + GameState.rpgStage;
            this.updateUI();
            clearInterval(this.battleInterval);
            this.battleInterval = setInterval(() => {
                GameState.currentHp -= Math.floor(GameState.rpgStage * 3);
                this.updateUI();
                if(GameState.currentHp <= 0) this.endBattle(false);
            }, 1500);
        },
        updateUI() {
            const stats = GameState.getTotalStats();
            document.getElementById('battle-player-hp-text').innerText = GameState.currentHp + "/" + stats.hp;
            document.getElementById('battle-player-hp-bar').style.width = (GameState.currentHp/stats.hp*100) + "%";
            document.getElementById('battle-monster-hp-text').innerText = this.monsterHp;
        },
        playerAttack() {
            this.monsterHp -= GameState.getTotalStats().atk; this.updateUI();
            if(this.monsterHp <= 0) this.endBattle(true);
        },
        endBattle(win) {
            clearInterval(this.battleInterval); GameState.isBattling = false;
            if(win) { GameState.gold += 50; GameState.rpgStage++; GameState.save(); alert("승리!"); }
            else { GameState.currentHp = 0; GameState.save(); alert("패배..."); }
            UIManager.navTo('screen-arena');
        }
    }
};
