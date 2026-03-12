// =========================================================================
// 5. GAME SYSTEM
// =========================================================================
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
            UIManager.selectedItems = [];
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
            UIManager.selectedItems = [];
            
            ['common', 'rare', 'epic'].forEach(t => {
                const btn = document.getElementById(`synth-tab-${t}`);
                if (btn) {
                    if (t === tier) btn.className = "flex-1 py-2 bg-slate-600 text-white border border-slate-400 text-xs font-bold rounded shadow-inner transition-all";
                    else btn.className = "flex-1 py-2 bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold rounded transition-all";
                }
            });
            this.updateUI();
        },

      selectItem(id) {
            const item = GameData.items[id];
            if (!item || item.type !== 'gear' || item.rarity !== this.currentTier) {
                return UIManager.showToast("동일 등급의 장비만 연성 가능합니다.");
            }
            
            // 💡 [핵심 수정] 3분할 장비 중 하나라도 장착하고 있다면 막기!
            const isEquipped = (GameState.equippedWeapon === id || GameState.equippedArmor === id || GameState.equippedAccessory === id);
            if (isEquipped) {
                return UIManager.showToast("장착 중인 장비는 안전을 위해 연성할 수 없습니다.");
            }

            if (UIManager.selectedItems.length >= 3) return UIManager.showToast("재료는 3개까지만 넣을 수 있습니다.");
            
            const hasCount = GameState.inventory.filter(iid => iid === id).length;
            const usedCount = UIManager.selectedItems.filter(sid => sid === id).length;
            
            if (usedCount >= hasCount) return UIManager.showToast("보유한 아이템 수량이 부족합니다.");
            
            UIManager.selectedItems.push(id);
            AudioEngine.sfx.click();
            
            this.updateUI();
        },

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

            const listArea = document.getElementById('synth-material-list');
            if (listArea) {
                listArea.innerHTML = "";
                
                // 💡 [핵심 수정] 장착 중인 3개의 장비는 목록에서 아예 숨기기!
                const eligibleItems = GameState.inventory.filter(id => {
                    const item = GameData.items[id];
                    const isEquipped = (GameState.equippedWeapon === id || GameState.equippedArmor === id || GameState.equippedAccessory === id);
                    return item && item.type === 'gear' && item.rarity === this.currentTier && !isEquipped;
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
    },

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
            GameSystem.Quest.updateProgress('daily', 'd3');
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
            
            // 💡 [핵심] 장비 부위(subType)에 맞춰서 각각의 칸에 장착/해제하기!
            if (item.type === 'gear') {
                if (item.subType === 'weapon') {
                    GameState.equippedWeapon = GameState.equippedWeapon === id ? null : id;
                } else if (item.subType === 'armor') {
                    GameState.equippedArmor = GameState.equippedArmor === id ? null : id;
                } else if (item.subType === 'accessory') {
                    GameState.equippedAccessory = GameState.equippedAccessory === id ? null : id;
                }
            } 
            else { 
                // 스킨은 그대로!
                GameState.equippedSkin = GameState.equippedSkin === id ? null : id;
            }
            
            GameState.save(); 
            UIManager.renderInventory(); 
            UIManager.applyAvatarSkin(); 
            UIManager.updateRpgLobbyUI(); 
            AudioEngine.sfx.equip(); 
            UIManager.triggerHaptic();
            
            UIManager.showToast(`[${item.name}] 장착 상태가 변경되었습니다.`);
        }
    },
    
    Gacha: {
        performGacha(times) {
            const cost = times * 50; if(GameState.gem < cost) return UIManager.showToast("젬(💎)이 부족합니다! 보스를 토벌하세요.");
 // 광고 보지 말고 무조건 젬 소모하고 뽑기 진행!
            this._executeGachaLogic(times);
        },

        // 💡 [여기 추가됨!] 원래 performGacha 안에 있던 엄청 긴 가챠 로직들을 이 함수로 통째로 옮겨야 해!
        _executeGachaLogic(times) {
            GameState.gem -= (times * 50); GameState.save(); UIManager.updateCurrencyUI();
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
                // 💡 [수정] 수동으로 랭킹 등록할 때도 환생 횟수(prestige)가 제대로 저장되게 추가!
                await window.addDoc(window.collection(window.db, "rankings"), { deviceId: GameState.deviceId || 'unknown', nickname: nick, stage: GameState.rpgStage, skin: GameState.equippedSkin || 'none', prestige: GameState.prestigeCount || 0, timestamp: window.serverTimestamp() });
                UIManager.showToast("명예의 전당에 기록되었습니다! 🏆"); this.closeModal(); this.loadRanking();
            } catch(e) { console.error(e); UIManager.showToast("서버 통신에 실패했습니다."); } finally { btn.disabled = false; btn.innerHTML = '등록'; }
        },
        async updateRankingSilently() {
            if(GameState.nickname === "위대한 길드장" || !window.db) return;
            try { await window.addDoc(window.collection(window.db, "rankings"), { deviceId: GameState.deviceId || 'unknown', nickname: GameState.nickname, stage: GameState.rpgStage, skin: GameState.equippedSkin || 'none', prestige: GameState.prestigeCount || 0, timestamp: window.serverTimestamp() }); } catch(e) { console.error("Silent rank update failed", e); }
        },
        async loadRanking() {
            const list = document.getElementById('ranking-list'); 
            list.innerHTML = '<div class="text-center py-8"><div class="loader"></div><p class="text-sm text-slate-400 mt-3">서버에서 전설을 불러오는 중...</p></div>';
            if(!window.db) { list.innerHTML = '<div class="text-center py-8 text-red-400">데이터베이스 연결에 실패했습니다.</div>'; return; }
            try {
                const q = window.query(window.collection(window.db, "rankings"), window.limit(50)); 
                const snap = await window.getDocs(q);
                let all = []; snap.forEach(d => all.push(d.data()));
                
                // 💡 [핵심 수정] 랭킹 줄 세우기 (1순위: 환생, 2순위: 층수, 3순위: 달성 시간)
                all.sort((a,b) => { 
                    const prestigeA = a.prestige || 0;
                    const prestigeB = b.prestige || 0;
                    
                    if (prestigeA !== prestigeB) return prestigeB - prestigeA; // 1. 환생 횟수가 다르면 환생 높은 사람이 무조건 위!
                    if (b.stage !== a.stage) return b.stage - a.stage;         // 2. 환생 횟수가 같으면 층수가 높은 사람이 위!
                    
                    const timeA = a.timestamp ? (a.timestamp.toMillis ? a.timestamp.toMillis() : a.timestamp) : Date.now(); 
                    const timeB = b.timestamp ? (b.timestamp.toMillis ? b.timestamp.toMillis() : b.timestamp) : Date.now(); 
                    return timeA - timeB;                                      // 3. 다 똑같으면 먼저 도달한 사람이 위!
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
                    
                    let skinClass = "bg-gradient-to-tr from-slate-600 to-slate-400"; 
                    let sId = d.skin;
                    if(sId === 'r3') sId = 's_r1'; 
                    if(sId === 'e3') sId = 's_e1'; 
                    if(sId === 'l3') sId = 's_l1';
                    
                    if(sId && sId !== 'none' && GameData.items[sId]) {
                        skinClass = `skin-${GameData.items[sId].rarity}`;
                    }
                    
                    const isMe = (d.nickname === GameState.nickname); const myHighlight = isMe ? "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "border-transparent";
                    
                    // 환생 뱃지 달아주기
                    let prestigeText = d.prestige ? `<span class="text-[10px] text-purple-400 font-black mr-1">[${d.prestige}환생]</span>` : '';
                    
                    list.innerHTML += `<div class="p-4 rounded-xl flex items-center justify-between ${bgClass} border ${myHighlight} transition-all mb-3"><div class="flex items-center gap-4"><div class="w-12 text-center font-black ${i < 3 ? 'text-yellow-400' : 'text-slate-500'}">${rankIcon}</div><div class=\"master-avatar w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md ${skinClass}">${d.nickname.charAt(0)}</div><div><p class="font-bold text-white text-sm flex items-center gap-2">${d.nickname} ${isMe ? '<span class="text-[10px] bg-indigo-500 px-1.5 py-0.5 rounded text-white font-normal">ME</span>' : ''}</p></div></div><div class="text-right"><p class="text-xs text-slate-400">도달 층수</p><p class="text-lg font-black text-gradient-gold">${prestigeText}${d.stage}F</p></div></div>`;
                });
            } catch(e) { console.error(e); list.innerHTML = '<div class="text-center py-8 text-red-400">명예의 전당을 불러오지 못했습니다.</div>'; }
        }
    },

    Quest: {
        updateProgress(type, id, amount = 1) {
            if (type === 'daily') {
                const q = GameData.quests.daily.find(item => item.id === id);
                if (!q) return;
                const current = this.getDailyProgress(id);
                if (current >= q.goal) return; 
                
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
        },
        openModal() {
            AudioEngine.sfx.click();
            UIManager.triggerHaptic();
            document.getElementById('quest-modal').classList.add('active');
            this.switchTab('daily');
        },
        closeModal() {
            AudioEngine.sfx.click();
            document.getElementById('quest-modal').classList.remove('active');
        },
        switchTab(t) {
            AudioEngine.sfx.click();
            const isDaily = (t === 'daily');
            document.getElementById('quest-tab-daily').className = isDaily ? "flex-1 py-2 bg-slate-700 text-white border border-slate-500 text-xs font-bold rounded" : "flex-1 py-2 bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold rounded";
            document.getElementById('quest-tab-achieve').className = !isDaily ? "flex-1 py-2 bg-slate-700 text-white border border-slate-500 text-xs font-bold rounded" : "flex-1 py-2 bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold rounded";
            this.renderList(t);
        },
        renderList(type) {
            const container = document.getElementById('quest-list-container');
            container.innerHTML = '';
            const list = (type === 'daily') ? GameData.quests.daily : GameData.quests.achievements;

            list.forEach(q => {
                const progress = (type === 'daily') ? (GameState.questData.daily.progress[q.id] || 0) : (GameState.questData.achievements.progress[q.id] || 0);
                const isCompleted = (type === 'daily') ? (progress >= q.goal) : GameState.questData.achievements.completed.includes(q.id);
                const percent = Math.min(100, (progress / q.goal) * 100);

                container.innerHTML += `
                    <div class="p-4 bg-slate-900/60 rounded-xl border ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5'}">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h4 class="text-sm font-bold ${isCompleted ? 'text-emerald-400' : 'text-white'}">${q.name} ${isCompleted ? '✅' : ''}</h4>
                                <p class="text-[10px] text-slate-400">${q.desc}</p>
                            </div>
                            <div class="text-right">
                                <span class="text-[10px] font-bold text-cyan-400">💎 ${q.rewardGem}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="progress-track h-1.5 flex-1">
                                <div class="progress-fill ${isCompleted ? 'bg-emerald-500' : ''}" style="width: ${percent}%"></div>
                            </div>
                            <span class="text-[10px] font-bold text-slate-500 whitespace-nowrap">${progress} / ${q.goal}</span>
                        </div>
                    </div>
                `;
            });
        }
    },
    
    Battle: {
        monsterMaxHp: 0, monsterCurrentHp: 0, monsterAtkObj: 0, battleInterval: null, lastAttackTime: 0,
        // 💡 [추가] 데미지 텍스트를 화면에 그려주는 함수!
        showDamageText(targetId, text, typeClass) {
            const target = document.getElementById(targetId);
            if(!target) return;

            const textEl = document.createElement('div');
            textEl.innerText = text;
            textEl.className = `damage-text ${typeClass}`;

            // 숫자가 맨날 똑같은 데서 안 뜨고, 랜덤하게 살짝씩 흩뿌려지게!
            const randomX = (Math.random() - 0.5) * 60;
            const randomY = (Math.random() - 0.5) * 40;
            textEl.style.left = `calc(50% + ${randomX}px)`;
            textEl.style.top = `calc(50% + ${randomY}px)`;

            target.appendChild(textEl);

            // 0.7초 뒤에 태그 자동 삭제 (쓰레기 쌓이는 거 방지)
            setTimeout(() => { textEl.remove(); }, 700);
        },
        enterDungeon() {
            if (GameState.currentHp <= 0) return UIManager.showToast("체력이 없습니다! 여관에서 휴식하세요. ⛺");
            
            // 💡 [핵심 추가] 50층 마왕을 잡았으면(51층이 되면) 강제로 입장 막기!
            if (GameState.rpgStage > 50) {
                return UIManager.showToast("마왕을 토벌했습니다! 차원의 여신에게 환생을 요청하세요. ✨");
            }
            
            GameSystem.Quest.updateProgress('daily', 'd1');
            AudioEngine.sfx.click(); UIManager.triggerHaptic(); 
            document.getElementById('bottom-nav').style.display = 'none'; 
            
            const isBoss = (GameState.rpgStage % 5 === 0);
            
            if (!isBoss && Math.random() < 0.5) { 
                this.triggerRandomEvent(); 
            } else { 
                if (isBoss) {
                    const warning = document.getElementById('boss-warning-overlay');
                    if (warning) warning.classList.add('active');
                    UIManager.triggerHeavyHaptic();
                    setTimeout(() => { if (warning) warning.classList.remove('active'); this.initBattle(true); }, 1500);
                } else {
                    this.initBattle(false); 
                }
            }
        },
      triggerRandomEvent(roll) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); 
            document.getElementById('screen-rpg-event').classList.add('active');
            
            const titleEl = document.getElementById('event-title');
            const iconEl = document.getElementById('event-icon');
            const descEl = document.getElementById('event-desc');
            
            const eventType = Math.floor(Math.random() * 6); 
            let hpStat = GameState.getTotalStats().hp;

            if (eventType === 0) {
                titleEl.innerText = "숨겨진 보물상자!"; iconEl.innerText = "🎁"; titleEl.className = "text-2xl font-black text-yellow-400 mb-4"; 
                descEl.innerText = "상자를 열었더니 골드가 쏟아집니다!\n(+50G 획득)"; AudioEngine.sfx.coin(); 
                GameState.gold += 50; 
                
            } else if (eventType === 1) {
                titleEl.innerText = "함정 발동!"; iconEl.innerText = "🪤"; titleEl.className = "text-2xl font-black text-rose-500 mb-4"; 
                let dmg = Math.floor(hpStat * 0.15); 
                descEl.innerText = `독화살이 날아왔습니다!\n(-${dmg} HP)`; 
                // 💡 [수정] 피 1 보장 안전벨트 제거! (Math.max(0)으로 변경)
                GameState.currentHp = Math.max(0, GameState.currentHp - dmg); 
                AudioEngine.sfx.hit(); UIManager.triggerHeavyHaptic(); 
                
            } else if (eventType === 2) {
                titleEl.innerText = "요정의 축복"; iconEl.innerText = "🧚"; titleEl.className = "text-2xl font-black text-cyan-400 mb-4"; 
                let heal = Math.floor(hpStat * 0.3); 
                descEl.innerText = `요정이 상처를 치료해 줍니다.\n(+5💎, +${heal} HP)`; AudioEngine.sfx.coin(); 
                GameState.gem += 5; GameState.currentHp = Math.min(hpStat, GameState.currentHp + heal); 
                
            } else if (eventType === 3) {
                titleEl.innerText = "미믹의 기습!"; iconEl.innerText = "👅"; titleEl.className = "text-2xl font-black text-red-500 mb-4"; 
                let dmg = Math.floor(hpStat * 0.2); 
                descEl.innerText = `보물상자인 줄 알았지만 몬스터였습니다!\n상처를 입었지만 골드를 뱉어냈습니다.\n(-${dmg} HP, +50G)`;
                // 💡 [수정] 피 1 보장 안전벨트 제거!
                GameState.currentHp = Math.max(0, GameState.currentHp - dmg); 
                GameState.gold += 50;
                AudioEngine.sfx.hit(); UIManager.triggerHeavyHaptic(); 
                
            } else if (eventType === 4) {
                titleEl.innerText = "떠돌이 상인"; iconEl.innerText = "🧙‍♂️"; titleEl.className = "text-2xl font-black text-purple-400 mb-4"; 
                if (GameState.gold >= 50) {
                    GameState.gold -= 50; GameState.potions += 1;
                    descEl.innerText = `상인이 당신의 주머니에서 50G를 가져가고\n회복 물약(❤️)을 하나 두고 갔습니다!`; AudioEngine.sfx.coin(); 
                } else {
                    descEl.innerText = `가진 돈이 없어 상인이 무시하고 지나갑니다...`;
                }
                
            } else {
                titleEl.innerText = "저주받은 제단"; iconEl.innerText = "🩸"; titleEl.className = "text-2xl font-black text-rose-600 mb-4"; 
                let dmg = Math.floor(hpStat * 0.25); 
                descEl.innerText = `제단에 마스터의 피를 바치고 젬을 얻었습니다.\n(-${dmg} HP, +15💎)`;
                // 💡 [수정] 피 1 보장 안전벨트 제거!
                GameState.currentHp = Math.max(0, GameState.currentHp - dmg); 
                GameState.gem += 15;
                AudioEngine.sfx.hit(); UIManager.triggerHeavyHaptic(); 
            }
            
            // 💡 [추가] 만약 이 이벤트로 피가 0이 되었다면 텍스트랑 버튼 빨갛게 바꾸기!
            const btn = document.querySelector('#screen-rpg-event button');
            if (GameState.currentHp <= 0) {
                descEl.innerText += "\n\n💀 치명상! 마스터가 쓰러졌습니다...";
                btn.innerText = "쓰러짐...";
                btn.className = "w-full py-4 bg-red-900 hover:bg-red-800 text-white rounded-xl font-bold border border-red-700 active:scale-95 transition-all";
            } else {
                btn.innerText = "돌아가기";
                btn.className = "w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-slate-600 active:scale-95 transition-all";
            }
            
            UIManager.updateCurrencyUI(); 
        },

        // 💡 [수정] 이벤트 끝날 때 피가 0이면 다음 층으로 안 가고 부활 모달 띄우기!
        endEvent() { 
            document.getElementById('bottom-nav').style.display = 'flex'; 
            
            if (GameState.currentHp <= 0) {
                // 사망 처리
                GameState.save();
                UIManager.updateRpgLobbyUI();
                document.getElementById('screen-rpg-event').classList.remove('active');
                
                // 0.5초 뒤에 익숙한 그 부활 팝업 띄우기!
                setTimeout(() => {
                    document.getElementById('revive-modal').classList.add('active');
                }, 500);
            } else {
                // 살아있으면 정상적으로 다음 층으로 진입
                GameState.rpgStage++; 
                GameState.save(); 
                UIManager.navTo('screen-arena', document.querySelectorAll('.nav-item')[1]); 
            }
        },
       //몬스터 스탯
       //몬스터 스탯
     initBattle(isBoss) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-rpg-battle').classList.add('active');
            GameState.isBattling = true;
            localStorage.setItem('master_in_battle', 'true');

            // 💡 [핵심 수정] 환생 횟수에 따라 베이스 층수를 50씩 더해줌! (1환생 1층 = 51층 스펙)
            let prestigeCount = GameState.prestigeCount || 0;
            let prestigeMult = 1.0 + prestigeCount;
            let effStage = GameState.rpgStage + (prestigeCount * 50);

            // 뻥튀기된 effStage를 기준으로 몬스터 스탯 재계산!
            this.monsterMaxHp = Math.floor((effStage * 40 + (isBoss ? 200 : 0)) * prestigeMult); 
            this.monsterCurrentHp = this.monsterMaxHp;
            this.monsterAtkObj = Math.floor((effStage * 3 + (isBoss ? 15 : 0)) * prestigeMult);
            
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
            
            // 💡 [핵심 1] 여기서 새로운 갓-스탯들을 불러옵니다!
            const stats = GameState.getTotalStats(); 
            let myAtk = stats.atk; 
            let critChance = stats.critRate / 100;   // 예: 25% -> 0.25
            let critMultiplier = stats.critDmg / 100; // 예: 200% -> 2.0
            
            // 💡 [핵심 2] 크리티컬 터졌는지 주사위 굴리기!
            let isCrit = Math.random() < critChance; 
            let damage = isCrit ? Math.floor(myAtk * critMultiplier) : myAtk;
            this.monsterCurrentHp -= damage;
            
            // 💡 [핵심 3] 흡혈(피흡) 로직! 데미지에 비례해서 피가 찹니다.
            if (stats.vamp > 0 && GameState.currentHp < stats.hp) {
                let healAmount = Math.floor(damage * (stats.vamp / 100));
                if (healAmount > 0) {
                    GameState.currentHp = Math.min(stats.hp, GameState.currentHp + healAmount);
                    // 마스터 머리 위에 초록색 피흡 숫자 띄우기! (타격 이펙트 재활용)
                    this.showDamageText('battle-player-hp-text', `+${healAmount}`, 'text-emerald-400 font-black text-xl drop-shadow-md');
                }
            }

            const sprite = document.getElementById('monster-sprite');
            sprite.classList.remove('damage-flash'); void sprite.offsetWidth; sprite.classList.add('damage-flash');
            
            // 몬스터 머리 위에 데미지 텍스트 띄우기
            this.showDamageText('monster-avatar-wrap', isCrit ? `CRIT! ${damage}` : damage, isCrit ? 'damage-crit' : 'damage-monster');

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
            
            // 💡 [핵심 연동] 마스터(전투 창 전체) 위에 빨간색 데미지 띄우기!
            this.showDamageText('battle-card', `-${damage}`, 'damage-player');

            document.getElementById('battle-log').innerText = `💥 몬스터 반격! ${damage} 피해!`;
            this.updateBattleUI(); 
            if (GameState.currentHp <= 0) { clearInterval(this.battleInterval); setTimeout(() => this.endBattle(false), 300); }
        },
        endBattle(isWin) {
            clearInterval(this.battleInterval); GameState.isBattling = false; localStorage.removeItem('master_in_battle'); 
            const btnAtk = document.getElementById('btn-attack');
            btnAtk.disabled = true; btnAtk.innerHTML = "⚔️ 전투 종료";
            
            const isBoss = (GameState.rpgStage % 5 === 0);
            
            if (isWin) {
                document.getElementById('bottom-nav').style.display = 'flex'; 
                AudioEngine.sfx.coin(); UIManager.triggerHaptic();
                let rewardGold = isBoss ? (GameState.rpgStage * 30) : 10; let rewardGem = isBoss ? 50 : 0;
                GameState.gold += rewardGold; GameState.gem += rewardGem; GameState.rpgStage++; GameState.save();
                
                GameSystem.Quest.updateProgress('achievements', 'a3'); 
                if (GameState.rpgStage >= 5) GameSystem.Quest.updateProgress('achievements', 'a1', 5); 

                GameState.save();
                UIManager.updateCurrencyUI(); 
                GameSystem.Ranking.updateRankingSilently();
                UIManager.showToast(`🎉 토벌 성공! 🪙 +${rewardGold}G ${isBoss ? ' / 💎 +'+rewardGem : ''}`);
                document.getElementById('battle-log').innerText = `토벌 성공! 보상을 획득했습니다.`;
                
                setTimeout(() => {
                    UIManager.navTo('screen-arena', document.querySelectorAll('.nav-item')[1]);
                }, 1500);
            } else {
                // 💡 [부활 업데이트] 패배 시 쫓아내지 않고 부활 모달을 띄움!
                UIManager.triggerHeavyHaptic(); 
                GameState.currentHp = 0; 
                GameState.save();
                this.updateBattleUI(); // 피 0 된거 화면에 보여주기
                document.getElementById('battle-log').innerText = `마스터가 쓰러졌습니다...`;
                
                // 부활 팝업 짠!
                setTimeout(() => {
                    document.getElementById('revive-modal').classList.add('active');
                }, 500);
            }
        },
        // 💡 [신규] 차원의 여신 환생 시스템
      doPrestige() {
            // 💡 [핵심 수정] 50층을 클리어해서 '51층'이 되었을 때만 환생 버튼 작동!
            if (GameState.rpgStage <= 50) {
                return UIManager.showToast("50층의 마왕을 토벌해야 차원의 여신을 만날 수 있습니다!");
            }

            const isConfirm = confirm("✨ [차원의 여신]\n\n\"훌륭해요 용사님! 드디어 마왕을 무찌르셨군요.\n하지만 악의 근원은 아직 사라지지 않았답니다.\n제가 시간을 되돌려 드릴 테니, 더 강해진 모습으로 세상을 구해주세요!\"\n\n(환생하시겠습니까? 1층으로 돌아가며 모든 스탯이 영구적으로 대폭 상승합니다!)");

            if(isConfirm) {
                GameState.prestigeCount = (GameState.prestigeCount || 0) + 1;
                GameState.rpgStage = 1; 
                GameState.currentHp = GameState.getTotalStats().hp; 
                GameState.save();

                UIManager.showToast(`🎉 ${GameState.prestigeCount}번째 환생 완료! 마왕의 군대도 더욱 강해졌습니다!`);
                UIManager.updateRpgLobbyUI();
                GameSystem.Ranking.updateRankingSilently(); 
            }
        },
    } // <-- Battle 닫는 괄호
}; // <-- GameSystem 닫는 괄호 (이게 빠져서 에러가 났던 거야!)

