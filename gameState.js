const GameState = {
    nickname: "위대한 길드장",
    deviceId: "",
    pendingIdleGold: 0,
    gold: 100,
    gem: 50,
    lastCheckIn: "",
    rpgStage: 1,
    rpgAtk: 10,
    rpgMaxHp: 100,
    currentHp: 100,
    potions: 1,
    inventory: [],
    equippedGear: null,
    equippedSkin: null,
    isBattling: false,

    load() {
        this.nickname = localStorage.getItem('ultra_nickname') || "위대한 길드장";
        
        let storedId = localStorage.getItem('ultra_device_id');
        if (!storedId) {
            storedId = 'dev_' + Math.random().toString(36).substring(2, 11) + Date.now();
            localStorage.setItem('ultra_device_id', storedId);
        }
        this.deviceId = storedId;

        // 방치형 보상 정산 (8시간=480분 당 최대 100G)
        this.pendingIdleGold = parseFloat(localStorage.getItem('ultra_pending_idle_gold')) || 0;
        let lastSave = parseInt(localStorage.getItem('ultra_last_save')) || Date.now();
        let now = Date.now();
        let diffMins = (now - lastSave) / 60000;
        
        if (diffMins > 0) {
            // 1분당 약 0.2083G 누적
            let earned = diffMins * (100 / 480);
            this.pendingIdleGold += earned;
            if (this.pendingIdleGold > 100) this.pendingIdleGold = 100;
            localStorage.setItem('ultra_last_save', now.toString());
        }

        this.gold = parseInt(localStorage.getItem('ultra_gold')) || 100;
        this.gem = parseInt(localStorage.getItem('ultra_gem')) || 50;
        this.lastCheckIn = localStorage.getItem('ultra_last_checkin') || "";
        this.rpgStage = parseInt(localStorage.getItem('ultra_stage')) || 1;
        this.rpgAtk = parseInt(localStorage.getItem('ultra_atk')) || 10;
        this.rpgMaxHp = parseInt(localStorage.getItem('ultra_max_hp')) || 100;
        this.currentHp = parseInt(localStorage.getItem('ultra_current_hp')) || this.rpgMaxHp;
        this.potions = parseInt(localStorage.getItem('ultra_potions')) || 1;
        this.inventory = JSON.parse(localStorage.getItem('ultra_inventory') || "[]");
        this.equippedGear = localStorage.getItem('ultra_equipped_gear');
        this.equippedSkin = localStorage.getItem('ultra_equipped_skin');

        this.isBattling = false;
        localStorage.removeItem('ultra_in_battle');
    },

    save() {
        let lastSave = parseInt(localStorage.getItem('ultra_last_save')) || Date.now();
        let now = Date.now();
        let diffMins = (now - lastSave) / 60000;
        if (diffMins > 0) {
            this.pendingIdleGold += diffMins * (100 / 480);
            if (this.pendingIdleGold > 100) this.pendingIdleGold = 100;
        }

        localStorage.setItem('ultra_nickname', this.nickname);
        localStorage.setItem('ultra_gold', this.gold.toString());
        localStorage.setItem('ultra_gem', this.gem.toString());
        localStorage.setItem('ultra_stage', this.rpgStage.toString());
        localStorage.setItem('ultra_atk', this.rpgAtk.toString());
        localStorage.setItem('ultra_max_hp', this.rpgMaxHp.toString());
        localStorage.setItem('ultra_current_hp', this.currentHp.toString());
        localStorage.setItem('ultra_potions', this.potions.toString());
        localStorage.setItem('ultra_inventory', JSON.stringify(this.inventory));
        localStorage.setItem('ultra_pending_idle_gold', this.pendingIdleGold.toString());
        localStorage.setItem('ultra_last_save', now.toString());
        
        if (this.equippedGear) localStorage.setItem('ultra_equipped_gear', this.equippedGear);
        if (this.equippedSkin) localStorage.setItem('ultra_equipped_skin', this.equippedSkin);
    },

    getTotalStats() {
        let mult = 1.0;
        if (this.equippedGear && GameData.items[this.equippedGear]) {
            mult = GameData.items[this.equippedGear].statMult || 1.0;
        }
        return {
            atk: Math.floor(this.rpgAtk * mult),
            hp: Math.floor(this.rpgMaxHp * mult)
        };
    }
};
