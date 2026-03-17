// =========================================================================
// 1. GAME DATA (게임 데이터베이스)
// =========================================================================
const GameData = {
    items: {
        // 🟢 일반 (Common) - 초반용 깡스탯 위주
        'w_c1': { id: 'w_c1', type: 'gear', subType: 'weapon', name: '낡은 철검', emoji: '🗡️', rarity: 'common', color: 'text-slate-400', atkMult: 1.15 },
        'w_c2': { id: 'w_c2', type: 'gear', subType: 'weapon', name: '녹슨 단검', emoji: '🔪', rarity: 'common', color: 'text-slate-400', atkMult: 1.05, critRate: 5 },
        'w_c3': { id: 'w_c3', type: 'gear', subType: 'weapon', name: '거친 몽둥이', emoji: '🏏', rarity: 'common', color: 'text-slate-400', atkMult: 1.15 }, // 신규 추가 (높은 깡공격력)
        'w_c4': { id: 'w_c4', type: 'gear', subType: 'weapon', name: '거친 톱', emoji: '🏏', rarity: 'common', color: 'text-slate-400', atkMult: 1.25 }, // 신규 추가 (높은 깡공격력)
        
        'a_c1': { id: 'a_c1', type: 'gear', subType: 'armor', name: '가죽 갑옷', emoji: '🦺', rarity: 'common', color: 'text-slate-400', hpMult: 1.10 },
        'a_c2': { id: 'a_c2', type: 'gear', subType: 'armor', name: '빛바랜 천옷', emoji: '👕', rarity: 'common', color: 'text-slate-400', hpMult: 1.12, eva: 2 }, // 신규 추가 (미세한 회피)
        
        'ac_c1': { id: 'ac_c1', type: 'gear', subType: 'accessory', name: '평범한 반지', emoji: '💍', rarity: 'common', color: 'text-slate-400', atkMult: 1.05, hpMult: 1.05 },
        'ac_c2': { id: 'ac_c2', type: 'gear', subType: 'accessory', name: '행운의 동전', emoji: '🪙', rarity: 'common', color: 'text-slate-400', atkMult: 1.02, critRate: 3 }, // 신규 추가 (소소한 크리)

        // 🔵 희귀 (Rare) - 약간의 특성 부여 (공속, 회피, 방어력 등 등장)
        'w_r1': { id: 'w_r1', type: 'gear', subType: 'weapon', name: '기사단의 롱소드', emoji: '⚔️', rarity: 'rare', color: 'text-blue-400', atkMult: 1.25, def: 5 }, // 방어력 스탯 추가
        'w_r2': { id: 'w_r2', type: 'gear', subType: 'weapon', name: '암살자의 비수', emoji: '🗡️', rarity: 'rare', color: 'text-blue-400', atkMult: 1.15, critRate: 15, critDmg: 20 },
        'w_r3': { id: 'w_r3', type: 'gear', subType: 'weapon', name: '사냥꾼의 뿔활', emoji: '🏹', rarity: 'rare', color: 'text-blue-400', atkMult: 6.20, spd: 50 }, // 신규 추가 (공속 무기)
        
        'a_r1': { id: 'a_r1', type: 'gear', subType: 'armor', name: '강철 대방패', emoji: '🛡️', rarity: 'rare', color: 'text-blue-400', hpMult: 1.30, def: 10 }, // 방어력 스탯 추가
        'a_r2': { id: 'a_r2', type: 'gear', subType: 'armor', name: '가시 갑옷', emoji: '🧥', rarity: 'rare', color: 'text-blue-400', hpMult: 1.15, vamp: 2 },
        'a_r3': { id: 'a_r3', type: 'gear', subType: 'armor', name: '도적의 망토', emoji: '🧣', rarity: 'rare', color: 'text-blue-400', hpMult: 1.20, eva: 8 }, // 신규 추가 (회피 갑옷)
        
        'ac_r1': { id: 'ac_r1', type: 'gear', subType: 'accessory', name: '수호의 목걸이', emoji: '📿', rarity: 'rare', color: 'text-blue-400', atkMult: 1.10, hpMult: 1.15, def: 5 }, // 방어력 추가
        'ac_r2': { id: 'ac_r2', type: 'gear', subType: 'accessory', name: '바람의 장화', emoji: '🥾', rarity: 'rare', color: 'text-blue-400', hpMult: 1.10, spd: 10, eva: 3 }, // 신규 추가 (이동속도 컨셉)
        'ac_r3': { id: 'ac_r3', type: 'gear', subType: 'accessory', name: '투사의 증표', emoji: '🏅', rarity: 'rare', color: 'text-blue-400', atkMult: 1.15, hpMult: 1.05, critDmg: 25 }, // 신규 추가 (크리 데미지 증폭)
        
        
        // 🟣 영웅 (Epic) - 뚜렷한 컨셉 (크리 몰빵, 피흡 좀비, 쾌속 딜러 등)
        'w_e1': { id: 'w_e1', type: 'gear', subType: 'weapon', name: '마력의 지팡이', emoji: '🪄', rarity: 'epic', color: 'text-purple-400', atkMult: 1.50, critRate: 10, def: 10 },
        'w_e2': { id: 'w_e2', type: 'gear', subType: 'weapon', name: '그림자 낫', emoji: '🪝', rarity: 'epic', color: 'text-purple-400', atkMult: 1.30, critRate: 25, critDmg: 50 },
        'w_e3': { id: 'w_e3', type: 'gear', subType: 'weapon', name: '흡혈귀의 이빨', emoji: '🦇', rarity: 'epic', color: 'text-purple-400', atkMult: 1.35, vamp: 8, spd: 5 }, // 공속 추가
        
        'a_e1': { id: 'a_e1', type: 'gear', subType: 'armor', name: '성기사의 성갑', emoji: '🛡️', rarity: 'epic', color: 'text-purple-400', hpMult: 1.60, def: 15 }, // 방어력 대폭 추가
        'a_e2': { id: 'a_e2', type: 'gear', subType: 'armor', name: '망령의 망토', emoji: '👻', rarity: 'epic', color: 'text-purple-400', hpMult: 1.30, vamp: 5, critRate: 10, eva: 8 },
        'a_e3': { id: 'a_e3', type: 'gear', subType: 'armor', name: '닌자의 수의', emoji: '🥷', rarity: 'epic', color: 'text-purple-400', hpMult: 1.25, eva: 15, spd: 15 }, // 신규 추가 (회피/공속 갑옷)
        
        'ac_e1': { id: 'ac_e1', type: 'gear', subType: 'accessory', name: '마나의 귀걸이', emoji: '💎', rarity: 'epic', color: 'text-purple-400', atkMult: 1.25, hpMult: 1.25, def: 10 },
        'ac_e2': { id: 'ac_e2', type: 'gear', subType: 'accessory', name: '광전사의 뿔피리', emoji: '📯', rarity: 'epic', color: 'text-purple-400', atkMult: 1.45, hpMult: 1.05, spd: 20 }, // 신규 추가 (공속 극대화)
        'ac_e3': { id: 'ac_e3', type: 'gear', subType: 'accessory', name: '세계수의 잎사귀', emoji: '🍃', rarity: 'epic', color: 'text-purple-400', hpMult: 1.40, vamp: 10, eva: 5 }, // 신규 추가 (피흡 및 생존)
        
        

        // 🟡 전설 (Legendary) - 사기적인 능력치!
        'w_l1': { id: 'w_l1', type: 'gear', subType: 'weapon', name: '전설의 엑스칼리버', emoji: '🗡️', rarity: 'legendary', color: 'text-yellow-400', atkMult: 2.20, critRate: 20, critDmg: 50, def: 10 },
        'w_l2': { id: 'w_l2', type: 'gear', subType: 'weapon', name: '파멸의 마검', emoji: '🗡️', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.80, critRate: 40, critDmg: 100, spd: 15 },
        'w_l3': { id: 'w_l3', type: 'gear', subType: 'weapon', name: '피의 군주 지팡이', emoji: '🩸', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.90, vamp: 15, eva: 10 },
        
        'a_l1': { id: 'a_l1', type: 'gear', subType: 'armor', name: '절대자의 황금 갑옷', emoji: '🛡️', rarity: 'legendary', color: 'text-yellow-400', hpMult: 2.50, def: 20 },
        'a_l2': { id: 'a_l2', type: 'gear', subType: 'armor', name: '불사의 심장', emoji: '❤️‍🔥', rarity: 'legendary', color: 'text-yellow-400', hpMult: 1.90, vamp: 12, def: 15 },
        'a_l3': { id: 'a_l3', type: 'gear', subType: 'armor', name: '환영의 거울 갑옷', emoji: '🪞', rarity: 'legendary', color: 'text-yellow-400', hpMult: 2.10, eva: 25, spd: 20 }, // 신규 추가 (절대 회피 탱커)
        
        'ac_l1': { id: 'ac_l1', type: 'gear', subType: 'accessory', name: '초월의 반지', emoji: '💍', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.50, hpMult: 1.50, critRate: 15, def: 10 },
        'ac_l2': { id: 'ac_l2', type: 'gear', subType: 'accessory', name: '시간술사의 시계', emoji: '⏱️', rarity: 'legendary', color: 'text-yellow-400', atkMult: 1.40, hpMult: 1.40, spd: 35, eva: 15 }, // 신규 추가 (공속 한계 돌파)
        'ac_l3': { id: 'ac_l3', type: 'gear', subType: 'accessory', name: '파괴신의 눈물', emoji: '💧', rarity: 'legendary', color: 'text-yellow-400', atkMult: 2.00, critRate: 30, critDmg: 120 }, // 신규 추가 (한방 극딜)

// ==========================================
        // 🌟 [MYTHIC] MBTI 신화 등급 전용 장비 (16종)
        // ==========================================
       'mythic_entj_w': { 
            id: 'mythic_entj_w', name: '태양의 심판검', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '☀️', 
            atkMult: 4.5, critDmg: 200, spd: 15, mbti: 'ENTJ', job: '전장을 지배하는 군주', passive: '절대 권력', 
            desc: '[ENTJ 신화] 적을 굴복시키는 군주의 검.',
            img: 'weapon_entj.png', // 👈 [추가]
            // 👇 여기에 이미지와 대사를 추가해 주세요!
            img_cutin: 'weapon_entj_cutin.png', 
            flavorText: '"모든 전장은 나의 지휘 아래 통제된다. 꿇어라!"' 
        },
        'mythic_intj_w': { id: 'mythic_intj_w', name: '금기된 마도서', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '📖', atkMult: 5.0, critRate: 15, spd: 10, mbti: 'INTJ', job: '심연의 대마법사', passive: '천재의 영역', desc: '[INTJ 신화] 심연의 지식이 담긴 마도서.' },
        'mythic_infp_w': { id: 'mythic_infp_w', name: '세계수의 하프', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🌿', atkMult: 3.0, hpMult: 3.0, vamp: 20, mbti: 'INFP', job: '달빛의 은둔술사', passive: '요정의 축복', desc: '[INFP 신화] 상처를 치유하는 달빛의 선율.' },
        'mythic_estp_w': { id: 'mythic_estp_w', name: '전신의 쌍도끼', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🪓', atkMult: 3.5, spd: 45, critDmg: 150, mbti: 'ESTP', job: '폭풍의 무법자', passive: '아드레날린 폭주', desc: '[ESTP 신화] 멈추지 않는 폭풍의 연격.' },
        'mythic_isfj_a': { id: 'mythic_isfj_a', name: '여신의 성배', type: 'gear', subType: 'accessory', rarity: 'mythic', emoji: '🏆', hpMult: 4.0, def: 15, vamp: 15, mbti: 'ISFJ', job: '성소를 지키는 가디언', passive: '불굴의 수호진', desc: '[ISFJ 신화] 아군을 지키는 절대적인 수호.' },
        'mythic_istj_ar': { id: 'mythic_istj_ar', name: '서약의 대방패', type: 'gear', subType: 'armor', rarity: 'mythic', emoji: '🛡️', hpMult: 3.5, def: 30, eva: 5, mbti: 'ISTJ', job: '철의 규율 기사단장', passive: '절대 방벽', desc: '[ISTJ 신화] 어떤 공격도 뚫지 못하는 철의 방벽.' },
        'mythic_isfp_w': { id: 'mythic_isfp_w', name: '숲의 숨결 플루트', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🎵', atkMult: 2.5, eva: 35, spd: 25, mbti: 'ISFP', job: '바람의 음유시인', passive: '정령의 속삭임', desc: '[ISFP 신화] 바람처럼 유려한 정령의 몸놀림.' },
        'mythic_intp_a': { id: 'mythic_intp_a', name: '현자의 돌', type: 'gear', subType: 'accessory', rarity: 'mythic', emoji: '🔮', atkMult: 3.0, critRate: 25, def: 30, mbti: 'INTP', job: '미궁의 연금술사', passive: '진리 탐구', desc: '[INTP 신화] 우주의 진리가 담긴 궁극의 돌.' },
        'mythic_istp_w': { id: 'mythic_istp_w', name: '흑요석 단검', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🗡️', atkMult: 3.0, critRate: 35, critDmg: 300, mbti: 'ISTP', job: '그림자의 암살자', passive: '치명적 포착', desc: '[ISTP 신화] 단 한 번의 틈을 노리는 그림자.' },
        'mythic_esfp_w': { id: 'mythic_esfp_w', name: '환희의 쌍검', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '⚔️', atkMult: 3.2, eva: 25, spd: 35, mbti: 'ESFP', job: '환희의 무희', passive: '스포트라이트', desc: '[ESFP 신화] 전장을 무대로 만드는 화려한 검무.' },
        'mythic_enfp_a': { id: 'mythic_enfp_a', name: '별빛 나침반', type: 'gear', subType: 'accessory', rarity: 'mythic', emoji: '🧭', hpMult: 2.5, eva: 20, spd: 20, mbti: 'ENFP', job: '혜성의 탐험가', passive: '무한한 영감', desc: '[ENFP 신화] 미지의 세계로 인도하는 나침반.' },
        'mythic_entp_w': { id: 'mythic_entp_w', name: '차원 파괴포', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '☄️', atkMult: 5.5, critRate: 10, critDmg: 250, mbti: 'ENTP', job: '혼돈의 마도공학자', passive: '변수 창출', desc: '[ENTP 신화] 차원을 찢어발기는 혼돈의 포격.' },
        'mythic_estj_w': { id: 'mythic_estj_w', name: '지배자의 군기', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🚩', atkMult: 3.8, def: 30, hpMult: 2.0, mbti: 'ESTJ', job: '강철의 총사령관', passive: '일제 사격', desc: '[ESTJ 신화] 승리를 이끄는 압도적인 지휘력.' },
        'mythic_esfj_ar': { id: 'mythic_esfj_ar', name: '여명의 방패', type: 'gear', subType: 'armor', rarity: 'mythic', emoji: '🔰', hpMult: 4.5, def: 30, vamp: 10, mbti: 'ESFJ', job: '여명의 성기사단장', passive: '구원의 빛', desc: '[ESFJ 신화] 어둠을 몰아내는 여명의 빛.' },
        'mythic_enfj_w': { id: 'mythic_enfj_w', name: '태양의 지휘봉', type: 'gear', subType: 'weapon', rarity: 'mythic', emoji: '🪄', atkMult: 3.5, hpMult: 2.5, spd: 20, mbti: 'ENFJ', job: '태양의 선지자', passive: '군중의 찬가', desc: '[ENFJ 신화] 전군을 고양시키는 태양의 인도자.' },
        'mythic_infj_a': { id: 'mythic_infj_a', name: '운명의 수정구', type: 'gear', subType: 'accessory', rarity: 'mythic', emoji: '🔮', atkMult: 2.5, eva: 30, def: 15, mbti: 'INFJ', job: '별을 읽는 예언자', passive: '미래 예지', desc: '[INFJ 신화] 모든 공격을 꿰뚫어 보는 예지의 눈.' },
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
        
      // 🌟 6. 빛 (Light) - 신화 파트너 예시
        'pt_m1': { 
            id: 'pt_m1', name: '차원의 마녀 노아', rarity: 'mythic', emoji: '🌌',
            img_sd: 'partner_noah_sd.png', // 인벤토리용 쪼꼬미 이미지
            img_full: 'partner_noah_full.png', // 👈 내 정보(프로필) 창에 세워둘 얌전한 스탠딩 이미지
            img_cutin: 'partner_noah_cutin.png', // 👈 [신규 추가!] 가챠 연출 때 뽝! 하고 나올 역동적인 컷인 이미지
            atkMult: 2.00, hpMult: 1.50, critRate: 15, critDmg: 50, vamp: 10,
            element: 'light', skillCooldown: 10000, skillValue: 30, skillDuration: 5000,
            skillName: '심연의 빛', skillDesc: '10초마다 5초간 적의 데미지와 공격 속도를 30% 감소 (약화)',
            flavorText: '"후후... 이 우주에서 나를 다룰 수 있는 건 당신뿐이야."'
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
            { id: 'bg_ella', name: '엘라 테스트 배경', desc: '엘라 테스트 공간', price: 300, type: 'bg', img: 'bg_ella.png' }
        ],
        bubbles: [
            { id: 'bb_gold', name: '황금빛 외침', desc: '채팅창의 시선을 독점하세요', price: 150, type: 'bubble', bgClass: 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold' }
        ]
    }
}; // GameData 객체 끝 (파일의 진짜 마지막 줄)


















