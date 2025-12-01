import { test, expect } from '@playwright/test';

test('POST /api/ai/generate-mock-data', async ({ request }) => {
  const startTime = Date.now();

  const response = await request.post(
  '/api/ai/generate-mock-data',
  {
    headers: {
          "0": "{",
          "1": "\"",
          "2": "C",
          "3": "o",
          "4": "n",
          "5": "t",
          "6": "e",
          "7": "n",
          "8": "t",
          "9": "-",
          "10": "T",
          "11": "y",
          "12": "p",
          "13": "e",
          "14": "\"",
          "15": ":",
          "16": "\"",
          "17": "a",
          "18": "p",
          "19": "p",
          "20": "l",
          "21": "i",
          "22": "c",
          "23": "a",
          "24": "t",
          "25": "i",
          "26": "o",
          "27": "n",
          "28": "/",
          "29": "j",
          "30": "s",
          "31": "o",
          "32": "n",
          "33": "\"",
          "34": "}"
    },
    params: {
          "0": "{",
          "1": "}"
    },
    data: "{\"schema\":{\"name\":\"string\",\"age\":\"integer\",\"email\":\"string\",\"address\":{\"street\":\"string\",\"city\":\"string\",\"zip\":\"string\"}},\"count\":10}"
  }
  );

  const responseTime = Date.now() - startTime;

  // Assertions
  expect(response.ok()).toBeTruthy();

  // Log response for debugging
  console.log('Status:', response.status());
  console.log('Response Time:', responseTime + 'ms');
  try {
    const responseBody = await response.json();
    console.log('Response Body:', JSON.stringify(responseBody, null, 2));
  } catch (e) {
    console.log('Response Body (text):', await response.text());
  }
});
