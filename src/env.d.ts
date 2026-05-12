/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly WEBSITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
