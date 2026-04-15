//Imports
const multer = require('multer');

//Almacena la imagen en local hasta la inserccion la base de datos o al recuperarla
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;