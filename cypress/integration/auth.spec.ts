// cypress/integration/auth.spec.ts

describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully', () => {
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=login-button]').click();

    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=user-menu]').should('exist');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-testid=email-input]').type('wrong@example.com');
    cy.get('[data-testid=password-input]').type('wrongpassword');
    cy.get('[data-testid=login-button]').click();

    cy.get('[data-testid=error-message]')
      .should('exist')
      .and('contain', 'Invalid credentials');
  });
});

// cypress/integration/dashboard.spec.ts

describe('Dashboard', () => {
  beforeEach(() => {
    cy.login(); // Custom command for authentication
    cy.visit('/dashboard');
  });

  it('should display dashboard metrics', () => {
    cy.get('[data-testid=active-users]').should('exist');
    cy.get('[data-testid=storage-usage]').should('exist');
    cy.get('[data-testid=api-calls]').should('exist');
  });

  it('should handle time range changes', () => {
    cy.get('[data-testid=time-range-selector]').click();
    cy.get('[data-testid=time-range-30d]').click();
    
    cy.get('[data-testid=loading-indicator]').should('exist');
    cy.get('[data-testid=loading-indicator]').should('not.exist');
    
    cy.get('[data-testid=metrics-chart]')
      .should('exist')
      .and('contain', 'Last 30 Days');
  });
});
