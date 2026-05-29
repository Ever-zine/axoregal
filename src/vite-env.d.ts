/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_MATCH_WINDOW_START: string
  readonly VITE_MATCH_WINDOW_END: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
