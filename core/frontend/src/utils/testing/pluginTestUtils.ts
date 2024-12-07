// core/frontend/src/utils/testing/pluginTestUtils.ts

import { Plugin, PluginConfig } from '../../types/plugin.types';

export class PluginTestUtils {
  static createMockPlugin(overrides?: Partial<Plugin>): Plugin {
    return {
      id: `plugin-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'Test plugin description',
      author: 'Test Author',
      status: 'active',
      enabled: true,
      config: {},
      ...overrides
    };
  }

  static async simulatePluginInstallation(plugin: Plugin): Promise<void> {
    // Simulate installation process
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  static validatePluginConfig(config: PluginConfig, schema: any): boolean {
    // Implement config validation logic
    return true;
  }

  static async mockPluginAPI(pluginId: string): Promise<any> {
    // Create mock plugin API endpoints
    return {
      getData: async () => ({ success: true }),
      performAction: async () => ({ success: true })
    };
  }
}

// core/frontend/src/utils/testing/PluginTestEnvironment.tsx

import React from 'react';
import { render } from '@testing-library/react';
import { PluginProvider } from '../../contexts/PluginContext';

export const renderWithPluginContext = (
  ui: React.ReactElement,
  { plugins = [], ...options } = {}
) => {
  return render(
    <PluginProvider initialPlugins={plugins}>
      {ui}
    </PluginProvider>,
    options
  );
};

// Example test:
// core/frontend/src/tests/plugins/PluginInstaller.test.tsx

import { renderWithPluginContext } from '../../utils/testing/PluginTestEnvironment';
import { PluginTestUtils } from '../../utils/testing/pluginTestUtils';
import { PluginInstaller } from '../../components/plugins/PluginInstaller';

describe('PluginInstaller', () => {
  it('should install plugin successfully', async () => {
    const mockPlugin = PluginTestUtils.createMockPlugin();
    const { getByText, findByText } = renderWithPluginContext(
      <PluginInstaller pluginId={mockPlugin.id} />
    );

    // Test installation flow
    await PluginTestUtils.simulatePluginInstallation(mockPlugin);
    expect(await findByText('Installation Complete')).toBeInTheDocument();
  });
});
