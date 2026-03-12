// =========================================================================
// 2. GAME STATE (데이터 관리)
// =========================================================================
const GameState = {
    nickname: "위대한 길드장",
    deviceId: "", 
    gold: 10000, gem: 10000, 
    synthPity: { rare: 0, epic: 0 }, 
    lastCheckIn: "",
    lastPlayRewards: {}, 
    lastIdleCheck: Date.now(),
    rpgStage: 1, rpgAtk: 10, rpgMaxHp: 100, currentHp: 100,
    potions: 1, inventory: [], 
    
    // 💡 [수정됨] 장비 칸이 3개로 나뉘었어!
    equippedWeapon: null, 
    equippedArmor: null, 
    equippedAccessory: null, 
    equippedSkin: null,
    
    isBattling: false,
    questData: {
        daily: { date: "", progress: {} }, 
        achievements: { progress: {}, completed: [] } 
    },
    
    load() {
        this.nickname = localStorage.getItem('master_nickname') || "위대한 길드장";
        let storedId = localStorage.getItem('master_device_id');
        if(!storedId) {
            storedId = 'dev_' + Math.random().toString(36).substring(2, 11) + Date.now();
            localStorage.setItem('master_device_id', storedId);
        }
        this.deviceId = storedId;
        try { this.synthPity = JSON.parse(localStorage.getItem('master_synth_pity') || '{"rare":0, "epic":0}'); } catch(e) { this.synthPity = { rare: 0, epic: 0 }; }

        this.gold = parseInt(localStorage.getItem('master_gold') || "10000");
        this.gem = parseInt(localStorage.getItem('master_gem') || "10000");
        this.lastCheckIn = localStorage.getItem('last_checkin') || "";
        try { this.lastPlayRewards = JSON.parse(localStorage.getItem('master_play_rewards_map') || "{}"); } catch(e) { this.lastPlayRewards = {}; }

        this.lastIdleCheck = parseInt(localStorage.getItem('master_last_idle') || Date.now());
        this.rpgStage = parseInt(localStorage.getItem('master_stage') || "1");
        this.rpgAtk = parseInt(localStorage.getItem('master_atk') || "10");
        this.rpgMaxHp = parseInt(localStorage.getItem('master_max_hp') || "100");
        this.currentHp = parseInt(localStorage.getItem('master_current_hp') || this.rpgMaxHp);
        this.potions = parseInt(localStorage.getItem('master_potions') || "1");
        this.inventory = JSON.parse(localStorage.getItem('master_inventory') || "[]");
        
        // 💡 [수정됨] 3개의 장비 슬롯을 각각 불러오기
        const w = localStorage.getItem('master_equipped_weapon'); this.equippedWeapon = (w === "null" || !w) ? null : w;
        const a = localStorage.getItem('master_equipped_armor'); this.equippedArmor = (a === "null" || !a) ? null : a;
        const ac = localStorage.getItem('master_equipped_accessory'); this.equippedAccessory = (ac === "null" || !ac) ? null : ac;
        
        const s = localStorage.getItem('master_equipped_skin'); this.equippedSkin = (s === "null" || !s) ? null : s;

        try {
            this.questData = JSON.parse(localStorage.getItem('master_quest_data') || '{"daily":{"date":"","progress":{}},"achievements":{"progress":{},"completed":[]}}');
            this.checkDailyReset();
        } catch(e) { console.error("Quest data load error"); }
        this.checkAndRevive();
    },

    save() {
        localStorage.setItem('master_nickname', this.nickname);
        localStorage.setItem('master_gold', this.gold);
        localStorage.setItem('master_gem', this.gem);
        localStorage.setItem('last_checkin', this.lastCheckIn);
        localStorage.setItem('master_synth_pity', JSON.stringify(this.synthPity)); 
        localStorage.setItem('master_play_rewards_map', JSON.stringify(this.lastPlayRewards));
        localStorage.setItem('master_last_idle', this.lastIdleCheck);
        localStorage.setItem('master_stage', this.rpgStage);
        localStorage.setItem('master_atk', this.rpgAtk);
        localStorage.setItem('master_max_hp', this.rpgMaxHp);
        localStorage.setItem('master_current_hp', this.currentHp);
        localStorage.setItem('master_potions', this.potions);
        localStorage.setItem('master_inventory', JSON.stringify(this.inventory));
        localStorage.setItem('master_quest_data', JSON.stringify(this.questData));
        
        // 💡 [수정됨] 3개의 장비 슬롯을 각각 저장하기
        if(this.equippedWeapon) localStorage.setItem('master_equipped_weapon', this.equippedWeapon); else localStorage.removeItem('master_equipped_weapon');
        if(this.equippedArmor) localStorage.setItem('master_equipped_armor', this.equippedArmor); else localStorage.removeItem('master_equipped_armor');
        if(this.equippedAccessory) localStorage.setItem('master_equipped_accessory', this.equippedAccessory); else localStorage.removeItem('master_equipped_accessory');
        
        if(this.equippedSkin) localStorage.setItem('master_equipped_skin', this.equippedSkin); else localStorage.removeItem('master_equipped_skin');
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

    // 💡 [핵심 수정됨] 무기, 방어구, 장신구의 스탯을 모두 합산해서 계산!
    getTotalStats() {
        let finalAtkMult = 1.0;
        let finalHpMult = 1.0;
        
        if (this.equippedWeapon && GameData.items[this.equippedWeapon]) {
            finalAtkMult += (GameData.items[this.equippedWeapon].atkMult - 1.0);
        }
        if (this.equippedArmor && GameData.items[this.equippedArmor]) {
            finalHpMult += (GameData.items[this.equippedArmor].hpMult - 1.0);
        }
        if (this.equippedAccessory && GameData.items[this.equippedAccessory]) {
            if (GameData.items[this.equippedAccessory].atkMult) finalAtkMult += (GameData.items[this.equippedAccessory].atkMult - 1.0);
            if (GameData.items[this.equippedAccessory].hpMult) finalHpMult += (GameData.items[this.equippedAccessory].hpMult - 1.0);
        }
        
        return { 
            atk: Math.floor(this.rpgAtk * finalAtkMult), 
            hp: Math.floor(this.rpgMaxHp * finalHpMult) 
        };
    }
};
