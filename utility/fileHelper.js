const fs = require('fs');
const path = require('path');
const { logTrace } = require('./logs');

const copyFolder = async (srcFolder, dstFolder) => {
    const files = await getFiles(srcFolder);
   logTrace(files)
    
    // Ensure dst folder exists
    dstFolder = getDir(dstFolder);

    for (const file of files) {
        const srcFilePath = path.join(srcFolder, file);
        const dstFilePath = path.join(dstFolder, file);
        
        fs.copyFileSync(srcFilePath, dstFilePath);
       logTrace(`Copied ${srcFilePath} to ${dstFilePath}`);
    }
};

const getDir = (dir)=>{

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    return dir;
}

const getFiles = async (folderPath) => {
    return fs.readdirSync(folderPath);
};

module.exports = {
    copyFolder,
    getFiles,
    getDir
};
