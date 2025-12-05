/**
 * Generate CSV Campaign with 10,000 ZIP Codes
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Generating Campaign CSV with 10,000 ZIP Codes...\n');

// Generate 10,000 ZIP codes (US ZIP codes range from 00501 to 99950)
function generateZipCodes(count = 10000) {
  const zipCodes = [];
  const used = new Set();
  
  // Generate random ZIP codes in valid US range
  while (zipCodes.length < count) {
    // US ZIP codes: 00501-99950
    const zip = Math.floor(Math.random() * (99950 - 501 + 1)) + 501;
    const zipStr = zip.toString().padStart(5, '0');
    
    if (!used.has(zipStr)) {
      used.add(zipStr);
      zipCodes.push(zipStr);
    }
  }
  
  return zipCodes.sort();
}

// Generate CSV content
function generateCSVWithZips(zipCodes, campaignName = '10K ZIP Campaign') {
  const blocks = [];
  
  // 1. Campaigns Block
  blocks.push('"Campaign","Campaign Status","Campaign Type","Networks","Daily Budget","Budget Type","Start Date","End Date","Bid Strategy Type","Campaign URL Options (Tracking Template)","Final URL Suffix","Campaign Language"');
  blocks.push(`${campaignName},Enabled,Search,Search Network,,,,,,,,en`);
  blocks.push('');
  
  // 2. Campaign Settings Block
  blocks.push('"Campaign","Setting","Value"');
  blocks.push('');
  
  // 3. Shared Budgets Block
  blocks.push('"Budget","Budget Amount","Delivery Method","Budget ID"');
  blocks.push('');
  
  // 4. Ad Groups Block (one ad group)
  blocks.push('"Campaign","Ad Group","Ad Group Status","CPC Bid","Ad Group Default Max CPC","Ad Group Type"');
  blocks.push(`${campaignName},Main Ad Group,Enabled,,,`);
  blocks.push('');
  
  // 5. Keywords Block (sample keywords)
  blocks.push('"Campaign","Ad Group","Keyword","Criterion Type","Final URL","Status","Custom Parameter"');
  const sampleKeywords = [
    ['plumber near me', 'Broad'],
    ['"emergency plumber"', 'Phrase'],
    ['[24/7 plumber]', 'Exact'],
    ['hvac repair', 'Broad'],
    ['"ac installation"', 'Phrase']
  ];
  
  sampleKeywords.forEach(([keyword, matchType]) => {
    const cleanKeyword = keyword.replace(/^\[|\]$|^"|"$/g, '');
    blocks.push(`${campaignName},Main Ad Group,${cleanKeyword},${matchType},https://www.example.com,Enabled,`);
  });
  blocks.push('');
  
  // 6. Campaign Negative Keywords Block
  blocks.push('"Campaign","Negative Keyword","Match Type"');
  const negativeKeywords = ['free', 'cheap', 'job', 'career'];
  negativeKeywords.forEach(kw => {
    blocks.push(`${campaignName},${kw},Negative Broad`);
  });
  blocks.push('');
  
  // 7. Ad Group Negative Keywords Block
  blocks.push('"Campaign","Ad Group","Negative Keyword","Match Type"');
  blocks.push('');
  
  // 8. RSA Ads Block
  blocks.push('"Campaign","Ad Group","Ad Type","Ad Status","Final URL","Headline 1","Headline 2","Headline 3","Headline 4","Headline 5","Description 1","Description 2","Path 1","Path 2","Ad Rotation"');
  blocks.push(`${campaignName},Main Ad Group,Responsive search ad,Enabled,https://www.example.com,Expert Services,24/7 Available,Licensed & Insured,,,Professional services for all your needs.,Fast response time guaranteed.,,,`);
  blocks.push('');
  
  // 9-11. Other ad blocks (empty)
  blocks.push('"Campaign","Ad Group","Ad Type","Ad Status","Final URL","Headline 1","Headline 2","Headline 3","Description 1","Description 2","Path 1","Path 2"');
  blocks.push('');
  blocks.push('"Campaign","Ad Group","Ad Type","Ad Status","Final URL","Domain","Language","Headline","Description"');
  blocks.push('');
  blocks.push('"Campaign","Ad Group","Ad Type","Ad Status","Image URL","Alt Text","Final URL"');
  blocks.push('');
  
  // 12-15. Extensions (empty for now)
  blocks.push('"Campaign","Sitelink Text","Description Line 1","Description Line 2","Final URL","Device Preference","Start Date","End Date","Status"');
  blocks.push('');
  blocks.push('"Campaign","Callout Text","Start Date","End Date","Device Preference","Status"');
  blocks.push('');
  blocks.push('"Campaign","Header","Values","Start Date","End Date","Status"');
  blocks.push('');
  blocks.push('"Campaign","Phone Number","Country Code","Phone Verification","Device Preference","Start Date","End Date","Status"');
  blocks.push('');
  
  // 16-18. Other extensions (empty)
  blocks.push('"Campaign","Price Extension Type","Header","Price Qualifier","Price","Final URL","Currency","Start Date","End Date","Status"');
  blocks.push('');
  blocks.push('"Campaign","App Platform","App ID","Final URL","Start Date","End Date","Status"');
  blocks.push('');
  
  // 19. ZIP/Postal Code Targeting Block - THIS IS THE MAIN PART
  blocks.push('"Campaign","Location Target","Target Type","Bid Adjustment"');
  console.log(`   Generating ${zipCodes.length} ZIP code targeting rows...`);
  
  zipCodes.forEach((zip, index) => {
    if (index % 1000 === 0) {
      console.log(`   Progress: ${index}/${zipCodes.length} ZIP codes...`);
    }
    blocks.push(`${campaignName},${zip},Postal Code,`);
  });
  blocks.push('');
  
  // 20-22. Other location blocks (empty)
  blocks.push('"Campaign","Location Target","Target Type","Bid Adjustment"');
  blocks.push('');
  blocks.push('"Campaign","Location Target","Target Type","Bid Adjustment"');
  blocks.push('');
  
  // 23-26. Other targeting (empty)
  blocks.push('"Campaign","Ad Group","Audience Name","Audience Type","Bid Adjustment","Status"');
  blocks.push('');
  blocks.push('"Campaign","Ad Schedule","Start Hour","End Hour","Start Minute","End Minute","Day of Week","Bid Modifier"');
  blocks.push('');
  blocks.push('"Campaign","Device","Bid Adjustment"');
  blocks.push('');
  blocks.push('"Campaign","Ad Group","Ad/Keyword/Asset","Label Name"');
  blocks.push('');
  
  // 27-28. Tracking (empty)
  blocks.push('"Campaign","Tracking Template","Final URL Suffix"');
  blocks.push('');
  blocks.push('"Campaign","Ad Group","Param","Value"');
  blocks.push('');
  
  // 29. Upload Notes
  blocks.push('"Upload Notes","Generated By","Generation Timestamp"');
  blocks.push(`Generated by Adiology Campaign Dashboard,CSV Generator V3,${new Date().toISOString()}`);
  
  return blocks.join('\n');
}

// Main execution
try {
  console.log('📊 Generating 10,000 ZIP codes...');
  const zipCodes = generateZipCodes(10000);
  console.log(`✅ Generated ${zipCodes.length} unique ZIP codes\n`);
  
  console.log('🔄 Generating CSV content...');
  const csvContent = generateCSVWithZips(zipCodes, '10K ZIP Campaign - ' + new Date().toISOString().split('T')[0]);
  
  const fileName = '10k-zip-campaign.csv';
  const filePath = join(process.cwd(), fileName);
  
  console.log('💾 Writing CSV file...');
  writeFileSync(filePath, csvContent, 'utf-8');
  
  const fileSizeMB = (csvContent.length / (1024 * 1024)).toFixed(2);
  const fileSizeKB = (csvContent.length / 1024).toFixed(2);
  
  console.log('\n✅ CSV Generated Successfully!');
  console.log(`\n📁 File Details:`);
  console.log(`   Filename: ${fileName}`);
  console.log(`   Location: ${filePath}`);
  console.log(`   Size: ${fileSizeMB} MB (${fileSizeKB} KB)`);
  console.log(`   Total Lines: ${csvContent.split('\n').length}`);
  console.log(`   ZIP Codes: ${zipCodes.length}`);
  
  console.log(`\n📥 Download Link:`);
  console.log(`   File://${filePath}`);
  console.log(`\n   Or access via:`);
  console.log(`   http://localhost:3000/${fileName}`);
  
  console.log(`\n📋 Sample ZIP Codes (first 10):`);
  zipCodes.slice(0, 10).forEach((zip, idx) => {
    console.log(`   ${idx + 1}. ${zip}`);
  });
  
  console.log(`\n✨ Generation Complete!\n`);
  
} catch (error) {
  console.error('❌ Error generating CSV:', error);
  console.error(error.stack);
  process.exit(1);
}

