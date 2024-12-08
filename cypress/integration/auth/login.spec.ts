// cypress/integration/auth/login.spec.ts

describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('[data-testid="login-form"]').should('exist');
    cy.get('[data-testid="email-input"]').should('exist');
    cy.get('[data-testid="password-input"]').should('exist');
    cy.get('[data-testid="login-button"]').should('exist');
  });

  it('should show validation errors', () => {
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="email-error"]').should('be.visible');
    cy.get('[data-testid="password-error"]').should('be.visible');
  });

  it('should login successfully', () => {
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});

// cypress/integration/dashboard/navigation.spec.ts

describe('Dashboard Navigation', () => {
  beforeEach(() => {
    cy.login(); // Custom command for authentication
    cy.visit('/dashboard');
  });

  it('should display sidebar navigation', () => {
    cy.get('[data-testid="sidebar"]').should('be.visible');
    cy.get('[data-testid="nav-dashboard"]').should('be.visible');
    cy.get('[data-testid="nav-users"]').should('be.visible');
    cy.get('[data-testid="nav-settings"]').should('be.visible');
  });

  it('should navigate between pages', () => {
    cy.get('[data-testid="nav-users"]').click();
    cy.url().should('include', '/users');
    
    cy.get('[data-testid="nav-settings"]').click();
    cy.url().should('include', '/settings');
  });
});

// cypress/integration/plugins/plugin-installation.spec.ts

describe('Plugin Installation', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/plugins');
  });

  it('should display available plugins', () => {
    cy.get('[data-testid="plugin-list"]').should('exist');
    cy.get('[data-testid="plugin-card"]').should('have.length.at.least', 1);
  });

  it('should install a plugin', () => {
    cy.get('[data-testid="plugin-card"]').first().within(() => {
      cy.get('[data-testid="install-button"]').click();
    });
    
    cy.get('[data-testid="installation-success"]').should('be.visible');
  });
});
