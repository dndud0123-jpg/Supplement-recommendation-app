import { Clock, AlertTriangle, Plus, Check, Handshake, ShieldAlert } from 'lucide-react';
import type { SupplementItem } from '../types';

interface ResultCardProps {
  item: SupplementItem;
  isInRoutine: boolean;
  onAddRoutine: (item: SupplementItem) => void;
  /** 시너지 항목에서 바로 추가할 때 사용 */
  onAddSynergyRoutine: (name: string) => void;
  /** 이미 루틴에 있는 영양제명 집합 (비교용) */
  routineNames: Set<string>;
}

const TIMING_COLORS: Record<string, string> = {
  '아침': 'bg-amber-100 text-amber-700',
  '점심': 'bg-blue-100 text-blue-700',
  '저녁': 'bg-purple-100 text-purple-700',
  '식전': 'bg-orange-100 text-orange-700',
  '식후': 'bg-teal-100 text-teal-700',
  '취침전': 'bg-indigo-100 text-indigo-700',
};

export default function ResultCard({
  item,
  isInRoutine,
  onAddRoutine,
  onAddSynergyRoutine,
  routineNames,
}: ResultCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">{item.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{item.target}</p>
          </div>
          <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${TIMING_COLORS[item.timing] || 'bg-gray-100 text-gray-600'}`}>
            <Clock className="w-3 h-3" />
            {item.timing}
          </span>
        </div>

        {/* 작용 기전 */}
        <div className="bg-gray-50 rounded-xl p-3 mb-3">
          <p className="text-sm text-gray-700 leading-relaxed">{item.why}</p>
        </div>

        {/* 주의사항 */}
        <div className="flex items-start gap-2 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">{item.caution}</p>
        </div>

        {/* 🟢 시너지 궁합 */}
        {item.synergyWith && item.synergyWith.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Handshake className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">함께 먹으면 좋아요</span>
            </div>
            <div className="space-y-2">
              {item.synergyWith.map((s, i) => {
                const alreadyAdded = routineNames.has(s.name);
                return (
                  <div key={i} className="flex items-start gap-2">
                    <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-emerald-600 ml-1">— {s.reason}</span>
                      </p>
                    </div>
                    {/* + 루틴 추가 버튼 */}
                    <button
                      onClick={() => onAddSynergyRoutine(s.name)}
                      disabled={alreadyAdded}
                      className={`flex-shrink-0 flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-semibold
                                  transition-all duration-150 touch-manipulation active:scale-95
                                  ${alreadyAdded
                                    ? 'bg-emerald-100 text-emerald-400 cursor-default'
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                  }`}
                      aria-label={alreadyAdded ? `${s.name} 추가됨` : `${s.name} 루틴 추가`}
                    >
                      {alreadyAdded ? (
                        <><Check className="w-2.5 h-2.5" />추가됨</>
                      ) : (
                        <><Plus className="w-2.5 h-2.5" />추가</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 🔴 병용 주의 궁합 */}
        {item.avoidWith && item.avoidWith.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-semibold text-red-700">함께 먹을 때 주의해요</span>
            </div>
            <div className="space-y-1.5">
              {item.avoidWith.map((a, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400" />
                  <p className="text-xs text-red-800 leading-relaxed">
                    <span className="font-semibold">{a.name}</span>
                    <span className="text-red-600 ml-1">— {a.reason}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 루틴 추가 버튼 */}
        <button
          onClick={() => onAddRoutine(item)}
          disabled={isInRoutine}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 
                      transition-all duration-150 touch-manipulation active:scale-[0.98]
                      ${isInRoutine
                        ? 'bg-vita-50 text-vita-600 cursor-default'
                        : 'bg-vita-500 text-white hover:bg-vita-600 active:bg-vita-700'
                      }`}
        >
          {isInRoutine ? (
            <>
              <Check className="w-4 h-4" />
              루틴에 추가됨
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              내 루틴에 추가
            </>
          )}
        </button>
      </div>
    </div>
  );
}
