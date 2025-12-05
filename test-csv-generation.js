/**
 * CSV Generation Test Script
 * Tests the fixed CSV generator with negative keywords
 */

import { generateCSVV3 } from './src/utils/csvGeneratorV3.js';
import { createCampaignStructureFromKeywords } from './src/utils/campaignStructureGenerator.js';

// Test data
const testData = {
  campaignName: 'Test Campaign - CSV Fix',
  adGroups: [
    {
      name: 'Plumber Services',
      keywords: [
        'plumber near me',
        '"emergency plumber"',
        '[24/7 plumber]'
      ],
      negativeKeywords: [
        '-free',
        '-"cheap plumber"',
        '-[job plumber]'
      ],
      ads: [
        {
          type: 'rsa',
          headline1: 'Expert Plumber Services',
          headline2: '24/7 Emergency Available',
          headline3: 'Licensed & Insured',
          description1: 'Professional plumbing services for all your needs.',
          description2: 'Fast response time and quality work guaranteed.',
          final_url: 'https://www.example.com/plumber'
        }
      ]
    },
    {
      name: 'HVAC Services',
      keywords: [
        'hvac repair',
        '"ac installation"',
        '[heating service]'
      ],
      negativeKeywords: [
        '-free',
        '-diy'
      ],
      ads: [
        {
          type: 'rsa',
          headline1: 'HVAC Repair Experts',
          headline2: 'AC Installation Services',
          headline3: 'Fast & Reliable',
          description1: 'Professional HVAC services for your home.',
          description2: 'Licensed technicians available 24/7.',
          final_url: 'https://www.example.com/hvac'
        }
      ]
    }
  ],
  campaignNegativeKeywords: [
    '-free',
    '-cheap',
    '-"job search"',
    '-[career]'
  ]
};

console.log('🧪 Starting CSV Generation Test...\n');

