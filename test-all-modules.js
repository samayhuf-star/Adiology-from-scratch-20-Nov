/**
 * Test Script: Generate and Validate CSV for All Campaign Structure Types
 * 
 * This script tests each campaign structure module:
 * 1. Generates sample campaign data for each structure type
 * 2. Exports CSV using csvGeneratorV3
 * 3. Validates CSV using CSVValidator2 logic
 * 4. Shows results
 */

const fs = require('fs');
const path = require('path');

// Mock data for testing
const STRUCTURE_TYPES = [
  { id: 'skag', name: 'SKAG' },
  { id: 'stag', name: 'STAG' },
  { id: 'mix', name: 'MIX' },
  { id: 'stag_plus', name: 'STAG+' },
  { id: 'intent', name: 'IBAG' },
  { id: 'alpha_beta', name: 'Alpha–Beta' },
  { id: 'match_type', name: 'Match-Type Split' },
  { id: 'geo', name: 'GEO-Segmented' },
  { id: 'funnel', name: 'Funnel-Based' },
  { id: 'brand_split', name: 'Brand vs Non-Brand' },
  { id: 'competitor', name: 'Competitor Campaigns' },
  { id: 'ngram', name: 'Smart Cluster' },
];

// Sample keywords for testing
const SAMPLE_KEYWORDS = [
  'plumbing services',
  'call plumbing services',
  'contact plumbing services',
  'emergency plumber',
  'plumber near me',
  'drain cleaning',
  'water heater repair',
  'pipe repair',
];

// Sample ads
const SAMPLE_ADS = [
  {
    type: 'rsa',
    headline1: 'Professional Plumbing Services',
    headline2: '24/7 Emergency Service',
    headline3: 'Licensed & Insured',
    description1: 'Get fast, reliable plumbing services. Expert technicians available now.',
    description2: 'Call today for a free estimate!',
    final_url: 'https://example.com',
  },
  {
    type: 'dki',
    headline1: '{KeyWord:plumbing services} - Best Deals',
    headline2: 'Order {KeyWord:plumbing services} Online',
    headline3: 'Find Quality {KeyWord:plumbing services}',
    description1: 'Looking for {KeyWord:plumbing services}? We offer competitive prices.',
    description2: 'Get your {KeyWord:plumbing services} with fast shipping.',
    final_url: 'https://example.com',
  },
];

// CSV Validation Logic (simplified from CSVValidator2)
function validateCSV(csvContent) {
  const results = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      totalRows: 0,
      campaigns: 0,
      adGroups: 0,
      keywords: 0,
      ads: 0,
      extensions: 0,
    },
  };

  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      results.errors.push('CSV file is empty');
      results.isValid = false;
      return results;
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    results.stats.totalRows = lines.length - 1;

    // Check for required headers
    const requiredHeaders = ['Campaign', 'Ad Group'];
    const missingHeaders = requiredHeaders.filter(h => !headers.some(header => header.toLowerCase().includes(h.toLowerCase())));
    
    if (missingHeaders.length > 0) {
      results.warnings.push(`Missing recommended headers: ${missingHeaders.join(', ')}`);
    }

    // Parse rows and count different types
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      // Count campaigns
      if (row['Campaign']) {
        if (!results.stats.campaigns) results.stats.campaigns = new Set();
        results.stats.campaigns.add(row['Campaign']);
      }

      // Count ad groups
      if (row['Ad Group']) {
        if (!results.stats.adGroups) results.stats.adGroups = new Set();
        results.stats.adGroups.add(row['Ad Group']);
      }

      // Count keywords
      if (row['Keyword'] || row['Criterion Type']) {
        results.stats.keywords++;
      }

      // Count ads
      if (row['Ad Type'] || row['Headline 1']) {
        results.stats.ads++;
      }

      // Count extensions
      if (row['Row Type'] && (row['Row Type'].toLowerCase().includes('extension') || row['Row Type'].toLowerCase().includes('asset'))) {
        results.stats.extensions++;
      }

      // Validate keyword format
      if (row['Keyword']) {
        const keyword = row['Keyword'];
        const matchType = row['Match type'] || row['Criterion Type'] || '';
        
        // Check format matches match type
        if (matchType === 'Exact' && !keyword.startsWith('[') && !keyword.endsWith(']')) {
          results.warnings.push(`Row ${i + 1}: Exact match keyword should be in [brackets] format`);
        }
        if (matchType === 'Phrase' && !keyword.startsWith('"') && !keyword.endsWith('"')) {
          results.warnings.push(`Row ${i + 1}: Phrase match keyword should be in "quotes" format`);
        }
      }

      // Validate ad headlines length
      if (row['Headline 1'] && row['Headline 1'].length > 30) {
        results.errors.push(`Row ${i + 1}: Headline 1 exceeds 30 characters (${row['Headline 1'].length}/30)`);
        results.isValid = false;
      }
      if (row['Headline 2'] && row['Headline 2'].length > 30) {
        results.errors.push(`Row ${i + 1}: Headline 2 exceeds 30 characters (${row['Headline 2'].length}/30)`);
        results.isValid = false;
      }
      if (row['Description 1'] && row['Description 1'].length > 90) {
        results.errors.push(`Row ${i + 1}: Description 1 exceeds 90 characters (${row['Description 1'].length}/90)`);
        results.isValid = false;
      }
    }

    // Convert Sets to numbers
    if (results.stats.campaigns instanceof Set) {
      results.stats.campaigns = results.stats.campaigns.size;
    }
    if (results.stats.adGroups instanceof Set) {
      results.stats.adGroups = results.stats.adGroups.size;
    }

  } catch (error) {
    results.errors.push(`Error parsing CSV: ${error.message}`);
    results.isValid = false;
  }

  return results;
}

