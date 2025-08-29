import 'reflect-metadata';
//import { AppEventsLoader, AutoUpdaterLoader,  SingleInstanceLoader, WindowLoader } from './microframework/bootstrap/Bootstrap';
import { AppEventsLoader, SingleInstanceLoader, WindowLoader } from './microframework/bootstrap/Bootstrap';
import { MicroframeworkBootstrap } from './microframework/bootstrap/MicroframeworkBootstrap';
import { GitHubAutoUpdaterLoader } from './microframework/loaders/GitHubAutoUpdaterLoader';
const packageJson = require('../../package.json');

const framework = new MicroframeworkBootstrap({
    app: {
      name: packageJson.name,
      version: packageJson.version,
      protocol: 'my-awesome-app'
    },
    window: {
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 700
    },
    showBootstrapTime: true
  });
  
  framework
    .use(new SingleInstanceLoader())
    .use(new WindowLoader({ theme: 'dark',devTools: true, webSecurity: false}))
    .use(new AppEventsLoader())
    .use(new GitHubAutoUpdaterLoader({silent: false,checkInterval: 5000,allowPrerelease: false}))
    .bootstrap()
    .catch((e: any) => {
      console.error(e);
      process.exit(-1);
    });