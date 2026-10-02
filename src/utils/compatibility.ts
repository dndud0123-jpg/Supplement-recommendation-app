import type { RoutineItem } from '../types';

// ─── 룰 기반 궁합 매핑 테이블 ─────────────────────────────────

interface CompatibilityRule {
  a: string; // 영양소 키워드 A
  b: string; // 영양소 키워드 B
  type: 'synergy' | 'conflict';
  label: string; // 표시할 이유
}

/**
 * 영양소 이름에서 핵심 키워드를 추출 (소문자, 공백 제거)
 * "비타민 C" → "비타민c", "마그네슘" → "마그네슘"
 */
function normalize(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '');
}

/**
 * 영양소 이름이 키워드를 포함하는지 확인
 */
function matches(name: string, keyword: string): boolean {
  const n = normalize(name);
  const k = normalize(keyword);
  return n.includes(k);
}

const RULES: CompatibilityRule[] = [
  // ── 시너지 조합 ──────────────────────────────────────────
  { a: '철분', b: '비타민c', type: 'synergy', label: '비타민C가 철분의 비헴철 흡수율을 최대 6배 높여줘요' },
  { a: '비타민d', b: '칼슘', type: 'synergy', label: '비타민D가 칼슘 흡수를 촉진해 뼈 건강에 시너지를 냅니다' },
  { a: '비타민d', b: '마그네슘', type: 'synergy', label: '마그네슘이 비타민D 활성화에 필수적으로 작용해요' },
  { a: '아연', b: '비타민c', type: 'synergy', label: '비타민C와 아연은 면역 기능을 함께 강화합니다' },
  { a: '오메가', b: '비타민d', type: 'synergy', label: '오메가-3는 지용성인 비타민D 흡수를 도와줘요' },
  { a: '비타민b', b: '마그네슘', type: 'synergy', label: '마그네슘이 B군 비타민 활성화에 조효소로 작용해요' },
  { a: '코엔자임', b: '비타민e', type: 'synergy', label: '비타민E가 CoQ10의 산화를 막아 항산화 효과를 높여줘요' },
  { a: '루테인', b: '오메가', type: 'synergy', label: '오메가-3가 루테인·지아잔틴의 흡수를 도와 눈 건강에 시너지를 냅니다' },
  { a: '프로바이오틱', b: '프리바이오틱', type: 'synergy', label: '프리바이오틱스가 유익균의 먹이가 되어 프로바이오틱스 정착을 도와줘요' },
  { a: '글루타치온', b: '비타민c', type: 'synergy', label: '비타민C가 산화된 글루타치온을 환원시켜 재활용을 도와요' },
  { a: '콜라겐', b: '비타민c', type: 'synergy', label: '비타민C는 콜라겐 합성에 필수적인 보조인자입니다' },
  // ── 주의/충돌 조합 ────────────────────────────────────────
  { a: '철분', b: '칼슘', type: 'conflict', label: '칼슘이 철분 흡수를 방해해요. 최소 2시간 간격으로 복용하세요' },
  { a: '철분', b: '마그네슘', type: 'conflict', label: '마그네슘이 철분 흡수를 경쟁적으로 억제해요. 시간을 나눠 드세요' },
  { a: '아연', b: '구리', type: 'conflict', label: '고용량 아연은 구리 흡수를 방해할 수 있어요' },
  { a: '아연', b: '철분', type: 'conflict', label: '아연과 철분은 같은 수송체를 경쟁해 흡수를 서로 방해해요' },
  { a: '칼슘', b: '마그네슘', type: 'conflict', label: '고용량 동시 복용 시 흡수 경쟁이 일어나요. 비율(2:1)을 지키거나 나눠 드세요' },
  { a: '비타민a', b: '비타민e', type: 'conflict', label: '고용량에서 흡수 경쟁이 발생할 수 있어요. 식사와 함께 적정 용량을 지키세요' },
  { a: '비타민k', b: '비타민e', type: 'conflict', label: '고용량 비타민E는 비타민K 의존 혈액응고를 방해할 수 있어요' },
];

// ─── 결과 타입 ────────────────────────────────────────────────

export interface CompatResult {
  type: 'synergy' | 'conflict';
  nameA: string;
  nameB: string;
  label: string;
  timing: string; // 같은 시간대
}

// ─── 분석 함수 ────────────────────────────────────────────────

/**
 * 같은 시간대의 루틴 아이템들 간 궁합을 분석해 결과 배열 반환
 */
export function analyzeRoutineCompatibility(routines: RoutineItem[]): CompatResult[] {
  const results: CompatResult[] = [];
  const seen = new Set<string>(); // 중복 방지

  for (let i = 0; i < routines.length; i++) {
    for (let j = i + 1; j < routines.length; j++) {
      const a = routines[i];
      const b = routines[j];

      // 같은 시간대인지 확인
      const sameTime = a.timing === b.timing;
      const timingLabel = sameTime ? a.timing : `${a.timing}·${b.timing}`;

      for (const rule of RULES) {
        const forward = matches(a.name, rule.a) && matches(b.name, rule.b);
        const reverse = matches(a.name, rule.b) && matches(b.name, rule.a);

        if (forward || reverse) {
          // 충돌(conflict)은 같은 시간대일 때만 의미 있음
          if (rule.type === 'conflict' && !sameTime) continue;

          const key = `${rule.type}-${a.id}-${b.id}`;
          const keyAlt = `${rule.type}-${b.id}-${a.id}`;
          if (seen.has(key) || seen.has(keyAlt)) continue;
          seen.add(key);

          results.push({
            type: rule.type,
            nameA: a.name,
            nameB: b.name,
            label: rule.label,
            timing: timingLabel,
          });
        }
      }
    }
  }

  // 시너지 먼저, 충돌 나중
  return results.sort((a, b) => (a.type === 'synergy' ? -1 : 1) - (b.type === 'synergy' ? -1 : 1));
}
