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
        fileSize: 10
    }
}).single('myImage');

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