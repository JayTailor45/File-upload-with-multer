const express = require("express");
const multer = require("multer");
const ejs = require("ejs");
const path = require("path");
const Sequelize = require("sequelize");

// Initialize
const app = express();

app.use(express.json());
app.use(express.urlencoded());

// Init connection
const connection = new Sequelize("imgUploadDemo", "root", "", {
  host: "localhost",
  dialect: "mysql",
  port: 3333
});

// Init model
const ImageModel = connection.define("imgs", {
  name: Sequelize.STRING,
  path: Sequelize.STRING
});

const PORT = 3030;
// Setup Storage engine
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

// Initialize Image Upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000
  },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single("myImage");

// Check files type
function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  // Check MIME type
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extname) {
    cb(null, true);
  } else {
    cb("Error : Images only");
  }
}

// EJS
app.set("view engine", "ejs");

// Public folder
app.use(express.static("./public"));

app.get("/", (req, res) => res.render("index"));

app.post("/upload", (req, res) => {
  upload(req, res, err => {
    if (err) {
      res.render("index", {
        msg: err
      });
    } else {

      const imageModel = new ImageModel();
      imageModel.name = req.file.filename;

      // Remove "public/" from path=======
      let filePath = Array.from(req.file.path);
      filePath.splice(0,7);
      imageModel.path = filePath.join('')
      //===================================

      imageModel
        .save()
        .then(imageModel => {
          res.json(imageModel).status(200);
        })
        .catch(err => {
          res.json({ error: JSON.stringify(err) }).status(400);
        });
    }
  });
});

connection
  .sync({
    logging: console.log
    // force: true
  })
  .then(() => {
    console.log("Connection success");
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  })
  .catch(err => {
    console.log("Connection failed", err);
  });
