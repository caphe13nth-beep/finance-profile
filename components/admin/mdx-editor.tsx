"use client";

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Eye,
  EyeOff,
  Table,
} from "lucide-react";

interface MdxEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface ToolbarAction {
  icon: typeof Bold;
  label: string;
  action: (textarea: HTMLTextAreaElement, value: string) => string;
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  value: string,
  before: string,
  after: string
): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);
  const replacement = `${before}${selected || "text"}${after}`;
  return value.slice(0, start) + replacement + value.slice(end);
}

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  value: string,
  insertion: string
): string {
  const pos = textarea.selectionStart;
  return value.slice(0, pos) + insertion + value.slice(pos);
}

function prefixLines(
  textarea: HTMLTextAreaElement,
  value: string,
  prefix: string
): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);
  if (selected) {
    const prefixed = selected
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n");
    return value.slice(0, start) + prefixed + value.slice(end);
  }
  return insertAtCursor(textarea, value, `\n${prefix}`);
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: "Bold", action: (ta, v) => wrapSelection(ta, v, "**", "**") },
  { icon: Italic, label: "Italic", action: (ta, v) => wrapSelection(ta, v, "_", "_") },
  { icon: Heading2, label: "Heading 2", action: (ta, v) => insertAtCursor(ta, v, "\n## ") },
  { icon: Heading3, label: "Heading 3", action: (ta, v) => insertAtCursor(ta, v, "\n### ") },
  { icon: List, label: "Bullet List", action: (ta, v) => prefixLines(ta, v, "- ") },
  { icon: ListOrdered, label: "Numbered List", action: (ta, v) => prefixLines(ta, v, "1. ") },
  { icon: Quote, label: "Blockquote", action: (ta, v) => prefixLines(ta, v, "> ") },
  { icon: Code, label: "Code Block", action: (ta, v) => insertAtCursor(ta, v, "\n```\n\n```\n") },
  { icon: LinkIcon, label: "Link", action: (ta, v) => wrapSelection(ta, v, "[", "](url)") },
  { icon: ImageIcon, label: "Image", action: (ta, v) => insertAtCursor(ta, v, "\n![alt](url)\n") },
  { icon: Minus, label: "Divider", action: (ta, v) => insertAtCursor(ta, v, "\n---\n") },
  {
    icon: Table,
    label: "Table",
    action: (ta, v) =>
      insertAtCursor(
        ta,
        v,
        "\n| Header | Header |\n|--------|--------|\n| Cell   | Cell   |\n"
      ),
  },
];

// Simple markdown to HTML for preview (covers common cases)
function markdownToHtml(md: string): string {
  let html = md
    // Code blocks (must come before inline transforms)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="preview-pre"><code>$2</code></pre>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="preview-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="preview-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="preview-h1">$1</h1>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="preview-hr" />')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="preview-code">$1</code>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="preview-img" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="preview-link">$1</a>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="preview-bq">$1</blockquote>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="preview-li">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="preview-li-ol">$1</li>')
    // Paragraphs: wrap remaining lines
    .replace(/^(?!<[a-z])((?!$).+)$/gm, "<p>$1</p>");

  // Wrap consecutive <li> elements in <ul>/<ol>
  html = html.replace(
    /(<li class="preview-li">[\s\S]*?<\/li>(\n|$))+/g,
    (match) => `<ul>${match}</ul>`
  );
  html = html.replace(
    /(<li class="preview-li-ol">[\s\S]*?<\/li>(\n|$))+/g,
    (match) => `<ol>${match}</ol>`
  );

  return html;
}

export function MdxEditor({ value, onChange }: MdxEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleToolbarAction = useCallback(
    (action: ToolbarAction["action"]) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const newValue = action(ta, value);
      onChange(newValue);
      ta.focus();
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Tab inserts 2 spaces
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const newValue = value.slice(0, start) + "  " + value.slice(ta.selectionEnd);
        onChange(newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }

      // Ctrl/Cmd+B for bold
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        handleToolbarAction(TOOLBAR_ACTIONS[0].action);
      }

      // Ctrl/Cmd+I for italic
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        handleToolbarAction(TOOLBAR_ACTIONS[1].action);
      }
    },
    [value, onChange, handleToolbarAction]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const lineCount = value.split("\n").length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-border bg-muted/50 px-2 py-1 flex-wrap">
        {TOOLBAR_ACTIONS.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleToolbarAction(action)}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            title={label}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}

        <div className="flex-1" />

        {/* Preview toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
            showPreview
              ? "bg-accent/10 text-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {showPreview ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
          Preview
        </button>
      </div>

      {/* Editor / Preview */}
      <div className={showPreview ? "grid grid-cols-2 divide-x divide-border" : ""}>
        {/* Editor pane */}
        <div className={showPreview ? "" : ""}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={18}
            className="w-full resize-none bg-background px-4 py-3 font-mono text-sm leading-relaxed focus:outline-none"
            placeholder="Write your article in Markdown/MDX..."
            spellCheck={false}
          />
        </div>

        {/* Preview pane */}
        {showPreview && (
          <div
            className="prose-preview max-h-[460px] overflow-y-auto bg-background px-4 py-3 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 border-t border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
        <span>{lineCount} lines</span>
        <span>{wordCount} words</span>
        <span>MDX</span>
      </div>
    </div>
  );
}
