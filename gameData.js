// =========================================================================
// 1. GAME DATA (게임 데이터베이스)
// =========================================================================
const GameData = {
    items: {
        'c1': { id: 'c1', type: 'gear', name: '낡은 철검', emoji: '🗡️', rarity: 'common', color: 'text-slate-400', statMult: 1.05 },
        'c2': { id: 'c2', type: 'gear', name: '가죽 갑옷', emoji: '🦺', rarity: 'common', color: 'text-slate-400', statMult: 1.05 },
        'c3': { id: 'c3', type: 'gear', name: '평범한 반지', emoji: '💍', rarity: 'common', color: 'text-slate-400', statMult: 1.05 },
        'r1': { id: 'r1', type: 'gear', name: '기사단의 롱소드', emoji: '⚔️', rarity: 'rare', color: 'text-blue-400', statMult: 1.15 },
        'r2': { id: 'r2', type: 'gear', name: '강철 대방패', emoji: '🛡️', rarity: 'rare', color: 'text-blue-400', statMult: 1.15 },
        'r3': { id: 'r3', type: 'skin', name: '은빛 테두리', emoji: '✨', rarity: 'rare', color: 'text-blue-400' },
        'e1': { id: 'e1', type: 'gear', name: '마력의 지팡이', emoji: '🪄', rarity: 'epic', color: 'text-purple-400', statMult: 1.30 },
        'e2': { id: 'e2', type: 'gear', name: '심연의 단검', emoji: '🔪', rarity: 'epic', color: 'text-purple-400', statMult: 1.30 },
        'e3': { id: 'e3', type: 'skin', name: '보랏빛 테두리', emoji: '🌌', rarity: 'epic', color: 'text-purple-400' },
        'l1': { id: 'l1', type: 'gear', name: '전설의 엑스칼리버', emoji: '🗡️', rarity: 'legendary', color: 'text-yellow-400', statMult: 1.50 },
        'l2': { id: 'l2', type: 'gear', name: '군주의 절대 왕관', emoji: '👑', rarity: 'legendary', color: 'text-yellow-400', statMult: 1.50 },
        'l3': { id: 'l3', type: 'skin', name: '초월자의 불꽃 테두리', emoji: '🔥', rarity: 'legendary', color: 'text-yellow-400' }
    },
    monsters: {
        normal: [
            {e:'🦠',n:'슬라임'},{e:'🦇',n:'흡혈박쥐'},{e:'👺',n:'고블린'},{e:'🐺',n:'마수늑대'},{e:'💀',n:'해골병사'}
        ],
        boss: {
            5:{e:'🐉',n:'심연의 드래곤'}, 10:{e:'🐙',n:'크라켄'}, 15:{e:'🦖',n:'폭군 렉스'}
        }
    }
};

// =========================================================================
// 2. AUDIO ENGINE (사운드 시스템)
// =========================================================================
const AudioEngine = {
    ctx: null, enabled: false,
    init() { if(!this.ctx) { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.enabled = true; } if(this.ctx.state === 'suspended') this.ctx.resume(); },
    playTone(freq, type, duration, vol) {
        if(!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + duration);
    },
    sfx: {
        click: () => AudioEngine.playTone(600, 'sine', 0.1, 0.05),
        equip: () => AudioEngine.playTone(800, 'triangle', 0.15, 0.1),
        coin: () => { AudioEngine.playTone(987, 'sine', 0.1, 0.1); setTimeout(()=>AudioEngine.playTone(1318, 'sine', 0.2, 0.1), 100); },
        hit: () => AudioEngine.playTone(150, 'sawtooth', 0.15, 0.15),
        boss: () => { AudioEngine.playTone(50, 'square', 1.0, 0.2); AudioEngine.playTone(60, 'sawtooth', 1.5, 0.2); },
        gacha_build: () => { AudioEngine.playTone(400, 'sine', 0.1, 0.1); setTimeout(()=>AudioEngine.playTone(500, 'sine', 0.1, 0.1), 200); setTimeout(()=>AudioEngine.playTone(600, 'sine', 0.1, 0.1), 400); },
        gacha_reveal: () => { AudioEngine.playTone(880, 'sine', 0.2, 0.1); setTimeout(()=>AudioEngine.playTone(1760, 'sine', 0.4, 0.15), 150); }
    }
};

document.body.addEventListener('touchstart', () => AudioEngine.init(), { once: true });
document.body.addEventListener('click', () => AudioEngine.init(), { once: true });