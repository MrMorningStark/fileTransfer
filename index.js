const fs = require('fs');
const { locationTypes } = require('./enumeration');

const { errLogs, logTrace } = require('./utility/logs');
const { archiveFolder } = require('./utility/archiver');
const { downloadFromSftp } = require('./utility/sftp');
const { uploadToFtp, downloadFromFtp } = require('./utility/ftp');
const { uploadFolderToDrive } = require('./utility/googleDrive');
const { copyFolder } = require('./utility/fileHelper');
const { start } = require('repl');
var cron = require('node-cron');


require('dotenv').config();

const fromLocal = async () => {
    var sourceFolder = process.env.SRC_FOLDER_PATH;
    var destinationFolder = process.env.DST_FOLDER_PATH;
    let tempFolder = process.cwd() + '\\temp\\';
    if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
    }
    await copyFolder(sourceFolder, tempFolder);
    await archiveFolder(tempFolder);
    await upload(tempFolder, destinationFolder);
}

const fromSftp = async () => {
    var sourceFolder = process.env.SRC_FOLDER_PATH;
    var destinationFolder = process.env.DST_FOLDER_PATH;
    let tempFolder = parseInt(process.env.DST_LOCATION_TYPE) === locationTypes.LOCAL_FOLDER ? destinationFolder : process.cwd() + '\\temp\\';
    if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
    }

    await downloadFromSftp(sourceFolder, tempFolder);
    await archiveFolder(tempFolder);
    await upload(tempFolder, destinationFolder);
}

const fromFtp = async () => {
    var sourceFolder = process.env.SRC_FOLDER_PATH;
    var destinationFolder = process.env.DST_FOLDER_PATH;
    let tempFolder = process.cwd() + '\\temp\\';
    if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
    }
    await downloadFromFtp(sourceFolder, tempFolder);
    await archiveFolder(tempFolder);
    await upload(tempFolder, destinationFolder);
}

const upload = async (srcFolder, dstFolder) => {
    switch (parseInt(process.env.DST_LOCATION_TYPE)) {
        case locationTypes.LOCAL_FOLDER:
            await copyFolder(srcFolder, dstFolder);
            break;
        case locationTypes.FTP:
            await uploadToFtp(srcFolder, dstFolder);
            break;
        case locationTypes.GOOGLE_DRIVE:
            await uploadFolderToDrive(srcFolder);
            break;
        default:
            errLogs('need to implement more source types or invalid source type specified');
            logTrace('need to implement more source types or invalid source type specified');
            break;

    }
}

async function transferFile() {
    switch (parseInt(process.env.SRC_LOCATION_TYPE)) {
        case locationTypes.LOCAL_FOLDER:
            await fromLocal();
            break;
        case locationTypes.FTP:
            await fromFtp();
            break;
        case locationTypes.SFTP:
            await fromSftp();
            break;
        case locationTypes.GOOGLE_DRIVE:
            await fromGoogleDrive();
            break;
        // Add more source location types as needed

        default:
            errLogs('Invalid source location type specified in .env file.');
            console.error('Invalid source location type specified in .env file.');
            return;
    }
    // delete the temp folder
    let tempFolder = process.cwd() + '\\temp\\';
    fs.rmSync(tempFolder, { recursive: true, force: true });
    logTrace('temp folder deleted');
}

cron.schedule(process.env.CRON_START_TIME ?? '0 1 * * *', async () => {
    console.log('Job Started ' + new Date().toLocaleString());
    await transferFile();
    console.log('Job completed ' + new Date().toLocaleString());
});



(async () => {
    await transferFile();
    startJob();
})();
