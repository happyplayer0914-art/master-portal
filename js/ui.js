// =========================================================================
// 4. UI MANAGER
// =========================================================================
const UIManager = {
    selectedItems: [],

    // 🌟 [신규 추가] 랜덤 휴식 멘트 리스트
    recoveryTexts: [
        "향긋한 에일 맥주로 피로를 녹이는 중...",
        "주점에서 다른 길드장들과 떠드는 중...",
        "모닥불에서 길드원들과 마시멜로 굽는 중...",
        "혼자 고요한 밤하늘을 올려보며 감상하는 중...",
        "현실에서 중요한 일을 해결하는 중..."
    ],
    currentRecoveryText: "",

    // 🌟 [신규 추가] 1초마다 타이머와 멘트를 갱신해 주는 전광판 엔진!
    updateHpRecoveryText() {
        const el = document.getElementById('hp-recovery-text');
        if (!el) return;

        const maxHp = GameState.getTotalStats().hp;
        
        // 풀피(100%)거나 전투 중일 때는 텍스트 숨기기
        if (GameState.currentHp >= maxHp || GameState.isBattling) {
            el.classList.add('hidden');
            this.currentRecoveryText = ""; // 멘트 초기화
            return;
        }

        // 멘트가 비어있다면 리스트에서 랜덤으로 하나 뽑기
        if (!this.currentRecoveryText) {
            this.currentRecoveryText = this.recoveryTexts[Math.floor(Math.random() * this.recoveryTexts.length)];
        }

        // 남은 시간 정밀 계산 (총 필요한 시간 - 현재 틱에서 흘러간 시간)
        const EIGHT_HOURS = 8 * 60 * 60 * 1000;
        const missingHp = maxHp - GameState.currentHp;
        const msPerHp = EIGHT_HOURS / maxHp;
        
        let remainingMs = (missingHp * msPerHp) - (Date.now() - GameState.lastHpUpdate);
        if (remainingMs < 0) remainingMs = 0;

        // 보기 예쁜 00:00:00 포맷으로 변환
        const totalSeconds = Math.floor(remainingMs / 1000);
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');

        // 화면에 출력!
        el.innerHTML = `☕ ${this.currentRecoveryText} <span class="text-emerald-400 font-bold ml-1">(${h}:${m}:${s})</span>`;
        el.classList.remove('hidden');
    },

// 🌟 [최종 진화] 무조건 즉시 렌더링 엔진!
    init() { 
        this.initBackground(); 
        
        // 🚨 0.3초 타이머 삭제! 무조건 게임 켜자마자 화면부터 완벽하게 쫙 그립니다!
        this.updateCurrencyUI(); 
        this.applyAvatarSkin(); 
        this.initCheckinButton(); 
        this.updateIdleUI(); 
        if(document.getElementById('profile-nickname-display')) {
            document.getElementById('profile-nickname-display').innerText = GameState.nickname || "마스터"; 
        }
        this.updateRpgLobbyUI();
        this.updateProfileUI();

        // 만약을 대비해 0.5초 뒤에 한 번 더 확실하게 덧칠 (0원 깜빡임 원천 차단)
        setTimeout(() => {
            this.updateCurrencyUI();
            this.applyAvatarSkin();
            this.updateRpgLobbyUI();
            this.updateProfileUI();
        }, 500);

        // 파이어베이스(서버)에서 한줄소개/인기도 땡겨오기
        if (window.GameSystem && GameSystem.Profile && GameSystem.Profile.loadMyProfile) {
            GameSystem.Profile.loadMyProfile();
        }

        if(this.GachaSlider) this.GachaSlider.init();

        // 게임 켤 때 내가 낀 배경화면 불러오기
        setTimeout(() => {
            if (window.GameSystem && GameSystem.Lobby && GameSystem.Lobby.applyBackground) {
                GameSystem.Lobby.applyBackground();
            }
        }, 500);
        
        // 탈주 페널티 로직
        if (localStorage.getItem('master_in_battle') === 'true') {
            localStorage.removeItem('master_in_battle');
            if (window.GameState) {
                GameState.currentHp = 0; 
                GameState.isBattling = false;
                if(GameState.save) GameState.save();
            }
            setTimeout(() => {
                this.triggerHeavyHaptic();
                this.showToast("🚨 탈주 페널티: 전투 이탈로 체력이 0이 되었습니다.");
                this.updateRpgLobbyUI();
            }, 1000);
        }

        // 방치형 지원금 1분마다 UI 갱신
        setInterval(() => {
            const homeScreen = document.getElementById('screen-home');
            if (homeScreen && homeScreen.classList.contains('active')) {
                this.updateIdleUI();
            }
        }, 60000);

        // 체력 회복 1초 스케줄러
        setInterval(() => {
            if (window.GameState && GameState.recoverHpOverTime) {
                GameState.recoverHpOverTime();
            }
            const arenaScreen = document.getElementById('screen-arena');
            if (arenaScreen && arenaScreen.classList.contains('active')) {
                this.updateHpRecoveryText();
            }
        }, 1000);
    },

    // 🌟 [최종 진화] 재화 표시 시스템 (문자 강제 숫자 변환 + 에러 방어!)
    updateCurrencyUI() {
        // 💡 [핵심 방어막] 데이터가 글자로 오든 빈칸으로 오든 무조건 숫자로 강제 멱살잡이!
        let g = Number(GameState.gold) || 0;
        let m = Number(GameState.gem) || 0;

        const formatBigNumber = (num) => {
            if (num >= 100000000) return (num / 100000000).toFixed(2) + '억';
            if (num >= 10000) return (num / 10000).toFixed(1) + '만';
            return num.toLocaleString();
        };

        const goldEl = document.getElementById('gold-display');
        const gemEl = document.getElementById('gem-display');
        
        if (goldEl) goldEl.innerText = formatBigNumber(g);
        if (gemEl) gemEl.innerText = formatBigNumber(m);
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
     // 💡 프로필 탭 진입 로직
        if(s === 'screen-profile') { 
            this.switchInvTab('gear'); 
            // 1. 먼저 로컬 데이터로 빠르게 화면 그리기
            this.updateProfileUI(); 
            // 2. 서버에서 최신 정보(좋아요, 잃어버린 한줄소개 등)를 비동기로 땡겨오기 (성공 시 알아서 다시 그림)
            if(window.GameSystem && GameSystem.Profile) {
                GameSystem.Profile.loadMyProfile(); 
            }
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
    
  // 🌟 [최종 진화] 재화 표시 시스템 (문자 강제 숫자 변환 + 에러 방어!)
    updateCurrencyUI() {
        // 💡 [핵심 방어막] 데이터가 글자로 오든 빈칸으로 오든 무조건 숫자로 강제 멱살잡이!
        let g = Number(GameState.gold) || 0;
        let m = Number(GameState.gem) || 0;

        const formatBigNumber = (num) => {
            if (num >= 100000000) return (num / 100000000).toFixed(2) + '억';
            if (num >= 10000) return (num / 10000).toFixed(1) + '만';
            return num.toLocaleString();
        };

        const goldEl = document.getElementById('gold-display');
        const gemEl = document.getElementById('gem-display');
        
        if (goldEl) goldEl.innerText = formatBigNumber(g);
        if (gemEl) gemEl.innerText = formatBigNumber(m);
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
    // 시스템에서 내 최대 한도가 얼만지 가져오기
        const maxGold = GameSystem.Lobby.getMaxIdleReward();
        
        const display = document.getElementById('idle-amount-display');
        if (display) {
            display.innerText = `${amount.toLocaleString()} / ${maxGold.toLocaleString()} G`;
            display.className = amount >= maxGold ? "text-sm font-black text-emerald-400 animate-pulse" : "text-sm font-black text-slate-400";
        }

        // 💡 [신규 추가] 설명 텍스트도 실시간 한도에 맞춰서 싹 바꿔주기!
        const descDisplay = document.getElementById('idle-desc-display');
        if (descDisplay) {
            descDisplay.innerText = `접속을 종료해도 8시간 동안 최대 ${maxGold.toLocaleString()}G가 자동으로 누적됩니다.`;
        }
    },
   // 🌟 [업그레이드] 내 스탯 & 타 유저 스탯 공용 모달창
    openStatsModal(customStats = null, customName = null) {
        if(AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
        this.triggerHaptic();
        
        // customStats가 들어오면(남의 프로필) 그걸 쓰고, 안 들어오면 내 스탯을 씁니다!
        const stats = customStats || GameState.getTotalStats();
        if (!stats) {
            this.showToast("이 유저의 상세 스탯 정보가 서버에 없습니다.");
            return;
        }

        const modalTitle = customName ? `${customName}의 능력치` : "내 능력치";
        const content = document.getElementById('stats-modal-content');
        if (!content) return;

        // 팝업창 제목 바꿔주기
        const titleEl = document.querySelector('#stats-modal h3');
        if (titleEl) titleEl.innerText = modalTitle;

        content.innerHTML = `
            <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col gap-1">
                <div class="flex justify-between items-end border-b border-slate-700/50 pb-1 mb-1">
                    <span class="text-red-400 font-black text-sm">⚔️ 공격력</span>
                    <span class="text-white font-bold text-base">${stats.atk.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col gap-1">
                <div class="flex justify-between items-end border-b border-slate-700/50 pb-1 mb-1">
                    <span class="text-emerald-400 font-black text-sm">❤️ 최대 체력</span>
                    <span class="text-white font-bold text-base">${stats.hp.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col gap-1">
                <div class="flex justify-between items-end border-b border-slate-700/50 pb-1 mb-1">
                    <span class="text-purple-400 font-black text-sm">🎯 크리티컬 확률</span>
                    <span class="text-white font-bold text-base">${stats.critRate}%</span>
                </div>
            </div>
            
            <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col gap-1">
                <div class="flex justify-between items-end border-b border-slate-700/50 pb-1 mb-1">
                    <span class="text-pink-400 font-black text-sm">💥 크리티컬 데미지</span>
                    <span class="text-white font-bold text-base">${stats.critDmg}%</span>
                </div>
            </div>
            
            <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col gap-1">
                <div class="flex justify-between items-end border-b border-slate-700/50 pb-1 mb-1">
                    <span class="text-blue-400 font-black text-sm">🛡️ 방어력</span>
                    <span class="text-white font-bold text-base">${stats.def}%</span>
                </div>
            </div>
            
            <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col gap-1">
                <div class="flex justify-between items-end border-b border-slate-700/50 pb-1 mb-1">
                    <span class="text-teal-400 font-black text-sm">💨 회피율</span>
                    <span class="text-white font-bold text-base">${stats.eva}%</span>
                </div>
            </div>
            
            <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col gap-1">
                <div class="flex justify-between items-end border-b border-slate-700/50 pb-1 mb-1">
                    <span class="text-yellow-400 font-black text-sm">⚡ 공격 속도</span>
                    <span class="text-white font-bold text-base">${stats.spd}%</span>
                </div>
            </div>

            <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col gap-1 mb-2">
                <div class="flex justify-between items-end border-b border-slate-700/50 pb-1 mb-1">
                    <span class="text-rose-500 font-black text-sm">🩸 흡혈(피흡)</span>
                    <span class="text-white font-bold text-base">${stats.vamp}%</span>
                </div>
            </div>
        `;

       const modal = document.getElementById('stats-modal');
        modal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
        modal.classList.add('opacity-100', 'pointer-events-auto', 'scale-100', 'active');
    },

    
    // 👤 [완성판] 타 유저 팝업창 열기 (파이어베이스 실시간 연동!)
    async openUserProfile(nickname, icon, title, stage, skinClass) {
        
        if (nickname === GameState.nickname) return;
        window.currentTargetUser = nickname;

        // 1. 기본 껍데기 세팅 (빠르게 먼저 띄움)
        document.getElementById('target-user-nickname').innerText = nickname;
        document.getElementById('target-user-title').innerHTML = title && title !== 'undefined' ? `✨ ${title} ✨` : "✨ 칭호 없음 ✨";
        document.getElementById('target-user-stage').innerText = stage && stage !== 'undefined' ? `${stage}F` : "알 수 없음";
        document.getElementById('target-user-avatar').innerHTML = icon;
        document.getElementById('target-user-avatar').className = `master-avatar w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 relative ${skinClass.replace('bg-slate-700', 'bg-slate-800')}`;
        
        // 로딩용 임시 텍스트
        document.getElementById('target-user-uid').innerText = "로딩중...";
        document.getElementById('target-user-status').innerText = "서버에서 정보를 불러오는 중입니다...";
        document.getElementById('target-user-likes').innerText = "0";

        // 창 열기
        const modal = document.getElementById('user-profile-modal');
        if (modal) {
            modal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
            modal.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
        }

        // 🌟 2. 파이어베이스에서 진짜 데이터 땡겨와서 덮어씌우기!
        if (window.db) {
            try {
                const userRef = window.doc(window.db, "users", nickname);
                const docSnap = await window.getDoc(userRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // 🌟 상대방의 이름과 스탯을 임시로 기억해 둡니다! (상세 스탯 창 띄울 때 씀)
                    window.currentTargetStats = data.totalStats || null;
                    window.currentTargetName = nickname;
                    
                    // 텍스트 정보 덮어씌우기
                    document.getElementById('target-user-uid').innerText = data.uid || "0000";
                    document.getElementById('target-user-status').innerText = data.statusMessage || "작성된 소개가 없습니다.";
                    document.getElementById('target-user-likes').innerText = data.likes || 0;
                    
                    const prestigeText = data.prestige > 0 ? `[${data.prestige}환생] ` : "";
                    document.getElementById('target-user-stage').innerText = `${prestigeText}${data.highestStage || stage}F`;

                    // 상대방이 설정한 배경 스킨(bgSkin) 씌워주기
                    const bgEl = document.getElementById('target-profile-bg');
                    if (data.bgSkin && data.bgSkin !== 'none' && data.bgSkin !== 'default' && window.GameData && GameData.cosmetics && GameData.cosmetics.backgrounds) {
                        const bgItem = GameData.cosmetics.backgrounds.find(x => x.id === data.bgSkin);
                        if (bgItem) bgEl.style.backgroundImage = `url('assets/backgrounds/${bgItem.img}')`;
                    } else {
                        bgEl.style.backgroundImage = `url('assets/backgrounds/bg_library.png')`;
                    }
                    
                    // 상대방 장비 렌더링 엔진
                    const renderTargetSlot = (type, itemId, level) => {
                        const el = document.getElementById(`target-slot-${type}`);
                        if (!el) return;
                        
                        if (itemId && window.GameData && GameData.items[itemId]) {
                            const item = GameData.items[itemId];
                            let rarityClass = "border-slate-600 bg-slate-800";
                            if(item.rarity === 'legendary') rarityClass = "rarity-legendary";
                            else if(item.rarity === 'epic') rarityClass = "rarity-epic";
                            else if(item.rarity === 'rare') rarityClass = "rarity-rare";
                            else if(item.rarity === 'mythic') rarityClass = "rarity-mythic animate-pulse";
                            
                            el.className = `w-[30%] aspect-square rounded-lg flex flex-col items-center justify-center relative cursor-pointer hover:scale-105 transition-transform border-2 ${rarityClass}`;
                            el.innerHTML = `
                                <div class="text-2xl filter drop-shadow-md">${item.emoji}</div>
                                <div class="absolute -top-1 -right-1 bg-slate-900 border border-slate-500 rounded-full w-4 h-4 flex items-center justify-center text-[8px] shadow-md">🔍</div>
                                <div class="absolute bottom-0 w-full bg-black/60 text-white text-[9px] text-center font-bold rounded-b-lg py-0.5 truncate px-1">Lv.${level || 0}</div>
                            `;
                           // 남의 장비 터치하면 텍스트로 옵션 훔쳐보기!
                            el.onclick = () => { 
                                const upgMult = 1.0 + ((level || 0) * 0.1);
                                let effectText = "";
                                if (item.atkMult) effectText += `공격 +${Math.round((item.atkMult - 1)*100 * upgMult)}%  `;
                                if (item.hpMult) effectText += `체력 +${Math.round((item.hpMult - 1)*100 * upgMult)}%  `;
                                if (item.critRate) effectText += `크리 +${(item.critRate * upgMult).toFixed(1)}%  `;
                                if (item.def) effectText += `방어 +${Math.floor(item.def * upgMult)}  `;
                                
                                UIManager.showToast(`[${item.name} +${level || 0}] ${effectText}`); 
                            };
                        } else {
                            const typeName = type === 'weapon' ? '무기' : type === 'armor' ? '방어구' : '장신구';
                            el.className = "w-[30%] aspect-square rounded-lg border border-slate-600 bg-slate-800 flex flex-col items-center justify-center relative opacity-50";
                            el.innerHTML = `<span class="text-[9px] text-slate-500 font-bold">${typeName}</span>`;
                            el.onclick = null;
                        }
                    };
                    
                    // 무기, 방어구, 장신구 뿌려주기
                    renderTargetSlot('weapon', data.equipment?.weapon, data.itemUpgrades?.weapon);
                    renderTargetSlot('armor', data.equipment?.armor, data.itemUpgrades?.armor);
                    renderTargetSlot('accessory', data.equipment?.accessory, data.itemUpgrades?.accessory);
                } else {
                    document.getElementById('target-user-status').innerText = "최근 접속 기록이 없는 유저입니다.";
                }
            } catch (e) {
                console.error("프로필 불러오기 실패:", e);
            }
        }
    },

    closeUserProfile() {
        const modal = document.getElementById('user-profile-modal');
        if (modal) {
            modal.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
            modal.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        }
    },

    openReportModal() {
        const modal = document.getElementById('report-modal');
        if (modal) {
            modal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
            modal.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
        }
    },

    closeReportModal() {
        const modal = document.getElementById('report-modal');
        if (modal) {
            modal.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
            modal.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        }
    },
    // 🚫 [신규] 차단 목록 관리 모달 컨트롤러
    openBlockManageModal() {
        const modal = document.getElementById('block-manage-modal');
        if (modal) {
            modal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
            modal.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
        }
        // 창 열 때 목록 바로 새로고침!
        if (window.GameSystem && GameSystem.Chat) {
            GameSystem.Chat.renderBlockedUsers();
        }
    },

    closeBlockManageModal() {
        const modal = document.getElementById('block-manage-modal');
        if (modal) {
            modal.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
            modal.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        }
    },
    // 🌟 [신규] 차원의 여신(환생) 모달 열기 및 보상 계산!
    openGoddessModal() {
        // 1. 100층 미만이면 컷! (길드장님이 설정하신 층수가 있다면 거기에 맞춰주세요)
        if (GameState.rpgStage < 100) {
            this.showToast("100층의 심연의 군주를 토벌해야 차원의 여신을 만날 수 있습니다! 👑");
            return;
        }

        if(AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
        this.triggerHaptic();

        // 2. 보상 계산 로직 (예: 층수 * 50 젬, 층수 * 1000 골드)
        // 💡 주의: GameSystem.Battle.doPrestige() 안에 있는 실제 지급 로직과 수식을 똑같이 맞춰주시면 됩니다!
        const gemReward = GameState.rpgStage * 10; 
        const goldReward = GameState.rpgStage * 30;

        // 3. 계산된 보상을 화면에 찍어주기
        const gemEl = document.getElementById('goddess-gem-reward');
        const goldEl = document.getElementById('goddess-gold-reward');
        if (gemEl) gemEl.innerText = gemReward.toLocaleString();
        if (goldEl) goldEl.innerText = goldReward.toLocaleString();

        // 4. 모달 짠! 하고 열기
        const modal = document.getElementById('goddess-modal');
        if (modal) modal.classList.remove('hidden');
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
                const level = GameState.itemUpgrades[itemId] || 0;
                
          // 🌟 [UI 심플 모드] 배경과 테두리를 모두 날리고, 가독성을 위해 글씨 겉에 얇고 진한 검은색 외곽선만 추가!
const levelBadge = level > 0 ? `<div class="absolute top-1 left-1 text-yellow-400 text-[11px] font-black z-10 leading-none tracking-tighter" style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.8);">+${level}</div>` : '';
                
                // overflow-hidden 확인 필수!
                el.className = `w-14 h-14 rounded-xl border-2 flex items-center justify-center text-3xl bg-slate-800 shadow-lg relative rarity-${item.rarity} overflow-hidden`;
                el.innerHTML = `${levelBadge}<span class="filter drop-shadow-md">${item.emoji}</span>`;
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

        // =========================================================================
        // 🔥 [엔드 콘텐츠] 신화(1) + 전설(2) 칭호 해금 로직!!
        // =========================================================================
        const equippedIds = [GameState.equippedWeapon, GameState.equippedArmor, GameState.equippedAccessory];
        const gears = equippedIds.filter(id => id !== null).map(id => GameData.items[id]).filter(item => item !== undefined);
        
        let mythicItem = null;
        let legendaryCount = 0;
        
        gears.forEach(g => {
            if (g.rarity === 'mythic') mythicItem = g;
            if (g.rarity === 'legendary') legendaryCount++;
        });

        // 🌟 1. 칭호 자동 해금 로직 (신화 1 + 전설 2 장착 시)
        if (mythicItem && legendaryCount === 2) {
            const targetTitleId = 't_' + mythicItem.mbti.toLowerCase(); // 예: t_entj
            if (!GameState.ownedCosmetics) GameState.ownedCosmetics = [];

            // 아직 해금 안 한 칭호라면? 칭호 창고에 쏙 넣어줌!
            if (!GameState.ownedCosmetics.includes(targetTitleId)) {
                GameState.ownedCosmetics.push(targetTitleId);
                
                if (!GameState.questData.achievements.completed.includes('class_advanced')) {
                    GameState.questData.achievements.completed.push('class_advanced');
                    GameState.gem += 5000; 
                    if(UIManager.updateCurrencyUI) UIManager.updateCurrencyUI(); 
                }
                GameState.save();
                
                // 알림 빵!
                if(UIManager.showToast) {
                    setTimeout(() => UIManager.showToast(`🎉 [히든 업적] '${mythicItem.job}' 칭호 해금 완료! (칭호 탭을 확인하세요)`), 500);
                }
                if(UIManager.triggerHeavyHaptic) UIManager.triggerHeavyHaptic();
            }
        }

       // 🌟 2. 내 정보 창에 '내가 치장품 탭에서 장착한 칭호' 뱃지로 띄워주기
        const jobTitleEl = document.getElementById('profile-job-title');
        if (jobTitleEl) {
            const eqTitleId = GameState.equippedTitle;
            
            if (eqTitleId && eqTitleId !== 'none' && eqTitleId !== 'default' && window.GameData && GameData.cosmetics && GameData.cosmetics.titles) {
                const tItem = GameData.cosmetics.titles.find(t => t.id === eqTitleId);
                if (tItem) {
                    // 칭호를 장착하면 붉게 타오르는 뱃지로 변신!
                    jobTitleEl.innerText = `✨ ${tItem.name} [${tItem.reqMbti}] ✨`;
                    jobTitleEl.className = "px-2 py-1.5 rounded-md bg-red-900/40 border border-red-500/50 text-red-400 font-black text-[11px] tracking-widest uppercase mb-2 animate-pulse drop-shadow-md inline-block transition-all";
                }
            } else {
                // 칭호를 빼면 다시 기본 에메랄드색 뱃지로 원상복구!
                jobTitleEl.innerText = "MASTER PROFILE";
                jobTitleEl.className = "px-2 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-[10px] tracking-widest uppercase mb-2 inline-block shadow-inner transition-all";
            }
        }
    }, // <-- updateRpgLobbyUI 끝나는 괄호
  // 🌟 [전면 개편] 내 정보(프로필) UI 업데이트
    updateProfileUI() {
        const avatarEl = document.getElementById('profile-big-icon');
        const nicknameEl = document.getElementById('profile-nickname-display');
        const titleEl = document.getElementById('profile-job-title');
        const uidEl = document.getElementById('profile-uid-display');
        const recordEl = document.getElementById('profile-highest-record');
        const statusEl = document.getElementById('profile-status-msg');
        const likesEl = document.getElementById('profile-likes-display');
        const bgEl = document.getElementById('profile-bg-image'); // 배경 엘리먼트

        if(nicknameEl) nicknameEl.innerText = GameState.nickname;

        if (!GameState.uid) {
            GameState.uid = Math.floor(1000 + Math.random() * 9000).toString();
            GameState.save();
        }
        if(uidEl) uidEl.innerText = GameState.uid;

        if(titleEl) {
            if(GameState.equippedTitle && GameState.equippedTitle !== 'none' && GameState.equippedTitle !== 'default' && window.GameData && GameData.cosmetics && GameData.cosmetics.titles) {
                const tItem = GameData.cosmetics.titles.find(x => x.id === GameState.equippedTitle);
                titleEl.innerHTML = tItem ? `✨ ${tItem.name} ✨` : "✨ 칭호 없음 ✨";
            } else {
                titleEl.innerHTML = "✨ 칭호 없음 ✨";
            }
        }

        let iconStr = GameState.nickname === "위대한 길드장" ? "M" : GameState.nickname.charAt(0);
        if (GameState.equippedProfile && GameState.equippedProfile !== 'none' && GameState.equippedProfile !== 'default' && window.GameData && GameData.cosmetics && GameData.cosmetics.profiles) {
            const pfItem = GameData.cosmetics.profiles.find(x => x.id === GameState.equippedProfile);
            if (pfItem) iconStr = pfItem.icon;
        }
        if(avatarEl) {
            avatarEl.innerHTML = iconStr;
            let skinClass = "bg-slate-700 border border-slate-600";
            if(GameState.equippedSkin && GameState.equippedSkin !== 'none' && GameState.equippedSkin !== 'default' && window.GameData && GameData.cosmetics && GameData.cosmetics.borders) {
                const bItem = GameData.cosmetics.borders.find(x => x.id === GameState.equippedSkin);
                if(bItem) skinClass = `bg-slate-800 ${bItem.cssClass}`; 
            }
            avatarEl.className = `master-avatar w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 relative ${skinClass}`;
        }

        // 👑 최고 기록 (환생 + 층수 통합!)
        if(recordEl) {
            // 💡 구버전(prestige) 데이터 호환까지 완벽하게 잡아냅니다!
            const pCount = GameState.prestigeCount || GameState.prestige || 0;
            const prestigeText = pCount > 0 ? `[${pCount}환생] ` : "";
            recordEl.innerText = `${prestigeText}${Math.max(GameState.maxStage || 1, GameState.rpgStage || 1)}F`;
        }

        if(statusEl) statusEl.innerText = GameState.statusMessage || "여기를 터치하여 자신을 소개해보세요!";
        if(likesEl) likesEl.innerText = GameState.likes || 0;

        // 🖼️ 내 프로필 배경 스킨 적용 (즉각 렌더링!)
        if (bgEl) {
            if (GameState.equippedBg && GameState.equippedBg !== 'none' && GameState.equippedBg !== 'default' && window.GameData && GameData.cosmetics && GameData.cosmetics.backgrounds) {
                const bgItem = GameData.cosmetics.backgrounds.find(x => x.id === GameState.equippedBg);
                if (bgItem) {
                     bgEl.style.backgroundImage = `url('assets/backgrounds/${bgItem.img}')`;
                }
            } else {
                bgEl.style.backgroundImage = `url('assets/backgrounds/bg_library.png')`; // 기본 배경
            }
        }

        this.updateProfileEquipmentSlots();
        
        // 🚨 덮어씌우기 주범이었던 syncToServer() 삭제 완료!
    },

    // ⚔️ [신규] 프로필 전용 장비 슬롯 그리기
    updateProfileEquipmentSlots() {
        const slots = ['weapon', 'armor', 'accessory'];
        slots.forEach(type => {
            const el = document.getElementById(`profile-slot-${type}`);
            if(!el) return;
            
            // 대문자로 시작하는 타입 이름 (Weapon, Armor, Accessory)
            const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
            const itemId = GameState[`equipped${typeCapitalized}`]; // GameState.equippedWeapon 등

            if(itemId && GameData.items[itemId]) {
                const item = GameData.items[itemId];
                let rarityClass = "border-slate-600 bg-slate-800";
                
                if(item.rarity === 'legendary') rarityClass = "rarity-legendary";
                else if(item.rarity === 'epic') rarityClass = "rarity-epic";
                else if(item.rarity === 'rare') rarityClass = "rarity-rare";
                else if(item.rarity === 'mythic') rarityClass = "rarity-mythic animate-pulse";

                const level = GameState.itemUpgrades[itemId] || 0;

                el.className = `w-[30%] aspect-square rounded-lg flex flex-col items-center justify-center relative cursor-pointer hover:scale-105 transition-transform border-2 ${rarityClass}`;
                el.innerHTML = `
                    <div class="text-2xl filter drop-shadow-md">${item.emoji}</div>
                    <div class="absolute -top-1 -right-1 bg-slate-900 border border-slate-500 rounded-full w-4 h-4 flex items-center justify-center text-[8px] shadow-md">🔍</div>
                    <div class="absolute bottom-0 w-full bg-black/60 text-white text-[9px] text-center font-bold rounded-b-lg py-0.5 truncate px-1">Lv.${level}</div>
                `;
                el.onclick = () => UIManager.openStatsModal(); 
            } else {
                const typeName = type === 'weapon' ? '무기' : type === 'armor' ? '방어구' : '장신구';
                el.className = "w-[30%] aspect-square rounded-lg border border-slate-600 bg-slate-800 flex flex-col items-center justify-center relative opacity-50";
                el.innerHTML = `<span class="text-[9px] text-slate-500 font-bold">${typeName}</span>`;
                el.onclick = null;
            }
        });
    },

   // ✍️ 3단계용! 한 줄 소개 수정 스위치
    editStatusMessage() {
        const currentMsg = GameState.statusMessage || "";
        const newMsg = prompt("프로필에 표시할 한 줄 소개를 입력하세요 (최대 20자):", currentMsg);
        
        if (newMsg !== null) {
            GameState.statusMessage = newMsg.substring(0, 20); 
            GameState.save();
            this.updateProfileUI(); 
            // 🌟 여기서만 안전하게 서버로 전송!
            if (window.GameSystem && GameSystem.Profile) GameSystem.Profile.syncToServer(); 
            UIManager.showToast("✍️ 한 줄 소개가 멋지게 변경되었습니다!");
        }
    },
    
  applyAvatarSkin() {
        const skinId = GameState.equippedSkin;
        let borderClass = 'bg-gradient-to-tr from-slate-600 to-slate-400 border border-slate-600'; 
        
        if (skinId && window.GameData && GameData.cosmetics && GameData.cosmetics.borders) {
            const borderItem = GameData.cosmetics.borders.find(b => b.id === skinId);
            if (borderItem) borderClass = `bg-slate-800 ${borderItem.cssClass}`; 
        }

        const profileId = GameState.equippedProfile;
        let innerIcon = GameState.nickname === "위대한 길드장" ? "M" : GameState.nickname.charAt(0); 
        
        if (profileId && window.GameData && GameData.cosmetics && GameData.cosmetics.profiles) {
            const profileItem = GameData.cosmetics.profiles.find(p => p.id === profileId);
            if (profileItem) innerIcon = profileItem.icon;
        }

        // 🚨 [핵심 방어막] 내 정보창의 메인 프사(#profile-big-icon)는 절대로 건드리지 마!
        const avatars = document.querySelectorAll('.master-avatar:not(#profile-big-icon):not(#target-user-avatar)');
        avatars.forEach(a => {
            a.className = `master-avatar rounded-full flex-shrink-0 flex items-center justify-center font-black text-white transition-all w-10 h-10 text-xl ${borderClass}`;
            a.innerHTML = innerIcon; 
        });
        
        if (document.getElementById('screen-profile').classList.contains('active')) {
            this.updateProfileUI();
        }
    },
    
   // 🌟 [수정됨] 장비 탭 렌더링 (강화 수치 표시 및 뻥튀기 스탯 적용!)
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
            if(!item || item.type === 'skin') continue; 
            
            let isEquipped = false;
            if (item.subType === 'weapon' && GameState.equippedWeapon === id) isEquipped = true;
            if (item.subType === 'armor' && GameState.equippedArmor === id) isEquipped = true;
            if (item.subType === 'accessory' && GameState.equippedAccessory === id) isEquipped = true;
            
            // 💡 [핵심 계산기] 이 장비가 몇 강인지 확인하고 배율 계산!
            const level = GameState.itemUpgrades[id] || 0;
            const upgMult = 1.0 + (level * 0.1); // 1강이면 1.1배, 2강이면 1.2배!

            const badgeHTML = isEquipped ? `<div class="item-equipped-badge text-[8px] tracking-wider z-10">장착중</div>` : '';
            const countHTML = count > 1 ? `<div class="absolute bottom-1 right-2 text-[10px] text-slate-400 font-bold z-10">x${count}</div>` : '';
            
            // 💡 이름 앞에 붙여줄 +1, +2 텍스트
            const levelText = level > 0 ? `<span class="text-purple-300 font-black mr-0.5">+${level}</span>` : '';
            
            // 💡 스탯 텍스트 출력 시 강화 배율(upgMult)을 곱하고, toFixed(1)로 소수점 1자리 자르기!
            let effectText = '';
            if (item.atkMult) effectText += `<span class="text-[9px] text-red-400 font-bold leading-none">공격력 +${Math.round((item.atkMult - 1)*100 * upgMult)}%</span>`;
            if (item.hpMult) effectText += `<span class="text-[9px] text-emerald-400 font-bold leading-none">체력 +${Math.round((item.hpMult - 1)*100 * upgMult)}%</span>`;
            if (item.critRate) effectText += `<span class="text-[9px] text-purple-400 font-bold leading-none">크리티컬 +${(item.critRate * upgMult).toFixed(1)}%</span>`;
            if (item.critDmg) effectText += `<span class="text-[9px] text-pink-400 font-bold leading-none">크리데미지 +${(item.critDmg * upgMult).toFixed(1)}%</span>`;
            if (item.vamp) effectText += `<span class="text-[9px] text-rose-500 font-bold leading-none">피흡 +${(item.vamp * upgMult).toFixed(1)}%</span>`;
            if (item.spd) effectText += `<span class="text-[9px] text-yellow-400 font-bold leading-none">공속 +${(item.spd * upgMult).toFixed(1)}%</span>`;
            if (item.eva) effectText += `<span class="text-[9px] text-teal-400 font-bold leading-none">회피 +${(item.eva * upgMult).toFixed(1)}%</span>`;
            if (item.def) effectText += `<span class="text-[9px] text-blue-400 font-bold leading-none">방어력 +${Math.floor(item.def * upgMult)}</span>`;
            
            const card = `
                <div onclick="GameSystem.Lobby.handleItemClick('${id}')" class="item-card rarity-${item.rarity} ${isEquipped ? 'equipped' : ''} relative flex flex-col justify-center items-center py-2 h-[140px] !important">
                    ${badgeHTML}
                    <div class="text-3xl mb-1 filter drop-shadow-md flex-shrink-0">${item.emoji}</div>
                    <h4 class="text-white font-bold text-[10px] text-center break-keep leading-tight min-h-[24px] flex items-center mb-1">${levelText}${item.name}</h4>
                    
                    <div class="flex flex-col items-center gap-[2px]">
                        ${effectText}
                    </div>
                    
                    ${countHTML}
                </div>
            `;
            
            groupedCards[item.subType].push(card);
            hasGear = true; 
        }

        // 장비 분류 렌더링
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
        
        const isGearTab = !document.getElementById('inv-tab-gear').classList.contains('text-slate-400');
        if (isGearTab && !hasGear) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
        
       // 내 정보 상단 전투력/생존력 업데이트 (태그가 삭제되었으므로 안전장치 추가!)
        const stats = GameState.getTotalStats(); 
        if (document.getElementById('profile-total-power')) document.getElementById('profile-total-power').innerText = stats.atk.toLocaleString(); 
        if (document.getElementById('profile-total-hp')) document.getElementById('profile-total-hp').innerText = stats.hp.toLocaleString();
        
     // 🌟 내 정보 탭의 장비 슬롯 업데이트 (새로운 프로필 UI 엔진으로 연결!)
        this.updateProfileEquipmentSlots();
        
    }, // <-- renderInventory 끝나는 괄호

    // ... (기존 renderInventory 끝나는 부분 아래) ...

    // 🌟 1. 치장품 서브 탭을 관리하는 변수 (기본값: 프로필)
    currentCosmeticTab: 'profile',

    // 🌟 2. 서브 탭을 누를 때마다 버튼 색상을 바꾸고 화면을 다시 그리는 마법!
    switchCosmeticTab(tab) {
        if(AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
        this.currentCosmeticTab = tab;
        
        const tabs = ['profile', 'border', 'bg', 'bubble', 'title'];
        tabs.forEach(t => {
            const btn = document.getElementById(`cos-tab-${t}`);
            if (btn) {
                if (t === tab) btn.className = "flex-1 py-1.5 bg-slate-600 text-white font-bold rounded shadow-inner border border-slate-500 text-[10px] transition-all";
                else btn.className = "flex-1 py-1.5 bg-transparent text-slate-400 hover:text-slate-200 font-bold rounded border border-transparent text-[10px] transition-all";
            }
        });
        
        this.renderCosmeticsShop();
    },

   // 🌟 [업그레이드] 치장품 상점 렌더링 엔진! (기본 항목 자동 생성 기능 탑재)
    renderCosmeticsShop() {
        const container = document.getElementById('cosmetics-list-container');
        if(!container) return;

        if(!GameState.ownedCosmetics) GameState.ownedCosmetics = [];
        let html = '';
        
        // 1️⃣ 현재 선택된 탭에 맞는 데이터와 '기본(Default)' 아이템을 준비합니다!
        let currentItems = [];
        let defaultItem = null;
        let myIcon = GameState.nickname === "위대한 길드장" ? "M" : GameState.nickname.charAt(0);

        if (window.GameData && GameData.cosmetics) {
            if (this.currentCosmeticTab === 'profile') {
                currentItems = GameData.cosmetics.profiles || [];
                defaultItem = { id: 'default', name: '기본 프로필', desc: '내 닉네임 첫 글자', type: 'profile', isDefault: true, iconHtml: `<div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl font-black text-white border border-slate-500 shadow-inner">${myIcon}</div>` };
            } else if (this.currentCosmeticTab === 'border') {
                currentItems = GameData.cosmetics.borders || [];
                defaultItem = { id: 'default', name: '기본 테두리', desc: '심플하고 깔끔한 기본 테두리', type: 'border', isDefault: true, iconHtml: `<div class="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white bg-gradient-to-tr from-slate-600 to-slate-400 border border-slate-600">M</div>` };
            } else if (this.currentCosmeticTab === 'bg') {
                currentItems = GameData.cosmetics.backgrounds || [];
                defaultItem = { id: 'default', name: '기본 로비 배경', desc: '보랏빛 우주의 심연', type: 'bg', isDefault: true, iconHtml: `<div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl border border-slate-600 shadow-inner">🌌</div>` };
            } else if (this.currentCosmeticTab === 'bubble') {
                currentItems = GameData.cosmetics.bubbles || [];
                defaultItem = { id: 'default', name: '기본 말풍선', desc: '가장 익숙한 기본 말풍선', type: 'bubble', isDefault: true, iconHtml: `<div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl border border-slate-600 shadow-inner">💬</div>` };
            } else if (this.currentCosmeticTab === 'title') {
                currentItems = GameData.cosmetics.titles || [];
                defaultItem = { id: 'default', name: '칭호 숨기기', desc: '머리 위를 깔끔하게 비웁니다', type: 'title', isDefault: true, iconHtml: `<div class="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-xl border border-slate-600 shadow-inner">➖</div>` };
            }
        }

        // 2️⃣ 리스트 맨 앞에 '기본' 아이템을 쏙 끼워 넣습니다.
        let renderList = [];
        if (defaultItem) renderList.push(defaultItem);
        renderList = renderList.concat(currentItems);

        // 3️⃣ 리스트를 화면에 예쁘게 그립니다.
        renderList.forEach(item => {
            // '기본' 아이템은 무조건 보유(Owned)한 것으로 처리!
            const isOwned = item.isDefault ? true : GameState.ownedCosmetics.includes(item.id);

            let isEquipped = false;
            // 💡 장착한 게 없으면(null) 자동으로 '기본' 아이템이 장착 중인 것으로 표시!
            if(item.type === 'border' && (GameState.equippedSkin === item.id || (item.isDefault && !GameState.equippedSkin))) isEquipped = true;
            if(item.type === 'bg' && (GameState.equippedBg === item.id || (item.isDefault && !GameState.equippedBg))) isEquipped = true;
            if(item.type === 'bubble' && (GameState.equippedBubble === item.id || (item.isDefault && !GameState.equippedBubble))) isEquipped = true;
            if(item.type === 'profile' && (GameState.equippedProfile === item.id || (item.isDefault && !GameState.equippedProfile))) isEquipped = true;
            if(item.type === 'title' && (GameState.equippedTitle === item.id || (item.isDefault && !GameState.equippedTitle))) isEquipped = true;

           let btnHtml = '';
            if (isEquipped) {
                btnHtml = `<button disabled class="px-3 py-1.5 bg-slate-700 text-slate-400 text-[10px] font-bold rounded shadow-inner border border-slate-600 w-[65px]">장착중</button>`;
            } else if (isOwned) {
                btnHtml = `<button onclick="UIManager.equipCosmetic('${item.id}', '${item.type}')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded shadow transition-all border border-indigo-400 w-[65px]">장착하기</button>`;
            } else {
                // 👇 [추가됨] 칭호는 돈 주고 사는 게 아니라 해금하는 거니까 자물쇠로 잠가둡니다!
                if (item.type === 'title') {
                    btnHtml = `<button disabled class="px-3 py-1.5 bg-slate-800 text-slate-500 text-[10px] font-bold rounded shadow-inner border border-slate-700 w-[65px]">🔒 미해금</button>`;
                } else {
                    btnHtml = `<button onclick="UIManager.buyCosmetic('${item.id}', ${item.price})" class="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-[10px] font-bold rounded shadow transition-all flex items-center justify-center gap-1 border border-pink-400 active:scale-95 w-[65px]">💎 ${item.price}</button>`;
                }
            }

          // 🌟 [미리보기 대격변] 텍스트 이모티콘을 버리고 실제 이미지를 렌더링합니다!
            let finalIconHtml = item.iconHtml;
            if (!finalIconHtml) {
                if(item.type === 'border') {
                    // 1. 테두리: '현재 내가 끼고 있는 프로필 아이콘'에 테두리를 직접 씌워서 보여줌!
                    let displayIcon = myIcon;
                    if (GameState.equippedProfile && GameState.equippedProfile !== 'none' && GameState.equippedProfile !== 'default') {
                        const pfItem = GameData.cosmetics.profiles?.find(p => p.id === GameState.equippedProfile);
                        if (pfItem) displayIcon = pfItem.icon;
                    }
                    finalIconHtml = `<div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl font-black text-white flex-shrink-0 ${item.cssClass}">${displayIcon}</div>`;
                
                } else if (item.type === 'bg') {
                    // 2. 배경화면: 진짜 맵 이미지를 축소해서 액자(썸네일)처럼 보여줌!
                    finalIconHtml = `<div class="w-10 h-10 rounded-lg border border-slate-500 shadow-inner flex-shrink-0 bg-cover bg-center" style="background-image: url('assets/backgrounds/${item.img}')"></div>`;
                
                } else if (item.type === 'bubble') {
                    // 3. 말풍선: 황금빛 등 실제 그라데이션/색상이 들어간 미니 말풍선을 그려줌!
                    finalIconHtml = `<div class="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800/50 border border-slate-600 flex-shrink-0"><div class="${item.bgClass} text-[7px] px-1.5 py-1 rounded-xl rounded-tr-sm shadow-sm">미리보기</div></div>`;
                
                } else if (item.type === 'profile') {
                    // 4. 프로필: 해골, 고양이 등 진짜 아이콘 렌더링!
                    finalIconHtml = `<div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-2xl border border-slate-500 shadow-inner flex-shrink-0">${item.icon}</div>`;
                
                } else if (item.type === 'title') {
                    // 5. 칭호: 미니 붉은색 뱃지로 직업 이름(MBTI)을 예쁘게 표시!
                    finalIconHtml = `<div class="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-600 flex-shrink-0"><div class="px-1 py-0.5 rounded bg-red-900/40 border border-red-500/50 text-red-400 text-[6px] font-black uppercase drop-shadow-md tracking-wider">${item.reqMbti}</div></div>`;
                }
            }

            html += `
                <div class="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 shadow-sm mt-2 hover:bg-slate-800 transition-colors">
                    <div class="flex items-center gap-3">
                        ${finalIconHtml}
                        <div class="flex flex-col">
                            <span class="text-white font-bold text-[11px]">${item.name}</span>
                            <span class="text-slate-400 text-[9px] mt-0.5 break-keep">${item.desc}</span>
                        </div>
                    </div>
                    <div class="flex-shrink-0">
                        ${btnHtml}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // 💸 구매 로직
    // ... (이 아래로 buyCosmetic, equipCosmetic 등은 기존 그대로 유지!) ...

    // 💸 구매 로직
    buyCosmetic(id, price) {
        if (GameState.gem < price) {
            this.showToast("💎 젬이 부족합니다!");
            this.triggerHaptic();
            return;
        }
        if (confirm(`💎 ${price} 젬을 사용하여 구매하시겠습니까?`)) {
            GameState.gem -= price;
            if(!GameState.ownedCosmetics) GameState.ownedCosmetics = [];
            GameState.ownedCosmetics.push(id);
            GameState.save();
            this.updateCurrencyUI();
            this.showToast("✨ 구매 완료! 이제 장착할 수 있습니다.");
            this.renderCosmeticsShop();
            this.triggerHeavyHaptic();
        }
    },

  // 👗 장착 로직 (기본 아이템 선택 시 해제 효과 발동!)
    equipCosmetic(id, type) {
        // 아이디가 'default'라면 장착 해제(null) 처리합니다!
        const isDefault = (id === 'default');

        if (type === 'border') GameState.equippedSkin = isDefault ? null : id;
        if (type === 'bg') GameState.equippedBg = isDefault ? null : id;
        if (type === 'bubble') GameState.equippedBubble = isDefault ? null : id;
        if (type === 'profile') GameState.equippedProfile = isDefault ? null : id;
        if (type === 'title') GameState.equippedTitle = isDefault ? null : id;
        
        GameState.save();
        this.showToast(isDefault ? "✨ 기본 상태로 변경되었습니다." : "✅ 장착되었습니다!");
        
        // 화면 즉시 반영!
      if (type === 'border' || type === 'profile') {
    this.applyAvatarSkin();
    if (window.GameSystem && GameSystem.Ranking && GameSystem.Ranking.updateRankingSilently) GameSystem.Ranking.updateRankingSilently();
}
        if (type === 'bg' && window.GameSystem && GameSystem.Lobby && GameSystem.Lobby.applyBackground) {
             GameSystem.Lobby.applyBackground(); 
        }
        
        // 👇 [여기가 빠져있었습니다!] 칭호를 꼈을 때 내 정보 창(UI)을 즉시 새로고침하는 마법!
      if (type === 'title') {
            this.updateRpgLobbyUI(); 
            if (window.GameSystem && GameSystem.Ranking && GameSystem.Ranking.updateRankingSilently) GameSystem.Ranking.updateRankingSilently();
        }
        
        this.renderCosmeticsShop();
        this.updateProfileUI(); // 🌟 [여기 추가!] 치장품 끼면 프로필 창 즉시 새로고침!
        if (window.GameSystem && GameSystem.Profile) GameSystem.Profile.syncToServer(); // 🌟 치장품 바꿨을 때만 서버 전송!
        this.triggerHaptic();
    },

    // 👕 장착 해제 로직
    unequipCosmetic(id, type) {
        if (type === 'border' && GameState.equippedSkin === id) GameState.equippedSkin = null;
        if (type === 'bg' && GameState.equippedBg === id) GameState.equippedBg = null;
        if (type === 'bubble' && GameState.equippedBubble === id) GameState.equippedBubble = null;
        if (type === 'profile' && GameState.equippedProfile === id) GameState.equippedProfile = null; // 👈 추가!
        
        GameState.save();
        this.showToast("❌ 장착 해제되었습니다.");
        
      if (type === 'border' || type === 'profile') { // 👈 프로필도 묶어줌!
            this.applyAvatarSkin();
            if (window.GameSystem && GameSystem.Ranking) GameSystem.Ranking.updateMyRanking();
        }
       if (type === 'bg' && window.GameSystem && GameSystem.Lobby && GameSystem.Lobby.applyBackground) {
             GameSystem.Lobby.applyBackground(); 
        }
        
        this.renderCosmeticsShop();
        this.updateProfileUI(); // 🌟 [여기 추가!] 치장품 빼도 프로필 창 즉시 새로고침!
        if (window.GameSystem && GameSystem.Profile) GameSystem.Profile.syncToServer(); // 🌟 치장품 바꿨을 때만 서버 전송!
        this.triggerHaptic();
    },
// =========================================================================
    // 🌟 [신규 추가] 가챠샵 슬라이딩 배너 모터
    // =========================================================================
    GachaSlider: {
        currentIndex: 0,
        totalSlides: 3, 
        intervalId: null,
        startX: 0,
        endX: 0,

        init() {
            this.track = document.getElementById('gacha-slide-track');
            this.container = document.getElementById('gacha-slider-container');
            this.dots = document.getElementById('gacha-slider-dots')?.children;
            if (!this.track || !this.container) return;

            // 모바일 터치(스와이프) 이벤트
            this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e), {passive: true});
            this.container.addEventListener('touchmove', (e) => this.handleTouchMove(e), {passive: true});
            this.container.addEventListener('touchend', () => this.handleTouchEnd());
            
            // PC 마우스 드래그 이벤트
            this.container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.container.addEventListener('mouseup', () => this.handleMouseUp());
            this.container.addEventListener('mouseleave', () => { this.isDragging = false; this.startAuto(); });

            this.startAuto();
        },

        updateUI() {
            if (!this.track) return;
            // 기차를 옆으로 스으윽 밀기
            this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
            
            // 하단 점(인디케이터) 모양 바꾸기
            if (this.dots) {
                Array.from(this.dots).forEach((dot, idx) => {
                    if (idx === this.currentIndex) {
                        dot.className = "w-4 h-2 rounded-full bg-white transition-all shadow-md"; 
                    } else {
                        dot.className = "w-2 h-2 rounded-full bg-white/40 transition-all shadow-md"; 
                    }
                });
            }
        },

        next() {
            this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
            this.updateUI();
        },

        prev() {
            this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
            this.updateUI();
        },

        startAuto() {
            this.stopAuto();
            this.intervalId = setInterval(() => this.next(), 5000); // 5초마다 휙!
        },

        stopAuto() {
            if (this.intervalId) clearInterval(this.intervalId);
        },

        handleTouchStart(e) { this.startX = e.touches[0].clientX; this.stopAuto(); },
        handleTouchMove(e) { this.endX = e.touches[0].clientX; },
        handleTouchEnd() {
            if (!this.startX || !this.endX) return;
            const diff = this.startX - this.endX;
            if (diff > 50) this.next(); 
            else if (diff < -50) this.prev(); 
            this.startX = 0; this.endX = 0;
            this.startAuto();
        },
        handleMouseDown(e) { this.startX = e.clientX; this.isDragging = true; this.stopAuto(); },
        handleMouseMove(e) { if(this.isDragging) this.endX = e.clientX; },
        handleMouseUp() {
            if(!this.isDragging || !this.startX || !this.endX) { this.isDragging = false; return; }
            const diff = this.startX - this.endX;
            if (diff > 50) this.next(); 
            else if (diff < -50) this.prev(); 
            this.isDragging = false; this.startX = 0; this.endX = 0;
            this.startAuto();
        }
    },
    // 🌌 원래 있던 백그라운드 함수 부활!
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
}; // <-- 이게 진짜 UIManager를 닫는 마지막 괄호입니다!