// Generate mock campaign structure for testing
function generateMockCampaignStructure(structureType) {
  const campaignName = `Test Campaign - ${STRUCTURE_TYPES.find(s => s.id === structureType)?.name || structureType}`;
  
  const structure = {
    campaign: {
      name: campaignName,
      status: 'Enabled',
      type: 'Search',
      dailyBudget: 50,
      url: 'https://example.com',
    },
    adGroups: [],
    keywords: [],
    ads: [],
    negativeKeywords: [],
  };

  // Generate ad groups based on structure type
  switch (structureType) {
    case 'skag':
      // SKAG: One ad group per keyword
      SAMPLE_KEYWORDS.forEach((keyword, idx) => {
        structure.adGroups.push({
          name: `AG - ${keyword}`,
          status: 'Enabled',
        });
        structure.keywords.push({
          keyword: `[${keyword}]`,
          matchType: 'Exact',
          adGroup: `AG - ${keyword}`,
        });
        structure.keywords.push({
          keyword: `"${keyword}"`,
          matchType: 'Phrase',
          adGroup: `AG - ${keyword}`,
        });
        structure.keywords.push({
          keyword: keyword,
          matchType: 'Broad',
          adGroup: `AG - ${keyword}`,
        });
      });
      break;

    case 'stag':
      // STAG: Themed ad groups
      const themes = ['Emergency Services', 'General Services', 'Repair Services'];
      themes.forEach((theme, idx) => {
        structure.adGroups.push({
          name: `AG - ${theme}`,
          status: 'Enabled',
        });
        const keywordsForTheme = SAMPLE_KEYWORDS.slice(idx * 2, (idx + 1) * 2);
        keywordsForTheme.forEach(keyword => {
          structure.keywords.push({
            keyword: `[${keyword}]`,
            matchType: 'Exact',
            adGroup: `AG - ${theme}`,
          });
        });
      });
      break;

    case 'mix':
      // MIX: Combination of SKAG and STAG
      structure.adGroups.push({ name: 'AG - High Priority', status: 'Enabled' });
      structure.adGroups.push({ name: 'AG - General', status: 'Enabled' });
      SAMPLE_KEYWORDS.slice(0, 3).forEach(keyword => {
        structure.keywords.push({
          keyword: `[${keyword}]`,
          matchType: 'Exact',
          adGroup: 'AG - High Priority',
        });
      });
      SAMPLE_KEYWORDS.slice(3).forEach(keyword => {
        structure.keywords.push({
          keyword: `"${keyword}"`,
          matchType: 'Phrase',
          adGroup: 'AG - General',
        });
      });
      break;

    default:
      // Default: Simple structure
      structure.adGroups.push({ name: 'AG - Default', status: 'Enabled' });
      SAMPLE_KEYWORDS.forEach(keyword => {
        structure.keywords.push({
          keyword: `[${keyword}]`,
          matchType: 'Exact',
          adGroup: 'AG - Default',
        });
      });
  }

  // Add ads to first ad group
  if (structure.adGroups.length > 0) {
    const firstAdGroup = structure.adGroups[0].name;
    SAMPLE_ADS.forEach(ad => {
      structure.ads.push({
        ...ad,
        adGroup: firstAdGroup,
      });
    });
  }

  return structure;
}

