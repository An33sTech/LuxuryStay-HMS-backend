## Environment Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/An33sTech/LuxuryStay-HMS-backend.git
   cd your-repo
2. Create a .env file based on the provided .env.example:
   ```bash
   cp .env.example .env
3. Update the .env file with your actual values:
   ```bash
   DB_URI=mongodb://your_database_uri
   JWT_SECRET=your_secret
4. Install the necessary dependencies:
   ```bash
   npm i
5. Run your application:
   ```bash
   npx nodemon index.js
