const util = require("util");
const multer = require("multer");
const crypto = require('crypto')
const maxSize = 5 * 1024 * 1024;

let imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb("(...)" + file.originalname.slice(-15) + ". Please upload only images.", false);
    }
  };

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/uploads/");
  },
  filename: (req, file, cb) => {
    const extensaoArquivo = file.originalname.split('.')[1];
    const novoNomeArquivo = crypto
        .randomBytes(64)
        .toString('hex');
    cb(null, novoNomeArquivo+"."+extensaoArquivo);
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: imageFilter
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;