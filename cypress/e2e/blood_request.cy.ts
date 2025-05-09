/// <reference types="cypress" />
import 'cypress-wait-until';

describe('Clinic Dashboard & Blood Request Full Flow', () => {
  const clinicEmail = 'clinic_request@example.com';
  const clinicPassword = 'securePass123';
  const donorEmail = 'donor123@test.com';
  const donorPassword = 'test1234';

  beforeEach(() => {
    // Clean up old data
    cy.request('POST', 'http://localhost:3000/api/test/cleanup', {
      email: clinicEmail,
      userType: 'clinic',
      cleanupRequests: true,
    });

    cy.request('POST', 'http://localhost:3000/api/test/cleanup', {
      email: donorEmail,
      userType: 'donor',
    });

    // Register donor
    cy.visit('/donor_registration');
    cy.get('input[type="radio"][value="17to65"]').click();
    cy.get('input[type="radio"][value="over60kg"]').click();
    cy.get('input[type="radio"][value="never"]').click();
    cy.get('input[type="radio"][value="no"]').eq(0).click();
    cy.get('input[type="radio"][value="no"]').eq(1).click();
    cy.get('input[type="radio"][value="no"]').eq(2).click();
    cy.get('input[type="radio"][value="apositive"]').click();
    cy.contains('Submit').click();

    cy.get('input[name="fullName"]').type('Test Donor');
    cy.get('input[name="email"]').type(donorEmail);
    cy.get('input[name="phone"]').type('+971501234999');
    cy.get('select[name="bloodType"]').select('A+');
    cy.get('input[name="address"]').type('456 Donor Lane');
    cy.get('input[name="latitude"]').type('24.4667');
    cy.get('input[name="longitude"]').type('54.3667');
    cy.get('input[name="password"]').type(donorPassword);
    cy.get('input[name="confirmPassword"]').type(donorPassword);
    cy.get('button[type="submit"]').click();
    cy.contains('Registration Successful').should('exist');
    cy.contains('Go to Dashboard').click();

    // Register clinic
    cy.visit('/clinic_registration');
    cy.get('input[name="name"]').type('Request Test Clinic');
    cy.get('input[name="address"]').type('Downtown Ave');
    cy.get('input[name="latitude"]').type('24.4667');
    cy.get('input[name="longitude"]').type('54.3667');
    cy.get('input[name="email"]').type(clinicEmail);
    cy.get('input[name="phone"]').type('+971501234000');
    cy.get('input[name="licenseNumber"]').type('REQCLINIC001');
    cy.get('input[name="password"]').type(clinicPassword);
    cy.get('input[name="confirmPassword"]').type(clinicPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
  });

  it('clinic sends request, donor accepts, clinic confirms, donor gets points', () => {
    // Log in as clinic
    cy.get('select').select('Clinic');
    cy.get('input[name="email"]').type(clinicEmail);
    cy.get('input[name="password"]').type(clinicPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/clinic');

    // Submit blood request
    cy.visit('/request_blood');
    cy.get('select[name="bloodType"]').select('A+');
    cy.get('input[name="quantity"]').clear().type('2');
    cy.get('select[name="urgency"]').select('High');
    cy.get('textarea[name="notes"]').type('Urgent case');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/request_details');

    // Select donor
    cy.contains('td', donorEmail)
      .parent('tr')
      .within(() => {
        cy.get('input[type="checkbox"]').check({ force: true }).should('be.checked');
      });

    // Wait until button is enabled
    cy.waitUntil(() =>
      cy.get('button')
        .contains('Send Request to Selected Donors')
        .then($btn => Cypress.$($btn).prop('disabled') === false),
      {
        timeout: 7000,
        interval: 300,
        errorMsg: 'Send Request button never became enabled',
      }
    );

    // Click Send
    cy.get('button').contains('Send Request to Selected Donors').click();
    cy.contains('Blood donation requests sent successfully').should('exist');

    // Log out clinic
    cy.visit('/login');

    // Log in as donor
    cy.get('select').select('Donor');
    cy.get('input[name="email"]').type(donorEmail);
    cy.get('input[name="password"]').type(donorPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/donor');

    // Express interest
    cy.contains('button', 'Interested').click();
    cy.contains('Not Interested Anymore').should('exist');

    // Log out donor
    cy.visit('/login');

    // Log back in as clinic
    cy.get('select').select('Clinic');
    cy.get('input[name="email"]').type(clinicEmail);
    cy.get('input[name="password"]').type(clinicPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/clinic');

    // 🔥 Fix: Switch to Requested Donors tab before asserting "Interested"
    cy.contains('button', 'Requested Donors').click();
    cy.contains('td', donorEmail).should('exist');

    // Accept donor
    cy.contains('td', 'interested')
      .parents('tr')
      .within(() => {
        cy.contains('Mark Donated').click();
      });
    cy.contains('td', 'donated').should('exist');

    // Log out clinic
    cy.visit('/login');

    // Log in as donor and check reward
    cy.get('select').select('Donor');
    cy.get('input[name="email"]').type(donorEmail);
    cy.get('input[name="password"]').type(donorPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/donor');
    cy.contains('100 points').should('exist');
  });
});
