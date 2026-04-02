"use client";

import { Message } from "ai";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

function getToolDisplay(toolName: string, args: Record<string, unknown>): { label: string; path: string } {
  const path = ((args.path as string | undefined) ?? "").replace(/^\//, "");
  const filename = path.split("/").pop() ?? path;

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":     return { label: "Creating",  path };
      case "str_replace":
      case "insert":     return { label: "Editing",   path };
      case "view":       return { label: "Reading",   path };
    }
  }

  if (toolName === "file_manager") {
    const newFilename = ((args.new_path as string | undefined) ?? "").split("/").pop() ?? "";
    switch (args.command) {
      case "delete": return { label: "Deleting",                        path };
      case "rename": return { label: `Renaming ${filename} → ${newFilename}`, path: "" };
    }
  }

  return { label: toolName, path };
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-6">
      <div className="space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div
            key={message.id || message.content}
            className={cn(
              "flex gap-4",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center text-base">
                  🐱
                </div>
              </div>
            )}
            
            <div className={cn(
              "flex flex-col gap-2 max-w-[85%]",
              message.role === "user" ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "rounded-xl px-4 py-3",
                message.role === "user"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-card-foreground border border-border shadow-sm"
              )}>
                <div className="text-sm">
                  {message.parts ? (
                    <>
                      {message.parts.map((part, partIndex) => {
                        switch (part.type) {
                          case "text":
                            return message.role === "user" ? (
                              <span key={partIndex} className="whitespace-pre-wrap">{part.text}</span>
                            ) : (
                              <MarkdownRenderer
                                key={partIndex}
                                content={part.text}
                                className="prose-sm"
                              />
                            );
                          case "reasoning":
                            return (
                              <div key={partIndex} className="mt-3 p-3 bg-white/50 rounded-md border border-neutral-200">
                                <span className="text-xs font-medium text-neutral-600 block mb-1">Reasoning</span>
                                <span className="text-sm text-neutral-700">{part.reasoning}</span>
                              </div>
                            );
                          case "tool-invocation":
                            const tool = part.toolInvocation;
                            const { label, path: toolPath } = getToolDisplay(tool.toolName, tool.args as Record<string, unknown>);
                            const isDone = tool.state === "result" && tool.result;
                            return (
                              <p key={partIndex} className="mt-1 text-xs text-neutral-400 italic">
                                {isDone ? "✓" : "…"} {label}{toolPath ? ` ${toolPath}` : ""}
                              </p>
                            );
                          case "source":
                            return (
                              <div key={partIndex} className="mt-2 text-xs text-neutral-500">
                                Source: {JSON.stringify(part.source)}
                              </div>
                            );
                          case "step-start":
                            return partIndex > 0 ? <hr key={partIndex} className="my-3 border-neutral-200" /> : null;
                          default:
                            return null;
                        }
                      })}
                      {isLoading &&
                        message.role === "assistant" &&
                        messages.indexOf(message) === messages.length - 1 && (
                          <div className="flex items-center gap-2 mt-3 text-neutral-500">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-sm">Generating...</span>
                          </div>
                        )}
                    </>
                  ) : message.content ? (
                    message.role === "user" ? (
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    ) : (
                      <MarkdownRenderer content={message.content} className="prose-sm" />
                    )
                  ) : isLoading &&
                    message.role === "assistant" &&
                    messages.indexOf(message) === messages.length - 1 ? (
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-sm">Generating...</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            
            {message.role === "user" && (
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-lg bg-primary shadow-sm flex items-center justify-center text-xs font-medium text-primary-foreground">
                  You
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}