const { chromium } = require('playwright');

const MENU_OPTIONS = [
  'dashboard',
  'campaign-presets',
  'builder-2',
  'campaign-history',
  'website-templates',
  'keyword-planner',
  'keyword-mixer',
  'negative-keywords',
  'keyword-generator-v3',
  'ads-builder',
  'csv-validator-3',
  'google-ads-csv-export',
  'settings',
  'support-help',
];

async function testAllMenuOptions() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const allLogs = [];
  const allErrors = [];
  
  // Capture console logs
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString(),
    };
    allLogs.push(logEntry);
    console.log(`[${logEntry.type}] ${logEntry.text}`);
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    const errorEntry = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
    allErrors.push(errorEntry);
    console.error(`[PAGE ERROR] ${error.message}`);
  });
  
  // Capture network errors
  page.on('requestfailed', request => {
    const errorEntry = {
      url: request.url(),
      failure: request.failure()?.errorText,
      timestamp: new Date().toISOString(),
    };
    allErrors.push(errorEntry);
    console.error(`[NETWORK ERROR] ${request.url()}: ${errorEntry.failure}`);
  });
  
  try {
    // Navigate to app with bypass
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000/?bypass=adiology2025dev', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for app to load
    await page.waitForTimeout(3000);
    
    // Test each menu option
    for (const menuOption of MENU_OPTIONS) {
      console.log(`\n=== Testing menu option: ${menuOption} ===`);
      
      try {
        // Find and click the menu item
        // For main menu items
        let menuSelector = `button:has-text("${getMenuLabel(menuOption)}")`;
        
        // For submenu items, we need to expand parent first
        if (isSubmenuItem(menuOption)) {
          const parentMenu = getParentMenu(menuOption);
          const parentSelector = `button:has-text("${getMenuLabel(parentMenu)}")`;
          
          // Check if parent is expanded
          const parentButton = await page.$(parentSelector);
          if (parentButton) {
            const isExpanded = await page.evaluate((btn) => {
              const chevron = btn.querySelector('svg');
              return chevron && chevron.style.transform !== 'rotate(180deg)';
            }, parentButton);
            
            if (!isExpanded) {
              console.log(`  Expanding parent menu: ${parentMenu}`);
              await parentButton.click();
              await page.waitForTimeout(500);
            }
          }
          
          // Now find the submenu item
          menuSelector = `button:has-text("${getMenuLabel(menuOption)}")`;
        }
        
        // Click the menu item
        console.log(`  Clicking menu item: ${menuOption}`);
        await page.click(menuSelector, { timeout: 5000 });
        
        // Wait for content to load
        await page.waitForTimeout(2000);
        
        // Check for any immediate errors
        const currentErrors = allErrors.slice();
        if (currentErrors.length > 0) {
          console.log(`  ⚠️  Found ${currentErrors.length} errors for ${menuOption}`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error testing ${menuOption}:`, error.message);
        allErrors.push({
          menuOption,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    // Wait a bit more to catch any delayed errors
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('Fatal error:', error);
    allErrors.push({
      type: 'fatal',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  } finally {
    // Generate report
    console.log('\n\n=== CONSOLE LOGS SUMMARY ===');
    console.log(`Total console logs: ${allLogs.length}`);
    
    const logsByType = {};
    allLogs.forEach(log => {
      logsByType[log.type] = (logsByType[log.type] || 0) + 1;
    });
    console.log('Logs by type:', logsByType);
    
    console.log('\n=== ERRORS SUMMARY ===');
    console.log(`Total errors: ${allErrors.length}`);
    
    if (allErrors.length > 0) {
      console.log('\n=== ERROR DETAILS ===');
      allErrors.forEach((error, index) => {
        console.log(`\nError ${index + 1}:`);
        console.log(JSON.stringify(error, null, 2));
      });
    }
    
    // Save to file
    const fs = require('fs');
    const report = {
      timestamp: new Date().toISOString(),
      totalLogs: allLogs.length,
      totalErrors: allErrors.length,
      logs: allLogs,
      errors: allErrors,
    };
    
    fs.writeFileSync('menu-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n✅ Report saved to menu-test-report.json');
    
    await browser.close();
  }
}

function getMenuLabel(menuId) {
  const labels = {
    'dashboard': 'Dashboard',
    'campaign-presets': 'Campaign Presets',
    'builder-2': 'Campaign Builder',
    'campaign-history': 'Campaign History',
    'website-templates': 'Web Templates',
    'keyword-planner': 'Keyword Planner',
    'keyword-mixer': 'Keyword Mixer',
    'negative-keywords': 'Negative Keywords',
    'keyword-generator-v3': 'Keyword Generator v3.0',
    'ads-builder': 'Ads Builder',
    'csv-validator-3': 'CSV Validator',
    'google-ads-csv-export': 'CSV Export',
    'settings': 'Settings',
    'support-help': 'Support & Help',
  };
  return labels[menuId] || menuId;
}

function isSubmenuItem(menuId) {
  const submenuItems = [
    'campaign-presets',
    'builder-2',
    'campaign-history',
    'keyword-planner',
    'keyword-mixer',
    'negative-keywords',
    'keyword-generator-v3',
  ];
  return submenuItems.includes(menuId);
}

function getParentMenu(menuId) {
  const parentMap = {
    'campaign-presets': 'Campaigns',
    'builder-2': 'Campaigns',
    'campaign-history': 'Campaigns',
    'keyword-planner': 'Keywords',
    'keyword-mixer': 'Keywords',
    'negative-keywords': 'Keywords',
    'keyword-generator-v3': 'Keywords',
  };
  return parentMap[menuId] || null;
}

testAllMenuOptions().catch(console.error);

