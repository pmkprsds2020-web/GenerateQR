"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tag, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

const TAG_COLORS = [
  "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/20",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",
  "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/20",
  "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/20",
];

function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export function TagInput({ tags, onChange, maxTags = 10 }: TagInputProps) {
  const [input, setInput] = React.useState("");

  const addTag = () => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setInput("");
      return;
    }
    if (tags.length >= maxTags) return;
    onChange([...tags, trimmed]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Tag className="h-3 w-3" />
        <span>Tag / Label</span>
        {tags.length > 0 && (
          <span className="text-muted-foreground/60">({tags.length}/{maxTags})</span>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={cn("text-xs gap-1 pr-1", getTagColor(tag))}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:bg-black/10 dark:hover:bg-white/10 rounded-sm p-0.5"
                aria-label={`Hapus ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {tags.length < maxTags && (
        <div className="flex gap-1.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tambah tag..."
            className="h-8 text-xs"
            maxLength={20}
          />
          <button
            onClick={addTag}
            disabled={!input.trim()}
            className="flex items-center justify-center h-8 w-8 rounded-md border bg-background hover:bg-accent disabled:opacity-50 transition-colors shrink-0"
            aria-label="Tambah tag"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
