import m from 'mithril'
import debounce from 'lodash/debounce'
import {cc, uniques} from 'mithril-cc'
import { unescapeString } from 'hyperdapp'

import { Flow } from '../lib/flow'
import { WalletConnector } from '../lib/wallet-connector'
import { WalletButton } from './wallet-button'
import { btnClass } from '../lib/component-classes'

type PromptType =
  | 'col'
  | 'row'
  | 'text'
  | 'debug'
  | 'input'
  | 'button'

type Prompt = [PromptType, ...PromptArg[]]
type PromptArg = string | Prompt | object

type ButtonAttrs = {
  enabled?: boolean
}


type Attrs = {
  flow: Flow | null
  wallet: WalletConnector
  className?: string
}
export const FlowUI = cc<Attrs>(function($attrs) {
  let promptSnapshots: Prompt[] = []

  const flow = $attrs().flow

  // Listen to wallet 'ready' state
  //
  $attrs.map(a => a.wallet.state.type).map(uniques()).map(async () => {
    const state = $attrs().wallet.state

    if (flow && state.type === 'ready') {
      // TODO: Use current block number
      await flow.init(state.address, 10, {
        signer: state.signer,
        provider: state.provider,
      })
      promptSnapshots.push(await flow.getPrompts())
      console.log("PRompts", promptSnapshots[promptSnapshots.length-1])
      m.redraw()
    }
  })

  return ({ wallet, className }) => {

    if (!flow) {
      return (
        <div class={`${className} p-4 bg-gray-100 dark:bg-gray-700`}>
          Loading flow code...
        </div>
      )
    }

    if (wallet.state.type !== 'ready') {
      return (
        <div class={`${className} p-4 bg-gray-100 dark:bg-gray-700`}>
          {m(WalletButton, { wallet })}
        </div>
      )
    }

    return (
      <div class={`${className} p-4 bg-gray-100 dark:bg-gray-700 divide-y`}>
        {promptSnapshots.map((prompts, i) =>
          <div class="py-2 space-y-4 flex flex-col items-center dark:border-gray-600">
            {renderPrompts({
              flow,
              prompts,
              isLatest: i === promptSnapshots.length - 1,
              className: '',
              async executeButtonAction(action) {
                console.log("ACTION", action)
                await flow.execute(action)
                promptSnapshots.push(await flow.getPrompts())
                m.redraw()
              }
            })}
          </div>
        )}
      </div>
    )
  }
})


function renderPrompts(params: {
  flow: Flow
  prompts: PromptArg[]
  isLatest: boolean
  className: string
  executeButtonAction(action: any[]): void
}) {
  const filtered = params.prompts.filter((p): p is Prompt => {
    const keep = typeof p !== 'string'
    if (!keep) {
      console.warn(`[prompt/render] Ignoring prompt string:`, p)
    }
    return keep
  })

  const { className } = params

  return filtered.map(([type, ...args]) => {
    if (type === 'row') {
      return <div class={`flex space-x-4 ${className}`}>
        {renderPrompts({ ...params, prompts: args }).map(prompt =>
          <div class="flex flex-1 items-center justify-center">{prompt}</div>
        )}
      </div>
    }
    else if (type === 'col') {
      return <div class={`flex flex-col space-y-2 ${className}`}>
        {renderPrompts({ ...params, prompts: args }).map(prompt =>
          <div class="flex flex-1 items-center justify-center">{prompt}</div>
        )}
      </div>
    }
    else if (type === 'text') {
      return <div class={`prompt__text ${className}`}>
        {unescapeString(args.join(''))}
      </div>
    }
    else if (type === 'button') {
      const [buttonText, attrs, callback] = args as [string, ButtonAttrs, Prompt[]]

      return (
        <button
          class={`${btnClass()} ${className}`}
          onclick={() => params.executeButtonAction(callback as any)}
          disabled={!params.isLatest || attrs.enabled === false}
        >
          {unescapeString(buttonText)}
        </button>
      )
    }
    else if (type === 'input' && args[0] === 'address') {
      const [, name] = args

      return (
        <input
          type="text"
          placeholder="0x..."
        />
      )
    }
    else if (type === 'debug') {
      console.log(`[prompt/debug]`, ...args)
      return null
    }
    else {
      console.log(`[prompt/unrecognized-type]`, type, args)
      return <div class={className}>Unrecognized type: {type}</div>
    }
  })
}
