// index.ts
// Arquivo de entrada para o aplicativo Expo
// Ele registra o componente raiz do aplicativo, que é definido em App.tsx, garantindo que o ambiente esteja configurado corretamente para rodar tanto no Expo Go quanto em builds nativas.
//===================================================================================================================

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
