import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('✓ Environment loaded. GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'FOUND' : 'MISSING');