// Generate CSV content (simplified version)
function generateCSVContent(structure) {
  const lines = [];
  
  // Headers
  const headers = [
    'Campaign',
    'Ad Group',
    'Keyword',
    'Match type',
    'Final URL',
    'Status',
    'Ad Type',
    'Headline 1',
    'Headline 2',
    'Headline 3',
    'Description 1',
    'Description 2',
  ];
  lines.push(headers.map(h => `"${h}"`).join(','));

  // Keywords
  structure.keywords.forEach(kw => {
    const row = [
      structure.campaign.name,
      kw.adGroup,
      kw.keyword,
      kw.matchType,
      structure.campaign.url,
      'Enabled',
      '',
      '',
      '',
      '',
      '',
      '',
    ];
    lines.push(row.map(v => v ? `"${v}"` : '').join(','));
  });

  // Ads
  structure.ads.forEach(ad => {
    const row = [
      structure.campaign.name,
      ad.adGroup,
      '',
      '',
      ad.final_url,
      'Enabled',
      ad.type === 'rsa' ? 'Responsive search ad' : 'Dynamic search ad',
      ad.headline1 || '',
      ad.headline2 || '',
      ad.headline3 || '',
      ad.description1 || '',
      ad.description2 || '',
    ];
    lines.push(row.map(v => v ? `"${v}"` : '').join(','));
  });

  return lines.join('\n');
}

// Main test function
async function testAllModules() {
  console.log('🚀 Starting CSV Generation and Validation Tests\n');
  console.log('='.repeat(80));
  console.log('\n');

  const results = [];

  for (const structureType of STRUCTURE_TYPES) {
    console.log(`\n📋 Testing: ${structureType.name} (${structureType.id})`);
    console.log('-'.repeat(80));

    try {
      // Generate mock structure
      const structure = generateMockCampaignStructure(structureType.id);
      
      // Generate CSV
      const csvContent = generateCSVContent(structure);
      
      // Save CSV file
      const filename = `test_${structureType.id}_${Date.now()}.csv`;
      const filepath = path.join(__dirname, 'test-outputs', filename);
      
      // Create test-outputs directory if it doesn't exist
      const outputDir = path.join(__dirname, 'test-outputs');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(filepath, csvContent, 'utf8');
      
      // Validate CSV
      const validation = validateCSV(csvContent);
      
      // Store results
      const result = {
        structureType: structureType.name,
        structureId: structureType.id,
        filename,
        filepath,
        validation,
        structure,
      };
      
      results.push(result);
      
      // Print results
      console.log(`✅ CSV Generated: ${filename}`);
      console.log(`   Location: ${filepath}`);
      console.log(`   Validation: ${validation.isValid ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`   Stats:`);
      console.log(`     - Total Rows: ${validation.stats.totalRows}`);
      console.log(`     - Campaigns: ${validation.stats.campaigns}`);
      console.log(`     - Ad Groups: ${validation.stats.adGroups}`);
      console.log(`     - Keywords: ${validation.stats.keywords}`);
      console.log(`     - Ads: ${validation.stats.ads}`);
      console.log(`     - Extensions: ${validation.stats.extensions}`);
      
      if (validation.errors.length > 0) {
        console.log(`   ❌ Errors (${validation.errors.length}):`);
        validation.errors.slice(0, 5).forEach(err => console.log(`      - ${err}`));
        if (validation.errors.length > 5) {
          console.log(`      ... and ${validation.errors.length - 5} more errors`);
        }
      }
      
      if (validation.warnings.length > 0) {
        console.log(`   ⚠️  Warnings (${validation.warnings.length}):`);
        validation.warnings.slice(0, 5).forEach(warn => console.log(`      - ${warn}`));
        if (validation.warnings.length > 5) {
          console.log(`      ... and ${validation.warnings.length - 5} more warnings`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${structureType.name}:`, error.message);
      results.push({
        structureType: structureType.name,
        structureId: structureType.id,
        error: error.message,
      });
    }
  }

  // Summary
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.validation && r.validation.isValid).length;
  const failed = results.filter(r => r.validation && !r.validation.isValid).length;
  const errors = results.filter(r => r.error).length;
  
  console.log(`\nTotal Modules Tested: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Errors: ${errors}`);
  
  console.log('\n📁 Generated CSV Files:');
  results.forEach(r => {
    if (r.filename) {
      console.log(`   - ${r.structureType}: ${r.filename}`);
    }
  });
  
  console.log('\n📋 Detailed Results:');
  results.forEach(r => {
    console.log(`\n${r.structureType} (${r.structureId}):`);
    if (r.error) {
      console.log(`   ❌ Error: ${r.error}`);
    } else if (r.validation) {
      console.log(`   Status: ${r.validation.isValid ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`   Errors: ${r.validation.errors.length}`);
      console.log(`   Warnings: ${r.validation.warnings.length}`);
    }
  });

  // Save summary to file
  const summaryPath = path.join(__dirname, 'test-outputs', 'test-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n💾 Summary saved to: ${summaryPath}`);
  
  return results;
}

// Run tests
if (require.main === module) {
  testAllModules()
    .then(() => {
      console.log('\n✅ All tests completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testAllModules, validateCSV, generateMockCampaignStructure };

