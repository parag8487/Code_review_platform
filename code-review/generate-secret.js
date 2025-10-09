const crypto = require('crypto');

// Generate a random session secret
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('Generated Session Secret:');
console.log(sessionSecret);
console.log('\nAdd this to your environment variables as SESSION_SECRET');