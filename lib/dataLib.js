const fs = require('fs');

const dataLib = {};

dataLib.basePath = `${__dirname}/../.data`;

// write data
dataLib.create = (dir, fileName, data, callback) => {
    const stringData = JSON.stringify(data);
    fs.open(`${dataLib.basePath}/${dir}/${fileName}.JSON`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            fs.writeFile(fileDescriptor, stringData, (err2) => {
                if (!err2) {
                    fs.close(fileDescriptor);
                    callback(false, data);
                } else {
                    callback("Counldn't write to the file");
                }
            });
        } else {
            callback("File Couldn't be opened");
        }
    });
};

// read data
dataLib.read = (dir, fileName, callback) => {
    // check if file has extension. If not add it
    const fileNameWithExt = fileName.split('.').length > 1 ? fileName : `${fileName}.JSON`;

    fs.readFile(`${dataLib.basePath}/${dir}/${fileNameWithExt}`, 'utf8', (err, data) => {
        if (!err) {
            callback(false, data);
        } else {
            callback('No such file or there was an error');
        }
    });
};

dataLib.update = (dir, fileName, newData, callback) => {
    fs.open(`${dataLib.basePath}/${dir}/${fileName}.JSON`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            fs.ftruncate(fileDescriptor, (err2) => {
                if (!err2) {
                    const stringData = JSON.stringify(newData);
                    fs.writeFile(fileDescriptor, stringData, (err3) => {
                        if (!err3) {
                            fs.close(fileDescriptor);
                            callback(false, newData);
                        } else {
                            callback('Failed to update');
                        }
                    });
                } else {
                    callback('Removing file data failed');
                }
            });
        } else {
            callback('File update failed');
        }
    });
};

// delete existing file
dataLib.remove = (dir, fileName, callback) => {
    fs.unlink(`${dataLib.basePath}/${dir}/${fileName}.JSON`, (err) => {
        if (!err) {
            callback(false, `File ${fileName} was deleted`);
        } else {
            callback('File Deleting failed');
        }
    });
};

dataLib.list = (dir, callback) => {
    fs.readdir(`${dataLib.basePath}/${dir}`, (err, files) => {
        if (!err) {
            callback(false, files);
        } else {
            callback('There was an error');
        }
    });
};
module.exports = dataLib;
