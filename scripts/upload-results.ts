import fs from 'fs';

async function main() {
    const reportPath = process.env.REPORT_PATH || './test-results.json';
    const apiUrl = process.env.QA_NEXUS_URL || 'http://localhost:3000';
    const apiKey = process.env.QA_NEXUS_API_KEY || 'dev-api-key';

    if (!fs.existsSync(reportPath)) {
        console.error(`Report file not found at ${reportPath}`);
        process.exit(1);
    }

    console.log(`Reading report from ${reportPath}...`);
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

    console.log(`Uploading to ${apiUrl}/api/import-results...`);

    try {
        const response = await fetch(`${apiUrl}/api/import-results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify(report)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${text}`);
        }

        const data = await response.json();
        console.log('Upload successful!', data);
    } catch (error) {
        console.error('Upload error:', error);
        process.exit(1);
    }
}

main();
