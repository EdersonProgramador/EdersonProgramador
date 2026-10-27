import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { COURSES_UI } from "@ederson-agencia/shared";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FontSize } from "./fontSizeExtension";
import { LineHeight } from "./lineHeightExtension";
import "../../styles/fichamento-editor.css";

export type EditorSnapshot = { docJson: string; docHtml: string };

type NotionEditorProps = {
  contentJson?: string | null;
  contentHtml?: string | null;
  placeholder?: string;
  onSave: (snapshot: EditorSnapshot) => void | Promise<void>;
  editorKey?: string;
};

const FONT_FAMILIES = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times", value: "'Times New Roman', Times, serif" },
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "Monospace", value: "ui-monospace, monospace" }
];

const FONT_SIZES = ["10px", "11px", "12px", "14px", "16px", "18px", "24px", "32px"];
const LINE_HEIGHTS = [
  { label: "Simples", value: "1" },
  { label: "1,15", value: "1.15" },
  { label: "1,5", value: "1.5" },
  { label: "Duplo", value: "2" }
];

const TEXT_COLORS = ["#eef2f6", "#f87171", "#fb923c", "#facc15", "#4ade80", "#38bdf8", "#a78bfa", "#1f2937"];
const HIGHLIGHT_COLORS = ["#fef08a", "#bbf7d0", "#bae6fd", "#fbcfe8", "#e5e7eb"];

