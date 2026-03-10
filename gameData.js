// =========================================================================
// 1. GAME DATA (게임 데이터베이스)
// =========================================================================
// gameData.js
const GameData = {
    items: {
        'c1': { id: 'c1', type: 'gear', name: '낡은 철검', emoji: '🗡️', rarity: 'common', statMult: 1.05, crit: 0.02, dodge: 0 },
        'c2': { id: 'c2', type: 'gear', name: '가죽 갑옷', emoji: '🦺', rarity: 'common', statMult: 1.05, crit: 0, dodge: 0.02 },
        'r1': { id: 'r1', type: 'gear', name: '기사의 장검', emoji: '⚔️', rarity: 'rare', statMult: 1.15, crit: 0.05, dodge: 0.02 },
        'r2': { id: 'r2', type: 'skin', name: '은빛 오라', emoji: '✨', rarity: 'rare', crit: 0.02, dodge: 0.03 },
        'e1': { id: 'e1', type: 'gear', name: '마법사 지팡이', emoji: '🪄', rarity: 'epic', statMult: 1.35, crit: 0.10, dodge: 0.05 },
        'e2': { id: 'e2', type: 'skin', name: '심연의 불꽃', emoji: '🌌', rarity: 'epic', crit: 0.05, dodge: 0.08 },
        'l1': { id: 'l1', type: 'gear', name: '엑스칼리버', emoji: '🔱', rarity: 'legendary', statMult: 1.70, crit: 0.15, dodge: 0.10 },
        'l2': { id: 'l2', type: 'skin', name: '초월자의 관', emoji: '👑', rarity: 'legendary', crit: 0.10, dodge: 0.15 }
    },
    monsters: {
        normal: [
            {e:'🦠', n:'슬라임'}, {e:'BAT', n:'흡혈박쥐'}, {e:'ORC', n:'심연의 오크'}, {e:'WOLF', n:'그림자 늑대'}, {e:'DRAGON', n:'고대의 비룡'}
        ],
        boss: {
            5: {e:'GHOST', n:'망령의 군주'},
            10: {e:'KRAKEN', n:'심연의 가디언'},
            15: {e:'FIRE', n:'염옥의 지배자'}
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
