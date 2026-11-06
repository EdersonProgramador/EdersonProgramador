import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

export type CodeStudioMenuAction = {
  id: string;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onClick: () => void;
};

export type CodeStudioMenu = {
  id: string;
  label: string;
  items: CodeStudioMenuAction[];
};

type CodeStudioMenuBarProps = {
  menus: CodeStudioMenu[];
};

export function CodeStudioMenuBar({ menus }: CodeStudioMenuBarProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={barRef} className="dev-code-studio__menubar" role="menubar" aria-label="Menu principal">
      {menus.map((menu) => (
        <div key={menu.id} className="dev-code-studio__menu-root">
          <button
            type="button"
            className={`dev-code-studio__menu-trigger${openId === menu.id ? " is-open" : ""}`}
            aria-expanded={openId === menu.id}
            aria-haspopup="menu"
            onClick={() => setOpenId((id) => (id === menu.id ? null : menu.id))}
            onMouseEnter={() => {
              if (openId) setOpenId(menu.id);
            }}
          >
            {menu.label}
          </button>
          {openId === menu.id ? (
            <div className="dev-code-studio__menu-dropdown" role="menu">
              {menu.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className="dev-code-studio__menu-item"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpenId(null);
                    item.onClick();
                  }}
                >
                  <span>{item.label}</span>
                  {item.shortcut ? <kbd>{item.shortcut}</kbd> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Ícone chevron para pastas no explorer */
export function FolderChevron({ open }: { open: boolean }) {
  return (
    <ChevronRight
      className={`dev-code-studio__chevron h-3.5 w-3.5 shrink-0${open ? " is-open" : ""}`}
      aria-hidden
    />
  );
}
