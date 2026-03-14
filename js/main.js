// =========================================================================
// 🚀 앱 부팅 (초기화)
// =========================================================================
window.onload = function() {
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

        // 🌟 3. [핵심] 세이브 데이터를 모두 불러온 '직후'에 배경화면을 입혀줍니다!
        if (window.GameSystem && GameSystem.Lobby && GameSystem.Lobby.applyBackground) {
            GameSystem.Lobby.applyBackground();
        }

    } catch(e) { console.error("초기화 오류:", e); }
};
