const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

if (process.env.CI) {
    console.log('Switching Prisma provider to sqlite for CI...');
    schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');
    // Remove directUrl as SQLite doesn't support it
    schema = schema.replace(/\s*directUrl\s*=\s*env\("DIRECT_URL"\)\s*/g, '');
    fs.writeFileSync(schemaPath, schema);
    console.log('Successfully switched to sqlite provider');
}
