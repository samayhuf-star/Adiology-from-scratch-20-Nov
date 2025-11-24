import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * LambdaTest Playwright Configuration
 * 
 * This configuration file is specifically for running Playwright tests on LambdaTest's cloud infrastructure.
 * 
 * Setup:
 * 1. Create a .env file with your LambdaTest credentials:
 *    - LT_USERNAME: Your LambdaTest username
 *    - LT_ACCESS_KEY: Your LambdaTest access token
 *    - BASE_URL: Your application URL (defaults to http://localhost:3000)
 *    - BUILD_NAME: Optional build name (defaults to timestamp)
 *    - PROJECT_NAME: Optional project name (defaults to 'Adiology Campaign Dashboard')
 * 
 *    Or run: ./scripts/setup-env.sh
 * 
 * 2. Run tests:
 *    - npm run test:lambdatest
 *    - Or: npx playwright test --config=playwright.lambdatest.config.ts
 * 
 * 3. View results:
 *    - Check LambdaTest dashboard: https://automation.lambdatest.com/
 * 
 * Alternative: Use LambdaTest SDK CLI:
 *    - npx playwright-node-sdk playwright test
 *    (This uses lambdatest.yml configuration file)
 */

// Helper function to build LambdaTest CDP endpoint
function getLambdaTestEndpoint(capabilities: Record<string, any>): string {
  const username = process.env.LT_USERNAME || process.env.LAMBDATEST_USERNAME || '';
  const accessKey = process.env.LT_ACCESS_KEY || process.env.LAMBDATEST_ACCESS_KEY || '';
  
  if (!username || !accessKey) {
    throw new Error('LT_USERNAME and LT_ACCESS_KEY environment variables are required');
  }

  // LambdaTest requires capabilities in specific format with LT:Options
  const caps = {
    browserName: capabilities.browserName || 'Chrome',
    browserVersion: capabilities.browserVersion || 'latest',
    'LT:Options': {
      platform: capabilities.platform || 'Windows 10',
      build: capabilities.build || process.env.BUILD_NAME || `Build ${new Date().toISOString()}`,
      name: capabilities.name || 'Playwright Test',
      user: username,
      accessKey: accessKey,
      network: true,
      video: true,
      console: true,
      ...capabilities['LT:Options'],
    },
  };

  return `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(caps))}`;
}

const config = defineConfig({
  testDir: './tests',
  
  // Test timeout settings
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for your application
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers on LambdaTest
  projects: [
    {
      name: 'chromium-lt',
      use: {
        ...devices['Desktop Chrome'],
        connectOptions: {
          wsEndpoint: getLambdaTestEndpoint({
            browserName: 'Chrome',
            browserVersion: 'latest',
            platform: 'Windows 10',
            name: 'Chrome Test - Paid Signup',
            build: process.env.BUILD_NAME || `Build ${new Date().toISOString()}`,
            'LT:Options': {
              project: process.env.PROJECT_NAME || 'Adiology Campaign Dashboard',
            },
          }),
        },
      },
    },

    {
      name: 'firefox-lt',
      use: {
        ...devices['Desktop Firefox'],
        connectOptions: {
          wsEndpoint: getLambdaTestEndpoint({
            browserName: 'Firefox',
            browserVersion: 'latest',
            platform: 'Windows 10',
            name: 'Firefox Test - Paid Signup',
            build: process.env.BUILD_NAME || `Build ${new Date().toISOString()}`,
            'LT:Options': {
              project: process.env.PROJECT_NAME || 'Adiology Campaign Dashboard',
            },
          }),
        },
      },
    },

    {
      name: 'webkit-lt',
      use: {
        ...devices['Desktop Safari'],
        connectOptions: {
          wsEndpoint: getLambdaTestEndpoint({
            browserName: 'Safari',
            browserVersion: 'latest',
            platform: 'macOS Big Sur',
            name: 'Safari Test - Paid Signup',
            build: process.env.BUILD_NAME || `Build ${new Date().toISOString()}`,
            'LT:Options': {
              project: process.env.PROJECT_NAME || 'Adiology Campaign Dashboard',
            },
          }),
        },
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

export default config;

