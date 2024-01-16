const fs = require("fs");
var crypto = require("crypto");

const algorithm = 'aes-256-ctr'
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = new Buffer('0102030405060708', 'binary');

const encrypt = (path,filename) => {
  // read binary data from file
  const bitmap = fs.readFileSync(path+filename);

  // convert the binary data to base64 encoded string
  let text = bitmap.toString("base64");

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  fs.writeFileSync(path+String(filename).replace('.mp4','.txt'), encrypted);

  return {
    iv: iv.toString('hex')
  }
}

const decrypt = (path, file, output,hash) => {

  let data = fs.readFileSync(path + file);
  
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv)

  const decrpyted = Buffer.concat([decipher.update(Buffer.from(data, 'hex')), decipher.final()])

  fs.writeFileSync(path+output,decrpyted.toString(),'base64');
}

module.exports = {
  encrypt,
  decrypt
}