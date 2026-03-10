// =========================================================================
// 4. UI MANAGER & 5. GAME SYSTEM (합성 시스템 버그 수정 및 통합 버전)
// =========================================================================
const UIManager = {
    selectedItems: [], // 현재 합성 가마솥에 올린 아이템 ID들

    init() { 
        this.initBackground(); 
        this.updateCurrencyUI(); 
        this.applyAvatarSkin(); 
        this.initCheckinButton(); 
        this.updateIdleUI(); 
        document.getElementById('profile-nickname-display').innerText = GameState.nickname; 
        
        if (localStorage.getItem('master_in_battle') === 'true') {
            localStorage.removeItem('master_in_battle');
            GameState.currentHp = 0; 
            GameState.isBattling = false;
            GameState.save();
            setTimeout(() => {
                this.triggerHeavyHaptic();
                this.showToast("🚨 탈주 페널티: 전투 이탈로 체력이 0이 되었습니다.");
                this.updateRpgLobbyUI();
            }, 1000);
        }

        setInterval(() => {
            if (document.getElementById('screen-home').classList.contains('active')) {
                this.updateIdleUI();
            }
        }, 60000);
    },
    triggerHaptic() { if(window.navigator && window.navigator.vibrate) window.navigator.vibrate(40); },
    triggerHeavyHaptic() { if(window.navigator && window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]); },
    showToast(m) { const t = document.getElementById('toast'); t.innerText = m; t.style.opacity = '1'; setTimeout(() => t.style.opacity = '0', 2500); },
    
    navTo(s, el) {
        if (GameState.isBattling) { this.showToast("⚔️ 전투 중에는 이동할 수 없습니다!"); return; }
        AudioEngine.sfx.click(); this.triggerHaptic();
        document.querySelectorAll('.screen').forEach(sc => sc.classList.remove('active'));
        document.getElementById(s).classList.add('active'); window.scrollTo(0,0);
        if(el) { document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); el.classList.add('active'); }
        
        if(s === 'screen-home') this.updateIdleUI(); 
        if(s === 'screen-arena') this.updateRpgLobbyUI();
        if(s === 'screen-profile') { this.renderInventory(); document.getElementById('profile-nickname-display').innerText = GameState.nickname; }
        if(s === 'screen-ranking') GameSystem.Ranking.loadRanking();
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
       // [수정 후 - w-full 및 text-xs 추가]
