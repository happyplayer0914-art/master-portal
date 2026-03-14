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
        // 👇 여기서부터 복사해서 끼워 넣기!
      applyBackground() {
            const appBody = document.body; 
            const dynamicBg = document.getElementById('dynamic-bg'); 
            const bgId = GameState.equippedBg;

            if (bgId && window.GameData && GameData.cosmetics && GameData.cosmetics.backgrounds) {
                const bgItem = GameData.cosmetics.backgrounds.find(b => b.id === bgId);
                if (bgItem) {
                    appBody.style.backgroundImage = `url('assets/backgrounds/${bgItem.img}')`;
                    appBody.style.backgroundSize = "cover";
                    appBody.style.backgroundPosition = "center";
                    appBody.style.backgroundAttachment = "fixed";
                    
                    // 🌟 [핵심 해결책] 배경을 꽉 막고 있던 게임 화면(.screen)들을 반투명하게 만듭니다!
                    document.querySelectorAll('.screen').forEach(s => {
                        s.style.backgroundColor = 'rgba(15, 23, 42, 0.6)'; // 살짝 어두운 반투명 색상
                        s.style.backdropFilter = 'blur(2px)'; // 뒷배경이 살짝 흐릿하게 보이게 뽀샤시 효과 (선택사항)
                    });

                    if (dynamicBg) dynamicBg.style.display = 'none'; 
                    return;
                }
            }
            
            // 장착 해제 시 원상복구 (다시 까만 화면으로!)
            appBody.style.backgroundImage = "none";
            document.querySelectorAll('.screen').forEach(s => {
                s.style.backgroundColor = ''; 
                s.style.backdropFilter = '';
            });
            if (dynamicBg) dynamicBg.style.display = 'block'; 
        },
     // 👇 여기서부터 복사해서 끼워넣기!
        getCurrentTitle() {
            // 이제 장비 스탯을 보지 않고, 유저가 직접 장착한 칭호(equippedTitle)를 확인합니다!
            const tId = GameState.equippedTitle;
            
            if (tId && tId !== 'none' && tId !== 'default' && window.GameData && GameData.cosmetics && GameData.cosmetics.titles) {
                const tItem = GameData.cosmetics.titles.find(t => t.id === tId);
                if (tItem) {
                    // 긴 이름에서 끝 단어만 추출 (예: 전장을 지배하는 '군주')
                    const words = tItem.name.split(' ');
                    const shortJob = words[words.length - 1]; 
                    
                    return {
                        full: `✨ ${tItem.name} [${tItem.reqMbti}] ✨`, // 랭킹용 (전체)
                        short: `✨ ${shortJob} [${tItem.reqMbti}] ✨`       // 채팅용 (축약)
                    };
                }
            }
            return null; // 조건 미달 시 칭호 없음
        },
        // 👆 여기까지!
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
     claimIdleReward(isAd = false) {
            const amount = this.calculateIdleReward();
            if (amount <= 0) return UIManager.showToast("누적된 지원금이 없습니다. 💤");
            
            // 📺 1. [광고 보고 2배!] 버튼을 눌렀을 때
            if (isAd) {
                // 꼬리표 달기!
                window.currentAdAction = 'idle_double'; 
                
                // 🔌 [핵심 추가] 진짜로 광고 호출하기!
                if (window.flutter_inappwebview) {
                    // 마스터의 플러터 앱에서 광고를 띄우는 진짜 명령어!
                    window.flutter_inappwebview.callHandler('showRewardAd'); 
                } else {
                    // 💡 [웹 테스트용] PC 브라우저에서는 플러터가 없으니까 가짜로 2초 뒤에 보상 주기!
                    UIManager.showToast("📺 (PC 테스트) 광고 시청 중... 2초 뒤 보상 지급!");
                    setTimeout(() => { 
                        if (window.onRewardEarned) window.onRewardEarned(); 
                    }, 2000); 
                }
                
                return; // 여기서 멈추고 광고 다 볼 때까지 대기!
            }

            // 💤 2. [그냥 받기] 버튼을 눌렀을 때 (기존 그대로)
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
          // 💡 [퀘스트 센서] 인기 폭발 테스트를 누르면 일일 퀘스트(d2) 카운트 1 증가!
            GameSystem.Quest.update('daily', 'd2', 1);
            GameState.lastPlayRewards[testUrl] = today; 
            GameState.save(); 
            UIManager.updateCurrencyUI(); 
            AudioEngine.sfx.coin(); 
            UIManager.showToast("탐험 지원금 10G 획득 🪙"); 
        },
        getUpgradeCost(t) { 
            // 💡 [공식 적용] 기본 비용 50G 시작, 1업당 20G씩 증가
            if (t === 'atk') {
                // (현재 공격력 - 10) / 4를 하면 현재 몇 번 업글했는지 나옴!
                const upgradeCount = Math.floor((GameState.rpgAtk - 10) / 4);
                return 50 + (upgradeCount * 20); 
            } else { 
                // (현재 체력 - 100) / 40을 하면 현재 몇 번 업글했는지 나옴!
                const upgradeCount = Math.floor((GameState.rpgMaxHp - 100) / 40);
                return 50 + (upgradeCount * 20); 
            }
        },
