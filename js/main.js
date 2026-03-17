
// =========================================================================
// 🛡️ [보안 시스템] 해커 접근 차단 및 브라우저 마비 (Anti-Cheat)
// =========================================================================

document.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('keydown', e => {
    if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) { e.preventDefault(); return false; }
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) { e.preventDefault(); return false; }
});

setInterval(() => {
    const start = performance.now();
    debugger; 
    const end = performance.now();
    if (end - start > 100) {
        document.body.innerHTML = `<div style="height: 100vh; width: 100vw; background-color: #05050a; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ef4444; z-index: 9999; position: fixed; top: 0; left: 0;"><div style="font-size: 6rem; margin-bottom: 20px; animation: pulse 2s infinite;">🚨</div><h2 style="font-size: 1.5rem; font-weight: 900; text-align: center; margin-bottom: 10px;">불법적인 접근이 감지되었습니다.</h2><p style="color: #64748b; font-size: 0.9rem;">창을 닫고 새로고침 해주세요.</p></div>`;
        throw new Error("보안 시스템 작동: 게임 강제 종료");
    }
}, 1000);

// =========================================================================
// 🚀 앱 부팅 (초기화) - 연쇄 붕괴 방지 완벽 패치!
// =========================================================================
window.onload = function() {
    window.GameData = GameData;
    window.GameSystem = GameSystem;
    window.UIManager = UIManager;

    // 1. 보안/로그인 로딩
    try {
        GameSystem.Auth.init();
    } catch(e) { alert("🚨 Auth 초기화 에러: " + e.message); }
    
    AssetPreloader.preloadAll();
    
    // 🌟 2. 금고 데이터 로딩 (여기서 에러가 나도 화면은 무조건 그립니다!)
    try {
        GameState.load(); 
    } catch(e) { 
        alert("🚨 세이브 데이터 로딩 에러!\n(" + e.message + ")\n\n데이터 꼬임이 발생했지만, 화면은 강제로 띄웁니다!"); 
    }

    // 🌟 3. 퀘스트 로딩 (독립 실행)
    try {
        if (GameSystem.Quest) GameSystem.Quest.init(); 
    } catch(e) { 
        alert("🚨 퀘스트 로딩 에러!\n(" + e.message + ")"); 
    }

    // 🌟 4. 화면(UI) 그리기 (앞에서 무슨 일이 있었든 무조건 900만 골드 뿌림!)
    try {
        GameSystem.applyNicknameUI();
        UIManager.init();

        if (window.GameSystem && GameSystem.Lobby && GameSystem.Lobby.applyBackground) {
            GameSystem.Lobby.applyBackground();
        }
    } catch(e) { 
        alert("🚨 화면 렌더링(UI) 에러!\n(" + e.message + ")"); 
    }
};