document.getElementById('inv-tab-gear').className = t === 'gear' ? "w-full py-2 bg-slate-700 text-white font-bold rounded-lg text-xs border border-slate-500 transition-colors" : "w-full py-2 bg-slate-800 text-slate-400 font-bold rounded-lg text-xs border border-slate-700 transition-colors";
document.getElementById('inv-tab-skin').className = t === 'skin' ? "w-full py-2 bg-slate-700 text-white font-bold rounded-lg text-xs border border-slate-500 transition-colors" : "w-full py-2 bg-slate-800 text-slate-400 font-bold rounded-lg text-xs border border-slate-700 transition-colors";
        this.renderInventory();
    },
    
    updateCurrencyUI() {
        document.getElementById('gold-display').innerText = GameState.gold.toLocaleString();
        document.getElementById('gem-display').innerText = GameState.gem.toLocaleString();
    },
    
    initCheckinButton() { 
        if(GameState.lastCheckIn === new Date().toDateString()) {
            const btn = document.getElementById('btn-checkin');
            if(btn) {
                btn.innerHTML = '<span>✅</span> 내일 다시 오세요'; 
                btn.classList.replace('from-indigo-600', 'from-slate-600'); 
                btn.classList.replace('to-purple-600', 'to-slate-700'); 
            }
        }
    },

    updateIdleUI() {
        const amount = GameSystem.Lobby.calculateIdleReward();
        const display = document.getElementById('idle-amount-display');
        if (display) {
            display.innerText = `${amount} / 100 G`;
            display.className = amount >= 100 ? "text-sm font-black text-emerald-400 animate-pulse" : "text-sm font-black text-slate-400";
        }
    },
    
    updateRpgLobbyUI() {
        const stats = GameState.getTotalStats(); document.getElementById('rpg-stage-display').innerText = GameState.rpgStage;
        document.getElementById('lobby-hp-text').innerText = `${Math.max(0, GameState.currentHp)} / ${stats.hp}`;
        document.getElementById('lobby-hp-bar').style.width = (GameState.currentHp / stats.hp * 100) + "%";
        
        const atkBuff = stats.atk - GameState.rpgAtk; const hpBuff = stats.hp - GameState.rpgMaxHp;
        document.getElementById('stat-atk-display').innerHTML = `${GameState.rpgAtk.toLocaleString()} ${atkBuff > 0 ? `<span class="text-[12px] text-emerald-400">(+${atkBuff})</span>` : ''}`;
        document.getElementById('stat-hp-display').innerHTML = `${GameState.rpgMaxHp.toLocaleString()} ${hpBuff > 0 ? `<span class="text-[12px] text-emerald-400">(+${hpBuff})</span>` : ''}`;
        
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
        if(!pGear || !pSkin) return;

        pGear.innerHTML = ''; pSkin.innerHTML = '';
        let hasGear = false; let hasSkin = false;
        
        const counts = {}; 
        GameState.inventory.forEach(i => counts[i] = (counts[i] || 0) + 1);

        for(const [id, count] of Object.entries(counts)) {
            const item = GameData.items[id]; if(!item) continue;
            
            const isEquipped = (item.type === 'gear' && GameState.equippedGear === id) || 
                              (item.type === 'skin' && GameState.equippedSkin === id);
            
            const badgeHTML = isEquipped ? `<div class="item-equipped-badge">장착중</div>` : '';
            const countHTML = count > 1 ? `<div class="absolute bottom-1 right-2 text-[10px] text-slate-400 font-bold">x${count}</div>` : '';
            const effectHTML = item.type === 'gear' ? `<span class="text-[9px] text-emerald-400 font-bold mt-1">스탯 +${Math.round((item.statMult - 1)*100)}%</span>` : `<span class="text-[9px] text-purple-400 font-bold mt-1">프로필 효과</span>`;
            
            const card = `
                <div onclick="GameSystem.Lobby.handleItemClick('${id}')" class="item-card rarity-${item.rarity} ${isEquipped ? 'equipped' : ''} relative">
                    ${badgeHTML}
                    <div class="text-3xl mb-1 filter drop-shadow-md">${item.emoji}</div>
                    <h4 class="text-white font-bold text-[11px] text-center break-keep leading-tight">${item.name}</h4>
                    ${effectHTML}
                    ${countHTML}
                </div>
            `;
            if(item.type === 'gear') { pGear.innerHTML += card; hasGear = true; } 
            else { pSkin.innerHTML += card; hasSkin = true; }
        }
        
        const currentTab = pGear.classList.contains('hidden') ? 'skin' : 'gear';
        if ((currentTab === 'gear' && !hasGear) || (currentTab === 'skin' && !hasSkin)) emptyState.classList.remove('hidden');
        else emptyState.classList.add('hidden');
        
        const stats = GameState.getTotalStats(); 
        document.getElementById('profile-total-power').innerText = stats.atk.toLocaleString(); 
        document.getElementById('profile-total-hp').innerText = stats.hp.toLocaleString();
    },
    
    initBackground() { 
        const canvas = document.getElementById('dynamic-bg'); const ctx = canvas.getContext('2d');
        let width, height; let particles = [];
        const resizeBg = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
        window.addEventListener('resize', resizeBg); resizeBg();
        for(let i=0; i<40; i++) { particles.push({ x: Math.random() * width, y: Math.random() * height, r: Math.random() * 2 + 0.5, vy: Math.random() * 0.5 + 0.2, alpha: Math.random() * 0.5 + 0.1 }); }
        const drawBg = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.y -= p.vy; if(p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha})`; ctx.fill();
            }); requestAnimationFrame(drawBg);
        };
        drawBg();
    }
};

const GameSystem = {
    Synthesis: {
        currentTier: 'common',
        config: {
            'common': { next: 'rare', rate: 100, pityAdd: 0, baseGold: 300, inflation: 15, gem: 0 },
            'rare':   { next: 'epic', rate: 65, pityAdd: 15, baseGold: 1500, inflation: 50, gem: 0 },
            'epic':   { next: 'legendary', rate: 25, pityAdd: 20, baseGold: 5000, inflation: 100, gem: 50 }
        },

        openModal() {
            AudioEngine.sfx.click();
            UIManager.triggerHaptic();
            document.getElementById('synth-modal').classList.add('active');
            UIManager.selectedItems = []; // 선택 초기화
            this.selectTier('common');
        },

        closeModal() {
            AudioEngine.sfx.click();
            document.getElementById('synth-modal').classList.remove('active');
            UIManager.selectedItems = [];
        },

        selectTier(tier) {
            AudioEngine.sfx.click();
            this.currentTier = tier;
            UIManager.selectedItems = []; // 등급 변경 시 선택 초기화
            
            ['common', 'rare', 'epic'].forEach(t => {
                const btn = document.getElementById(`synth-tab-${t}`);
                if (btn) {
                    if (t === tier) btn.className = "flex-1 py-2 bg-slate-600 text-white border border-slate-400 text-xs font-bold rounded shadow-inner transition-all";
                    else btn.className = "flex-1 py-2 bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold rounded transition-all";
                }
            });
            this.updateUI();
        },

      // [수정된 부분] 154행 부근
        selectItem(id) {
            const item = GameData.items[id];
            if (!item || item.type !== 'gear' || item.rarity !== this.currentTier) {
                return UIManager.showToast("동일 등급의 장비만 연성 가능합니다.");
            }
            if (GameState.equippedGear === id) {
                return UIManager.showToast("장착 중인 장비는 안전을 위해 연성할 수 없습니다.");
            }

            // 가마솥이 꽉 찼는지 확인
            if (UIManager.selectedItems.length >= 3) return UIManager.showToast("재료는 3개까지만 넣을 수 있습니다.");
            
            // 인벤토리 내 실제 보유 수량과 현재 선택된 수량 비교 (같은 아이템 중복 선택 가능)
            const hasCount = GameState.inventory.filter(iid => iid === id).length;
            const usedCount = UIManager.selectedItems.filter(sid => sid === id).length;
            
            if (usedCount >= hasCount) return UIManager.showToast("보유한 아이템 수량이 부족합니다.");
            
            // 제거 로직을 없애고 무조건 추가하도록 변경
            UIManager.selectedItems.push(id);
            AudioEngine.sfx.click();
            
            this.updateUI();
        },

        // [신규 추가] 가마솥 슬롯 클릭 시 해당 위치의 아이템만 제거
        removeItem(index) {
            if (index > -1 && index < UIManager.selectedItems.length) {
                UIManager.selectedItems.splice(index, 1);
                AudioEngine.sfx.click();
                this.updateUI();
            }
        },
        updateUI() {
            const selected = UIManager.selectedItems;
            const count = selected.length;
            const conf = this.config[this.currentTier];

            // 1. 가마솥 슬롯(위에 3개) 업데이트
            for (let i = 1; i <= 3; i++) {
                const slot = document.getElementById(`synth-slot-${i}`);
                if (!slot) continue;
                if (i <= count) {
                    const itemObj = GameData.items[selected[i-1]];
                    slot.innerHTML = `<span class="filter drop-shadow-lg">${itemObj.emoji}</span>`;
                    slot.className = `w-16 h-16 rounded-xl border-2 border-solid border-purple-500 flex items-center justify-center text-3xl bg-slate-800 transition-all cursor-pointer shadow-lg`;
                   slot.onclick = () => this.removeItem(i-1);
                } else {
                    slot.innerHTML = '';
                    slot.className = `w-16 h-16 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center bg-slate-800/50 transition-all`;
                    slot.onclick = null;
                }
            }

            // 2. 하단 재료 목록 업데이트
            const listArea = document.getElementById('synth-material-list');
            if (listArea) {
                listArea.innerHTML = "";
                const eligibleItems = GameState.inventory.filter(id => {
                    const item = GameData.items[id];
                    return item && item.type === 'gear' && item.rarity === this.currentTier && id !== GameState.equippedGear;
                });

                [...new Set(eligibleItems)].forEach(id => {
                    const item = GameData.items[id];
                    const hasCount = eligibleItems.filter(iid => iid === id).length;
                    const usedCount = selected.filter(sid => sid === id).length;
                    const remain = hasCount - usedCount;

                    if (hasCount > 0) {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = `p-2 bg-slate-800 rounded-lg flex flex-col items-center justify-center border transition-all cursor-pointer ${usedCount > 0 ? 'border-purple-500 ring-2 ring-purple-500/50 bg-slate-700' : 'border-slate-700'}`;
                        itemDiv.innerHTML = `
                            <div class="text-2xl">${item.emoji}</div>
                            <div class="text-[9px] mt-1 ${remain > 0 ? 'text-slate-300' : 'text-slate-500'} font-bold">${remain}개 남음</div>
                            ${usedCount > 0 ? `<div class="absolute -top-1 -right-1 bg-purple-600 text-[8px] px-1.5 py-0.5 rounded-full font-bold text-white shadow-sm">+${usedCount}</div>` : ''}
                        `;
                        itemDiv.onclick = () => this.selectItem(id);
                        listArea.appendChild(itemDiv);
                    }
                });
            }

            // 3. 버튼 및 확률 업데이트
            const bonusPity = GameState.synthPity[this.currentTier] || 0;
            const finalRate = Math.min(100, conf.rate + bonusPity);
            document.getElementById('synth-rate-text').innerHTML = `${finalRate}%` + (bonusPity > 0 ? ` <span class="text-xs text-pink-400">(+${bonusPity}%)</span>` : '');
            
            const btn = document.getElementById('btn-synth-execute');
            const cost = conf.baseGold + (GameState.rpgStage * conf.inflation);
            document.getElementById('synth-btn-cost').innerText = `🪙 ${cost.toLocaleString()}`;

            if (count === 3) {
                btn.disabled = false;
                btn.className = "w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black shadow-lg animate-pulse";
                document.getElementById('synth-btn-title').innerText = "✨ 연성 시작";
            } else {
                btn.disabled = true;
                btn.className = "w-full py-4 bg-slate-800 text-slate-500 rounded-xl font-black opacity-50";
                document.getElementById('synth-btn-title').innerText = `재료 부족 (${count}/3)`;
            }

            // 마일리지 바 업데이트
            const pityWrap = document.getElementById('synth-pity-wrap');
            if (this.currentTier !== 'common' && bonusPity > 0) {
                pityWrap.classList.remove('hidden');
                document.getElementById('synth-pity-text').innerText = `${bonusPity}%`;
                document.getElementById('synth-pity-bar').style.width = `${Math.min(100, bonusPity)}%`;
            } else {
                pityWrap.classList.add('hidden');
            }
        },

        execute() {
            if (UIManager.selectedItems.length < 3) return;
            const conf = this.config[this.currentTier];
            const cost = conf.baseGold + (GameState.rpgStage * conf.inflation);
            const gemCost = conf.gem || 0;

            if (GameState.gold < cost) return UIManager.showToast("골드가 부족합니다! 🪙");
            if (GameState.gem < gemCost) return UIManager.showToast("젬이 부족합니다! 💎");

            GameState.gold -= cost;
            GameState.gem -= gemCost;
            GameSystem.Quest.updateProgress('daily', 'd2');

            // 재료 제거
            UIManager.selectedItems.forEach(id => {
                const idx = GameState.inventory.indexOf(id);
                if (idx > -1) GameState.inventory.splice(idx, 1);
            });

            UIManager.triggerHeavyHaptic();
            AudioEngine.sfx.gacha_build();
            document.getElementById('btn-synth-execute').disabled = true;

            setTimeout(() => {
                const bonusPity = GameState.synthPity[this.currentTier] || 0;
                const finalRate = conf.rate + bonusPity;
                const isSuccess = (Math.random() * 100 < finalRate);

                if (isSuccess) {
                    AudioEngine.sfx.gacha_reveal();
                    const nextRarity = conf.next;
                    const pool = Object.values(GameData.items).filter(it => it.type === 'gear' && it.rarity === nextRarity);
                    const result = pool[Math.floor(Math.random() * pool.length)];
                    GameState.inventory.push(result.id);
                    GameState.synthPity[this.currentTier] = 0;
                    UIManager.showToast(`🎉 연성 성공! [${result.name}] 획득!`);
                } else {
                    AudioEngine.sfx.hit();
                    GameState.synthPity[this.currentTier] = (GameState.synthPity[this.currentTier] || 0) + conf.pityAdd;
                    UIManager.showToast(`💥 연성 실패... 마일리지가 쌓였습니다.`);
                }

                GameState.save();
                UIManager.updateCurrencyUI();
                UIManager.selectedItems = [];
                this.updateUI();
                UIManager.renderInventory();
            }, 1000);
        }
    }, // 🔴 FIX 1: 누락되었던 쉼표(,) 추가 완료!

    Lobby: {
        handleItemClick(id) {
            const synthModal = document.getElementById('synth-modal');
            if (synthModal && synthModal.classList.contains('active')) {
                GameSystem.Synthesis.selectItem(id);
            } else {
                this.toggleEquip(id);
            }
        },
        calculateIdleReward() {
            const now = Date.now();
            const elapsedHours = (now - GameState.lastIdleCheck) / (1000 * 60 * 60);
            return Math.min(100, Math.floor(elapsedHours * 12.5));
        },
        claimIdleReward() {
            const amount = this.calculateIdleReward();
            if (amount <= 0) return UIManager.showToast("누적된 지원금이 없습니다. 💤");
            GameState.gold += amount;
            GameState.lastIdleCheck = Date.now();
            GameState.save();
            UIManager.updateCurrencyUI();
            UIManager.updateIdleUI();
            AudioEngine.sfx.coin();
            UIManager.triggerHaptic();
            UIManager.showToast(`방치 지원금 ${amount}G 수령 완료! 💰`);
        },
        claimDailyReward() {
            if (GameState.lastCheckIn === new Date().toDateString()) return UIManager.showToast("오늘 이미 보상을 받았습니다! ⏱️");
            GameState.gold += 100; GameState.lastCheckIn = new Date().toDateString(); GameState.save();
            UIManager.updateCurrencyUI(); UIManager.initCheckinButton(); AudioEngine.sfx.coin(); UIManager.triggerHaptic();
            UIManager.showToast("출석체크 완료! 100G 획득 🪙");
        },
        rewardForPlay() { 
            const testUrl = window.event?.currentTarget?.href || "default_test";
            const today = new Date().toDateString();
            if (GameState.lastPlayRewards[testUrl] === today) {
                return UIManager.showToast("이 테스트 보상은 오늘 이미 받았습니다! ⏱️");
            }
            GameState.gold += 10; 
            GameState.lastPlayRewards[testUrl] = today; 
            GameState.save(); 
            UIManager.updateCurrencyUI(); 
            AudioEngine.sfx.coin(); 
            UIManager.showToast("탐험 지원금 10G 획득 🪙"); 
        },
        getUpgradeCost(t) { return t === 'atk' ? Math.floor(GameState.rpgAtk * 5) : Math.floor(GameState.rpgMaxHp * 0.5); },
        upgradeStat(t) {
            const cost = this.getUpgradeCost(t); if(GameState.gold < cost) return UIManager.showToast("골드가 부족합니다! 🪙");
            GameState.gold -= cost; if(t==='atk') GameState.rpgAtk += Math.floor(GameState.rpgAtk * 0.2) + 2; else { const h = Math.floor(GameState.rpgMaxHp * 0.2) + 20; GameState.rpgMaxHp += h; GameState.currentHp += h; }
            GameState.save(); UIManager.updateCurrencyUI(); UIManager.updateRpgLobbyUI(); AudioEngine.sfx.coin(); UIManager.triggerHaptic(); UIManager.showToast("스탯 강화 성공! ✨");
        },
        buyItem(t) {
            if(t==='potion') { if(GameState.gold < 30) return UIManager.showToast("골드가 부족합니다! 🪙"); GameState.gold -= 30; GameState.potions++; UIManager.showToast("물약을 구매했습니다! ❤️"); }
            else { const m = GameState.getTotalStats().hp; if(GameState.currentHp >= m) return UIManager.showToast("이미 체력이 가득 찼습니다."); if(GameState.gold < 20) return UIManager.showToast("골드가 부족합니다! 🪙"); GameState.gold -= 20; GameState.currentHp = m; UIManager.showToast("여관에서 푹 쉬었습니다. ⛺"); }
            GameState.save(); UIManager.updateCurrencyUI(); UIManager.updateRpgLobbyUI(); AudioEngine.sfx.coin(); UIManager.triggerHaptic();
        },
        toggleEquip(id) {
            const item = GameData.items[id]; 
            if(!item) return;
            if(item.type === 'gear') GameState.equippedGear = GameState.equippedGear === id ? null : id;
            else GameState.equippedSkin = GameState.equippedSkin === id ? null : id;
            GameState.save(); UIManager.renderInventory(); UIManager.applyAvatarSkin(); UIManager.updateRpgLobbyUI(); AudioEngine.sfx.equip(); UIManager.triggerHaptic();
            UIManager.showToast(GameState.equippedGear === id || GameState.equippedSkin === id ? `[${item.name}] 장착 완료!` : `장착 해제됨`);
        }
    },
    
    Gacha: {
        performGacha(times) {
            const cost = times * 50; if(GameState.gem < cost) return UIManager.showToast("젬(💎)이 부족합니다! 보스를 토벌하세요.");
            GameState.gem -= cost; GameState.save(); UIManager.updateCurrencyUI();
            document.getElementById('bottom-nav').style.display = 'none'; 
            const over = document.getElementById('gacha-overlay'); const resBox = document.getElementById('gacha-results-container'); const anim = document.getElementById('gacha-animation');
            over.classList.add('active'); resBox.classList.add('hidden'); resBox.innerHTML = ''; anim.classList.remove('hidden'); document.getElementById('gacha-title').innerText = "소환의식 진행 중...";
            document.getElementById('gacha-close-btn').classList.add('hidden');
            AudioEngine.sfx.gacha_build(); UIManager.triggerHeavyHaptic();
            
            let results = [];
            for(let i=0; i<times; i++) {
                const roll = Math.random(); let rarity = 'common'; if(roll < 0.05) rarity = 'legendary'; else if(roll < 0.2) rarity = 'epic'; else if(roll < 0.5) rarity = 'rare';
                const pool = Object.values(GameData.items).filter(it => it.rarity === rarity);
                const item = pool[Math.floor(Math.random() * pool.length)];
                results.push(item); GameState.inventory.push(item.id);
            }
            GameState.save();
            
            setTimeout(() => {
                AudioEngine.sfx.gacha_reveal(); UIManager.triggerHaptic();
                anim.classList.add('hidden'); resBox.classList.remove('hidden'); document.getElementById('gacha-title').innerText = "소환 결과!";
                resBox.className = times === 1 ? "w-full max-w-xs grid grid-cols-1 gap-4" : "w-full max-w-sm grid grid-cols-2 gap-3 overflow-y-auto max-h-[60vh] pb-10";
                
                results.forEach((item, index) => {
                    setTimeout(() => {
                        let rarityLabel = item.rarity === 'legendary' ? "전설" : item.rarity === 'epic' ? "영웅" : item.rarity === 'rare' ? "희귀" : "일반";
                        const cardHtml = `<div class="gacha-item-card item-card rarity-${item.rarity}"><span class="text-[10px] font-bold mb-1 ${item.color} tracking-widest">[${rarityLabel}]</span><div class="text-4xl mb-1 filter drop-shadow-lg">${item.emoji}</div><h4 class="text-white font-bold text-xs text-center break-keep">${item.name}</h4></div>`;
                        resBox.insertAdjacentHTML('beforeend', cardHtml);
                        if(item.rarity === 'legendary' || item.rarity === 'epic') UIManager.triggerHaptic(); 
                    }, index * 100); 
                });
                setTimeout(() => { document.getElementById('gacha-close-btn').classList.remove('hidden'); }, results.length * 100 + 300);
            }, 1500);
        },
        closeGacha() { AudioEngine.sfx.click(); document.getElementById('gacha-overlay').classList.remove('active'); document.getElementById('bottom-nav').style.display = 'flex'; }
    },
    
    Ranking: {
        openRegisterModal() { document.getElementById('modal-current-stage').innerText = GameState.rpgStage; document.getElementById('nickname-modal').classList.add('active'); },
        closeModal() { document.getElementById('nickname-modal').classList.remove('active'); },
        async submitRanking() {
            const nick = document.getElementById('nickname-input').value.trim(); if(!nick) return alert("닉네임을 입력해주세요!");
            GameState.nickname = nick; GameState.save(); document.getElementById('profile-nickname-display').innerText = nick;
            const btn = document.getElementById('btn-submit-ranking'); btn.disabled = true; btn.innerHTML = '<div class="loader" style="width:16px;height:16px;"></div> 등록 중...';
            try {
                await window.addDoc(window.collection(window.db, "rankings"), { deviceId: GameState.deviceId || 'unknown', nickname: nick, stage: GameState.rpgStage, skin: GameState.equippedSkin || 'none', timestamp: window.serverTimestamp() });
                UIManager.showToast("명예의 전당에 기록되었습니다! 🏆"); this.closeModal(); this.loadRanking();
            } catch(e) { console.error(e); UIManager.showToast("서버 통신에 실패했습니다."); } finally { btn.disabled = false; btn.innerHTML = '등록'; }
        },
        async updateRankingSilently() {
            if(GameState.nickname === "위대한 길드장" || !window.db) return;
            try { await window.addDoc(window.collection(window.db, "rankings"), { deviceId: GameState.deviceId || 'unknown', nickname: GameState.nickname, stage: GameState.rpgStage, skin: GameState.equippedSkin || 'none', timestamp: window.serverTimestamp() }); } catch(e) { console.error("Silent rank update failed", e); }
        },
        async loadRanking() {
            const list = document.getElementById('ranking-list'); 
            list.innerHTML = '<div class="text-center py-8"><div class="loader"></div><p class="text-sm text-slate-400 mt-3">서버에서 전설을 불러오는 중...</p></div>';
            if(!window.db) { list.innerHTML = '<div class="text-center py-8 text-red-400">데이터베이스 연결에 실패했습니다.</div>'; return; }
            try {
                const q = window.query(window.collection(window.db, "rankings"), window.limit(50)); 
                const snap = await window.getDocs(q);
                let all = []; snap.forEach(d => all.push(d.data()));
                all.sort((a,b) => { 
                    if (b.stage !== a.stage) return b.stage - a.stage; 
                    const timeA = a.timestamp ? (a.timestamp.toMillis ? a.timestamp.toMillis() : a.timestamp) : Date.now(); 
                    const timeB = b.timestamp ? (b.timestamp.toMillis ? b.timestamp.toMillis() : b.timestamp) : Date.now(); 
                    return timeA - timeB; 
                });
                let unique = []; let seen = new Set();
                all.forEach(d => { 
                    const id = d.deviceId || d.nickname; 
                    if(!seen.has(id) && unique.length < 10) { seen.add(id); unique.push(d); } 
                });
                if(unique.length === 0) { list.innerHTML = '<div class="text-center py-8 text-slate-400">아직 명예의 전당에 오른 자가 없습니다.</div>'; return; }
                list.innerHTML = '';
                unique.forEach((d, i) => {
                    let rankIcon = `${i + 1}위`; let bgClass = "bg-slate-900";
                    if(i === 0) { rankIcon = "🥇 1위"; bgClass = "bg-gradient-to-r from-yellow-900/40 to-slate-900 border border-yellow-500/30"; } else if(i === 1) { rankIcon = "🥈 2위"; bgClass = "bg-slate-800 border border-slate-400/30"; } else if(i === 2) { rankIcon = "🥉 3위"; bgClass = "bg-orange-950/30 border border-orange-700/30"; }
                    let skinClass = "bg-gradient-to-tr from-slate-600 to-slate-400"; if(d.skin && d.skin !== 'none' && GameData.items[d.skin]) skinClass = `skin-${GameData.items[d.skin].rarity}`;
                    const isMe = (d.nickname === GameState.nickname); const myHighlight = isMe ? "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "border-transparent";
                    list.innerHTML += `<div class="p-4 rounded-xl flex items-center justify-between ${bgClass} border ${myHighlight} transition-all mb-3"><div class="flex items-center gap-4"><div class="w-12 text-center font-black ${i < 3 ? 'text-yellow-400' : 'text-slate-500'}">${rankIcon}</div><div class=\"master-avatar w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md ${skinClass}">${d.nickname.charAt(0)}</div><div><p class="font-bold text-white text-sm flex items-center gap-2">${d.nickname} ${isMe ? '<span class="text-[10px] bg-indigo-500 px-1.5 py-0.5 rounded text-white font-normal">ME</span>' : ''}</p></div></div><div class="text-right"><p class="text-xs text-slate-400">도달 층수</p><p class="text-lg font-black text-gradient-gold">${d.stage}F</p></div></div>`;
                });
            } catch(e) { console.error(e); list.innerHTML = '<div class="text-center py-8 text-red-400">명예의 전당을 불러오지 못했습니다.</div>'; }
        }
    },
// [추가] 394행 Ranking 모듈 끝난 후 (Battle 모듈 시작 전)
    Quest: {
        updateProgress(type, id, amount = 1) {
            if (type === 'daily') {
                const q = GameData.quests.daily.find(item => item.id === id);
                if (!q) return;
                const current = this.getDailyProgress(id);
                if (current >= q.goal) return; // 이미 달성함
                
                GameState.questData.daily.progress[id] = current + amount;
                if (GameState.questData.daily.progress[id] >= q.goal) {
                    this.giveReward(q.rewardGem, `일일 퀘스트 [${q.name}] 달성!`);
                }
            } else {
                const q = GameData.quests.achievements.find(item => item.id === id);
                if (!q || GameState.questData.achievements.completed.includes(id)) return;
                
                const current = GameState.questData.achievements.progress[id] || 0;
                GameState.questData.achievements.progress[id] = current + amount;
                
                if (GameState.questData.achievements.progress[id] >= q.goal) {
                    GameState.questData.achievements.completed.push(id);
                    this.giveReward(q.rewardGem, `업적 달성! [${q.name}]`);
                }
            }
            GameState.save();
        },
        getDailyProgress(id) { return GameState.questData.daily.progress[id] || 0; },
        giveReward(gem, msg) {
            GameState.gem += gem;
            UIManager.showToast(`💎 ${msg} (+${gem})`);
            UIManager.updateCurrencyUI();
            AudioEngine.sfx.coin();
        }
    },
    Battle: {
        monsterMaxHp: 0, monsterCurrentHp: 0, monsterAtkObj: 0, battleInterval: null, lastAttackTime: 0,
        enterDungeon() {
            if (GameState.currentHp <= 0) return UIManager.showToast("체력이 없습니다! 여관에서 휴식하세요. ⛺");
            GameSystem.Quest.updateProgress('daily', 'd1');
            AudioEngine.sfx.click(); UIManager.triggerHaptic(); 
            document.getElementById('bottom-nav').style.display = 'none'; 
            const isBoss = (GameState.rpgStage % 5 === 0);
            let stageRoll = localStorage.getItem('master_stage_roll_' + GameState.rpgStage) || Math.random(); 
            localStorage.setItem('master_stage_roll_' + GameState.rpgStage, stageRoll);
            if (!isBoss && parseFloat(stageRoll) < 0.3) { this.triggerRandomEvent(parseFloat(stageRoll)); } else { this.startBattleSequence(isBoss); }
        },
        triggerRandomEvent(roll) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); 
            document.getElementById('screen-rpg-event').classList.add('active');
            const titleEl = document.getElementById('event-title'), iconEl = document.getElementById('event-icon'), descEl = document.getElementById('event-desc');
            if (roll < 0.12) { 
                titleEl.innerText = "숨겨진 보물상자!"; iconEl.innerText = "🎁"; titleEl.className = "text-2xl font-black text-yellow-400 mb-4"; 
                descEl.innerText = "상자를 열었더니 골드가 쏟아집니다!\n(+30G 획득)"; AudioEngine.sfx.coin(); 
                GameState.gold += 30; UIManager.updateCurrencyUI(); 
            } else if (roll < 0.21) { 
                titleEl.innerText = "함정 발동!"; iconEl.innerText = "🪤"; titleEl.className = "text-2xl font-black text-rose-500 mb-4"; 
                let dmg = Math.floor(GameState.getTotalStats().hp * 0.15); 
                descEl.innerText = `독화살이 날아왔습니다!\n(-${dmg} HP)`; GameState.currentHp = Math.max(1, GameState.currentHp - dmg); 
                AudioEngine.sfx.hit(); UIManager.triggerHeavyHaptic(); 
            } else { 
                titleEl.innerText = "요정의 축복"; iconEl.innerText = "🧚"; titleEl.className = "text-2xl font-black text-cyan-400 mb-4"; 
                let heal = Math.floor(GameState.getTotalStats().hp * 0.3); 
                descEl.innerText = `요정이 상처를 치료해 줍니다.\n(+5💎, +${heal} HP)`; AudioEngine.sfx.coin(); 
                GameState.gem += 5; GameState.currentHp = Math.min(GameState.getTotalStats().hp, GameState.currentHp + heal); 
                UIManager.updateCurrencyUI(); 
            }
        },
        endEvent() { GameState.rpgStage++; GameState.save(); document.getElementById('bottom-nav').style.display = 'flex'; UIManager.navTo('screen-arena', document.querySelectorAll('.nav-item')[1]); },
        startBattleSequence(isBoss) {
            if(GameState.isBattling) return; 
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); 
            document.getElementById('screen-rpg-battle').classList.add('active');
            GameState.isBattling = true; 
            localStorage.setItem('master_in_battle', 'true');
            if (isBoss) {
                AudioEngine.sfx.boss(); const overlay = document.getElementById('boss-warning-overlay'); overlay.classList.add('active');
                const battleCard = document.getElementById('battle-card');
                let shakes = 0; let shakeInt = setInterval(() => { if(battleCard) { battleCard.classList.add('shake'); UIManager.triggerHeavyHaptic(); setTimeout(() => battleCard.classList.remove('shake'), 150); } if(++shakes >= 4) clearInterval(shakeInt); }, 500);
                setTimeout(() => { overlay.classList.remove('active'); this.initBattle(true); }, 3000);
            } else { this.initBattle(false); }
        },
        initBattle(isBoss) {
            this.monsterMaxHp = GameState.rpgStage * 40 + (isBoss ? 200 : 0); 
            this.monsterCurrentHp = this.monsterMaxHp;
            this.monsterAtkObj = Math.floor(GameState.rpgStage * 3) + (isBoss ? 15 : 0);
            let mInfo = isBoss ? (GameData.monsters.boss[GameState.rpgStage] || {e:'👑',n:'고대의 왕'}) : GameData.monsters.normal[(GameState.rpgStage - 1) % GameData.monsters.normal.length];
            document.getElementById('battle-stage-title').innerText = `STAGE ${GameState.rpgStage} ${isBoss ? '🔥' : ''}`;
            document.getElementById('battle-monster-name').innerText = mInfo.n; 
            document.getElementById('monster-sprite').innerText = mInfo.e;
            document.getElementById('battle-card').className = isBoss ? "glass-card battle-card p-6 mb-6 text-center relative border border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]" : "glass-card battle-card p-6 mb-6 text-center relative border border-purple-500/30";
            document.getElementById('monster-avatar-wrap').className = isBoss ? "monster-avatar-container boss-avatar-container" : "monster-avatar-container";
            document.getElementById('monster-sprite').className = isBoss ? "monster-emoji boss-emoji" : "monster-emoji";
            document.getElementById('battle-log').innerText = "전투 시작! 화면을 탭하여 공격하세요!";
            document.getElementById('btn-attack').disabled = false; document.getElementById('btn-attack').innerHTML = "⚔️ 공격 (TAP!)";
            this.lastAttackTime = 0; this.updateBattleUI();
            clearInterval(this.battleInterval); 
            this.battleInterval = setInterval(() => this.monsterAttack(), 1500); 
        },
        updateBattleUI() {
            const stats = GameState.getTotalStats(); 
            document.getElementById('battle-player-hp-text').innerText = `${Math.max(0, GameState.currentHp)} / ${stats.hp}`;
            document.getElementById('battle-player-hp-bar').style.width = `${Math.max(0, (GameState.currentHp / stats.hp) * 100)}%`;
            document.getElementById('battle-player-buff-text').innerText = GameState.equippedGear ? `[장비 버프 ON]` : ''; 
            document.getElementById('battle-monster-hp-text').innerText = `${Math.max(0, Math.floor(this.monsterCurrentHp))} / ${this.monsterMaxHp}`;
            document.getElementById('battle-monster-hp-bar').style.width = `${Math.max(0, (this.monsterCurrentHp / this.monsterMaxHp) * 100)}%`;
            document.getElementById('battle-potion-count').innerText = GameState.potions;
        },
        usePotionInBattle() {
            const stats = GameState.getTotalStats();
            if(!GameState.isBattling || GameState.currentHp <= 0 || this.monsterCurrentHp <= 0 || GameState.potions <= 0 || GameState.currentHp >= stats.hp) return;
            AudioEngine.sfx.click(); UIManager.triggerHaptic(); GameState.potions -= 1;
            let healAmt = Math.floor(stats.hp * 0.5); GameState.currentHp = Math.min(stats.hp, GameState.currentHp + healAmt);
            GameState.save(); this.updateBattleUI(); document.getElementById('battle-log').innerText = `✨ 물약 사용! 체력 회복!`;
        },
        playerAttack() {
            if(!GameState.isBattling || this.monsterCurrentHp <= 0 || GameState.currentHp <= 0) return;
            const ATTACK_COOLDOWN = 600;
            const now = Date.now();
            if (now - this.lastAttackTime < ATTACK_COOLDOWN) return;
            this.lastAttackTime = now;
            AudioEngine.sfx.hit(); UIManager.triggerHaptic();
            let myAtk = GameState.getTotalStats().atk; 
            let isCrit = Math.random() < 0.2; let damage = isCrit ? Math.floor(myAtk * 1.5) : myAtk;
            this.monsterCurrentHp -= damage;
            const sprite = document.getElementById('monster-sprite');
            sprite.classList.remove('damage-flash'); void sprite.offsetWidth; sprite.classList.add('damage-flash');
            document.getElementById('battle-log').innerText = `🗡️ 공격! ${damage} 데미지! ${isCrit ? '(크리티컬!)' : ''}`;
            const btn = document.getElementById('btn-attack');
            btn.disabled = true; btn.classList.add('opacity-50');
            let timeLeft = ATTACK_COOLDOWN;
            const cooldownTimer = setInterval(() => { timeLeft -= 100; if (timeLeft <= 0 || this.monsterCurrentHp <= 0) { clearInterval(cooldownTimer); if (GameState.isBattling && this.monsterCurrentHp > 0 && GameState.currentHp > 0) { btn.disabled = false; btn.classList.remove('opacity-50'); btn.innerHTML = "⚔️ 공격 (TAP!)"; } } else { btn.innerHTML = `⏳ ${ (timeLeft/1000).toFixed(1) }s`; } }, 100);
            this.updateBattleUI(); 
            if (this.monsterCurrentHp <= 0) { clearInterval(cooldownTimer); setTimeout(() => this.endBattle(true), 300); }
        },
        monsterAttack() {
            if(!GameState.isBattling || this.monsterCurrentHp <= 0 || GameState.currentHp <= 0) { clearInterval(this.battleInterval); return; }
            AudioEngine.sfx.hit(); UIManager.triggerHeavyHaptic();
            let damage = Math.floor(this.monsterAtkObj * (0.8 + Math.random() * 0.4));
            GameState.currentHp -= damage; GameState.save(); 
            const battleCard = document.getElementById('battle-card');
            if(battleCard) { battleCard.classList.add('shake'); setTimeout(() => battleCard.classList.remove('shake'), 200); }
            document.getElementById('battle-log').innerText = `💥 몬스터 반격! ${damage} 피해!`;
            this.updateBattleUI(); 
            if (GameState.currentHp <= 0) { clearInterval(this.battleInterval); setTimeout(() => this.endBattle(false), 300); }
        },
        endBattle(isWin) {
            clearInterval(this.battleInterval); GameState.isBattling = false; localStorage.removeItem('master_in_battle'); 
            const btnAtk = document.getElementById('btn-attack');
            btnAtk.disabled = true; btnAtk.innerHTML = "⚔️ 전투 종료";
            document.getElementById('bottom-nav').style.display = 'flex'; 
            const isBoss = (GameState.rpgStage % 5 === 0);
            if (isWin) {
                AudioEngine.sfx.coin(); UIManager.triggerHaptic();
                let rewardGold = isBoss ? (GameState.rpgStage * 30) : 10; let rewardGem = isBoss ? 50 : 0;
                GameState.gold += rewardGold; GameState.gem += rewardGem; GameState.rpgStage++; GameState.save();
                UIManager.updateCurrencyUI(); 
                GameSystem.Ranking.updateRankingSilently();
                UIManager.showToast(`🎉 토벌 성공! 🪙 +${rewardGold}G ${isBoss ? ' / 💎 +'+rewardGem : ''}`);
                document.getElementById('battle-log').innerText = `토벌 성공! 보상을 획득했습니다.`;
            } else {
                UIManager.triggerHeavyHaptic(); GameState.currentHp = 0; GameState.save();
                UIManager.showToast(`💀 쓰러졌습니다... 여관에서 휴식하세요.`);
            }
            setTimeout(() => {
                UIManager.navTo('screen-arena', document.querySelectorAll('.nav-item')[1]);
            }, 1500);
        }
    } // 🔴 FIX 2: 누락되었던 닫는 중괄호(}) 추가 완료!
};