upgradeStat(t) {
            const cost = this.getUpgradeCost(t); 
            if(GameState.gold < cost) return UIManager.showToast("골드가 부족합니다! 🪙");
            
            // 💡 [수정됨] 악덕 대장장이 검거! 결제는 딱 한 번만!
            GameState.gold -= cost; 
            
            // 💡 [퀘스트 센서 추가!] 스탯 1번 올릴 때마다 발동!
            if(GameSystem.Quest) {
                GameSystem.Quest.update('daily', 'd3', 1); 
                GameSystem.Quest.update('weekly', 'w4', 1);
            }
            
          // 💡 [공식 적용] 오직 + 로만 깔끔하게 증가!
            if(t === 'atk') {
                GameState.rpgAtk += 4; 
            } else { 
                GameState.rpgMaxHp += 40; 
                GameState.currentHp += 40; 
            }
            
            GameState.save(); 
            UIManager.updateCurrencyUI(); 
            UIManager.updateRpgLobbyUI(); 
            AudioEngine.sfx.coin(); 
            UIManager.triggerHaptic(); 
            UIManager.showToast("스탯 강화 성공! ✨");
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
            const cost = times * 50; 
            if(GameState.gem < cost) return UIManager.showToast("젬(💎)이 부족합니다! 보스를 토벌하세요.");
            // 광고 보지 말고 무조건 젬 소모하고 뽑기 진행!
            this._executeGachaLogic(times);
        },

        // 💡 [대격변 완료!] 극악의 0.1% 확률 엔진과 신화(Mythic) 연출 탑재!
        _executeGachaLogic(times) {
            GameState.gem -= (times * 50); GameState.save(); UIManager.updateCurrencyUI();
            document.getElementById('bottom-nav').style.display = 'none'; 
            const over = document.getElementById('gacha-overlay'); const resBox = document.getElementById('gacha-results-container'); const anim = document.getElementById('gacha-animation');
            over.classList.add('active'); resBox.classList.add('hidden'); resBox.innerHTML = ''; anim.classList.remove('hidden'); document.getElementById('gacha-title').innerText = "소환의식 진행 중...";
            document.getElementById('gacha-close-btn').classList.add('hidden');
            AudioEngine.sfx.gacha_build(); UIManager.triggerHeavyHaptic();
            
            let results = [];
            for(let i=0; i<times; i++) {
                // 🌟 [확률 엔진 교체] 마스터가 지시한 황금 밸런스 확률!
                const roll = Math.random() * 100; 
                let rarity = 'common'; 
                
                if (roll < 0.1) rarity = 'mythic';               // 🌟 0.1% (신화)
                else if (roll < 0.1 + 2.5) rarity = 'legendary'; // 2.5% (전설)
                else if (roll < 0.1 + 2.5 + 7.5) rarity = 'epic'; // 7.5% (영웅)
                else if (roll < 0.1 + 2.5 + 7.5 + 25.0) rarity = 'rare'; // 25.0% (희귀)
                else rarity = 'common';                          // 나머지 64.9% (일반)
                
                const pool = Object.values(GameData.items).filter(it => it.rarity === rarity);
                // (방어막) 만약 해당 등급 템이 없으면 튕기지 않고 일반 템으로 대체!
                const safePool = pool.length > 0 ? pool : Object.values(GameData.items).filter(it => it.rarity === 'common');
                
                const item = safePool[Math.floor(Math.random() * safePool.length)];
                
                // 마스터의 기존 인벤토리 저장 로직 유지 (item.id가 없으면 객체 키값을 찾아서 저장)
                const itemId = item.id || Object.keys(GameData.items).find(key => GameData.items[key] === item);
                results.push({ id: itemId, ...item }); 
                GameState.inventory.push(itemId);
            }
            GameState.save();
            
            setTimeout(() => {
                AudioEngine.sfx.gacha_reveal(); UIManager.triggerHaptic();
                anim.classList.add('hidden'); resBox.classList.remove('hidden'); document.getElementById('gacha-title').innerText = "소환 결과!";
                resBox.className = times === 1 ? "w-full max-w-xs grid grid-cols-1 gap-4" : "w-full max-w-sm grid grid-cols-2 gap-3 overflow-y-auto max-h-[60vh] pb-10";
                
                results.forEach((item, index) => {
                    setTimeout(() => {
                        // 🌟 [UI 업데이트] 신화(Mythic) 라벨 및 색상 처리!
                        let rarityLabel = item.rarity === 'mythic' ? "✨신화✨" : item.rarity === 'legendary' ? "전설" : item.rarity === 'epic' ? "영웅" : item.rarity === 'rare' ? "희귀" : "일반";
                        
                        // 신화가 뜨면 텍스트가 빨간색으로 반짝거림!
                        let colorClass = item.rarity === 'mythic' ? "text-red-400 font-extrabold animate-pulse" : (item.color || "text-gray-300");
                        
                        const cardHtml = `<div class="gacha-item-card item-card rarity-${item.rarity}"><span class="text-[10px] font-bold mb-1 ${colorClass} tracking-widest">[${rarityLabel}]</span><div class="text-4xl mb-1 filter drop-shadow-lg">${item.emoji}</div><h4 class="text-white font-bold text-xs text-center break-keep">${item.name}</h4></div>`;
                        
                        resBox.insertAdjacentHTML('beforeend', cardHtml);
                        
                        // 🌟 신화나 전설이 떴을 때 진동 빡! 오고 화면 덜덜 떨리기!
                        if(item.rarity === 'mythic' || item.rarity === 'legendary') {
                            if(UIManager.triggerHeavyHaptic) UIManager.triggerHeavyHaptic(); 
                        }
                        if(item.rarity === 'mythic') {
                            const overlay = document.getElementById('gacha-overlay');
                            overlay.classList.add('shake');
                            setTimeout(() => overlay.classList.remove('shake'), 400); // 0.4초 뒤 진동 멈춤
                        }
                    }, index * 100); 
                });
                setTimeout(() => { document.getElementById('gacha-close-btn').classList.remove('hidden'); }, results.length * 100 + 300);
            }, 1500);
        },
        closeGacha() { AudioEngine.sfx.click(); document.getElementById('gacha-overlay').classList.remove('active'); document.getElementById('bottom-nav').style.display = 'flex'; }
    },
    
 Ranking: {
        openRegisterModal() { 
            UIManager.showToast("마스터의 최고 기록은 10초마다 명예의 전당에 자동 등록됩니다! 🚀");
        },
        closeModal() { 
            const modal = document.getElementById('nickname-modal');
            if(modal) modal.classList.remove('active');
        },
       async updateRankingSilently() {
            if (GameState.nickname === "위대한 길드장" || !window.db) return;
            const uid = localStorage.getItem('master_uid');
            if (!uid) return;

            // 💡 현재 내 칭호를 판독기에서 가져옴!
            const titleInfo = GameSystem.Lobby.getCurrentTitle();

            try { 
                await window.setDoc(window.doc(window.db, "rankings", uid), { 
                    uid: uid,
                    nickname: GameState.nickname, 
                    stage: GameState.rpgStage, 
                    skin: GameState.equippedSkin || 'none', 
                    prestige: GameState.prestigeCount || 0, 
                    title: titleInfo ? titleInfo.full : null, // 👈 파이어베이스에 풀버전 칭호 저장!
                    // 🌟 [추가할 핵심 코드!!] 내가 지금 끼고 있는 테두리 정보를 서버로 보냅니다!
                skin: GameState.equippedSkin || 'none',
                    timestamp: window.serverTimestamp()
                }, { merge: true }); 
            } catch(e) { console.error("오토 랭킹 갱신 실패", e); }
        },
      async loadRanking() {
            const list = document.getElementById('ranking-list'); 
            if(!list) return;
            list.innerHTML = '<div class="text-center py-8"><div class="loader"></div><p class="text-sm text-slate-400 mt-3">서버에서 전설을 불러오는 중...</p></div>';
            
            if(!window.db) { list.innerHTML = '<div class="text-center py-8 text-red-400">데이터베이스 연결에 실패했습니다.</div>'; return; }
            
            try {
                const q = window.query(window.collection(window.db, "rankings"), window.limit(100)); 
                const snap = await window.getDocs(q);
                let all = []; 
                snap.forEach(d => all.push(d.data()));
                
                // 1순위: 환생, 2순위: 층수, 3순위: 도달 시간으로 정렬
                all.sort((a,b) => { 
                    const prestigeA = a.prestige || 0;
                    const prestigeB = b.prestige || 0;
                    if (prestigeA !== prestigeB) return prestigeB - prestigeA; 
                    if (b.stage !== a.stage) return b.stage - a.stage; 
                    
                    const timeA = a.timestamp ? (a.timestamp.toMillis ? a.timestamp.toMillis() : a.timestamp) : Date.now(); 
                    const timeB = b.timestamp ? (b.timestamp.toMillis ? b.timestamp.toMillis() : b.timestamp) : Date.now(); 
                    return timeA - timeB; 
                });
                
                // 💡 [핵심 복구] 같은 닉네임이나 계정이면 '최고 기록' 1개만 남기고 다 거르기!
                let uniqueTop10 = [];
                let seen = new Set();
                
                for (let d of all) {
                    const id = d.uid || d.nickname; // 고유 ID가 없으면 닉네임으로라도 구별
                    if (!seen.has(id)) {
                        seen.add(id);
                        uniqueTop10.push(d);
                    }
                    if (uniqueTop10.length >= 10) break; // 딱 10명 모이면 멈춤!
                }
                
                if(uniqueTop10.length === 0) { list.innerHTML = '<div class="text-center py-8 text-slate-400">아직 명예의 전당에 오른 자가 없습니다.</div>'; return; }
                list.innerHTML = '';
                
                uniqueTop10.forEach((d, i) => {
                   let rankIcon = `${i + 1}위`; let bgClass = "bg-slate-900";
                    if(i === 0) { rankIcon = "🥇 1위"; bgClass = "bg-gradient-to-r from-yellow-900/40 to-slate-900 border border-yellow-500/30"; } else if(i === 1) { rankIcon = "🥈 2위"; bgClass = "bg-slate-800 border border-slate-400/30"; } else if(i === 2) { rankIcon = "🥉 3위"; bgClass = "bg-orange-950/30 border border-orange-700/30"; }
                    
                  // 👇 [수정됨] 랭킹 테두리 불러오기 로직 교체!
                    let skinClass = "bg-gradient-to-tr from-slate-600 to-slate-400 border border-slate-600"; 
                    let sId = d.skin;
                    if(sId && sId !== 'none' && window.GameData && GameData.cosmetics && GameData.cosmetics.borders) {
                        const bItem = GameData.cosmetics.borders.find(x => x.id === sId);
                        // 💡 여기에 bg-slate-800 을 추가했습니다!
                        if(bItem) skinClass = `bg-slate-800 ${bItem.cssClass}`; 
                    }
                    // 👆 여기까지!
                    
                  const isMe = (d.nickname === GameState.nickname); const myHighlight = isMe ? "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "border-transparent";
                    
                    // 💡 [수정1] 환생 텍스트가 절대 줄바꿈 되지 않도록 whitespace-nowrap 추가!
                    let prestigeText = d.prestige ? `<span class="text-[9px] sm:text-[10px] text-purple-400 font-black mr-1 whitespace-nowrap">[${d.prestige}환생]</span>` : '';
                    
                    // 💡 [수정2] 칭호가 너무 길면 말줄임표(...)로 잘리도록 truncate와 너비 속성 추가!
                    let titleHtml = d.title ? `<div class="text-[8px] sm:text-[9px] text-red-400 font-black mb-0.5 animate-pulse drop-shadow-md truncate w-full">${d.title}</div>` : '';
                    
                    // 💡 [수정3] 오른쪽 구역이 찌그러지지 않게 flex-shrink-0, 왼쪽은 유연하게 줄어들게 flex-1 min-w-0 적용!
                    list.innerHTML += `
                        <div class="p-3 sm:p-4 rounded-xl flex items-center justify-between ${bgClass} border ${myHighlight} transition-all mb-3 gap-2">
                            <div class="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                <div class="w-10 sm:w-12 text-center font-black ${i < 3 ? 'text-yellow-400' : 'text-slate-500'} flex-shrink-0">${rankIcon}</div>
                                <div class="master-avatar w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md ${skinClass} flex-shrink-0">${d.nickname.charAt(0)}</div>
                                <div class="flex flex-col min-w-0 flex-1">
                                    ${titleHtml}
                                    <p class="font-bold text-white text-sm flex items-center gap-1.5 truncate">${d.nickname} ${isMe ? '<span class="text-[9px] bg-indigo-500 px-1 py-0.5 rounded text-white font-normal flex-shrink-0">ME</span>' : ''}</p>
                                </div>
                            </div>
                            <div class="text-right flex-shrink-0 whitespace-nowrap">
                                <p class="text-[10px] sm:text-xs text-slate-400">도달 층수</p>
                                <p class="text-base sm:text-lg font-black text-gradient-gold flex items-center justify-end">${prestigeText}${d.stage}F</p>
                            </div>
                        </div>`;
                });
            } catch(e) { console.error(e); list.innerHTML = '<div class="text-center py-8 text-red-400">명예의 전당을 불러오지 못했습니다.</div>'; }
        }
    }, // 🚨 [랭킹 끝]
