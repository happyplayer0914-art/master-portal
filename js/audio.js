// =========================================================================
// 3. AUDIO ENGINE (사운드 시스템)
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
        
        // 💥 [타격감 4종 세트 분리!]
        hit_normal: () => AudioEngine.playTone(300, 'square', 0.1, 0.1), // 촥! (가볍고 날카로운 평타)
        hit_crit: () => { AudioEngine.playTone(800, 'sawtooth', 0.05, 0.15); setTimeout(()=>AudioEngine.playTone(400, 'square', 0.15, 0.15), 50); }, // 챙-쾅! (짜릿한 크리티컬)
        hit_player: () => AudioEngine.playTone(120, 'sawtooth', 0.2, 0.2), // 퍽! (둔탁하게 맞는 소리)
        evade: () => { AudioEngine.playTone(900, 'sine', 0.1, 0.05); setTimeout(()=>AudioEngine.playTone(600, 'sine', 0.1, 0.05), 50); }, // 슈슉! (바람 가르는 회피)
        
        boss: () => { AudioEngine.playTone(50, 'square', 1.0, 0.2); AudioEngine.playTone(60, 'sawtooth', 1.5, 0.2); },
        warning: () => { AudioEngine.playTone(300, 'sawtooth', 0.3, 0.1); setTimeout(()=>AudioEngine.playTone(300, 'sawtooth', 0.3, 0.1), 400); }, // 보스 경고음 추가
        gacha_build: () => { AudioEngine.playTone(400, 'sine', 0.1, 0.1); setTimeout(()=>AudioEngine.playTone(500, 'sine', 0.1, 0.1), 200); setTimeout(()=>AudioEngine.playTone(600, 'sine', 0.1, 0.1), 400); },
        gacha_reveal: () => { AudioEngine.playTone(880, 'sine', 0.2, 0.1); setTimeout(()=>AudioEngine.playTone(1760, 'sine', 0.4, 0.15), 150); }
    }
};

document.body.addEventListener('touchstart', () => AudioEngine.init(), { once: true });
document.body.addEventListener('click', () => AudioEngine.init(), { once: true });
// 👉 수정 3: 이 한 줄을 추가해야 다른 파일(system.js 등)에서 window.AudioEngine으로 소리를 불러올 수 있습니다!
window.AudioEngine = AudioEngine;
