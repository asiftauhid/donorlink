// cypress/e2e/clinic_dashboard.cy.ts

describe('Clinic Dashboard', () => {
  beforeEach(() => {
    // Clean up existing clinic
    cy.request('POST', 'http://localhost:3000/api/test/cleanup', {
      email: 'clinic_request@example.com',
      userType: 'clinic',
    });

    // Register clinic
    cy.visit('/clinic_registration');
    cy.get('input[name="name"]').type('Request Test Clinic');
    cy.get('input[name="address"]').type('Downtown Ave');
    cy.get('input[name="latitude"]').type('24.4667');
    cy.get('input[name="longitude"]').type('54.3667');
    cy.get('input[name="email"]').type('clinic_request@example.com');
    cy.get('input[name="phone"]').type('+971501234000');
    cy.get('input[name="licenseNumber"]').type('REQCLINIC001');
    cy.get('input[name="password"]').type('securePass123');
    cy.get('input[name="confirmPassword"]').type('securePass123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');

    // Log in through UI (ensures cookies are saved)
    cy.get('select').select('Clinic');
    cy.get('input[name="email"]').type('clinic_request@example.com');
    cy.get('input[name="password"]').type('securePass123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/clinic');
  });

  it('loads clinic dashboard and shows all tabs', () => {
    cy.contains('Clinic Dashboard');
    cy.contains('Blood Requests');
    cy.contains('Requested Donors');
    cy.contains('Donation History');
  });
});
