// server/models/Layer.js

const mongoose = require('mongoose');

const layerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Layer = mongoose.model('Layer', layerSchema);

module.exports = Layer;
