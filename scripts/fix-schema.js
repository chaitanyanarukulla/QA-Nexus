const fs = require('fs');
const path = require('path');

// Use process.cwd() to be safe in CI environment
const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');

console.log('=== FIXING SCHEMA FOR CI ===');
console.log('Reading schema from:', schemaPath);

if (!fs.existsSync(schemaPath)) {
    console.error('ERROR: Schema file not found at:', schemaPath);
    process.exit(1);
}

let content = fs.readFileSync(schemaPath, 'utf8');
console.log('Original provider line:', content.match(/provider.*/));

// Replace provider
content = content.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');

// Replace URL with hardcoded file path to avoid env var issues
content = content.replace(/url\s*=\s*env\("DATABASE_URL"\)/, 'url = "file:./test.db"');

// Remove directUrl
content = content.replace(/directUrl.*/g, '');

fs.writeFileSync(schemaPath, content);

console.log('Modified schema written.');
console.log('New provider line:', content.match(/provider.*/));
console.log('New url line:', content.match(/url.*/));
console.log('=== SCHEMA FIX COMPLETE ===');
