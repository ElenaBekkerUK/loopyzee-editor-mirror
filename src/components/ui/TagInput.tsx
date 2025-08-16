// editor-app/src/components/UI/TagInput.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  inputWrap,
  inputField,
  tag,
  tagList,
  tagText,
  removeBtn,
  dropdown,
  suggestionItem,
} from "./TagInput.css";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
};

export default function TagInput({ value, onChange }: Props) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    import("../../firebase").then(({ db }) => {
      import("firebase/firestore").then(({ collection, getDocs }) => {
        getDocs(collection(db, "tags")).then((snap) => {
          const tags = snap.docs.map((d) => d.id);
          setSuggestions(tags);
        });
      });
    });
  }, []);

  useEffect(() => {
    const q = input.trim().toLowerCase();
    setFiltered(q ? suggestions.filter((s) => s.startsWith(q) && !value.includes(s)) : []);
  }, [input, suggestions, value]);

  const handleAdd = (text: string) => {
    const tag = text.trim().toLowerCase();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      handleAdd(input);
    } else if (e.key === "Backspace" && input === "") {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className={inputWrap}>
      <div className={tagList}>
        {value.map((t) => (
          <span key={t} className={tag}>
            <span className={tagText}>{t}</span>
            <button className={removeBtn} onClick={() => onChange(value.filter((v) => v !== t))}>
              &times;
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tag..."
          className={inputField}
        />
      </div>

      {filtered.length > 0 && (
        <div className={dropdown}>
          {filtered.map((s) => (
            <div key={s} className={suggestionItem} onClick={() => handleAdd(s)}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
