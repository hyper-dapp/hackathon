import m from 'mithril'
import {cc} from 'mithril-cc'
import { makeCodeEditor } from '../lib/code-editor'
import { UploadModal } from './ipfs-upload-modal'
import './cortex-editor.css';

import { plainText as GUESTBOOK_EXAMPLE } from '../../example-flows/guestbook.pl'

type Attrs = {
  onUpdate(code: string): void
  className?: string
}

const btnClass = `
  inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white
  bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:hover:bg-gray-600
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
`
export const CortexEditor = cc<Attrs>(function($attrs) {
  let editor: any
  let showIpfs: boolean = false;

  this.oncreate(({ dom }) => {
    editor = makeCodeEditor(dom.querySelector('.code-editor-container'))
    editor.setText(GUESTBOOK_EXAMPLE)
    $attrs().onUpdate(editor.getText())
  })

  const executePublish = () => {
    showIpfs = true;
  }

  const showModal = () => {
    return showIpfs ? m(
      UploadModal,{
        className: null,
        async onDismiss() {
          showIpfs = false;
        },
      }) : null;
  }

  return ({ className }) => {
    return (
      <div class={`${className} flex`}>
        { showModal() }
        <button onclick={executePublish} class={`publish-button ${btnClass}`}>Publish</button>
        <div class="flex-1 flex flex-col code-editor-container"></div>
      </div>
    );
  }
})
