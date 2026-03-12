// =========================================================================
// 1. GAME DATA (게임 데이터베이스)
// =========================================================================
const GameData = {
    items: {
        // 🟢 일반 (Common) - 초반용 깡스탯 위주
        'w_c1': { id: 'w_c1', type: 'gear', subType: 'weapon', name: '낡은 철검', emoji: '🗡️', rarity: 'common', color: 'text-slate-400', atkMult: 1.10 },
        'w_c2': { id: 'w_c2', type: 'gear', subType: 'weapon', name: '녹슨 단검', emoji: '🔪', rarity: 'common', color: 'text-slate-400', atkMult: 1.05, critRate: 5 },
        'a_c1': { id: 'a_c1', type: 'gear', subType: 'armor', name: '가죽 갑옷', emoji: '🦺', rarity: 'common', color: 'text-slate-400', hpMult: 1.10 },
        'ac_c1': { id: 'ac_c1', type: 'gear', subType: 'accessory', name: '평범한 반지', emoji: '💍', rarity: 'common', color: 'text-slate-400', atkMult: 1.05, hpMult: 1.05 },
        
        // 🔵 희귀 (Rare) - 약간의 특성 부여
        'w_r1': { id: 'w_r1', type: 'gear', subType: 'weapon', name: '기사단의 롱소드', emoji: '⚔️', rarity: 'rare', color: 'text-blue-400', atkMult: 1.25 },
        'w_r2': { id: 'w_r2', type: 'gear', subType: 'weapon', name: '암살자의 비수', emoji: '🗡️', rarity: 'rare', color: 'text-blue-400', atkMult: 1.15, critRate: 15, critDmg: 20 },
        'a_r1': { id: 'a_r1', type: 'gear', subType: 'armor', name: '강철 대방패', emoji: '🛡️', rarity: 'rare', color: 'text-blue-400', hpMult: 1.30 },
        'a_r2': { id: 'a_r2', type: 'gear', subType: 'armor', name: '가시 갑옷', emoji: '🧥', rarity: 'rare', color: 'text-blue-400', hpMult: 1.15, vamp: 2 },
        'ac_r1': { id: 'ac_r1', type: 'gear', subType: 'accessory', name: '수호의 목걸이', emoji: '📿', rarity: 'rare', color: 'text-blue-400', atkMult: 1.10, hpMult: 1.15 },
        's_r1': { id: 's_r1', type: 'skin', name: '은빛 테두리', emoji: '✨', rarity: 'rare', color: 'text-blue-400' },
        
        // 🟣 영웅 (Epic) - 뚜렷한 컨셉 (크리 몰빵 vs 피흡 좀비)
        'w_e1': { id: 'w_e1', type: 'gear', subType: 'weapon', name: '마력의 지팡이', emoji: '🪄', rarity: 'epic', color: 'text-purple-400', atkMult: 1.50, critRate: 10 },
        'w_e2': { id: 'w_e2', type: 'gear', subType: 'weapon', name: '그림자 낫', emoji: '🪝', rarity: 'epic', color: 'text-purple-400', atkMult: 1.30, critRate: 25, critDmg: 50 },
        'w_e3': { id: 'w_e3', type: 'gear', subType: 'weapon', name: '흡혈귀의 이빨', emoji: '🦇', rarity: 'epic', color: 'text-purple-400', atkMult: 1.35, vamp: 8 },
        'a_e1': { id: 'a_e1', type: 'gear', subType: 'armor', name: '성기사의 성갑', emoji: '🛡️', rarity: 'epic', color: 'text-purple-400', hpMult: 1.60 },
        'a_e2': { id: 'a_e2', type: 'gear', subType: 'armor', name: '망령의 망토', emoji: '👻', rarity: 'epic', color: 'text-purple-400', hpMult: 1.30, vamp: 5, critRate: 10 },
        'ac_e1': { id: 'ac_e1', type: 'gear', subType: 'accessory', name: '마나의 귀걸이', emoji: '💎', rarity: 'epic', color: 'text-purple-400', atkMult: 1.25, hpMult: 1.25 },
        's_e1': { id: 's_e1', type: 'skin', name: '보랏빛 테두리', emoji: '🌌', rarity: 'epic', color: 'text-purple-400' },
        
        // 🟡 전설 (Legendary) - 사기적인 능력치!
        'w_l1': { id: 'w_l1', type: 'gear', subType: 'weapon', name: '전설의 엑스칼리버', emoji: '🗡️', rarity: 'legendary', color: 'text-yellow-400', atkMult: 2.20, critRate: 20, critDmg: 50 },
        'w_l2': { id: 'w_l2', type: 'gear', subType: 'weapon', name: '파멸의 마검', emoji: '🗡️', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.80, critRate: 40, critDmg: 100 },
        'w_l3': { id: 'w_l3', type: 'gear', subType: 'weapon', name: '피의 군주 지팡이', emoji: '🩸', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.90, vamp: 15 },
        'a_l1': { id: 'a_l1', type: 'gear', subType: 'armor', name: '절대자의 황금 갑옷', emoji: '🛡️', rarity: 'legendary', color: 'text-yellow-400', hpMult: 2.50 },
        'a_l2': { id: 'a_l2', type: 'gear', subType: 'armor', name: '불사의 심장', emoji: '❤️‍🔥', rarity: 'legendary', color: 'text-yellow-400', hpMult: 1.80, vamp: 10 },
        'ac_l1': { id: 'ac_l1', type: 'gear', subType: 'accessory', name: '초월의 반지', emoji: '💍', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.50, hpMult: 1.50, critRate: 15 },
        's_l1': { id: 's_l1', type: 'skin', name: '초월자의 불꽃 테두리', emoji: '🔥', rarity: 'legendary', color: 'text-yellow-400' }
    },
   monsters: {
        // 💡 [업데이트] 일반 몬스터 20종 대량 추가! (층수가 올라갈수록 번갈아가며 등장)
        normal: [
            {e:'🦠',n:'초록 슬라임'}, {e:'🦇',n:'동굴 박쥐'}, {e:'👺',n:'붉은 고블린'}, {e:'🐺',n:'굶주린 늑대'}, {e:'💀',n:'되살아난 해골'},
            {e:'🦂',n:'맹독 전갈'}, {e:'🐍',n:'사막 뱀'}, {e:'🕷️',n:'거대 거미'}, {e:'🦅',n:'흉포한 독수리'}, {e:'🐗',n:'돌진하는 멧돼지'},
            {e:'🧟',n:'떠도는 좀비'}, {e:'🧛',n:'하급 뱀파이어'}, {e:'🧞',n:'타락한 정령'}, {e:'🧜‍♂️',n:'심해의 괴수'}, {e:'🧌',n:'동굴 트롤'},
            {e:'🦍',n:'광포한 유인원'}, {e:'🥷',n:'그림자 암살자'}, {e:'🤖',n:'고대 수호병'}, {e:'👽',n:'외계 생명체'}, {e:'👻',n:'원한 맺힌 악령'}
        ],
        // 💡 [업데이트] 5층마다 등장하는 보스 50층까지 대량 추가!
        boss: {
            5:{e:'🐉',n:'새끼 드래곤'}, 10:{e:'🐙',n:'심해의 크라켄'}, 15:{e:'🦖',n:'폭군 렉스'},
            20:{e:'🌋',n:'화산의 지배자'}, 25:{e:'❄️',n:'서리 여왕'}, 30:{e:'👁️',n:'주시하는 눈'},
            35:{e:'🕷️',n:'여왕 타란튤라'}, 40:{e:'👹',n:'아수라'}, 45:{e:'💀',n:'죽음의 기사'}, 50:{e:'👑',n:'마계의 군주'}
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

