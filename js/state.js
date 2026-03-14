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

    // 🛡️ [안전 장치] 옛날 데이터(쌩얼)와 암호화 데이터를 알아서 구분해서 불러오는 스마트 로더
    _safeLoad(key, defaultValue) {
        const val = localStorage.getItem(key);
        if (val === null || val === 'null') return defaultValue;
        
        // 1. 암호화 해독 시도 (Base64 외계어 형식이면)
        if (val.length > 5 && (val.endsWith('=') || val.startsWith('ey'))) {
            const decoded = this._decode(val);
            if (decoded !== null) return decoded;
        }
        
        // 2. 옛날 쌩얼 데이터 호환성 유지 (JSON인 경우)
        try { if (val.startsWith('[') || val.startsWith('{')) return JSON.parse(val); } catch(e) {}
        
        // 3. 숫자나 일반 문자열인 경우
        if (!isNaN(val) && val !== '') return Number(val);
        return val;
    },
    
    load() {
        // 닉네임과 기기 ID는 암호화하지 않고 그대로 유지 (인증 호환용)
        this.nickname = localStorage.getItem('master_nickname') || "위대한 길드장";
        let storedId = localStorage.getItem('master_device_id');
        if(!storedId) {
            storedId = 'dev_' + Math.random().toString(36).substring(2, 11) + Date.now();
            localStorage.setItem('master_device_id', storedId);
        }
        this.deviceId = storedId;

        // 💡 모든 데이터를 안전한 _safeLoad로 불러옵니다!
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

        const questRaw = this._safeLoad('master_quest_data', null);
        if (questRaw) this.questData = questRaw;
        
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
        // 🛡️ [절대 방어] 데이터가 정상적인 객체(Object)가 아니거나 꼬여있으면 아예 새 뼈대로 싹 갈아끼웁니다!
        if (!this.questData || typeof this.questData !== 'object' || Array.isArray(this.questData)) {
            this.questData = { daily: { date: "", progress: {} }, achievements: { progress: {}, completed: [] } };
        }
        if (!this.questData.daily || typeof this.questData.daily !== 'object') {
            this.questData.daily = { date: "", progress: {} };
        }

        const today = new Date().toDateString();
        if (this.questData.daily.date !== today) { 
            this.questData.daily.date = today; 
            this.questData.daily.progress = {}; 
            this.save(); 
        }
    },

    getTotalStats() {
        let finalAtkMult = 1.0; let finalHpMult = 1.0;
        let finalCritRate = 10; let finalCritDmg = 150; let finalVamp = 0;      
        
        let finalDef = this.rpgDef; let finalEva = this.rpgEva; let finalSpd = this.rpgSpd;

        const gears = [this.equippedWeapon, this.equippedArmor, this.equippedAccessory];
        
        gears.forEach(id => {
            if (id && GameData.items[id]) {
                const item = GameData.items[id];
                if (item.atkMult) finalAtkMult += (item.atkMult - 1.0);
                if (item.hpMult) finalHpMult += (item.hpMult - 1.0);
                if (item.critRate) finalCritRate += item.critRate;
                if (item.critDmg) finalCritDmg += item.critDmg;
                if (item.vamp) finalVamp += item.vamp;
                if (item.def) finalDef += item.def;
                if (item.eva) finalEva += item.eva;
                if (item.spd) finalSpd += item.spd;
            }
        });
        
        let prestigeMultiplier = 1.0 + (this.prestigeCount || 0);

        return { 
            atk: Math.floor(this.rpgAtk * finalAtkMult * prestigeMultiplier), 
            hp: Math.floor(this.rpgMaxHp * finalHpMult * prestigeMultiplier),
            critRate: finalCritRate, critDmg: finalCritDmg, vamp: finalVamp,
            def: finalDef, eva: finalEva, spd: finalSpd
        };
    }
};
