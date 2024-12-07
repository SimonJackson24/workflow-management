// examples/hello-world/index.ts

import { PluginSDK } from '@core/sdk';

export default class HelloWorldPlugin {
  private sdk: PluginSDK;

  constructor(sdk: PluginSDK) {
    this.sdk = sdk;
  }

  async initialize() {
    // Register UI components
    this.sdk.getAPI().ui.registerComponent({
      name: 'HelloWorld',
      component: () => ({
        type: 'div',
        props: {
          children: 'Hello, World!'
        }
      })
    });

    // Subscribe to events
    this.sdk.getAPI().events.on('app:started', this.handleAppStart);
  }

  private handleAppStart = async () => {
    this.sdk.getAPI().logger.info('Hello World plugin started!');
    
    // Show notification
    this.sdk.getAPI().ui.showNotification('Hello World plugin is running!');
  }

  async start() {
    // Plugin start logic
  }

  async stop() {
    // Plugin cleanup logic
  }
}
