import m from 'mithril'
import {cc} from 'mithril-cc'
import { makeCodeEditor } from '../lib/code-editor'

import { plainText as GUESTBOOK_EXAMPLE } from '../../example-flows/guestbook.pl'

type Attrs = {
  onUpdate(code: string): void
  className?: string
}
export const CortexEditor = cc<Attrs>(function($attrs) {
  let editor: any

  this.oncreate(({ dom }) => {
    editor = makeCodeEditor(dom.querySelector('.code-editor-container'))
    editor.setText(GUESTBOOK_EXAMPLE)
    $attrs().onUpdate(editor.getText())
  })

  return ({ className }) => {
    return (
      <div class={`${className} flex`}>
        <div class="flex-1 flex flex-col code-editor-container"></div>
      </div>
    )
  }
})