export function NotionEditor({ contentJson, contentHtml, placeholder, onSave, editorKey }: NotionEditorProps) {
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [, toolbarTick] = useState(0);
  const saveTimer = useRef<number | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
        Underline,
        TextStyle,
        FontFamily,
        FontSize,
        Color,
        Highlight.configure({ multicolor: true }),
        Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
        Image.configure({ inline: false, allowBase64: true }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList,
        TaskItem.configure({ nested: true }),
        LineHeight,
        Placeholder.configure({ placeholder: placeholder ?? "Escreva seu fichamento…" })
      ],
      content: contentJson ? safeParseJson(contentJson) : contentHtml ?? "",
      editorProps: {
        attributes: {
          class: "fichamento-editor__content"
        }
      },
      onUpdate: ({ editor: ed }) => {
        setSaveState("saving");
        if (saveTimer.current) window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(() => {
          void (async () => {
            try {
              await onSaveRef.current({
                docJson: JSON.stringify(ed.getJSON()),
                docHtml: ed.getHTML()
              });
              setSaveState("saved");
            } catch {
              setSaveState("idle");
            }
          })();
        }, 900);
      }
    },
    [editorKey]
  );

  useEffect(() => {
    if (!editor) return;
    const bump = () => toolbarTick((n) => n + 1);
    editor.on("selectionUpdate", bump);
    editor.on("transaction", bump);
    return () => {
      editor.off("selectionUpdate", bump);
      editor.off("transaction", bump);
    };
  }, [editor]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  if (!editor) return null;

  const currentStyle = headingLevel(editor) ?? "paragraph";
  const currentFont =
    (editor.getAttributes("textStyle").fontFamily as string | undefined)?.split(",")[0]?.replace(/'/g, "") ??
    "Inter";
  const currentSize = (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "14px";

  function setLink() {
    const prev = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor!.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function insertImage() {
    const url = window.prompt("URL da imagem:");
    if (!url?.trim()) return;
    editor!.chain().focus().setImage({ src: url.trim() }).run();
  }

  function clearFormatting() {
    editor!.chain().focus().clearNodes().unsetAllMarks().run();
  }

  return (
    <div className="fichamento-editor">
      <div className="fichamento-editor__toolbar fichamento-no-print">
        <div className="fichamento-editor__row">
          <ToolbarButton
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
            label="Desfazer"
          >
            <Undo2 size={16} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
            label="Refazer"
          >
            <Redo2 size={16} strokeWidth={2} />
          </ToolbarButton>
          <span className="fichamento-editor__sep" />

          <label className="fichamento-editor__select-wrap">
            <span className="sr-only">Estilo</span>
            <select
              className="fichamento-editor__select fichamento-editor__select--style"
              value={currentStyle}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "paragraph") editor.chain().focus().setParagraph().run();
                else editor.chain().focus().setHeading({ level: Number(v) as 1 | 2 | 3 }).run();
              }}
            >
              <option value="paragraph">Texto normal</option>
              <option value="1">Título 1</option>
              <option value="2">Título 2</option>
              <option value="3">Título 3</option>
            </select>
          </label>

          <label className="fichamento-editor__select-wrap">
            <span className="sr-only">Fonte</span>
            <select
              className="fichamento-editor__select"
              value={FONT_FAMILIES.find((f) => currentFont.includes(f.label))?.value ?? FONT_FAMILIES[3].value}
              onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <label className="fichamento-editor__select-wrap fichamento-editor__select-wrap--size">
            <span className="sr-only">Tamanho</span>
            <select
              className="fichamento-editor__select fichamento-editor__select--size"
              value={currentSize}
              onChange={(e) => {
                const size = e.target.value;
                if (size) editor.chain().focus().setFontSize(size).run();
                else editor.chain().focus().unsetFontSize().run();
              }}
            >
              {FONT_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("px", "")}
                </option>
              ))}
            </select>
          </label>

          <span className="fichamento-editor__sep" />

          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            label="Negrito"
          >
            <Bold size={16} strokeWidth={2.5} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            label="Itálico"
          >
            <Italic size={16} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            label="Sublinhado"
          >
            <UnderlineIcon size={16} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            label="Tachado"
          >
            <Strikethrough size={16} strokeWidth={2} />
          </ToolbarButton>

          <ColorMenu
            label="Cor do texto"
            colors={TEXT_COLORS}
            current={editor.getAttributes("textStyle").color as string | undefined}
            onPick={(c) => editor.chain().focus().setColor(c).run()}
            onClear={() => editor.chain().focus().unsetColor().run()}
          />
          <ColorMenu
            label="Realce"
            colors={HIGHLIGHT_COLORS}
            current={editor.getAttributes("highlight").color as string | undefined}
            onPick={(c) => editor.chain().focus().toggleHighlight({ color: c }).run()}
            onClear={() => editor.chain().focus().unsetHighlight().run()}
            highlight
          />

          <span className="fichamento-editor__sep" />

          <ToolbarButton active={editor.isActive("link")} onClick={setLink} label="Link">
            <Link2 size={16} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton onClick={insertImage} label="Imagem">
            <ImageIcon size={16} strokeWidth={2} />
          </ToolbarButton>
        </div>

        <div className="fichamento-editor__row">
          <ToolbarButton
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            label="Alinhar à esquerda"
          >
            <AlignLeft size={16} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            label="Centralizar"
          >
            <AlignCenter size={16} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            label="Alinhar à direita"
          >
            <AlignRight size={16} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "justify" })}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            label="Justificar"
          >
            <AlignJustify size={16} strokeWidth={2} />
          </ToolbarButton>

          <label className="fichamento-editor__select-wrap">
            <span className="sr-only">Entrelinhas</span>
            <select
              className="fichamento-editor__select fichamento-editor__select--line"
              defaultValue=""
              onChange={(e) => {
                const v = e.target.value;
                if (!v) editor.chain().focus().unsetLineHeight().run();
                else editor.chain().focus().setLineHeight(v).run();
              }}
            >
              <option value="" disabled>
                Entrelinhas
              </option>
              {LINE_HEIGHTS.map((lh) => (
                <option key={lh.value} value={lh.value}>
                  {lh.label}
                </option>
              ))}
            </select>
          </label>

          <span className="fichamento-editor__sep" />

          <ToolbarButton
            active={editor.isActive("taskList")}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            label="Lista de tarefas"
          >
            <ListChecks size={16} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            label="Lista com marcadores"
          >
            <List size={16} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            label="Lista numerada"
          >
            <ListOrdered size={16} strokeWidth={2} />
          </ToolbarButton>

          <ToolbarButton
            disabled={!canAdjustListIndent(editor, "sink")}
            onClick={() => runListIndent(editor, "sink")}
            label="Aumentar recuo"
          >
            <IndentIncrease size={16} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            disabled={!canAdjustListIndent(editor, "lift")}
            onClick={() => runListIndent(editor, "lift")}
            label="Diminuir recuo"
          >
            <IndentDecrease size={16} strokeWidth={2} />
          </ToolbarButton>

          <ToolbarButton onClick={clearFormatting} label="Limpar formatação">
            <Eraser size={16} strokeWidth={2} />
          </ToolbarButton>

          <span className="fichamento-editor__status">
            {saveState === "saving"
              ? COURSES_UI.study.fichamentoSaving
              : saveState === "saved"
                ? COURSES_UI.study.fichamentoSaved
                : ""}
          </span>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

