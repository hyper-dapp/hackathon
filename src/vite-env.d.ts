/// <reference types="vite/client" />

interface Window {
  ethereum: any;
}

declare module "*.pl" {
  export const plainText: string;
}
