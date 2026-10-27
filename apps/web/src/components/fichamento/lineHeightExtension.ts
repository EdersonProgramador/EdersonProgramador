import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

const blockTypes = ["paragraph", "heading"];

export const LineHeight = Extension.create({
  name: "lineHeight",
  addOptions() {
    return { types: blockTypes as string[] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ chain, state }) => {
          const type = state.selection.$from.parent.type.name;
          if (!blockTypes.includes(type)) return false;
          return chain().updateAttributes(type, { lineHeight }).run();
        },
      unsetLineHeight:
        () =>
        ({ chain, state }) => {
          const type = state.selection.$from.parent.type.name;
          if (!blockTypes.includes(type)) return false;
          return chain().updateAttributes(type, { lineHeight: null }).run();
        }
    };
  }
});
