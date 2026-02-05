// Build verification script for Vercel
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build output...');

const requiredFiles = [
  '.next/BUILD_ID',
  '.next/static/chunks',
  '.next/server/pages-manifest.json'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('🎉 Build verification PASSED');
  process.exit(0);
} else {
  console.log('🚨 Build verification FAILED');
  console.log('Expected Next.js build output not found.');
  console.log('This usually means the build failed or output directory is wrong.');
  process.exit(1);
}