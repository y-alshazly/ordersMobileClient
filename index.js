import { AppRegistry } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { App } from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => () => (
  <PaperProvider>
    <App />
  </PaperProvider>
));
