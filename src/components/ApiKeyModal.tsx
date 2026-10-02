import { useState, useEffect } from 'react';
import { KeyRound, X, Eye, EyeOff, Trash2, CheckCircle2 } from 'lucide-react';
import { saveApiKey, getStoredApiKey, removeApiKey, isEnvKeyConfigured } from '../services/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function ApiKeyModal({ isOpen, onClose, onSaved }: ApiKeyModalProps) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKey();
      setKey(stored);
      setHasExisting(!!stored);
      setShowKey(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmed = key.trim();
    if (!trimmed) return;
    saveApiKey(trimmed);
    onSaved();
    onClose();
  };

  const handleRemove = () => {
    removeApiKey();
    setKey('');
    setHasExisting(false);
    onSaved();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 overlay-enter" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl animate-fade-in">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-vita-600" />
              <h3 className="text-base font-bold text-gray-900">API 키 설정</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
              aria-label="닫기"
            >
              <X className="w-4.5 h-4.5 text-gray-400" />
            </button>
          </div>

          {/* 내용 */}
          <div className="px-5 pb-5 space-y-4">
            {isEnvKeyConfigured() && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-800">서버 환경변수 활성화됨</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5 leading-relaxed">
                    배포 환경(VITE_GEMINI_API_KEY)에 설정된 API 키가 기본 적용 중입니다. 아래에서 입력 시 개인 키로 덮어씌울 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 leading-relaxed">
              Google AI Studio에서 발급받은 Gemini API 키를 입력하세요.
              키는 이 기기의 브라우저에만 안전하게 저장됩니다.
            </p>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIza..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm
                           focus:outline-none focus:border-vita-400 focus:ring-2 focus:ring-vita-100
                           placeholder-gray-300 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 touch-manipulation"
                aria-label={showKey ? '키 숨기기' : '키 보기'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-2">
              {hasExisting && (
                <button
                  onClick={handleRemove}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium
                             hover:bg-red-50 active:bg-red-100 transition-colors touch-manipulation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  삭제
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!key.trim()}
                className="flex-1 py-2.5 bg-vita-500 text-white text-sm font-semibold rounded-xl
                           hover:bg-vita-600 active:bg-vita-700 active:scale-[0.98]
                           disabled:bg-gray-200 disabled:text-gray-400
                           transition-all duration-150 touch-manipulation"
              >
                {hasExisting ? '업데이트' : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
