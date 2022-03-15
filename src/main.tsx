import './global.css'

import m from 'mithril'
import { cc } from 'mithril-cc'

import { makeWalletConnector } from './lib/wallet-connector'
import { FlowUI } from './components/flow-ui'
import { CortexEditor } from './components/cortex-editor'
import { Flow, makeFlow } from './lib/flow'

const App = cc(function() {
  let flow: Flow | null = null
  const wallet = makeWalletConnector()

  return () => {
    const state = wallet.state
    console.log('state', state)

    return <div class="flex-1 flex">
      {m(CortexEditor, {
        className: "w-[50%] overflow-x-auto",
        async onUpdate(code) {
          flow = await makeFlow(code)
          m.redraw()
        },
      })}
      {[
        // In an array to enable key
        m(FlowUI, {
          key: flow?.id || -1,
          flow,
          wallet,
          className: "w-[50%]"
        })
      ]}
    </div>
  }
})

m.mount(document.querySelector<HTMLDivElement>('#app')!, App)