// 💬 [개편] 실시간 다중 채널 채팅 & 공지 시스템!
   // ... (기존 GameSystem 코드) ...
    Chat: {
        lastChatTime: 0,
        unsubChat: null,
        unsubNotice: null, 
        initialLoadDone: false,
        
        // 💡 [수정] 기본 채널을 통합 광장(G)으로 변경!
        currentRoom: 'G', 

        init() {
            // ... (기존 init 로직 동일) ...
            if (!window.db) return;
            const qNotice = window.query(window.collection(window.db, "notices"), window.orderBy("timestamp", "desc"), window.limit(10));
            this.unsubNotice = window.onSnapshot(qNotice, (snapshot) => {
                // ... (공지사항 수신 로직 동일) ...
                const noticeBox = document.getElementById('notice-box');
                if (!noticeBox) return;
                let notices = [];
                snapshot.forEach(doc => notices.push(doc.data()));
                if (notices.length === 0) {
                    noticeBox.innerHTML = '<div class="text-center text-yellow-500/50 mt-2">최근 공지가 없습니다. 평화롭네요! 🕊️</div>';
                } else {
                    noticeBox.innerHTML = notices.map(n => `<div class="mb-1.5 border-b border-yellow-700/30 pb-1"><span class="text-yellow-400 font-bold">📢 [시스템]</span> <span class="text-yellow-100">${this.escapeHTML(n.text)}</span></div>`).join('');
                }
            });

            this.listenRoom(this.currentRoom);
        },

        // 📺 [수정] 3개 채널 탭 색상 변경 및 이동 로직 (완벽 픽스!)
        switchRoom(roomName) {
            if (this.currentRoom === roomName) return; 
            this.currentRoom = roomName;

            const btnG = document.getElementById('btn-room-G');
            const btnI = document.getElementById('btn-room-I');
            const btnE = document.getElementById('btn-room-E');
            
            // 1. 일단 3개 버튼의 불을 전부 확실하게 끕니다! (회색으로 초기화)
            if (btnG) btnG.className = "flex-1 bg-slate-800 text-slate-400 py-2 rounded-t-xl font-bold text-xs border border-slate-700 border-b-0 hover:text-white transition-all";
            if (btnI) btnI.className = "flex-1 bg-slate-800 text-slate-400 py-2 rounded-t-xl font-bold text-xs border border-slate-700 border-b-0 hover:text-white transition-all";
            if (btnE) btnE.className = "flex-1 bg-slate-800 text-slate-400 py-2 rounded-t-xl font-bold text-xs border border-slate-700 border-b-0 hover:text-white transition-all";

            // 2. 지금 들어간 방의 버튼만 예쁜 색깔로 불을 켭니다!
            if (roomName === 'G' && btnG) {
                btnG.className = "flex-1 bg-emerald-600 text-white py-2 rounded-t-xl font-bold text-xs border border-emerald-500 border-b-0 transition-all shadow-md";
            } else if (roomName === 'I' && btnI) {
                btnI.className = "flex-1 bg-indigo-600 text-white py-2 rounded-t-xl font-bold text-xs border border-indigo-500 border-b-0 transition-all shadow-md";
            } else if (roomName === 'E' && btnE) {
                btnE.className = "flex-1 bg-orange-600 text-white py-2 rounded-t-xl font-bold text-xs border border-orange-500 border-b-0 transition-all shadow-md";
            }

            // 3. 새 방에 들어왔으니 채팅창 안내 메시지 띄우기 (이름 변경 반영)
            const roomTitle = roomName === 'G' ? '통합 주점' : roomName === 'I' ? 'I (내향) 주점' : 'E (외향) 주점';
            document.getElementById('chat-messages').innerHTML = `<div class="text-center text-slate-500 text-xs py-8 font-bold">📡 [${roomTitle}] 채널에 입장했습니다!</div>`;

            // 4. 기존 방 수신기 끄고, 새 방 수신기 켜기!
            if (this.unsubChat) this.unsubChat();
            this.listenRoom(roomName);
        },

        // ... (아래 listenRoom, renderMessages, sendMessage 등은 기존 코드 그대로 유지) ...

        // 🎧 특정 방의 채팅만 듣는 수신기!
        listenRoom(roomName) {
            // 💡 핵심: 방 이름에 따라 서버 폴더를 다르게 씀! (chats_I 또는 chats_E)
            const qChat = window.query(window.collection(window.db, `chats_${roomName}`), window.orderBy("timestamp", "desc"), window.limit(30));
            
            this.unsubChat = window.onSnapshot(qChat, (snapshot) => {
                let messages = [];
                snapshot.forEach(doc => messages.push(doc.data()));
                messages.reverse();
                
                this.renderMessages(messages);

                if (this.initialLoadDone) {
                    const tavernScreen = document.getElementById('screen-tavern');
                    const notiDot = document.getElementById('chat-noti-dot');
                    if (tavernScreen && !tavernScreen.classList.contains('active') && notiDot) {
                        notiDot.classList.remove('hidden');
                    }
                } else {
                    this.initialLoadDone = true; 
                }
            });
        },

     renderMessages(messages) {
            const chatList = document.getElementById('chat-messages');
            if (!chatList) return;
            
            chatList.innerHTML = `<div class="text-center text-slate-500 text-xs py-2 border-b border-slate-700/50 mb-2">매너 채팅 부탁드립니다! ✨</div>`;
            
            messages.forEach(msg => {
                const isMe = (msg.nickname === GameState.nickname);
                const timeStr = msg.timestamp ? new Date(msg.timestamp.toMillis()).toLocaleTimeString('ko-KR', {hour: '2-digit', minute:'2-digit'}) : '';
                // 💡 [수정] 칭호 HTML (닉네임 옆에 나란히 배치될 용도)
                let titleHtml = msg.titleShort ? `<span class="text-[9px] text-red-400 font-bold drop-shadow-md">${msg.titleShort}</span>` : '';
                
              // 👇 [수정됨] 채팅 프로필 테두리 불러오기
                let skinClass = "bg-slate-700 border border-slate-600"; 
                if(msg.skin && msg.skin !== 'none' && window.GameData && GameData.cosmetics && GameData.cosmetics.borders) {
                    const bItem = GameData.cosmetics.borders.find(x => x.id === msg.skin);
                    // 💡 여기도 bg-slate-800 을 추가했습니다!
                    if(bItem) skinClass = `bg-slate-800 ${bItem.cssClass}`;
                }

           // 👇 [추가됨] 채팅 말풍선 불러오기
                let bubbleClass = isMe ? "bg-indigo-600 text-white" : "bg-slate-700 text-white"; // 기본 말풍선
                if(msg.bubble && msg.bubble !== 'none' && window.GameData && GameData.cosmetics && GameData.cosmetics.bubbles) {
                    const bubItem = GameData.cosmetics.bubbles.find(x => x.id === msg.bubble);
                    if(bubItem) bubbleClass = bubItem.bgClass; // 황금빛 외침 등 커스텀 말풍선 적용!
                }

                if (isMe) {
                    let myTitleHtml = msg.titleShort ? `<div class="w-full text-right text-[9px] text-red-400 font-bold mb-0.5 drop-shadow-md pr-1">${msg.titleShort}</div>` : '';
                    chatList.innerHTML += `
                        <div class="flex justify-end mb-2">
                            <div class="flex flex-col items-end max-w-[75%]">
                                ${myTitleHtml}
                                <div class="flex items-end gap-1">
                                    <span class="text-[9px] text-slate-500 mb-1">${timeStr}</span>
                                    <div class="${bubbleClass} text-sm px-3 py-2 rounded-2xl rounded-tr-sm shadow-md break-all">${this.escapeHTML(msg.text)}</div>
                                </div>
                            </div>
                        </div>`;
                } else {
                    chatList.innerHTML += `
                        <div class="flex justify-start mb-2 gap-2">
                            <div class="master-avatar w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0 border border-slate-600 ${skinClass}">${msg.nickname.charAt(0)}</div>
                            <div class="flex flex-col items-start max-w-[75%]">
                                <div class="flex items-center gap-1.5 mb-0.5">
                                    <span class="text-[10px] text-slate-400 font-bold">${msg.nickname}</span>
                                    ${titleHtml}
                                </div>
                                <div class="flex items-end gap-1">
                                    <div class="${bubbleClass} text-sm px-3 py-2 rounded-2xl rounded-tl-sm shadow-md break-all">${this.escapeHTML(msg.text)}</div>
                                    <span class="text-[9px] text-slate-500 mb-1">${timeStr}</span>
                                </div>
                            </div>
                        </div>`;
                }
            });
            chatList.scrollTop = chatList.scrollHeight;
        },

        async sendMessage() {
            const uid = localStorage.getItem('master_uid');
            if (!uid || GameState.nickname === "위대한 길드장") {
                if (confirm("주점에서 대화하려면 구글 로그인과 닉네임 설정이 필요합니다!\n지금 설정하시겠습니까?")) {
                    GameSystem.setFixedNickname();
                }
                return;
            }

            const now = Date.now();
            if (now - this.lastChatTime < 3000) return UIManager.showToast("⏳ 숨 좀 고르고 말씀하세요! (3초 쿨타임)");

            const input = document.getElementById('chat-input');
            const text = input.value.trim();
            if (!text) return;

            const linkPattern = /(http|https|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/|\b))/i;
            if (linkPattern.test(text)) return UIManager.showToast("🚨 경고: 채팅에 외부 링크는 포함할 수 없습니다!");

            input.value = '';
            this.lastChatTime = now;

            // 💡 핵심: 현재 방 이름에 맞춰서 폴더를 골라 전송!
            const collectionName = `chats_${this.currentRoom}`;
            // 💡 현재 내 칭호 정보 가져오기!
            const titleInfo = GameSystem.Lobby.getCurrentTitle();

          try {
                // 👇 [수정됨] 여기에 skin 정보를 추가로 담아서 파이어베이스로 쏩니다!
                await window.addDoc(window.collection(window.db, collectionName), {
                    uid: uid,
                    nickname: GameState.nickname,
                    text: text,
                    titleShort: titleInfo ? titleInfo.short : null, 
                    skin: GameState.equippedSkin || 'none', // ✨ 치장품(테두리) 정보 추가!
                    bubble: GameState.equippedBubble || 'none', // 👈 [추가됨] 말풍선 정보도 랭킹 서버로 슝!
                    timestamp: window.serverTimestamp()
                });

                // 청소기도 해당 방만 청소하도록 업그레이드!
                if (Math.random() < 0.1) {
                    const oldQuery = window.query(window.collection(window.db, collectionName), window.orderBy("timestamp", "asc"), window.limit(5));
                    const snap = await window.getDocs(oldQuery);
                    snap.forEach(d => window.deleteDoc(d.ref));
                }
            } catch(e) {
                console.error(e);
                UIManager.showToast("채팅 전송에 실패했습니다 😢");
            }
        },

        // 📢 [시스템 공지 발송] - 이건 notices 폴더로 따로 날아감!
        async sendSystemMessage(message) {
            if (!window.db) return;
            try {
                await window.addDoc(window.collection(window.db, "notices"), {
                    text: message,
                    timestamp: window.serverTimestamp()
                });
                
// 🚨 청소기 압수!! (너무 열심히 일해서 당분간 정지시킴 ㅋㅋㅋ)
                // 나중에 공지가 진짜 100개쯤 쌓이면 그때 다시 살려줄게!
                
            } catch(e) {
                console.error("시스템 공지 전송 실패:", e);
            }
        },

        clearNoti() {
            const notiDot = document.getElementById('chat-noti-dot');
            if (notiDot) notiDot.classList.add('hidden');
        },

        escapeHTML(str) {
            return str.replace(/[&<>'"]/g, tag => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
            }[tag] || tag));
        }
    }, // 👈 완벽한 콤마 마무리!

    
    // 🔒 [닉네임 영구 고정 & 중복 방지 시스템 - 게스트 환영 버전!]
    async setFixedNickname() {
        if (GameState.nickname !== "위대한 길드장") {
            return UIManager.showToast("닉네임은 한 번 정하면 절대 바꿀 수 없습니다! 🔒");
        }

        // 💡 [핵심] 로그인 안 한 유저(게스트)가 닉네임 바꾸려고 하면 아주 자연스럽게 로그인 유도!
        const uid = localStorage.getItem('master_uid');
        if (!uid) {
            if (confirm("데이터를 안전하게 클라우드에 보관하고, 다른 마스터들과 소통하려면 '구글 로그인'이 필요합니다.\n지금 바로 로그인 하시겠습니까?")) {
                this.Auth.loginWithGoogle(); // 확인 누르면 곧바로 구글 팝업 짠!
            }
            return;
        }

        const newNick = prompt("영구적으로 사용할 마스터의 고유 닉네임을 입력하세요! (최대 8자)\n\n⚠️ 주의: 한 번 정하면 절대 바꿀 수 없습니다.");
        
        if (!newNick || newNick.trim() === "") return;
        if (newNick.length > 8) return alert("닉네임은 8자 이내로 정해주세요!");
        if (newNick === "위대한 길드장") return alert("다른 닉네임을 사용해주세요!");

        const finalNick = newNick.trim();

        UIManager.showToast("닉네임 중복을 확인하는 중... 🔍");
        
        try {
            const nickRef = window.doc(window.db, "nicknames", finalNick);
            const nickSnap = await window.getDoc(nickRef);

            if (nickSnap.exists()) {
                return alert(`'${finalNick}'(은)는 이미 다른 마스터가 사용 중인 닉네임입니다. 😭 다른 이름을 지어주세요!`);
            }

           if (confirm(`[${finalNick}] - 이 닉네임으로 확정하시겠습니까?`)) {
            await window.setDoc(nickRef, { uid: uid, createdAt: window.serverTimestamp() });
            GameState.nickname = finalNick;
            GameState.save();
            this.applyNicknameUI();
            this.Auth.silentSaveToCloud(uid);
            UIManager.showToast(`환영합니다, [${GameState.nickname}] 마스터! 🎉`);
            
            // 🚨 [수정됨] 없는 함수(updateProfileUI)를 지우고 아래 두 줄로 교체!
            UIManager.applyAvatarSkin(); 
            UIManager.updateRpgLobbyUI(); 
        }
        } catch (e) {
            console.error("닉네임 설정 오류:", e);
            alert("서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    },

    applyNicknameUI() {
        const display = document.getElementById('profile-nickname-display');
        const btn = document.getElementById('btn-edit-nickname');
        
        if(display) display.innerText = GameState.nickname;
        
        if (GameState.nickname !== "위대한 길드장" && btn) {
            btn.style.display = 'none';
        }
    },

// 🔒 [오토 세이브/로드] 무결점 동접 방어 & 선로딩 후저장 시스템!
    Auth: {
        mySessionId: "sess_" + Date.now() + "_" + Math.floor(Math.random() * 99999),
        isSessionValid: true,
        sessionUnsub: null,
        autoSaveTimer: null,
        isCloudLoaded: false, // 💡 [신규 추가] 로딩 완료를 체크하는 안전핀!

        init() {
            window.auth.onAuthStateChanged((user) => {
                if (user) {
                    localStorage.setItem('master_uid', user.uid);
                    const loginBtn = document.getElementById('btn-google-login');
                    const userInfo = document.getElementById('auth-user-info');
                    if(loginBtn) loginBtn.classList.add('hidden');
                    if(userInfo) userInfo.classList.remove('hidden');
                    const authEmail = document.getElementById('auth-email');
                    if(authEmail) authEmail.innerText = user.email;

                    window.setDoc(window.doc(window.db, "users", user.uid), {
                        currentSession: this.mySessionId
                    }, { merge: true });

                    if (this.sessionUnsub) this.sessionUnsub();
                    this.sessionUnsub = window.onSnapshot(window.doc(window.db, "users", user.uid), (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            if (data.currentSession && data.currentSession !== this.mySessionId) {
                                this.isSessionValid = false; 
                                if(this.autoSaveTimer) clearInterval(this.autoSaveTimer);
                                if(this.sessionUnsub) { this.sessionUnsub(); this.sessionUnsub = null; }

                                alert("🚨 다른 기기에서 로그인이 감지되었습니다.\n데이터 꼬임을 막기 위해 강제 로그아웃 됩니다.");
                                window.signOut(window.auth).then(() => {
                                    localStorage.removeItem('master_uid');
                                    location.reload(); 
                                });
                            }
                        }
                    });

                    this.silentLoadFromCloud(user.uid).then(() => {
                        if(this.autoSaveTimer) clearInterval(this.autoSaveTimer);
                        this.isCloudLoaded = true; // 💡 [신규 추가] 다운로드가 끝났으니 저장소 봉인 해제!
                        this.autoSaveTimer = setInterval(() => {
                            if (!document.hidden && this.isSessionValid) {
                                this.silentSaveToCloud(user.uid);
                                if (window.GameSystem && GameSystem.Ranking && GameSystem.Ranking.updateRankingSilently) {
                                    GameSystem.Ranking.updateRankingSilently();
                                }
                            }
                        }, 10000);
                    });

                    document.addEventListener("visibilitychange", () => {
                   // 💡 [수정] 탭을 이동할 때도 다운로드가 끝난 상태에서만 저장 허용!
                        if (document.visibilityState === 'hidden' && this.isSessionValid && this.isCloudLoaded) {
                            this.silentSaveToCloud(user.uid);
                        }
                    });

                } else {
                   localStorage.removeItem('master_uid');
                    this.isCloudLoaded = false; // 💡 [신규 추가] 로그아웃 시 봉인
                    if(this.autoSaveTimer) clearInterval(this.autoSaveTimer);
                    if(this.sessionUnsub) { this.sessionUnsub(); this.sessionUnsub = null; }
                }
            });
        },
        
        loginWithGoogle() {
            const provider = new window.GoogleAuthProvider();
            window.signInWithPopup(window.auth, provider).then((result) => {
                UIManager.showToast(`환영합니다, ${result.user.displayName}님! ✨`);
            }).catch((error) => console.error("로그인 에러:", error));
        },
        
        logout() {
            if(!confirm("로그아웃 하시겠습니까? (현재 기기의 데이터는 유지됩니다)")) return;
            window.signOut(window.auth).then(() => {
                document.getElementById('btn-google-login').classList.remove('hidden');
                document.getElementById('auth-user-info').classList.add('hidden');
                location.reload(); 
            });
        },
        
        // 💡 [신규 추가] 꼬인 타임스탬프를 무시하고 무조건 클라우드에서 내려받는 비기!
        async forceLoadFromCloud() {
            const uid = localStorage.getItem('master_uid');
            if (!uid) return UIManager.showToast("로그인이 필요합니다.");
            if (!confirm("현재 기기의 데이터를 지우고 클라우드 데이터로 덮어씌우시겠습니까?")) return;
            
            try {
                // 💡 [핵심 방어막] 다운로드 중에 폰이 옛날 데이터를 올리지 못하게 타이머를 부숴버립니다!
                if(this.autoSaveTimer) clearInterval(this.autoSaveTimer);
                const docSnap = await window.getDoc(window.doc(window.db, "users", uid));
                if (docSnap.exists() && docSnap.data().saveData) {
                    const cloudData = docSnap.data().saveData;
                    for (const key in cloudData) {
                        localStorage.setItem(key, cloudData[key]);
                    }
                    alert("✨ 클라우드 동기화 완료! 게임을 재시작합니다.");
                    location.reload();
                } else {
                    alert("클라우드에 저장된 데이터가 없습니다.");
                }
            } catch(e) {
                console.error(e);
                alert("불러오기에 실패했습니다.");
            }
        },
        
        silentSaveToCloud(uid) {
            if (!this.isSessionValid) return; 

            const allMyData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('master_') || key === 'last_checkin')) {
                    allMyData[key] = localStorage.getItem(key);
                }
            }
            if(Object.keys(allMyData).length === 0) return;

            const nowTime = Date.now().toString();
            localStorage.setItem('master_lastSaveTime', nowTime);
            allMyData['master_lastSaveTime'] = nowTime;

            window.setDoc(window.doc(window.db, "users", uid), {
                saveData: allMyData,
                lastSaved: window.serverTimestamp(),
                currentSession: this.mySessionId 
            }, { merge: true }).catch(e => console.log("자동 저장 중 오류:", e));
        },
        
        async silentLoadFromCloud(uid) {
            try {
                const docSnap = await window.getDoc(window.doc(window.db, "users", uid));
                if (docSnap.exists() && docSnap.data().saveData) {
                    const cloudData = docSnap.data().saveData;

                    const cloudTime = parseInt(cloudData['master_lastSaveTime'] || '0');
                    const localTime = parseInt(localStorage.getItem('master_lastSaveTime') || '0');

                    if (cloudTime > localTime) {
                        console.log("☁️ 클라우드에 더 최신 데이터가 있습니다. 덮어씌우는 중...");
                        for (const key in cloudData) {
                            localStorage.setItem(key, cloudData[key]);
                        }
                        location.reload(); 
                    } else {
                        console.log("📱 현재 기기의 데이터가 가장 최신입니다. 백섭 방어 완료!");
                    }
                }
            } catch (e) {
                console.error("클라우드 로딩 오류:", e);
            }
        }
    }, // 👈 완벽한 콤마 마무리! 여기서부터 Quest: { 로 이어집니다!
  Quest: {
        currentTab: 'daily',
        
        // 💡 마스터의 새로운 퀘스트 목록! (보상과 목표치는 여기서 수정하세요)
      list: {
            daily: [
                { id: 'd1', title: '심연의 도전자', desc: '심연의 탑 3층(회) 클리어', target: 3, rewardGold: 10, rewardGems: 10 },
                { id: 'd2', title: '트렌드 세터', desc: '인기 폭발 테스트 3회 참여', target: 3, rewardGold: 10, rewardGems: 10 },
                { id: 'd3', title: '성장의 기쁨', desc: '골드로 스탯 3회 강화', target: 3, rewardGold: 10, rewardGems: 10 }
            ],
          weekly: [ 
                // 1. 일반 몬스터 300마리 -> 30마리로 대폭 하향! (보상 유지: 500G / 100💎)
                { id: 'w1', title: '심연의 정복자', desc: '일반 몬스터 30마리 토벌', target: 30, rewardGold: 500, rewardGems: 100 },
                
                // 2. 보스 30마리 -> 5마리로 하향! (보상 변경: 500G / 150💎)
                { id: 'w2', title: '진(眞) 마왕 토벌대', desc: '보스 몬스터 5마리 토벌', target: 5, rewardGold: 500, rewardGems: 150 },
                
                // 3. 방치형 지원금 5회 수령 (유지, 보상 유지: 300G / 50💎)
                { id: 'w3', title: '시간의 투자자', desc: '방치형 지원금 5회 수령', target: 5, rewardGold: 300, rewardGems: 50 },
                
                // 4. 스탯 강화 100회 -> 30회로 하향! (보상 변경: 500G / 100💎)
                { id: 'w4', title: '만수르의 길', desc: '골드로 스탯 30회 강화', target: 30, rewardGold: 500, rewardGems: 100 },
                
                // 5. 환생 1회 달성 (유지, 보상 변경: 1000G / 300💎)
                { id: 'w5', title: '차원을 넘어서', desc: '환생(Prestige) 1회 달성', target: 1, rewardGold: 1000, rewardGems: 300 }
            ]
        },

        progress: { daily: {}, weekly: {} },
      
        init() {
            const saved = localStorage.getItem('master_quest_progress2'); // 기존 에러 방지를 위해 저장소 이름 변경
            if (saved) {
                this.progress = JSON.parse(saved);
            } else {
                this.list.daily.forEach(q => this.progress.daily[q.id] = { count: 0, claimed: false });
                this.list.weekly.forEach(q => this.progress.weekly[q.id] = { count: 0, claimed: false });
                this.save();
            }
        },

        save() {
            localStorage.setItem('master_quest_progress2', JSON.stringify(this.progress));
        },

        // 🌟 [핵심 센서 발동기] 다른 곳에서 퀘스트 수치를 올릴 때 부르는 함수!
        update(type, questId, amount = 1) {
            if (!this.progress[type] || !this.progress[type][questId]) return;
            
            let qProgress = this.progress[type][questId];
            let qData = this.list[type].find(q => q.id === questId);
            
            if (qProgress.claimed) return; 
            
            if (qProgress.count < qData.target) {
                qProgress.count += amount;
                if (qProgress.count > qData.target) qProgress.count = qData.target;
                this.save();
                
                const modal = document.getElementById('quest-modal');
                if (modal && !modal.classList.contains('opacity-0')) this.renderList();
                
                if (qProgress.count === qData.target) {
                    UIManager.showToast(`📜 퀘스트 [${qData.title}] 달성! 젬을 수령하세요!`);
                }
            }
        },

        // 💡 2. 골드와 젬을 동시에 주도록 보상 수령 함수 업그레이드!
        claimReward(type, questId) {
            let qProgress = this.progress[type][questId];
            let qData = this.list[type].find(q => q.id === questId);

            if (qProgress.count >= qData.target && !qProgress.claimed) {
                qProgress.claimed = true;
                
                // 골드와 젬을 동시에 지급!
              // 👇 [이렇게 변경!]
                GameState.gold += Number(qData.rewardGold || 0); 
                GameState.gem += Number(qData.rewardGems || 0);
                
                GameState.save();
                this.save();
                
                UIManager.updateCurrencyUI();
                AudioEngine.sfx.coin();
                UIManager.triggerHaptic();
                UIManager.showToast(`🎁 보상 획득! 🪙 ${qData.rewardGold} / 💎 ${qData.rewardGems}`);
                this.renderList(); 
            }
        },
       openModal() {
            AudioEngine.sfx.click();
            UIManager.triggerHaptic();
            const modal = document.getElementById('quest-modal');
            if (modal) {
                // 💡 [핵심] 뚫려있던 클릭 판정을 막아주는 마스터의 'active' 클래스 추가!
                modal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
                modal.classList.add('opacity-100', 'pointer-events-auto', 'scale-100', 'active');
                this.renderList(); // 열 때 화면 그리기
            }
        },

        closeModal() {
            AudioEngine.sfx.click();
            const modal = document.getElementById('quest-modal');
            if (modal) {
                // 💡 [핵심] 닫을 때 'active' 클래스도 같이 빼주기!
                modal.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100', 'active');
                modal.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
            }
        },

        switchTab(tabName) {
            AudioEngine.sfx.click();
            this.currentTab = tabName;
            const btnDaily = document.getElementById('quest-tab-daily');
            const btnWeekly = document.getElementById('quest-tab-weekly'); // HTML에 id="quest-tab-weekly" 로 되어있어야 함!
            
            if (tabName === 'daily') {
                if(btnDaily) btnDaily.className = "flex-1 py-2 bg-slate-700 text-white border border-slate-500 text-xs font-bold rounded";
                if(btnWeekly) btnWeekly.className = "flex-1 py-2 bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold rounded";
            } else {
                if(btnDaily) btnDaily.className = "flex-1 py-2 bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold rounded";
                if(btnWeekly) btnWeekly.className = "flex-1 py-2 bg-slate-700 text-white border border-slate-500 text-xs font-bold rounded";
            }
            this.renderList();
        },

        renderList() {
            const container = document.getElementById('quest-list-container');
            if (!container) return;
            container.innerHTML = ''; 

            const currentQuests = this.list[this.currentTab];
            
            currentQuests.forEach(q => {
                const progress = this.progress[this.currentTab][q.id] || { count: 0, claimed: false };
                const isCompleted = progress.count >= q.target;
                const percent = Math.min((progress.count / q.target) * 100, 100);
                
                let btnHtml = '';
                if (progress.claimed) {
                    btnHtml = `<button disabled class="px-3 py-1 bg-slate-800 text-slate-500 text-[10px] font-bold rounded border border-slate-700">완료됨</button>`;
                } else if (isCompleted) {
                    btnHtml = `<button onclick="GameSystem.Quest.claimReward('${this.currentTab}', '${q.id}')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded shadow-[0_0_10px_rgba(52,211,153,0.4)] animate-pulse">수령하기</button>`;
                } else {
                    btnHtml = `<div class="text-xs font-bold text-slate-400">${progress.count} / ${q.target}</div>`;
                }

              // (renderList 함수 안쪽의 html 변수 덮어씌우기)
                const html = `
                    <div class="glass-card p-4 border border-slate-700/50 flex flex-col gap-2 ${progress.claimed ? 'opacity-50' : ''}">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="text-sm font-black text-white flex items-center gap-1">${q.title} ${isCompleted && !progress.claimed ? '✅' : ''}</h4>
                                <p class="text-[10px] text-slate-400 mt-0.5">${q.desc}</p>
                            </div>
                            <div class="flex items-center gap-2 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
                                <span class="text-[10px] font-bold text-yellow-400">🪙 ${q.rewardGold}</span>
                                <span class="text-[10px] font-bold text-cyan-400">💎 ${q.rewardGems}</span>
                            </div>
                        </div>
                        <div class="flex justify-between items-center mt-1">
                            <div class="flex-1 bg-slate-800 h-1.5 rounded-full mr-3 overflow-hidden">
                                <div class="bg-indigo-500 h-full rounded-full" style="width: ${percent}%"></div>
                            </div>
                            ${btnHtml}
                        </div>
                    </div>
                `;
                container.innerHTML += html;
            });
        }
    }, // 👈 요 콤마 필수! (다음이 Battle 이니까)
    
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
            
            // 🔓 1. 최대 층수 100층으로 해제!
            if (GameState.rpgStage > 100) return UIManager.showToast("진(眞) 마왕을 토벌했습니다! 차원의 여신에게 환생을 요청하세요. ✨");
            
           
            AudioEngine.sfx.click(); UIManager.triggerHaptic(); 
            document.getElementById('bottom-nav').style.display = 'none'; 
            
            // 👹 2. 보스 등장 주기: 10층마다(10, 20, 30... 100층) 등장하도록 변경!
            const isBoss = (GameState.rpgStage % 10 === 0);
            
            if (!isBoss && Math.random() < 0.2) { 
                this.triggerRandomEvent(); 
            } else { 
                if (isBoss) {
                    // 💡 보스 등장 사운드 재생! 
                    if (AudioEngine.sfx.warning) AudioEngine.sfx.warning();
                    else if (AudioEngine.sfx.boss) AudioEngine.sfx.boss();

                    const warning = document.getElementById('boss-warning-overlay');
                    if (warning) warning.classList.add('active');
                    UIManager.triggerHeavyHaptic();
                    
                    setTimeout(() => { 
                        if (warning) warning.classList.remove('active'); 
                        this.initBattle(true); 
                    }, 1500);
                } else {
                    this.initBattle(false); 
                }
            }
        }, // 🚨 끝에 콤마(,) 잊지 마!
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
                
                // 💡 [핵심] Math.max(1, ...) 로 아무리 맞아도 최소 피 1은 보장!!
                GameState.currentHp = Math.max(1, GameState.currentHp - dmg); 
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
                
                // 💡 [핵심] 미믹한테 물려도 피 1은 남음!
                GameState.currentHp = Math.max(1, GameState.currentHp - dmg); 
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
                
                // 💡 [핵심] 제단에 피를 바쳐도 1은 남김!
                GameState.currentHp = Math.max(1, GameState.currentHp - dmg); 
                GameState.gem += 15;
                AudioEngine.sfx.hit(); UIManager.triggerHeavyHaptic(); 
            }
            
            // 이제 절대 죽지 않으니까 '쓰러짐' 버튼 UI 로직은 싹 지우고 무조건 '돌아가기'!
            const btn = document.querySelector('#screen-rpg-event button');
            btn.innerText = "돌아가기";
            btn.className = "w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-slate-600 active:scale-95 transition-all";
            
            UIManager.updateCurrencyUI(); 
        },

        // 💡 [대수술 완] 이벤트에서는 죽지도 않고, 층수도 안 오름! 깔끔하게 로비 귀환!
        endEvent() { 
            document.getElementById('bottom-nav').style.display = 'flex'; 
            
            GameState.save(); 
            UIManager.updateRpgLobbyUI(); // 로비 HP바 갱신
            document.getElementById('screen-rpg-event').classList.remove('active');
            
            // 부활 팝업 띄우는 복잡한 로직 다 버리고, 스무스하게 투기장(로비) 화면으로 돌아갑니다!
            UIManager.navTo('screen-arena', document.querySelectorAll('.nav-item')[1]); 
        },
 //몬스터 스탯
    initBattle(isBoss) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-rpg-battle').classList.add('active');
            GameState.isBattling = true;
            localStorage.setItem('master_in_battle', 'true');

            // 💡 [수정 완료] 환생은 100층 기준! (1환생 1층 = 101층 스펙으로 계산)
            let prestigeCount = GameState.prestigeCount || 0;
            let effStage = GameState.rpgStage + (prestigeCount * 100);

            // 🌟 1. 시각적 테마 구역 계산 (1~10구역 반복)
            let currentZone = Math.floor((GameState.rpgStage - 1) / 10) + 1; 
            if (currentZone > 10) {
                currentZone = ((currentZone - 1) % 10) + 1;
            }

            // 🌟 2. 난이도 폭발 구역 계산 및 배율 적용 (1.1배씩 중첩)
            // effStage를 기준으로 10층마다 배율이 1.1배씩 곱해집니다.
            let effectiveZone = Math.floor((effStage - 1) / 10);
            let zoneMultiplier = Math.pow(1.1, effectiveZone);

            // 🌟 3. [공식 적용] 몬스터 기본 스탯 (1층당 공 4, 체 40 고정 증가)
            let baseHp = (effStage * 40) + (isBoss ? 200 : 0);
            let baseAtk = (effStage * 4) + (isBoss ? 15 : 0);

            // 🌟 4. 최종 스탯 = 기본 스탯 * 1.1배수 중첩
            this.monsterMaxHp = Math.floor(baseHp * zoneMultiplier); 
            this.monsterCurrentHp = this.monsterMaxHp;
            this.monsterAtkObj = Math.floor(baseAtk * zoneMultiplier);
            
            // 🌟 구역별 테마 이름 사전 만들기!
            const zoneNames = {
                1: "🌲 초보자의 숲",
                2: "🏜️ 메마른 황무지",
                3: "⛰️ 거친 산맥",
                4: "🏚️ 버려진 유적",
                5: "🌊 오염된 심해",
                6: "🩸 저주받은 핏빛 성",
                7: "🧊 얼어붙은 왕국", 
                8: "🌑 기사단의 무덤",
                9: "🔥 불타는 지옥문",
                10: "🌌 마왕의 심연"
            };

            const battleCard = document.getElementById('battle-card');
            
            // 전체 화면에 잘못 발라둔 배경 벽지는 싹 뜯어냅니다!
            document.getElementById('screen-rpg-battle').style.backgroundImage = "none";
        
            // 해당 구역의 일반 몬스터 배열 가져오기
            let normalPool = GameData.monsters.normal[currentZone] || GameData.monsters.normal[1];
            
            // 보스면 보스 데이터에서 뽑고, 일반 몹이면 '현재 구역'에서 순서대로 뽑기!
            let mInfo = isBoss 
                ? (GameData.monsters.boss[GameState.rpgStage] || {e:'👑',n:'고대의 왕'}) 
                : normalPool[(GameState.rpgStage - 1) % normalPool.length];

            document.getElementById('battle-stage-title').innerText = `STAGE ${GameState.rpgStage} - ${zoneNames[currentZone]} ${isBoss ? '🔥' : ''}`;
            document.getElementById('battle-monster-name').innerText = mInfo.n; 
            
     // 🌟 [이미지 모드 ON!] 봉인 해제된 에셋 렌더링 시스템
            const spriteBox = document.getElementById('monster-sprite');
            const avatarWrap = document.getElementById('monster-avatar-wrap');
            // 🚨 (여기에 있던 const battleCard = ... 줄을 삭제했습니다! 위에서 이미 선언했기 때문이에요)

            // 1. 전체 화면 배경은 치장품을 위해 싹 비워주기
            const battleScreen = document.getElementById('screen-rpg-battle');
            battleScreen.style.backgroundImage = "none";

            // 2. 어두운 그라데이션 제거! 순수 구역 테마 배경화면 쫙 깔아주기
            battleCard.style.backgroundImage = `url('assets/backgrounds/bg_zone${currentZone}.png')`;
            battleCard.style.backgroundSize = "cover";
            battleCard.style.backgroundPosition = "center";
            battleCard.style.backgroundRepeat = "no-repeat";

           // 3. 고퀄리티 몬스터/보스 이미지 출력!
            // 💡 콘솔에서 찾은 최고의 scale과 translateY 숫자를 여기에 적어주세요!
            const scaleStyle = isBoss ? "transform: scale(1.2) translateY(20px);" : "transform: scale(1.0);";
            
            spriteBox.innerHTML = `<img src="assets/monster/${mInfo.img}" class="w-full h-full object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]" style="${scaleStyle}" alt="${mInfo.n}">`;
            
            // 4. [핵심] 작은 상자의 족쇄를 풀고, 몬스터가 큼직하게 나오도록 사이즈 해방!
            avatarWrap.className = "w-full flex items-center justify-center relative z-0";
            
            // 보스는 화면에 꽉 차게 거대하게! 일반몹도 넉넉하게 크기 조절
            spriteBox.style.cssText = isBoss ? "width: 100%; height: 160px; margin: 10px 0;" : "width: 100%; height: 160px; margin: 10px 0;";
            
            // 5. 카드 기본 구조 개선 (위아래 간격 벌리기)
            battleCard.className = isBoss 
                ? "glass-card battle-card p-4 sm:p-6 mb-6 text-center relative border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] bg-transparent overflow-hidden flex flex-col justify-between min-h-[380px]" 
                : "glass-card battle-card p-4 sm:p-6 mb-6 text-center relative border border-purple-500/30 bg-transparent overflow-hidden flex flex-col justify-between min-h-[300px]";

            // 6. [핵심] 이름과 체력바가 몬스터 이미지 위로(Z-index) 올라오게 레이어 조정!
            const monsterNameEl = document.getElementById('battle-monster-name');
            const hpBarContainer = document.getElementById('battle-monster-hp-bar').parentElement.parentElement;
            
            if (monsterNameEl) {
                // 글씨가 배경에 묻히지 않게 강한 검은색 그림자 추가
                monsterNameEl.className = "text-xl font-black text-white relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-2"; 
            }
            if (hpBarContainer) {
                // 몬스터 꼬리나 몸집이랑 겹쳐도 체력 수치가 잘 보이게 살짝 반투명 검은 판을 깔아줌
                hpBarContainer.className = "w-full relative z-10 bg-black/60 p-2 rounded-xl backdrop-blur-sm border border-white/10 mt-auto"; 
            }

            // 레이어 겹침 방지 초기화
            Array.from(battleCard.children).forEach(child => {
                if (child.id !== 'battle-monster-name' && child.id !== 'monster-avatar-wrap' && child !== hpBarContainer) {
                    child.style.position = "";
                    child.style.zIndex = ""; 
                }
            });
        
            document.getElementById('battle-log').innerText = "전투 시작! 화면을 탭하여 공격하세요!";
            document.getElementById('btn-attack').disabled = false; 
            document.getElementById('btn-attack').innerHTML = "⚔️ 공격 (TAP!)";
            
            this.lastAttackTime = 0; 
            this.bossAttackCount = 0; // 💡 [신규] 보스 공격 횟수 카운터 초기화!
            this.updateBattleUI();
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
            
            // 💡 [핵심] 스탯을 먼저 불러와서 공격 속도(SPD)를 계산합니다!
            const stats = GameState.getTotalStats(); 
            
            // 🌟 1. 공격 속도(SPD) 적용! (기본 1초 = 1000ms)
            let spdBonus = Math.min(stats.spd, 60); // 마스터 오더: 최대 60% 쿨감 제한!
            const ATTACK_COOLDOWN = 1000 * (1 - (spdBonus / 100)); // 공속 0이면 1000ms, 공속 60이면 400ms!

            const now = Date.now();
            if (now - this.lastAttackTime < ATTACK_COOLDOWN) return;
            this.lastAttackTime = now;
            
            // 🚨 (여기에 원래 있던 sfx.hit() 삭제 완료! 아래에서 상황별로 소리가 납니다)
            
            let myAtk = stats.atk; 
            let critChance = stats.critRate / 100;   // 예: 25% -> 0.25
            let critMultiplier = stats.critDmg / 100; // 예: 200% -> 2.0
            
            // 💡 [크리티컬 터졌는지 주사위 굴리기!]
            let isCrit = Math.random() < critChance; 
            let damage = isCrit ? Math.floor(myAtk * critMultiplier) : myAtk;

            // 🎧 [사운드 분기점] 크리티컬이면 경쾌한 소리+강한 진동, 아니면 평타 소리!
            if (isCrit) {
                AudioEngine.sfx.hit_crit();
                UIManager.triggerHeavyHaptic();
            } else {
                AudioEngine.sfx.hit_normal();
                UIManager.triggerHaptic();
            }

            this.monsterCurrentHp -= damage;
            
            // 💡 [흡혈(피흡) 로직!] 데미지에 비례해서 피가 찹니다.
            if (stats.vamp > 0 && GameState.currentHp < stats.hp) {
                let healAmount = Math.floor(damage * (stats.vamp / 100));
                if (healAmount > 0) {
                    GameState.currentHp = Math.min(stats.hp, GameState.currentHp + healAmount);
                    // 마스터 머리 위에 초록색 피흡 숫자 띄우기! 
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
            
            // 🌟 버튼 쿨타임 애니메이션 (바뀐 공속에 맞춰서 돌아갑니다!)
            const cooldownTimer = setInterval(() => { 
                timeLeft -= 100; 
                if (timeLeft <= 0 || this.monsterCurrentHp <= 0) { 
                    clearInterval(cooldownTimer); 
                    if (GameState.isBattling && this.monsterCurrentHp > 0 && GameState.currentHp > 0) { 
                        btn.disabled = false; btn.classList.remove('opacity-50'); btn.innerHTML = "⚔️ 공격 (TAP!)"; 
                    } 
                } else { 
                    btn.innerHTML = `⏳ ${ (timeLeft/1000).toFixed(1) }s`; 
                } 
            }, 100);
            
            this.updateBattleUI(); 
            if (this.monsterCurrentHp <= 0) { clearInterval(cooldownTimer); setTimeout(() => this.endBattle(true), 300); }
        },
        
      monsterAttack() {
            if(!GameState.isBattling || this.monsterCurrentHp <= 0 || GameState.currentHp <= 0) { clearInterval(this.battleInterval); return; }
            
            const stats = GameState.getTotalStats();
            const isBoss = (GameState.rpgStage % 10 === 0);
            let isUltimate = false;

            // 🌟 [필살기 카운터] 보스일 경우 4타마다 필살기 장전!
            if (isBoss) {
                this.bossAttackCount = (this.bossAttackCount || 0) + 1;
                if (this.bossAttackCount >= 4) {
                    isUltimate = true;
                    this.bossAttackCount = 0; // 카운터 초기화
                }
            }

            // 1. 회피율(EVA) 계산!
            let evaChance = Math.min(stats.eva, 50); 
            let randomRoll = Math.random() * 100; 
            
            if (randomRoll < evaChance) {
                // 🎧 [회피 사운드 추가] 바람을 가르는 소리!
                AudioEngine.sfx.evade();
                this.showDamageText('battle-card', "MISS!", 'text-gray-300 font-black text-2xl drop-shadow-md'); 
                document.getElementById('battle-log').innerText = "💨 몬스터의 공격을 가볍게 회피했습니다! (MISS)";
                return; 
            }

            // 2. 방어력(DEF) 및 데미지 계산!
            let rawDamage = Math.floor(this.monsterAtkObj * (0.8 + Math.random() * 0.4));
            
            // 💥 [필살기 데미지 폭발!] 필살기면 원래 데미지의 2.5배 뻥튀기!
            if (isUltimate) {
                rawDamage = Math.floor(rawDamage * 2.5);
            }

            let defStat = stats.def;
            let damageReduction = defStat / (defStat + 100); 
            let damage = Math.max(1, Math.floor(rawDamage * (1 - damageReduction)));
            
            GameState.currentHp -= damage; GameState.save(); 
            
            const battleCard = document.getElementById('battle-card');
            
            // 🎬 [필살기 연출] 화면 붉은 점멸 + 사운드 + 강력한 진동!
            if (isUltimate) {
                AudioEngine.sfx.boss(); // 묵직한 사운드
                UIManager.triggerHeavyHaptic(); // 3단 진동
                
                // 전체 화면 붉은색 점멸 이펙트 추가
                document.body.classList.add('boss-ultimate-flash'); 
                if(battleCard) battleCard.classList.add('shake'); 
                
                setTimeout(() => { 
                    document.body.classList.remove('boss-ultimate-flash');
                    if(battleCard) battleCard.classList.remove('shake'); 
                }, 300);
                
                // 큼직하고 강렬한 전용 데미지 텍스트
                this.showDamageText('battle-card', `FATAL! -${damage}`, 'text-red-500 font-black text-4xl drop-shadow-[0_0_15px_rgba(239,68,68,1)]');
                document.getElementById('battle-log').innerText = `☠️ 보스의 필살기!! ${damage}의 치명적인 피해!`;
            } else {
                // 🎧 [유저 피격 사운드] 둔탁하게 맞는 소리로 변경!
                AudioEngine.sfx.hit_player(); 
                UIManager.triggerHaptic();
                if(battleCard) { battleCard.classList.add('shake'); setTimeout(() => battleCard.classList.remove('shake'), 200); }
                this.showDamageText('battle-card', `-${damage}`, 'damage-player');
                document.getElementById('battle-log').innerText = `💥 몬스터 반격! ${damage} 피해!`;
            }

            this.updateBattleUI(); 
            if (GameState.currentHp <= 0) { clearInterval(this.battleInterval); setTimeout(() => this.endBattle(false), 300); }
        },
       endBattle(isWin) {
            clearInterval(this.battleInterval); GameState.isBattling = false; localStorage.removeItem('master_in_battle'); 
            const btnAtk = document.getElementById('btn-attack');
            if (btnAtk) { btnAtk.disabled = true; btnAtk.innerHTML = "⚔️ 전투 종료"; }
            
            const isBoss = (GameState.rpgStage % 10 === 0);
            
            if (isWin) {
                // 🌟 [승리 로직] 이겼을 때만 실행됨!
                document.getElementById('bottom-nav').style.display = 'flex'; 
                AudioEngine.sfx.coin(); UIManager.triggerHaptic();
                
                // 💰 [마스터의 완벽한 밸런스 공식 적용!]
                let rewardGold = 15; // 일반 몹은 고정 15골드!
                let rewardGem = 0;   // 일반 몹은 다이아(젬) 없음!
                
                if (isBoss) {
                    // 현재 몇 번째 보스인지 계산 (예: 10층=1, 20층=2, 30층=3)
                    const bossTier = GameState.rpgStage / 10; 
                    
                    rewardGold = 100 * bossTier; // 10, 200, 300... 이렇게 늘어남!
                    rewardGem = 50 * bossTier;  // 50, 100, 150... 이렇게 늘어남!
                }
                
               // 👇 [이렇게 변경!] 무조건 숫자로 취급하도록 Number()로 감싸기!
                GameState.gold += Number(rewardGold); 
                GameState.gem += Number(rewardGem);
                GameState.rpgStage++; GameState.save();
              // 👇 [여기를 통째로 교체!]
                // 💡 [퀘스트 센서] 몬스터 처치 시!
                GameSystem.Quest.update('daily', 'd1', 1);
                GameSystem.Quest.update('weekly', 'w1', 1);
                if (isBoss) {
                
                    GameSystem.Quest.update('weekly', 'w2', 1);
                }
                // 👆 여기까지!

                UIManager.updateCurrencyUI(); 
                if (GameSystem.Ranking) GameSystem.Ranking.updateRankingSilently();
                UIManager.showToast(`🎉 토벌 성공! 🪙 +${rewardGold}G ${isBoss ? ' / 💎 +'+rewardGem : ''}`);
                
                const battleLog = document.getElementById('battle-log');
                if (battleLog) battleLog.innerText = `토벌 성공! 보상을 획득했습니다.`;
                
                setTimeout(() => {
                    UIManager.navTo('screen-arena', document.querySelectorAll('.nav-item')[1]);
                }, 1500);

            } else {
                // 💀 [패배 로직] 몬스터한테 졌을 때만 실행됨! (여기가 괄호 안으로 쏙 들어와야 해!)
                GameState.currentHp = 0; 
                GameState.save();
                
           // 💡 마스터가 만든 'revive-modal' (부활 모달창) 소환!!
                const deathModal = document.getElementById('revive-modal'); 
                if (deathModal) {
                    // 마스터가 세팅해둔 Tailwind 애니메이션을 스르륵~ 켜주는 마법!
                    deathModal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
                    deathModal.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
                }
            }
        }, // 👈 콤마 잊지 마!
     // 💡 [신규] 차원의 여신 환생 시스템
        doPrestige() {
            if (GameState.rpgStage <= 100) {
                return UIManager.showToast("100층의 진(眞) 마왕을 토벌해야 차원의 여신을 만날 수 있습니다! 👑");
            }
            
            const modal = document.getElementById('goddess-modal');
            if (modal) modal.classList.remove('hidden');
            AudioEngine.sfx.coin(); 
        },

        // 💡 모달창에서 '환생 수락' 버튼을 눌렀을 때 실행되는 진짜 환생 로직!
        confirmPrestige() {
            const modal = document.getElementById('goddess-modal');
            if (modal) modal.classList.add('hidden'); // 모달 닫기

            GameState.prestigeCount = (GameState.prestigeCount || 0) + 1;
            GameState.rpgStage = 1; 
            
            // 골드로 올린 스탯 초기화
            GameState.rpgAtk = 10;
            GameState.rpgMaxHp = 100;
            GameState.currentHp = GameState.getTotalStats().hp; 

         // 💎 [보상 추가] 100층 환생 기념 초대박 보상! 
            // 기본 1000개 + (환생 횟수 * 500개) 씩 점점 더 많이 줌!
            const rewardDiamond = 1000 + (GameState.prestigeCount * 500);
            
            // 💡 [수정됨] 엉뚱한 diamond 지갑 버리고 진짜 gem 지갑에 넣기!
            GameState.gem += rewardDiamond;

            GameState.save();
            // 💡 [퀘스트 센서 추가!] 환생 성공 시!
            GameSystem.Quest.update('weekly', 'w5', 1);

            UIManager.showToast(`🎉 ${GameState.prestigeCount}번째 환생 완료! 보상으로 다이아 ${rewardDiamond}개를 획득했습니다! 💎`);
            UIManager.updateRpgLobbyUI();
            
            // 랭킹에도 환생 횟수 업데이트!
            if (GameSystem.Ranking && GameSystem.Ranking.updateRankingSilently) {
                GameSystem.Ranking.updateRankingSilently(); 
          }
        } // 👈 이건 confirmPrestige 함수 닫는 괄호!
    } // 🌟 짠! 여기가 핵심! Battle 묶음을 닫는 괄호를 추가!!
}; // <-- GameSystem 닫는 괄호 (이제 완벽해!)

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
window.giveUpBattle = function() {
    // 🌟 [수정된 부분] 낡은 'active' 떼기 대신 Tailwind 애니메이션 끄기 적용!
    const reviveModal = document.getElementById('revive-modal');
    if (reviveModal) {
        reviveModal.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
        reviveModal.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
    }
    
    UIManager.showToast(`💀 쓰러졌습니다... 여관에서 휴식하세요.`);
    
    // 💡 숨겨졌던 하단 메뉴바(네비게이션)를 다시 나타나게 켜주기!
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
        // 🌟 [여기 추가!!] 꼬리표가 'idle_double' (방치형 2배) 일 때!!
    else if (window.currentAdAction === 'idle_double') {
        // 방치형 지원금 계산 함수를 불러와서 금액을 가져오고, x 2 를 때려버립니다!!
        const amount = GameSystem.Lobby.calculateIdleReward() * 2; 
        
        GameState.gold += amount;
        // 💡 [퀘스트 센서 추가!] 방치형 보상 수령 시
        GameSystem.Quest.update('weekly', 'w3', 1);
        GameState.lastIdleCheck = Date.now(); // 시간 초기화 
        GameState.save();
        
        UIManager.updateCurrencyUI();
        UIManager.updateIdleUI(); // 화면 0G로 리셋
        AudioEngine.sfx.coin();
        UIManager.triggerHaptic();
        UIManager.showToast(`📺 광고 보상! 방치 지원금 ${amount}G (2배) 수령 완료! 💰✨`);
    }
    // 꼬리표가 'revive' 일 때
    else if (window.currentAdAction === 'revive') {
        // 🌟 [수정된 부분] 낡은 'active' 대신 Tailwind 애니메이션으로 스르륵 끄기!
        const reviveModal = document.getElementById('revive-modal');
        if (reviveModal) {
            reviveModal.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
            reviveModal.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        }
        
        // (혹시 몰라서 남겨두는 옛날 death-modal 안전장치)
        const deathModal = document.getElementById('death-modal');
        if (deathModal) deathModal.classList.remove('active');
        
        GameState.currentHp = GameState.getTotalStats().hp; // 체력 100% 회복!
        GameState.save();
        
        UIManager.triggerHaptic();
        AudioEngine.sfx.coin(); 

        const battleScreen = document.getElementById('screen-rpg-battle');
        const isBattleScreen = battleScreen ? battleScreen.classList.contains('active') || battleScreen.style.display !== 'none' : false;

        // 👇 여기서부터는 마스터가 짜둔 기적의 부활 로직 그대로!
        if (isBattleScreen) {
            // ⚔️ 1. 전투 중에 죽었을 때 -> 전투 이어서 하기!
            GameState.isBattling = true; 
            localStorage.setItem('master_in_battle', 'true'); 
            const battleLog = document.getElementById('battle-log');
            if (battleLog) battleLog.innerText = `✨ 기적적인 부활! 반격을 시작하세요!`; 

            GameSystem.Battle.updateBattleUI(); 
            
            clearInterval(GameSystem.Battle.battleInterval); 
            GameSystem.Battle.battleInterval = setInterval(() => GameSystem.Battle.monsterAttack(), 1500);
            
            const btnAtk = document.getElementById('btn-attack');
            if (btnAtk) {
                btnAtk.disabled = false;
                btnAtk.classList.remove('opacity-50'); 
                btnAtk.innerHTML = "⚔️ 공격 (TAP!)";
            }
            
            UIManager.showToast("✨ 기적적으로 부활했습니다! 전투를 이어갑니다.");
        } else {
            // ☠️ 2. 안전하게 로비로 귀환!
            GameState.isBattling = false;
            localStorage.setItem('master_in_battle', 'false');

            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            
            const lobbyScreen = document.getElementById('screen-rpg'); 
            if (lobbyScreen) {
                lobbyScreen.classList.add('active');
            } else {
                const homeScreen = document.getElementById('screen-home');
                if(homeScreen) homeScreen.classList.add('active'); 
            }
            
            const bottomNav = document.getElementById('bottom-nav');
            if (bottomNav) bottomNav.style.display = 'flex';

            UIManager.updateRpgLobbyUI();
            UIManager.showToast("✨ 기적적으로 부활하여 로비로 무사히 귀환했습니다! ⛺");
        }
    }

    // 보상 줬으니 꼬리표 초기화
    window.currentAdAction = ''; 
};

