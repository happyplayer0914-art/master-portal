// =========================================================================
// 4. UI MANAGER
// =========================================================================
const UIManager = {
    selectedItems: [],

    init() { 
        this.initBackground(); 
        this.updateCurrencyUI(); 
        this.applyAvatarSkin(); 
        this.initCheckinButton(); 
        this.updateIdleUI(); 
        document.getElementById('profile-nickname-display').innerText = GameState.nickname; 
        // 👇 [버그 픽스] 게임 켜질 때 장착 상태를 읽어서 칭호와 스탯을 즉시 그려주기!
        this.updateRpgLobbyUI();
        
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
        const stats = GameState.getTotalStats(); 
        document.getElementById('rpg-stage-display').innerText = GameState.rpgStage;
        
        document.getElementById('lobby-hp-text').innerText = `${Math.max(0, GameState.currentHp)} / ${stats.hp}`;
        document.getElementById('lobby-hp-bar').style.width = (GameState.currentHp / stats.hp * 100) + "%";
        
        const atkBuff = stats.atk - GameState.rpgAtk; 
        const hpBuff = stats.hp - GameState.rpgMaxHp;
        
        document.getElementById('stat-atk-display').innerHTML = `${GameState.rpgAtk.toLocaleString()} ${atkBuff > 0 ? `<span class="text-[12px] text-emerald-400">(+${atkBuff})</span>` : ''}`;
        document.getElementById('stat-hp-display').innerHTML = `${GameState.rpgMaxHp.toLocaleString()} ${hpBuff > 0 ? `<span class="text-[12px] text-emerald-400">(+${hpBuff})</span>` : ''}`;
        
        document.getElementById('cost-atk-display').innerText = GameSystem.Lobby.getUpgradeCost('atk').toLocaleString();
        document.getElementById('cost-hp-display').innerText = GameSystem.Lobby.getUpgradeCost('hp').toLocaleString();
        document.getElementById('potion-count-display').innerText = GameState.potions;

        // 💡 [핵심 추가] 투기장 로비에 장착된 3종 장비 아이콘 그려주기!
        const renderSlot = (slotId, itemId, label) => {
            const el = document.getElementById(slotId);
            if (!el) return;
            if (itemId && GameData.items[itemId]) {
                const item = GameData.items[itemId];
                // 템 끼고 있으면 레어리티 테두리랑 이모지 띄우기!
                el.className = `w-14 h-14 rounded-xl border-2 flex items-center justify-center text-3xl bg-slate-800 shadow-lg relative rarity-${item.rarity}`;
                el.innerHTML = `<span class="filter drop-shadow-md">${item.emoji}</span>`;
            } else {
                // 템 안 끼고 있으면 빈칸(점선) 표시!
                el.className = `w-14 h-14 rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/50 flex flex-col items-center justify-center relative`;
                el.innerHTML = `<span class="text-[10px] text-slate-500 font-bold">${label}</span>`;
            }
        };

        renderSlot('lobby-slot-weapon', GameState.equippedWeapon, '무기');
        renderSlot('lobby-slot-armor', GameState.equippedArmor, '방어구');
        renderSlot('lobby-slot-accessory', GameState.equippedAccessory, '장신구');

        // 🌟 [신규 추가] 프로필 화면의 고급 스탯들 업데이트!
        if(document.getElementById('profile-def')) document.getElementById('profile-def').innerText = stats.def;
        if(document.getElementById('profile-eva')) document.getElementById('profile-eva').innerText = stats.eva;
        if(document.getElementById('profile-spd')) document.getElementById('profile-spd').innerText = stats.spd;

        // =========================================================================
        // 🔥 [엔드 콘텐츠] 신화(1) + 전설(2) 전직 & 업적 달성 판독기!!
        // =========================================================================
        const equippedIds = [GameState.equippedWeapon, GameState.equippedArmor, GameState.equippedAccessory];
        const gears = equippedIds.filter(id => id !== null).map(id => GameData.items[id]).filter(item => item !== undefined);
        
        let mythicItem = null;
        let legendaryCount = 0;
        
        // 등급(Rarity) 검사!
        gears.forEach(g => {
            if (g.rarity === 'mythic') mythicItem = g;
            if (g.rarity === 'legendary') legendaryCount++;
        });

        const jobTitleEl = document.getElementById('profile-job-title');
        //const passiveEl = document.getElementById('profile-passive-title');

        // 💡 전직 조건: 신화 1개 + 전설 2개가 모두 장착되었을 때!
        if (mythicItem && legendaryCount === 2) {
            // ⚔️ 전직 UI 텍스트 & 이펙트 업데이트!
            if(jobTitleEl) {
                jobTitleEl.innerText = `✨ ${mythicItem.job} [${mythicItem.mbti}] ✨`;
                jobTitleEl.className = "text-red-400 font-black text-xs sm:text-sm tracking-widest uppercase mb-1 animate-pulse drop-shadow-[0_0_8px_rgba(248,113,113,0.8)] transition-all duration-300";
            }
           // if(passiveEl) {
           //     passiveEl.innerText = `▶ 패시브: ${mythicItem.passive}`;
           //     passiveEl.classList.remove('hidden');
           // }

            // 🏆 [최초 전직 업적 달성 로직!] (배열에 'class_advanced'가 없으면 최초 달성으로 인정)
            if (!GameState.questData.achievements.completed.includes('class_advanced')) {
                GameState.questData.achievements.completed.push('class_advanced');
                GameState.gem += 5000; // 💡 파격적인 보상: 5000젬 획득!
                GameState.save();
                
                if(UIManager.updateCurrencyUI) UIManager.updateCurrencyUI(); // 상단 젬 텍스트 즉시 갱신
                
                // 화면에 화려하게 업적 달성 알림!
                if(UIManager.showToast) {
                    setTimeout(() => UIManager.showToast(`🏆 [히든 업적] ${mythicItem.job} 전직 완료! (보상: 5000💎)`), 500);
                }
                if(UIManager.triggerHeavyHaptic) UIManager.triggerHeavyHaptic();
            }
        } else {
            // ❌ 전직 조건 미달 (장비를 빼거나 조건이 안 맞으면 일반 상태로 복구)
            if(jobTitleEl) {
                jobTitleEl.innerText = "Master Profile";
                jobTitleEl.className = "text-emerald-400 font-bold text-xs tracking-widest uppercase mb-1 transition-all duration-300";
            }
          //  if(passiveEl) {
          //     passiveEl.classList.add('hidden');
          //  }
        }
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
        const pGear = document.getElementById('inv-panel-gear'); 
        const pSkin = document.getElementById('inv-panel-skin');
        const emptyState = document.getElementById('inv-empty-state');
        if(!pGear || !pSkin) return;

        pGear.innerHTML = ''; pSkin.innerHTML = '';
        let hasGear = false; let hasSkin = false;
        
        // 인벤토리에 같은 템이 몇 개 있는지 세기
        const counts = {}; 
        GameState.inventory.forEach(i => counts[i] = (counts[i] || 0) + 1);

        // 💡 [핵심 추가] 아이템 카드를 부위별로 담아둘 바구니(배열) 준비!
        const groupedCards = { weapon: [], armor: [], accessory: [], skin: [] };

        for(const [id, count] of Object.entries(counts)) {
            const item = GameData.items[id]; 
            if(!item) continue;
            
            let isEquipped = false;
            if (item.type === 'gear') {
                if (item.subType === 'weapon' && GameState.equippedWeapon === id) isEquipped = true;
                if (item.subType === 'armor' && GameState.equippedArmor === id) isEquipped = true;
                if (item.subType === 'accessory' && GameState.equippedAccessory === id) isEquipped = true;
            } else if (item.type === 'skin') {
                if (GameState.equippedSkin === id) isEquipped = true;
            }
            
            const badgeHTML = isEquipped ? `<div class="item-equipped-badge text-[8px] tracking-wider">장착중</div>` : '';
            const countHTML = count > 1 ? `<div class="absolute bottom-1 right-2 text-[10px] text-slate-400 font-bold">x${count}</div>` : '';
            
            let effectText = '';
            if (item.type === 'gear') {
                if (item.atkMult) effectText += `<span class="text-[9px] text-red-400 font-bold">공격력 +${Math.round((item.atkMult - 1)*100)}%</span>`;
                if (item.hpMult) effectText += `<span class="text-[9px] text-emerald-400 font-bold">체력 +${Math.round((item.hpMult - 1)*100)}%</span>`;
                if (item.critRate) effectText += `<span class="text-[9px] text-purple-400 font-bold">크리티컬 +${item.critRate}%</span>`;
                if (item.critDmg) effectText += `<span class="text-[9px] text-pink-400 font-bold">크리데미지 +${item.critDmg}%</span>`;
                if (item.vamp) effectText += `<span class="text-[9px] text-rose-500 font-bold">피흡 +${item.vamp}%</span>`;
            } else {
                effectText = `<span class="text-[9px] text-cyan-400 font-bold mt-1">프로필 테두리</span>`;
            }
            
            const card = `
                <div onclick="GameSystem.Lobby.handleItemClick('${id}')" class="item-card rarity-${item.rarity} ${isEquipped ? 'equipped' : ''} relative flex flex-col justify-center items-center py-2 h-[140px] !important">
                    ${badgeHTML}
                    <div class="text-3xl mb-1 filter drop-shadow-md flex-shrink-0">${item.emoji}</div>
                    <h4 class="text-white font-bold text-[10px] text-center break-keep leading-tight min-h-[24px] flex items-center mb-1">${item.name}</h4>
                    <div class="flex flex-col items-center leading-tight">
                        ${effectText}
                    </div>
                    ${countHTML}
                </div>
            `;
            
            // 💡 [핵심 추가] 부위별로 알맞은 바구니에 카드 집어넣기!
            if (item.type === 'gear') { 
                groupedCards[item.subType].push(card);
                hasGear = true; 
            } else { 
                groupedCards.skin.push(card);
                hasSkin = true; 
            }
        }

        // 💡 [핵심 추가] 각 바구니에 담긴 템들을 구분선(제목)과 함께 화면에 순서대로 뿌려주기!
        if (groupedCards.weapon.length > 0) {
            pGear.innerHTML += `<div class="col-span-3 text-xs font-bold text-indigo-300 mt-1 mb-1 border-b border-slate-700/50 pb-1 flex items-center gap-1.5"><span class="text-sm">🗡️</span> 무기</div>`;
            pGear.innerHTML += groupedCards.weapon.join('');
        }
        if (groupedCards.armor.length > 0) {
            pGear.innerHTML += `<div class="col-span-3 text-xs font-bold text-emerald-300 mt-3 mb-1 border-b border-slate-700/50 pb-1 flex items-center gap-1.5"><span class="text-sm">🛡️</span> 방어구</div>`;
            pGear.innerHTML += groupedCards.armor.join('');
        }
        if (groupedCards.accessory.length > 0) {
            pGear.innerHTML += `<div class="col-span-3 text-xs font-bold text-yellow-300 mt-3 mb-1 border-b border-slate-700/50 pb-1 flex items-center gap-1.5"><span class="text-sm">💍</span> 장신구</div>`;
            pGear.innerHTML += groupedCards.accessory.join('');
        }
        
        pSkin.innerHTML = groupedCards.skin.join('');
        
        // 텅 빈 상태 처리
        const isGearTab = !document.getElementById('inv-tab-gear').classList.contains('text-slate-400');
        if ((isGearTab && !hasGear) || (!isGearTab && !hasSkin)) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
        
        // 내 정보 상단 전투력/생존력 업데이트
        const stats = GameState.getTotalStats(); 
        document.getElementById('profile-total-power').innerText = stats.atk.toLocaleString(); 
        document.getElementById('profile-total-hp').innerText = stats.hp.toLocaleString();
        
        // 내 정보(프로필) 화면 장착 슬롯 렌더링
        const renderProfileSlot = (slotId, itemId, label) => {
            const el = document.getElementById(slotId);
            if (!el) return;
            if (itemId && GameData.items[itemId]) {
                const item = GameData.items[itemId];
                el.className = `w-14 h-14 rounded-xl border-2 flex items-center justify-center text-3xl bg-slate-800 shadow-lg relative rarity-${item.rarity}`;
                el.innerHTML = `<span class="filter drop-shadow-md">${item.emoji}</span>`;
            } else {
                el.className = `w-14 h-14 rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/50 flex flex-col items-center justify-center relative`;
                el.innerHTML = `<span class="text-[10px] text-slate-500 font-bold">${label}</span>`;
            }
        };

        renderProfileSlot('profile-slot-weapon', GameState.equippedWeapon, '무기');
        renderProfileSlot('profile-slot-armor', GameState.equippedArmor, '방어구');
        renderProfileSlot('profile-slot-accessory', GameState.equippedAccessory, '장신구');
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







