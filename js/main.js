// =========================================================================
// 🚀 앱 부팅 (초기화)
// =========================================================================
window.onload = function() {
    // 💡 [신규 추가] 자동 로그인 및 오토 세이브 감시자 출동!
    GameSystem.Auth.init();
// 게임 시작 코드들 어딘가에 이 한 줄을 추가!
    AssetPreloader.preloadAll();
    
    try {
        GameState.load();
        
        // 🌟 [여기에 추가!!] 게임 켜질 때 퀘스트 진행도 싹 불러오기!
        if (GameSystem.Quest) GameSystem.Quest.init(); 

        // 💡 [신규 추가] 게임 켜질 때 닉네임 고정 버튼 숨길지 말지 결정!
        GameSystem.applyNicknameUI();
        UIManager.init();
    } catch(e) { console.error("초기화 오류:", e); }
};

