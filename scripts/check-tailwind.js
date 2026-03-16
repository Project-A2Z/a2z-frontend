const fs = require('fs');
const path = require('path');

//console.log('🔍 Checking Tailwind CSS Configuration...\n');

// Check if tailwind.config.ts exists
const configPath = path.join(__dirname, '..', 'tailwind.config.ts');
if (fs.existsSync(configPath)) {
  //console.log('✅ tailwind.config.ts found');
} else {
  //console.log('❌ tailwind.config.ts not found');
}

// Check if globals.css exists
const cssPath = path.join(__dirname, '..', 'app', 'globals.css');
if (fs.existsSync(cssPath)) {
  //console.log('✅ globals.css found');
} else {
  //console.log('❌ globals.css not found');
}

// Check if postcss.config.mjs exists
const postcssPath = path.join(__dirname, '..', 'postcss.config.mjs');
if (fs.existsSync(postcssPath)) {
  //console.log('✅ postcss.config.mjs found');
} else {
  //console.log('❌ postcss.config.mjs not found');
}

// Check package.json for dependencies
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const hasTailwind = packageJson.dependencies && packageJson.dependencies['tailwindcss'];
  const hasPostcss = packageJson.devDependencies && packageJson.devDependencies['@tailwindcss/postcss'];
  
  if (hasTailwind) {
    //console.log('✅ tailwindcss dependency found');
  } else {
    //console.log('❌ tailwindcss dependency not found');
  }
  
  if (hasPostcss) {
    //console.log('✅ @tailwindcss/postcss dependency found');
  } else {
    //console.log('❌ @tailwindcss/postcss dependency not found');
  }
} else {
  //console.log('❌ package.json not found');
}

//console.log('\n🎯 To test Tailwind CSS:');
//console.log('1. Run: npm run dev');
//console.log('2. Visit: http://localhost:3000/tailwind-test');
//console.log('3. Check if colors and styles are applied correctly');
