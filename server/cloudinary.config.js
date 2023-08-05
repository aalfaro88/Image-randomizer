// cloudinary.config.js

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    
    const projectId = req.params.projectId;
    const layerId = req.params.layerId;
    const filename = file.originalname.replace(/\.[^/.]+$/, ""); 
   
    console.log("Project ID:", projectId);
    console.log("Layer ID:", layerId);
    console.log("Image Name:", file.originalname);

    const folder = `Image-randomizer/${projectId}/${layerId}`;

    return {
      folder,
      format: "png",
      public_id: filename,
    };
  },
});

const uploadImg = multer({ storage });

module.exports = uploadImg;

