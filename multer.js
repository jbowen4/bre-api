const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const config = require('config');
var path = require('path');

aws.config.update({
    secretAccessKey: config.get('AWS_SECRET_ACCESS'),
    accessKeyId: config.get('AWS_ACCESS_KEY'),
    region: 'us-east-1'
});

const s3 = new aws.S3();

// Set The Storage Engine
// const storage = multer.diskStorage({
//     destination: 'uploads/',
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

// Init Upload
const upload = multer({
    storage: multerS3({
        s3,
        bucket: 'black-real-estate',
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    }),
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('photo');

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

module.exports = upload;