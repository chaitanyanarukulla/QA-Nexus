const fs = require('fs');
const path = require('path');

const sourcePath = path.join(process.cwd(), 'prisma/schema.prisma');
const targetPath = path.join(process.cwd(), 'prisma/schema.ci.prisma');

console.log('=== CREATING CI SCHEMA ===');
console.log('Source:', sourcePath);
console.log('Target:', targetPath);

if (!fs.existsSync(sourcePath)) {
    console.error('ERROR: Source schema not found!');
    process.exit(1);
}

let content = fs.readFileSync(sourcePath, 'utf8');

// Replace provider
content = content.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');

// Replace URL
content = content.replace(/url\s*=\s*env\("DATABASE_URL"\)/, 'url = "file:./test.db"');

// Remove directUrl
content = content.replace(/directUrl.*/g, '');

fs.writeFileSync(targetPath, content);

console.log('CI Schema created successfully.');
console.log('=== VERIFICATION ===');
const newContent = fs.readFileSync(targetPath, 'utf8');
console.log('Provider:', newContent.match(/provider.*/)[0]);
console.log('URL:', newContent.match(/url.*/)[0]);
