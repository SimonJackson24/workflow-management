// core/sdk/examples/basic-plugin/index.ts

import { PluginSDK } from '../../PluginSDK';

export class BasicPlugin {
  private sdk: PluginSDK;

  constructor(sdk: PluginSDK) {
    this.sdk = sdk;
  }

  async initialize() {
    // Register UI components
    this.sdk.getAPI().ui.registerComponent({
      name: 'BasicWidget',
      component: this.createBasicWidget()
    });

    // Subscribe to events
    this.sdk.getAPI().events.on('app:started', this.handleAppStart);
  }

  private createBasicWidget() {
    return {
      render: () => ({
        type: 'div',
        children: 'Basic Plugin Widget'
      })
    };
  }

  private handleAppStart = async () => {
    this.sdk.getAPI().logger.info('Basic plugin started');
  }
}

// core/sdk/examples/advanced-plugin/index.ts

export class AdvancedPlugin {
  private sdk: PluginSDK;

  constructor(sdk: PluginSDK) {
    this.sdk = sdk;
  }

  async initialize() {
    await this.setupDatabase();
    await this.registerComponents();
    await this.setupEventHandlers();
  }

  private async setupDatabase() {
    // Database initialization
  }

  private async registerComponents() {
    // Register multiple UI components
  }

  private async setupEventHandlers() {
    // Setup complex event handling
  }
}

// core/sdk/examples/integration-plugin/index.ts

export class IntegrationPlugin {
  private sdk: PluginSDK;

  constructor(sdk: PluginSDK) {
    this.sdk = sdk;
  }

  async initialize() {
    // Setup third-party integration
  }

  async handleWebhook(payload: any) {
    // Handle webhook from third-party service
  }
}
