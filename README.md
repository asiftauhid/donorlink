# DonorLink

DonorLink is a web application built with Next.js, TypeScript, and MongoDB that bridges the gap between donors and recipient clinics.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (comes with Node.js)
- MongoDB (a MongoDB Atlas account)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/asiftauhid/donorlink.git
cd donorlink
```

2. Install dependencies:

```bash
npm install -r requirements
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=mongodb_connection_string
GMAIL_USER=email_address
GMAIL_PASS=login_password

```

## Running the System locally

To run the system in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Testing

### Running Tests

1. To run the unit test:

```bash
npm run test __tests__/unit
```

2. To run the integration test:

```bash
npm run test __tests__/integration
```

## Running System (Cypress) Tests

### Interactive Mode

Launch the Cypress Test Runner UI:

```bash
npx cypress open
```

1. Select **E2E Testing**
2. Choose a browser (e.g., **Chrome**)
3. Run a spec file (e.g., `blood_request.cy.ts`) to test interactively

### Test Coverage Report

The test coverage report is automatically generated when running tests. After running `npm run test __tests__/unit` or `npm run test __tests__/integration`, you can find the coverage report in two places:

1. In the terminal output
2. In the `/coverage` directory as HTML files (open `index.html` in your browser for a detailed view)

The coverage report includes:

- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

## Project Structure

- `/src` - Source code
- `/__tests__` - Test files
- `/public` - Static assets
- `/coverage` - Test coverage reports

## Technologies Used

- Next.js
- TypeScript
- MongoDB
- Jest
- React Testing Library
- TailwindCSS