// 게임 시작 후 2초 뒤에 채팅 수신기 자동 가동!
setTimeout(() => { if (window.db && GameSystem.Chat) GameSystem.Chat.init(); }, 2000);

// 🌟 [초거대 글로벌 프리로더 엔진] - 몬스터, 배경 싹쓸이 캐싱 (가비지 컬렉터 방어 탑재!)
const AssetPreloader = {
    cachedImages: [], // 💡 [핵심] 브라우저가 몰래 이미지를 지우지 못하게 붙잡아두는 창고!

    preloadAll() {
        console.log("🔄 [프리로더 가동] 마스터, 백그라운드에서 리소스 싹쓸이를 시작합니다!");
        const imageUrls = [];

        // 1. 배경화면 1~10구역 장전!
        for(let i = 1; i <= 10; i++) {
            imageUrls.push(`assets/backgrounds/bg_zone${i}.png`);
        }

        if (window.GameData) {
            // 2. 몬스터(일반/보스) 이미지 싹쓸이!
            if (GameData.monsters) {
                for (const zone in GameData.monsters.normal) {
                    GameData.monsters.normal[zone].forEach(m => {
                        if (m.img) imageUrls.push(`assets/monster/${m.img}`);
                    });
                }
                for (const stage in GameData.monsters.boss) {
                    const boss = GameData.monsters.boss[stage];
                    if (boss.img) imageUrls.push(`assets/monster/${boss.img}`);
                }
            }

            // 3. 아이템 이미지 준비
            if (GameData.items) {
                for (const key in GameData.items) {
                    const item = GameData.items[key];
                    if (item.img) imageUrls.push(`assets/items/${item.img}`); 
                }
            }
        }

        const uniqueUrls = [...new Set(imageUrls)];
        uniqueUrls.forEach(url => {
            const img = new Image();
            img.src = url; 
            
            // 💡 [핵심 추가] 창고에 밀어 넣어서 브라우저가 절대 지우거나 취소하지 못하게 멱살 잡기!
            this.cachedImages.push(img); 
        });
        
        console.log(`✅ [프리로딩 완료] 총 ${uniqueUrls.length}개의 리소스 장전 및 보호 완료!`);
    }
};

