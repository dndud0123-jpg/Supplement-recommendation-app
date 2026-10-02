import { X, Trash2, Sun, CloudSun, Moon, Clock, Handshake, ShieldAlert, FlaskConical } from 'lucide-react';
import type { RoutineItem } from '../types';
import { analyzeRoutineCompatibility } from '../utils/compatibility';

interface RoutineBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  routines: RoutineItem[];
  onRemove: (id: string) => void;
}

const TIME_GROUPS = [
  { key: '아침', label: '아침', icon: Sun, color: 'text-amber-500' },
  { key: '점심', label: '점심', icon: CloudSun, color: 'text-blue-500' },
  { key: '저녁', label: '저녁', icon: Moon, color: 'text-purple-500' },
] as const;

const OTHER_TIMINGS = ['식전', '식후', '취침전'] as const;

export default function RoutineBottomSheet({ isOpen, onClose, routines, onRemove }: RoutineBottomSheetProps) {
  if (!isOpen) return null;

  const grouped = {
    '아침': routines.filter(r => r.timing === '아침'),
    '점심': routines.filter(r => r.timing === '점심'),
    '저녁': routines.filter(r => r.timing === '저녁'),
    '기타': routines.filter(r => (OTHER_TIMINGS as readonly string[]).includes(r.timing)),
  };

  // 궁합 분석
  const compatResults = routines.length >= 2 ? analyzeRoutineCompatibility(routines) : [];
  const synergies = compatResults.filter(r => r.type === 'synergy');
  const conflicts = compatResults.filter(r => r.type === 'conflict');

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/40 z-40 overlay-enter"
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <div className="w-full max-w-md bg-white rounded-t-3xl animate-slide-up max-h-[80vh] flex flex-col">
          {/* 핸들 */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-3">
            <h2 className="text-lg font-bold text-gray-900">
              내 영양제 루틴
              <span className="ml-2 text-sm font-normal text-gray-400">
                {routines.length}개
              </span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              aria-label="닫기"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 콘텐츠 */}
          <div className="flex-1 overflow-y-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            {routines.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">아직 담은 영양제가 없어요</p>
                <p className="text-xs text-gray-300 mt-1">추천 결과에서 &apos;내 루틴에 추가&apos;를 눌러보세요</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* ─── 루틴 타임라인 ─── */}
                {TIME_GROUPS.map(({ key, label, icon: Icon, color }) => {
                  const items = grouped[key];
                  if (items.length === 0) return null;
                  return (
                    <div key={key}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-sm font-semibold text-gray-700">{label}</span>
                        <span className="text-xs text-gray-400">{items.length}개</span>
                      </div>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id + item.addedAt}
                            className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-400 truncate">{item.target}</p>
                            </div>
                            <button
                              onClick={() => onRemove(item.id)}
                              className="flex-shrink-0 p-2 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors touch-manipulation"
                              aria-label={`${item.name} 삭제`}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* 기타 그룹 */}
                {grouped['기타'].length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">기타</span>
                      <span className="text-xs text-gray-400">{grouped['기타'].length}개</span>
                    </div>
                    <div className="space-y-2">
                      {grouped['기타'].map((item) => (
                        <div
                          key={item.id + item.addedAt}
                          className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                              <span className="ml-1.5 text-xs text-gray-400">({item.timing})</span>
                            </p>
                            <p className="text-xs text-gray-400 truncate">{item.target}</p>
                          </div>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="flex-shrink-0 p-2 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors touch-manipulation"
                            aria-label={`${item.name} 삭제`}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── 내 루틴 궁합 진단 ─── */}
                {compatResults.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FlaskConical className="w-4 h-4 text-vita-600" />
                      <span className="text-sm font-bold text-gray-800">내 루틴 궁합 진단</span>
                    </div>

                    <div className="space-y-2">
                      {/* 🟢 좋은 시너지 조합 */}
                      {synergies.map((r, i) => (
                        <div
                          key={`synergy-${i}`}
                          className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 flex items-start gap-2"
                        >
                          <Handshake className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-emerald-700">
                              {r.nameA} + {r.nameB}
                              <span className="ml-1.5 font-normal text-emerald-500">({r.timing})</span>
                            </p>
                            <p className="text-[11px] text-emerald-600 mt-0.5 leading-snug">{r.label}</p>
                          </div>
                        </div>
                      ))}

                      {/* ⚠️ 주의 조합 */}
                      {conflicts.map((r, i) => (
                        <div
                          key={`conflict-${i}`}
                          className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5 flex items-start gap-2"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-orange-700">
                              {r.nameA} + {r.nameB}
                              <span className="ml-1.5 font-normal text-orange-400">({r.timing} 동시복용)</span>
                            </p>
                            <p className="text-[11px] text-orange-600 mt-0.5 leading-snug">{r.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 루틴 2개 미만일 때 안내 */}
                {routines.length === 1 && (
                  <div className="border-t border-gray-100 pt-4 text-center">
                    <p className="text-xs text-gray-300">영양제를 2개 이상 추가하면 궁합 진단이 시작돼요 🔬</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
