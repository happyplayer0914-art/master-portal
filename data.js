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
   },
    quests: {
        daily: [
            { id: 'd1', name: '전투 전문가', desc: '심연의 탑 3회 진입', goal: 3, rewardGem: 10 },
            { id: 'd2', name: '연금술사의 조수', desc: '아이템 연성 1회 시도', goal: 1, rewardGem: 15 },
            { id: 'd3', name: '탐험의 즐거움', desc: '테스트 플레이 1회 완료', goal: 1, rewardGem: 5 }
        ],
        achievements: [
            { id: 'a1', name: '초보 정복자', desc: '심연의 탑 5층 도달', goal: 5, rewardGem: 50 },
            { id: 'a2', name: '숙련된 연금술사', desc: '희귀 등급 이상 아이템 획득', goal: 1, rewardGem: 100 },
            { id: 'a3', name: '몬스터 학살자', desc: '누적 몬스터 50마리 토벌', goal: 50, rewardGem: 200 }
        ]
    }
};
