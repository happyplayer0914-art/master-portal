// ========================================================================
// 4. UI MANAGER
// ========================================================================
const UIManager = {

    // UIManager 객체 안에 추가하세요!
    
    // 💡 [호출 연결용] index.html의 버튼이 이 함수를 부릅니다!
    openStickerMode() {
        this.StickerEngine.openMode();
    },

    // =========================================================================
    // 🎨 [신규 코어] 프로필 다이어리 꾸미기 (스티커 터치 & 드래그 엔진)
    // =========================================================================
    StickerEngine: {
        activeStickers: [],
        selectedUid: null,
        maxStickers: 5,
        isEditMode: false,

        init() {
            // 로딩 시 저장된 스티커 정보 불러오기
            if (!GameState.profileStickers) GameState.profileStickers = [];
            this.activeStickers = JSON.parse(JSON.stringify(GameState.profileStickers));
            this.refreshCanvas();
        },

       openMode() {
            this.isEditMode = true;
            
            // 🚨 [모바일 스크롤 완벽 차단] 꾸미기 모드일 땐 화면을 강제로 얼려버립니다!
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            
            // 도화지 터치 활성화 + 레이어를 UI(z-20) 위로 뚫고 나오게 확 끌어올리기 (z-50)
            const canvas = document.getElementById('profile-sticker-canvas');
            if (canvas) {
                canvas.classList.remove('pointer-events-none', 'z-10');
                canvas.classList.add('pointer-events-auto', 'z-50'); 
            }
            
            // 상단 저장 버튼 바 표시
            const controls = document.getElementById('sticker-edit-controls');
            if (controls) {
                controls.classList.remove('opacity-0', 'pointer-events-none');
                controls.classList.add('opacity-100', 'pointer-events-auto');
            }
            
            this.refreshCanvas();
            UIManager.showToast("🎨 꾸미기 모드 시작! 스티커를 움직여보세요.");
        },

        saveAndClose() {
            this.isEditMode = false;
            this.selectedUid = null;

            // 🟢 [모바일 스크롤 원상 복구] 꾸미기가 끝나면 다시 화면 스크롤을 풀어줍니다!
            document.body.style.overflow = '';
            document.body.style.touchAction = '';

            // 도화지 터치 비활성화 + 레이어를 다시 예쁘게 UI 아래로 쏙 집어넣기 (z-10)
            const canvas = document.getElementById('profile-sticker-canvas');
            if (canvas) {
                canvas.classList.remove('pointer-events-auto', 'z-50');
                canvas.classList.add('pointer-events-none', 'z-10'); 
            }
            
            // 상단 컨트롤 바 숨기기
            const controls = document.getElementById('sticker-edit-controls');
            if (controls) {
                controls.classList.remove('opacity-100', 'pointer-events-auto');
                controls.classList.add('opacity-0', 'pointer-events-none');
            }
            
            // GameState에 결과 굽기
            GameState.profileStickers = JSON.parse(JSON.stringify(this.activeStickers));
            GameState.save();
            
            // 서버 연동
            if (window.GameSystem && GameSystem.Profile) GameSystem.Profile.syncToServer();
            
            this.refreshCanvas();
            UIManager.showToast("✅ 나만의 프로필이 저장되었습니다!");
            if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.equip();
            UIManager.triggerHeavyHaptic();
        },

        openDrawer() {
            if (this.activeStickers.length >= this.maxStickers) {
                UIManager.triggerHaptic();
                return UIManager.showToast(`🚨 스티커는 최대 ${this.maxStickers}개까지만 붙일 수 있어요!`);
            }
            
            const modal = document.getElementById('sticker-drawer-modal');
            const content = document.getElementById('sticker-drawer-content');
            modal.classList.remove('opacity-0', 'pointer-events-none');
            content.classList.remove('translate-y-full');
            
            if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
            this.renderDrawerList();
        },

        closeDrawer() {
            const modal = document.getElementById('sticker-drawer-modal');
            const content = document.getElementById('sticker-drawer-content');
            content.classList.add('translate-y-full');
            setTimeout(() => modal.classList.add('opacity-0', 'pointer-events-none'), 300);
            if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
        },

        renderDrawerList() {
            const container = document.getElementById('sticker-list-container');
            container.innerHTML = '';
            
            // 파트너 중복 제거 후 리스트 뽑기
            const uniquePartners = [...new Set(GameState.ownedPartners || [])];
            
            if (uniquePartners.length === 0) {
                container.innerHTML = '<div class="col-span-3 sm:col-span-4 text-center text-slate-500 py-10 text-xs font-bold">보유한 파트너가 없습니다.</div>';
                return;
            }

            let html = '';
            uniquePartners.forEach(pid => {
                const pt = GameData.partners[pid];
                if (!pt) return;
                
               // 💡 [수정] pt.name을 넣어서 파트너의 진짜 이름이 나오게 바꿨습니다!
                if (pt.img_sd) html += this.createDrawerItemHTML(pid, pt, 'sd', pt.img_sd, `${pt.name} (SD)`);
                
                if (pt.img_full) html += this.createDrawerItemHTML(pid, pt, 'full', pt.img_full, `${pt.name} (전신)`);
                
                if (pt.rarity === 'mythic' && pt.img_gif) {
                    const affLv = GameState.partnerAffectionLevel[pid] || 1;
                    if (affLv >= 10) {
                        html += this.createDrawerItemHTML(pid, pt, 'gif', pt.img_gif, `✨${pt.name} (라이브)`);
                    }
                }
            });
            container.innerHTML = html;
        },

        createDrawerItemHTML(pid, pt, type, imgFile, label) {
            let rarityBorder = "border-slate-600";
            if (pt.rarity === 'mythic') rarityBorder = "border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]";
            else if (pt.rarity === 'legendary') rarityBorder = "border-yellow-500/50";

            return `
                <div onclick="UIManager.StickerEngine.addSticker('${pid}', '${type}', '${imgFile}')" class="bg-slate-800 border ${rarityBorder} rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700 transition-all active:scale-95 h-28 relative overflow-hidden group">
                    <img src="assets/partners/${imgFile}" class="w-[80%] h-[70%] object-contain mb-1 filter drop-shadow-md group-hover:scale-110 transition-transform">
                    <span class="text-[9px] text-white font-bold bg-black/60 px-2 py-0.5 rounded-full absolute bottom-2 tracking-tighter">${label}</span>
                </div>
            `;
        },

       addSticker(pid, type, imgFile) {
            this.closeDrawer();
            
            const newSticker = {
                uid: 'stk_' + Date.now() + Math.floor(Math.random() * 1000),
                id: pid,
                type: type,
                imgFile: imgFile,
                x: 50, 
                y: 50,
                scale: 1.0,
                rotation: 0, // ✨ 신규: 회전값 저장소 추가!
                flip: false
            };
            
            this.activeStickers.push(newSticker);
            this.selectedUid = newSticker.uid;
            this.refreshCanvas();
            
            if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.equip();
            UIManager.triggerHaptic();
        },

        removeSticker(uid) {
            this.activeStickers = this.activeStickers.filter(s => s.uid !== uid);
            this.selectedUid = null;
            this.refreshCanvas();
            if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.hit_player();
            UIManager.triggerHaptic();
        },

       toggleFlip(uid) {
            const stk = this.activeStickers.find(s => s.uid === uid);
            if (stk) {
                stk.flip = !stk.flip;
                this.refreshCanvas();
                if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
            }
        },

        // 🌟 [신규 코어] 수평 꽉 잡아주는 엔진! (크기는 보존)
        resetRotation(uid) {
            const stk = this.activeStickers.find(s => s.uid === uid);
            if (stk) {
                // 회전 각도만 0으로 초기화! (크기(scale)와 위치(x, y)는 건드리지 않음)
                stk.rotation = 0;
                
                // 화면 즉시 갱신
                this.refreshCanvas();
                
                // 경쾌한 클릭음과 진동으로 사용자에게 피드백!
                if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.equip();
                if(window.UIManager && UIManager.triggerHaptic) UIManager.triggerHaptic();
            }
        },

       // 🎨 캔버스 그리기 함수
        refreshCanvas() {
            const canvas = document.getElementById('profile-sticker-canvas');
            if (!canvas) return;
            canvas.innerHTML = '';

            this.activeStickers.forEach(stk => {
                stk.rotation = stk.rotation || 0; 

                const el = document.createElement('div');
                el.className = `absolute inline-block origin-center select-none ${this.isEditMode ? 'pointer-events-auto' : 'pointer-events-none'}`;
                
                el.style.left = `${stk.x}%`;
                el.style.top = `${stk.y}%`;
                el.style.transform = `translate(-50%, -50%) rotate(${stk.rotation}deg) scale(${stk.scale})`;
                
                const isSelected = this.isEditMode && this.selectedUid === stk.uid;
                
                // 🚨 [여기 수정!!] 클래스에 max-w-none 을 추가해서 오른쪽 벽에 닿아도 찌그러지지 않게 만듭니다!
                let contentHtml = `<img src="assets/partners/${stk.imgFile}" draggable="false" class="w-32 h-32 sm:w-40 sm:h-40 max-w-none object-contain filter drop-shadow-2xl pointer-events-none ${stk.flip ? '-scale-x-100' : ''}">`;
                
                if (this.isEditMode) {
                    const borderClass = isSelected ? 'border-2 border-dashed border-indigo-400 bg-indigo-500/20' : 'border-2 border-transparent hover:border-white/30';
                    
                  let controlsHtml = '';
                    if (isSelected) {
                        // 🚨 [터치 버그 수정 및 수평 버튼 추가]
                        controlsHtml = `
                            <!-- 우측 상단: 삭제 버튼 (X) -->
                            <div class="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-black shadow-lg cursor-pointer z-50 border-2 border-white" onclick="UIManager.StickerEngine.removeSticker('${stk.uid}'); event.stopPropagation();">&times;</div>
                            
                            <!-- 좌측 하단: 좌우 반전 버튼 (⇄) -->
                            <div class="absolute -bottom-3 -left-3 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-black shadow-lg cursor-pointer z-50 border-2 border-white" onclick="UIManager.StickerEngine.toggleFlip('${stk.uid}'); event.stopPropagation();">⇄</div>
                            
                            <!-- 우측 하단: 크기 조절/회전 버튼 (⤡) -->
                            <div class="absolute -bottom-3 -right-3 bg-emerald-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-black shadow-lg cursor-pointer z-50 border-2 border-white resize-handle" data-uid="${stk.uid}">⤡</div>

                            <!-- 🌟 신규! 좌측 상단: 수평 맞춤 버튼 (⟲) -->
                            <div class="absolute -top-3 -left-3 bg-[#D4AF37] text-white rounded-full w-7 h-7 flex items-center justify-center text-[10px] font-black shadow-lg cursor-pointer z-50 border-2 border-white group" onclick="UIManager.StickerEngine.resetRotation('${stk.uid}'); event.stopPropagation();">
                                ⟲
                                <!-- 호버 시 나타나는 툴팁 -->
                                <span class="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none transition-opacity">수평</span>
                            </div>
                        `;
                    }

                    el.innerHTML = `
                        <div class="relative ${borderClass} p-2 rounded-xl transition-colors drag-handle cursor-move" data-uid="${stk.uid}">
                            ${controlsHtml}
                            ${contentHtml}
                        </div>
                    `;
                } else {
                    el.innerHTML = contentHtml;
                }
                canvas.appendChild(el);
            });

            if (this.isEditMode) this.attachTouchEvents();
        },

        // 🖐️ 무적의 터치 & 드래그 & 회전 엔진
        touchState: { isDragging: false, isResizing: false, currentUid: null, startX: 0, startY: 0, initX: 0, initY: 0, initScale: 1, initRot: 0, cx: 0, cy: 0, startDist: 0, startAngle: 0 },

        attachTouchEvents() {
            const canvas = document.getElementById('profile-sticker-canvas');
            if (!canvas) return;

            const engine = this; // 이벤트 클로저용

            // 🚨 중복 이벤트 증식을 막기 위해 캔버스와 윈도우 객체에 직접 할당
            canvas.onmousedown = (e) => engine.handleTouchStart(e);
            canvas.ontouchstart = (e) => engine.handleTouchStart(e);
            
            window.onmousemove = (e) => engine.handleTouchMove(e);
            window.ontouchmove = (e) => engine.handleTouchMove(e);
            window.onmouseup = (e) => engine.handleTouchEnd(e);
            window.ontouchend = (e) => engine.handleTouchEnd(e);
        },

        handleTouchStart(e) {
            // 버튼들(x, 좌우반전)을 눌렀을 때는 드래그 로직 무시
            if (e.target.closest('[onclick]')) return;

            const resizeHandle = e.target.closest('.resize-handle');
            const dragHandle = e.target.closest('.drag-handle');
            const coords = (e.touches && e.touches.length > 0) ? e.touches[0] : e;

            if (resizeHandle) {
                this.touchState.isResizing = true;
                this.touchState.currentUid = resizeHandle.getAttribute('data-uid');
            } else if (dragHandle) {
                this.touchState.isDragging = true;
                this.touchState.currentUid = dragHandle.getAttribute('data-uid');
            } else {
                // 빈 공간을 누르면 선택 해제
                this.selectedUid = null;
                this.refreshCanvas();
                return;
            }

            this.selectedUid = this.touchState.currentUid;
            this.refreshCanvas();

            const stk = this.activeStickers.find(s => s.uid === this.touchState.currentUid);
            if (stk) {
                this.touchState.initX = stk.x;
                this.touchState.initY = stk.y;
                this.touchState.initScale = stk.scale;
                this.touchState.initRot = stk.rotation || 0;
                this.touchState.startX = coords.clientX;
                this.touchState.startY = coords.clientY;

                // 🔄 크기 & 회전을 위한 중심점 수학 계산
                if (this.touchState.isResizing) {
                    const dragEl = document.querySelector(`.drag-handle[data-uid="${stk.uid}"]`);
                    if (dragEl) {
                        const rect = dragEl.getBoundingClientRect();
                        this.touchState.cx = rect.left + rect.width / 2;
                        this.touchState.cy = rect.top + rect.height / 2;
                        
                        this.touchState.startDist = Math.hypot(coords.clientX - this.touchState.cx, coords.clientY - this.touchState.cy);
                        this.touchState.startAngle = Math.atan2(coords.clientY - this.touchState.cy, coords.clientX - this.touchState.cx) * (180 / Math.PI);
                    }
                }
            }
        },

        handleTouchMove(e) {
            if (!this.touchState.isDragging && !this.touchState.isResizing) return;
            if (!this.touchState.currentUid) return;

            // 🚨 드래그 중일 때는 모바일 화면 자체가 위아래로 스크롤되는 것을 강제로 막아버립니다!
            if (e.cancelable) e.preventDefault();

            const coords = (e.touches && e.touches.length > 0) ? e.touches[0] : e;
            const stk = this.activeStickers.find(s => s.uid === this.touchState.currentUid);
            if (!stk) return;

            // 이동 (Dragging)
            if (this.touchState.isDragging) {
                const canvas = document.getElementById('profile-sticker-canvas');
                const rect = canvas.getBoundingClientRect();
                const dx = coords.clientX - this.touchState.startX;
                const dy = coords.clientY - this.touchState.startY;
                
                stk.x = this.touchState.initX + (dx / rect.width) * 100;
                stk.y = this.touchState.initY + (dy / rect.height) * 100;

            // 크기 조절 및 회전 (Resizing & Rotating)
            } else if (this.touchState.isResizing) {
                // 1. 크기 (중심점으로부터 멀어진 거리의 비율)
                const currentDist = Math.hypot(coords.clientX - this.touchState.cx, coords.clientY - this.touchState.cy);
                const scaleFactor = currentDist / this.touchState.startDist;
                stk.scale = Math.max(0.3, Math.min(3.5, this.touchState.initScale * scaleFactor));
                
                // 2. 🔄 회전 (처음 잡았을 때의 각도와 현재 손가락 각도의 차이)
                const currentAngle = Math.atan2(coords.clientY - this.touchState.cy, coords.clientX - this.touchState.cx) * (180 / Math.PI);
                const angleDiff = currentAngle - this.touchState.startAngle;
                stk.rotation = this.touchState.initRot + angleDiff;
            }

            // 렌더링 함수를 매번 부르지 않고, DOM을 즉시 업데이트 (버벅임 방지)
            const dragEl = document.querySelector(`.drag-handle[data-uid="${stk.uid}"]`);
            if (dragEl && dragEl.parentElement) {
                dragEl.parentElement.style.left = `${stk.x}%`;
                dragEl.parentElement.style.top = `${stk.y}%`;
                dragEl.parentElement.style.transform = `translate(-50%, -50%) rotate(${stk.rotation}deg) scale(${stk.scale})`;
            }
        },

        handleTouchEnd(e) {
            this.touchState.isDragging = false;
            this.touchState.isResizing = false;
        }
    }, // <-- StickerEngine 객체의 끝!

    // ui.js의 UIManager 안에 추가!
    
    openMailboxModal() {
        if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
        if(window.UIManager && UIManager.triggerHaptic) UIManager.triggerHaptic();
        
        const modal = document.getElementById('mailbox-modal');
        if (modal) {
            modal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
            modal.classList.add('opacity-100', 'pointer-events-auto', 'scale-100', 'active');
            
            // 창을 열 때 우편 목록을 그립니다!
            if (window.GameSystem && GameSystem.Mail) {
                GameSystem.Mail.renderMailList();
            }
        }
    },

    closeMailboxModal() {
        if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
        const modal = document.getElementById('mailbox-modal');
        if (modal) {
            modal.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100', 'active');
            modal.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        }
    },
    
// 🌟 [신규 추가] 천장 게이지 및 버튼 업데이트 엔진
    updateGachaPityUI() {
        if (!GameState.gachaPity) return;
        
        ['gear', 'partner'].forEach(type => {
            const mythicVal = GameState.gachaPity[type].mythic || 0;
            const selectVal = GameState.gachaPity[type].select || 0;
            
            // 200번 천장 (랜덤 확정) 렌더링
            const mythicText = document.getElementById(`pity-${type}-mythic-text`);
            const mythicBar = document.getElementById(`pity-${type}-mythic-bar`);
            const mythicBtn = document.getElementById(`btn-pity-${type}-mythic`);
            
            if (mythicText) mythicText.innerText = mythicVal;
            if (mythicBar) mythicBar.style.width = `${Math.min((mythicVal / 200) * 100, 100)}%`;
            if (mythicBtn) {
                if (mythicVal >= 200) {
                    mythicBtn.disabled = false;
                    mythicBtn.className = "text-[9px] px-2 py-1 rounded bg-pink-600 text-white font-bold animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.8)]";
                } else {
                    mythicBtn.disabled = true;
                    mythicBtn.className = "text-[9px] px-2 py-1 rounded bg-slate-700 text-slate-400 font-bold";
                }
            }

            // 500번 천장 (선택 확정) 렌더링
            const selectText = document.getElementById(`pity-${type}-select-text`);
            const selectBar = document.getElementById(`pity-${type}-select-bar`);
            const selectBtn = document.getElementById(`btn-pity-${type}-select`);
            
            if (selectText) selectText.innerText = selectVal;
            if (selectBar) selectBar.style.width = `${Math.min((selectVal / 10) * 100, 100)}%`;
            if (selectBtn) {
                if (selectVal >= 10) {
                    selectBtn.disabled = false;
                    selectBtn.className = "text-[9px] px-2 py-1 rounded bg-yellow-500 text-slate-900 font-black animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.8)]";
                } else {
                    selectBtn.disabled = true;
                    selectBtn.className = "text-[9px] px-2 py-1 rounded bg-slate-700 text-slate-400 font-bold";
                }
            }
        });
    },
    
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

// 🌟 [진짜 최종] 문법 오류 박멸! 무조건 화면 즉시 렌더링 엔진!
    init() { 
        this.initBackground(); 
        // 🚨 [여기 추가!] 스티커 엔진 셋업!
        if (this.StickerEngine) this.StickerEngine.init();

        // 🚨 1. 게임 켜지자마자 기다리지 않고 무조건 1번 강제 렌더링!
        if (typeof GameState !== 'undefined') {
            if (typeof GameState.load === 'function') GameState.load(); 
            this.updateCurrencyUI(); 
            // 👇 [여기 추가!] 게임 켤 때 천장 게이지도 쫙! 불러와서 그려줍니다.
            if (this.updateGachaPityUI) this.updateGachaPityUI();
            this.applyAvatarSkin(); 
            this.initCheckinButton(); 
            this.updateIdleUI(); 
            if(document.getElementById('profile-nickname-display')) {
                document.getElementById('profile-nickname-display').innerText = GameState.nickname || "마스터"; 
            }
            this.updateRpgLobbyUI();
            this.updateProfileUI();
        }

        // 🚨 2. 혹시 모를 로딩 지연을 대비한 2초 덧칠 엔진! (window. 족쇄 삭제 완!)
        let guardCount = 0;
        const uiGuard = setInterval(() => {
            if (typeof GameState !== 'undefined') {
                this.updateCurrencyUI(); 
                this.applyAvatarSkin(); 
                this.updateRpgLobbyUI();
                this.updateProfileUI();
            }

            guardCount++;
            if (guardCount >= 20) { 
                clearInterval(uiGuard);
            }
        }, 100);

        // 파이어베이스(서버)에서 한줄소개/인기도 땡겨오기
        if (typeof GameSystem !== 'undefined' && GameSystem.Profile && GameSystem.Profile.loadMyProfile) {
            GameSystem.Profile.loadMyProfile();
        }

        if(this.GachaSlider) this.GachaSlider.init();

        // 게임 켤 때 내가 낀 배경화면 불러오기
        setTimeout(() => {
            if (typeof GameSystem !== 'undefined' && GameSystem.Lobby && GameSystem.Lobby.applyBackground) {
                GameSystem.Lobby.applyBackground();
            }
        }, 500);
        
        // 탈주 페널티 로직
        if (localStorage.getItem('master_in_battle') === 'true') {
            localStorage.removeItem('master_in_battle');
            if (typeof GameState !== 'undefined') {
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
            if (typeof GameState !== 'undefined' && GameState.recoverHpOverTime) {
                GameState.recoverHpOverTime();
            }
            const arenaScreen = document.getElementById('screen-arena');
            if (arenaScreen && arenaScreen.classList.contains('active')) {
                this.updateHpRecoveryText();
            }
        }, 1000);
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
    
// =====================================================================
    // 🌸 [진짜 최종 통합] 인벤토리 탭 전환 & UI 스타일 완벽 제어
    // =====================================================================
    switchInvTab(t) {
        // 1. 소리 & 진동 (기존 코드 유지)
        if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click(); 
        if(this.triggerHaptic) this.triggerHaptic();
        
        // 2. [스타일 통일] 버튼 활성화/비활성화 Tailwind 클래스 정의 (CSS 파일 필요 없음!)
        // 💡 17번 사진의 장비(스탯) 버튼 스타일을 그대로 따왔습니다.
        const activeClasses = "flex-1 py-2.5 bg-slate-900 border border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] text-white font-bold rounded-xl text-xs whitespace-nowrap animate-pulse";
        const inactiveClasses = "flex-1 py-2.5 bg-slate-800 border border-slate-700 text-slate-400 font-bold rounded-xl text-xs hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap";
        const forgeActiveClasses = "flex-1 py-2.5 bg-slate-900 border border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-white font-bold rounded-xl text-xs whitespace-nowrap animate-pulse";
        const forgeInactiveClasses = "flex-1 py-2.5 bg-slate-800 border border-slate-700 text-purple-400 font-bold rounded-xl text-xs hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap";

        // 3. 버튼 엘리먼트 가져오기 (HTML IDs 확인 필수!)
        // 🚨 HTML에 이 ID들이 꼭 있어야 작동합니다! (tab-gear, tab-partner, tab-cosmetics, tab-forge)
        const btnGear = document.getElementById('tab-gear'); 
        const btnPartner = document.getElementById('tab-partner'); // 🌸 파트너 버튼 추가!
        const btnCosmetics = document.getElementById('tab-cosmetics');
        const btnForge = document.getElementById('tab-forge'); // 🔨 대장간 버튼 추가!

        // 4. [핵심 로직] 모든 버튼의 스타일을 초기화하고, 선택된 탭만 깜빡이게(animate-pulse) 만듭니다!
        if(btnGear) btnGear.className = (t === 'gear') ? activeClasses : inactiveClasses;
        if(btnPartner) btnPartner.className = (t === 'partner') ? activeClasses : inactiveClasses;
        if(btnCosmetics) btnCosmetics.className = (t === 'cosmetics') ? activeClasses : inactiveClasses;
        
        // 대장간은 색이 좀 다르니까 따로 처리! (기존의 무조건 깜빡임 제거 완료!)
        if(btnForge) btnForge.className = (t === 'forge') ? forgeActiveClasses : forgeInactiveClasses;


        // 5. 패널 엘리먼트 가져오기
        const panelGear = document.getElementById('inv-panel-gear');
        const panelCosmetics = document.getElementById('inv-panel-cosmetics');
        const panelPartner = document.getElementById('inv-panel-partner'); 
        const panelForge = document.getElementById('inv-panel-forge'); // 🔨 대장간 패널 추가!
        const emptyState = document.getElementById('inv-empty-state');
        
        // 6. 모든 패널 싹 다 숨기기 (초기화)
        if(panelGear) panelGear.classList.add('hidden');
        if(panelCosmetics) panelCosmetics.classList.add('hidden');
        if(panelPartner) panelPartner.classList.add('hidden');
        if(panelForge) panelForge.classList.add('hidden'); // 🔨 대장간 숨기기
        if(emptyState) emptyState.classList.add('hidden');

        // 7. 누른 탭에 맞는 패널만 열고 내용물 그리기!
        if (t === 'gear') {
            if(panelGear) panelGear.classList.remove('hidden');
            if(this.renderInventory) this.renderInventory();
        } else if (t === 'cosmetics') {
            if(panelCosmetics) panelCosmetics.classList.remove('hidden');
            if(this.renderCosmeticsShop) this.renderCosmeticsShop();
        } else if (t === 'partner') {
            if(panelPartner) panelPartner.classList.remove('hidden');
            if(this.renderPartnerInventory) this.renderPartnerInventory();
        } else if (t === 'forge') {
            // 🔨 대장간 패널 열기 로직 추가
            if(panelForge) panelForge.classList.remove('hidden');
            if(this.renderForge) this.renderForge(); 
        }
    },
    // 인벤토리 탭 UI 업데이트 함수
updateTabUI(activeTabName) {
    const tabButtons = {
        'equipment': document.getElementById('tab-equipment'), // 장비(스탯) 버튼
        'partner': document.getElementById('tab-partner'),     // 파트너 버튼
        'forge': document.getElementById('tab-forge'),         // 대장간 버튼
        'cosmetics': document.getElementById('tab-cosmetics')   // 테두리/배경 버튼
    };

    // 1. 모든 버튼에서 '활성화 스타일'과 '깜빡임 애니메이션' 제거 (초기화)
    for (const tab in tabButtons) {
        if (tabButtons[tab]) {
            tabButtons[tab].classList.remove('active-tab', 'animate-pulse');
        }
    }

    // 2. 현재 활성화된 탭 버튼에만 '활성화 스타일'과 '깜빡임 애니메이션' 추가!
    if (tabButtons[activeTabName]) {
        tabButtons[activeTabName].classList.add('active-tab', 'animate-pulse');
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

        document.getElementById('target-user-nickname').innerText = nickname;
        
        // 🌟 1. 타 유저 칭호 디자인 통일
        const titleEl = document.getElementById('target-user-title');
        if (titleEl) {
            titleEl.innerHTML = title && title !== 'undefined' && title !== '' ? title : "✨ 칭호 없음 ✨";
            if (title && title !== 'undefined' && title !== '') {
                titleEl.className = "px-2 py-1 rounded-md bg-red-900/40 border border-red-500/50 text-red-400 font-black text-[10px] tracking-widest uppercase mb-1.5 drop-shadow-md inline-block w-max";
            } else {
                titleEl.className = "text-[9px] text-yellow-300 font-bold mb-1 w-max";
            }
        }

        document.getElementById('target-user-stage').innerText = stage && stage !== 'undefined' ? `${stage}F` : "알 수 없음";
        document.getElementById('target-user-avatar').innerHTML = icon;
        document.getElementById('target-user-avatar').className = `master-avatar w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 relative ${skinClass.replace('bg-slate-700', 'bg-slate-800')}`;
        
        document.getElementById('target-user-uid').innerText = "로딩중...";
        document.getElementById('target-user-status').innerText = "서버에서 정보를 불러오는 중입니다...";
        document.getElementById('target-user-likes').innerText = "0";

        // 🌟 2. 타 유저 랭킹 배지 틀 만들기
        let rankBox = document.getElementById('target-profile-rank-box');
        const uidEl = document.getElementById('target-user-uid');
        if (!rankBox && uidEl && uidEl.parentElement) {
            rankBox = document.createElement('div');
            rankBox.id = 'target-profile-rank-box';
            rankBox.className = 'flex gap-1.5 mt-0.5 mb-1.5';
            uidEl.parentElement.parentNode.insertBefore(rankBox, uidEl.parentElement);
        }
        
        if (rankBox) {
            rankBox.innerHTML = `<span class="bg-indigo-900/60 border border-indigo-500/50 text-indigo-300 px-1.5 py-0.5 rounded text-[9px] font-bold">🏆 탑: 산출중..</span>
                                 <span class="bg-pink-900/60 border border-pink-500/50 text-pink-300 px-1.5 py-0.5 rounded text-[9px] font-bold">💖 인기: 산출중..</span>`;
        }

        const modal = document.getElementById('user-profile-modal');
        if (modal) {
            modal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
            modal.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
        }

        if (window.db) {
            try {
                const userRef = window.doc(window.db, "users", nickname);
                const docSnap = await window.getDoc(userRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    window.currentTargetStats = data.totalStats || null;
                    window.currentTargetName = nickname;
                    
                    document.getElementById('target-user-uid').innerText = data.uid || "0000";
                    document.getElementById('target-user-status').innerText = data.statusMessage || "작성된 소개가 없습니다.";
                    document.getElementById('target-user-likes').innerText = data.likes || 0;
                    
                    const targetPCount = Number(data.prestige) || Number(data.prestigeCount) || 0;
                    const prestigeText = targetPCount > 0 ? `[${targetPCount}환생] ` : "";
                    const displayStage = data.highestStage || stage || 1;
                    document.getElementById('target-user-stage').innerText = `${prestigeText}${displayStage}F`;

                    // 🌟 3. 서버 데이터 기반 타 유저 실제 랭킹 꽂아주기!
                    if (rankBox && window.GameSystem && GameSystem.Profile && GameSystem.Profile.getUserRanks) {
                        GameSystem.Profile.getUserRanks(targetPCount, displayStage, data.likes || 0).then(ranks => {
                            rankBox.innerHTML = `<span class="bg-indigo-900/60 border border-indigo-500/50 text-indigo-300 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm">🏆 탑: ${ranks.tower}위</span>
                                                 <span class="bg-pink-900/60 border border-pink-500/50 text-pink-300 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm">💖 인기: ${ranks.pop}위</span>`;
                        });
                    }
                   
                  // 상대방이 설정한 배경 스킨(bgSkin) 씌워주기
                    const bgEl = document.getElementById('target-profile-bg');
                    if (data.bgSkin && data.bgSkin !== 'none' && data.bgSkin !== 'default' && window.GameData && GameData.cosmetics && GameData.cosmetics.backgrounds) {
                        const bgItem = GameData.cosmetics.backgrounds.find(x => x.id === data.bgSkin);
                        if (bgItem) bgEl.style.backgroundImage = `url('assets/backgrounds/${bgItem.img}')`;
                    } else {
                        bgEl.style.backgroundImage = `url('assets/backgrounds/bg_library.png')`;
                    }
                    
               // 🎨 [신규] 타 유저의 스티커 정보를 불러와서 캔버스에 렌더링!
            const targetCanvas = document.getElementById('target-sticker-canvas');
            if (targetCanvas) {
                targetCanvas.innerHTML = ''; // 초기화
                
                if (data.profileStickers && data.profileStickers.length > 0) {
                    data.profileStickers.forEach(stk => {
                        const el = document.createElement('div');
                        // 남의 프로필이니까 무조건 터치 금지(pointer-events-none)
                        el.className = 'absolute inline-block origin-center pointer-events-none z-10';
                        
                        el.style.left = `${stk.x}%`;
                        el.style.top = `${stk.y}%`;
                        // 회전, 크기 완벽 복제!
                        el.style.transform = `translate(-50%, -50%) rotate(${stk.rotation || 0}deg) scale(${stk.scale})`;

                        el.innerHTML = `<img src="assets/partners/${stk.imgFile}" class="w-32 h-32 sm:w-40 sm:h-40 object-contain filter drop-shadow-2xl ${stk.flip ? '-scale-x-100' : ''}">`;
                        
                        targetCanvas.appendChild(el);
                    });
                }
            }
            // 👆👆👆 교체 끝!! 👆👆👆
                    
         // 상대방 장비 & 파트너 렌더링 엔진
                    const renderTargetSlot = (type, itemId, level) => {
                        const el = document.getElementById(`target-slot-${type}`);
                        if (!el) return;
                     // 🌸 파트너 처리 로직
                        if (type === 'partner') {
                            if (itemId && window.GameData && GameData.partners && GameData.partners[itemId]) {
                                const pt = GameData.partners[itemId];
                                let rarityClass = "border-pink-500/50 bg-pink-900/30";
                                if(pt.rarity === 'mythic') rarityClass = "rarity-mythic animate-pulse";
                                else if(pt.rarity === 'legendary') rarityClass = "rarity-legendary";
                                else if(pt.rarity === 'epic') rarityClass = "rarity-epic";
                                else if(pt.rarity === 'rare') rarityClass = "rarity-rare";

                                el.className = `aspect-square rounded-lg flex flex-col items-center justify-center relative cursor-pointer hover:scale-105 transition-transform border-2 ${rarityClass}`;
                                
                                // 💡 [수정됨] 타 유저 슬롯에도 SD 이미지와 에러 방지 타이머 적용!
                                el.innerHTML = `
                                    <img src="assets/partners/${pt.img_sd}" class="w-8 h-8 object-contain filter drop-shadow-md" onerror="this.style.display='none'; setTimeout(() => { if(this.nextElementSibling) this.nextElementSibling.style.display='block'; }, 10);">
                                    <div style="display:none;" class="text-2xl filter drop-shadow-md">${pt.emoji}</div>
                                    <div class="absolute -top-1 -right-1 bg-pink-900 border border-pink-500 rounded-full w-4 h-4 flex items-center justify-center text-[8px] shadow-md z-10">🔍</div>
                                    <div class="absolute bottom-0 w-full bg-black/60 text-pink-200 text-[9px] text-center font-bold rounded-b-lg py-0.5 truncate px-1 z-10">★${level || 0}</div>
                                `;
                                
                                // 👇 [여기 수정!!] 타 유저 파트너 호감도도 서버에서 땡겨와서 관전 모드로 열어줍니다!
                                const ptAffLv = (data.partnerAffectionLevel && data.partnerAffectionLevel[itemId]) ? data.partnerAffectionLevel[itemId] : 1;
                                el.onclick = () => { UIManager.openDetailCard(itemId, 'partner', true, level || 0, ptAffLv); };
                                
                            } else {
                                el.className = "aspect-square rounded-lg border border-pink-500/30 bg-pink-900/20 flex flex-col items-center justify-center relative opacity-50";
                                el.innerHTML = `<span class="text-[9px] text-pink-400 font-bold">파트너</span>`;
                                el.onclick = null;
                            }
                            return;
                        }

                        // 🗡️ 기존 장비 처리 로직
                        if (itemId && window.GameData && GameData.items[itemId]) {
                            const item = GameData.items[itemId];
                            let rarityClass = "border-slate-600 bg-slate-800";
                            if(item.rarity === 'legendary') rarityClass = "rarity-legendary";
                            else if(item.rarity === 'epic') rarityClass = "rarity-epic";
                            else if(item.rarity === 'rare') rarityClass = "rarity-rare";
                            else if(item.rarity === 'mythic') rarityClass = "rarity-mythic animate-pulse";
                            
                            // 🚨 w-[30%] 제거!
                            el.className = `aspect-square rounded-lg flex flex-col items-center justify-center relative cursor-pointer hover:scale-105 transition-transform border-2 ${rarityClass}`;
                            
                            // 👇 [여기 수정!!] 타 유저 장비 슬롯도 아이콘 렌더링에 일러스트(img) 지원 추가!
                            const iconHtml = item.img 
                                ? `<img src="assets/items/${item.img}" class="w-8 h-8 object-contain filter drop-shadow-md" onerror="this.style.display='none'; setTimeout(() => { if(this.nextElementSibling) this.nextElementSibling.style.display='block'; }, 10);"><div style="display:none;" class="text-2xl filter drop-shadow-md">${item.emoji}</div>`
                                : `<div class="text-2xl filter drop-shadow-md">${item.emoji}</div>`;

                            el.innerHTML = `
                                ${iconHtml}
                                <div class="absolute -top-1 -right-1 bg-slate-900 border border-slate-500 rounded-full w-4 h-4 flex items-center justify-center text-[8px] shadow-md">🔍</div>
                                <div class="absolute bottom-0 w-full bg-black/60 text-white text-[9px] text-center font-bold rounded-b-lg py-0.5 truncate px-1">Lv.${level || 0}</div>
                            `;
                            
                            // 👇 [여기 수정!!] 토스트 알림 대신 상세 카드를 관전 모드(true)로 띄웁니다!
                            el.onclick = () => { UIManager.openDetailCard(itemId, 'gear', true, level || 0); };
                            
                        } else {
                            const typeName = type === 'weapon' ? '무기' : type === 'armor' ? '방어구' : '장신구';
                            el.className = "aspect-square rounded-lg border border-slate-600 bg-slate-800 flex flex-col items-center justify-center relative opacity-50";
                            el.innerHTML = `<span class="text-[9px] text-slate-500 font-bold">${typeName}</span>`;
                            el.onclick = null;
                        }
                    };
                    
                    // 무기, 방어구, 장신구, 그리고 파트너까지 렌더링!
                    renderTargetSlot('weapon', data.equipment?.weapon, data.itemUpgrades?.weapon);
                    renderTargetSlot('armor', data.equipment?.armor, data.itemUpgrades?.armor);
                    renderTargetSlot('accessory', data.equipment?.accessory, data.itemUpgrades?.accessory);
                    // 🌸 [추가!] 타유저 파트너 슬롯 렌더링 호출
                    renderTargetSlot('partner', data.equipment?.partner, data.partnerLevels ? data.partnerLevels[data.equipment.partner] : 0);
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
        if (GameState.rpgStage < 100) {
            this.showToast("100층의 심연의 군주를 토벌해야 차원의 여신을 만날 수 있습니다! 👑");
            return;
        }

        if(AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
        this.triggerHaptic();

        // 🌟 [핵심] 이번에 달성할 환생 횟수를 계산해서 보상에 곱해줍니다!
        // (예: 현재 0환생이면 이번엔 1환생 몫(1배), 1환생이면 이번엔 2환생 몫(2배))
        const nextPrestige = (GameState.prestigeCount || 0) + 1;
        const gemReward = GameState.rpgStage * 10 * nextPrestige; 
        const goldReward = GameState.rpgStage * 30 * nextPrestige;

        const gemEl = document.getElementById('goddess-gem-reward');
        const goldEl = document.getElementById('goddess-gold-reward');
        if (gemEl) gemEl.innerText = gemReward.toLocaleString();
        if (goldEl) goldEl.innerText = goldReward.toLocaleString();

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

  const renderSlot = (slotId, itemId, label, isPartner = false) => {
            const el = document.getElementById(slotId);
            if (!el) return;
            
            const dataSource = isPartner ? (window.GameData && GameData.partners ? GameData.partners[itemId] : null) : (window.GameData && GameData.items ? GameData.items[itemId] : null);
            const level = isPartner ? (GameState.partnerLevels[itemId] || 0) : (GameState.itemUpgrades[itemId] || 0);

            if (itemId && dataSource) {
                const item = dataSource;
                let rarityClass = "border-slate-600 bg-slate-800";
                if(item.rarity === 'mythic') rarityClass = "rarity-mythic animate-pulse";
                else if(item.rarity === 'legendary') rarityClass = "rarity-legendary";
                else if(item.rarity === 'epic') rarityClass = "rarity-epic";
                else if(item.rarity === 'rare') rarityClass = "rarity-rare";

                const prefix = isPartner ? '★' : 'Lv.';
                const levelColor = isPartner ? 'text-pink-200' : 'text-white';
                
             // 💡 [수정] 장비(isPartner가 아닐 때)도 img 속성을 바라보도록 추가!
                const iconHtml = isPartner 
                    ? `<img src="assets/partners/${item.img_sd}" class="w-12 h-12 object-contain filter drop-shadow-md mb-2" onerror="this.style.display='none'; setTimeout(() => { if(this.nextElementSibling) this.nextElementSibling.style.display='block'; }, 10);"><div style="display:none;" class="text-4xl filter drop-shadow-md mb-2">${item.emoji}</div>`
                    : (item.img 
                        ? `<img src="assets/items/${item.img}" class="w-10 h-10 object-contain filter drop-shadow-md mb-2" onerror="this.style.display='none'; setTimeout(() => { if(this.nextElementSibling) this.nextElementSibling.style.display='block'; }, 10);"><div style="display:none;" class="text-4xl filter drop-shadow-md mb-2">${item.emoji}</div>` 
                        : `<div class="text-4xl filter drop-shadow-md mb-2">${item.emoji}</div>`);

                el.className = `w-[72px] h-[72px] rounded-xl flex flex-col items-center justify-center relative cursor-pointer hover:scale-105 transition-transform border-2 ${rarityClass} overflow-hidden`;
                el.innerHTML = `
                    ${iconHtml}
                    <div class="absolute bottom-0 w-full bg-black/60 ${levelColor} text-[10px] text-center font-bold py-0.5 truncate px-1 tracking-wider z-10">${prefix}${level}</div>
                `;
              
            } else {
                const emptyBorder = isPartner ? 'border-pink-500/30' : 'border-slate-600';
                const emptyBg = isPartner ? 'bg-pink-900/20' : 'bg-slate-800/50';
                const emptyText = isPartner ? 'text-pink-400' : 'text-slate-500';
                
                el.className = `w-[72px] h-[72px] rounded-xl border-2 border-dashed ${emptyBorder} ${emptyBg} flex flex-col items-center justify-center relative opacity-70`;
                el.innerHTML = `<span class="text-[11px] ${emptyText} font-bold">${label}</span>`;
                el.onclick = null;
            }
        };

        renderSlot('lobby-slot-weapon', GameState.equippedWeapon, '무기');
        renderSlot('lobby-slot-armor', GameState.equippedArmor, '방어구');
        renderSlot('lobby-slot-accessory', GameState.equippedAccessory, '장신구');
        renderSlot('lobby-slot-partner', GameState.equippedPartner, '파트너', true);

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
        const bgEl = document.getElementById('profile-bg-image'); 

        if(nicknameEl) nicknameEl.innerText = GameState.nickname;

        if (!GameState.uid) { GameState.uid = Math.floor(1000 + Math.random() * 9000).toString(); GameState.save(); }
        if(uidEl) uidEl.innerText = GameState.uid;

        // 🌟 1. 칭호 디자인 통일
        if(titleEl) {
            if(GameState.equippedTitle && GameState.equippedTitle !== 'none' && GameState.equippedTitle !== 'default' && window.GameData && GameData.cosmetics && GameData.cosmetics.titles) {
                const tItem = GameData.cosmetics.titles.find(x => x.id === GameState.equippedTitle);
                titleEl.innerHTML = tItem ? `✨ ${tItem.name} [${tItem.reqMbti}] ✨` : "✨ 칭호 없음 ✨";
                titleEl.className = "px-2 py-1 rounded-md bg-red-900/40 border border-red-500/50 text-red-400 font-black text-[10px] tracking-widest uppercase mb-1.5 drop-shadow-md inline-block w-max";
            } else {
                titleEl.innerHTML = "✨ 칭호 없음 ✨";
                titleEl.className = "text-[9px] text-yellow-300 font-bold mb-1 w-max"; 
            }
        }

        // 🌟 2. 닉네임 밑에 랭킹 배지 실시간 부착!
        let rankBox = document.getElementById('my-profile-rank-box');
        if (!rankBox && uidEl && uidEl.parentElement) {
            rankBox = document.createElement('div');
            rankBox.id = 'my-profile-rank-box';
            rankBox.className = 'flex gap-1.5 mt-0.5 mb-1.5';
            uidEl.parentElement.parentNode.insertBefore(rankBox, uidEl.parentElement); // UID 바로 위에 삽입
        }
        
        if (rankBox) {
            rankBox.innerHTML = `<span class="bg-indigo-900/60 border border-indigo-500/50 text-indigo-300 px-1.5 py-0.5 rounded text-[9px] font-bold">🏆 탑: 산출중..</span>
                                 <span class="bg-pink-900/60 border border-pink-500/50 text-pink-300 px-1.5 py-0.5 rounded text-[9px] font-bold">💖 인기: 산출중..</span>`;
            
            if (window.GameSystem && GameSystem.Profile && GameSystem.Profile.getUserRanks) {
                const myPrestige = Number(GameState.prestigeCount) || Number(GameState.prestige) || 0;
                const myStage = Math.max(GameState.maxStage || 1, GameState.rpgStage || 1);
                const myLikes = GameState.likes || 0;
                
                GameSystem.Profile.getUserRanks(myPrestige, myStage, myLikes).then(ranks => {
                    rankBox.innerHTML = `<span class="bg-indigo-900/60 border border-indigo-500/50 text-indigo-300 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm">🏆 탑: ${ranks.tower}위</span>
                                         <span class="bg-pink-900/60 border border-pink-500/50 text-pink-300 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm">💖 인기: ${ranks.pop}위</span>`;
                });
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
            // 🚨 [완벽 복구 3] 내 환생 횟수도 무조건 숫자로 강제 변환해서 띄웁니다!
            const myPCount = Number(GameState.prestigeCount) || Number(GameState.prestige) || 0;
            const prestigeText = myPCount > 0 ? `[${myPCount}환생] ` : "";
            recordEl.innerText = `${prestigeText}${Math.max(GameState.maxStage || 1, GameState.rpgStage || 1)}F`;
        }

        if(statusEl) statusEl.innerText = GameState.statusMessage || "여기를 터치하여 자신을 소개해보세요!";
        if(likesEl) likesEl.innerText = GameState.likes || 0;

       // 🖼️ 내 프로필 배경 스킨 적용 (기존 코드)
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

// ui.js - UIManager 내부
    updateProfileEquipmentSlots() {
        // 🚨 장비 3개와 파트너 1개까지 총 4개의 슬롯을 배열로 묶어서 한방에 처리합니다!
        // 💡 [수정] 빈칸일 때 올바른 글씨를 출력하기 위해 subType 이라는 꼬리표를 추가했어요!
        const types = [
            { id: GameState.equippedWeapon, el: document.getElementById('profile-slot-weapon'), type: 'gear', subType: 'weapon' },
            { id: GameState.equippedArmor, el: document.getElementById('profile-slot-armor'), type: 'gear', subType: 'armor' },
            { id: GameState.equippedAccessory, el: document.getElementById('profile-slot-accessory'), type: 'gear', subType: 'accessory' },
            { id: GameState.equippedPartner, el: document.getElementById('profile-slot-partner'), type: 'partner', subType: 'partner' }
        ];

        types.forEach(({id: itemId, el, type, subType}) => {
            if (!el) return;
            
            // 장착된 아이템(장비 or 파트너)이 데이터에 존재하는지 확인
            if (itemId && ((type === 'gear' && window.GameData && GameData.items[itemId]) || (type === 'partner' && window.GameData && GameData.partners[itemId]))) {
                const item = type === 'gear' ? GameData.items[itemId] : GameData.partners[itemId];
                const level = type === 'gear' ? (GameState.itemUpgrades[itemId] || 0) : (GameState.partnerLevels[itemId] || 0);
                
                let rarityClass = "border-slate-600 bg-slate-800";
                if(item.rarity === 'legendary') rarityClass = "rarity-legendary";
                else if(item.rarity === 'epic') rarityClass = "rarity-epic";
                else if(item.rarity === 'rare') rarityClass = "rarity-rare";
                else if(item.rarity === 'mythic') rarityClass = "rarity-mythic animate-pulse";

                el.className = `aspect-square rounded-lg flex flex-col items-center justify-center relative cursor-pointer hover:scale-105 transition-transform border-2 ${rarityClass}`;
                
                // 💡 [핵심] 파트너면 img_icon을 우선으로 찾고, 장비면 img를 찾습니다!
                const iconFile = type === 'partner' ? (item.img_icon || item.img_sd) : item.img;
                const folder = type === 'partner' ? 'partners' : 'items';
                
                const iconHtml = iconFile 
                    ? `<img src="assets/${folder}/${iconFile}" class="w-8 h-8 object-contain filter drop-shadow-md" onerror="this.style.display='none'; setTimeout(() => { if(this.nextElementSibling) this.nextElementSibling.style.display='block'; }, 10);"><div style="display:none;" class="text-2xl filter drop-shadow-md">${item.emoji}</div>`
                    : `<div class="text-2xl filter drop-shadow-md">${item.emoji}</div>`;

                // 파트너면 ★, 장비면 Lv. 로 표기 변경
                const levelText = type === 'partner' ? `★${level}` : `Lv.${level}`;

                el.innerHTML = `
                    ${iconHtml}
                    <div class="absolute -top-1 -right-1 bg-slate-900 border border-slate-500 rounded-full w-4 h-4 flex items-center justify-center text-[8px] shadow-md z-10">🔍</div>
                    <div class="absolute bottom-0 w-full bg-black/60 text-white text-[9px] text-center font-bold rounded-b-lg py-0.5 truncate px-1 z-10">${levelText}</div>
                `;
                
                // 💡 돋보기를 누르면 토스트 알림 대신 아름다운 상세 카드를 띄웁니다!
                el.onclick = () => { UIManager.openDetailCard(itemId, type); };
                
            } else {
                // 장착 해제되어 비어있는 슬롯 그리기
                // 👇 [핵심 수정] type 대신 subType으로 이름을 찾아줍니다! 이제 무기/방어구/장신구가 정상적으로 떠요!
                const typeName = subType === 'weapon' ? '무기' : subType === 'armor' ? '방어구' : subType === 'accessory' ? '장신구' : '파트너';
                el.className = `aspect-square rounded-lg border ${type === 'partner' ? 'border-pink-500/30 bg-pink-900/20 text-pink-400' : 'border-slate-600 bg-slate-800 text-slate-500'} flex flex-col items-center justify-center relative opacity-50`;
                el.innerHTML = `<span class="text-[8px] font-bold">${typeName}</span>`;
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
        const skinId = GameState.equippedSkin; // 테두리 ID
        const profileId = GameState.equippedProfile; // 프로필 ID
        
        let borderClass = 'bg-gradient-to-tr from-slate-600 to-slate-400 border border-slate-600'; 
        let borderImgHtml = ''; // 🌟 테두리 이미지용 HTML
        
        // 1. 테두리(Border) 확인
        if (skinId && window.GameData && GameData.cosmetics && GameData.cosmetics.borders) {
            const borderItem = GameData.cosmetics.borders.find(b => b.id === skinId);
            if (borderItem) {
                if (borderItem.img) {
                    // 이미지가 있으면 CSS 테두리 대신 덮어씌울 이미지 태그 준비
                    borderClass = 'bg-slate-800'; 
                    borderImgHtml = `<img src="assets/cosmetics/${borderItem.img}" class="absolute inset-0 w-full h-full object-cover scale-125 z-20 pointer-events-none" onerror="this.style.display='none';">`;
                } else {
                    borderClass = `bg-slate-800 ${borderItem.cssClass}`; 
                }
            }
        }

        // 2. 프로필(Profile) 확인
        let innerHtml = GameState.nickname === "위대한 길드장" ? "M" : GameState.nickname.charAt(0); 
        
        if (profileId && window.GameData && GameData.cosmetics && GameData.cosmetics.profiles) {
            const profileItem = GameData.cosmetics.profiles.find(p => p.id === profileId);
            if (profileItem) {
                if (profileItem.img) {
                    // 이미지가 있으면 글자 이모지 대신 이미지 태그로 교체!
                    innerHtml = `<img src="assets/cosmetics/${profileItem.img}" class="w-full h-full object-cover rounded-full z-10" onerror="this.style.display='none';">`;
                } else {
                    innerHtml = `<span class="z-10 relative">${profileItem.icon}</span>`;
                }
            }
        }

        // 3. 모든 아바타 요소에 적용! (내 정보창 메인 프사는 제외)
        const avatars = document.querySelectorAll('.master-avatar:not(#profile-big-icon):not(#target-user-avatar)');
        avatars.forEach(a => {
            a.className = `master-avatar rounded-full flex-shrink-0 flex items-center justify-center font-black text-white transition-all w-10 h-10 text-xl relative ${borderClass}`;
            // 🌟 프로필 이미지(또는 텍스트) + 테두리 이미지를 겹쳐서 렌더링!
            a.innerHTML = innerHtml + borderImgHtml; 
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
            
          // 💡 [핵심] 글씨가 두 줄로 꺾이지 않도록 방어막(whitespace-nowrap) 치고 텍스트 다이어트!
            let effectText = '';
            if (item.atkMult) effectText += `<span class="text-[9px] text-red-400 font-bold leading-none whitespace-nowrap tracking-tighter">공격 +${Math.round((item.atkMult - 1)*100 * upgMult)}%</span>`;
            if (item.hpMult) effectText += `<span class="text-[9px] text-emerald-400 font-bold leading-none whitespace-nowrap tracking-tighter">체력 +${Math.round((item.hpMult - 1)*100 * upgMult)}%</span>`;
            if (item.critRate) effectText += `<span class="text-[9px] text-purple-400 font-bold leading-none whitespace-nowrap tracking-tighter">크리 +${(item.critRate * upgMult).toFixed(1)}%</span>`;
            if (item.critDmg) effectText += `<span class="text-[9px] text-pink-400 font-bold leading-none whitespace-nowrap tracking-tighter">크리피해 +${(item.critDmg * upgMult).toFixed(1)}%</span>`;
            if (item.vamp) effectText += `<span class="text-[9px] text-rose-500 font-bold leading-none whitespace-nowrap tracking-tighter">피흡 +${(item.vamp * upgMult).toFixed(1)}%</span>`;
            if (item.spd) effectText += `<span class="text-[9px] text-yellow-400 font-bold leading-none whitespace-nowrap tracking-tighter">공속 +${(item.spd * upgMult).toFixed(1)}%</span>`;
            if (item.eva) effectText += `<span class="text-[9px] text-teal-400 font-bold leading-none whitespace-nowrap tracking-tighter">회피 +${(item.eva * upgMult).toFixed(1)}%</span>`;
            if (item.def) effectText += `<span class="text-[9px] text-blue-400 font-bold leading-none whitespace-nowrap tracking-tighter">방어 +${Math.floor(item.def * upgMult)}</span>`;
            
          // 💡 [수정] 이모지 대신 이미지를 먼저 부르고, 실패하면 이모지 띄우기!
            const iconHtml = item.img 
                ? `<img src="assets/items/${item.img}" class="w-10 h-10 object-contain filter drop-shadow-md mb-1 mt-1 flex-shrink-0" onerror="this.style.display='none'; setTimeout(() => { if(this.nextElementSibling) this.nextElementSibling.style.display='block'; }, 10);"><div style="display:none;" class="text-3xl mb-1 mt-1 filter drop-shadow-md flex-shrink-0">${item.emoji}</div>`
                : `<div class="text-3xl mb-1 mt-1 filter drop-shadow-md flex-shrink-0">${item.emoji}</div>`;

           const card = `
                <div onclick="UIManager.openDetailCard('${id}', 'gear')" class="item-card rarity-${item.rarity} ${isEquipped ? 'equipped' : ''} relative flex flex-col justify-start items-center p-2 h-auto min-h-[120px] w-full hover:scale-105 transition-all cursor-pointer">
                    ${badgeHTML}
                    ${iconHtml}
                    <h4 class="text-white font-bold text-[10px] text-center leading-tight mb-1.5 break-keep">${levelText}${item.name}</h4>
                    <div class="flex flex-col items-center gap-[3px] w-full mt-auto">
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
        
       // 🚨 [수정 완료] 옛날 이름(inv-tab-gear)을 새 이름(tab-gear)으로 바꾸고 안전장치 추가!
            const gearTabBtn = document.getElementById('tab-gear');
            const isGearTab = gearTabBtn ? !gearTabBtn.classList.contains('text-slate-400') : false;
            
            if (emptyState) {
                if (isGearTab && !hasGear) {
                    emptyState.classList.remove('hidden');
                } else {
                    emptyState.classList.add('hidden');
                }
            }
        
       // 내 정보 상단 전투력/생존력 업데이트 (태그가 삭제되었으므로 안전장치 추가!)
        const stats = GameState.getTotalStats(); 
        if (document.getElementById('profile-total-power')) document.getElementById('profile-total-power').innerText = stats.atk.toLocaleString(); 
        if (document.getElementById('profile-total-hp')) document.getElementById('profile-total-hp').innerText = stats.hp.toLocaleString();
        
     // 🌟 내 정보 탭의 장비 슬롯 업데이트 (새로운 프로필 UI 엔진으로 연결!)
        this.updateProfileEquipmentSlots();
        
    }, // <-- renderInventory 끝나는 괄호
   renderPartnerInventory() {
        const panel = document.getElementById('inv-panel-partner');
        if(!panel) return;

        if (!GameState.ownedPartners || GameState.ownedPartners.length === 0) {
            panel.innerHTML = '<div class="col-span-3 text-center py-8 text-slate-500 text-xs">영입한 파트너가 없습니다.</div>';
            return;
        }

        // 👇 1. 중복 파트너 개수 세기!
        const counts = {};
        GameState.ownedPartners.forEach(id => {
            counts[id] = (counts[id] || 0) + 1;
        });

        let html = '';
        
        // 👇 2. 중복을 합친 고유 ID 목록으로 반복문 돌리기!
        Object.keys(counts).forEach(id => {
            const pt = GameData.partners[id];
            if(!pt) return;
            
            const count = counts[id]; // 보유 개수
            const isEquipped = (GameState.equippedPartner === id);
            const level = GameState.partnerLevels[id] || 0;
            
            const badgeHTML = isEquipped ? `<div class="item-equipped-badge text-[8px] tracking-wider z-10 bg-pink-500 border-pink-400">동행중</div>` : '';
            const levelText = level > 0 ? `<span class="text-pink-300 font-black mr-0.5">★${level}</span>` : '';
            
            // 🌟 우측 상단에 갯수 뱃지 추가!
           const countHTML = count > 1 ? `<div class="absolute bottom-1 right-2 text-slate-400 text-[10px] font-black z-20">x${count}</div>` : '';

            let rarityClass = "border-slate-600 bg-slate-800";
            if(pt.rarity === 'mythic') rarityClass = "rarity-mythic animate-pulse";
            else if(pt.rarity === 'legendary') rarityClass = "rarity-legendary";
            else if(pt.rarity === 'epic') rarityClass = "rarity-epic";
            else if(pt.rarity === 'rare') rarityClass = "rarity-rare";

            const upgMult = 1.0 + (level * 0.1);
            let statStr = '';
            if (pt.atkMult) statStr += `공격+${Math.round((pt.atkMult - 1)*100 * upgMult)}% `;
            if (pt.hpMult) statStr += `체력+${Math.round((pt.hpMult - 1)*100 * upgMult)}% `;
            if (pt.critRate) statStr += `크리+${(pt.critRate * upgMult).toFixed(1)}% `;
            if (pt.critDmg) statStr += `크피+${(pt.critDmg * upgMult).toFixed(1)}% `;
            if (pt.def) statStr += `방어+${Math.floor(pt.def * upgMult)} `;
            if (pt.eva) statStr += `회피+${(pt.eva * upgMult).toFixed(1)}% `;
            if (pt.spd) statStr += `공속+${(pt.spd * upgMult).toFixed(1)}% `;
            if (pt.vamp) statStr += `피흡+${(pt.vamp * upgMult).toFixed(1)}% `;

            html += `
            <div onclick="UIManager.openDetailCard('${id}', 'partner')" class="item-card ${rarityClass} ${isEquipped ? 'equipped !border-pink-500 shadow-[inset_0_0_20px_rgba(236,72,153,0.4)]' : ''} relative flex flex-col justify-start items-center p-2 h-auto min-h-[140px] w-full hover:scale-105 transition-all cursor-pointer">
                ${badgeHTML}
                ${countHTML}
                
                <img src="assets/partners/${pt.img_icon || pt.img_sd}" class="w-12 h-12 object-contain filter drop-shadow-md mb-1 mt-2 flex-shrink-0" onerror="this.style.display='none'; setTimeout(() => { if(this.nextElementSibling) this.nextElementSibling.style.display='block'; }, 10);">
                <div style="display:none;" class="text-4xl mb-1 mt-2 filter drop-shadow-md flex-shrink-0">${pt.emoji}</div>
                
                <h4 class="text-white font-bold text-[10px] text-center leading-tight mb-1.5 break-keep">${levelText}${pt.name}</h4>
                <div class="flex flex-col items-center w-full mt-auto bg-black/40 rounded py-1 px-1">
                    <span class="text-[9px] text-pink-300 font-black mb-0.5">[${pt.skillName}]</span>
                    <span class="text-[8px] text-emerald-300 font-bold truncate w-full text-center">${statStr.trim() || '스탯 없음'}</span>
                </div>
            </div>
            `;
        });

        panel.innerHTML = html;
    },

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
    // 🌟 [개편] 통합 상세 정보 카드 오픈 엔진 (장비 & 파트너) - 명품 테두리 적용 완!
    // =========================================================================
    openDetailCard(id, type, isReadOnly = false, customLevel = 0, customAffLv = 1) {
        if(window.AudioEngine && AudioEngine.sfx) AudioEngine.sfx.click();
        
        const isPartner = (type === 'partner');
        const item = isPartner ? GameData.partners[id] : GameData.items[id];
        if (!item) return;

        // 내 인벤토리인지 남의 프로필 관전 모드인지 체크
        const isEquipped = isReadOnly ? true : (isPartner ? (GameState.equippedPartner === id) : [GameState.equippedWeapon, GameState.equippedArmor, GameState.equippedAccessory].includes(id));
        const level = isReadOnly ? customLevel : (isPartner ? (GameState.partnerLevels[id] || 0) : (GameState.itemUpgrades[id] || 0));

        // 💡 [핵심 복구] 호감도 레벨(affLv)을 제일 먼저 알아냅니다!
        const affLv = isReadOnly ? customAffLv : (GameState.partnerAffectionLevel[id] || 1);

        // 1. 공통 정보 세팅 (이름, 등급)
        document.getElementById('dc-name').innerText = item.name;
        
        const rarityEl = document.getElementById('dc-rarity');
        let rName = "일반"; let rColor = "bg-slate-700 text-white";
        if (item.rarity === 'mythic') { rName = "✨신화✨"; rColor = "bg-red-600 text-white animate-pulse border border-red-400"; }
        else if (item.rarity === 'legendary') { rName = "전설"; rColor = "bg-yellow-500 text-slate-900"; }
        else if (item.rarity === 'epic') { rName = "영웅"; rColor = "bg-purple-600 text-white"; }
        else if (item.rarity === 'rare') { rName = "희귀"; rColor = "bg-blue-500 text-white"; }
        rarityEl.innerText = rName; 
        rarityEl.className = `text-[10px] font-black px-2 py-0.5 rounded shadow-md mb-1 inline-block ${rColor}`;

       // 🌟 2. 상단 이미지 영역 세팅 (상세페이지용)
        let imgFile = '';
        
        if (isPartner) {
            // 🚨 [경로 뚫기 완!] 'img_detail'을 제일 먼저 찾고, 없으면 cutin -> full -> sd 순으로 찾습니다!
            imgFile = item.img_detail || item.img_cutin || item.img_full || item.img_sd;
        } else {
            // 장비도 혹시 모르니 똑같이 뚫어둡니다.
            imgFile = item.img_detail || item.img_cutin || item.img || '';
        }

        const folder = isPartner ? 'partners' : 'items';
        const imgEl = document.getElementById('dc-image');
        imgEl.src = `assets/${folder}/${imgFile}`;
        imgEl.style.objectFit = 'contain';
        
        // =====================================================================
        // ✨ [진짜 최종 수정] 테두리를 그림 상자가 아닌 '모달창 전체'에 두르기!
        // =====================================================================
        // 1. 기존 그림 상자(imageFrame)에 있던 불필요한 테두리들은 싹 다 지워줍니다.
        const imageFrame = document.getElementById('dc-image').parentElement;
        imageFrame.classList.remove('border-slate-500', 'border-blue-400', 'border-purple-500', 'border-yellow-400', 'border-pink-500', 'animate-pulse', 'border-2', 'border');
        imageFrame.style.boxShadow = 'none';

        // 2. 모달창 전체(실제 카드 껍데기)를 찾습니다.
        const modal = document.getElementById('detail-card-modal');
        const mainCardElement = modal ? modal.firstElementChild : null;

        if (mainCardElement) {
            // 기존 테두리 흔적 싹 초기화
            mainCardElement.classList.remove('border-slate-500', 'border-blue-400', 'border-purple-500', 'border-yellow-400', 'border-pink-500', 'border-2', 'border');
            
            // 모달창 4면에 든든한 테두리 두께 장착!
            mainCardElement.classList.add('border-2');

            // 3. 아이템의 등급(rarity)에 맞춰 색상과 화려한 전체 그림자(빛무리)를 입힙니다!
            if (item.rarity === 'rare') {
                mainCardElement.classList.add('border-blue-400');
                mainCardElement.style.boxShadow = '0 0 20px rgba(96, 165, 250, 0.4)';
            } else if (item.rarity === 'epic') {
                mainCardElement.classList.add('border-purple-500');
                mainCardElement.style.boxShadow = '0 0 25px rgba(168, 85, 247, 0.5)';
            } else if (item.rarity === 'legendary') {
                mainCardElement.classList.add('border-yellow-400');
                mainCardElement.style.boxShadow = '0 0 30px rgba(250, 204, 21, 0.6)';
            } else if (item.rarity === 'mythic') {
                mainCardElement.classList.add('border-pink-500'); 
                mainCardElement.style.boxShadow = '0 0 40px rgba(236, 72, 153, 0.7)'; // 영롱한 핑크빛 오라!
            } else {
                mainCardElement.classList.add('border-slate-500');
                mainCardElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            }
        }
        // =====================================================================
        
        // 🌟 [다이내믹 블러 백드롭]
        const bgEl = document.getElementById('dc-bg');
        if (isPartner) {
            bgEl.style.backgroundImage = `url('assets/${folder}/${imgFile}')`;
            bgEl.style.filter = "blur(16px) brightness(0.35)"; 
            bgEl.style.transform = "scale(1.15)";
        } else {
            bgEl.style.backgroundImage = `url('assets/backgrounds/card_bg_gear.png')`;
            bgEl.style.filter = "none";
            bgEl.style.transform = "none";
            bgEl.onerror = function() { this.style.backgroundImage = `url('assets/backgrounds/bg_zone1.png')`; };
        }

        // 👇 더 이상 안 쓰는 [외형 변경] 버튼은 영원히 숨겨둡니다!
        const skinBtn = document.getElementById('dc-btn-skin');
        if (skinBtn) skinBtn.classList.add('hidden');

        // 3. 화면 분기용 변수
        const partnerSec = document.getElementById('dc-partner-section');
        const gearSec = document.getElementById('dc-gear-section');
        const btnArea = document.getElementById('dc-btn-area');

        // 💡 [공통 스탯 박스 디자인]
        const statBoxClass = "text-[10px] sm:text-[11px] font-bold bg-slate-900/80 px-1.5 py-2 rounded-lg text-center shadow-inner whitespace-nowrap tracking-tight flex items-center justify-center";

        // 🌸 파트너 상세 카드 렌더링
        if (isPartner) {
            document.getElementById('dc-level-label').innerText = "돌파 레벨";
            document.getElementById('dc-level').innerText = `★${level}`;
            
            partnerSec.classList.remove('hidden'); partnerSec.classList.add('flex');
            gearSec.classList.add('hidden');
            
            const affLv = isReadOnly ? customAffLv : (GameState.partnerAffectionLevel[id] || 1);
            const affExp = isReadOnly ? 0 : (GameState.partnerAffectionExp[id] || 0); 
            const reqExp = affLv * 100;

            document.getElementById('dc-flavor').innerText = `"${item.flavorText}"`;
            document.getElementById('dc-aff-lv').innerText = `Lv.${affLv}`;
            document.getElementById('dc-aff-text').innerText = affLv >= 10 ? "MAX" : `${affExp} / ${reqExp}`;
            document.getElementById('dc-aff-bar').style.width = affLv >= 10 ? "100%" : `${(affExp / reqExp) * 100}%`;
            
            document.getElementById('dc-skill-icon').innerText = item.emoji;
            document.getElementById('dc-skill-name').innerText = item.skillName;
            
            let dynamicDesc = item.skillDesc;
            const bonusPower = item.skillValue ? (item.skillValue * (affLv * 0.05)) : 0;
            
            if (item.skillValue && bonusPower > 0) {
                const cleanBonus = bonusPower % 1 === 0 ? bonusPower : bonusPower.toFixed(1);
                dynamicDesc = dynamicDesc.replace(item.skillValue.toString(), `${item.skillValue}<span class="text-pink-400 font-black">(+${cleanBonus})</span>`);
            }
            
            dynamicDesc += `<br><span class="text-cyan-400 text-[9px] font-bold mt-1.5 inline-block">⚡ 스킬 쿨타임 -${affLv * 2}% 가속 적용됨</span>`;
            document.getElementById('dc-skill-desc').innerHTML = dynamicDesc;

            const upgMult = 1.0 + (level * 0.1);
            let pStatsHtml = '';
            
            if (item.atkMult) pStatsHtml += `<div class="${statBoxClass} text-red-400">공격 +${Math.round((item.atkMult - 1)*100 * upgMult)}%</div>`;
            if (item.hpMult) pStatsHtml += `<div class="${statBoxClass} text-emerald-400">체력 +${Math.round((item.hpMult - 1)*100 * upgMult)}%</div>`;
            if (item.critRate) pStatsHtml += `<div class="${statBoxClass} text-purple-400">크리 +${(item.critRate * upgMult).toFixed(1)}%</div>`;
            if (item.critDmg) pStatsHtml += `<div class="${statBoxClass} text-pink-400">크피 +${(item.critDmg * upgMult).toFixed(1)}%</div>`;
            if (item.def) pStatsHtml += `<div class="${statBoxClass} text-blue-400">방어 +${Math.floor(item.def * upgMult)}%</div>`;
            if (item.eva) pStatsHtml += `<div class="${statBoxClass} text-teal-400">회피 +${(item.eva * upgMult).toFixed(1)}%</div>`;
            if (item.spd) pStatsHtml += `<div class="${statBoxClass} text-yellow-400">공속 +${(item.spd * upgMult).toFixed(1)}%</div>`;
            if (item.vamp) pStatsHtml += `<div class="${statBoxClass} text-rose-500">피흡 +${(item.vamp * upgMult).toFixed(1)}%</div>`;
            
            document.getElementById('dc-partner-stats').className = "grid grid-cols-3 sm:grid-cols-4 gap-1.5 border-t border-slate-700 pt-3 mt-1 w-full";
            document.getElementById('dc-partner-stats').innerHTML = pStatsHtml;
        } 
        // 🗡️ 장비 상세 카드 렌더링
        else {
            document.getElementById('dc-level-label').innerText = "강화 수치";
            document.getElementById('dc-level').innerText = `+${level}`;
            
            partnerSec.classList.add('hidden'); partnerSec.classList.remove('flex');
            
            gearSec.className = "flex-col gap-3 flex"; 

            const upgMult = 1.0 + (level * 0.1);
            let statsHtml = '';
            
            if (item.atkMult) statsHtml += `<div class="${statBoxClass} text-red-400">공격 +${Math.round((item.atkMult - 1)*100 * upgMult)}%</div>`;
            if (item.hpMult) statsHtml += `<div class="${statBoxClass} text-emerald-400">체력 +${Math.round((item.hpMult - 1)*100 * upgMult)}%</div>`;
            if (item.critRate) statsHtml += `<div class="${statBoxClass} text-purple-400">크리 +${(item.critRate * upgMult).toFixed(1)}%</div>`;
            if (item.critDmg) statsHtml += `<div class="${statBoxClass} text-pink-400">크피 +${(item.critDmg * upgMult).toFixed(1)}%</div>`;
            if (item.def) statsHtml += `<div class="${statBoxClass} text-blue-400">방어 +${Math.floor(item.def * upgMult)}%</div>`;
            if (item.eva) statsHtml += `<div class="${statBoxClass} text-teal-400">회피 +${(item.eva * upgMult).toFixed(1)}%</div>`;
            if (item.spd) statsHtml += `<div class="${statBoxClass} text-yellow-400">공속 +${(item.spd * upgMult).toFixed(1)}%</div>`;
            if (item.vamp) statsHtml += `<div class="${statBoxClass} text-rose-500">피흡 +${(item.vamp * upgMult).toFixed(1)}%</div>`;
            
            const commentText = item.flavorText || item.desc || "전설 속의 장비입니다.";
            
            gearSec.innerHTML = `
                <p class="text-[11px] sm:text-xs text-slate-300 italic text-center break-keep leading-snug px-2">"${commentText}"</p>
                <div class="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-inner">
                    <p class="text-[10px] text-slate-400 mb-2.5 font-bold flex items-center gap-1.5">
                        <i class="fa-solid fa-chart-simple"></i> 장착 효과 <span class="text-[9px] font-normal">(강화 수치 적용됨)</span>
                    </p>
                    <div class="grid grid-cols-3 sm:grid-cols-4 gap-1.5 w-full">
                        ${statsHtml}
                    </div>
                </div>
            `;
        }

        // 🌟 남의 프로필 볼 때와 내 프로필 볼 때 버튼 분기!
        if (isReadOnly) {
            btnArea.innerHTML = `
                <button onclick="document.getElementById('detail-card-modal').classList.remove('opacity-100', 'pointer-events-auto', 'scale-100'); document.getElementById('detail-card-modal').classList.add('opacity-0', 'pointer-events-none', 'scale-95');" class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-black rounded-xl active:scale-95 text-sm transition-all shadow-md border border-slate-500">
                    닫기
                </button>
            `;
        } else {
            if (isPartner) {
                btnArea.innerHTML = `
                    <button onclick="GameSystem.Partner.giveGift('${id}')" class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-pink-300 font-bold rounded-xl border border-pink-500/30 active:scale-95 flex flex-col items-center justify-center shadow-md transition-all">
                        <span class="text-xs flex items-center gap-1"><i class="fa-solid fa-gift"></i> 선물하기</span>
                        <span class="text-[9px] text-cyan-400 bg-slate-900 px-2 mt-0.5 rounded-full border border-cyan-900">💎 50</span>
                    </button>
                    <button onclick="GameSystem.Partner.toggleEquip('${id}'); UIManager.openDetailCard('${id}', 'partner');" class="flex-[1.5] py-3 ${isEquipped ? 'bg-slate-700 text-slate-300 border border-slate-600' : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-600 text-white border border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)]'} font-black rounded-xl active:scale-95 text-sm transition-all">
                        ${isEquipped ? '동행 해제하기' : '동행하기'}
                    </button>
                `;
            } else {
                btnArea.innerHTML = `
                    <button onclick="GameSystem.Lobby.toggleEquip('${id}'); UIManager.openDetailCard('${id}', 'gear');" class="w-full py-3 ${isEquipped ? 'bg-slate-700 text-slate-300 border border-slate-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]'} font-black rounded-xl active:scale-95 text-sm transition-all">
                        ${isEquipped ? '장착 해제하기' : '장착하기'}
                    </button>
                `;
            }
        }

     // 🚨 [수정] 위에서 이미 'modal'을 선언했으니, 여기서는 'dcModal'이라는 새 이름표를 씁니다!
        const dcModal = document.getElementById('detail-card-modal');
        if (dcModal) {
            dcModal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
            dcModal.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
        }
    },
    // 👈 ui.js 끝나는 마지막 괄호입니다!
// =========================================================================
    // 🌟 [전면 개편] 가챠샵 슬라이딩 배너 다중 모터 엔진!
    // =========================================================================
    GachaSlider: {
        sliders: [], // 여러 개의 배너를 관리할 창고

        init() {
            this.sliders = []; 
            // 1. 장비 뽑기 배너 세팅
            this.setupSlider('gacha-slider-container', 'gacha-slide-track', 'gacha-slider-dots');
            // 2. 파트너 뽑기 배너 세팅
            this.setupSlider('gacha-slider-container-partner', 'gacha-slide-track-partner', 'gacha-slider-dots-partner');
        },

        setupSlider(containerId, trackId, dotsId) {
            const container = document.getElementById(containerId);
            const track = document.getElementById(trackId);
            const dotsContainer = document.getElementById(dotsId);

            if (!container || !track) return;

            // 💡 각 배너마다 자기만의 번호표, 타이머, 터치 센서를 가진 '독립된 개체(state)'로 만듭니다!
         const state = {
            container, track, dots: dotsContainer ? dotsContainer.children : null,
            currentIndex: 0, totalSlides: track.children.length, intervalId: null, // 👈 여기를 3 대신 track.children.length 로 변경!
            startX: 0, endX: 0, isDragging: false,

                updateUI() {
                    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
                    if (this.dots) {
                        Array.from(this.dots).forEach((dot, idx) => {
                            dot.className = (idx === this.currentIndex) 
                                ? "w-4 h-2 rounded-full bg-white transition-all shadow-md" 
                                : "w-2 h-2 rounded-full bg-white/40 transition-all shadow-md"; 
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
                    // 배너마다 5초 주기로 알아서 돌아가게 타이머 장착!
                    this.intervalId = setInterval(() => this.next(), 5000);
                },
                stopAuto() {
                    if (this.intervalId) clearInterval(this.intervalId);
                }
            };

            // 📱 모바일 터치(스와이프) 이벤트
            container.addEventListener('touchstart', (e) => { state.startX = e.touches[0].clientX; state.stopAuto(); }, {passive: true});
            container.addEventListener('touchmove', (e) => { state.endX = e.touches[0].clientX; }, {passive: true});
            container.addEventListener('touchend', () => {
                if (!state.startX || !state.endX) return;
                const diff = state.startX - state.endX;
                if (diff > 50) state.next(); 
                else if (diff < -50) state.prev(); 
                state.startX = 0; state.endX = 0;
                state.startAuto();
            });
            
            // 🖱️ PC 마우스 드래그 이벤트
            container.addEventListener('mousedown', (e) => { state.startX = e.clientX; state.isDragging = true; state.stopAuto(); });
            container.addEventListener('mousemove', (e) => { if(state.isDragging) state.endX = e.clientX; });
            container.addEventListener('mouseup', () => {
                if(!state.isDragging || !state.startX || !state.endX) { state.isDragging = false; return; }
                const diff = state.startX - state.endX;
                if (diff > 50) state.next(); 
                else if (diff < -50) state.prev(); 
                state.isDragging = false; state.startX = 0; state.endX = 0;
                state.startAuto();
            });
            container.addEventListener('mouseleave', () => { state.isDragging = false; state.startAuto(); });

            // 세팅이 끝났으니 자동 슬라이드 켜기!
            state.startAuto();
            this.sliders.push(state);
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





