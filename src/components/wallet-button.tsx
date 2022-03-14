import m from 'mithril'
import {ccs} from 'mithril-cc'
import { WalletConnector } from '../lib/wallet-connector'

type Attrs = {
  wallet: WalletConnector
}
export const WalletButton = ccs<Attrs>(({ wallet }) => {
  const state = wallet.state
  return (
    <h1 class="text-3xl font-bold underline">
      {state.type === 'loading' &&
        'Loading'
      }
      {state.type === 'init' &&
        <div class="p-4">
          <button onclick={() => wallet.connectViaWalletConnect()}>
            Wallet Connect
          </button>
          <button onclick={() => wallet.connectViaMetamask()}>
            Metamask
          </button>
        </div>
      }
      {state.type === 'ready' &&
        `Ready (${wallet.type})`
      }
      {state.type === 'error' &&
        `Error ${state.error.message}`
      }
    </h1>
  )
})
