const fs = require("fs");
const path = require("path");
const { getDir } = require("./fileHelper");



const logTrace = (message) => {
    let dir = path.join(__dirname, '../', 'logs');
    // file name with date dd_mm_yyyy
    const logFilePath = path.join(getDir(dir), 'log_' + new Date().getDate() + '_' + (new Date().getMonth() + 1) + '_' + new Date().getFullYear() + '.txt');
    fs.appendFileSync(logFilePath, `${new Date().toLocaleString()} - ${message}\n`, 'utf8');
    deleteOldLogFiles();
    return;
}

const errLogs = (message) => {

    let dir = path.join(__dirname, '../', 'logs');
    const errLogFilePath = path.join(getDir(dir), 'errLog_' + new Date().getDate() + '_' + (new Date().getMonth() + 1) + '_' + new Date().getFullYear() + '.txt');
    fs.appendFileSync(errLogFilePath, `${new Date().toLocaleString()} - ${message}\n`, 'utf8');
    deleteOldLogFiles();
    return;
}

const deleteOldLogFiles = () => {
    const logDir = path.join(__dirname, '../', 'logs');
    const logPeriod = process.env.LOG_PERIOD;
    const currentDate = new Date();
    const files = fs.readdirSync(logDir);

    files.forEach((file) => {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = Math.ceil((currentDate - stats.mtime) / (1000 * 60 * 60 * 24));

        if (fileAge > logPeriod) {
            fs.unlinkSync(filePath);
            console.log(`Deleted log file: ${file}`);
        }
    });
};

module.exports = {
    logTrace,
    errLogs
}
