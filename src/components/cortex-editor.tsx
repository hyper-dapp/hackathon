import m from 'mithril'
import {cc} from 'mithril-cc'
import { Editor, makeCodeEditor } from '../lib/code-editor'
import { UploadModal } from './ipfs-upload-modal'
import './cortex-editor.css';

import { plainText as GUESTBOOK_EXAMPLE } from '../../example-flows/guestbook.pl'
import { btnClass } from '../lib/component-classes';

type Attrs = {
  onUpdate(code: string): void
  className?: string
}

export const CortexEditor = cc<Attrs>(function($attrs) {
  let editor: Editor
  let showIpfs: boolean = false;

  this.oncreate(({ dom }) => {
    editor = makeCodeEditor(dom.querySelector('.code-editor-container')!)
    editor.setText(GUESTBOOK_EXAMPLE)
    $attrs().onUpdate(editor.getText())
  })

  return ({ className }) => {
    return (
      <div class={`${className} flex`}>
        {showIpfs &&
          m(UploadModal, {
            cortexCode: editor.getText(),
            onDismiss() {
              showIpfs = false;
            },
          })
        }
        <button onclick={() => showIpfs = true} class={`publish-button ${btnClass()}`}>Publish</button>
        <div class="flex-1 flex flex-col code-editor-container"></div>
      </div>
    );
  }
})
