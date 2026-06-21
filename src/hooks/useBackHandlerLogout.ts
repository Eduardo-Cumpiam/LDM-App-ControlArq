// useBackHandlerLogout.ts
// Arquivo de hook para lidar com o comportamento de voltar físico do Android
// O comportamento padrão do Android é que o usuário pode voltar para a tela anterior apenas se o botão de voltar estiver no topo da tela.
//========================================================================================================================

import { useCallback } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export function useBackHandlerLogout() {
  const { logout } = useAuth();
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {

        if (navigation && navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }

        Alert.alert(
          "Sair do App",
          "Deseja realmente sair do aplicativo?",
          [
            { text: "Cancelar", style: "cancel" },
            { 
              text: "Sair", 
              style: "destructive",
              onPress: () => {
                logout();
              }
            }
          ]
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      return () => backHandler.remove();
    }, [logout, navigation])
  );
}