// =========================================================================
// 💡 [스마트 보상 시스템] 광고 꼬리표 달기!
// =========================================================================

// 현재 유저가 어떤 이유로 광고를 보는지 저장하는 꼬리표 변수
window.currentAdAction = ''; 

// 1. 젬 받기 버튼 눌렀을 때
window.watchAdForGems = function() {
    window.currentAdAction = 'gems'; // 꼬리표: "얘는 젬 주려고 본 거임!"
    AudioEngine.sfx.click();
    if (window.AppChannel) window.AppChannel.postMessage('SHOW_REWARD_AD');
    else window.onRewardEarned(); // PC웹 테스트용
};

// 2. 부활하기 버튼 눌렀을 때
window.watchAdForRevive = function() {
    window.currentAdAction = 'revive'; // 꼬리표: "얘는 부활하려고 본 거임!"
    AudioEngine.sfx.click();
    if (window.AppChannel) window.AppChannel.postMessage('SHOW_REWARD_AD');
    else window.onRewardEarned();
};

// 3. 포기하고 마을로 갈 때
// 3. 포기하고 마을로 갈 때
window.giveUpBattle = function() {
    document.getElementById('revive-modal').classList.remove('active');
    UIManager.showToast(`💀 쓰러졌습니다... 여관에서 휴식하세요.`);
    
    // 💡 [핵심 추가] 숨겨졌던 하단 메뉴바(네비게이션)를 다시 나타나게 켜주기!
    document.getElementById('bottom-nav').style.display = 'flex'; 
    
    UIManager.navTo('screen-arena', document.querySelectorAll('.nav-item')[1]);
};

