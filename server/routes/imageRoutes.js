//imageRoutes.js

const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const uploadImg = require("../cloudinary.config");
const isAuthenticated = require('../middleware/isAuthenticated');


const maxImageCount = 20;

router.post("/upload-image/:projectId/:layerId", uploadImg.array("picture", maxImageCount), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(500).json({ msg: "Upload fail. No files received." });
  }


  const urls = req.files.map((file) => file.path);
  return res.status(201).json({ urls });
});


router.post('/projects/:projectId/:layerId/images', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body; // Only extract name from the request body
    const layerId = req.params.layerId;

    const newImage = new Image({
      name,
      alt: name, // Set alt to the same value as name
    });

    await newImage.save();

    const layerToUpdate = await Layer.findById(layerId);
    if (!layerToUpdate) {
      return res.status(404).json({ msg: 'Layer not found.' });
    }

    layerToUpdate.images.push(newImage);
    console.log('Layer To Update:', layerToUpdate.images.push(newImage));

    await layerToUpdate.save();

    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ msg: 'Failed to save image.' });
  }
});


// Handle serving the images from Cloudinary
router.get('/images/:projectId/:layerId', async (req, res) => {
  try {
    const { projectId, layerId } = req.params;
    const images = await Image.find({ project: projectId, layer: layerId });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch images.', error });
  }
});

router.put('/images/:imageId', async (req, res) => {
  try {
    const { name } = req.body;
    const { imageId } = req.params;
    const image = await Image.findByIdAndUpdate(imageId, { name }, { new: true });
    if (!image) {
      return res.status(404).json({ message: 'Image not found.' });
    }
    res.json(image);
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ message: 'Failed to update image.', error });
  }
});

router.delete('/images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const image = await Image.findByIdAndDelete(imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(image.cloudinaryId);

    res.json({ message: 'Image deleted successfully.' });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: 'Failed to delete image.', error });
  }
});

module.exports = router;
