import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './src/store';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { RevisionProvider } from './src/contexts/RevisionContext';
import RootNavigator from './src/navigation/RootNavigator';

const queryClient = new QueryClient();

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <RevisionProvider>
              <RootNavigator />
              <StatusBar style="auto" />
            </RevisionProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}
