// pages/RandomizePage.jsx
import React, { useEffect, useState } from "react";
import JSZip from "jszip";
import { useLocation } from "react-router-dom";
import { get, post } from "../services/authService";

function RandomizePage() {
  const [project, setProject] = useState({ id: "", layers: [] });
  const [collectionSize, setCollectionSize] = useState(3); // Default collection size
  const [transformedImages, setTransformedImages] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get("projectId");

  useEffect(() => {
    if (projectId) {
      get(`/projects/${projectId}`)
        .then((response) => {
          const layers = response.data.layers.map((layer) => ({
            layerId: layer._id,
            images: layer.images,
          }));

          setProject({ id: projectId, layers });
        })
        .catch((error) => {
          console.error("Error fetching project:", error);
        });
    }
  }, [projectId]);

  const handleRandomize = () => {
    const overlayImages = project.layers;
    
    const imageUrls = overlayImages.map((layer) => {
      const layerId = layer.layerId;
      const images = layer.images.map((image) => {
        return `https://res.cloudinary.com/dtksvajmx/image/upload/v1691356199/Image-randomizer/${projectId}/${layerId}/${image}`;
      });
      return images;
    });
    
    console.log("Image URLs to be sent to the server:", imageUrls);
 
    const numImages = collectionSize; 
    
    post("/overlay-images", { imageUrls, numImages }) 
      .then((response) => {
        setTransformedImages(response.data.imageUrls); 
      })
      .catch((error) => {
        console.error("Error sending image URLs to the server:", error);
      });
  };
  
  const handleDownloadAll = async () => {
    try {
      const zip = new JSZip();


      transformedImages.forEach((imageUrl, idx) => {
        const imageName = `${idx + 1}.png`;

        zip.file(`projectName/${imageName}`, fetch(imageUrl).then((response) => response.blob()));
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = "projectImages.zip";
      downloadLink.click();

    } catch (error) {
      console.error("Error generating ZIP file:", error);
    }
  };
  

  return (
    <div>
      <h1>{project.name}</h1>
      {project.layers.length > 0 && (
        <h2>Number of Layers: {project.layers.length}</h2>
      )}
      {project.layers.map((layer, idx) => (
        <div key={idx}>
          <h3>{layer.name}</h3>
          <ul>
            {layer.images.map((imageName, idx) => (
              <li key={idx}>{imageName}</li>
            ))}
          </ul>
        </div>
      ))}
      <label>
        Collection size:
        <input
          type="number"
          value={collectionSize}
          onChange={(e) => setCollectionSize(Math.max(1, parseInt(e.target.value)))}
          min={1}
          step={1}
        />
      </label>
      <button onClick={handleRandomize}>Randomize</button>
      <button onClick={handleDownloadAll}>Download All</button>
      {transformedImages.map((imageUrl, idx) => (
        <img
          key={idx}
          src={imageUrl}
          alt={`Transformed ${idx + 1}`}
          style={{ width: '150px', height: 'auto' }}
        />
      ))}
    </div>
  );
}

export default RandomizePage;
