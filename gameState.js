// =========================================================================
// 3. GAME STATE (데이터 관리)
// =========================================================================
const GameState = {
    nickname: "위대한 길드장",
    deviceId: "", 
    gold: 10000, gem: 10000, 
    lastCheckIn: "",
    lastPlayRewards: {}, // 🔥 여러 테스트의 보상 날짜를 저장하기 위해 객체(Object)로 변경
    lastIdleCheck: Date.now(),
    rpgStage: 1, rpgAtk: 10, rpgMaxHp: 100, currentHp: 100,
    potions: 1, inventory: [], equippedGear: null, equippedSkin: null,
    isBattling: false,

    load() {
        this.nickname = localStorage.getItem('master_nickname') || "위대한 길드장";
        
        let storedId = localStorage.getItem('master_device_id');
        if(!storedId) {
            storedId = 'dev_' + Math.random().toString(36).substring(2, 11) + Date.now();
            localStorage.setItem('master_device_id', storedId);
        }
        this.deviceId = storedId;

        this.gold = parseInt(localStorage.getItem('master_gold') || "10000");
        this.gem = parseInt(localStorage.getItem('master_gem') || "10000");
        this.lastCheckIn = localStorage.getItem('last_checkin') || "";
        
        // 🔥 객체 데이터 로드
        try {
            this.lastPlayRewards = JSON.parse(localStorage.getItem('master_play_rewards_map') || "{}");
        } catch(e) {
            this.lastPlayRewards = {};
        }

        this.lastIdleCheck = parseInt(localStorage.getItem('master_last_idle') || Date.now());
        this.rpgStage = parseInt(localStorage.getItem('master_stage') || "1");
        this.rpgAtk = parseInt(localStorage.getItem('master_atk') || "10");
        this.rpgMaxHp = parseInt(localStorage.getItem('master_max_hp') || "100");
        this.currentHp = parseInt(localStorage.getItem('master_current_hp') || this.rpgMaxHp);
        this.potions = parseInt(localStorage.getItem('master_potions') || "1");
        this.inventory = JSON.parse(localStorage.getItem('master_inventory') || "[]");
        
        const storedGear = localStorage.getItem('master_equipped_gear');
        this.equippedGear = (storedGear === "null" || !storedGear) ? null : storedGear;
        
        const storedSkin = localStorage.getItem('master_equipped_skin');
        this.equippedSkin = (storedSkin === "null" || !storedSkin) ? null : storedSkin;

        this.checkAndRevive();
    },

    save() {
        localStorage.setItem('master_nickname', this.nickname);
        localStorage.setItem('master_gold', this.gold);
        localStorage.setItem('master_gem', this.gem);
        localStorage.setItem('last_checkin', this.lastCheckIn);
        
        // 🔥 객체 데이터 저장
        localStorage.setItem('master_play_rewards_map', JSON.stringify(this.lastPlayRewards));
        
        localStorage.setItem('master_last_idle', this.lastIdleCheck);
        localStorage.setItem('master_stage', this.rpgStage);
        localStorage.setItem('master_atk', this.rpgAtk);
        localStorage.setItem('master_max_hp', this.rpgMaxHp);
        localStorage.setItem('master_current_hp', this.currentHp);
        localStorage.setItem('master_potions', this.potions);
        localStorage.setItem('master_inventory', JSON.stringify(this.inventory));
        
        if(this.equippedGear) localStorage.setItem('master_equipped_gear', this.equippedGear); 
        else localStorage.removeItem('master_equipped_gear');
        
        if(this.equippedSkin) localStorage.setItem('master_equipped_skin', this.equippedSkin); 
        else localStorage.removeItem('master_equipped_skin');
    },

    checkAndRevive() {
        const today = new Date().toLocaleDateString();
        if (isNaN(this.currentHp) || (this.currentHp <= 0 && localStorage.getItem('master_last_revive') !== today)) {
            this.currentHp = this.rpgMaxHp;
            localStorage.setItem('master_last_revive', today);
        }
    },

    getTotalStats() {
        let mult = 1.0;
        if(this.equippedGear && GameData.items[this.equippedGear] && GameData.items[this.equippedGear].type === 'gear') {
            mult = GameData.items[this.equippedGear].statMult || 1.0;
        }
        return { atk: Math.floor(this.rpgAtk * mult), hp: Math.floor(this.rpgMaxHp * mult) };
    }
};
