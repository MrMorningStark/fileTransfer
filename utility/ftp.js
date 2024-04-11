const fs = require("fs");
const ftp = require("basic-ftp");
const { errLogs, logTrace } = require("./logs");

const client = new ftp.Client();

const uploadToFtp = async (srcFilePath, dstFilePath) => {
    try {
       logTrace(`Transferring file ${srcFilePath} to FTP server...`);
        await client.access({
            host: process.env.SFTP1_HOST,
            user: process.env.SFTP1_USER,
            password: process.env.SFTP1_PASSWORD,
            port: process.env.SFTP1_PORT,
            secure: false,
        });
       logTrace(`Transferring file ${srcFilePath} to FTP server...`);

        // Use createReadStream to read the local file as a stream
        const readStream = createReadStream(srcFilePath);

        // Upload the stream to the FTP server
        await client.uploadFrom(readStream, dstFilePath);
        client.trackProgress((info) => {
           logTrace(info.bytesOverall + ' bytes transferred');
        })

       logTrace('File transferred successfully to FTP server');
        client.close();
    }
    catch (error) {
        errLogs('Error copying or moving file:', error.message);
       logTrace('Error copying or moving file:', error.message);
    }
}

const downloadFromFtp = async (srcFolder, dstFolder) => {
    try {
       logTrace(`Transferring files from ${srcFolder} to ${dstFolder} on FTP server...`);
        await client.access({
            host: process.env.SFTP1_HOST,
            user: process.env.SFTP1_USER,
            password: process.env.SFTP1_PASSWORD,
            port: process.env.SFTP1_PORT,
            secure: false,
        });
       logTrace('connected')
        await client.ensureDir(srcFolder);
        const files = await client.list();
        for (const file of files) {
            if (file.type === 'd') {
               logTrace(`Skipping folder ${file}`);
                continue;
            }
            // download only those files which are not updated or modifiend in last 24 hours
            // add space befare am or pm date
            let rawModifiedAt = file.rawModifiedAt.replace('AM', ' AM').replace('PM', ' PM');
            const fileModifiedAt = new Date(rawModifiedAt).getTime() - 3600 * 1000;
           logTrace('last modified', fileModifiedAt)
            const canUpadateAfterThisTime = new Date().getTime() - (process.env.LAST_UPDATED ?? 0) * 3600 * 1000;
           logTrace('can update after this time', canUpadateAfterThisTime)
            if (fileModifiedAt < canUpadateAfterThisTime) {
               logTrace(`Transferring file ${file.name} from FTP server...`);
                // create writestream to write the file
                let dstFilePath = dstFolder + '/' + file.name;
                let srcFilePath = srcFolder + '/' + file.name;
                const writeStream = fs.createWriteStream(dstFilePath);
                await client.downloadTo(writeStream, srcFilePath);
            } else {
               logTrace(`Skipping file ${file.name} from FTP server...\nFile is modified or updated in last ${process.env.LAST_UPDATED ?? 24} hours`);
                continue;
            }
        }
        client.close();
       logTrace('Files transferred successfully from FTP server');
    }
    catch (error) {
        errLogs('Error copying or moving file:', error.message);
    }
}

module.exports = {
    uploadToFtp,
    downloadFromFtp
}