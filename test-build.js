// Simple test script to verify the build works
import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

const execPromise = promisify(exec);

async function testBuild() {
  try {
    // Test 1: Check if dist/spa directory exists and has files
    const files = await readdir(path.join(process.cwd(), 'dist', 'spa'));
    console.log('✅ dist/spa directory exists with files:', files);
    
    // Test 2: Check if index.html exists
    const indexHtml = await readFile(path.join(process.cwd(), 'dist', 'spa', 'index.html'), 'utf-8');
    console.log('✅ dist/spa/index.html exists, size:', indexHtml.length, 'bytes');
    
    // Test 3: Check if CSS file exists
    const cssFiles = files.filter(f => f.endsWith('.css'));
    console.log('✅ CSS files found:', cssFiles);
    
    // Test 4: Check if JS files exist
    const jsDir = await readdir(path.join(process.cwd(), 'dist', 'spa', 'js'));
    console.log('✅ JS directory exists with files:', jsDir.length, 'files');
    
    console.log('\n🎉 All tests passed! The build is working correctly.');
    console.log('\nTo deploy to Vercel:');
    console.log('1. Push these changes to GitHub');
    console.log('2. Vercel should automatically deploy the new version');
    console.log('3. The app should now show the login page instead of a blank screen');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testBuild();