describe('Clinic Registration', () => {
  beforeEach(() => {
    cy.request('POST', '/api/test/cleanup', {
      email: 'clinic@example.com',
      userType: 'clinic',
    });
  });

  it('registers a clinic and redirects to login', () => {
    cy.visit('http://localhost:3000/clinic_registration');

    cy.get('input[name="name"]').type('Test Clinic');
    cy.get('input[name="address"]').type('123 Main St');
    cy.get('input[name="latitude"]').type('24.4667');
    cy.get('input[name="longitude"]').type('54.3667');
    cy.get('input[name="email"]').type('clinic@example.com');
    cy.get('input[name="phone"]').type('+971501234567');
    cy.get('input[name="licenseNumber"]').type('CLINIC123');
    cy.get('input[name="password"]').type('securePass123');
    cy.get('input[name="confirmPassword"]').type('securePass123');

    cy.get('button[type="submit"]').click();

    // ✅ Instead of checking for disappearing success message, check where we end up
    cy.url().should('include', '/login');
  });
});
