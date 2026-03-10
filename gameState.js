// =========================================================================
// 3. GAME STATE (데이터 관리)
// =========================================================================
const GameState = {
    nickname: "위대한 길드장",
    deviceId: "", // 🔥 기기 식별자
    gold: 10000, gem: 10000, lastCheckIn: "",
    lastIdleCheck: Date.now(), // 🔥 방치형 보상 체크 시간 추가
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
        this.lastIdleCheck = parseInt(localStorage.getItem('master_last_idle') || Date.now()); // 불러오기
        this.rpgStage = parseInt(localStorage.getItem('master_stage') || "1");
        this.rpgAtk = parseInt(localStorage.getItem('master_atk') || "10");
        this.rpgMaxHp = parseInt(localStorage.getItem('master_max_hp') || "100");
        this.currentHp = parseInt(localStorage.getItem('master_current_hp') || this.rpgMaxHp);
        this.potions = parseInt(localStorage.getItem('master_potions') || "1");
        this.inventory = JSON.parse(localStorage.getItem('master_inventory') || "[]");
        this.equippedGear = localStorage.getItem('master_equipped_gear');
        this.equippedSkin = localStorage.getItem('master_equipped_skin');

        this.checkAndRevive();
        if (localStorage.getItem('master_in_battle') === 'true') {
            localStorage.removeItem('master_in_battle');
            this.isBattling = false;
            setTimeout(() => alert(`🚨 전투 도중 이탈하여 처음 위치로 돌아왔습니다.`), 500);
        }
    },

    save() {
        localStorage.setItem('master_nickname', this.nickname);
        localStorage.setItem('master_gold', this.gold);
        localStorage.setItem('master_gem', this.gem);
        localStorage.setItem('master_last_idle', this.lastIdleCheck); // 저장하기
        localStorage.setItem('master_stage', this.rpgStage);
        localStorage.setItem('master_atk', this.rpgAtk);
        localStorage.setItem('master_max_hp', this.rpgMaxHp);
        localStorage.setItem('master_current_hp', this.currentHp);
        localStorage.setItem('master_potions', this.potions);
        localStorage.setItem('master_inventory', JSON.stringify(this.inventory));
        if(this.equippedGear) localStorage.setItem('master_equipped_gear', this.equippedGear); else localStorage.removeItem('master_equipped_gear');
        if(this.equippedSkin) localStorage.setItem('master_equipped_skin', this.equippedSkin); else localStorage.removeItem('master_equipped_skin');
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
        if(this.equippedGear && GameData.items[this.equippedGear]) mult = GameData.items[this.equippedGear].statMult;
        return { atk: Math.floor(this.rpgAtk * mult), hp: Math.floor(this.rpgMaxHp * mult) };
    }
};;

