"use client";

import { ChangeEvent, FormEvent, KeyboardEvent } from "react";

interface MessageInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function MessageInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: MessageInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative p-4 bg-card border-t border-border/60">
      <div className="relative max-w-4xl mx-auto">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe the React component you want..."
          disabled={isLoading}
          className="w-full min-h-[80px] max-h-[200px] pl-4 pr-14 py-3.5 rounded-xl border border-border bg-muted/30 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/50 focus:bg-card transition-all placeholder:text-muted-foreground text-[15px] font-normal shadow-sm"
          rows={3}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-3 bottom-3 p-2.5 rounded-lg transition-all hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent group"
        >
          <span className={`text-xs font-medium ${isLoading || !input.trim() ? 'text-muted-foreground' : 'text-primary'}`}>Send</span>
        </button>
      </div>
    </form>
  );
}