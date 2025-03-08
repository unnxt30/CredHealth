import { ScreenContent } from 'components/ScreenContent';
import { StatusBar } from 'expo-status-bar';
import { Text, View, SafeAreaView } from 'react-native';
import Home from './components/Home';

import './global.css';
export default function App() {
  return (
    <>
      {/* <ScreenContent title="HealthCred" path="App.tsx" />
      <StatusBar style="auto" /> */}
      <Home />
    </>
  );
}
