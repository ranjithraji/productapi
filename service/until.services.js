const { to } = require('await-to-js');

module.exports.to = async (promise) => {
    let err, res;
    [err, res] = await to(promise);
    if (err) return [err];
    return [null, res];
};

module.exports.ReE = function (res, err, code) { // Error Web Response
    if (typeof err == 'object' && typeof err.message != 'undefined') {
        err = err.message;
    }

    if (typeof code !== 'undefined') res.statusCode = code;

    return res.json({ success: false, error: err });
};

module.exports.ReS = function (res, data, code) { // Success Web Response
    let send_data = { success: true };

    if (typeof data == 'object') {
        send_data = Object.assign(data, send_data);//merge the objects
    }

    if (typeof code !== 'undefined') res.statusCode = code;

    return res.json(send_data)
};

module.exports.TE = function (err_message, log) { // TE stands for Throw Error
    if (log === true) {
        console.error(err_message);
    }

    throw new Error(err_message);
};

function isNull(field) {
    return field === undefined || field === 'null' || field === 'undefined' || field === '' || field === null;
}

module.exports.isNull = isNull

function getFileExtension(filename) {
    // get file extension
    const extension = filename.substring(filename.lastIndexOf('.') + 1, filename.length);
    return extension;
}

module.exports.getFileExtension = getFileExtension;

function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
};

module.exports.isObject = isObject;

function isEmpty(obj) {
    return !Object.keys(obj).length > 0;
}
module.exports.isEmpty = isEmpty;

module.exports.firstLatterCap = (char) => {

    let str = String(char), str1
    if (!isNull(str)) {
        str1 = str.charAt(0).toUpperCase() + str.slice(1);
    }
    return str1;
}