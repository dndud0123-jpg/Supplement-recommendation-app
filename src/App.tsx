import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import MobileFrame from './components/MobileFrame';
import TopNav from './components/TopNav';
import QuickChips from './components/QuickChips';
import ChatInputBar from './components/ChatInputBar';
import ResultCard from './components/ResultCard';
import RoutineBottomSheet from './components/RoutineBottomSheet';
import ApiKeyModal from './components/ApiKeyModal';
import { analyzeSymptoms, analyzeQuick, hasApiKey } from './services/gemini';
import type { AiAnalysis, RoutineItem, SupplementItem } from './types';

const ROUTINE_STORAGE_KEY = 'vitamobile_routines';

function loadRoutines(): RoutineItem[] {
  try {
    const data = localStorage.getItem(ROUTINE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRoutines(routines: RoutineItem[]): void {
  localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(routines));
}

export default function App() {
  const [apiKeyReady, setApiKeyReady] = useState(hasApiKey());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [userQuery, setUserQuery] = useState<string>('');
  const [routines, setRoutines] = useState<RoutineItem[]>(loadRoutines);
  const [showRoutine, setShowRoutine] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // 루틴 변경 시 로컬스토리지 동기화
  useEffect(() => {
    saveRoutines(routines);
  }, [routines]);

  // 토스트 자동 소멸
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSend = useCallback(async (message: string, isQuick = false) => {
    if (!hasApiKey()) {
      setShowApiKey(true);
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setUserQuery(message);

    try {
      const result = isQuick
        ? await analyzeQuick(message)
        : await analyzeSymptoms(message);
      setAnalysis(result);
      // 결과 영역으로 스크롤
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'API_KEY_MISSING') {
          setShowApiKey(true);
        } else {
          setError(err.message);
        }
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddRoutine = useCallback((item: SupplementItem) => {
    setRoutines(prev => {
      if (prev.some(r => r.id === item.id)) return prev;
      return [...prev, { ...item, addedAt: Date.now() }];
    });
    setToast(`${item.name}이(가) 루틴에 추가되었습니다`);
  }, []);

  const handleRemoveRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  }, []);

  // 시너지 항목에서 영양소명만으로 빠르게 루틴 추가
  const handleAddSynergyRoutine = useCallback((name: string) => {
    setRoutines(prev => {
      if (prev.some(r => r.name === name)) return prev;
      const newItem = {
        id: `synergy_${name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
        name,
        target: '시너지 영양제',
        timing: '식후' as const,
        why: '함께 먹으면 좋은 시너지 영양제로 추가되었습니다.',
        caution: '복용 전 전문가 상담을 권장합니다.',
        synergyWith: [],
        avoidWith: [],
        addedAt: Date.now(),
      };
      return [...prev, newItem];
    });
    setToast(`${name}이(가) 루틴에 추가되었습니다`);
  }, []);

  return (
    <MobileFrame>
      <TopNav
        routineCount={routines.length}
        onOpenApiKey={() => setShowApiKey(true)}
        onOpenRoutine={() => setShowRoutine(true)}
      />

      {/* 스크롤 가능한 메인 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* 퀵 칩 */}
        <QuickChips onSelect={(msg) => handleSend(msg, true)} disabled={loading} />

        {/* 웰컴 / 결과 영역 */}
        <div className="px-4 pb-4">
          {/* 기본 안내 (결과 없을 때) */}
          {!analysis && !loading && !error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-vita-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-vita-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                어떤 건강 고민이 있으신가요?
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                증상이나 원하는 효과를 자유롭게 입력하면<br />
                AI가 최적의 영양제를 추천해 드려요
              </p>
            </div>
          )}

          {/* 로딩 */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-vita-500 animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500 animate-pulse-soft">
                AI가 증상을 분석하고 있어요...
              </p>
            </div>
          )}

          {/* 에러 */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">분석 중 오류 발생</p>
                <p className="text-xs text-red-500 mt-1">{error}</p>
                <button
                  onClick={() => handleSend(userQuery)}
                  className="mt-2 text-xs text-red-600 font-semibold underline touch-manipulation"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {/* 분석 결과 */}
          {analysis && (
            <div ref={resultRef} className="space-y-4">
              {/* 요약 */}
              <div className="bg-vita-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-vita-600" />
                  <span className="text-xs font-semibold text-vita-700">AI 분석 요약</span>
                </div>
                <p className="text-sm text-vita-800 leading-relaxed">{analysis.summary}</p>
              </div>

              {/* 추천 카드들 */}
              <div className="space-y-3">
                {analysis.items.map((item) => (
                  <ResultCard
                    key={item.id}
                    item={item}
                    isInRoutine={routines.some(r => r.id === item.id)}
                    onAddRoutine={handleAddRoutine}
                    onAddSynergyRoutine={handleAddSynergyRoutine}
                    routineNames={new Set(routines.map(r => r.name))}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 면책 조항 */}
        <div className="px-6 py-4 text-center">
          <p className="text-[10px] text-gray-300 leading-relaxed">
            ⚠️ 본 정보는 의학적 진단/처방이 아니며 전문의와 상담을 권장합니다.
            <br />
            개인의 건강 상태에 따라 영양제 효과와 부작용이 다를 수 있습니다.
          </p>
        </div>
      </div>

      {/* 하단 인풋 바 */}
      <ChatInputBar onSend={handleSend} disabled={loading} />

      {/* 바텀시트 */}
      <RoutineBottomSheet
        isOpen={showRoutine}
        onClose={() => setShowRoutine(false)}
        routines={routines}
        onRemove={handleRemoveRoutine}
      />

      {/* API 키 모달 */}
      <ApiKeyModal
        isOpen={showApiKey}
        onClose={() => setShowApiKey(false)}
        onSaved={() => setApiKeyReady(hasApiKey())}
      />

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg whitespace-nowrap">
            {toast}
          </div>
        </div>
      )}

      {/* API 키 미설정 배너 */}
      {!apiKeyReady && !showApiKey && (
        <div className="absolute top-14 left-0 right-0 z-20 px-4 pt-2 animate-fade-in">
          <button
            onClick={() => setShowApiKey(true)}
            className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left touch-manipulation"
          >
            <p className="text-xs font-semibold text-amber-700">🔑 API 키를 설정해주세요</p>
            <p className="text-[10px] text-amber-500 mt-0.5">Google AI Studio에서 무료 API 키를 발급받을 수 있습니다</p>
          </button>
        </div>
      )}
    </MobileFrame>
  );
}
