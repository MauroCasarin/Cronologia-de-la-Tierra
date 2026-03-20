/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KV_REST_API_URL?: string
  readonly VITE_KV_REST_API_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
