// =========================================================================
// 1. GAME DATA (게임 데이터베이스)
// =========================================================================
const GameData = {
    items: {
  // 🟢 일반 (Common) - 초반용 깡스탯 위주
   'w_c1': { id: 'w_c1', type: 'gear', subType: 'weapon', name: '낡은 철검', emoji: '🗡️', img: 'w_c1.png', rarity: 'common', color: 'text-slate-400', atkMult: 1.15, flavorText: '이음새가 헐거워진 평범한 철검. 맨손보다는 확실히 낫다.' },
   'w_c2': { id: 'w_c2', type: 'gear', subType: 'weapon', name: '녹슨 단검', emoji: '🔪', img: 'w_c2.png', rarity: 'common', color: 'text-slate-400', atkMult: 1.05, critRate: 5, flavorText: '녹이 슬어 묘하게 치명적인 상처를 입힐 수 있을 것 같은 단검.' },
   'w_c3': { id: 'w_c3', type: 'gear', subType: 'weapon', name: '거친 몽둥이', emoji: '🏏', img: 'w_c3.png', rarity: 'common', color: 'text-slate-400', atkMult: 1.15, flavorText: '어느 숲에서나 주울 수 있을 법한 단단한 나뭇가지.' }, 
    
   'a_c1': { id: 'a_c1', type: 'gear', subType: 'armor', name: '가죽 갑옷', emoji: '🦺', img: 'a_c1.png', rarity: 'common', color: 'text-slate-400', hpMult: 1.10, flavorText: '조잡하게 엮은 가죽 갑옷. 가벼운 찰과상 정도는 막아준다.' },
   'a_c2': { id: 'a_c2', type: 'gear', subType: 'armor', name: '빛바랜 천옷', emoji: '👕', img: 'a_c2.png', rarity: 'common', color: 'text-slate-400', hpMult: 1.12, eva: 2, flavorText: '오래 입어 색이 다 빠진 옷. 놀랍게도 활동하기엔 편해서 공격을 피하기 좋다.' }, 
   'a_c3': { id: 'a_c3', type: 'gear', subType: 'armor', name: '나무 방패', emoji: '👕', img: 'a_c3.png', rarity: 'common', color: 'text-slate-400', hpMult: 1.12, eva: 2, flavorText: '두꺼운 판자를 덧대어 만든 조악한 방패. 묵직한 일격엔 쪼개질지도 모른다.' }, 
    
   'ac_c1': { id: 'ac_c1', type: 'gear', subType: 'accessory', name: '평범한 반지', emoji: '💍', img: 'ac_c1.png', rarity: 'common', color: 'text-slate-400', atkMult: 1.05, hpMult: 1.05, flavorText: '시장 구석에서 흔하게 파는 차가운 구리 반지.' },
   'ac_c2': { id: 'ac_c2', type: 'gear', subType: 'accessory', name: '행운의 동전', emoji: '🪙', img: 'ac_c2.png', rarity: 'common', color: 'text-slate-400', atkMult: 1.02, critRate: 3, flavorText: '품고 있으면 어쩐지 오늘은 운수가 좋을 것 같은 기분이 드는 낡은 동전.' }, 

   // 🔵 희귀 (Rare) - 약간의 특성 부여 (공속, 회피, 방어력 등 등장)
   'w_r1': { id: 'w_r1', type: 'gear', subType: 'weapon', name: '기사단의 롱소드', emoji: '⚔️', img: 'w_r1.png', rarity: 'rare', color: 'text-blue-400', atkMult: 1.25, def: 5, flavorText: '제국 기사단이 사용하던 규격화된 검. 날이 예리하게 서 있고 밸런스가 뛰어나다.' }, 
   'w_r2': { id: 'w_r2', type: 'gear', subType: 'weapon', name: '암살자의 비수', emoji: '🗡️', img: 'w_r2.png', rarity: 'rare', color: 'text-blue-400', atkMult: 1.15, critRate: 15, critDmg: 20, flavorText: '빛을 반사하지 않는 새까만 단검. 오직 치명적인 일격을 위해 벼려졌다.' },
   'w_r3': { id: 'w_r3', type: 'gear', subType: 'weapon', name: '사냥꾼의 뿔활', emoji: '🏹', img: 'w_r3.png', rarity: 'rare', color: 'text-blue-400', atkMult: 6.20, spd: 50, flavorText: '거대 마수의 뿔을 깎아 만든 활. 시위를 당기는 손끝에서 매서운 바람이 인다.' }, 
    
   'a_r1': { id: 'a_r1', type: 'gear', subType: 'armor', name: '강철 방패', emoji: '🛡️', img: 'a_r1.png', rarity: 'rare', color: 'text-blue-400', hpMult: 1.30, def: 10, flavorText: '전장의 포화 속에서도 주인을 든든하게 지켜준 견고한 방패.' }, 
   'a_r2': { id: 'a_r2', type: 'gear', subType: 'armor', name: '쇠사슬 갑옷', emoji: '🧥', img: 'a_r2.png', rarity: 'rare', color: 'text-blue-400', hpMult: 1.15, vamp: 2, flavorText: '적의 피가 스며들수록 은은하게 붉은빛을 띠는 섬뜩하고도 질긴 사슬 갑옷.' },
   'a_r3': { id: 'a_r3', type: 'gear', subType: 'armor', name: '도적의 망토', emoji: '🧣', img: 'a_r3.png', rarity: 'rare', color: 'text-blue-400', hpMult: 1.20, eva: 8, flavorText: '어둠 속으로 녹아들 수 있게 해주는 가벼운 천. 발걸음 소리마저 지워준다.' }, 
    
   'ac_r1': { id: 'ac_r1', type: 'gear', subType: 'accessory', name: '수호의 목걸이', emoji: '📿', img: 'ac_r1.png', rarity: 'rare', color: 'text-blue-400', atkMult: 1.10, hpMult: 1.15, def: 5, flavorText: '은은한 축복이 깃든 목걸이. 목에 거는 순간 마음이 차분해지는 기분이 든다.' }, 
   'ac_r2': { id: 'ac_r2', type: 'gear', subType: 'accessory', name: '바람의 장화', emoji: '🥾', img: 'ac_r2.png', rarity: 'rare', color: 'text-blue-400', hpMult: 1.10, spd: 10, eva: 3, flavorText: '신고 뛰면 마치 중력이 약해진 것처럼 몸이 깃털처럼 가벼워진다.' }, 
   'ac_r3': { id: 'ac_r3', type: 'gear', subType: 'accessory', name: '투사의 증표', emoji: '🏅', img: 'ac_r3.png', rarity: 'rare', color: 'text-blue-400', atkMult: 1.15, hpMult: 1.05, critDmg: 25, flavorText: '피비린내 나는 투기장에서 끝까지 살아남은 자만이 쥘 수 있는 영광스러운 훈장.' }, 
    
   // 🟣 영웅 (Epic) - 뚜렷한 컨셉 (크리 몰빵, 피흡 좀비, 쾌속 딜러 등)
   'w_e1': { id: 'w_e1', type: 'gear', subType: 'weapon', name: '마력의 지팡이', emoji: '🪄', img: 'w_e1.png', rarity: 'epic', color: 'text-purple-400', atkMult: 1.50, critRate: 10, def: 10, flavorText: '끝없는 지혜와 마력이 소용돌이치는 지팡이. 손에 쥐는 순간 정신이 맑아진다.' },
   'w_e2': { id: 'w_e2', type: 'gear', subType: 'weapon', name: '그림자 낫', emoji: '🪝', img: 'w_e2.png', rarity: 'epic', color: 'text-purple-400', atkMult: 1.30, critRate: 25, critDmg: 50, flavorText: '영혼마저 베어낼 듯한 서늘한 기운을 뿜어내는 사신의 무기.' },
   'w_e3': { id: 'w_e3', type: 'gear', subType: 'weapon', name: '흡혈귀의 이빨 단검', emoji: '🦇', img: 'w_e3.png', rarity: 'epic', color: 'text-purple-400', atkMult: 1.35, vamp: 8, spd: 5, flavorText: '살점을 파고들어 적의 생명력을 탐욕스럽게 포식하는 섬뜩한 단검.' }, 
   'w_e4': { id: 'w_e4', type: 'gear', subType: 'weapon', name: '강철의 대검', emoji: '🦇', img: 'w_e4.png', rarity: 'epic', color: 'text-purple-400', atkMult: 1.35, vamp: 8, spd: 5, flavorText: '거대한 겉모습과 달리, 피를 묻힐수록 무게를 잃고 춤추듯 날렵해지는 기괴한 대검.' }, 
    
   'a_e1': { id: 'a_e1', type: 'gear', subType: 'armor', name: '성기사의 성갑', emoji: '🛡️', img: 'a_e1.png', rarity: 'epic', color: 'text-purple-400', hpMult: 1.60, def: 15, flavorText: '신성한 기운이 감도는 은백색 갑옷. 어둠의 피조물들이 감히 접근하지 못한다.' }, 
   'a_e2': { id: 'a_e2', type: 'gear', subType: 'armor', name: '망령의 망토', emoji: '👻', img: 'a_e2.png', rarity: 'epic', color: 'text-purple-400', hpMult: 1.30, vamp: 5, critRate: 10, eva: 8, flavorText: '원혼들의 덧없는 속삭임이 들려오는 망토. 물리적인 공격을 기형적으로 흩어낸다.' },
   'a_e3': { id: 'a_e3', type: 'gear', subType: 'armor', name: '닌자의 수의', emoji: '🥷', img: 'a_e3.png', rarity: 'epic', color: 'text-purple-400', hpMult: 1.25, eva: 15, spd: 15, flavorText: '그림자 일족의 비전이 담긴 옷. 걸치는 순간 바람 그 자체가 된 듯한 착각에 빠진다.' }, 
   'a_e4': { id: 'a_e4', type: 'gear', subType: 'armor', name: '정령의 방패', emoji: '🥷', img: 'a_e4.png', rarity: 'epic', color: 'text-purple-400', hpMult: 1.25, eva: 15, spd: 15, flavorText: '자연의 정령들이 감싸고 도는 신비로운 방패. 위험한 순간 스스로 움직여 주인을 보호한다.' }, 
    
   'ac_e1': { id: 'ac_e1', type: 'gear', subType: 'accessory', name: '마나의 귀걸이', emoji: '💎', img: 'ac_e1.png', rarity: 'epic', color: 'text-purple-400', atkMult: 1.25, hpMult: 1.25, def: 10, flavorText: '심연의 마력 결정체로 세공된 귀걸이. 신체의 무한한 잠재력을 일깨워준다.' },
   'ac_e2': { id: 'ac_e2', type: 'gear', subType: 'accessory', name: '광전사의 뿔피리', emoji: '📯', img: 'ac_e2.png', rarity: 'epic', color: 'text-purple-400', atkMult: 1.45, hpMult: 1.05, spd: 20, flavorText: '부는 순간 이성을 잃고 오직 살육에만 전념하게 만드는 저주받은 유물.' }, 
   'ac_e3': { id: 'ac_e3', type: 'gear', subType: 'accessory', name: '세계수의 잎사귀', emoji: '🍃', img: 'ac_e3.png', rarity: 'epic', color: 'text-purple-400', hpMult: 1.40, vamp: 10, eva: 5, flavorText: '아무리 시간이 지나도 마르지 않는 생명력을 품고 있는 성스러운 잎사귀.' }, 

   // 🟡 전설 (Legendary) - 사기적인 능력치!
   'w_l1': { id: 'w_l1', type: 'gear', subType: 'weapon', name: '전설의 엑스칼리버', emoji: '🗡️', img: 'w_l1.png', rarity: 'legendary', color: 'text-yellow-400', atkMult: 2.20, critRate: 20, critDmg: 50, def: 10, flavorText: '선택받은 자만이 뽑을 수 있다는 찬란한 성검. 검을 휘두를 때마다 빛의 궤적이 일대를 정화한다.' },
   'w_l2': { id: 'w_l2', type: 'gear', subType: 'weapon', name: '파멸의 마검', emoji: '🗡️', img: 'w_l2.png', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.80, critRate: 40, critDmg: 100, spd: 15, flavorText: '세상을 종말의 구렁텅이로 몰아넣었다고 전해지는 재앙의 검. 쥐는 자의 영혼마저 갉아먹는다.' },
   'w_l3': { id: 'w_l3', type: 'gear', subType: 'weapon', name: '피의 군주의 지팡이', emoji: '🩸', img: 'w_l3.png', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.90, vamp: 15, eva: 10, flavorText: '고대 뱀파이어 로드의 권좌를 상징하는 핏빛 지팡이. 주변의 모든 생명력을 탐욕스럽게 착취한다.' },
    
   'a_l1': { id: 'a_l1', type: 'gear', subType: 'armor', name: '절대자의 황금 갑옷', emoji: '🛡️', img: 'a_l1.png', rarity: 'legendary', color: 'text-yellow-400', hpMult: 2.50, def: 20, flavorText: '태양의 심장을 깎아 만든 듯한 눈부신 갑옷. 입는 자에게 절대적인 불패의 신화를 선사한다.' },
   'a_l2': { id: 'a_l2', type: 'gear', subType: 'armor', name: '불사의 심장', emoji: '❤️‍🔥', img: 'a_l2.png', rarity: 'legendary', color: 'text-yellow-400', hpMult: 1.90, vamp: 12, def: 15, flavorText: '고동을 멈추지 않는 정체불명의 심장 조각. 죽음의 문턱에서 주인을 강제로 끄집어낸다.' },
   'a_l3': { id: 'a_l3', type: 'gear', subType: 'armor', name: '환영의 거울 갑옷', emoji: '🪞', img: 'a_l3.png', rarity: 'legendary', color: 'text-yellow-400', hpMult: 2.10, eva: 25, spd: 20, flavorText: '수천 개의 진실의 거울 파편으로 빚어진 갑옷. 적은 오직 자신의 헛된 환영만을 베게 될 뿐이다.' }, 
    
   'ac_l1': { id: 'ac_l1', type: 'gear', subType: 'accessory', name: '초월의 반지', emoji: '💍', img: 'ac_l1.png', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.50, hpMult: 1.50, critRate: 15, def: 10, flavorText: '필멸자의 한계를 아득히 뛰어넘게 해주는 기적의 반지. 손가락에 끼우는 순간 세계의 이면이 보인다.' },
   'ac_l2': { id: 'ac_l2', type: 'gear', subType: 'accessory', name: '시간술사의 시계', emoji: '⏱️', img: 'ac_l2.png', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.40, hpMult: 1.40, spd: 35, eva: 15, flavorText: '초침이 거꾸로 돌아가는 기묘한 회중시계. 전장의 시간을 지배하는 자가 곧 승리한다.' }, 
   'ac_l3': { id: 'ac_l3', type: 'gear', subType: 'accessory', name: '파괴신의 눈물', emoji: '💧', img: 'ac_l3.png', rarity: 'legendary', color: 'text-yellow-400', atkMult: 2.00, critRate: 30, critDmg: 120, flavorText: '태초의 신이 분노로 흘린 단 한 방울의 눈물. 깃든 힘을 해방하면 대륙 하나가 증발한다.' },

      // ==========================================
        // 🌟 [MYTHIC] MBTI 신화 등급 전용 장비 (16종)
        // ==========================================
        'mythic_entj_w': { 
            id: 'mythic_entj_w', name: '태양의 심판검', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '☀️', 
            atkMult: 4.5, critDmg: 200, spd: 15, mbti: 'ENTJ', job: '전장을 지배하는 군주', passive: '절대 권력', 
            desc: '[ENTJ 신화] 적을 굴복시키는 군주의 검.',
            img: 'weapon_entj.png',
            img_cutin: 'weapon_entj_cutin.png', 
            flavorText: '태양의 힘을 가득 머금은 검. 금방이라도 일대를 태워버릴 것 같다...' 
        },
        'mythic_intj_w': { 
            id: 'mythic_intj_w', name: '금기된 심연의 스태프', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '📖', 
            atkMult: 5.0, critRate: 15, spd: 10, mbti: 'INTJ', job: '심연의 대마법사', passive: '천재의 영역', 
            desc: '[INTJ 신화] 심연의 지식이 담긴 스태프.',
            img: 'weapon_intj.png',
            img_cutin: 'weapon_intj_cutin.png', 
            flavorText: '"깊은 심연의 공포를 형상화한 금단의 스태프. 마법의 정수를 끊임없이 갈구한다..."' 
        },
        'mythic_infp_w': { 
            id: 'mythic_infp_w', name: '세계수의 하프', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🌿', 
            atkMult: 3.0, hpMult: 3.0, vamp: 20, mbti: 'INFP', job: '달빛의 은둔술사', passive: '요정의 축복', 
            desc: '[INFP 신화] 상처를 치유하는 달빛의 선율.',
            img: 'weapon_infp.png',
            img_cutin: 'weapon_infp_cutin.png', 
            flavorText: '"당신의 깊은 상처는 이 선율이 부드럽게 보듬어 줄 거예요."' 
        },
        'mythic_estp_w': { 
            id: 'mythic_estp_w', name: '전신의 쌍도끼', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🪓', 
            atkMult: 3.5, spd: 45, critDmg: 150, mbti: 'ESTP', job: '폭풍의 무법자', passive: '아드레날린 폭주', 
            desc: '[ESTP 신화] 멈추지 않는 폭풍의 연격.',
            img: 'weapon_estp.png',
            img_cutin: 'weapon_estp_cutin.png', 
            flavorText: '"하하하! 누가 날 막겠다고? 폭풍처럼 싹 다 쓸어버려 주마!"' 
        },
        'mythic_isfj_a': { 
            id: 'mythic_isfj_a', name: '여신의 성배', type: 'gear', subType: 'accessory', rarity: 'mythic', emoji: '🏆', 
            hpMult: 4.0, def: 15, vamp: 15, mbti: 'ISFJ', job: '성소를 지키는 가디언', passive: '불굴의 수호진', 
            desc: '[ISFJ 신화] 아군을 지키는 절대적인 수호.',
            img: 'acc_isfj.png',
            img_cutin: 'acc_isfj_cutin.png', 
            flavorText: '"걱정 마십시오. 제 목숨을 바쳐서라도 당신을 끝까지 지켜내겠습니다."' 
        },
        'mythic_istj_ar': { 
            id: 'mythic_istj_ar', name: '서약의 대방패', type: 'gear', subType: 'armor', rarity: 'mythic', emoji: '🛡️', 
            hpMult: 3.5, def: 30, eva: 5, mbti: 'ISTJ', job: '철의 규율 기사단장', passive: '절대 방벽', 
            desc: '[ISTJ 신화] 어떤 공격도 뚫지 못하는 철의 방벽.',
            img: 'armor_istj.png',
            img_cutin: 'armor_istj_cutin.png', 
            flavorText: '"원칙과 규율에 따라, 다가오는 모든 위협을 차단한다."' 
        },
        'mythic_isfp_w': { 
            id: 'mythic_isfp_w', name: '숲의 숨결 플루트', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🎵', 
            atkMult: 2.5, eva: 35, spd: 25, mbti: 'ISFP', job: '바람의 음유시인', passive: '정령의 속삭임', 
            desc: '[ISFP 신화] 바람처럼 유려한 정령의 몸놀림.',
            img: 'weapon_isfp.png',
            img_cutin: 'weapon_isfp_cutin.png', 
            flavorText: '"자유로운 바람의 노래가 부디 내 검 끝에 머물기를..."' 
        },
        'mythic_intp_a': { 
            id: 'mythic_intp_a', name: '현자의 돌', type: 'gear', subType: 'accessory', rarity: 'mythic', emoji: '🔮', 
            atkMult: 3.0, critRate: 25, def: 30, mbti: 'INTP', job: '미궁의 연금술사', passive: '진리 탐구', 
            desc: '[INTP 신화] 우주의 진리가 담긴 궁극의 돌.',
            img: 'acc_intp.png',
            img_cutin: 'acc_intp_cutin.png', 
            flavorText: '"진리는 늘 단순한 법. 철저하게 분해해서 다시 증명해 주지."' 
        },
        'mythic_istp_w': { 
            id: 'mythic_istp_w', name: '흑요석 단검', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🗡️', 
            atkMult: 3.0, critRate: 35, critDmg: 300, mbti: 'ISTP', job: '그림자의 암살자', passive: '치명적 포착', 
            desc: '[ISTP 신화] 단 한 번의 틈을 노리는 그림자.',
            img: 'weapon_istp.png',
            img_cutin: 'weapon_istp_cutin.png', 
            flavorText: '"소리 없이 다가가, 확실하고 깔끔하게 끝낸다."' 
        },
        'mythic_esfp_w': { 
            id: 'mythic_esfp_w', name: '환희의 쌍검', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '⚔️', 
            atkMult: 3.2, eva: 25, spd: 35, mbti: 'ESFP', job: '환희의 무희', passive: '스포트라이트', 
            desc: '[ESFP 신화] 전장을 무대로 만드는 화려한 검무.',
            img: 'weapon_esfp.png',
            img_cutin: 'weapon_esfp_cutin.png', 
            flavorText: '"이 전장은 나의 스테이지야! 다들 나만 보라고~!"' 
        },
        'mythic_enfp_a': { 
            id: 'mythic_enfp_a', name: '별빛 나침반', type: 'gear', subType: 'accessory', rarity: 'mythic', emoji: '🧭', 
            hpMult: 2.5, eva: 20, spd: 20, mbti: 'ENFP', job: '혜성의 탐험가', passive: '무한한 영감', 
            desc: '[ENFP 신화] 미지의 세계로 인도하는 나침반.',
            img: 'acc_enfp.png',
            img_cutin: 'acc_enfp_cutin.png', 
            flavorText: '"저 너머에 무엇이 우릴 기다리고 있을까? 빨리 가보자, 마스터!"' 
        },
        'mythic_entp_w': { 
            id: 'mythic_entp_w', name: '차원 파괴포', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '☄️', 
            atkMult: 5.5, critRate: 10, critDmg: 250, mbti: 'ENTP', job: '혼돈의 마도공학자', passive: '변수 창출', 
            desc: '[ENTP 신화] 차원을 찢어발기는 혼돈의 포격.',
            img: 'weapon_entp.png',
            img_cutin: 'weapon_entp_cutin.png', 
            flavorText: '"이게 터질지 안 터질지는 나도 몰라! 일단 쏘고 생각하자고!"' 
        },
        'mythic_estj_w': { 
            id: 'mythic_estj_w', name: '지배자의 군기', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🚩', 
            atkMult: 3.8, def: 30, hpMult: 2.0, mbti: 'ESTJ', job: '강철의 총사령관', passive: '일제 사격', 
            desc: '[ESTJ 신화] 승리를 이끄는 압도적인 지휘력.',
            img: 'weapon_estj.png',
            img_cutin: 'weapon_estj_cutin.png', 
            flavorText: '"진형을 유지하라! 나를 따르는 자에게 압도적인 승리가 있을 것이다!"' 
        },
        'mythic_esfj_ar': { 
            id: 'mythic_esfj_ar', name: '여명의 방패', type: 'gear', subType: 'armor', rarity: 'mythic', emoji: '🔰', 
            hpMult: 4.5, def: 30, vamp: 10, mbti: 'ESFJ', job: '여명의 성기사단장', passive: '구원의 빛', 
            desc: '[ESFJ 신화] 어둠을 몰아내는 여명의 빛.',
            img: 'armor_esfj.png',
            img_cutin: 'armor_esfj_cutin.png', 
            flavorText: '"어둠이 짙을수록, 다가올 여명은 더욱 찬란하게 빛나는 법입니다."' 
        },
        'mythic_enfj_w': { 
            id: 'mythic_enfj_w', name: '태양의 지휘봉', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🪄', 
            atkMult: 3.5, hpMult: 2.5, spd: 20, mbti: 'ENFJ', job: '태양의 선지자', passive: '군중의 찬가', 
            desc: '[ENFJ 신화] 전군을 고양시키는 태양의 인도자.',
            img: 'weapon_enfj.png',
            img_cutin: 'weapon_enfj_cutin.png', 
            flavorText: '"모두가 하나 된 마음으로 흔들림 없이 나아갈 때, 태양은 응답할 것입니다."' 
        },
        'mythic_infj_a': { 
            id: 'mythic_infj_a', name: '운명의 수정구', type: 'gear', subType: 'accessory', rarity: 'mythic', emoji: '🔮', 
            atkMult: 2.5, eva: 30, def: 15, mbti: 'INFJ', job: '별을 읽는 예언자', passive: '미래 예지', 
            desc: '[INFJ 신화] 모든 공격을 꿰뚫어 보는 예지의 눈.',
            img: 'acc_infj.png',
            img_cutin: 'acc_infj_cutin.png', 
            flavorText: '"별들은 이미 이 전투의 결말을 모두 알고 있답니다."' 
        },
        },// 👈👈👈 [바로 이거!!!] 아이템 가방(items)을 닫아주는 마법의 괄호 추가!
    monsters: {
        // 💡 [테마별 구역 시스템] 10층 단위로 등장하는 몬스터가 바뀝니다!
        normal: {
            // 🌲 1구역 (1~9층) : 초보자의 숲
            1: [
                { id: 'n1', e: '🦠', n: '파랑 슬라임', img: 'slime.png' },
                { id: 'n2', e: '🦇', n: '동굴 박쥐', img: 'bat.png' },
                { id: 'n3', e: '👺', n: '고블린', img: 'goblin.png' }
            ],
            // 🏜️ 2구역 (11~19층) : 메마른 황무지
            2: [
                { id: 'n4', e: '🐺', n: '굶주린 늑대', img: 'wolf.png' },
                { id: 'n6', e: '🦂', n: '맹독 전갈', img: 'scorpion.png' },
                { id: 'n7', e: '🐍', n: '사막 뱀', img: 'snake.png' }
            ],
            // ⛰️ 3구역 (21~29층) : 거친 산맥
            3: [
                { id: 'n8', e: '🕷️', n: '거대 거미', img: 'spider.png' },
                { id: 'n9', e: '🦅', n: '흉포한 독수리', img: 'eagle.png' },
                { id: 'n10', e: '🐗', n: '돌연변이 멧돼지', img: 'boar.png' }
            ],
            // 🏚️ 4구역 (31~39층) : 버려진 유적
            4: [
                { id: 'n5', e: '💀', n: '되살아난 해골', img: 'skeleton.png' },
                { id: 'n11', e: '🧟', n: '떠도는 좀비', img: 'zombie.png' },
                { id: 'n26', e: '🧟‍♂️', n: '피에 굶주린 구울', img: 'ghoul.png' }
            ],
            // 🌊 5구역 (41~49층) : 오염된 심해
            5: [
                { id: 'n14', e: '🧜‍♂️', n: '심해의 괴수', img: 'merman.png' },
                { id: 'n24', e: '💩', n: '타락한 인어', img: 'siren.png' },
                { id: 'n25', e: '🦑', n: '심해의 촉수', img: 'tentacle.png' }
            ],
            // 🩸 6구역 (51~59층) : 저주받은 핏빛 성
            6: [
                { id: 'n12', e: '🧛', n: '하급 뱀파이어', img: 'vampire.png' },
                { id: 'n17', e: '🥷', n: '그림자 암살자', img: 'ninja.png' },
                { id: 'n27', e: '🎎', n: '저주받은 인형', img: 'cursed_doll.png' }
            ],
            // 🗿 7구역 (61~69층) : 얼어붙은 왕국
            7: [
                { id: 'n13', e: '🧞', n: '얼어붙은 하녀', img: 'icemaid.png' },
                { id: 'n18', e: '🤖', n: '서리마녀', img: 'icemgaic.png' },
                { id: 'n28', e: '🧙‍♂️', n: '서리 정령', img: 'icespirit.png' }
            ],
            // 🌑 8구역 (71~79층) : 타락한 기사단의 무덤
            8: [
                { id: 'n20', e: '👻', n: '원한 맺힌 악령', img: 'ghost.png' },
                { id: 'n21', e: '🗿', n: '미쳐버린 가고일', img: 'gargoyle.png' },
                { id: 'n22', e: '🤺', n: '타락한 흑기사', img: 'dark_knight.png' }
            ],
            // 🔥 9구역 (81~89층) : 불타는 지옥문
            9: [
                { id: 'n15', e: '🧌', n: '지옥 슬라임', img: 'hell_slime.png' },
                { id: 'n16', e: '🦍', n: '용암 골렘', img: 'magma_golem.png' },
                { id: 'n23', e: '🔥', n: '불의 정령', img: 'firesp.png' }
            ],
            // 🌌 10구역 (91~99층) : 심연의 끝
            10: [
                { id: 'n19', e: '👽', n: '심연의 감시자', img: 'abyss_eye.png' },
                { id: 'n29', e: '🦴', n: '본 드래곤', img: 'bone_dragon.png' },
                { id: 'n30', e: '🌌', n: '차원의 파괴자', img: 'void_walker.png' }
            ]
        },
        
        // 보스 데이터도 동일하게 img 속성을 뚫어둘 수 있습니다!
        boss: {
            10:{e:'🐉',n:'오염된 나무정령', img:'boss_tree.png'}, 
            20:{e:'🦖',n:'폭군 렉스', img:'boss_rex.png'},
            30:{e:'🌋',n:'화산의 지배자', img:'boss_dragon.png'},
            40:{e:'👁️',n:'주시하는 눈', img:'boss_eye.png'},  
            50:{e:'🐙',n:'심해의 크라켄', img:'boss_kraken.png'},
            60:{e:'👹',n:'서큐버스', img:'boss_vp.png'}, 
            70:{e:'❄️',n:'서리 여왕', img:'boss_icequeen.png'}, 
            80:{e:'💀',n:'죽음의 기사', img:'boss_deathknight.png'},
            90:{e:'🕷️',n:'지옥의 수문장', img:'boss_hell.png'},
            100:{e:'👑',n:'심연의 군주', img:'boss_abysslord.png'}
        }
  }, // <-- quests 닫는 괄호
// (이 위에 monsters: { ... } 덩어리가 끝나는 쉼표(,)가 있어야 합니다!)

   // =========================================================================
    // 🌸 [개편] 미소녀 파트너(동료) 데이터베이스 (속성 시스템 적용)
    // =========================================================================
    partners: {
        // 🔥 1. 화염 (Fire) - 0.5초마다 지속 딜링
        'pt_r1': { 
            id: 'pt_r1', name: '견습 마법사 엘라', rarity: 'rare', emoji: '🪄',
            img_sd: 'partner_ella_sd.png', img_full: 'partner_ella_full.png',
            atkMult: 1.10, hpMult: 1.05, 
            element: 'fire', skillCooldown: 500, skillValue: 15, // 0.5초마다 공격력의 15%
            skillName: '화염 퐁퐁', skillDesc: '0.5초마다 적에게 마스터 공격력의 15% 화염 지속 피해',
            flavorText: '"길드장님! 제 뜨거운 불꽃을 보여드릴게요!"'
        },
        
        // 🌬️ 2. 바람 (Air) - n초마다 추가 타격 (분신)
        'pt_e1': { 
            id: 'pt_e1', name: '숲의 엘프 리아', rarity: 'epic', emoji: '🏹',
            img_sd: 'partner_lia_sd.png', img_full: 'partner_lia_full.png',
            atkMult: 1.20, spd: 10, eva: 5,
            element: 'air', skillCooldown: 3000, skillValue: 100, // 3초마다 공격 100% 1회 추가
            skillName: '바람의 환영', skillDesc: '3초마다 마스터의 공격을 그대로 1회 더 입힘 (분신 타격)',
            flavorText: '"바람처럼 빠르고 날카롭게 베어낼게요."'
        },

        // ❄️ 3. 빙결 (Ice) - [신규] n초마다 데미지 + 적 공격 정지
        'pt_e2': { 
            id: 'pt_e2', name: '서리마녀 실비아', rarity: 'epic', emoji: '❄️',
            img_sd: 'partner_silvia_sd.png', img_full: 'partner_silvia_full.png',
            atkMult: 1.15, hpMult: 1.15, eva: 10,
            element: 'ice', skillCooldown: 6000, skillValue: 50, skillDuration: 1500, // 6초마다 50% 딜 + 1.5초 기절
            skillName: '혹한의 감옥', skillDesc: '6초마다 적에게 50% 피해를 주고 1.5초간 공격 정지(빙결)',
            flavorText: '"얼어붙은 시간 속에서 조용히 잠드렴..."'
        },
        
        // 🪨 4. 대지 (Earth) - n초마다 최대 체력 비례 보호막
        'pt_l1': { 
            id: 'pt_l1', name: '성기사단장 아이리스', rarity: 'legendary', emoji: '🛡️',
            img_sd: 'partner_iris_sd.png', img_full: 'partner_iris_full.png',
            atkMult: 1.30, hpMult: 1.40, def: 15,
            element: 'earth', skillCooldown: 8000, skillValue: 20, // 8초마다 최대 체력의 20% 보호막
            skillName: '대지의 방벽', skillDesc: '8초마다 마스터 최대 체력의 20%만큼 든든한 보호막 생성',
            flavorText: '"제 방패가 깨지기 전까진 마스터에게 흠집도 낼 수 없습니다."'
        },

        // ⚡ 5. 번개 (Lightning) - [신규] n초마다 x초 동안 마스터 크리티컬 대폭 상승
        'pt_l2': { 
            id: 'pt_l2', name: '천둥의 성녀 클레어', rarity: 'legendary', emoji: '⚡',
            img_sd: 'partner_claire_sd.png', img_full: 'partner_claire_full.png',
            atkMult: 1.25, hpMult: 1.25, critRate: 15, spd: 15,
            element: 'lightning', skillCooldown: 10000, skillValue: 40, skillDuration: 4000, // 10초마다 4초간 크리 40% 증가
            skillName: '뇌명의 축복', skillDesc: '10초마다 4초 동안 마스터의 크리티컬 확률 40% 대폭 상승',
            flavorText: '"벼락이여, 마스터의 검에 치명적인 힘을 깃드소서!"'
        },
        // =========================================================================
    // 🐾 파트너(동료) 데이터베이스 (희귀, 영웅, 전설)
    // =========================================================================
  
        // 🟦 [RARE] 희귀 등급 (총 4종: 불 1, 대지 1, 무속성 2)
        'pt_r_fire': { 
            id: 'pt_r_fire', name: '횃불 코볼트', rarity: 'rare', emoji: '🐾',
            img_sd: 'partner_kobold_sd.png', img_full: 'partner_kobold_full.png',
            atkMult: 1.15, hpMult: 1.10, 
            element: 'fire', skillCooldown: 1000, skillValue: 20,
            skillName: '불티 던지기', skillDesc: '1초마다 횃불을 던져 공격력의 20% 화염 피해를 줍니다.',
            flavorText: '"앗 뜨거! 조심해, 털 탄다구!"'
        },
        'pt_r_earth': { 
            id: 'pt_r_earth', name: '꼬마 바위 골렘', rarity: 'rare', emoji: '🪨',
            img_sd: 'partner_rockgolem_sd.png', img_full: 'partner_rockgolem_full.png',
            atkMult: 1.05, hpMult: 1.20, def: 5,
            element: 'earth', skillCooldown: 5000, skillValue: 10,
            skillName: '단단한 돌멩이', skillDesc: '5초마다 마스터 체력의 10%만큼 작은 보호막을 생성합니다.',
            flavorText: '"돌... 단단하다... 마스터... 지킨다..."'
        },
        'pt_r_none1': { // 🌟 무속성 깡스탯 1호
            id: 'pt_r_none1', name: '도둑 너구리', rarity: 'rare', emoji: '🦝',
            img_sd: 'partner_raccoon_sd.png', img_full: 'partner_raccoon_full.png',
            atkMult: 1.30, hpMult: 1.05, spd: 15, eva: 10,
            element: 'none', skillCooldown: 99999, skillValue: 0,
            skillName: '재빠른 손놀림', skillDesc: '[무속성 패시브] 스킬이 없는 대신 마스터의 공격력과 회피/공속을 크게 높여줍니다.',
            flavorText: '"헤헤, 방금 몬스터 주머니에서 뭐 좀 슬쩍했지!"'
        },
        'pt_r_none2': { // 🌟 무속성 깡스탯 2호
            id: 'pt_r_none2', name: '떠돌이 용병', rarity: 'rare', emoji: '🗡️',
            img_sd: 'partner_merc_sd.png', img_full: 'partner_merc_full.png',
            atkMult: 1.10, hpMult: 1.35, def: 15,
            element: 'none', skillCooldown: 99999, skillValue: 0,
            skillName: '실전 압축 근육', skillDesc: '[무속성 패시브] 스킬이 없는 대신 마스터의 최대 체력과 방어력을 크게 높여줍니다.',
            flavorText: '"돈만 주면 앞장서지. 맷집 하나는 자신 있거든."'
        },

        // 🟪 [EPIC] 영웅 등급 (총 5종: 불 1, 대지 1, 번개 1, 빙결 1, 무속성 1)
        'pt_e_fire': { 
            id: 'pt_e_fire', name: '화염 도롱뇽', rarity: 'epic', emoji: '🦎',
            img_sd: 'partner_salamander_sd.png', img_full: 'partner_salamander_full.png',
            atkMult: 1.25, hpMult: 1.15, critRate: 5,
            element: 'fire', skillCooldown: 2000, skillValue: 35,
            skillName: '화염 구토', skillDesc: '2초마다 뜨거운 불을 토해 공격력의 35% 화염 피해를 줍니다.',
            flavorText: '"크르륵... (매운 걸 너무 많이 먹은 것 같다)"'
        },
        'pt_e_earth': { 
            id: 'pt_e_earth', name: '숲의 파수꾼', rarity: 'epic', emoji: '🌳',
            img_sd: 'partner_treant_sd.png', img_full: 'partner_treant_full.png',
            atkMult: 1.15, hpMult: 1.35, def: 15,
            element: 'earth', skillCooldown: 6000, skillValue: 15,
            skillName: '뿌리 얽기', skillDesc: '6초마다 튼튼한 뿌리로 최대 체력의 15% 쉴드를 부여합니다.',
            flavorText: '"바스락... 숲을 해치는 자... 용서 못 해..."'
        },
        'pt_e_lightn': { 
            id: 'pt_e_lightn', name: '찌릿찌릿 뇌조', rarity: 'epic', emoji: '🦅',
            img_sd: 'partner_thunderbird_sd.png', img_full: 'partner_thunderbird_full.png',
            atkMult: 1.30, hpMult: 1.10, spd: 20,
            element: 'lightning', skillCooldown: 8000, skillValue: 20, skillDuration: 3000,
            skillName: '정전기 방출', skillDesc: '8초마다 3초 동안 마스터의 크리티컬 확률을 20% 올려줍니다.',
            flavorText: '"삐융! 삐융! (털을 만지면 감전된다)"'
        },
        'pt_e_ice': { 
            id: 'pt_e_ice', name: '서리 늑대', rarity: 'epic', emoji: '🐺',
            img_sd: 'partner_frostwolf_sd.png', img_full: 'partner_frostwolf_full.png',
            atkMult: 1.20, hpMult: 1.25, eva: 10,
            element: 'ice', skillCooldown: 5000, skillValue: 30, skillDuration: 1000,
            skillName: '얼음 송곳니', skillDesc: '5초마다 공격력 30% 피해를 주고 적을 1초간 빙결(기절)시킵니다.',
            flavorText: '"아우우우~! (입김마저 꽁꽁 얼어붙는다)"'
        },
        'pt_e_none': { // 🌟 무속성 깡스탯 끝판왕 (영웅)
            id: 'pt_e_none', name: '베테랑 대장장이', rarity: 'epic', emoji: '🔨',
            img_sd: 'partner_smith_sd.png', img_full: 'partner_smith_full.png',
            atkMult: 1.45, hpMult: 1.45, critDmg: 50, def: 20,
            element: 'none', skillCooldown: 99999, skillValue: 0,
            skillName: '명장의 손길', skillDesc: '[무속성 패시브] 장비를 한계까지 벼려내 마스터의 전반적인 스탯을 폭발적으로 증가시킵니다.',
            flavorText: '"스킬 쓸 시간에 망치질이나 한 번 더 해라! 깡스탯이 최고여!"'
        },

        // 🟨 [LEGENDARY] 전설 등급 (총 6종: 불, 대지, 번개, 얼음, 바람, 빛)
        'pt_l_fire': { 
            id: 'pt_l_fire', name: '염룡의 새끼', rarity: 'legendary', emoji: '🐉',
            img_sd: 'partner_babydragon_sd.png', img_full: 'partner_babydragon_full.png', img_cutin: 'partner_babydragon_cutin.png',
            atkMult: 1.45, hpMult: 1.30, critRate: 15, vamp: 5,
            element: 'fire', skillCooldown: 3000, skillValue: 50,
            skillName: '용의 브레스', skillDesc: '3초마다 입에서 불을 뿜어 마스터 공격력의 50% 강력한 화염 피해를 입힙니다.',
            flavorText: '"캬아악! (아직 작지만 제법 용의 태가 난다)"'
        },
        'pt_l_earth': { 
            id: 'pt_l_earth', name: '고대 유적의 수호자', rarity: 'legendary', emoji: '🗿',
            img_sd: 'partner_ancientgolem_sd.png', img_full: 'partner_ancientgolem_full.png', img_cutin: 'partner_ancientgolem_cutin.png',
            atkMult: 1.25, hpMult: 1.60, def: 30, eva: -5, // 방어력이 엄청난 대신 회피 깎임
            element: 'earth', skillCooldown: 7000, skillValue: 25,
            skillName: '고대의 성벽', skillDesc: '7초마다 마스터 최대 체력의 25%만큼 파괴되지 않는 거대한 보호막을 생성합니다.',
            flavorText: '"위협... 배제한다. 침입자... 파괴한다..."'
        },
        'pt_l_lightn': { 
            id: 'pt_l_lightn', name: '폭풍을 부르는 뇌신', rarity: 'legendary', emoji: '🌩️',
            img_sd: 'partner_raijin_sd.png', img_full: 'partner_raijin_full.png', img_cutin: 'partner_raijin_cutin.png',
            atkMult: 1.50, hpMult: 1.20, spd: 30, critDmg: 50,
            element: 'lightning', skillCooldown: 9000, skillValue: 40, skillDuration: 4000,
            skillName: '뇌신의 분노', skillDesc: '9초마다 4초 동안 마스터의 무기에 번개를 감아 크리티컬 확률을 40% 올립니다.',
            flavorText: '"하늘이 분노하고 번개가 내리친다! 벌벌 떨어라!"'
        },
        'pt_l_ice': { 
            id: 'pt_l_ice', name: '빙하의 성기사', rarity: 'legendary', emoji: '🛡️',
            img_sd: 'partner_icepaladin_sd.png', img_full: 'partner_icepaladin_full.png', img_cutin: 'partner_icepaladin_cutin.png',
            atkMult: 1.35, hpMult: 1.45, def: 15, vamp: 10,
            element: 'ice', skillCooldown: 7000, skillValue: 70, skillDuration: 2000,
            skillName: '혹한의 심판', skillDesc: '7초마다 공격력 70% 피해를 입히고 적의 약점을 얼려 2초간 행동 불능(빙결)으로 만듭니다.',
            flavorText: '"나의 검은 흔들리지 않고, 나의 신념은 얼음처럼 단단하다."'
        },
        'pt_l_air': { 
            id: 'pt_l_air', name: '창공의 그리폰', rarity: 'legendary', emoji: '🦅',
            img_sd: 'partner_griffon_sd.png', img_full: 'partner_griffon_full.png', img_cutin: 'partner_griffon_cutin.png',
            atkMult: 1.40, hpMult: 1.35, eva: 25, spd: 25,
            element: 'air', skillCooldown: 4000, skillValue: 120,
            skillName: '회오리 강하', skillDesc: '4초마다 하늘에서 매섭게 강하하여 공격력의 120% 물리 타격을 입힙니다.',
            flavorText: '"끼에에엑! (바람을 가르며 전장을 지배한다)"'
        },
        'pt_l_light': { 
            id: 'pt_l_light', name: '성스러운 유니콘', rarity: 'legendary', emoji: '🦄',
            img_sd: 'partner_unicorn_sd.png', img_full: 'partner_unicorn_full.png', img_cutin: 'partner_unicorn_cutin.png',
            atkMult: 1.30, hpMult: 1.50, vamp: 20, def: 20,
            element: 'light', skillCooldown: 10000, skillValue: 30, skillDuration: 4000,
            skillName: '정화의 빛', skillDesc: '10초마다 4초 동안 적의 힘을 정화하여 받는 데미지와 명중률을 30% 감소(약화)시킵니다.',
            flavorText: '"당신의 영혼이 티 없이 맑기에 제가 곁에 머무는 것입니다."'
        },

        // ==========================================
        // 🌟 [MYTHIC] MBTI 신화 등급 전용 파트너 (16종)
        // ==========================================
        
        // 👑 ENTJ: 전장을 지배하는 군주
        'pt_m_entj': { 
            id: 'pt_m_entj', name: '전장의 군주 레온', rarity: 'mythic', emoji: '👑',
            img_icon: 'partner_entj_icon.png', img_sd: 'partner_entj_sd.png', img_full: 'partner_entj_full.png', img_cutin: 'partner_entj_cutin.png', img_profile: 'partner_entj_profile.png',
            atkMult: 2.50, hpMult: 1.50, critRate: 20, critDmg: 100, spd: 10,
            element: 'fire', skillCooldown: 12000, skillValue: 300, skillDuration: 5000,
            skillName: '제국의 위엄', skillDesc: '12초마다 5초간 마스터의 공격력을 폭발적으로 증가시키고 적에게 강력한 화염 피해',
            flavorText: '"나의 깃발 아래, 패배란 존재하지 않는다. 전군 돌격!"'
        },
        
        // 📖 INTJ: 심연의 대마법사
        'pt_m_intj': { 
            id: 'pt_m_intj', name: '심연의 마법사 모르가나', rarity: 'mythic', emoji: '📖',
            img_icon: 'partner_intj_icon.png', img_sd: 'partner_intj_sd.png', img_full: 'partner_intj_full.png', img_cutin: 'partner_intj_cutin.png',
            atkMult: 3.00, hpMult: 1.20, critRate: 15, def: 20, eva: 10,
            element: 'ice', skillCooldown: 10000, skillValue: 500, skillDuration: 2000,
            skillName: '절대 영도', skillDesc: '10초마다 적에게 500%의 마법 피해를 입히고 2초간 꽁꽁 얼려버림(행동 불가)',
            flavorText: '"모든 변수는 이미 내 계산 안에 있어. 끝내지."'
        },
        
        // 🌿 INFP: 달빛의 은둔술사
        'pt_m_infp': { 
            id: 'pt_m_infp', name: '은둔술사 루나', rarity: 'mythic', emoji: '🌿',
            img_icon: 'partner_infp_icon.png', img_sd: 'partner_infp_sd.png', img_full: 'partner_infp_full.png', img_cutin: 'partner_infp_cutin.png',
            atkMult: 1.50, hpMult: 2.50, vamp: 25, eva: 15, def: 15,
            element: 'light', skillCooldown: 8000, skillValue: 40, skillDuration: 4000,
            skillName: '달빛의 축복', skillDesc: '8초마다 4초간 마스터의 피흡 능력을 극대화하고 적의 명중률 감소',
            flavorText: '"당신의 상처는 부드러운 달빛이 보듬어 줄 거예요."'
        },
        
        // 🪓 ESTP: 폭풍의 무법자
        'pt_m_estp': { 
            id: 'pt_m_estp', name: '폭풍의 무법자 잭', rarity: 'mythic', emoji: '🌪️',
            img_icon: 'partner_estp_icon.png', img_sd: 'partner_estp_sd.png', img_full: 'partner_estp_full.png', img_cutin: 'partner_estp_cutin.png',
            atkMult: 2.20, hpMult: 1.30, critRate: 25, critDmg: 150, spd: 30,
            element: 'air', skillCooldown: 6000, skillValue: 200, skillDuration: 0,
            skillName: '광란의 춤', skillDesc: '6초마다 폭풍처럼 빠른 3연격으로 적에게 200%의 추가 피해',
            flavorText: '"하하하! 누가 날 막겠다고? 바람처럼 쓸어버려 주마!"'
        },
        
        // 🛡️ ISFJ: 성소를 지키는 가디언
        'pt_m_isfj': { 
            id: 'pt_m_isfj', name: '가디언 미카엘', rarity: 'mythic', emoji: '🛡️',
            img_icon: 'partner_isfj_icon.png', img_sd: 'partner_isfj_sd.png', img_full: 'partner_isfj_full.png', img_cutin: 'partner_isfj_cutin.png',
            atkMult: 1.30, hpMult: 3.00, def: 40, vamp: 15, eva: 5,
            element: 'earth', skillCooldown: 12000, skillValue: 50, skillDuration: 6000,
            skillName: '절대 수호진', skillDesc: '12초마다 마스터 최대 체력의 50%만큼 무적에 가까운 쉴드 생성',
            flavorText: '"걱정 마십시오. 제 목숨을 바쳐서라도 성소와 당신을 지키겠습니다."'
        },
        
        // ⚔️ ISTJ: 철의 규율 기사단장
        'pt_m_istj': { 
            id: 'pt_m_istj', name: '기사단장 발터', rarity: 'mythic', emoji: '⚔️',
            img_icon: 'partner_istj_icon.png', img_sd: 'partner_istj_sd.png', img_full: 'partner_istj_full.png', img_cutin: 'partner_istj_cutin.png',
            atkMult: 1.80, hpMult: 2.20, def: 35, critRate: 15, spd: 5,
            element: 'earth', skillCooldown: 10000, skillValue: 250, skillDuration: 3000,
            skillName: '처단과 심판', skillDesc: '10초마다 적에게 방어력을 무시하는 일격을 날리고 3초간 기절시킴',
            flavorText: '"원칙과 규율에 따라, 심연의 존재를 처단한다."'
        },
        
        // 🎵 ISFP: 바람의 음유시인
        'pt_m_isfp': { 
            id: 'pt_m_isfp', name: '음유시인 아리엘', rarity: 'mythic', emoji: '🎵',
            img_icon: 'partner_isfp_icon.png', img_sd: 'partner_isfp_sd.png', img_full: 'partner_isfp_full.png', img_cutin: 'partner_isfp_cutin.png',
            atkMult: 1.60, hpMult: 1.80, eva: 35, spd: 20, def: 10,
            element: 'air', skillCooldown: 9000, skillValue: 30, skillDuration: 4000,
            skillName: '산들바람 소나타', skillDesc: '9초마다 4초 동안 적의 공격을 높은 확률로 흘려보내는 회피 버프',
            flavorText: '"제 노래가 바람을 타고 당신의 검 끝에 닿기를..."'
        },
        
        // 🔮 INTP: 미궁의 연금술사
        'pt_m_intp': { 
            id: 'pt_m_intp', name: '연금술사 호엔하임', rarity: 'mythic', emoji: '🧪',
            img_icon: 'partner_intp_icon.png', img_sd: 'partner_intp_sd.png', img_full: 'partner_intp_full.png', img_cutin: 'partner_intp_cutin.png',
            atkMult: 2.30, hpMult: 1.50, critRate: 20, def: 20, eva: 15,
            element: 'lightning', skillCooldown: 11000, skillValue: 400, skillDuration: 0,
            skillName: '현자의 폭발', skillDesc: '11초마다 불안정한 마나를 압축해 적에게 400%의 벼락 피해',
            flavorText: '"모든 물질은 분해되고 재조립되지. 너도 예외는 아니야."'
        },
        
        // 🥷 ISTP: 그림자의 암살자
        'pt_m_istp': { 
            id: 'pt_m_istp', name: '그림자 섀도우', rarity: 'mythic', emoji: '🥷',
            img_icon: 'partner_istp_icon.png', img_sd: 'partner_istp_sd.png', img_full: 'partner_istp_full.png', img_cutin: 'partner_istp_cutin.png',
            atkMult: 2.80, hpMult: 1.10, critRate: 35, critDmg: 200, spd: 25,
            element: 'air', skillCooldown: 7000, skillValue: 300, skillDuration: 0,
            skillName: '치명적 포착', skillDesc: '7초마다 그림자 속에서 나타나 적의 급소를 찌르는 강력한 일격',
            flavorText: '"소리 없이 다가가, 확실하게 끝낸다."'
        },
        
        // 💃 ESFP: 환희의 무희
        'pt_m_esfp': { 
            id: 'pt_m_esfp', name: '무희 카르멘', rarity: 'mythic', emoji: '💃',
            img_icon: 'partner_esfp_icon.png', img_sd: 'partner_esfp_sd.png', img_full: 'partner_esfp_full.png', img_cutin: 'partner_esfp_cutin.png',
            atkMult: 1.90, hpMult: 1.60, eva: 25, spd: 35, critRate: 15,
            element: 'fire', skillCooldown: 8000, skillValue: 20, skillDuration: 5000,
            skillName: '매혹의 불꽃무', skillDesc: '8초마다 5초간 화려한 춤으로 적을 현혹하여 공격력을 20% 감소시킴',
            flavorText: '"이 전장은 나의 스테이지야! 다들 나만 보라고~!"'
        },
        
        // 🧭 ENFP: 혜성의 탐험가
        'pt_m_enfp': { 
            id: 'pt_m_enfp', name: '탐험가 핀', rarity: 'mythic', emoji: '🧭',
            img_icon: 'partner_enfp_icon.png', img_sd: 'partner_enfp_sd.png', img_full: 'partner_enfp_full.png', img_cutin: 'partner_enfp_cutin.png',
            atkMult: 1.70, hpMult: 1.90, spd: 40, eva: 20, vamp: 10,
            element: 'lightning', skillCooldown: 9000, skillValue: 150, skillDuration: 3000,
            skillName: '별똥별 러시', skillDesc: '9초마다 혜성처럼 돌진하여 적에게 피해를 주고 3초간 감전',
            flavorText: '"새로운 세상이 저기에 있어! 빨리 가보자, 마스터!"'
        },
        
        // ☄️ ENTP: 혼돈의 마도공학자
        'pt_m_entp': { 
            id: 'pt_m_entp', name: '마도공학자 징크스', rarity: 'mythic', emoji: '⚙️',
            img_icon: 'partner_entp_icon.png', img_sd: 'partner_entp_sd.png', img_full: 'partner_entp_full.png', img_cutin: 'partner_entp_cutin.png',
            atkMult: 3.20, hpMult: 1.20, critRate: 15, critDmg: 250, spd: 15,
            element: 'lightning', skillCooldown: 13000, skillValue: 600, skillDuration: 0,
            skillName: '하이퍼 레이저', skillDesc: '13초마다 오버클럭된 차원 파괴포를 발사해 전장을 싹쓸이함',
            flavorText: '"이게 터질지 안 터질지는 나도 몰라! 일단 쏴보고 생각하자고!"'
        },
        
        // 🚩 ESTJ: 강철의 총사령관
        'pt_m_estj': { 
            id: 'pt_m_estj', name: '총사령관 빅토리아', rarity: 'mythic', emoji: '🚩',
            img_icon: 'partner_estj_icon.png', img_sd: 'partner_estj_sd.png', img_full: 'partner_estj_full.png', img_cutin: 'partner_estj_cutin.png',
            atkMult: 2.10, hpMult: 2.40, def: 30, spd: 10, critRate: 10,
            element: 'fire', skillCooldown: 15000, skillValue: 30, skillDuration: 6000,
            skillName: '전군 총공세', skillDesc: '15초마다 6초 동안 마스터의 모든 스탯(공/방/속)을 대폭 상승시킴',
            flavorText: '"진형을 유지하라! 나를 따르는 자에게 영광이 있을 것이다!"'
        },
        
        // 🔰 ESFJ: 여명의 성기사단장
        'pt_m_esfj': { 
            id: 'pt_m_esfj', name: '성기사단장 솔라', rarity: 'mythic', emoji: '🔰',
            img_icon: 'partner_esfj_icon.png', img_sd: 'partner_esfj_sd.png', img_full: 'partner_esfj_full.png', img_cutin: 'partner_esfj_cutin.png',
            atkMult: 1.40, hpMult: 2.80, def: 35, vamp: 20, eva: 10,
            element: 'light', skillCooldown: 11000, skillValue: 30, skillDuration: 4000,
            skillName: '여명의 구원', skillDesc: '11초마다 마스터의 체력을 즉시 회복하고 4초간 받는 피해 감소',
            flavorText: '"어둠이 짙을수록 여명은 더욱 찬란하게 빛나는 법입니다."'
        },
        
        // 🪄 ENFJ: 태양의 선지자
        'pt_m_enfj': { 
            id: 'pt_m_enfj', name: '선지자 아폴로', rarity: 'mythic', emoji: '☀️',
            img_icon: 'partner_enfj_icon.png', img_sd: 'partner_enfj_sd.png', img_full: 'partner_enfj_full.png', img_cutin: 'partner_enfj_cutin.png',
            atkMult: 1.80, hpMult: 2.20, critRate: 20, vamp: 15, spd: 15,
            element: 'fire', skillCooldown: 10000, skillValue: 40, skillDuration: 5000,
            skillName: '태양의 찬가', skillDesc: '10초마다 5초간 적을 불태워 지속 피해를 입히고 마스터의 속도를 고양시킴',
            flavorText: '"모두가 하나 된 마음으로 노래할 때, 태양은 응답할 것입니다."'
        },
        
        // 🔮 INFJ: 별을 읽는 예언자
        'pt_m_infj': { 
            id: 'pt_m_infj', name: '예언자 스텔라', rarity: 'mythic', emoji: '🌌',
            img_icon: 'partner_infj_icon.png', img_sd: 'partner_infj_sd.png', img_full: 'partner_infj_full.png', img_cutin: 'partner_infj_cutin.png',
            atkMult: 2.00, hpMult: 1.80, eva: 40, def: 15, critDmg: 80,
            element: 'light', skillCooldown: 14000, skillValue: 100, skillDuration: 3000,
            skillName: '운명의 궤적', skillDesc: '14초마다 3초간 마스터의 회피율을 극한으로 끌어올려 공격을 흘려보냄',
            flavorText: '"별들은 이미 이 전투의 결말을 알고 있답니다."'
        }
    }, // <-- 요 쉼표(,) 필수! 바로 밑에 cosmetics: { 가 이어집니다.

    // (이 밑으로 cosmetics: { ... } 가 이어집니다)
    // 🌟 [신규 추가] 치장품(Cosmetics) 상점 데이터
    cosmetics: {
        // 👇 profiles, borders 아래에 titles 배열을 추가합니다!
        titles: [
            { id: 't_entj', name: '전장을 지배하는 군주', desc: 'ENTJ 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'ENTJ' },
            { id: 't_intj', name: '심연의 대마법사', desc: 'INTJ 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'INTJ' },
            { id: 't_infp', name: '달빛의 은둔술사', desc: 'INFP 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'INFP' },
            { id: 't_estp', name: '폭풍의 무법자', desc: 'ESTP 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'ESTP' },
            { id: 't_isfj', name: '성소를 지키는 가디언', desc: 'ISFJ 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'ISFJ' },
            { id: 't_istj', name: '철의 규율 기사단장', desc: 'ISTJ 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'ISTJ' },
            { id: 't_isfp', name: '바람의 음유시인', desc: 'ISFP 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'ISFP' },
            { id: 't_intp', name: '미궁의 연금술사', desc: 'INTP 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'INTP' },
            { id: 't_istp', name: '그림자의 암살자', desc: 'ISTP 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'ISTP' },
            { id: 't_esfp', name: '환희의 무희', desc: 'ESFP 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'ESFP' },
            { id: 't_enfp', name: '혜성의 탐험가', desc: 'ENFP 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'ENFP' },
            { id: 't_entp', name: '혼돈의 마도공학자', desc: 'ENTP 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'ENTP' },
            { id: 't_estj', name: '강철의 총사령관', desc: 'ESTJ 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'ESTJ' },
            { id: 't_esfj', name: '여명의 성기사단장', desc: 'ESFJ 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'ESFJ' },
            { id: 't_enfj', name: '태양의 선지자', desc: 'ENFJ 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'ENFJ' },
            { id: 't_infj', name: '별을 읽는 예언자', desc: 'INFJ 신화 1 + 전설 2 장착 시 해금', type: 'title', reqMbti: 'INFJ' }
        ],
        // 👇 profiles 배열을 borders 바로 위나 아래에 쏙 끼워 넣어줘!
        profiles: [
            { id: 'pf_cat', name: '검은 고양이', desc: '어둠 속에서 빛나는 눈동자', price: 100, type: 'profile', icon: '🐱' },
            { id: 'pf_skull', name: '해골 군주', desc: '죽음을 뛰어넘은 자', price: 150, type: 'profile', icon: '💀' },
            { id: 'pf_alien', name: '외계 생명체', desc: '우주에서 온 미지의 존재', price: 200, type: 'profile', icon: '👽' }
        ],
        borders: [
            { id: 'bd_fire', name: '지옥불 테두리', desc: '프로필을 불태우는 화염', price: 100, type: 'border', cssClass: 'ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' },
            { id: 'bd_ice', name: '서리꽃 테두리', desc: '얼어붙은 냉기의 오라', price: 100, type: 'border', cssClass: 'ring-2 ring-cyan-300 shadow-[0_0_15px_rgba(103,232,249,0.8)]' },
            { id: 'bd_king', name: '마왕의 관', desc: '절대적인 힘의 상징', price: 300, type: 'border', cssClass: 'ring-2 ring-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.9)] animate-pulse' }
        ],
        backgrounds: [
            { id: 'bg_guild', name: '길드장의 집무실', desc: '포근하고 아늑한 나의 공간', price: 200, type: 'bg', img: 'bg_guild.png' },
            { id: 'bg_abyss', name: '심연의 옥좌', desc: '마왕이 머물던 서늘한 공간', price: 300, type: 'bg', img: 'bg_abyss.png' },
            { id: 'bg_ella', name: '엘라 테스트 배경', desc: '엘라 테스트 공간', price: 300, type: 'bg', img: 'bg_ella.png' },
            { id: 'bg_entj', name: 'entj 테스트 배경', desc: 'entj 테스트 공간', price: 300, type: 'bg', img: 'bg_entj.png' }
        ],
        bubbles: [
            { id: 'bb_gold', name: '황금빛 외침', desc: '채팅창의 시선을 독점하세요', price: 150, type: 'bubble', bgClass: 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold' }
        ]
    }
}; // GameData 객체 끝 (파일의 진짜 마지막 줄)


















