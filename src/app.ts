import 'reflect-metadata';
//import { AppEventsLoader, AutoUpdaterLoader,  SingleInstanceLoader, WindowLoader } from './microframework/bootstrap/Bootstrap';
import { AppEventsLoader, AutoUpdaterLoader, SingleInstanceLoader, WindowLoader } from './microframework/bootstrap/Bootstrap';
import { MicroframeworkBootstrap } from './microframework/bootstrap/MicroframeworkBootstrap';

const framework = new MicroframeworkBootstrap({
    app: {
      name: 'my-awesome-app',
      version: '2.0.1',
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
    .use(new AutoUpdaterLoader({silent: false,checkInterval: 5000,allowPrerelease: false}))
    .bootstrap()
    .catch((e: any) => {
      console.error(e);
      process.exit(-1);
    });