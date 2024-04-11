const { google } = require('googleapis');
const fs = require('fs');
const { getFiles } = require('./fileHelper');
const { errLogs, logTrace } = require('./logs');
const path = require('path');
async function uploadToDrive(filePath, fileName) {
    try {
        const auth = await getAuth();
        const drive = google.drive({ version: 'v3', auth: auth });

        const fName = path.basename(fileName);
       logTrace(fName)

        // Check if the destination folder exists, create it if not
        const folderId = process.env.GOOGLE_FOLDER_ID;
        // if (!(await folderExists(drive, folderId))) {
        //    logTrace('Folder does not exist');
        //     return false;
        // } else {
        //     folderId = await createFolderHierarchy(drive, folderId, path.dirname(process.env.DST_FOLDER_PATH));
        // }

        const fileMetadata = {
            name: fName,
            parents: [folderId]
        };

        const media = {
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
        }).then(res => res);

       logTrace("File " + response.data.name + " uploaded to Google Drive");
        return true;
    } catch (err) {
        errLogs(err.message);
        console.error('Error uploading to Google Drive:', err.message);
        return false;
    }
}

async function getAuth() {

    const jwtClient = new google.auth.JWT(
        process.env.GOOGLE_CLIENT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY,
        [process.env.GOOGLE_SCOPE]
    )
    await jwtClient.authorize();
    return jwtClient;
}

const uploadFolderToDrive = async (srcFolder) => {
   logTrace('uploading to drive')
    await deleteAllFiles();
    const files = await getFiles(srcFolder);
    for (const file of files) {
        const filePath = srcFolder + file
        await uploadToDrive(filePath, file);
    }
}

const deleteAllFiles = async () => {
    try {
        const auth = await getAuth();
        const drive = google.drive({ version: 'v3', auth: auth });

        const folderId = process.env.GOOGLE_FOLDER_ID;

        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'nextPageToken, files(id, name)',
        });

        const files = response.data.files;

        if (!files || files.length === 0) {
           logTrace('No files found.');
            return;
        }

        for (const file of files) {
            drive.files.delete({
                fileId: file.id,
            });
        }

    } catch (error) {
        errLogs(error.message);
    }


}

module.exports = {
    uploadToDrive,
    uploadFolderToDrive,
    deleteAllFiles
}