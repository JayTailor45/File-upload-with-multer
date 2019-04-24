const express = require('express')
const multer = require('multer')
const ejs = require('ejs')
const path = require('path')

const PORT = 3030;
// Setup Storage engine
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req,file,cb) => {
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
}); 

// Initialize Image Upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb)
    }
}).single('myImage');

// Check files type
function checkFileType(file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;
    // Check extension
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
    // Check MIME type
    const mimeType = fileTypes.test(file.mimetype)

    if (mimeType && extname) {
        cb(null, true)
    } else {
        cb('Error : Images only')
    }
}

// Initialize 
const app = express();

// EJS
app.set('view engine','ejs')

// Public folder
app.use(express.static('./public'))

app.get('/', (req, res) => res.render('index'))

app.post('/upload', (req,res) => {
    upload(req,res, (err) => {
        if(err) {
            res.render('index',{
                msg: err
            })
        } else {
            console.log(req.file);
            res.send('test')
        }
    })
})

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))