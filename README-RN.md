# NEETFORGE – React Native

This is the **React Native** (Expo) version of the NEETFORGE web app. It keeps the same functionality and features as the React web app; only the UI layer is implemented with React Native components.

## Folder note

The project lives in **`neetforge-rn`** (not a folder named `react-native`) because the name `react-native` conflicts with the npm package. You can rename the folder to `react-native` on disk if you prefer.

## Run the app

```bash
cd neetforge-rn
npm install
npm start
```

Then open in Expo Go (scan QR) or run `npm run ios` / `npm run android`.

## Backend

Same API as the web app: **`http://localhost:5002/api/v1`**. Update `src/lib/api.ts` if your backend URL is different.

## What’s included

- **Auth**: Login, Signup, Demo login, Logout (AsyncStorage for token)
- **Navigation**: Splash → Login/Signup → Onboarding → Dashboard; bottom nav (Dashboard, Tests, Quiz, Social, Profile)
- **Contexts**: Auth, Language, Revision (same logic as web; Revision uses AsyncStorage)
- **Redux**: Same store and `neuronz` slice
- **API**: Same `apiService` and axios instance (token from storage; 401 clears token)
- **Screens**: Splash, Login, Signup, Onboarding, Dashboard, Profile implemented; other routes use a placeholder screen (same flow as web, UI to be filled in)

## Converting more screens

To match the web app 1:1:

1. Add a new screen in `src/screens/` (e.g. `Revision.tsx`).
2. Replace the corresponding `Placeholder` in `src/navigation/RootNavigator.tsx` with your screen.
3. Use `navigate('ScreenName', params)` from `src/navigation/rootRef.ts` instead of `useNavigate()`.
4. Use React Native components (`View`, `Text`, `Pressable`, `TextInput`, `ScrollView`) and `StyleSheet` (or a theme from `src/constants/theme.ts`).

Functionality (API calls, contexts, Redux) is unchanged; only the UI layer differs from the web app.
