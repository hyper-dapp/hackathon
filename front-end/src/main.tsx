import "./global.css";

import m from "mithril";
import { EditorIde } from "./routes/editor-ide";
import { FlowPage } from "./routes/flow-page";

const NotFound = {
  view() {
    return m('.w-screen.h-screen.flex.items-center.justify-center',
      m('h1', 'Page not found')
    )
  }
}

// Remove !# and treat full url as routes
m.route.prefix = ''

// TODO: Consider code splitting
//       https://mithril.js.org/route.html#code-splitting
m.route(document.querySelector<HTMLDivElement>("#app")!, '/404', {
  '/': EditorIde,
  '/flow/:cid': FlowPage,

  '/404': NotFound,
})
