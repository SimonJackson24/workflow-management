// cypress/integration/workflow.spec.ts

describe('User Workflow', () => {
  beforeEach(() => {
    cy.login();
  });

  it('completes a full workflow', () => {
    // Dashboard navigation
    cy.visit('/dashboard');
    cy.get('[data-testid=dashboard-metrics]').should('be.visible');

    // Create new item
    cy.get('[data-testid=create-button]').click();
    cy.get('[data-testid=item-name-input]').type('Test Item');
    cy.get('[data-testid=save-button]').click();

    // Verify creation
    cy.get('[data-testid=items-list]')
      .should('contain', 'Test Item');

    // Edit item
    cy.get('[data-testid=edit-button]').first().click();
    cy.get('[data-testid=item-name-input]')
      .clear()
      .type('Updated Item');
    cy.get('[data-testid=save-button]').click();

    // Verify update
    cy.get('[data-testid=items-list]')
      .should('contain', 'Updated Item');

    // Delete item
    cy.get('[data-testid=delete-button]').first().click();
    cy.get('[data-testid=confirm-delete]').click();

    // Verify deletion
    cy.get('[data-testid=items-list]')
      .should('not.contain', 'Updated Item');
  });
});

// cypress/integration/settings.spec.ts

describe('Settings Management', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings');
  });

  it('updates organization settings', () => {
    cy.get('[data-testid=org-name-input]')
      .clear()
      .type('New Organization Name');

    cy.get('[data-testid=save-settings]').click();

    cy.get('[data-testid=success-message]')
      .should('be.visible')
      .and('contain', 'Settings updated successfully');
  });

  it('manages integrations', () => {
    cy.get('[data-testid=integrations-tab]').click();
    cy.get('[data-testid=add-integration]').click();

    cy.get('[data-testid=integration-type]').select('Slack');
    cy.get('[data-testid=webhook-url]').type('https://slack.webhook.com');
    cy.get('[data-testid=save-integration]').click();

    cy.get('[data-testid=integration-list]')
      .should('contain', 'Slack');
  });
});

// cypress/integration/analytics.spec.ts

describe('Analytics Dashboard', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/analytics');
  });

  it('displays correct metrics', () => {
    cy.get('[data-testid=metrics-cards]').within(() => {
      cy.get('[data-testid=active-users]').should('exist');
      cy.get('[data-testid=total-revenue]').should('exist');
      cy.get('[data-testid=conversion-rate]').should('exist');
    });
  });

  it('handles date range changes', () => {
    cy.get('[data-testid=date-range]').click();
    cy.get('[data-testid=custom-range]').click();

    cy.get('[data-testid=start-date]').type('2023-01-01');
    cy.get('[data-testid=end-date]').type('2023-12-31');
    cy.get('[data-testid=apply-range]').click();

    cy.get('[data-testid=loading-indicator]').should('exist');
    cy.get('[data-testid=loading-indicator]').should('not.exist');

    cy.get('[data-testid=metrics-chart]')
      .should('contain', '2023');
  });
});
