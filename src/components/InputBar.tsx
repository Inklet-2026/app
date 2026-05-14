import { useRef, useEffect } from "react";
import { usePushStore } from "../stores/pushStore";
import { useAppStore } from "../stores/appStore";

export default function InputBar() {
  const ref = useRef<HTMLTextAreaElement>(null);
  const mode = useAppStore((s) => s.mode);
  const toggleMode = useAppStore((s) => s.toggleMode);
  const content = usePushStore((s) => s.content);
  const setContent = usePushStore((s) => s.setContent);
  const isSubmitting = usePushStore((s) => s.isSubmitting);
  const submit = usePushStore((s) => s.submit);

  useEffect(() => {
    if (mode === "expanded") ref.current?.focus();
  }, [mode]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  if (mode === "mini") {
    return (
      <div
        className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 cursor-text"
        onClick={toggleMode}
      >
        <span className="text-gray-300 text-sm">+</span>
        <span className="flex-1 text-gray-400 text-sm truncate">Push content to device...</span>
        <span className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center text-white text-xs">↑</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2">
      <span className="text-gray-300 text-sm mt-1">+</span>
      <textarea
        ref={ref}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Push content to device..."
        rows={1}
        className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 resize-none outline-none min-h-[20px] max-h-[80px]"
      />
      <button
        onClick={submit}
        disabled={isSubmitting || !content.trim()}
        className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center text-white text-xs shrink-0 disabled:opacity-40"
      >
        {isSubmitting ? "..." : "↑"}
      </button>
    </div>
  );
}
