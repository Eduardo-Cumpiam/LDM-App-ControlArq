// env.d.ts
// Arquivo de declaração para variáveis de ambiente do Firebase
// Modelo de declaração para o módulo "@env" utilizado para acessar as variáveis de ambiente definidas no arquivo .env, garantindo que o TypeScript reconheça os tipos dessas variáveis e permita seu uso seguro em todo o aplicativo.
//========================================================================================================================

declare module "@env" {
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_STORAGE_BUCKET: string;
  export const FIREBASE_MESSAGING_SENDER_ID: string;
  export const FIREBASE_APP_ID: string;
  export const FIREBASE_MEASUREMENT_ID: string;
}
