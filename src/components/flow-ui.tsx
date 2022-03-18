import m from 'mithril'
import debounce from 'lodash/debounce'
import {cc, uniques} from 'mithril-cc'
import { unescapeString } from 'hyperdapp'

import { Flow } from '../lib/flow'
import { WalletConnector } from '../lib/wallet-connector'
import { WalletButton } from './wallet-button'
import { btnClass } from '../lib/component-classes'
import { Prompt, PromptArg } from '../lib/prompt-types'
import { renderLog, LogType } from './ui/log'

type ButtonAttrs = {
  enabled?: boolean
}


type Attrs = {
  flow: Flow | null
  wallet: WalletConnector
  className?: string
}
export const FlowUI = cc<Attrs>(function($attrs) {
  const flow = $attrs().flow
  const promptHistory = makePromptHistory()

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
      await promptHistory.init(flow)
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
        {promptHistory.all().map((prompts, i) =>
          <div class="py-6 space-y-4 flex flex-col items-center dark:border-gray-600">
            {renderPrompts({
              flow,
              prompts,
              isLatest: i === promptHistory.length - 1,
              className: '',
              executeButtonAction: promptHistory.execute,
              onInputChange: promptHistory.handleInput,
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
  onInputChange(): void
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
    else if (type === 'log') {
      let [logTypeInput, logTerm] = args as [string, Prompt]
      let logType: LogType

      if (['notice', 'error', 'success', 'warning'].includes(logTypeInput)) {
        logType = logTypeInput
      }
      else {
        console.warn(`[prompt/log/unrecognized-type]`, logTypeInput, logTerm)
        logType = 'notice'
      }

      return renderLog(
        logType,
        renderPrompts({ ...params, prompts: [logTerm] })
      )
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
      0x376d38fd8c0b54abf937b2099969670f64918e1e

      return (
        <input
          type="text"
          disabled={!params.isLatest}
          placeholder="0x..."
          oninput={async (e: any) => {
            const accepted = await params.flow.handleInput(name, e.target.value)
            if (accepted) {
              params.onInputChange()
            }
          }}
        />
      )
    }
    else if (type === 'debug') {
      console.log(`[prompt/debug]`, ...args)
      return null
    }
    else {
      console.warn(`[prompt/unrecognized-type]`, type, args)
      return <div class={className}>Unrecognized type: {type}</div>
    }
  })
}


function makePromptHistory() {
  let flow: Flow
  let history: Prompt[][] = []

  const api = {
    all() {
      return history
    },
    get length() {
      return history.length
    },
    log() {
      console.log("prompts>", history[history.length-1])
    },
    async init(_flow: Flow) {
      flow = _flow
      history.push(await flow.getPrompts())
      api.log()
    },
    async execute(action: Prompt[]) {
      console.log("execute>", action)
      const { effects } = await flow.execute(action)
      console.log("effects>", effects)

      let effectPrompts: Prompt[] = []
      for (let [effectType, ...effectArgs] of effects) {
        if (effectType === 'log') {
          effectPrompts.push([effectType, ...effectArgs])
        }
        else {
          console.log(`[effect/unrecognized-type]`, effectType, effectArgs)
        }
      }

      let newPrompts = await flow.getPrompts()

      if (effectPrompts.length) {
        console.log("PUSHING", effectPrompts)
        newPrompts = effectPrompts.concat(newPrompts)
      }

      history.push(newPrompts)
      api.log()
      m.redraw()
    },
    async handleInput() {
      // Grab new prompts first so we can change array atomically
      const newPrompts = await flow.getPrompts()
      history.pop()
      history.push(newPrompts)
      api.log()
      m.redraw()
    }
  }

  return api
}
