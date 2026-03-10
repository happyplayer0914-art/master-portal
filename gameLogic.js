// =========================================================================
// 4. UI MANAGER & 5. GAME SYSTEM
// =========================================================================
const UIManager = {
    init() { this.initBackground(); this.updateCurrencyUI(); this.applyAvatarSkin(); this.initCheckinButton(); document.getElementById('profile-nickname-display').innerText = GameState.nickname; },
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
        document.getElementById('gold-display').innerText = Math.min(GameState.gold, 99999).toLocaleString();
        document.getElementById('gem-display').innerText = Math.min(GameState.gem, 99999).toLocaleString();
    },
    
    initCheckinButton() { 
        if(GameState.lastCheckIn === new Date().toDateString()) {
            const btn = document.getElementById('btn-checkin');
            btn.innerHTML = '<span>✅</span> 내일 다시 오세요'; 
            btn.classList.replace('from-indigo-600', 'from-slate-600'); 
            btn.classList.replace('to-purple-600', 'to-slate-700'); 
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
        pGear.innerHTML = ''; pSkin.innerHTML = '';
        let hasGear = false; let hasSkin = false;
        
        const counts = {}; GameState.inventory.forEach(i => counts[i] = (counts[i] || 0) + 1);
        for(const [id, count] of Object.entries(counts)) {
            const item = GameData.items[id]; if(!item) continue;
            const isEquipped = GameState.equippedGear === id || GameState.equippedSkin === id;
            const badgeHTML = isEquipped ? `<div class="item-equipped-badge">장착중</div>` : '';
            const countHTML = count > 1 ? `<div class="absolute bottom-1 right-2 text-[10px] text-slate-400 font-bold">x${count}</div>` : '';
            const effectHTML = item.type === 'gear' ? `<span class="text-[9px] text-emerald-400 font-bold mt-1">스탯 +${Math.round((item.statMult - 1)*100)}%</span>` : `<span class="text-[9px] text-purple-400 font-bold mt-1">프로필 효과</span>`;
            
            const card = `
                <div onclick="GameSystem.Lobby.toggleEquip('${id}')" class="item-card rarity-${item.rarity} ${isEquipped ? 'equipped' : ''}">
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
    Lobby: {
        // 🔥 여기서부터 아래 코드를 통째로 추가하세요!
        calculateIdleReward() {
            const now = Date.now();
            const lastLogin = GameState.lastLoginTime;
            const diffMs = now - lastLogin;
            const diffMinutes = Math.floor(diffMs / (1000 * 60)); // 분 단위로 변환

            // 10분 이상 오프라인이었을 때만 보상 지급 (최대 24시간=1440분 누적)
            if (diffMinutes >= 10) {
                const offlineMinutes = Math.min(diffMinutes, 1440);
                const rewardGold = offlineMinutes * 5; // 1분에 5G씩 (1시간 300G)

                GameState.gold += rewardGold;
                GameState.lastLoginTime = now;
                GameState.save();
                UIManager.updateCurrencyUI();

                // 접속 후 0.5초 뒤에 기분 좋은 팝업 띄우기
                setTimeout(() => {
                    AudioEngine.sfx.coin();
                    UIManager.triggerHeavyHaptic();
                    alert(`⏳ 오프라인 보상 도착!\n마스터님이 자리를 비운 동안 길드원들이 사냥을 다녀왔습니다.\n\n🪙 +${rewardGold.toLocaleString()} G 획득! (방치 시간: ${Math.floor(offlineMinutes/60)}시간 ${offlineMinutes%60}분)`);
                }, 500);
            } else {
                // 10분이 안 넘었으면 시간만 최신화
                GameState.lastLoginTime = now;
                GameState.save();
            }
        },
        // 🔥 여기까지! (이 아래에는 원래 있던 claimDailyReward() 등이 그대로 이어지면 됩니다.)
        claimDailyReward() {
            if (GameState.lastCheckIn === new Date().toDateString()) return UIManager.showToast("오늘 이미 보상을 받았습니다! ⏱️");
            GameState.gold += 100; GameState.lastCheckIn = new Date().toDateString(); GameState.save();
            UIManager.updateCurrencyUI(); UIManager.initCheckinButton(); AudioEngine.sfx.coin(); UIManager.triggerHaptic();
            UIManager.showToast("출석체크 완료! 100G 획득 🪙");
        },
        rewardForPlay() { GameState.gold += 10; GameState.save(); UIManager.updateCurrencyUI(); AudioEngine.sfx.coin(); UIManager.showToast("탐험 지원금 10G 획득 🪙"); },
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
                        resBox.innerHTML += `<div class="gacha-item-card item-card rarity-${item.rarity}"><span class="text-[10px] font-bold mb-1 ${item.color} tracking-widest">[${rarityLabel}]</span><div class="text-4xl mb-1 filter drop-shadow-lg">${item.emoji}</div><h4 class="text-white font-bold text-xs text-center break-keep">${item.name}</h4></div>`;
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
            const list = document.getElementById('ranking-list'); list.innerHTML = '<div class="text-center py-8"><div class="loader"></div><p class="text-sm text-slate-400 mt-3">서버에서 전설을 불러오는 중...</p></div>';
            if(!window.db) { list.innerHTML = '<div class="text-center py-8 text-red-400">데이터베이스 연결에 실패했습니다.</div>'; return; }
            try {
                const q = window.query(window.collection(window.db, "rankings")); const snap = await window.getDocs(q);
                let all = []; snap.forEach(d => all.push(d.data()));
                all.sort((a,b) => { if (b.stage !== a.stage) return b.stage - a.stage; const timeA = a.timestamp ? (a.timestamp.toMillis ? a.timestamp.toMillis() : a.timestamp) : Date.now(); const timeB = b.timestamp ? (b.timestamp.toMillis ? b.timestamp.toMillis() : b.timestamp) : Date.now(); return timeA - timeB; });
                let unique = []; let seen = new Set();
                all.forEach(d => { const id = d.deviceId || d.nickname; if(!seen.has(id) && unique.length < 10) { seen.add(id); unique.push(d); } });
                if(unique.length === 0) { list.innerHTML = '<div class="text-center py-8 text-slate-400">아직 명예의 전당에 오른 자가 없습니다.</div>'; return; }
                list.innerHTML = '';
                unique.forEach((d, i) => {
                    let rankIcon = `${i + 1}위`; let bgClass = "bg-slate-900";
                    if(i === 0) { rankIcon = "🥇 1위"; bgClass = "bg-gradient-to-r from-yellow-900/40 to-slate-900 border border-yellow-500/30"; } else if(i === 1) { rankIcon = "🥈 2위"; bgClass = "bg-slate-800 border border-slate-400/30"; } else if(i === 2) { rankIcon = "🥉 3위"; bgClass = "bg-orange-950/30 border border-orange-700/30"; }
                    let skinClass = "bg-gradient-to-tr from-slate-600 to-slate-400"; if(d.skin && d.skin !== 'none' && GameData.items[d.skin]) skinClass = `skin-${GameData.items[d.skin].rarity}`;
                    const isMe = (d.nickname === GameState.nickname); const myHighlight = isMe ? "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "border-transparent";
                    list.innerHTML += `<div class="p-4 rounded-xl flex items-center justify-between ${bgClass} border ${myHighlight} transition-all mb-3"><div class="flex items-center gap-4"><div class="w-12 text-center font-black ${i < 3 ? 'text-yellow-400' : 'text-slate-500'}">${rankIcon}</div><div class="master-avatar w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md ${skinClass}">${d.nickname.charAt(0)}</div><div><p class="font-bold text-white text-sm flex items-center gap-2">${d.nickname} ${isMe ? '<span class="text-[10px] bg-indigo-500 px-1.5 py-0.5 rounded text-white font-normal">ME</span>' : ''}</p></div></div><div class="text-right"><p class="text-xs text-slate-400">도달 층수</p><p class="text-lg font-black text-gradient-gold">${d.stage}F</p></div></div>`;
                });
            } catch(e) { console.error(e); list.innerHTML = '<div class="text-center py-8 text-red-400">명예의 전당을 불러오지 못했습니다.</div>'; }
        }
    },

    Battle: {
        monsterMaxHp: 0, monsterCurrentHp: 0, monsterAtkObj: 0, battleInterval: null, lastAttackTime: 0,
        
        enterDungeon() {
            if (GameState.currentHp <= 0) return UIManager.showToast("체력이 없습니다! 여관에서 휴식하세요. ⛺");
            AudioEngine.sfx.click(); UIManager.triggerHaptic(); 
            document.getElementById('bottom-nav').style.display = 'none'; 
            
            const isBoss = (GameState.rpgStage % 5 === 0);
            let stageRoll = localStorage.getItem('master_stage_roll_' + GameState.rpgStage) || Math.random(); 
            localStorage.setItem('master_stage_roll_' + GameState.rpgStage, stageRoll);
            
            if (!isBoss && parseFloat(stageRoll) < 0.3) {
                this.triggerRandomEvent(parseFloat(stageRoll)); 
            } else {
                this.startBattleSequence(isBoss);
            }
        },

        triggerRandomEvent(roll) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); 
            document.getElementById('screen-rpg-event').classList.add('active');
            const titleEl = document.getElementById('event-title'), iconEl = document.getElementById('event-icon'), descEl = document.getElementById('event-desc');
            
            if (roll < 0.12) { 
                titleEl.innerText = "숨겨진 보물상자!"; iconEl.innerText = "🎁"; titleEl.className = "text-2xl font-black text-yellow-400 mb-4"; 
                descEl.innerText = "상자를 열었더니 골드가 쏟아집니다!\n(+30G 획득)"; AudioEngine.sfx.coin(); GameState.gold += 30; 
            } else if (roll < 0.21) { 
                titleEl.innerText = "함정 발동!"; iconEl.innerText = "🪤"; titleEl.className = "text-2xl font-black text-rose-500 mb-4"; 
                let dmg = Math.floor(GameState.getTotalStats().hp * 0.15); 
                descEl.innerText = `독화살이 날아왔습니다!\n(-${dmg} HP)`; GameState.currentHp = Math.max(1, GameState.currentHp - dmg); 
                AudioEngine.sfx.hit(); UIManager.triggerHeavyHaptic(); 
            } else { 
                titleEl.innerText = "요정의 축복"; iconEl.innerText = "🧚"; titleEl.className = "text-2xl font-black text-cyan-400 mb-4"; 
                let heal = Math.floor(GameState.getTotalStats().hp * 0.3); 
                descEl.innerText = `요정이 상처를 치료해 줍니다.\n(+5💎, +${heal} HP)`; AudioEngine.sfx.coin(); GameState.gem += 5; 
                GameState.currentHp = Math.min(GameState.getTotalStats().hp, GameState.currentHp + heal); 
            }
        },

        endEvent() { 
            GameState.rpgStage++; GameState.save(); 
            document.getElementById('bottom-nav').style.display = 'flex'; 
            UIManager.navTo('screen-arena', document.querySelectorAll('.nav-item')[1]); 
        },

        startBattleSequence(isBoss) {
            if(GameState.isBattling) return; 
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); 
            document.getElementById('screen-rpg-battle').classList.add('active');
            
            GameState.isBattling = true; 
            localStorage.setItem('master_in_battle', 'true');
            
            if (isBoss) {
                AudioEngine.sfx.boss(); const overlay = document.getElementById('boss-warning-overlay'); overlay.classList.add('active');
                let shakes = 0; let shakeInt = setInterval(() => { 
                    const appCont = document.querySelector('.app-container');
                    appCont.classList.add('shake'); 
                    UIManager.triggerHeavyHaptic(); 
                    setTimeout(() => appCont.classList.remove('shake'), 150); 
                    if(++shakes >= 4) clearInterval(shakeInt); 
                }, 500);
                setTimeout(() => { overlay.classList.remove('active'); this.initBattle(true); }, 3000);
            } else {
                this.initBattle(false);
            }
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
            if(GameState.currentHp <= 0 || this.monsterCurrentHp <= 0 || GameState.potions <= 0 || GameState.currentHp >= stats.hp) return;
            AudioEngine.sfx.click(); UIManager.triggerHaptic(); GameState.potions -= 1;
            let healAmt = Math.floor(stats.hp * 0.5); GameState.currentHp = Math.min(stats.hp, GameState.currentHp + healAmt);
            GameState.save(); this.updateBattleUI(); document.getElementById('battle-log').innerText = `✨ 물약 사용! 체력 회복!`;
        },

        playerAttack() {
            if(this.monsterCurrentHp <= 0 || GameState.currentHp <= 0) return;
            const ATTACK_COOLDOWN = 600;
            if (Date.now() - this.lastAttackTime < ATTACK_COOLDOWN) return;
            this.lastAttackTime = Date.now();
            
            AudioEngine.sfx.hit(); UIManager.triggerHaptic();
            let myAtk = GameState.getTotalStats().atk; 
            let isCrit = Math.random() < 0.2; let damage = isCrit ? Math.floor(myAtk * 1.5) : myAtk;
            this.monsterCurrentHp -= damage;
            
            const sprite = document.getElementById('monster-sprite');
            sprite.classList.remove('damage-flash'); void sprite.offsetWidth; sprite.classList.add('damage-flash');
            document.getElementById('battle-log').innerText = `🗡️ 공격! ${damage} 데미지! ${isCrit ? '(크리티컬!)' : ''}`;

            const btn = document.getElementById('btn-attack'); btn.disabled = true; btn.innerHTML = "⏳ 쿨타임...";
            setTimeout(() => { if(GameState.currentHp > 0 && this.monsterCurrentHp > 0) { btn.disabled = false; btn.innerHTML = "⚔️ 공격 (TAP!)"; } }, ATTACK_COOLDOWN);
            this.updateBattleUI(); if (this.monsterCurrentHp <= 0) setTimeout(() => this.endBattle(true), 300);
        },

        monsterAttack() {
            if(this.monsterCurrentHp <= 0 || GameState.currentHp <= 0) return;
            AudioEngine.sfx.hit(); UIManager.triggerHeavyHaptic();
            let damage = Math.floor(this.monsterAtkObj * (0.8 + Math.random() * 0.4));
            GameState.currentHp -= damage; GameState.save(); 
            
            document.querySelector('.app-container').classList.add('shake'); setTimeout(() => document.querySelector('.app-container').classList.remove('shake'), 200);
            document.getElementById('battle-log').innerText = `💥 몬스터 반격! ${damage} 피해!`;

            this.updateBattleUI(); if (GameState.currentHp <= 0) setTimeout(() => this.endBattle(false), 300);
        },

        endBattle(isWin) {
            clearInterval(this.battleInterval); GameState.isBattling = false; localStorage.removeItem('master_in_battle'); 
            document.getElementById('bottom-nav').style.display = 'flex'; 
            const isBoss = (GameState.rpgStage % 5 === 0);
            
            if (isWin) {
                AudioEngine.sfx.coin(); UIManager.triggerHaptic();
                let rewardGold = isBoss ? (GameState.rpgStage * 30) : 10; let rewardGem = isBoss ? 50 : 0;
                GameState.gold += rewardGold; GameState.gem += rewardGem; GameState.rpgStage++; GameState.save();
                
                GameSystem.Ranking.updateRankingSilently();

                alert(`🎉 토벌 성공!\n🪙 +${rewardGold}G ${isBoss ? ' / 💎 +'+rewardGem : ''}`);
            } else {
                UIManager.triggerHeavyHaptic(); GameState.currentHp = 0; GameState.save();
                alert(`💀 쓰러졌습니다...\n여관에서 휴식하거나 내일 자정이 지나면 부활합니다.`);
            }
            UIManager.navTo('screen-arena', document.querySelectorAll('.nav-item')[1]);
        }
    }

};
