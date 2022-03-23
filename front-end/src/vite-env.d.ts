/// <reference types="vite/client" />

interface Window {
  ethereum: any;
}

declare module "*.pl" {
  export const plainText: string;
}

declare module "@walletconnect/web3-provider/dist/umd/index.min.js";
