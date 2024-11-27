const multer = require("multer");
const path = require("path");

// Common storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

// Single file upload (e.g., for user profile images)
const singleUpload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Allow specific file types
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"));
        }
    },
}).single("image");

// Dynamic fields upload (e.g., for room features)
const anyUpload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Allow specific file types
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"));
        }
    },
}).any();

module.exports = {
    singleUpload,
    anyUpload,
};
