import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '8hci3k',
  e2e: {
    baseUrl: 'http://localhost:3000', // 👈 This makes cy.visit() and cy.request() relative
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
    },
  },
});
