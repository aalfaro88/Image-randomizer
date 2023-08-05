//imageRoutes.js

const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const uploadImg = require("../cloudinary.config");

router.post("/upload-image/:projectId/:layerId", uploadImg.single("picture"), (req, res) => {
  console.log("This is req.body:", req.body);
  if (!req.file) {
    return res.status(500).json({ msg: "Upload fail." });
  }

  return res.status(201).json({ url: req.file.path });
});

router.get("/images/:projectId/:layerId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const layerId = req.params.layerId;

    const images = await Image.find({ projectId, layerId });

    res.json(images); 
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images." });
  }
});


module.exports = router;