// 💡 [핵심] 플러터가 광고 시청 완료 후 실행하는 함수
window.onRewardEarned = function() {
    console.log("광고 시청 완료! 꼬리표 확인 중...", window.currentAdAction);
    
    // 꼬리표가 'gems' 일 때
    if (window.currentAdAction === 'gems') {
        GameState.gem += 50;
        GameState.save();
        UIManager.updateCurrencyUI();
        AudioEngine.sfx.coin();
        UIManager.triggerHaptic();
        UIManager.showToast("📺 광고 시청 보상! 50 💎 획득!");
    } 
    // 꼬리표가 'revive' 일 때
   else if (window.currentAdAction === 'revive') {
        document.getElementById('revive-modal').classList.remove('active'); // 부활 창 끄기
        
        GameState.currentHp = GameState.getTotalStats().hp; // 체력 100% 회복!
        
        // 💡 [핵심 추가] 시스템한테 다시 전투 중이라고 멱살 잡고 알려주기!
        GameState.isBattling = true; 
        localStorage.setItem('master_in_battle', 'true'); 
        document.getElementById('battle-log').innerText = `✨ 기적적인 부활! 반격을 시작하세요!`; // 텍스트도 멋지게 변경

        GameState.save();
        GameSystem.Battle.updateBattleUI(); // 전투 화면 체력바 쫙 채워주기
        
        UIManager.triggerHaptic();
        AudioEngine.sfx.coin(); 
        UIManager.showToast("✨ 기적적으로 부활했습니다! 전투를 이어갑니다.");
        
        // 🛑 멈췄던 몬스터의 공격과 전투 버튼을 다시 확실하게 살려줌!
        clearInterval(GameSystem.Battle.battleInterval); // 혹시 모를 타이머 중복 꼬임 방지
        GameSystem.Battle.battleInterval = setInterval(() => GameSystem.Battle.monsterAttack(), 1500);
        
        const btnAtk = document.getElementById('btn-attack');
        btnAtk.disabled = false;
        btnAtk.classList.remove('opacity-50'); // 버튼 회색으로 변한 것도 원래대로!
        btnAtk.innerHTML = "⚔️ 공격 (TAP!)";
    }

    // 보상 줬으니 꼬리표 초기화
    window.currentAdAction = ''; 
};




















