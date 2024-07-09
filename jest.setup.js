require('dotenv').config();
// const { createClient } = require('@supabase/supabase-js');
const app = require('./src/app');


beforeAll(async () => {
    // const createClient = await import ('@supabase/client')
  // Load environment variables
  const DATABASE_URL = process.env.DATABASE_URL;
  


//   global.server = app.listen(3000, () => {
//     console.log('Server is running on port 3000');
//   });
});

afterAll(async () => {
//   await supabase.disconnect();
});
