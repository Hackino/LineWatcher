// reflect-metadata MUST be imported before any @injectable class is loaded (TSyringe).
import 'reflect-metadata';
import { registerRootComponent } from 'expo';

import App from './src/app/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App).
registerRootComponent(App);
