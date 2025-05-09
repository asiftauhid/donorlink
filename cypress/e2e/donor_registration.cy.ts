describe('Donor Registration', () => {
    beforeEach(() => {
      cy.request('POST', '/api/test/cleanup', {
        email: 'donor@example.com',
        userType: 'donor',
      });
    });
  
    it('completes eligibility quiz and registers donor successfully', () => {
      cy.visit('/donor_registration');
  
      // Fill out quiz
      cy.get('input[type="radio"][value="17to65"]').click();          // Age
      cy.get('input[type="radio"][value="over60kg"]').click();        // Weight
      cy.get('input[type="radio"][value="never"]').click();           // Last donation
      cy.get('input[type="radio"][value="no"]').eq(0).click();        // Medical conditions
      cy.get('input[type="radio"][value="no"]').eq(1).click();        // Medications
      cy.get('input[type="radio"][value="no"]').eq(2).click();        // Surgeries
      cy.get('input[type="radio"][value="opositive"]').click();       // Blood type (optional)
  
      // Submit quiz
      cy.contains('Submit').click();
  
      // Fill out registration form
      cy.get('input[name="fullName"]').type('Test Donor');
      cy.get('input[name="email"]').type('donor@example.com');
      cy.get('input[name="phone"]').type('+971509999999');
      cy.get('select[name="bloodType"]').select('O+');
      cy.get('input[name="address"]').type('Donor District');
      cy.get('input[name="latitude"]').type('24.4667');
      cy.get('input[name="longitude"]').type('54.3667');
      cy.get('input[name="password"]').type('securePass123');
      cy.get('input[name="confirmPassword"]').type('securePass123');
  
      cy.get('button[type="submit"]').click();
  
      // ✅ Assert registration success
      cy.contains('Registration Successful').should('exist');
    });
  });
  