try {
  // Create campaign structure
  const structure = {
    campaigns: [
      {
        campaign_name: testData.campaignName,
        negative_keywords: testData.campaignNegativeKeywords,
        adgroups: testData.adGroups.map(adGroup => ({
          adgroup_name: adGroup.name,
          keywords: adGroup.keywords,
          negative_keywords: adGroup.negativeKeywords,
          ads: adGroup.ads.map(ad => ({
            type: ad.type,
            headline1: ad.headline1,
            headline2: ad.headline2,
            headline3: ad.headline3,
            description1: ad.description1,
            description2: ad.description2,
            final_url: ad.final_url
          }))
        }))
      }
    ]
  };

  console.log('📊 Test Data:');
  console.log(`   Campaign: ${testData.campaignName}`);
  console.log(`   Ad Groups: ${testData.adGroups.length}`);
  console.log(`   Total Keywords: ${testData.adGroups.reduce((sum, ag) => sum + ag.keywords.length, 0)}`);
  console.log(`   Campaign Negative Keywords: ${testData.campaignNegativeKeywords.length}`);
  console.log(`   Ad Group Negative Keywords: ${testData.adGroups.reduce((sum, ag) => sum + ag.negativeKeywords.length, 0)}`);
  console.log(`   Total Ads: ${testData.adGroups.reduce((sum, ag) => sum + ag.ads.length, 0)}\n`);

  // Generate CSV
  console.log('🔄 Generating CSV...');
  const csvContent = generateCSVV3(structure);
  
  // Write to file
  const fs = await import('fs');
  const path = await import('path');
  const testFileName = 'test-csv-export.csv';
  const testFilePath = path.join(process.cwd(), testFileName);
  
  fs.writeFileSync(testFilePath, csvContent, 'utf-8');
  console.log(`✅ CSV generated: ${testFileName}\n`);

  // Analyze CSV
  console.log('📋 Analyzing CSV Content...\n');
  const lines = csvContent.split('\n');
  console.log(`   Total Lines: ${lines.length}`);
  
  // Check for negative keywords
  const negativeKeywordLines = lines.filter(line => 
    line.includes('Negative Keyword') || 
    (line.includes('Negative') && (line.includes('Broad') || line.includes('Phrase') || line.includes('Exact')))
  );
  console.log(`   Negative Keyword Rows: ${negativeKeywordLines.length}`);
  
  // Check for match types
  const matchTypes = {
    'Negative Broad': lines.filter(line => line.includes('Negative Broad')).length,
    'Negative Phrase': lines.filter(line => line.includes('Negative Phrase')).length,
    'Negative Exact': lines.filter(line => line.includes('Negative Exact')).length,
    'Broad': lines.filter(line => line.includes(',Broad,') || line.includes(',"Broad",')).length,
    'Phrase': lines.filter(line => line.includes(',Phrase,') || line.includes(',"Phrase",')).length,
    'Exact': lines.filter(line => line.includes(',Exact,') || line.includes(',"Exact",')).length
  };
  
  console.log('\n   Match Types Found:');
  Object.entries(matchTypes).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`     ${type}: ${count}`);
    }
  });
  
  // Check for undefined
  const hasUndefined = lines.some(line => line.includes('undefined'));
  console.log(`\n   Contains "undefined": ${hasUndefined ? '❌ YES (ERROR!)' : '✅ NO'}`);
  
  // Check for campaign-level negative keywords
  const campaignNegativeHeaderIndex = lines.findIndex(line => line.includes('"Campaign","Negative Keyword","Match Type"'));
  const adGroupNegativeHeaderIndex = lines.findIndex(line => line.includes('"Campaign","Ad Group","Negative Keyword","Match Type"'));
  
  let campaignNegativeCount = 0;
  let adGroupNegativeCount = 0;
  
  if (campaignNegativeHeaderIndex >= 0) {
    for (let i = campaignNegativeHeaderIndex + 1; i < lines.length; i++) {
      if (lines[i].trim() === '' || lines[i].includes('"Campaign","Ad Group"')) break;
      if (lines[i].includes(testData.campaignName) && !lines[i].includes('Ad Group')) {
        campaignNegativeCount++;
      }
    }
  }
  
  if (adGroupNegativeHeaderIndex >= 0) {
    for (let i = adGroupNegativeHeaderIndex + 1; i < lines.length; i++) {
      if (lines[i].trim() === '' || lines[i].includes('"Campaign","Ad Group","Ad Type"')) break;
      if (lines[i].includes(testData.campaignName) && lines[i].includes('Ad Group')) {
        adGroupNegativeCount++;
      }
    }
  }
  
  console.log(`\n   Campaign-Level Negative Keywords: ${campaignNegativeCount}`);
  console.log(`   Ad Group-Level Negative Keywords: ${adGroupNegativeCount}`);
  
  // Show sample negative keyword lines
  console.log('\n   Sample Negative Keyword Rows:');
  negativeKeywordLines.slice(0, 5).forEach((line, idx) => {
    if (line.trim()) {
      console.log(`     ${idx + 1}. ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
    }
  });
  
  // Validation results
  console.log('\n✅ Test Results:');
  const results = {
    csvGenerated: csvContent.length > 0,
    noUndefined: !hasUndefined,
    hasCampaignNegatives: campaignNegativeCount > 0,
    hasAdGroupNegatives: adGroupNegativeCount > 0,
    correctMatchTypes: matchTypes['Negative Broad'] > 0 || matchTypes['Negative Phrase'] > 0 || matchTypes['Negative Exact'] > 0,
    noWrongFormat: !lines.some(line => line.includes('Broad (Negative)') || line.includes('Phrase (Negative)') || line.includes('Exact (Negative)'))
  };
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${test}: ${passed}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  console.log(`\n${allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED'}\n`);
  
  // Show file location
  console.log(`📁 CSV file saved to: ${testFilePath}`);
  console.log(`   File size: ${(csvContent.length / 1024).toFixed(2)} KB\n`);
  
} catch (error) {
  console.error('❌ Test failed:', error);
  console.error(error.stack);
  process.exit(1);
}

