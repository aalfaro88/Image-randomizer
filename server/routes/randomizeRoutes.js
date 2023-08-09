// /routes/randomizeRoutes.js


const express = require("express");
const router = express.Router();
const { createCanvas, loadImage } = require("canvas");

router.post("/overlay-images", async (req, res) => {
  try {
    const imageUrls = req.body.imageUrls;
    const numImages = req.body.numImages;
    const resultImageUrls = [];

    for (let imageCount = 0; imageCount < numImages; imageCount++) {
      const canvas = createCanvas();
      const context = canvas.getContext("2d");

      const baseImageIndex = Math.floor(Math.random() * imageUrls[0].length);
      const baseImageUrl = imageUrls[0][baseImageIndex];
      const baseImage = await loadImage(baseImageUrl);

      canvas.width = baseImage.width;
      canvas.height = baseImage.height;

      context.drawImage(baseImage, 0, 0);

      for (let i = 1; i < imageUrls.length; i++) {
        const overlayImageIndex = Math.floor(Math.random() * imageUrls[i].length);
        const overlayImageUrl = imageUrls[i][overlayImageIndex];
        const overlayImage = await loadImage(overlayImageUrl);
        context.drawImage(overlayImage, 0, 0, overlayImage.width, overlayImage.height);
      }

      const resultImageUrl = canvas.toDataURL();
      resultImageUrls.push(resultImageUrl);
    }

    res.status(200).json({ success: true, imageUrls: resultImageUrls });
  } catch (error) {
    console.error("Error handling image URLs:", error);
    res.status(500).json({ msg: "Failed to handle image URLs." });
  }
});

module.exports = router;

