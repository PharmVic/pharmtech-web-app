import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
        if (!dirPath.includes('node_modules') && !dirPath.includes('.next') && !dirPath.includes('.git')) {
            walkDir(dirPath, callback);
        }
    } else {
        if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
            callback(dirPath);
        }
    }
  });
}

const targetDirs = ['app', 'components'];
let updatedFiles = 0;

targetDirs.forEach(dir => {
    walkDir(path.join(process.cwd(), dir), (filePath) => {
        let content = fs.readFileSync(filePath, 'utf8');
        
        let newContent = content
            .replace(/text-gray-500/g, 'text-gray-600')
            .replace(/text-gray-400/g, 'text-gray-500')
            .replace(/text-muted/g, 'text-gray-600');
            
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated ${filePath}`);
            updatedFiles++;
        }
    });
});

console.log(`Finished updating ${updatedFiles} files.`);
