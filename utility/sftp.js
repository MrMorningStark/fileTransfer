let Client = require('ssh2-sftp-client');
const { errLogs,logTrace } = require("./logs");

const sftp = new Client();

const uploadToSftp = async (srcFilePath, dstFilePath) => {
    try {
        await sftp.connect({
            host: process.env.SFTP1_HOST,
            username: process.env.SFTP1_USER,
            password: process.env.SFTP1_PASSWORD,
            port: process.env.SFTP1_PORT
        });
        // Use createReadStream to read the local file as a stream
        const readStream = createReadStream(srcFilePath);

        // Upload the stream to the SFTP server
        await sftp.put(readStream, dstFilePath);

       logTrace('File transferred successfully to SFTP server');
        sftp.end()
    }
    catch (error) {
        errLogs('Error copying or moving file:', error.message);
    }
}

const downloadFromSftp = async (srcFilePath, dstFilePath) => {
    try {
        await sftp.connect({
            host: process.env.SFTP1_HOST,
            username: process.env.SFTP1_USER,
            password: process.env.SFTP1_PASSWORD,
            port: process.env.SFTP1_PORT
        });
       logTrace(`Transferring file ${srcFilePath} from SFTP server...`);
        const writeStream = fs.createWriteStream(dstFilePath);
        await sftp.get(srcFilePath, writeStream);
       logTrace('File transferred successfully from SFTP server');
        sftp.end();
    }
    catch (error) {
        errLogs('Error copying or moving file:', error.message);
    }
}

module.exports = {
    uploadToSftp,
    downloadFromSftp
}