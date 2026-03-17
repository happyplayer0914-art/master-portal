// =========================================================================
// 5. GAME SYSTEM
// =========================================================================
const GameSystem = {
// =========================================================================
        // 🔨 [신규 시스템] 대장간 (장비 강화)
        // =========================================================================
        Forge: {
            selectedId: null,
            currentTab: 'weapon', // 💡 기본 탭 설정
            probs: [100, 90, 80, 70, 60, 50, 40, 30, 10, 1],
            
            init() {
                if(!GameState.itemUpgrades) GameState.itemUpgrades = {};
                this.selectedId = null;
                const details = document.getElementById('forge-details');
                if(details) details.classList.add('hidden');
                this.switchTab('weapon'); // 💡 대장간 들어올 때 무조건 무기 탭부터 열기
            },

            // 💡 탭 전환 스위치 함수 추가!
            switchTab(tab) {
                this.currentTab = tab;
                this.selectedId = null;
                const details = document.getElementById('forge-details');
                if(details) details.classList.add('hidden');
                
                // 버튼 색상 업데이트
                ['weapon', 'armor', 'accessory'].forEach(t => {
                    const btn = document.getElementById(`forge-tab-${t}`);
                    if(btn) {
                        btn.className = (t === tab) 
                            ? "flex-1 py-1.5 bg-purple-600 text-white text-[10px] font-bold rounded border border-purple-500 shadow-inner"
                            : "flex-1 py-1.5 bg-slate-800 text-slate-500 text-[10px] font-bold rounded border border-slate-700 hover:text-white transition-colors";
                    }
                });
                this.renderList();
            },

            renderList() {
                const list = document.getElementById('forge-item-list');
                if(!list) return;
                list.innerHTML = '';
                
                const equipped = [GameState.equippedWeapon, GameState.equippedArmor, GameState.equippedAccessory];
                const counts = {};
                
                GameState.inventory.forEach(id => {
                    // 🚨 [핵심 필터링] 선택된 탭(currentTab)과 같은 부위의 장비만 보여주기!
                    if(GameData.items[id] && !equipped.includes(id) && GameData.items[id].subType === this.currentTab) {
                        counts[id] = (counts[id] || 0) + 1;
                    }
                });

                let hasItems = false;
                for(const id in counts) {
                    hasItems = true;
                    const item = GameData.items[id];
                    const count = counts[id];
                    const level = GameState.itemUpgrades[id] || 0;
                    
                    const div = document.createElement('div');
                    div.className = `bg-slate-700 border ${this.selectedId === id ? 'border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'border-slate-600'} rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-600 transition-all relative`;
                    div.onclick = () => { this.selectedId = id; this.renderList(); this.renderDetails(); };
                    
                    div.innerHTML = `
                        <div class="text-2xl mb-1">${item.icon || item.emoji || '📦'}</div>
                        <div class="text-[10px] text-white text-center w-full truncate">${level > 0 ? '<span class="text-purple-300 font-bold">+' + level + '</span>' : ''} ${item.name}</div>
                        <div class="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-indigo-400 shadow-md">x${count}</div>
                    `;
                    list.appendChild(div);
                }

                if(!hasItems) {
                    const tabName = this.currentTab === 'weapon' ? '무기' : this.currentTab === 'armor' ? '방어구' : '장신구';
                    list.innerHTML = `<div class="col-span-4 sm:col-span-5 text-center text-slate-500 text-xs py-6 font-bold">보유 중인 ${tabName}가 없습니다.</div>`;
                }
            },

            renderDetails() {
                const details = document.getElementById('forge-details');
                if(!this.selectedId || !details) return;
                
                const item = GameData.items[this.selectedId];
                const level = GameState.itemUpgrades[this.selectedId] || 0;
                
                // 🚨 [오류 픽스] 여기서도 변수명 수정!
                const equipped = [GameState.equippedWeapon, GameState.equippedArmor, GameState.equippedAccessory];
                let count = 0;
                GameState.inventory.forEach(id => { if(id === this.selectedId && !equipped.includes(id)) count++; });

                details.classList.remove('hidden');

                if(level >= 10) {
                    details.innerHTML = `
                        <div class="text-center py-4">
                            <div class="text-5xl mb-3 animate-bounce">${item.icon || item.emoji || '📦'}</div>
                            <h3 class="text-2xl font-black text-yellow-400 mb-2 drop-shadow-md">+MAX ${item.name}</h3>
                            <p class="text-slate-400 text-sm">더 이상 강화할 수 없는 궁극의 상태입니다.</p>
                        </div>
                    `;
                    return;
                }

                const prob = this.probs[level];
                const cost = (level + 1) * 100; // 1강 100G, 10강 1000G
                const canUpgrade = count >= 2 && GameState.gold >= cost; // 제물용 1개 포함 총 2개 이상 필요

                details.innerHTML = `
                    <div class="flex items-center gap-4 mb-5">
                        <div class="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl border border-slate-600 shadow-inner">
                            ${item.icon || item.emoji || '📦'}
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-black text-white mb-1"><span class="text-slate-400">+${level}</span> ${item.name} ➔ <span class="text-purple-400">+${level+1}</span></h3>
                            <p class="text-xs text-slate-400">아이템 고유 능력치 <span class="text-emerald-400 font-bold">+${(level+1)*10}%</span> 적용</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 mb-5">
                        <div class="bg-slate-800 rounded-xl p-3 text-center border ${count >= 2 ? 'border-slate-600' : 'border-red-500/50'}">
                            <div class="text-[10px] text-slate-400 mb-1">필요 재료 (제물)</div>
                            <div class="text-sm font-bold ${count >= 2 ? 'text-white' : 'text-red-400'}">${item.name} <span class="text-[10px]">(${count}/2)</span></div>
                        </div>
                        <div class="bg-slate-800 rounded-xl p-3 text-center border ${GameState.gold >= cost ? 'border-slate-600' : 'border-red-500/50'}">
                            <div class="text-[10px] text-slate-400 mb-1">소모 골드</div>
                            <div class="text-sm font-bold ${GameState.gold >= cost ? 'text-yellow-400' : 'text-red-400'}">🪙 ${cost} G</div>
                        </div>
                    </div>

                    <div class="mb-5 text-center bg-slate-900/50 py-3 rounded-xl border border-slate-800">
                        <div class="text-xs text-slate-400 mb-1">돌파 성공 확률</div>
                        <div class="text-3xl font-black ${prob >= 50 ? 'text-emerald-400' : (prob >= 30 ? 'text-yellow-400' : 'text-red-500')} drop-shadow-md">${prob}%</div>
                    </div>

                    <button onclick="GameSystem.Forge.attemptUpgrade()" ${!canUpgrade ? 'disabled' : ''} class="w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all ${canUpgrade ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 active:scale-95 border border-purple-400' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}">
                        ${canUpgrade ? '🔨 장비 강화 시도!' : '재료 또는 골드 부족'}
                    </button>
                `;
            },

            attemptUpgrade() {
                if(!this.selectedId) return;
                const level = GameState.itemUpgrades[this.selectedId] || 0;
                if(level >= 10) return;

                const cost = (level + 1) * 100;
                
                // 🚨 [오류 픽스] 여기도 변수명 수정!
                const equipped = [GameState.equippedWeapon, GameState.equippedArmor, GameState.equippedAccessory];
                let count = 0;
                GameState.inventory.forEach(id => { if(id === this.selectedId && !equipped.includes(id)) count++; });

                if(count < 2) return UIManager.showToast("제물로 바칠 동일한 장비가 부족합니다.");
                if(GameState.gold < cost) return UIManager.showToast("골드가 부족합니다.");

                // 💸 비용 지불 및 제물 파괴
                GameState.gold -= cost;
                const index = GameState.inventory.indexOf(this.selectedId);
                if(index > -1) GameState.inventory.splice(index, 1);

                const prob = this.probs[level];
                const roll = Math.random() * 100;

                if(roll < prob) {
                    // 🎉 깡! 강화 성공
                    GameState.itemUpgrades[this.selectedId] = level + 1;
                    AudioEngine.sfx.equip();
                    UIManager.triggerHeavyHaptic();
                    UIManager.showToast(`✨ 돌파 성공! [+${level+1} ${GameData.items[this.selectedId].name}]`, 3000);
                } else {
                    // 💥 쨍그랑! 강화 실패
                    AudioEngine.sfx.hit_player(); 
                    UIManager.triggerHaptic();
                    UIManager.showToast(`💥 강화 실패... 제물 장비가 파괴되었습니다.`, 3000);
                }

                GameState.save();
                UIManager.updateCurrencyUI();
                this.renderList();
                this.renderDetails();
            }
        },

    Lobby: {
       applyBackground() {
            // 💡 [초강력 고정] 모바일 브라우저의 악질적인 스크롤 버그를 완전히 박살내는 CSS!
            let fixedBg = document.getElementById('fixed-custom-bg');
            if (!fixedBg) {
                fixedBg = document.createElement('div');
                fixedBg.id = 'fixed-custom-bg';
                // 100% 높이 대신 상하좌우(top, bottom, left, right)를 0으로 당겨서 화면에 못을 박습니다!
                // transform: translate3d(0,0,0) 을 넣어서 스마트폰의 그래픽 카드(GPU)가 강제로 멈추게 만듭니다.
                fixedBg.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: -2 !important; background-size: cover !important; background-position: center center !important; background-repeat: no-repeat !important; pointer-events: none !important; transform: translate3d(0,0,0) !important;';
                document.body.prepend(fixedBg);
            }

            const dynamicBg = document.getElementById('dynamic-bg'); 
            const bgId = GameState.equippedBg;

            if (bgId && window.GameData && GameData.cosmetics && GameData.cosmetics.backgrounds) {
                const bgItem = GameData.cosmetics.backgrounds.find(b => b.id === bgId);
                if (bgItem) {
                    // 고정된 도화지에 배경 그리기
                    fixedBg.style.backgroundImage = `url('assets/backgrounds/${bgItem.img}')`;
                    fixedBg.style.display = 'block';
                    
                    document.body.style.backgroundImage = "none";
                    
                    document.querySelectorAll('.screen').forEach(s => {
                        s.style.backgroundColor = 'rgba(15, 23, 42, 0.65)'; // 화면을 살짝 더 어둡게 눌러줌
                        s.style.backdropFilter = 'blur(3px)'; // 뒷배경 뽀샤시 효과
                    });

                    if (dynamicBg) dynamicBg.style.display = 'none'; 
                    return;
                }
            }
            
            // 장착 해제 시 원상복구
            if (fixedBg) fixedBg.style.display = 'none';
            document.body.style.backgroundImage = "none";
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
// 🌟 [신규 추가] 내 현재 스펙에 맞는 방치형 최대 한도 계산기!
        getMaxIdleReward() {
            // 1. 현재 돌파한 보스 수 (존) 계산 (1~9층 = 0명, 10~19층 = 1명...)
            const bossDefeated = Math.floor((GameState.rpgStage - 1) / 10);
            
            // 2. 환생 배율 (0환생=1배, 1환생=2배, 2환생=4배, 3환생=8배... 2의 제곱으로 떡상!)
            const prestigeCount = GameState.prestigeCount || 0;
            const prestigeMult = Math.pow(2, prestigeCount); 
            
            // 3. 최종 한도: (기본 200 + 보스 1명당 20) * 환생배율
            return (200 + (bossDefeated * 20)) * prestigeMult;
        },

        // 💰 [대격변] 8시간 기준 폭발적인 스케일링이 적용된 지원금 계산기!
        calculateIdleReward() {
            const now = Date.now();
            const elapsedHours = (now - GameState.lastIdleCheck) / (1000 * 60 * 60);
            
            const maxGold = this.getMaxIdleReward();
            const goldPerHour = maxGold / 8; // 8시간을 꽉 채웠을 때 maxGold가 되도록 1시간당 획득량 계산
            
            const reward = Math.floor(elapsedHours * goldPerHour);
            
            return Math.min(maxGold, reward); // 최대치를 넘지 않도록 커트!
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
            
            // 💡 장비 부위(subType)에 맞춰서 각각의 칸에 장착/해제하기!
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
                GameState.equippedSkin = GameState.equippedSkin === id ? null : id;
            }
            
            // 🚨 [버그 수정] 장비를 뺐을 때 깎여나간 최대 체력보다 현재 체력이 높으면 깎아내기!
            const newStats = GameState.getTotalStats();
            if (GameState.currentHp > newStats.hp) {
                GameState.currentHp = newStats.hp;
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
// =========================================================================
    // 🌸 [신규 시스템] 미소녀 파트너 동행 엔진
    // =========================================================================
Partner: {
        toggleEquip(id) {
            const pt = GameData.partners[id]; 
            if(!pt) return;
            
            // 1. 상태 변경
            GameState.equippedPartner = GameState.equippedPartner === id ? null : id;
            
            // 🚨 [버그 수정] 파트너 해제 시 최대 체력이 깎이면 현재 체력도 맞춰서 깎아내기!
            const newStats = GameState.getTotalStats();
            if (GameState.currentHp > newStats.hp) {
                GameState.currentHp = newStats.hp;
            }

            GameState.save(); 
            
            // 2. 화면 그리기
            UIManager.renderInventory();        
            UIManager.renderPartnerInventory(); 
            UIManager.applyAvatarSkin();        
            UIManager.updateRpgLobbyUI();       
            
            // 3. 사운드 및 진동
            if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.equip(); 
            UIManager.triggerHaptic();
            
            // 4. 안내 토스트
            const actionText = GameState.equippedPartner ? pt.flavorText : `🌸 [${pt.name}] 동행을 해제했습니다.`;
            UIManager.showToast(actionText);
            
            // 5. 서버 데이터 백업
            if (GameSystem.Profile && GameSystem.Profile.syncToServer) {
                GameSystem.Profile.syncToServer();
            }
        }
    }, // <-- 콤마 필수! (이 밑에 Gacha: { 가 이어집니다)
        
Gacha: {
        performGacha(times, type = 'gear') {
            const cost = type === 'partner' ? times * 100 : times * 50; 
            if(GameState.gem < cost) return UIManager.showToast("젬(💎)이 부족합니다! 보스를 토벌하세요.");
            
            this._executeGachaLogic(times, type);
        },

        _executeGachaLogic(times, type = 'gear') {
            const cost = type === 'partner' ? times * 100 : times * 50;
            GameState.gem -= cost; GameState.save(); UIManager.updateCurrencyUI();
            
            document.getElementById('bottom-nav').style.display = 'none'; 
            const over = document.getElementById('gacha-overlay'); 
            const resBox = document.getElementById('gacha-results-container'); 
            const anim = document.getElementById('gacha-animation');
            const closeBtn = document.getElementById('gacha-close-btn');
            
            over.classList.add('active'); 
            resBox.classList.add('hidden'); resBox.innerHTML = ''; 
            anim.classList.remove('hidden'); 
            closeBtn.classList.add('hidden');
            
            // 🎁 1. 결과 미리 계산
            let results = [];
            for(let i=0; i<times; i++) {
                const roll = Math.random() * 100; 
                let rarity = 'common'; 
                
                if (roll < 0.8) rarity = 'mythic';               
                else if (roll < 0.8 + 2.5) rarity = 'legendary'; 
                else if (roll < 0.8 + 2.5 + 7.5) rarity = 'epic'; 
                else if (roll < 0.8 + 2.5 + 7.5 + 25.0) rarity = 'rare'; 
                else rarity = 'common';                          
                
                if (type === 'partner') {
                    const pool = Object.values(GameData.partners).filter(it => it.rarity === rarity);
                    const safePool = pool.length > 0 ? pool : Object.values(GameData.partners).filter(it => it.rarity === 'rare');
                    const pt = safePool[Math.floor(Math.random() * safePool.length)];
                    
                    const isDup = GameState.ownedPartners.includes(pt.id);
                    if (isDup) {
                        GameState.partnerLevels[pt.id] = Math.min((GameState.partnerLevels[pt.id] || 0) + 1, 10);
                        results.push({ ...pt, isDup: true });
                    } else {
                        GameState.ownedPartners.push(pt.id);
                        GameState.partnerLevels[pt.id] = 0;
                        results.push({ ...pt, isDup: false });
                    }
                } else {
                    const pool = Object.values(GameData.items).filter(it => it.rarity === rarity);
                    const safePool = pool.length > 0 ? pool : Object.values(GameData.items).filter(it => it.rarity === 'common');
                    const item = safePool[Math.floor(Math.random() * safePool.length)];
                    
                    const itemId = item.id || Object.keys(GameData.items).find(key => GameData.items[key] === item);
                    results.push({ id: itemId, ...item }); 
                    GameState.inventory.push(itemId);
                }
            }

            // 🎁 2. 포탈 색상 및 텍스트 설정
            let hasMythic = results.some(r => r.rarity === 'mythic');
            let hasLegendary = results.some(r => r.rarity === 'legendary');
            
            let portalMsg = type === 'partner' ? "차원의 문 개방 중..." : "소환의식 진행 중...";
            let titleColor = "text-white";
            let portalGlow = "shadow-[0_0_40px_rgba(59,130,246,0.8)]"; // BLUE
            let portalFilter = "hue-rotate-0";

            if (hasMythic) {
                portalMsg = "심연의 틈새가 열립니다...!!";
                titleColor = "text-pink-400 font-black animate-pulse drop-shadow-md";
                portalGlow = "shadow-[0_0_80px_rgba(236,72,153,1)]"; // PINK
                portalFilter = "hue-rotate-[-45deg] saturate-200";
            } else if (hasLegendary) {
                portalMsg = "눈부신 황금빛이 뿜어져 나옵니다!";
                titleColor = "text-yellow-400 font-black drop-shadow-md";
                portalGlow = "shadow-[0_0_60px_rgba(250,204,21,0.8)]"; // YELLOW
                portalFilter = "hue-rotate-[180deg] saturate-150"; 
            }

            document.getElementById('gacha-title').innerHTML = `<span class="${titleColor}">${portalMsg}</span>`;
            
            // 🎁 3. 💡 [수정 사항 3번] 이모지 삭제 구문 제거 후 마법진 렌더링 정상화!
            anim.className = 'mb-8 transition-all duration-500 flex justify-center w-full';
            anim.innerHTML = `
                <div class="relative w-32 h-32 rounded-full ${portalGlow} animate-[spin_4s_linear_infinite] flex items-center justify-center">
                    <img src="assets/ui/summon_portal.png" class="w-full h-full object-cover rounded-full filter ${portalFilter}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3242/3242257.png'; this.classList.add('opacity-30');">
                </div>
            `;
            
            if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.gacha_build(); 
            if(window.UIManager && UIManager.triggerHeavyHaptic) UIManager.triggerHeavyHaptic();

            // 🎁 4. 컷인 애니메이션 분기
            setTimeout(() => {
                const mythicPartner = type === 'partner' ? results.find(r => r.rarity === 'mythic') : null;
                
                if (mythicPartner) {
                    if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.boss();
                    if(window.UIManager && UIManager.triggerHeavyHaptic) UIManager.triggerHeavyHaptic();
                    
                    anim.classList.add('hidden'); 
                    resBox.classList.remove('hidden'); 
                    resBox.className = "w-full max-w-sm flex flex-col justify-center items-center h-[300px] relative overflow-hidden custom-scrollbar"; 
                    resBox.innerHTML = ''; 

                    // 💡 [수정 사항 1번 & 2번] 이미지가 확실히 보이도록 CSS(z-index 등) 재조정 및 타이밍 연장
                    const cutinHTML = `
                        <div id="mythic-cutin-text" class="w-[90%] z-30 text-center p-4 bg-slate-900/90 rounded-xl border-2 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.5)] px-6 opacity-0 transition-opacity duration-500 relative">
                            <h2 class="text-lg sm:text-xl font-black text-pink-300 mb-2 drop-shadow-md whitespace-pre-wrap">"${mythicPartner.flavorText.replace(/\\n/g, '\n')}"</h2>
                            <p class="text-[10px] sm:text-xs text-white/70 font-bold">- ${mythicPartner.name} -</p>
                        </div>
                        
                        <img id="mythic-cutin-illus" src="assets/partners/${mythicPartner.img_full}" class="absolute w-[180%] h-auto opacity-0 object-contain object-top -top-10 z-10 transition-all duration-[2000ms] scale-110 blur-sm" onerror="this.style.display='none';">
                        
                        <div id="mythic-cutin-guide" class="absolute bottom-4 text-white font-black text-xs animate-pulse z-40 opacity-0 transition-opacity duration-500 bg-black/50 px-3 py-1 rounded-full">화면을 클릭하여 결과 확인</div>
                    `;
                    resBox.insertAdjacentHTML('beforeend', cutinHTML);

                    // 텍스트 먼저 스르륵 등장!
                    setTimeout(() => {
                        const textBox = document.getElementById('mythic-cutin-text');
                        if(textBox) textBox.style.opacity = '1';
                    }, 100);

                    // 💡 [수정 사항 2번] 코멘트 나오는 시간을 2초로 늘리고, 그 후 일러스트가 화려하게 등장!
                    setTimeout(() => {
                        const illus = document.getElementById('mythic-cutin-illus');
                        if(illus) {
                            illus.style.opacity = '0.6'; // 너무 밝으면 텍스트가 안 보이니 투명도 60%
                            illus.style.transform = 'scale(1.0)'; // 스르륵 축소되며 포커싱
                            illus.style.filter = 'blur(0px)'; // 선명해짐
                        }
                    }, 2000); // 2초 뒤에 일러스트 등장!

                    // 일러스트 등장 후 약간의 대기 후 클릭 가이드 노출
                    setTimeout(() => {
                        const guide = document.getElementById('mythic-cutin-guide');
                        if(guide) guide.style.opacity = '1';
                        
                        // 클릭 리스너 활성화
                        const overlay = document.getElementById('gacha-overlay');
                        const handleCutinClick = (e) => {
                            e.stopPropagation(); 
                            overlay.removeEventListener('click', handleCutinClick); 

                            if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
                            
                            // 컷인 정보 지우기
                            const textBox = document.getElementById('mythic-cutin-text');
                            const illus = document.getElementById('mythic-cutin-illus');
                            const guide = document.getElementById('mythic-cutin-guide');
                            if(textBox) textBox.style.opacity = '0'; 
                            if(illus) illus.style.opacity = '0';
                            if(guide) guide.style.opacity = '0';

                            // 0.3초 대기 후 카드 공개
                            setTimeout(() => {
                                this._revealResults(type, times, results, anim, resBox, closeBtn);
                            }, 300);
                        };
                        overlay.addEventListener('click', handleCutinClick); 
                    }, 3500); // 총 3.5초(텍스트 2초 + 일러스트 1.5초) 대기 후 클릭 가능

                } else {
                    this._revealResults(type, times, results, anim, resBox, closeBtn);
                }
            }, 1500);
        },

        // 🎁 5. 실제 카드가 순차적으로 타다닥! 꽂히는 공통 연출 함수
        _revealResults(type, times, results, anim, resBox, closeBtn) {
            GameState.save();
            
            if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.gacha_reveal(); 
            if(window.UIManager && UIManager.triggerHaptic) UIManager.triggerHaptic();
            
            anim.classList.add('hidden'); 
            resBox.classList.remove('hidden'); 

            document.getElementById('gacha-title').innerHTML = type === 'partner' ? "🌸 영입 완료!" : "소환 결과!";
            document.getElementById('gacha-title').className = "text-center text-xl sm:text-2xl font-black text-white drop-shadow-md"; 
            
            resBox.className = times === 1 
                ? "w-full max-w-xs grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pb-6" 
                : "w-full max-w-sm grid grid-cols-2 gap-3 overflow-y-auto max-h-[60vh] pb-10 custom-scrollbar";
            resBox.innerHTML = ''; 

            results.forEach((item, index) => {
                setTimeout(() => {
                    let rarityLabel = item.rarity === 'mythic' ? "✨신화✨" : item.rarity === 'legendary' ? "전설" : item.rarity === 'epic' ? "영웅" : item.rarity === 'rare' ? "희귀" : "일반";
                    let colorClass = item.rarity === 'mythic' ? "text-pink-400 font-extrabold animate-pulse" : item.rarity === 'legendary' ? "text-yellow-400 font-extrabold" : (item.color || "text-gray-300");
                    
                    let dupText = item.isDup ? `<div class="absolute -top-2 -right-2 bg-pink-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md z-20">조각 변환</div>` : '';
                    
                    let iconHtml = type === 'partner' 
                        ? `<img src="assets/partners/${item.img_sd}" class="w-14 h-14 object-contain filter drop-shadow-md mb-1" onerror="this.style.display='none'; setTimeout(() => { if(this.nextElementSibling) this.nextElementSibling.style.display='block'; }, 10);"><div style="display:none;" class="text-4xl mb-1 filter drop-shadow-lg">${item.emoji}</div>`
                        : `<div class="text-4xl mb-1 filter drop-shadow-lg">${item.emoji}</div>`;

                    const cardHtml = `<div class="gacha-item-card item-card rarity-${item.rarity} relative opacity-0" style="animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;">
                        ${dupText}
                        <span class="text-[10px] font-bold mb-1 ${colorClass} tracking-widest">[${rarityLabel}]</span>
                        ${iconHtml} <h4 class="text-white font-bold text-xs text-center break-keep">${item.name}</h4>
                    </div>`;
                    
                    resBox.insertAdjacentHTML('beforeend', cardHtml);
                    
                    if(item.rarity === 'mythic' || item.rarity === 'legendary') {
                        if(window.UIManager && UIManager.triggerHeavyHaptic) UIManager.triggerHeavyHaptic(); 
                        if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.equip(); 
                    } else {
                        if(window.UIManager && UIManager.triggerHaptic) UIManager.triggerHaptic();
                        if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.hit_normal();
                    }

                    if(item.rarity === 'mythic') {
                        const overlay = document.getElementById('gacha-overlay');
                        if (overlay) {
                            overlay.classList.add('shake');
                            setTimeout(() => overlay.classList.remove('shake'), 400); 
                        }
                    }
                }, index * 200); 
            });
            
            closeBtn.innerText = type === 'partner' ? "명단 확인하기" : "인벤토리에 넣기";
            setTimeout(() => { closeBtn.classList.remove('hidden'); }, results.length * 200 + 300);
        },
        
        closeGacha() { 
            AudioEngine.sfx.click(); 
            document.getElementById('gacha-overlay').classList.remove('active'); 
            document.getElementById('bottom-nav').style.display = 'flex'; 
            
            if(window.UIManager) {
                if(UIManager.renderInventory) UIManager.renderInventory();
                if(UIManager.renderPartnerInventory) UIManager.renderPartnerInventory();
                UIManager.updateRpgLobbyUI(); 
            }
        }
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
                   // 🌟 [추가됨!] 내가 낀 프로필 정보도 서버로 보냅니다!
                    profile: GameState.equippedProfile || 'none',  
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
                    
                    let skinClass = "bg-gradient-to-tr from-slate-600 to-slate-400 border border-slate-600"; 
                    let sId = d.skin;
                    if(sId && sId !== 'none' && window.GameData && GameData.cosmetics && GameData.cosmetics.borders) {
                        const bItem = GameData.cosmetics.borders.find(x => x.id === sId);
                        if(bItem) skinClass = `bg-slate-800 ${bItem.cssClass}`; 
                    }
                    
                    let innerIcon = d.nickname.charAt(0);
                    if (d.profile && d.profile !== 'none' && d.profile !== 'default' && window.GameData && GameData.cosmetics && GameData.cosmetics.profiles) {
                        const pfItem = GameData.cosmetics.profiles.find(x => x.id === d.profile);
                        if (pfItem) innerIcon = pfItem.icon;
                    }
                    
                    const isMe = (d.nickname === GameState.nickname); const myHighlight = isMe ? "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "border-transparent";
                    let prestigeText = d.prestige ? `<span class="text-[9px] sm:text-[10px] text-purple-400 font-black mr-1 whitespace-nowrap">[${d.prestige}환생]</span>` : '';
                    let titleHtml = d.title ? `<div class="text-[8px] sm:text-[9px] text-red-400 font-black mb-0.5 animate-pulse drop-shadow-md">${d.title}</div>` : '';
                    
                    // 🌟 [대수술 완료] 
                    // 1. py-3 pl-2 pr-3 로 왼쪽 여백을 줄여서 '1위'를 왼쪽으로 바싹 붙였습니다.
                    // 2. w-10 텍스트 크기를 살짝 줄여서 공간을 더 확보했습니다.
                    // 3. 닉네임과 칭호에 마스터의 아이디어인 'rank-marquee-box' (슬라이딩)를 씌웠습니다!
                list.innerHTML += `
                        <div class="py-3 pl-2 pr-3 sm:py-4 sm:pl-3 sm:pr-4 rounded-xl flex items-center justify-between ${bgClass} border ${myHighlight} transition-all mb-3 gap-2">
                            <div class="flex items-center gap-2 flex-1 min-w-0">
                                <div class="w-10 sm:w-11 text-center font-black ${i < 3 ? 'text-yellow-400' : 'text-slate-500'} shrink-0 whitespace-nowrap text-[13px] sm:text-sm tracking-tighter">${rankIcon}</div>
                                
                                <div onclick="UIManager.openUserProfile('${d.nickname}', '${innerIcon}', '${(d.title || '').replace(/'/g, "\\'")}', '${d.stage}', '${skinClass.replace(/'/g, "\\'")}')" class="master-avatar cursor-pointer hover:scale-110 transition-transform w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md ${skinClass} shrink-0 relative z-10">${innerIcon}</div>
                                
                                <div class="rank-marquee-box flex-1 min-w-0">
                                    <div class="rank-marquee-text">
                                        ${titleHtml}
                                        <div class="flex items-center gap-1.5">
                                            <p class="font-bold text-white text-[13px] sm:text-sm">${d.nickname}</p>
                                            ${isMe ? '<span class="text-[9px] bg-indigo-500 px-1 py-0.5 rounded text-white font-normal shrink-0">ME</span>' : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                           <div class="text-right shrink-0 whitespace-nowrap pl-1">
                                <p class="text-[10px] sm:text-xs text-slate-400">도달 층수</p>
                                <p class="text-base sm:text-lg font-black text-gradient-gold flex items-center justify-end">${prestigeText}${d.stage}F</p>
                            </div>
                        </div>`;
                });
                
                // 🌟 [추가됨] 화면에 글씨가 다 그려지면, 상자 크기랑 글씨 길이를 비교합니다!
                setTimeout(() => {
                    const boxes = list.querySelectorAll('.rank-marquee-box');
                    boxes.forEach(box => {
                        const textEl = box.querySelector('.rank-marquee-text');
                        // 글씨 길이(scrollWidth)가 상자 크기(clientWidth)보다 크다면?
                        if (textEl && textEl.scrollWidth > box.clientWidth) {
                            textEl.classList.add('is-long'); // 움직이는 애니메이션 스위치 ON!
                            
                            // 삐져나온 길이만큼만 딱 맞게 이동하도록 변수 설정!
                            const moveDist = box.clientWidth - textEl.scrollWidth; 
                            textEl.style.setProperty('--slide-distance', `${moveDist}px`);
                        } else {
                            // 글자가 짧아서 넉넉하다면, 오른쪽 끝이 흐려지는 효과(마스크)도 꺼버리기!
                            box.style.maskImage = 'none';
                            box.style.webkitMaskImage = 'none';
                        }
                    });
                }, 50);

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
// 🚫 [신규] 유저 차단하기 (로컬 저장소에 블랙리스트 작성)
        blockUser() {
            if (!window.currentTargetUser) return;
            if (!GameState.blockedUsers) GameState.blockedUsers = []; // 블랙리스트 수첩 만들기
            
            if (!GameState.blockedUsers.includes(window.currentTargetUser)) {
                GameState.blockedUsers.push(window.currentTargetUser);
                GameState.save();
                UIManager.showToast(`🚫 [${window.currentTargetUser}] 유저를 차단했습니다. 이제 채팅이 보이지 않습니다.`);
            } else {
                UIManager.showToast(`이미 차단된 유저입니다.`);
            }
            
            UIManager.closeUserProfile();
            
            // 채팅창을 새로고침해서 차단한 사람 글 싹 날려버리기!
            const tempRoom = this.currentRoom;
            this.currentRoom = null; 
            this.switchRoom(tempRoom);
        },

        // 🚨 [신규] 파이어베이스에 진짜로 신고장 쏘기!
        async submitReport() {
            const reason = document.getElementById('report-reason-input').value.trim();
            if (!reason) return UIManager.showToast("🚨 신고 사유를 작성해주세요!");
            if (!window.db || !window.currentTargetUser) return;

            try {
                // 파이어베이스에 'reports' 라는 새 폴더를 만들어서 찔러넣기!
                await window.addDoc(window.collection(window.db, "reports"), {
                    reporter: GameState.nickname,
                    target: window.currentTargetUser,
                    reason: reason,
                    timestamp: window.serverTimestamp()
                });
                
                UIManager.showToast("🚨 신고가 정상적으로 접수되었습니다. 깨끗한 랩을 위해 노력하겠습니다!");
                document.getElementById('report-reason-input').value = ''; // 썼던 내용 지우기
                UIManager.closeReportModal();
                UIManager.closeUserProfile();
            } catch(e) {
                console.error("신고 실패:", e);
                UIManager.showToast("신고 접수에 실패했습니다 😢");
            }
        },
            // 📋 [신규] 차단된 유저 목록 화면에 그리기
        renderBlockedUsers() {
            const listContainer = document.getElementById('blocked-users-list');
            if (!listContainer) return;
            
            listContainer.innerHTML = '';
            
            if (!GameState.blockedUsers || GameState.blockedUsers.length === 0) {
                listContainer.innerHTML = '<div class="text-center text-slate-500 text-xs py-8">차단한 유저가 없습니다.</div>';
                return;
            }
            
            GameState.blockedUsers.forEach(nickname => {
                const div = document.createElement('div');
                div.className = "flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-sm";
                div.innerHTML = `
                    <span class="text-white font-bold text-sm truncate pr-2">${nickname}</span>
                    <button onclick="GameSystem.Chat.unblockUser('${nickname}')" class="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded shadow transition-all active:scale-95">해제</button>
                `;
                listContainer.appendChild(div);
            });
        },

        // 🔓 [신규] 유저 차단 해제하기
        unblockUser(nickname) {
            if (!GameState.blockedUsers) return;
            
            // 블랙리스트에서 해당 닉네임 지우기
            GameState.blockedUsers = GameState.blockedUsers.filter(name => name !== nickname);
            GameState.save();
            
            UIManager.showToast(`✅ [${nickname}] 유저의 차단이 해제되었습니다.`);
            
            // 화면 목록 다시 그리기 (방금 해제한 사람 사라짐)
            this.renderBlockedUsers();
            
            // 채팅창 새로고침 (차단 해제된 사람 글이 마법처럼 다시 등장!)
            const tempRoom = this.currentRoom;
            this.currentRoom = null; 
            this.switchRoom(tempRoom);
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
                // 🚫 [핵심 1] 내가 차단한 블랙리스트 유저면 여기서 바로 컷! (화면에 안 그립니다)
                if (GameState.blockedUsers && GameState.blockedUsers.includes(msg.nickname)) return;

                const isMe = (msg.nickname === GameState.nickname);
                const timeStr = msg.timestamp ? new Date(msg.timestamp.toMillis()).toLocaleTimeString('ko-KR', {hour: '2-digit', minute:'2-digit'}) : '';
                
                let titleHtml = msg.titleShort ? `<span class="text-[9px] text-red-400 font-bold drop-shadow-md">${msg.titleShort}</span>` : '';
                
                let skinClass = "bg-slate-700 border border-slate-600"; 
                if(msg.skin && msg.skin !== 'none' && window.GameData && GameData.cosmetics && GameData.cosmetics.borders) {
                    const bItem = GameData.cosmetics.borders.find(x => x.id === msg.skin);
                    if(bItem) skinClass = `bg-slate-800 ${bItem.cssClass}`;
                }

                let innerIcon = msg.nickname.charAt(0);
                if (msg.profile && msg.profile !== 'none' && msg.profile !== 'default' && window.GameData && GameData.cosmetics && GameData.cosmetics.profiles) {
                    const pfItem = GameData.cosmetics.profiles.find(x => x.id === msg.profile);
                    if (pfItem) innerIcon = pfItem.icon;
                }
           
                let bubbleClass = isMe ? "bg-indigo-600 text-white" : "bg-slate-700 text-white"; 
                if(msg.bubble && msg.bubble !== 'none' && window.GameData && GameData.cosmetics && GameData.cosmetics.bubbles) {
                    const bubItem = GameData.cosmetics.bubbles.find(x => x.id === msg.bubble);
                    if(bubItem) bubbleClass = bubItem.bgClass; 
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
                            <div onclick="UIManager.openUserProfile('${msg.nickname}', '${innerIcon}', '${msg.titleShort || ''}', '', '${skinClass.replace(/'/g, "\\'")}')" class="master-avatar cursor-pointer hover:scale-110 transition-transform w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0 border border-slate-600 ${skinClass}">${innerIcon}</div>
                            
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
                        // 🌟 [추가됨!] 채팅 칠 때 프로필 정보도 묶어서 쏩니다!
                    profile: GameState.equippedProfile || 'none',
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
                if(this.autoSaveTimer) clearInterval(this.autoSaveTimer);

                const docSnap = await window.getDoc(window.doc(window.db, "users", uid));
                if (docSnap.exists() && docSnap.data().saveData) {
                    const cloudData = docSnap.data().saveData;
                    for (const key in cloudData) {
                        // 🚨 [수정] 강제 동기화 때도 탈주 기록은 무시!
                        if (key !== 'master_in_battle') {
                            localStorage.setItem(key, cloudData[key]);
                        }
                    }
                    // 🚨 [핵심] 찌꺼기 완벽 소각!
                    localStorage.removeItem('master_in_battle'); 
                    
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
                // 🚨 [수정] key가 'master_in_battle'이 아닐 때만 저장하도록 조건 추가!
                if (key && (key.startsWith('master_') || key === 'last_checkin') && key !== 'master_in_battle') {
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
                            // 🚨 [수정] 다운로드할 때도 탈주 기록은 빼고 받기!
                            if (key !== 'master_in_battle') {
                                localStorage.setItem(key, cloudData[key]);
                            }
                        }
                        // 🚨 [핵심] 찌꺼기가 남아있을 수 있으니 무조건 지우고 재시작!
                        localStorage.removeItem('master_in_battle'); 
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
        
        list: {
            daily: [
                { id: 'd1', title: '심연의 도전자', desc: '심연의 탑 3층(회) 클리어', target: 3, rewardGold: 50, rewardGems: 15 },
                { id: 'd2', title: '트렌드 세터', desc: '인기 폭발 테스트 3회 참여', target: 3, rewardGold: 50, rewardGems: 20 },
                { id: 'd3', title: '성장의 기쁨', desc: '골드로 스탯 3회 강화', target: 3, rewardGold: 50, rewardGems: 15 }
            ],
            weekly: [
                { id: 'w1', title: '심연의 정복자', desc: '일반 몬스터 30마리 토벌', target: 30, rewardGold: 500, rewardGems: 100 },
                { id: 'w2', title: '심연의 군주 토벌대', desc: '보스 몬스터 5마리 토벌', target: 5, rewardGold: 1500, rewardGems: 300 },
                { id: 'w3', title: '시간의 투자자', desc: '방치형 지원금 5회 수령', target: 5, rewardGold: 300, rewardGems: 50 },
                { id: 'w4', title: '만수르의 길', desc: '골드로 스탯 30회 강화', target: 30, rewardGold: 1000, rewardGems: 200 },
                { id: 'w5', title: '차원을 넘어서', desc: '환생(Prestige) 1회 달성', target: 1, rewardGold: 5000, rewardGems: 500 }
            ]
        },

        progress: { daily: {}, weekly: {} },
      
        // 🚨 [누락 복구] 퀘스트 진행도 저장 장치
        save() {
            localStorage.setItem('master_quest_progress2', JSON.stringify(this.progress));
        },

        // 🚨 [진범 박멸!!] 퀘스트 카운트를 올려주는 수신기 엔진 드디어 탑재!!
        update(type, questId, amount) {
            if (!this.progress[type] || !this.progress[type][questId]) return;
            
            let q = this.progress[type][questId];
            let targetData = this.list[type].find(x => x.id === questId);
            if (!targetData) return;

            // 이미 달성했거나 보상받은 퀘스트면 무시
            if (q.count >= targetData.target || q.claimed) return;

            q.count += amount;
            
            // 목표치 달성!
            if (q.count >= targetData.target) {
                q.count = targetData.target;
                if(window.UIManager && UIManager.showToast) {
                    UIManager.showToast(`🔔 퀘스트 달성: [${targetData.title}]`);
                }
            }
            this.save(); // 진척도 오를 때마다 안전하게 저장
        },

        init() {
            const saved = localStorage.getItem('master_quest_progress2'); 
            
            const todayStr = new Date().toDateString(); 
            const now = new Date();
            const day = now.getDay() || 7; 
            const monday = new Date(now);
            monday.setDate(monday.getDate() - day + 1); 
            monday.setHours(0,0,0,0);
            const weekStr = monday.toDateString(); 

            if (saved) {
                this.progress = JSON.parse(saved);
            } else {
                this.progress = { daily: {}, weekly: {}, lastDailyDate: '', lastWeeklyDate: '' };
            }

            if (!this.progress.daily) this.progress.daily = {};
            if (!this.progress.weekly) this.progress.weekly = {};

            let needsSave = false;

            if (this.progress.lastDailyDate !== todayStr) {
                this.list.daily.forEach(q => this.progress.daily[q.id] = { count: 0, claimed: false });
                this.progress.lastDailyDate = todayStr; 
                needsSave = true;
            }

            if (this.progress.lastWeeklyDate !== weekStr) {
                this.list.weekly.forEach(q => this.progress.weekly[q.id] = { count: 0, claimed: false });
                this.progress.lastWeeklyDate = weekStr; 
                needsSave = true;
            }

            if (needsSave || !saved) {
                this.save();
            }
        },

        openModal() {
            if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
            if(window.UIManager && UIManager.triggerHaptic) UIManager.triggerHaptic();
            
            this.init(); 

            const modal = document.getElementById('quest-modal');
            if (modal) {
                modal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
                modal.classList.add('opacity-100', 'pointer-events-auto', 'scale-100', 'active');
                this.renderList(); 
            }
        },

        closeModal() {
            if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
            const modal = document.getElementById('quest-modal');
            if (modal) {
                modal.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100', 'active');
                modal.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
            }
        },

        switchTab(tabName) {
            if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
            this.currentTab = tabName;
            const btnDaily = document.getElementById('quest-tab-daily');
            const btnWeekly = document.getElementById('quest-tab-weekly'); 
            
            if (tabName === 'daily') {
                if(btnDaily) btnDaily.className = "flex-1 py-2 bg-slate-700 text-white border border-slate-500 text-xs font-bold rounded";
                if(btnWeekly) btnWeekly.className = "flex-1 py-2 bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold rounded";
            } else {
                if(btnDaily) btnDaily.className = "flex-1 py-2 bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold rounded";
                if(btnWeekly) btnWeekly.className = "flex-1 py-2 bg-slate-700 text-white border border-slate-500 text-xs font-bold rounded";
            }
            this.renderList();
        },

        claimReward(type, questId) {
            let qProgress = this.progress[type][questId];
            let qData = this.list[type].find(q => q.id === questId);

            if (qProgress.count >= qData.target && !qProgress.claimed) {
                qProgress.claimed = true;
                
                GameState.gold += Number(qData.rewardGold || 0); 
                GameState.gem += Number(qData.rewardGems || 0);
                
                if(GameState.save) GameState.save();
                this.save();
                
                if(window.UIManager) {
                    UIManager.updateCurrencyUI();
                    if(UIManager.triggerHaptic) UIManager.triggerHaptic();
                    UIManager.showToast(`🎁 보상 획득! 🪙 ${qData.rewardGold} / 💎 ${qData.rewardGems}`);
                }
                if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.coin();
                this.renderList(); 
            }
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
        monsterMaxHp: 0, monsterCurrentHp: 0, monsterAtkObj: 0, 
        battleInterval: null, lastAttackTime: 0, bossAttackCount: 0,
        
        partnerInterval: null,
        battleState: { shield: 0, stunUntil: 0, buffUntil: 0, debuffUntil: 0 },
        battleLogs: [], // 🌟 멀티라인 로그 배열

        // 🌟 [신규] 멀티라인 전투 로그 추가 함수
        addLog(text, colorClass = "text-slate-300") {
            const container = document.getElementById('battle-log-container');
            if (!container) return;
            
            this.battleLogs.push(`<div class="${colorClass} animate-[fadeIn_0.2s_ease-out] mb-0.5">${text}</div>`);
            if (this.battleLogs.length > 3) this.battleLogs.shift(); // 3줄 유지
            container.innerHTML = this.battleLogs.join('');
        },

        showDamageText(targetId, text, typeClass) {
            const target = document.getElementById(targetId);
            if(!target) return;
            const textEl = document.createElement('div');
            textEl.innerText = text;
            textEl.className = `damage-text ${typeClass}`;
            const randomX = (Math.random() - 0.5) * 60;
            const randomY = (Math.random() - 0.5) * 40;
            textEl.style.left = `calc(50% + ${randomX}px)`;
            textEl.style.top = `calc(50% + ${randomY}px)`;
            target.appendChild(textEl);
            setTimeout(() => { textEl.remove(); }, 700);
        },

        enterDungeon() {
            if (GameState.currentHp <= 0) return UIManager.showToast("체력이 없습니다! 여관에서 휴식하세요. ⛺");
            if (GameState.rpgStage > 100) return UIManager.showToast("심연의 군주를 토벌했습니다! 차원의 여신에게 환생을 요청하세요. ✨");
            
            AudioEngine.sfx.click(); UIManager.triggerHaptic(); 
            document.getElementById('bottom-nav').style.display = 'none'; 
            
            const isBoss = (GameState.rpgStage % 10 === 0);
            if (!isBoss && Math.random() < 0.2) { 
                this.triggerRandomEvent(); 
            } else { 
                if (isBoss) {
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
        },

        triggerRandomEvent() {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); 
            document.getElementById('screen-rpg-event').classList.add('active');
            const titleEl = document.getElementById('event-title');
            const iconEl = document.getElementById('event-icon');
            const descEl = document.getElementById('event-desc');
            const eventType = Math.floor(Math.random() * 6); 
            let hpStat = GameState.getTotalStats().hp;

            if (eventType === 0) {
                titleEl.innerText = "숨겨진 보물상자!"; iconEl.innerText = "🎁"; titleEl.className = "text-2xl font-black text-yellow-400 mb-4"; 
                descEl.innerText = "상자를 열었더니 골드가 쏟아집니다!\n(+50G 획득)"; AudioEngine.sfx.coin(); GameState.gold += 50; 
            } else if (eventType === 1) {
                titleEl.innerText = "함정 발동!"; iconEl.innerText = "🪤"; titleEl.className = "text-2xl font-black text-rose-500 mb-4"; 
                let dmg = Math.floor(hpStat * 0.15); descEl.innerText = `독화살이 날아왔습니다!\n(-${dmg} HP)`; 
                GameState.currentHp = Math.max(1, GameState.currentHp - dmg); AudioEngine.sfx.hit_player(); UIManager.triggerHeavyHaptic(); 
            } else if (eventType === 2) {
                titleEl.innerText = "요정의 축복"; iconEl.innerText = "🧚"; titleEl.className = "text-2xl font-black text-cyan-400 mb-4"; 
                let heal = Math.floor(hpStat * 0.3); descEl.innerText = `요정이 상처를 치료해 줍니다.\n(+5💎, +${heal} HP)`; AudioEngine.sfx.coin(); 
                GameState.gem += 5; GameState.currentHp = Math.min(hpStat, GameState.currentHp + heal); 
            } else if (eventType === 3) {
                titleEl.innerText = "미믹의 기습!"; iconEl.innerText = "👅"; titleEl.className = "text-2xl font-black text-red-500 mb-4"; 
                let dmg = Math.floor(hpStat * 0.2); descEl.innerText = `보물상자인 줄 알았지만 몬스터였습니다!\n상처를 입었지만 골드를 뱉어냈습니다.\n(-${dmg} HP, +50G)`;
                GameState.currentHp = Math.max(1, GameState.currentHp - dmg); GameState.gold += 50; AudioEngine.sfx.hit_player(); UIManager.triggerHeavyHaptic(); 
            } else if (eventType === 4) {
                titleEl.innerText = "떠돌이 상인"; iconEl.innerText = "🧙‍♂️"; titleEl.className = "text-2xl font-black text-purple-400 mb-4"; 
                if (GameState.gold >= 10) { GameState.gold -= 10; GameState.potions += 1; descEl.innerText = `상인이 10G를 가져가고\n회복 물약(❤️)을 하나 두고 갔습니다!`; AudioEngine.sfx.coin(); } 
                else { descEl.innerText = `가진 돈이 없어 상인이 무시하고 지나갑니다...`; }
            } else {
                titleEl.innerText = "저주받은 제단"; iconEl.innerText = "🩸"; titleEl.className = "text-2xl font-black text-rose-600 mb-4"; 
                let dmg = Math.floor(hpStat * 0.25); descEl.innerText = `제단에 피를 바치고 젬을 얻었습니다.\n(-${dmg} HP, +15💎)`;
                GameState.currentHp = Math.max(1, GameState.currentHp - dmg); GameState.gem += 15; AudioEngine.sfx.hit_player(); UIManager.triggerHeavyHaptic(); 
            }
            const btn = document.querySelector('#screen-rpg-event button');
            if(btn) { btn.innerText = "돌아가기"; btn.className = "w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-slate-600 active:scale-95 transition-all"; }
            UIManager.updateCurrencyUI(); 
        },

        endEvent() { 
            document.getElementById('bottom-nav').style.display = 'flex'; 
            GameState.save(); UIManager.updateRpgLobbyUI(); 
            document.getElementById('screen-rpg-event').classList.remove('active');
            UIManager.navTo('screen-arena', document.querySelectorAll('.nav-item')[1]); 
        },

        initBattle(isBoss) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-rpg-battle').classList.add('active');
            window.scrollTo(0, 0);
            GameState.isBattling = true;
            localStorage.setItem('master_in_battle', 'true');

            this.battleState = { shield: 0, stunUntil: 0, buffUntil: 0, debuffUntil: 0 };
            this.battleLogs = []; // 전투 시작 시 로그 싹 비우기!

            let prestigeCount = GameState.prestigeCount || 0;
            let effStage = GameState.rpgStage + (prestigeCount * 100);
            let currentZone = Math.floor((GameState.rpgStage - 1) / 10) + 1; 
            if (currentZone > 10) currentZone = ((currentZone - 1) % 10) + 1;

            let effectiveZone = Math.floor((effStage - 1) / 10);
            let zoneMultiplier = Math.pow(1.1, effectiveZone);

            let baseHp = (effStage * 40) + (isBoss ? 200 : 0);
            let baseAtk = (effStage * 4) + (isBoss ? 15 : 0);

            this.monsterMaxHp = Math.floor(baseHp * zoneMultiplier); 
            this.monsterCurrentHp = this.monsterMaxHp;
            this.monsterAtkObj = Math.floor(baseAtk * zoneMultiplier);
            
            const zoneNames = { 1: "🌲 초보자의 숲", 2: "🏜️ 메마른 황무지", 3: "⛰️ 거친 산맥", 4: "🏚️ 버려진 유적", 5: "🌊 오염된 심해", 6: "🩸 저주받은 핏빛 성", 7: "🧊 얼어붙은 왕국", 8: "🌑 기사단의 무덤", 9: "🔥 불타는 지옥문", 10: "🌌 군주의 심연" };
            const battleCard = document.getElementById('battle-card');
            document.getElementById('screen-rpg-battle').style.backgroundImage = "none";
        
            let normalPool = GameData.monsters.normal[currentZone] || GameData.monsters.normal[1];
            let mInfo = isBoss ? (GameData.monsters.boss[GameState.rpgStage] || {e:'👑',n:'고대의 왕'}) : normalPool[(GameState.rpgStage - 1) % normalPool.length];

            document.getElementById('battle-stage-title').innerText = `STAGE ${GameState.rpgStage} - ${zoneNames[currentZone]} ${isBoss ? '🔥' : ''}`;
            document.getElementById('battle-monster-name').innerText = mInfo.n; 
            
            const spriteBox = document.getElementById('monster-sprite');
            const avatarWrap = document.getElementById('monster-avatar-wrap');

            battleCard.style.backgroundImage = `url('assets/backgrounds/bg_zone${currentZone}.png')`;
            battleCard.style.backgroundSize = "cover"; battleCard.style.backgroundPosition = "center"; battleCard.style.backgroundRepeat = "no-repeat";

            const scaleStyle = isBoss ? "transform: scale(1.2) translateY(20px);" : "transform: scale(1.0);";
            spriteBox.innerHTML = `<img src="assets/monster/${mInfo.img}" class="w-full h-full object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]" style="${scaleStyle}" alt="${mInfo.n}">`;
            
            avatarWrap.className = "w-full flex items-center justify-center relative z-0";
            spriteBox.style.cssText = "width: 100%; height: 160px; margin: 10px 0;";
            
          // 💡 [수정] 아래쪽 여백(mb-6)을 대폭 줄여서(mb-2) 로그창과의 빈 공간 압축!
            battleCard.className = isBoss 
                ? "glass-card battle-card p-4 sm:p-6 mb-2 text-center relative border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] bg-transparent overflow-hidden flex flex-col justify-between min-h-[380px]" 
                : "glass-card battle-card p-4 sm:p-6 mb-2 text-center relative border border-purple-500/30 bg-transparent overflow-hidden flex flex-col justify-between min-h-[300px]";
                
            const monsterNameEl = document.getElementById('battle-monster-name');
            const hpBarContainer = document.getElementById('battle-monster-hp-bar').parentElement.parentElement;
            
            if (monsterNameEl) monsterNameEl.className = "text-xl font-black text-white relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-2"; 
            if (hpBarContainer) hpBarContainer.className = "w-full relative z-10 bg-black/60 p-2 rounded-xl backdrop-blur-sm border border-white/10 mt-auto"; 

            Array.from(battleCard.children).forEach(child => {
                if (child.id !== 'battle-monster-name' && child.id !== 'monster-avatar-wrap' && child !== hpBarContainer) {
                    child.style.position = ""; child.style.zIndex = ""; 
                }
            });
        
            document.getElementById('btn-attack').disabled = false; 
            document.getElementById('btn-attack').innerHTML = "⚔️ 공격 (TAP!)";
            
            this.lastAttackTime = 0; 
            this.bossAttackCount = 0; 
            this.updateBattleUI();

            // 💡 [수정] 옛날 구닥다리 로그 대신 새로운 스크롤 엔진 가동!
            this.addLog("⚔️ 전투 시작! 화면을 탭하여 공격하세요!", "text-yellow-400");
            
            clearInterval(this.battleInterval); 
            this.battleInterval = setInterval(() => this.monsterAttack(), 1500);

            this.startPartnerSkillEngine();
        },

        startPartnerSkillEngine() {
            clearInterval(this.partnerInterval);
            const ptId = GameState.equippedPartner;
            if (!ptId || !GameData.partners || !GameData.partners[ptId]) return;

            const pt = GameData.partners[ptId];
            if (!pt.element || !pt.skillCooldown) return;

            this.partnerInterval = setInterval(() => {
                if (!GameState.isBattling || this.monsterCurrentHp <= 0 || GameState.currentHp <= 0) return;
                
                const stats = GameState.getTotalStats();
                const now = Date.now();

                const ptSlot = document.getElementById('battle-partner-slot');
                if (ptSlot) {
                    ptSlot.style.transform = 'scale(1.2) translateY(-10px)';
                    setTimeout(() => ptSlot.style.transform = 'scale(1) translateY(0)', 200);
                }

                this.showDamageText('battle-partner-slot', `[${pt.skillName}]`, 'text-pink-300 font-black text-[10px] sm:text-xs drop-shadow-md whitespace-nowrap -mt-6');
                AudioEngine.sfx.equip(); 

                switch(pt.element) {
                    case 'fire': 
                        let fireDmg = Math.floor(stats.atk * (pt.skillValue / 100));
                        this.monsterCurrentHp -= fireDmg;
                        this.showDamageText('monster-avatar-wrap', fireDmg, 'text-orange-500 font-black text-xl drop-shadow-md');
                        this.addLog(`🔥 [${pt.name}] ${pt.skillName}! ${fireDmg} 피해!`, 'text-orange-400');
                        const sprite = document.getElementById('monster-sprite');
                        if(sprite) { sprite.classList.remove('damage-flash'); void sprite.offsetWidth; sprite.classList.add('damage-flash'); }
                        break;
                        
                    case 'air': 
                        let airDmg = stats.atk; 
                        this.monsterCurrentHp -= airDmg;
                        this.showDamageText('monster-avatar-wrap', airDmg, 'text-teal-300 font-black text-2xl drop-shadow-md');
                        this.addLog(`🌪️ [${pt.name}] ${pt.skillName}! ${airDmg} 추가 피해!`, 'text-teal-300');
                        break;
                        
                    case 'ice': 
                        let iceDmg = Math.floor(stats.atk * (pt.skillValue / 100));
                        this.monsterCurrentHp -= iceDmg;
                        this.battleState.stunUntil = now + pt.skillDuration; 
                        this.showDamageText('monster-avatar-wrap', "FROZEN!", 'text-cyan-300 font-black text-2xl drop-shadow-[0_0_10px_cyan]');
                        this.addLog(`❄️ [${pt.name}] ${pt.skillName}! 몬스터 빙결!`, 'text-cyan-300');
                        break;

                    case 'earth': 
                        let shieldAmt = Math.floor(stats.hp * (pt.skillValue / 100));
                        this.battleState.shield = shieldAmt; 
                        this.showDamageText('battle-player-hp-text', `+🛡️${shieldAmt}`, 'text-amber-600 font-black text-2xl drop-shadow-md');
                        this.addLog(`🪨 [${pt.name}] ${pt.skillName}! 보호막 획득 (+${shieldAmt})`, 'text-amber-400');
                        break;

                    case 'lightning': 
                        this.battleState.buffUntil = now + pt.skillDuration;
                        this.showDamageText('battle-player-hp-text', "⚡ CRIT UP!", 'text-yellow-400 font-black text-xl drop-shadow-md');
                        this.addLog(`⚡ [${pt.name}] ${pt.skillName}! 크리티컬 대폭 상승!`, 'text-yellow-300');
                        break;

                    case 'light': 
                        this.battleState.debuffUntil = now + pt.skillDuration;
                        this.showDamageText('monster-avatar-wrap', "⬇️ WEAK", 'text-purple-400 font-black text-xl drop-shadow-md');
                        this.addLog(`🌟 [${pt.name}] ${pt.skillName}! 몬스터 약화!`, 'text-purple-300');
                        break;
                }

                this.updateBattleUI();
                if (this.monsterCurrentHp <= 0) setTimeout(() => this.endBattle(true), 300);

            }, pt.skillCooldown);
        },

        updateBattleUI() {
            const stats = GameState.getTotalStats(); 
            let shieldText = this.battleState.shield > 0 ? ` <span class="text-[10px] text-amber-500 font-black">[🛡️${this.battleState.shield}]</span>` : '';
            document.getElementById('battle-player-hp-text').innerHTML = `${Math.max(0, GameState.currentHp)} / ${stats.hp}${shieldText}`;
            document.getElementById('battle-player-hp-bar').style.width = `${Math.max(0, (GameState.currentHp / stats.hp) * 100)}%`;
            document.getElementById('battle-monster-hp-text').innerText = `${Math.max(0, Math.floor(this.monsterCurrentHp))} / ${this.monsterMaxHp}`;
            document.getElementById('battle-monster-hp-bar').style.width = `${Math.max(0, (this.monsterCurrentHp / this.monsterMaxHp) * 100)}%`;
            document.getElementById('battle-potion-count').innerText = GameState.potions;

            const ptSlot = document.getElementById('battle-partner-slot');
            if (ptSlot) {
                if (GameState.equippedPartner && window.GameData && GameData.partners[GameState.equippedPartner]) {
                    const pt = GameData.partners[GameState.equippedPartner];
                    let borderClass = "border-pink-500/50 bg-pink-900/30";
                    if(pt.rarity === 'mythic') borderClass = "rarity-mythic animate-pulse";
                    else if(pt.rarity === 'legendary') borderClass = "border-yellow-400/80 bg-yellow-900/30";
                    else if(pt.rarity === 'epic') borderClass = "border-purple-400/80 bg-purple-900/30";
                    else if(pt.rarity === 'rare') borderClass = "border-blue-400/80 bg-blue-900/30";
                    
                    ptSlot.className = `w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 flex flex-col items-center justify-center relative flex-shrink-0 transition-transform duration-200 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${borderClass} overflow-hidden`;
                    ptSlot.innerHTML = `<img src="assets/partners/${pt.img_sd}" class="w-full h-full object-contain filter drop-shadow-md" onerror="this.style.display='none'; setTimeout(() => { if(this.nextElementSibling) this.nextElementSibling.style.display='block'; }, 10);"><div style="display:none;" class="text-3xl filter drop-shadow-md">${pt.emoji}</div>`;
                } else {
                    ptSlot.className = `w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed border-slate-600 bg-slate-800 flex items-center justify-center relative flex-shrink-0 transition-transform`;
                    ptSlot.innerHTML = `<span class="text-[10px] text-slate-500 font-bold">비어있음</span>`;
                }
            }
        },

        usePotionInBattle() {
            const stats = GameState.getTotalStats();
            if(!GameState.isBattling || GameState.currentHp <= 0 || this.monsterCurrentHp <= 0 || GameState.potions <= 0 || GameState.currentHp >= stats.hp) return;
            AudioEngine.sfx.click(); UIManager.triggerHaptic(); GameState.potions -= 1;
            let healAmt = Math.floor(stats.hp * 0.5); GameState.currentHp = Math.min(stats.hp, GameState.currentHp + healAmt);
            GameState.save(); this.updateBattleUI(); 
            // 💡 [수정] 물약 먹는 소리도 스크롤 창으로 슝!
            this.addLog("✨ 물약 사용! 체력 회복!", "text-emerald-400");
        },

        playerAttack() {
            if(!GameState.isBattling || this.monsterCurrentHp <= 0 || GameState.currentHp <= 0) return;
            
            const stats = GameState.getTotalStats(); 
            let spdBonus = Math.min(stats.spd, 60); 
            const ATTACK_COOLDOWN = 1000 * (1 - (spdBonus / 100)); 

            const now = Date.now();
            if (now - this.lastAttackTime < ATTACK_COOLDOWN) return;
            this.lastAttackTime = now;
            
            let myAtk = stats.atk; 
            let critChance = stats.critRate;
            
            if (now < this.battleState.buffUntil && GameState.equippedPartner) {
                const pt = GameData.partners[GameState.equippedPartner];
                if (pt) critChance += pt.skillValue; 
            }
            
            let isCrit = Math.random() < (critChance / 100); 
            let critMultiplier = stats.critDmg / 100; 
            let damage = isCrit ? Math.floor(myAtk * critMultiplier) : myAtk;

            if (isCrit) { AudioEngine.sfx.hit_crit(); UIManager.triggerHeavyHaptic(); } 
            else { AudioEngine.sfx.hit_normal(); UIManager.triggerHaptic(); }

            this.monsterCurrentHp -= damage;
            
            if (stats.vamp > 0 && GameState.currentHp < stats.hp) {
                let healAmount = Math.floor(damage * (stats.vamp / 100));
                if (healAmount > 0) {
                    GameState.currentHp = Math.min(stats.hp, GameState.currentHp + healAmount);
                    this.showDamageText('battle-player-hp-text', `+${healAmount}`, 'text-emerald-400 font-black text-xl drop-shadow-md');
                }
            }

            const sprite = document.getElementById('monster-sprite');
            sprite.classList.remove('damage-flash'); void sprite.offsetWidth; sprite.classList.add('damage-flash');
            
            this.showDamageText('monster-avatar-wrap', isCrit ? `CRIT! ${damage}` : damage, isCrit ? 'damage-crit' : 'damage-monster');
            
            // 💡 [수정] 마스터의 공격도 스크롤 창에 남기기!
            this.addLog(`🗡️ 마스터 공격! ${damage} 피해! ${isCrit ? '(크리티컬!)' : ''}`, isCrit ? "text-yellow-300" : "text-white");
            
            const btn = document.getElementById('btn-attack');
            btn.disabled = true; btn.classList.add('opacity-50');
            let timeLeft = ATTACK_COOLDOWN;
            
            const cooldownTimer = setInterval(() => { 
                timeLeft -= 100; 
                if (timeLeft <= 0 || this.monsterCurrentHp <= 0) { 
                    clearInterval(cooldownTimer); 
                    if (GameState.isBattling && this.monsterCurrentHp > 0 && GameState.currentHp > 0) { 
                        btn.disabled = false; btn.classList.remove('opacity-50'); btn.innerHTML = "⚔️ 공격 (TAP!)"; 
                    } 
                } else { btn.innerHTML = `⏳ ${ (timeLeft/1000).toFixed(1) }s`; } 
            }, 100);
            
            this.updateBattleUI(); 
            if (this.monsterCurrentHp <= 0) { clearInterval(cooldownTimer); setTimeout(() => this.endBattle(true), 300); }
        },
        
        monsterAttack() {
            if(!GameState.isBattling || this.monsterCurrentHp <= 0 || GameState.currentHp <= 0) { clearInterval(this.battleInterval); return; }
            
            const now = Date.now();
            if (now < this.battleState.stunUntil) {
                // 💡 [수정] 상태이상 로그
                this.addLog("❄️ 몬스터가 얼어붙어 공격하지 못합니다!", "text-cyan-300");
                return;
            }

            if (now < this.battleState.debuffUntil && Math.random() < 0.3) {
                this.addLog("🌟 몬스터가 빛에 눈이 부셔 공격을 빗맞혔습니다!", "text-slate-400");
                return;
            }

            const stats = GameState.getTotalStats();
            const isBoss = (GameState.rpgStage % 10 === 0);
            let isUltimate = false;

            if (isBoss) {
                this.bossAttackCount = (this.bossAttackCount || 0) + 1;
                if (this.bossAttackCount >= 4) { isUltimate = true; this.bossAttackCount = 0; }
            }

            let evaChance = Math.min(stats.eva, 50); 
            if (Math.random() * 100 < evaChance) {
                AudioEngine.sfx.evade();
                this.showDamageText('battle-card', "MISS!", 'text-gray-300 font-black text-2xl drop-shadow-md'); 
                this.addLog("💨 몬스터의 공격을 가볍게 회피했습니다! (MISS)", "text-slate-400");
                return; 
            }

            let rawDamage = Math.floor(this.monsterAtkObj * (0.8 + Math.random() * 0.4));
            
            if (now < this.battleState.debuffUntil && GameState.equippedPartner) {
                const pt = GameData.partners[GameState.equippedPartner];
                if (pt) rawDamage = Math.floor(rawDamage * (1 - (pt.skillValue / 100))); 
            }

            if (isUltimate) rawDamage = Math.floor(rawDamage * 2.5);

            let damageReduction = Math.min(stats.def, 90) / 100; 
            let finalDamage = Math.max(1, Math.floor(rawDamage * (1 - damageReduction)));
            
            if (this.battleState.shield > 0) {
                if (this.battleState.shield >= finalDamage) {
                    this.battleState.shield -= finalDamage;
                    this.showDamageText('battle-card', "BLOCKED!", 'text-amber-500 font-black text-2xl drop-shadow-md');
                    this.addLog(`🪨 대지의 쉴드가 몬스터의 공격을 완벽히 막아냈습니다!`, "text-amber-400");
                    finalDamage = 0; 
                } else {
                    finalDamage -= this.battleState.shield;
                    this.battleState.shield = 0;
                    this.addLog(`🪨 쉴드가 파괴되며 몬스터의 공격을 약화시켰습니다!`, "text-amber-400");
                }
            }

            if (finalDamage > 0) {
                GameState.currentHp -= finalDamage; 
                GameState.save(); 
                
                const battleCard = document.getElementById('battle-card');
                if (isUltimate) {
                    AudioEngine.sfx.boss(); UIManager.triggerHeavyHaptic();
                    document.body.classList.add('boss-ultimate-flash'); 
                    if(battleCard) battleCard.classList.add('shake'); 
                    setTimeout(() => { document.body.classList.remove('boss-ultimate-flash'); if(battleCard) battleCard.classList.remove('shake'); }, 300);
                    this.showDamageText('battle-card', `FATAL! -${finalDamage}`, 'text-red-500 font-black text-4xl drop-shadow-[0_0_15px_rgba(239,68,68,1)]');
                    // 💡 [수정] 보스 공격 로그
                    this.addLog(`☠️ 보스의 필살기!! ${finalDamage}의 치명적인 피해!`, "text-red-500");
                } else {
                    AudioEngine.sfx.hit_player(); UIManager.triggerHaptic();
                    if(battleCard) { battleCard.classList.add('shake'); setTimeout(() => battleCard.classList.remove('shake'), 200); }
                    this.showDamageText('battle-card', `-${finalDamage}`, 'damage-player');
                    // 💡 [수정] 일반 몬스터 반격 로그
                    if (this.battleState.shield <= 0) this.addLog(`💥 몬스터 반격! ${finalDamage} 피해!`, "text-red-400");
                }
            }

            this.updateBattleUI(); 
            if (GameState.currentHp <= 0) { clearInterval(this.battleInterval); setTimeout(() => this.endBattle(false), 300); }
        },

        endBattle(isWin) {
            clearInterval(this.battleInterval); 
            clearInterval(this.partnerInterval); 
            this.battleState = { shield: 0, stunUntil: 0, buffUntil: 0, debuffUntil: 0 }; 

            GameState.isBattling = false; localStorage.removeItem('master_in_battle'); 
            const btnAtk = document.getElementById('btn-attack');
            if (btnAtk) { btnAtk.disabled = true; btnAtk.innerHTML = "⚔️ 전투 종료"; }
            
            const isBoss = (GameState.rpgStage % 10 === 0);
            
            if (isWin) {
                document.getElementById('bottom-nav').style.display = 'flex'; 
                AudioEngine.sfx.coin(); UIManager.triggerHaptic();
                
                let rewardGold = 10 + (GameState.rpgStage * 2);
                let rewardGem = 0;   
                
                if (isBoss) {
                    const bossTier = GameState.rpgStage / 10; 
                    rewardGold = 150 * bossTier; 
                    rewardGem = 100 * bossTier;  
                }
                
                GameState.gold += Number(rewardGold); 
                GameState.gem += Number(rewardGem);
                GameState.rpgStage++; GameState.save();
                
                GameSystem.Quest.update('daily', 'd1', 1);
                GameSystem.Quest.update('weekly', 'w1', 1);
                if (isBoss) GameSystem.Quest.update('weekly', 'w2', 1);

                UIManager.updateCurrencyUI(); 
                if (GameSystem.Ranking) GameSystem.Ranking.updateRankingSilently();
                UIManager.showToast(`🎉 토벌 성공! 🪙 +${rewardGold}G ${isBoss ? ' / 💎 +'+rewardGem : ''}`);
                
                // 💡 [수정] 승리 시 텍스트
                this.addLog(`🎉 토벌 성공! 보상을 획득했습니다.`, "text-yellow-400");
                
                setTimeout(() => { UIManager.navTo('screen-arena', document.querySelectorAll('.nav-item')[1]); }, 1500);

            } else {
                GameState.currentHp = 0; 
                GameState.save();
                const deathModal = document.getElementById('revive-modal'); 
                if (deathModal) {
                    deathModal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
                    deathModal.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
                }
            }
        },

        doPrestige(isAd = false) { 
            if (GameState.rpgStage < 100) return UIManager.showToast("100층의 심연의 군주를 토벌해야 환생할 수 있습니다! 👑");
            if (isAd) {
                window.currentAdAction = 'prestige_double';
                if (window.flutter_inappwebview) window.flutter_inappwebview.callHandler('showRewardAd'); 
                else {
                    UIManager.showToast("📺 (테스트) 광고 시청 중... 2초 뒤 2배 환생!");
                    setTimeout(() => { if (window.onRewardEarned) window.onRewardEarned(); }, 2000); 
                }
                return;
            }
            this.executePrestige(1);
        },

        executePrestige(multiplier = 1) { 
            const rewardDiamond = (GameState.rpgStage * 10) * multiplier;
            const rewardGold = (GameState.rpgStage * 30) * multiplier;
            GameState.gem += rewardDiamond; GameState.gold += rewardGold;
            GameState.prestigeCount = (GameState.prestigeCount || 0) + 1;
            GameState.rpgStage = 1; 
            GameState.rpgAtk = 10; GameState.rpgMaxHp = 100;
            GameState.save(); GameState.currentHp = GameState.getTotalStats().hp; GameState.save(); 
            if (window.GameSystem && GameSystem.Quest) GameSystem.Quest.update('weekly', 'w5', 1);
            UIManager.updateCurrencyUI(); UIManager.updateRpgLobbyUI();
            if(window.UIManager && UIManager.triggerHeavyHaptic) UIManager.triggerHeavyHaptic();
            if (window.GameSystem && GameSystem.Ranking && GameSystem.Ranking.updateRankingSilently) GameSystem.Ranking.updateRankingSilently(); 
            const adText = multiplier > 1 ? "(광고 2배 보너스!) " : "";
            UIManager.showToast(`🎉 ${GameState.prestigeCount}번째 환생 완료! ${adText}다이아 ${rewardDiamond.toLocaleString()}개, 골드 ${rewardGold.toLocaleString()}G 획득! 💎`);
        }
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
    
    // 💎 1. 꼬리표가 'gems' 일 때
    if (window.currentAdAction === 'gems') {
        GameState.gem += 50;
        GameState.save();
        UIManager.updateCurrencyUI();
        AudioEngine.sfx.coin();
        UIManager.triggerHaptic();
        UIManager.showToast("📺 광고 시청 보상! 50 💎 획득!");
    } 
    // 💰 2. 꼬리표가 'idle_double' (방치형 2배) 일 때
    else if (window.currentAdAction === 'idle_double') {
        const amount = GameSystem.Lobby.calculateIdleReward() * 2; 
        
        GameState.gold += amount;
        GameSystem.Quest.update('weekly', 'w3', 1);
        GameState.lastIdleCheck = Date.now(); 
        GameState.save();
        
        UIManager.updateCurrencyUI();
        UIManager.updateIdleUI(); 
        AudioEngine.sfx.coin();
        UIManager.triggerHaptic();
        UIManager.showToast(`📺 광고 보상! 방치 지원금 ${amount}G (2배) 수령 완료! 💰✨`);
    }
    // 🌟 3. [신규 장착!!] 꼬리표가 'prestige_double' (환생 2배) 일 때
    else if (window.currentAdAction === 'prestige_double') {
        if (window.GameSystem && GameSystem.Battle) {
            // 마스터가 만든 환생 엔진을 2배(multiplier = 2)로 풀가동!!
            GameSystem.Battle.executePrestige(2); 
        }
    }
   // 💀 4. 꼬리표가 'revive' 일 때
    else if (window.currentAdAction === 'revive') {
        const reviveModal = document.getElementById('revive-modal');
        if (reviveModal) {
            reviveModal.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
            reviveModal.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        }
        
        GameState.currentHp = GameState.getTotalStats().hp; 
        GameState.save();
        
        UIManager.triggerHaptic();
        if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.coin(); 

        const battleScreen = document.getElementById('screen-rpg-battle');
        const isBattleScreen = battleScreen ? battleScreen.classList.contains('active') || battleScreen.style.display !== 'none' : false;

        if (isBattleScreen) {
            GameState.isBattling = true; 
            localStorage.setItem('master_in_battle', 'true'); 
            
            // 💡 [추가] 부활 메시지를 새로운 스크롤 로그창에 예쁘게 띄워주기
            GameSystem.Battle.addLog(`✨ 기적적인 부활! 반격을 시작하세요!`, "text-yellow-400 animate-pulse");

            GameSystem.Battle.updateBattleUI(); 
            
            // 몬스터 공격 타이머 재가동
            clearInterval(GameSystem.Battle.battleInterval); 
            GameSystem.Battle.battleInterval = setInterval(() => GameSystem.Battle.monsterAttack(), 1500);
            
            // 🚨 [버그 수정 완료] 잠자고 있던 파트너 스킬 엔진 강제 기상!!
            GameSystem.Battle.startPartnerSkillEngine();
            
            const btnAtk = document.getElementById('btn-attack');
            if (btnAtk) {
                btnAtk.disabled = false;
                btnAtk.classList.remove('opacity-50'); 
                btnAtk.innerHTML = "⚔️ 공격 (TAP!)";
            }
            
            UIManager.showToast("✨ 기적적으로 부활했습니다! 전투를 이어갑니다.");
        } else {
            GameState.isBattling = false;
            localStorage.setItem('master_in_battle', 'false');

            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            
            const lobbyScreen = document.getElementById('screen-rpg'); 
            if (lobbyScreen) lobbyScreen.classList.add('active');
            else {
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
// =========================================================================
// 🌟 [신규] 파이어베이스 프로필 & 좋아요 서버 동기화 엔진
// =========================================================================
GameSystem.Profile = {
    async syncToServer() {
        if (!window.db || !GameState.nickname) return;
        try {
            const userRef = window.doc(window.db, "users", GameState.nickname);
            
            // 🚨 [대수술 완료] 구조를 완벽하게 분리하고 찌꺼기를 날려버렸습니다!
            await window.setDoc(userRef, {
                nickname: GameState.nickname,
                totalStats: GameState.getTotalStats(), 
                uid: GameState.uid || "0000",
                statusMessage: GameState.statusMessage || "여기를 터치하여 자신을 소개해보세요!",
                highestStage: Math.max(GameState.maxStage || 1, GameState.rpgStage || 1),
                prestige: GameState.prestigeCount || 0,
                bgSkin: GameState.equippedBg || 'none', 
                
                // 장착 중인 아이템과 파트너 ID 모음
                equipment: {
                    weapon: GameState.equippedWeapon || null,
                    armor: GameState.equippedArmor || null,
                    accessory: GameState.equippedAccessory || null,
                    partner: GameState.equippedPartner || null
                },
                
                // 장착 중인 아이템의 강화 수치 모음
                itemUpgrades: {
                    weapon: GameState.equippedWeapon ? (GameState.itemUpgrades[GameState.equippedWeapon] || 0) : 0,
                    armor: GameState.equippedArmor ? (GameState.itemUpgrades[GameState.equippedArmor] || 0) : 0,
                    accessory: GameState.equippedAccessory ? (GameState.itemUpgrades[GameState.equippedAccessory] || 0) : 0
                },
                
                // 🌸 [추가 완료] 장착 중인 파트너의 레벨 모음!
                partnerLevels: {
                    [GameState.equippedPartner || 'none']: GameState.equippedPartner ? (GameState.partnerLevels[GameState.equippedPartner] || 0) : 0
                },
                
                lastUpdated: window.serverTimestamp()
            }, { merge: true }); 
        } catch(e) {
            console.error("프로필 서버 백업 실패:", e);
        }
    },

    async addLike(targetNickname) {
        if (!window.db || !targetNickname || targetNickname === GameState.nickname) return;
        const likedKey = `liked_${targetNickname}`;
        if (localStorage.getItem(likedKey)) {
            UIManager.showToast("이미 좋아요를 보낸 마스터입니다! 💖");
            return;
        }
        try {
            const userRef = window.doc(window.db, "users", targetNickname);
            const docSnap = await window.getDoc(userRef);
            if (docSnap.exists()) {
                let currentLikes = docSnap.data().likes || 0;
                await window.setDoc(userRef, { likes: currentLikes + 1 }, { merge: true });
                localStorage.setItem(likedKey, "true"); 
                UIManager.showToast("💖 좋아요를 보냈습니다!");
                document.getElementById('target-user-likes').innerText = currentLikes + 1; 
            } else {
                UIManager.showToast("서버에 등록되지 않은 유저입니다.");
            }
        } catch(e) {
            console.error("좋아요 실패:", e);
        }
    },

    async loadMyProfile() {
        if (!window.db || !GameState.nickname) return;
        try {
            const userRef = window.doc(window.db, "users", GameState.nickname);
            const docSnap = await window.getDoc(userRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.likes !== undefined) GameState.likes = data.likes;
                if (data.statusMessage) GameState.statusMessage = data.statusMessage;
                if (data.prestige !== undefined) GameState.prestigeCount = data.prestige; 
                GameState.save(); 
                
                if (window.UIManager && UIManager.updateProfileUI) {
                    UIManager.updateProfileUI();
                }
            }
        } catch(e) {
            console.error("내 프로필 로드 실패:", e);
        }
    }
};
// 🚨 (이 밑으로는 아무 코드도 없어야 합니다! 파일 끝!)