const LIST_ITEM_TYPES = ["listItem", "taskItem"] as const;

function canAdjustListIndent(editor: NonNullable<ReturnType<typeof useEditor>>, dir: "sink" | "lift") {
  const can = dir === "sink" ? editor.can().sinkListItem : editor.can().liftListItem;
  return LIST_ITEM_TYPES.some((t) => can(t));
}

function runListIndent(editor: NonNullable<ReturnType<typeof useEditor>>, dir: "sink" | "lift") {
  const run = dir === "sink" ? editor.chain().focus().sinkListItem : editor.chain().focus().liftListItem;
  for (const t of LIST_ITEM_TYPES) {
    if ((dir === "sink" ? editor.can().sinkListItem : editor.can().liftListItem)(t)) {
      run(t).run();
      return;
    }
  }
}

function headingLevel(editor: NonNullable<ReturnType<typeof useEditor>>) {
  if (editor.isActive("heading", { level: 1 })) return "1";
  if (editor.isActive("heading", { level: 2 })) return "2";
  if (editor.isActive("heading", { level: 3 })) return "3";
  return null;
}

function ColorMenu({
  label,
  colors,
  current,
  onPick,
  onClear,
  highlight
}: {
  label: string;
  colors: string[];
  current?: string;
  onPick: (color: string) => void;
  onClear: () => void;
  highlight?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="fichamento-editor__color" ref={ref}>
      <button
        type="button"
        className={`fichamento-editor__btn fichamento-editor__btn--color ${open ? "is-active" : ""}`}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`fichamento-editor__color-swatch ${highlight ? "is-highlight" : ""}`}
          style={{ background: current ?? (highlight ? "#fef08a" : "#eef2f6") }}
        />
        <span className="fichamento-editor__color-a">A</span>
      </button>
      {open ? (
        <div className="fichamento-editor__color-popover" role="menu">
          <div className="fichamento-editor__color-grid">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                className={`fichamento-editor__color-chip ${current === c ? "is-selected" : ""}`}
                style={{ background: c }}
                aria-label={c}
                onClick={() => {
                  onPick(c);
                  setOpen(false);
                }}
              />
            ))}
          </div>
          <label className="fichamento-editor__color-custom">
            Personalizado
            <input
              type="color"
              defaultValue={current ?? colors[0]}
              onChange={(e) => onPick(e.target.value)}
            />
          </label>
          <button type="button" className="fichamento-editor__color-clear" onClick={() => onClear()}>
            Remover
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ToolbarButton({
  children,
  active,
  disabled,
  onClick,
  label
}: {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`fichamento-editor__btn ${active ? "is-active" : ""}`}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function safeParseJson(raw: string) {
  try {
    return JSON.parse(raw) as object;
  } catch {
    return "";
  }
}
