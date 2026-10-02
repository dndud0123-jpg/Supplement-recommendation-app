import { useState } from 'react';
import { SendHorizonal } from 'lucide-react';

interface ChatInputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInputBar({ onSend, disabled }: ChatInputBarProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-100 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-30">
      <div className="flex items-end gap-2">
        <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-200 focus-within:border-vita-400 focus-within:ring-2 focus-within:ring-vita-100 transition-all">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="증상이나 원하는 효과를 입력하세요..."
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none outline-none max-h-20 leading-relaxed"
            style={{ minHeight: '24px' }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="flex-shrink-0 w-10 h-10 bg-vita-500 text-white rounded-xl flex items-center justify-center
                     hover:bg-vita-600 active:bg-vita-700 active:scale-95
                     disabled:bg-gray-200 disabled:text-gray-400
                     transition-all duration-150 touch-manipulation"
          aria-label="전송"
        >
          <SendHorizonal className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}
