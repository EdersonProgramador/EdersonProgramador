import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEffect, useRef, useState, type ReactNode } from "react";
import "../../styles/fichamento-editor.css";

export type EditorSnapshot = { docJson: string; docHtml: string };

type NotionEditorProps = {
  contentJson?: string | null;
  contentHtml?: string | null;
  placeholder?: string;
  onSave: (snapshot: EditorSnapshot) => void | Promise<void>;
  editorKey?: string;
};

export function NotionEditor({ contentJson, contentHtml, placeholder, onSave, editorKey }: NotionEditorProps) {
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<number | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
        Underline,
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
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="fichamento-editor">
      <div className="fichamento-editor__toolbar fichamento-no-print">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="Negrito"
        >
          B
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="Itálico"
        >
          I
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          label="Sublinhado"
        >
          U
        </ToolbarButton>
        <span className="fichamento-editor__sep" />
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="Título"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="Lista"
        >
          •
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Lista numerada"
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="Citação"
        >
          “
        </ToolbarButton>
        <span className="fichamento-editor__status">
          {saveState === "saving" ? "Salvando…" : saveState === "saved" ? "Salvo" : ""}
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  children,
  active,
  onClick,
  label
}: {
  children: ReactNode;
  active?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button type="button" className={`fichamento-editor__btn ${active ? "is-active" : ""}`} aria-label={label} onClick={onClick}>
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
