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
        // 💡 [수정됨] 프로필 탭 진입 시 항상 장비 탭이 먼저 보이도록 초기화
        if(s === 'screen-profile') { 
            this.switchInvTab('gear'); 
            document.getElementById('profile-nickname-display').innerText = GameState.nickname; 
        }
        if(s === 'screen-ranking') GameSystem.Ranking.loadRanking();
    },
    
    switchTab(t) {
        AudioEngine.sfx.click(); this.triggerHaptic();
        document.getElementById('panel-forge').classList.add('hidden'); document.getElementById('panel-shop').classList.add('hidden');
        document.getElementById(`panel-${t}`).classList.remove('hidden');
        document.getElementById('tab-forge').className = t === 'forge' ? "py-2 bg-slate-700 text-white font-bold rounded-lg text-sm border border-slate-500" : "py-2 bg-slate-800 text-slate-400 font-bold rounded-lg text-sm border border-slate-700";
        document.getElementById('tab-shop').className = t === 'shop' ? "py-2 bg-slate-700 text-white font-bold rounded-lg text-sm border border-slate-500" : "py-2 bg-slate-800 text-slate-400 font-bold rounded-lg text-sm border border-slate-700";
    },
    
    // 🌟 [핵심 수정] 치장품(cosmetics) 탭 전환 로직 완벽 적용!
    switchInvTab(t) {
        AudioEngine.sfx.click(); this.triggerHaptic();
        
        const btnGear = document.getElementById('inv-tab-gear');
        const btnCosmetics = document.getElementById('inv-tab-cosmetics');
        const panelGear = document.getElementById('inv-panel-gear');
        const panelCosmetics = document.getElementById('inv-panel-cosmetics');
        
        if(btnGear && btnCosmetics) {
            btnGear.className = t === 'gear' 
                ? "w-full py-2 bg-slate-700 text-white font-bold rounded-lg text-xs border border-slate-500 transition-colors" 
                : "w-full py-2 bg-slate-800 text-slate-400 font-bold rounded-lg text-xs border border-slate-700 transition-colors";
                
            btnCosmetics.className = t === 'cosmetics' 
                ? "w-full py-2 bg-slate-700 text-white font-bold rounded-lg text-xs border border-slate-500 transition-colors" 
                : "w-full py-2 bg-slate-800 text-slate-400 font-bold rounded-lg text-xs border border-slate-700 transition-colors";
        }

        if(panelGear) panelGear.classList.toggle('hidden', t !== 'gear');
        if(panelCosmetics) panelCosmetics.classList.toggle('hidden', t !== 'cosmetics');

        if (t === 'gear') {
            this.renderInventory();
        } else if (t === 'cosmetics') {
            if(this.renderCosmeticsShop) this.renderCosmeticsShop();
        }
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
        // ... (기존 updateRpgLobbyUI 코드 내용 완벽히 동일하게 유지) ...
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

        const renderSlot = (slotId, itemId, label) => {
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

        renderSlot('lobby-slot-weapon', GameState.equippedWeapon, '무기');
        renderSlot('lobby-slot-armor', GameState.equippedArmor, '방어구');
        renderSlot('lobby-slot-accessory', GameState.equippedAccessory, '장신구');

        if(document.getElementById('profile-def')) document.getElementById('profile-def').innerText = stats.def;
        if(document.getElementById('profile-eva')) document.getElementById('profile-eva').innerText = stats.eva;
        if(document.getElementById('profile-spd')) document.getElementById('profile-spd').innerText = stats.spd;

        const equippedIds = [GameState.equippedWeapon, GameState.equippedArmor, GameState.equippedAccessory];
        const gears = equippedIds.filter(id => id !== null).map(id => GameData.items[id]).filter(item => item !== undefined);
        
        let mythicItem = null;
        let legendaryCount = 0;
        
        gears.forEach(g => {
            if (g.rarity === 'mythic') mythicItem = g;
            if (g.rarity === 'legendary') legendaryCount++;
        });

        const jobTitleEl = document.getElementById('profile-job-title');

        if (mythicItem && legendaryCount === 2) {
            if(jobTitleEl) {
                jobTitleEl.innerText = `✨ ${mythicItem.job} [${mythicItem.mbti}] ✨`;
                jobTitleEl.className = "text-red-400 font-black text-xs sm:text-sm tracking-widest uppercase mb-1 animate-pulse drop-shadow-[0_0_8px_rgba(248,113,113,0.8)] transition-all duration-300";
            }
            if (!GameState.questData.achievements.completed.includes('class_advanced')) {
                GameState.questData.achievements.completed.push('class_advanced');
                GameState.gem += 5000; 
                GameState.save();
                
                if(UIManager.updateCurrencyUI) UIManager.updateCurrencyUI(); 
                if(UIManager.showToast) {
                    setTimeout(() => UIManager.showToast(`🏆 [히든 업적] ${mythicItem.job} 전직 완료! (보상: 5000💎)`), 500);
                }
                if(UIManager.triggerHeavyHaptic) UIManager.triggerHeavyHaptic();
            }
        } else {
            if(jobTitleEl) {
                jobTitleEl.innerText = "Master Profile";
                jobTitleEl.className = "text-emerald-400 font-bold text-xs tracking-widest uppercase mb-1 transition-all duration-300";
            }
        }
    },
    
    applyAvatarSkin() {
        // (기존 코드와 동일)
        const skin = GameState.equippedSkin;
        const avatars = document.querySelectorAll('.master-avatar');
        avatars.forEach(a => {
            a.className = "master-avatar rounded-full flex items-center justify-center font-black text-white shadow-md transition-all " + (a.id === 'profile-big-icon' ? 'w-20 h-20 text-3xl' : 'w-8 h-8 text-sm');
            if(skin && GameData.items[skin]) a.classList.add('skin-' + GameData.items[skin].rarity);
            else a.classList.add('bg-gradient-to-tr', 'from-slate-600', 'to-slate-400');
        });
    },
    
    // 🌟 [수정됨] 장비 탭 렌더링 (스킨 관련 코드 싹 날림!)
    renderInventory() {
        const pGear = document.getElementById('inv-panel-gear'); 
        const emptyState = document.getElementById('inv-empty-state');
        if(!pGear) return;

        pGear.innerHTML = ''; 
        let hasGear = false;
        
        const counts = {}; 
        GameState.inventory.forEach(i => counts[i] = (counts[i] || 0) + 1);

        const groupedCards = { weapon: [], armor: [], accessory: [] };

        for(const [id, count] of Object.entries(counts)) {
            const item = GameData.items[id]; 
            // 💡 옛날 '스킨' 타입 데이터가 인벤토리에 남아있으면 무시하고 넘어갑니다!
            if(!item || item.type === 'skin') continue; 
            
            let isEquipped = false;
            if (item.subType === 'weapon' && GameState.equippedWeapon === id) isEquipped = true;
            if (item.subType === 'armor' && GameState.equippedArmor === id) isEquipped = true;
            if (item.subType === 'accessory' && GameState.equippedAccessory === id) isEquipped = true;
            
            const badgeHTML = isEquipped ? `<div class="item-equipped-badge text-[8px] tracking-wider">장착중</div>` : '';
            const countHTML = count > 1 ? `<div class="absolute bottom-1 right-2 text-[10px] text-slate-400 font-bold">x${count}</div>` : '';
            
            let effectText = '';
            if (item.atkMult) effectText += `<span class="text-[9px] text-red-400 font-bold">공격력 +${Math.round((item.atkMult - 1)*100)}%</span><br>`;
            if (item.hpMult) effectText += `<span class="text-[9px] text-emerald-400 font-bold">체력 +${Math.round((item.hpMult - 1)*100)}%</span><br>`;
            if (item.critRate) effectText += `<span class="text-[9px] text-purple-400 font-bold">크리티컬 +${item.critRate}%</span><br>`;
            if (item.critDmg) effectText += `<span class="text-[9px] text-pink-400 font-bold">크리데미지 +${item.critDmg}%</span><br>`;
            if (item.vamp) effectText += `<span class="text-[9px] text-rose-500 font-bold">피흡 +${item.vamp}%</span><br>`;
            if (item.spd) effectText += `<span class="text-[9px] text-yellow-400 font-bold">공속 +${item.spd}%</span><br>`;
            if (item.eva) effectText += `<span class="text-[9px] text-teal-400 font-bold">회피 +${item.eva}%</span><br>`;
            if (item.def) effectText += `<span class="text-[9px] text-blue-400 font-bold">방어력 +${item.def}</span>`;
            
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
            
            groupedCards[item.subType].push(card);
            hasGear = true; 
        }

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
        
        // 텅 빈 상태 처리 (장비 탭에서 장비가 없을 때만 띄움)
        const isGearTab = !document.getElementById('inv-tab-gear').classList.contains('text-slate-400');
        if (isGearTab && !hasGear) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
        
        // 내 정보 상단 전투력/생존력 업데이트
        const stats = GameState.getTotalStats(); 
        document.getElementById('profile-total-power').innerText = stats.atk.toLocaleString(); 
        document.getElementById('profile-total-hp').innerText = stats.hp.toLocaleString();
        
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







