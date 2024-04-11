// require modules
const fs = require('fs');
const archiver = require('archiver');
const { logTrace } = require('./logs');
const { getFiles } = require('./fileHelper');

const archiveFile = (path) => {
    return new Promise((resolve, reject) => {
        // remove old extension and replace with zip
        const newPath = path.replace(/(\.[^/.]+)$/, ".zip");
       logTrace(newPath);

        const output = fs.createWriteStream(newPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        // Handle errors during the archiving process
        output.on('error', function (err) {
            logTrace(err);
            reject(err);
        });

        output.on('close', function () {
           logTrace(archive.pointer() + ' total bytes');
           logTrace('archiver has been finalized and the output file descriptor has closed.');
            fs.unlink(path, (err) => {
                if (err) {
                    logTrace(err);
                    reject(err);
                } else {
                   logTrace('Original file deleted successfully.');
                    resolve(newPath);
                }
            });
        });

        archive.pipe(output);

        // Append the file to the archive
        archive.file(path, { name: path.split('/').pop() });

        // Finalize the archive after appending the file
        archive.finalize();
    });
};

const archiveFolder = async (folderPath) => {
    const files = await getFiles(folderPath);
    // get file names in array from the directory
    for (const file of files) {
       logTrace(file)
        const filePath = folderPath + file;
       logTrace(filePath)
        await archiveFile(filePath);
    }
}

module.exports = {
    archiveFile,
    archiveFolder
}