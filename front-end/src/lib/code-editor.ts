import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { lineNumbers } from "@codemirror/gutter";

export type Editor = ReturnType<typeof makeCodeEditor>;

export function makeCodeEditor(elem: HTMLElement) {
  const view = new EditorView({
    parent: elem,
    state: EditorState.create({
      extensions: [lineNumbers()],
    }),
  });

  return {
    getText() {
      return view.state.doc.sliceString(0, view.state.doc.length);
    },
    setText(text: string) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: text,
        },
      });
    },
  };
}
