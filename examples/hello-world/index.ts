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

// examples/hello-world/index.ts

import { Plugin, PluginContext } from '../../core/types/plugin.types';

export class HelloWorldPlugin implements Plugin {
  private context: PluginContext;

  constructor(context: PluginContext) {
    this.context = context;
  }

  async initialize(): Promise<void> {
    // Register UI components
    this.context.ui.registerComponent('HelloWorld', this.renderHelloWorld);
    
    // Register event handlers
    this.context.events.on('app:started', this.handleAppStart);
  }

  private renderHelloWorld = () => {
    return {
      type: 'div',
      props: {
        children: 'Hello, World!',
        style: {
          padding: '20px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          margin: '10px'
        }
      }
    };
  };

  private handleAppStart = async () => {
    this.context.logger.info('Hello World plugin started!');
    await this.saveInitialData();
  };

  private async saveInitialData(): Promise<void> {
    const data = {
      initialized: Date.now(),
      message: 'Hello from the example plugin!'
    };

    await this.context.storage.set('hello-world-data', data);
  }

  async start(): Promise<void> {
    this.context.logger.info('Hello World plugin starting...');
  }

  async stop(): Promise<void> {
    this.context.logger.info('Hello World plugin stopping...');
  }
}

// examples/hello-world/README.md

# Hello World Plugin Example

This is a basic example plugin demonstrating the core functionality of the plugin system.

## Features

- Basic UI component registration
- Event handling
- Data storage
- Logging

## Usage

