
/**
 * Generate a k6 script based on the configuration
 */
export function generateK6Script(config: {
    targetUrl: string
    vus: number
    duration: string
    thresholds?: any
}): string {
    const thresholds = config.thresholds || {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
        http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
    };

    return `
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: ${config.vus},
  duration: '${config.duration}',
  thresholds: ${JSON.stringify(thresholds, null, 2)},
};

export default function () {
  const res = http.get('${config.targetUrl}');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
`;
}
