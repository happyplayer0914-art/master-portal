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
    ownedCosmetics: [],
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
        // (닉네임, deviceId 불러오는 앞부분 코드는 그대로 유지)
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
        
        this.rpgStage = this._safeLoad('master_stage', 1);
        this.rpgAtk = this._safeLoad('master_atk', 10);
        this.rpgMaxHp = this._safeLoad('master_max_hp', 100);
        this.currentHp = this._safeLoad('master_current_hp', this.rpgMaxHp);

        this.ownedCosmetics = this._safeLoad('master_ownedCosmetics', []);
        
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
        
        let w = this._safeLoad('master_equipped_weapon', 'none'); this.equippedWeapon = (w === 'none' ? null : w);
        let a = this._safeLoad('master_equipped_armor', 'none'); this.equippedArmor = (a === 'none' ? null : a);
        let ac = this._safeLoad('master_equipped_accessory', 'none'); this.equippedAccessory = (ac === 'none' ? null : ac);

        // 💡 퀘스트 데이터 보호 로직 (에러 발생 시 강제 초기화)
        const defaultQuestData = {
            daily: { date: "", progress: {} }, 
            achievements: { progress: {}, completed: [] } 
        };
        const questRaw = this._safeLoad('master_quest_data', defaultQuestData);
        if (questRaw && questRaw.daily && questRaw.daily.date !== undefined) {
            this.questData = questRaw;
        } else {
            this.questData = defaultQuestData;
        }
        
        this.checkDailyReset();
        this.checkAndRevive();
    },

    save() {
        localStorage.setItem('master_nickname', this.nickname);
        
        // 🔒 저장할 땐 모두 _encode로 외계어 변환!
        localStorage.setItem('master_gold', this._encode(this.gold));
        localStorage.setItem('master_gem', this._encode(this.gem));
        localStorage.setItem('last_checkin', this._encode(this.lastCheckIn));
        localStorage.setItem('master_synth_pity', this._encode(this.synthPity)); 
        localStorage.setItem('master_play_rewards_map', this._encode(this.lastPlayRewards));
        localStorage.setItem('master_last_idle', this._encode(this.lastIdleCheck));
        localStorage.setItem('master_stage', this._encode(this.rpgStage));
        localStorage.setItem('master_atk', this._encode(this.rpgAtk));
        localStorage.setItem('master_max_hp', this._encode(this.rpgMaxHp));
        localStorage.setItem('master_current_hp', this._encode(this.currentHp));
        
        localStorage.setItem('master_ownedCosmetics', this._encode(this.ownedCosmetics));
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
        
        localStorage.setItem('master_equipped_weapon', this._encode(this.equippedWeapon || 'none'));
        localStorage.setItem('master_equipped_armor', this._encode(this.equippedArmor || 'none'));
        localStorage.setItem('master_equipped_accessory', this._encode(this.equippedAccessory || 'none'));
    },

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.questData.daily.date !== today) { this.questData.daily.date = today; this.questData.daily.progress = {}; this.save(); }
    },
    
    checkAndRevive() {
        const today = new Date().toLocaleDateString();
        if (isNaN(this.currentHp) || (this.currentHp <= 0 && localStorage.getItem('master_last_revive') !== today)) {
            this.currentHp = this.rpgMaxHp; localStorage.setItem('master_last_revive', today);
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
