import { generateK6Script } from './k6-generator';

describe('k6 Generator', () => {
    it('should generate a valid script with default thresholds', () => {
        const config = {
            targetUrl: 'https://example.com',
            vus: 10,
            duration: '30s'
        };

        const script = generateK6Script(config);

        expect(script).toContain('vus: 10');
        expect(script).toContain("duration: '30s'");
        expect(script).toContain("http.get('https://example.com')");
        expect(script).toContain('http_req_duration');
    });

    it('should use custom thresholds', () => {
        const config = {
            targetUrl: 'https://example.com',
            vus: 5,
            duration: '1m',
            thresholds: {
                http_req_failed: ['rate<0.05']
            }
        };

        const script = generateK6Script(config);

        expect(script).toContain('vus: 5');
        expect(script).toContain("duration: '1m'");
        expect(script).toContain('"http_req_failed":');
        expect(script).toContain('"rate<0.05"');
    });
});
