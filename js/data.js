// =========================================================================
// 1. GAME DATA (게임 데이터베이스)
// =========================================================================
const GameData = {
    items: {
        // 🟢 일반 (Common) - 초반용 깡스탯 위주
        'w_c1': { id: 'w_c1', type: 'gear', subType: 'weapon', name: '낡은 철검', emoji: '🗡️', rarity: 'common', color: 'text-slate-400', atkMult: 1.10 },
        'w_c2': { id: 'w_c2', type: 'gear', subType: 'weapon', name: '녹슨 단검', emoji: '🔪', rarity: 'common', color: 'text-slate-400', atkMult: 1.05, critRate: 5 },
        'w_c3': { id: 'w_c3', type: 'gear', subType: 'weapon', name: '거친 몽둥이', emoji: '🏏', rarity: 'common', color: 'text-slate-400', atkMult: 1.15 }, // 신규 추가 (높은 깡공격력)
        
        'a_c1': { id: 'a_c1', type: 'gear', subType: 'armor', name: '가죽 갑옷', emoji: '🦺', rarity: 'common', color: 'text-slate-400', hpMult: 1.10 },
        'a_c2': { id: 'a_c2', type: 'gear', subType: 'armor', name: '빛바랜 천옷', emoji: '👕', rarity: 'common', color: 'text-slate-400', hpMult: 1.12, eva: 2 }, // 신규 추가 (미세한 회피)
        
        'ac_c1': { id: 'ac_c1', type: 'gear', subType: 'accessory', name: '평범한 반지', emoji: '💍', rarity: 'common', color: 'text-slate-400', atkMult: 1.05, hpMult: 1.05 },
        'ac_c2': { id: 'ac_c2', type: 'gear', subType: 'accessory', name: '행운의 동전', emoji: '🪙', rarity: 'common', color: 'text-slate-400', atkMult: 1.02, critRate: 3 }, // 신규 추가 (소소한 크리)

        // 🔵 희귀 (Rare) - 약간의 특성 부여 (공속, 회피, 방어력 등 등장)
        'w_r1': { id: 'w_r1', type: 'gear', subType: 'weapon', name: '기사단의 롱소드', emoji: '⚔️', rarity: 'rare', color: 'text-blue-400', atkMult: 1.25, def: 20 }, // 방어력 스탯 추가
        'w_r2': { id: 'w_r2', type: 'gear', subType: 'weapon', name: '암살자의 비수', emoji: '🗡️', rarity: 'rare', color: 'text-blue-400', atkMult: 1.15, critRate: 15, critDmg: 20 },
        'w_r3': { id: 'w_r3', type: 'gear', subType: 'weapon', name: '사냥꾼의 뿔활', emoji: '🏹', rarity: 'rare', color: 'text-blue-400', atkMult: 1.20, spd: 5 }, // 신규 추가 (공속 무기)
        
        'a_r1': { id: 'a_r1', type: 'gear', subType: 'armor', name: '강철 대방패', emoji: '🛡️', rarity: 'rare', color: 'text-blue-400', hpMult: 1.30, def: 50 }, // 방어력 스탯 추가
        'a_r2': { id: 'a_r2', type: 'gear', subType: 'armor', name: '가시 갑옷', emoji: '🧥', rarity: 'rare', color: 'text-blue-400', hpMult: 1.15, vamp: 2 },
        'a_r3': { id: 'a_r3', type: 'gear', subType: 'armor', name: '도적의 망토', emoji: '🧣', rarity: 'rare', color: 'text-blue-400', hpMult: 1.20, eva: 8 }, // 신규 추가 (회피 갑옷)
        
        'ac_r1': { id: 'ac_r1', type: 'gear', subType: 'accessory', name: '수호의 목걸이', emoji: '📿', rarity: 'rare', color: 'text-blue-400', atkMult: 1.10, hpMult: 1.15, def: 30 }, // 방어력 추가
        'ac_r2': { id: 'ac_r2', type: 'gear', subType: 'accessory', name: '바람의 장화', emoji: '🥾', rarity: 'rare', color: 'text-blue-400', hpMult: 1.10, spd: 10, eva: 3 }, // 신규 추가 (이동속도 컨셉)
        'ac_r3': { id: 'ac_r3', type: 'gear', subType: 'accessory', name: '투사의 증표', emoji: '🏅', rarity: 'rare', color: 'text-blue-400', atkMult: 1.15, hpMult: 1.05, critDmg: 25 }, // 신규 추가 (크리 데미지 증폭)
        
        
        // 🟣 영웅 (Epic) - 뚜렷한 컨셉 (크리 몰빵, 피흡 좀비, 쾌속 딜러 등)
        'w_e1': { id: 'w_e1', type: 'gear', subType: 'weapon', name: '마력의 지팡이', emoji: '🪄', rarity: 'epic', color: 'text-purple-400', atkMult: 1.50, critRate: 10, def: 30 },
        'w_e2': { id: 'w_e2', type: 'gear', subType: 'weapon', name: '그림자 낫', emoji: '🪝', rarity: 'epic', color: 'text-purple-400', atkMult: 1.30, critRate: 25, critDmg: 50 },
        'w_e3': { id: 'w_e3', type: 'gear', subType: 'weapon', name: '흡혈귀의 이빨', emoji: '🦇', rarity: 'epic', color: 'text-purple-400', atkMult: 1.35, vamp: 8, spd: 5 }, // 공속 추가
        
        'a_e1': { id: 'a_e1', type: 'gear', subType: 'armor', name: '성기사의 성갑', emoji: '🛡️', rarity: 'epic', color: 'text-purple-400', hpMult: 1.60, def: 100 }, // 방어력 대폭 추가
        'a_e2': { id: 'a_e2', type: 'gear', subType: 'armor', name: '망령의 망토', emoji: '👻', rarity: 'epic', color: 'text-purple-400', hpMult: 1.30, vamp: 5, critRate: 10, eva: 8 },
        'a_e3': { id: 'a_e3', type: 'gear', subType: 'armor', name: '닌자의 수의', emoji: '🥷', rarity: 'epic', color: 'text-purple-400', hpMult: 1.25, eva: 15, spd: 15 }, // 신규 추가 (회피/공속 갑옷)
        
        'ac_e1': { id: 'ac_e1', type: 'gear', subType: 'accessory', name: '마나의 귀걸이', emoji: '💎', rarity: 'epic', color: 'text-purple-400', atkMult: 1.25, hpMult: 1.25, def: 50 },
        'ac_e2': { id: 'ac_e2', type: 'gear', subType: 'accessory', name: '광전사의 뿔피리', emoji: '📯', rarity: 'epic', color: 'text-purple-400', atkMult: 1.45, hpMult: 1.05, spd: 20 }, // 신규 추가 (공속 극대화)
        'ac_e3': { id: 'ac_e3', type: 'gear', subType: 'accessory', name: '세계수의 잎사귀', emoji: '🍃', rarity: 'epic', color: 'text-purple-400', hpMult: 1.40, vamp: 10, eva: 5 }, // 신규 추가 (피흡 및 생존)
        
        

        // 🟡 전설 (Legendary) - 사기적인 능력치!
        'w_l1': { id: 'w_l1', type: 'gear', subType: 'weapon', name: '전설의 엑스칼리버', emoji: '🗡️', rarity: 'legendary', color: 'text-yellow-400', atkMult: 2.20, critRate: 20, critDmg: 50, def: 100 },
        'w_l2': { id: 'w_l2', type: 'gear', subType: 'weapon', name: '파멸의 마검', emoji: '🗡️', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.80, critRate: 40, critDmg: 100, spd: 15 },
        'w_l3': { id: 'w_l3', type: 'gear', subType: 'weapon', name: '피의 군주 지팡이', emoji: '🩸', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.90, vamp: 15, eva: 10 },
        
        'a_l1': { id: 'a_l1', type: 'gear', subType: 'armor', name: '절대자의 황금 갑옷', emoji: '🛡️', rarity: 'legendary', color: 'text-yellow-400', hpMult: 2.50, def: 200 },
        'a_l2': { id: 'a_l2', type: 'gear', subType: 'armor', name: '불사의 심장', emoji: '❤️‍🔥', rarity: 'legendary', color: 'text-yellow-400', hpMult: 1.90, vamp: 12, def: 50 },
        'a_l3': { id: 'a_l3', type: 'gear', subType: 'armor', name: '환영의 거울 갑옷', emoji: '🪞', rarity: 'legendary', color: 'text-yellow-400', hpMult: 2.10, eva: 25, spd: 20 }, // 신규 추가 (절대 회피 탱커)
        
        'ac_l1': { id: 'ac_l1', type: 'gear', subType: 'accessory', name: '초월의 반지', emoji: '💍', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.50, hpMult: 1.50, critRate: 15, def: 100 },
        'ac_l2': { id: 'ac_l2', type: 'gear', subType: 'accessory', name: '시간술사의 시계', emoji: '⏱️', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.40, hpMult: 1.40, spd: 35, eva: 15 }, // 신규 추가 (공속 한계 돌파)
        'ac_l3': { id: 'ac_l3', type: 'gear', subType: 'accessory', name: '파괴신의 눈물', emoji: '💧', rarity: 'legendary', color: 'text-yellow-400', atkMult: 2.00, critRate: 30, critDmg: 120 }, // 신규 추가 (한방 극딜)

// ==========================================
        // 🌟 [MYTHIC] MBTI 신화 등급 전용 장비 (16종)
        // ==========================================
        'mythic_entj_w': { id: 'mythic_entj_w', name: '태양의 심판검', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '☀️', atkMult: 4.5, critDmg: 200, spd: 15, mbti: 'ENTJ', job: '전장을 지배하는 군주', passive: '절대 권력', desc: '[ENTJ 신화] 적을 굴복시키는 군주의 검.' },
        'mythic_intj_w': { id: 'mythic_intj_w', name: '금기된 마도서', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '📖', atkMult: 5.0, critRate: 15, spd: 10, mbti: 'INTJ', job: '심연의 대마법사', passive: '천재의 영역', desc: '[INTJ 신화] 심연의 지식이 담긴 마도서.' },
        'mythic_infp_w': { id: 'mythic_infp_w', name: '세계수의 하프', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🌿', atkMult: 3.0, hpMult: 3.0, vamp: 20, mbti: 'INFP', job: '달빛의 은둔술사', passive: '요정의 축복', desc: '[INFP 신화] 상처를 치유하는 달빛의 선율.' },
        'mythic_estp_w': { id: 'mythic_estp_w', name: '전신의 쌍도끼', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🪓', atkMult: 3.5, spd: 45, critDmg: 150, mbti: 'ESTP', job: '폭풍의 무법자', passive: '아드레날린 폭주', desc: '[ESTP 신화] 멈추지 않는 폭풍의 연격.' },
        'mythic_isfj_a': { id: 'mythic_isfj_a', name: '여신의 성배', type: 'gear', subType: 'accessory', rarity: 'mythic', emoji: '🏆', hpMult: 4.0, def: 250, vamp: 15, mbti: 'ISFJ', job: '성소를 지키는 가디언', passive: '불굴의 수호진', desc: '[ISFJ 신화] 아군을 지키는 절대적인 수호.' },
        'mythic_istj_ar': { id: 'mythic_istj_ar', name: '서약의 대방패', type: 'gear', subType: 'armor', rarity: 'mythic', emoji: '🛡️', hpMult: 3.5, def: 400, eva: 5, mbti: 'ISTJ', job: '철의 규율 기사단장', passive: '절대 방벽', desc: '[ISTJ 신화] 어떤 공격도 뚫지 못하는 철의 방벽.' },
        'mythic_isfp_w': { id: 'mythic_isfp_w', name: '숲의 숨결 플루트', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🎵', atkMult: 2.5, eva: 35, spd: 25, mbti: 'ISFP', job: '바람의 음유시인', passive: '정령의 속삭임', desc: '[ISFP 신화] 바람처럼 유려한 정령의 몸놀림.' },
        'mythic_intp_a': { id: 'mythic_intp_a', name: '현자의 돌', type: 'gear', subType: 'accessory', rarity: 'mythic', emoji: '🔮', atkMult: 3.0, critRate: 25, def: 100, mbti: 'INTP', job: '미궁의 연금술사', passive: '진리 탐구', desc: '[INTP 신화] 우주의 진리가 담긴 궁극의 돌.' },
        'mythic_istp_w': { id: 'mythic_istp_w', name: '흑요석 단검', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🗡️', atkMult: 3.0, critRate: 35, critDmg: 300, mbti: 'ISTP', job: '그림자의 암살자', passive: '치명적 포착', desc: '[ISTP 신화] 단 한 번의 틈을 노리는 그림자.' },
        'mythic_esfp_w': { id: 'mythic_esfp_w', name: '환희의 쌍검', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '⚔️', atkMult: 3.2, eva: 25, spd: 35, mbti: 'ESFP', job: '환희의 무희', passive: '스포트라이트', desc: '[ESFP 신화] 전장을 무대로 만드는 화려한 검무.' },
        'mythic_enfp_a': { id: 'mythic_enfp_a', name: '별빛 나침반', type: 'gear', subType: 'accessory', rarity: 'mythic', emoji: '🧭', hpMult: 2.5, eva: 20, spd: 20, mbti: 'ENFP', job: '혜성의 탐험가', passive: '무한한 영감', desc: '[ENFP 신화] 미지의 세계로 인도하는 나침반.' },
        'mythic_entp_w': { id: 'mythic_entp_w', name: '차원 파괴포', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '☄️', atkMult: 5.5, critRate: 10, critDmg: 250, mbti: 'ENTP', job: '혼돈의 마도공학자', passive: '변수 창출', desc: '[ENTP 신화] 차원을 찢어발기는 혼돈의 포격.' },
        'mythic_estj_w': { id: 'mythic_estj_w', name: '지배자의 군기', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🚩', atkMult: 3.8, def: 150, hpMult: 2.0, mbti: 'ESTJ', job: '강철의 총사령관', passive: '일제 사격', desc: '[ESTJ 신화] 승리를 이끄는 압도적인 지휘력.' },
        'mythic_esfj_ar': { id: 'mythic_esfj_ar', name: '여명의 방패', type: 'gear', subType: 'armor', rarity: 'mythic', emoji: '🔰', hpMult: 4.5, def: 300, vamp: 10, mbti: 'ESFJ', job: '여명의 성기사단장', passive: '구원의 빛', desc: '[ESFJ 신화] 어둠을 몰아내는 여명의 빛.' },
        'mythic_enfj_w': { id: 'mythic_enfj_w', name: '태양의 지휘봉', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🪄', atkMult: 3.5, hpMult: 2.5, spd: 20, mbti: 'ENFJ', job: '태양의 선지자', passive: '군중의 찬가', desc: '[ENFJ 신화] 전군을 고양시키는 태양의 인도자.' },
        'mythic_infj_a': { id: 'mythic_infj_a', name: '운명의 수정구', type: 'gear', subType: 'accessory', rarity: 'mythic', emoji: '🔮', atkMult: 2.5, eva: 30, def: 150, mbti: 'INFJ', job: '별을 읽는 예언자', passive: '미래 예지', desc: '[INFJ 신화] 모든 공격을 꿰뚫어 보는 예지의 눈.' },
    },
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
                { id: 'n13', e: '🧞', n: '타락한 정령', img: 'spirit.png' },
                { id: 'n18', e: '🤖', n: '고대 수호병', img: 'golem_ancient.png' },
                { id: 'n28', e: '🧙‍♂️', n: '흑마법사', img: 'dark_mage.png' }
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
            60:{e:'👹',n:'아수라', img:'boss_asura.png'}, 
            70:{e:'❄️',n:'서리 여왕', img:'boss_icequeen.png'}, 
            80:{e:'💀',n:'죽음의 기사', img:'boss_deathknight.png'},
            90:{e:'🕷️',n:'지옥의 수문장', img:'boss_hell.png'},
            100:{e:'👑',n:'심연의 군주', img:'boss_abysslord.png'}
        }
  }, // <-- quests 닫는 괄호

    // 🌟 [신규 추가] 치장품(Cosmetics) 상점 데이터
    cosmetics: {
        borders: [
            { id: 'bd_fire', name: '지옥불 테두리', desc: '프로필을 불태우는 화염', price: 100, type: 'border', cssClass: 'ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' },
            { id: 'bd_ice', name: '서리꽃 테두리', desc: '얼어붙은 냉기의 오라', price: 100, type: 'border', cssClass: 'ring-2 ring-cyan-300 shadow-[0_0_15px_rgba(103,232,249,0.8)]' },
            { id: 'bd_king', name: '마왕의 관', desc: '절대적인 힘의 상징', price: 300, type: 'border', cssClass: 'ring-2 ring-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.9)] animate-pulse' }
        ],
        backgrounds: [
            { id: 'bg_guild', name: '길드장의 집무실', desc: '포근하고 아늑한 나의 공간', price: 200, type: 'bg', img: 'bg_guild.png' },
            { id: 'bg_abyss', name: '심연의 옥좌', desc: '마왕이 머물던 서늘한 공간', price: 300, type: 'bg', img: 'bg_abyss.png' }
        ],
        bubbles: [
            { id: 'bb_gold', name: '황금빛 외침', desc: '채팅창의 시선을 독점하세요', price: 150, type: 'bubble', bgClass: 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold' }
        ]
    }
}; // GameData 객체 끝 (파일의 진짜 마지막 줄)


















