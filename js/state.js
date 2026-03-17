// =========================================================================
// 2. GAME STATE (데이터 관리 및 철통 보안 암호화)
// =========================================================================
const GameState = {
    nickname: "위대한 길드장",
    deviceId: "", 
    gold: 0, gem: 0, 
    synthPity: { rare: 0, epic: 0 }, 
    lastCheckIn: "",
    lastPlayRewards: {}, 
    lastIdleCheck: Date.now(),
 // ✅ 이렇게 바꿔주세요! (파트너 주머니 3개 추가!)
    lastHpUpdate: Date.now(),
    ownedCosmetics: [],
    ownedPartners: [],       // 🌸 [추가] 내가 뽑은 미소녀 명단
    partnerLevels: {},       // 🌸 [추가] 미소녀들의 돌파(중복) 레벨
    // 👇 [신규 추가] 파트너 호감도 시스템 변수
    partnerAffectionExp: {},    
    partnerAffectionLevel: {},
    equippedPartner: null,   // 🌸 [추가] 현재 내 옆에 서 있는 파트너
    // 👇 1. [여기에 한 줄 추가!] 마스터가 픽한 파트너 스킨을 기억할 수첩입니다.
    partnerSkins: {},
    
    rpgStage: 1, rpgAtk: 10, rpgMaxHp: 100, currentHp: 100,
    
    // 🌟 신규 스탯 3인방
    rpgDef: 0, rpgEva: 0, rpgSpd: 0,
    
    potions: 1, inventory: [], 
    
    // 💡 장착 칸
    equippedWeapon: null, equippedArmor: null, equippedAccessory: null, 
    equippedSkin: null, equippedTitle: null, equippedBg: null, 
    equippedBubble: null, equippedProfile: null,
    
    isBattling: false,
    prestigeCount: 0,
    questData: {
        daily: { date: "", progress: {} }, 
        achievements: { progress: {}, completed: [] } 
    },
    // 👇 [신규 추가] 장비와 파트너의 천장 데이터를 분리해서 저장!
    gachaPity: { gear: { mythic: 0, select: 0 }, partner: { mythic: 0, select: 0 } },
    
    // 🔒 [보안 강화] 데이터를 외계어로 변환 (Base64)
    _encode(value) {
        return btoa(encodeURIComponent(JSON.stringify(value)));
    },
    
    // 🔓 [보안 해독] 외계어를 다시 원래 데이터로 복구
    _decode(value) {
        try { return JSON.parse(decodeURIComponent(atob(value))); } catch (e) { return null; }
    },

   // 🛡️ [안전 장치] 스마트 로더 수정본 (길이 제한 삭제로 완벽 복호화)
    _safeLoad(key, defaultValue) {
        const val = localStorage.getItem(key);
        if (val === null || val === 'null') return defaultValue;
        
        // 1. 무조건 암호화 해독 시도! (실패하면 내부 catch에서 null 반환)
        const decoded = this._decode(val);
        if (decoded !== null) return decoded;
        
        // 2. 옛날 쌩얼 데이터 호환성 유지 (JSON인 경우)
        try { if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) return JSON.parse(val); } catch(e) {}
        
        // 3. 숫자나 일반 문자열인 경우
        if (!isNaN(val) && val !== '') return Number(val);
        return val;
    },
    
  load() {
        this.nickname = localStorage.getItem('master_nickname') || "위대한 길드장";
        let storedId = localStorage.getItem('master_device_id');
        if(!storedId) {
            storedId = 'dev_' + Math.random().toString(36).substring(2, 11) + Date.now();
            localStorage.setItem('master_device_id', storedId);
        }
        this.deviceId = storedId;

        this.synthPity = this._safeLoad('master_synth_pity', { rare: 0, epic: 0 });
        this.gold = this._safeLoad('master_gold', 0);
        this.gem = this._safeLoad('master_gem', 0);
        this.lastCheckIn = this._safeLoad('last_checkin', "");
        this.lastPlayRewards = this._safeLoad('master_play_rewards_map', {});
        this.lastIdleCheck = this._safeLoad('master_last_idle', Date.now());
        this.lastHpUpdate = this._safeLoad('master_last_hp_update', Date.now()); 
        
        this.rpgStage = this._safeLoad('master_stage', 1);
        this.rpgAtk = this._safeLoad('master_atk', 10);
        this.rpgMaxHp = this._safeLoad('master_max_hp', 100);
        this.currentHp = this._safeLoad('master_current_hp', this.rpgMaxHp);
        
        this.ownedCosmetics = this._safeLoad('master_ownedCosmetics', []);
       // 🌸 파트너 로드 완벽 보장 (null 버그 원천 차단!)
        this.ownedPartners = this._safeLoad('master_ownedPartners', []);
        this.partnerLevels = this._safeLoad('master_partnerLevels', {});
      // 👇 [신규 추가]
        this.partnerAffectionExp = this._safeLoad('master_pt_aff_exp', {});
        this.partnerAffectionLevel = this._safeLoad('master_pt_aff_lv', {});
      // 👇 2. [여기에 한 줄 추가!] 게임 켤 때 수첩 내용 불러오기
        this.partnerSkins = this._safeLoad('master_partnerSkins', {});
        
        // 👇 이 부분을 아래 코드로 교체! (직통 저장소에서 먼저 꺼내오기!)
        let safeEp = localStorage.getItem('master_safe_partner');
        if (safeEp) {
            this.equippedPartner = (safeEp === 'none') ? null : safeEp;
        } else {
            let ep = this._safeLoad('master_equippedPartner', null); 
            this.equippedPartner = (ep === 'none' || ep === 'null' || ep === '') ? null : ep;
        }
        
        let title = this._safeLoad('master_equippedTitle', 'none'); this.equippedTitle = (title === 'none' ? null : title);
        let bg = this._safeLoad('master_equippedBg', 'none'); this.equippedBg = (bg === 'none' ? null : bg);
        let bubble = this._safeLoad('master_equippedBubble', 'none'); this.equippedBubble = (bubble === 'none' ? null : bubble);
        let skin = this._safeLoad('master_equippedSkin', 'none'); this.equippedSkin = (skin === 'none' ? null : skin);
        let pf = this._safeLoad('master_equippedProfile', 'none'); this.equippedProfile = (pf === 'none' ? null : pf);
        
        this.rpgDef = this._safeLoad('master_def', 0);
        this.rpgEva = this._safeLoad('master_eva', 0);
        this.rpgSpd = this._safeLoad('master_spd', 0);
        this.potions = this._safeLoad('master_potions', 1);
        this.inventory = this._safeLoad('master_inventory', []);
        this.prestigeCount = this._safeLoad('master_prestige', 0);
      // 👇 [신규 추가] 로드할 때 천장 데이터도 불러오기!
        this.gachaPity = this._safeLoad('master_gacha_pity', { gear: { mythic: 0, select: 0 }, partner: { mythic: 0, select: 0 } });
        
        let w = this._safeLoad('master_equipped_weapon', 'none'); this.equippedWeapon = (w === 'none' ? null : w);
        let a = this._safeLoad('master_equipped_armor', 'none'); this.equippedArmor = (a === 'none' ? null : a);
        let ac = this._safeLoad('master_equipped_accessory', 'none'); this.equippedAccessory = (ac === 'none' ? null : ac);
        
        const savedUpgrades = localStorage.getItem('master_itemUpgrades');
        if (savedUpgrades) {
            try { this.itemUpgrades = JSON.parse(savedUpgrades); } catch(e) { this.itemUpgrades = {}; }
        } else { this.itemUpgrades = {}; }

        const defaultQuestData = { daily: { date: "", progress: {} }, achievements: { progress: {}, completed: [] } };
        const questRaw = this._safeLoad('master_quest_data', defaultQuestData);
        if (questRaw && questRaw.daily && questRaw.daily.date !== undefined) { this.questData = questRaw; } else { this.questData = defaultQuestData; }
        
        this.checkDailyReset();
        this.recoverHpOverTime();
    },

  save() {
        localStorage.setItem('master_nickname', this.nickname);
        
        localStorage.setItem('master_gold', this._encode(this.gold));
        localStorage.setItem('master_gem', this._encode(this.gem));
        localStorage.setItem('last_checkin', this._encode(this.lastCheckIn));
        localStorage.setItem('master_synth_pity', this._encode(this.synthPity)); 
        localStorage.setItem('master_play_rewards_map', this._encode(this.lastPlayRewards));
        localStorage.setItem('master_last_idle', this._encode(this.lastIdleCheck));
        localStorage.setItem('master_last_hp_update', this._encode(this.lastHpUpdate));
        localStorage.setItem('master_stage', this._encode(this.rpgStage));
        localStorage.setItem('master_atk', this._encode(this.rpgAtk));
        localStorage.setItem('master_max_hp', this._encode(this.rpgMaxHp));
        localStorage.setItem('master_current_hp', this._encode(this.currentHp));
        
        localStorage.setItem('master_itemUpgrades', JSON.stringify(this.itemUpgrades || {}));
        
        localStorage.setItem('master_ownedCosmetics', this._encode(this.ownedCosmetics));
        
        // 🌸 파트너 세이브 완벽 보장!
        localStorage.setItem('master_ownedPartners', this._encode(this.ownedPartners));
        localStorage.setItem('master_partnerLevels', this._encode(this.partnerLevels));
      // 👇 [신규 추가]
        localStorage.setItem('master_pt_aff_exp', this._encode(this.partnerAffectionExp));
        localStorage.setItem('master_pt_aff_lv', this._encode(this.partnerAffectionLevel));
       // 👇 이 부분을 아래 두 줄로 교체! (직통 저장소 추가)
        localStorage.setItem('master_equippedPartner', this._encode(this.equippedPartner || 'none'));
        localStorage.setItem('master_safe_partner', this.equippedPartner || 'none');
      // 👇 3. [여기에 한 줄 추가!] 게임 끌 때 수첩 내용 저장하기
        localStorage.setItem('master_partnerSkins', this._encode(this.partnerSkins));

        localStorage.setItem('master_equippedBg', this._encode(this.equippedBg || 'none'));
        localStorage.setItem('master_equippedBubble', this._encode(this.equippedBubble || 'none'));
        localStorage.setItem('master_equippedSkin', this._encode(this.equippedSkin || 'none')); 
        localStorage.setItem('master_equippedProfile', this._encode(this.equippedProfile || 'none'));
        localStorage.setItem('master_equippedTitle', this._encode(this.equippedTitle || 'none'));
        
        localStorage.setItem('master_def', this._encode(this.rpgDef));
        localStorage.setItem('master_eva', this._encode(this.rpgEva));
        localStorage.setItem('master_spd', this._encode(this.rpgSpd));
        
        localStorage.setItem('master_potions', this._encode(this.potions));
        localStorage.setItem('master_inventory', this._encode(this.inventory));
        localStorage.setItem('master_quest_data', this._encode(this.questData));
        localStorage.setItem('master_prestige', this._encode(this.prestigeCount));
      // 👇 [신규 추가] 저장할 때 천장 데이터도 묶어서 암호화!
        localStorage.setItem('master_gacha_pity', this._encode(this.gachaPity));
        
        localStorage.setItem('master_equipped_weapon', this._encode(this.equippedWeapon || 'none'));
        localStorage.setItem('master_equipped_armor', this._encode(this.equippedArmor || 'none'));
        localStorage.setItem('master_equipped_accessory', this._encode(this.equippedAccessory || 'none'));
    },

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.questData.daily.date !== today) { this.questData.daily.date = today; this.questData.daily.progress = {}; this.save(); }
    },
    
   // ❌ 기존 checkAndRevive() 함수는 삭제

    // 🌟 [신규] 8시간(100%) 비례 실시간 체력 회복 엔진!
    recoverHpOverTime() {
        const now = Date.now();
        if (!this.lastHpUpdate) this.lastHpUpdate = now;
        
        // 전투 중일 때는 자동 회복을 멈춰서 밸런스 붕괴 방지!
        if (this.isBattling) {
            this.lastHpUpdate = now; 
            return; 
        }

        const maxHp = this.getTotalStats().hp;
        
        if (this.currentHp < maxHp) {
            const elapsedMs = now - this.lastHpUpdate;
            const EIGHT_HOURS = 8 * 60 * 60 * 1000; // 8시간을 밀리초(ms)로 변환
            
            // 8시간(EIGHT_HOURS)에 걸쳐 최대 체력(maxHp)만큼 회복
            const recovered = (elapsedMs / EIGHT_HOURS) * maxHp;
            
            // 💡 1 이상 찼을 때만 틱(Tick) 단위로 깔끔하게 피를 채워줌!
            if (recovered >= 1) {
                this.currentHp = Math.min(maxHp, this.currentHp + Math.floor(recovered));
                
                // 회복에 써먹은 시간만큼만 계산해서 더해줌 (소수점 시간 손실 방지)
                const timeUsed = (Math.floor(recovered) / maxHp) * EIGHT_HOURS;
                this.lastHpUpdate += timeUsed;
                this.save();
                
                // 로비(투기장) 화면을 보고 있다면 체력바 실시간으로 갱신!
                if (window.UIManager && document.getElementById('screen-arena').classList.contains('active')) {
                    UIManager.updateRpgLobbyUI();
                }
            }
        } else {
            // 풀피(100%)일 때는 시간만 계속 현재로 갱신 (시간 누적 방지)
            this.lastHpUpdate = now;
        }
    },

 getTotalStats() {
        // 💡 [추가] 강화 데이터베이스(빈 창고)가 없으면 만들어주기!
        if(!this.itemUpgrades) this.itemUpgrades = {};

        let finalAtkMult = 1.0; let finalHpMult = 1.0;
        let finalCritRate = 10; let finalCritDmg = 150; let finalVamp = 0;      
        
        let finalDef = this.rpgDef || 0; let finalEva = this.rpgEva || 0; let finalSpd = this.rpgSpd || 0;

        const gears = [this.equippedWeapon, this.equippedArmor, this.equippedAccessory];
        
        gears.forEach(id => {
            if (id && GameData.items[id]) {
                const item = GameData.items[id];
                
                // 🌟 [핵심] 이 장비가 몇 강인지 확인하고 배율(1.0, 1.1, 1.2...) 만들기!
                const level = this.itemUpgrades[id] || 0;
                const upgMult = 1.0 + (level * 0.1); 

                // 💡 아이템이 올려주는 수치에 강화 배율(upgMult)을 곱해서 더해줍니다!
                // (예: 기본 공증가율이 +50%(0.5)인 무기가 2강(1.2배)이면 -> +60%(0.6)가 됨!)
                if (item.atkMult) finalAtkMult += ((item.atkMult - 1.0) * upgMult);
                if (item.hpMult) finalHpMult += ((item.hpMult - 1.0) * upgMult);
                if (item.critRate) finalCritRate += (item.critRate * upgMult);
                if (item.critDmg) finalCritDmg += (item.critDmg * upgMult);
                if (item.vamp) finalVamp += (item.vamp * upgMult);
                if (item.def) finalDef += (item.def * upgMult);
                if (item.eva) finalEva += (item.eva * upgMult);
                if (item.spd) finalSpd += (item.spd * upgMult);
            }
        });
    // 🌸 [개편] 파트너 스탯 뻥튀기 (호감도 보너스 삭제, 오직 강화 레벨만 +10%씩 적용!)
        if (this.equippedPartner && GameData.partners && GameData.partners[this.equippedPartner]) {
            const pt = GameData.partners[this.equippedPartner];
            const ptLevel = this.partnerLevels[this.equippedPartner] || 0;
            
            const ptMult = 1.0 + (ptLevel * 0.1); // 💡 강화당 딱 +10% 씩만! (속성은 안 건드림)

            if (pt.atkMult) finalAtkMult += ((pt.atkMult - 1.0) * ptMult);
            if (pt.hpMult) finalHpMult += ((pt.hpMult - 1.0) * ptMult);
            if (pt.critRate) finalCritRate += (pt.critRate * ptMult);
            if (pt.critDmg) finalCritDmg += (pt.critDmg * ptMult);
            if (pt.vamp) finalVamp += (pt.vamp * ptMult);
            if (pt.def) finalDef += (pt.def * ptMult);
            if (pt.eva) finalEva += (pt.eva * ptMult);
            if (pt.spd) finalSpd += (pt.spd * ptMult);
        }
        
        let prestigeMultiplier = 1.0 + (this.prestigeCount || 0);

      // 💡 [수정됨] 0.00000001 처럼 길어지는 소수점을 1자리로 깔끔하게 절삭!
        return { 
            atk: Math.floor(this.rpgAtk * finalAtkMult * prestigeMultiplier), 
            hp: Math.floor(this.rpgMaxHp * finalHpMult * prestigeMultiplier),
            critRate: Number(finalCritRate.toFixed(1)), 
            critDmg: Number(finalCritDmg.toFixed(1)), 
            vamp: Number(finalVamp.toFixed(1)),
            def: Math.floor(finalDef), 
            eva: Number(finalEva.toFixed(1)), 
            spd: Number(finalSpd.toFixed(1))
        };
    }
};
