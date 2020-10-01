const express = require("express");

const bodyParser = require("body-parser");

const fs = require("fs");

const { exec } = require("child_process");

const path = require("path");

var format;

var outputFilePath;

const multer = require("multer");

var dir = "public";
var subDirectory = "public/uploads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);

  fs.mkdirSync(subDirectory);
}

const app = express();

app.set('view engine','ejs')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))

const PORT = process.env.PORT || 4000;

app.use(express.static("public"));


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });
  
  const videoFilter = function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (
      ext !== ".mp4" &&
      ext !== ".avi" &&
      ext !== ".flv" &&
      ext !== ".wmv" &&
      ext !== ".mov" &&
      ext !== ".mkv" &&
      ext !== ".gif" &&
      ext !== ".m4v"
    ) {
      return callback("This Extension is not supported");
    }
    callback(null, true);
  };

  
var maxSize = 200 * 1024 * 1024

var videotomp3upload = multer({ storage: storage,limits:{fileSize:maxSize},fileFilter: videoFilter });

app.get('/privacypolicy',(req,res) => {
    res.render('privacypolicy',{title:"Official Privacy Policy Page - MuteVideo.com"})
})

app.get('/contactus',(req,res) => {
    res.render('contactus',{title:"Official Contact Us Page - MuteVideo.com"})
})

app.get("/", (req, res) => {
    res.render("mutevideo",{title:"Mute Sound From Video Online For Free 2020"});
});

app.post(
    "/mutevideo",
    videotomp3upload.single("file"),
    (req, res) => {
      if (req.file) {
        console.log(req.file.path);
  
        outputFilePath =
          Date.now() + "output." + path.extname(req.file.originalname);
  
        exec(
          `ffmpeg -i ${req.file.path} -preset ultrafast -c copy -an ${outputFilePath}`,
          (err, stderr, stdout) => {
            if (err) {
              fs.unlinkSync(req.file.path);
              res.send("Some error occured during conversion Please try Again");
            }
            console.log("video converted");
            res.download(outputFilePath, (err) => {
              if (err) {
                fs.unlinkSync(req.file.path);
                fs.unlinkSync(outputFilePath);
                res.send("Server is unable to download the file");
              }
  
              fs.unlinkSync(req.file.path);
              fs.unlinkSync(outputFilePath);
            });
          }
        );
      }
    }
  );
  

app.listen(PORT, () => {
    console.log(`App is listening on Port ${PORT}`);
});