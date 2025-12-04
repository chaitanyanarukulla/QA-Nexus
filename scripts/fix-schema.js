const fs = require('fs');
const path = require('path');

console.log('Current working directory:', process.cwd());
console.log('Directory contents of prisma/:');
try {
    console.log(fs.readdirSync('prisma'));
} catch (e) {
    console.error('Could not list prisma directory:', e);
}

const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
console.log('Target schema path:', schemaPath);

if (!fs.existsSync(schemaPath)) {
    console.error('ERROR: Schema file not found at:', schemaPath);
    process.exit(1);
}

let content = fs.readFileSync(schemaPath, 'utf8');
console.log('Original provider line:', content.match(/provider.*/));

// Replace provider
content = content.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');

// Replace URL with hardcoded file path
content = content.replace(/url\s*=\s*env\("DATABASE_URL"\)/, 'url = "file:./test.db"');

// Remove directUrl
content = content.replace(/directUrl.*/g, '');

fs.writeFileSync(schemaPath, content);
console.log('File written.');

// Verify
const newContent = fs.readFileSync(schemaPath, 'utf8');
console.log('=== VERIFICATION ===');
console.log('New provider line:', newContent.match(/provider.*/));
console.log('New url line:', newContent.match(/url.*/));
console.log('====================');
