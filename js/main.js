
// =========================================================================
// 🛡️ [보안 시스템] 해커 접근 차단 및 브라우저 마비 (Anti-Cheat)
// =========================================================================

// 1. 우클릭 및 해킹 단축키 원천 차단
document.addEventListener('contextmenu', e => e.preventDefault()); // 마우스 우클릭 방지

document.addEventListener('keydown', e => {
    // F12 차단
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    // Ctrl + Shift + I / J / C (개발자 도구 단축키 차단)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        return false;
    }
    // Ctrl + U (페이지 소스 보기 차단)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
    }
});

// 2. 디버거(개발자 도구) 강제 마비 및 감지 시스템
setInterval(() => {
    const start = performance.now();
    
    // 💥 해커가 F12를 어떻게든 뚫고 여는 순간, 여기서 브라우저가 강제로 멈춤!
    debugger; 
    
    const end = performance.now();
    
    // 브라우저가 100ms 이상 멈춰있었다면 = "개발자 도구가 열려있다"고 판단!
    if (end - start > 100) {
        // 게임 화면을 시꺼먼 경고창으로 덮어버림
        document.body.innerHTML = `
            <div style="height: 100vh; width: 100vw; background-color: #05050a; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ef4444; z-index: 9999; position: fixed; top: 0; left: 0;">
                <div style="font-size: 6rem; margin-bottom: 20px; animation: pulse 2s infinite;">🚨</div>
                <h2 style="font-size: 1.5rem; font-weight: 900; text-align: center; margin-bottom: 10px;">불법적인 접근이 감지되었습니다.</h2>
                <p style="color: #64748b; font-size: 0.9rem;">비정상적인 프로그램이나 개발자 도구가 실행 중입니다.<br>창을 닫고 새로고침 해주세요.</p>
            </div>
        `;
        // 게임 루프를 강제로 터뜨려서 수치 조작을 원천 차단
        throw new Error("보안 시스템 작동: 게임 강제 종료");
    }
}, 1000); // 1초마다 감시
// =========================================================================
// 🚀 앱 부팅 (초기화)
// =========================================================================
window.onload = function() {
    // 🚨 [진짜 최종 원인 해결!] 자바스크립트의 함정 돌파 마법의 2줄!
    // 시스템이 데이터를 못 찾는 버그를 강제 연결로 박살냅니다!
    window.GameData = GameData;
    window.GameSystem = GameSystem;

    // 💡 자동 로그인 및 오토 세이브 감시자 출동!
    GameSystem.Auth.init();
    AssetPreloader.preloadAll();
    
    try {
        // 1. 세이브 데이터(GameState)를 가장 먼저 불러옵니다! (아주 중요)
        GameState.load(); 
        
        // 2. 퀘스트 등 기타 시스템 초기화
        if (GameSystem.Quest) GameSystem.Quest.init(); 
        GameSystem.applyNicknameUI();
        UIManager.init();

        // 🌟 3. 세이브 데이터를 모두 불러온 '직후'에 배경화면을 입혀줍니다!
        if (window.GameSystem && GameSystem.Lobby && GameSystem.Lobby.applyBackground) {
            GameSystem.Lobby.applyBackground();
        }

    } catch(e) { console.error("초기화 오류:", e); }
};
