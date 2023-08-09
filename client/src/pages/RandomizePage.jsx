// pages/RandomizePage.jsx
import React, { useEffect, useState } from "react";
import JSZip from "jszip";
import { useLocation, Link } from "react-router-dom";
import { get, post } from "../services/authService";

function RandomizePage() {
  const [project, setProject] = useState({ id: "", layers: [] });
  const [collectionSize, setCollectionSize] = useState(3); // Default collection size
  const [transformedImages, setTransformedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get("projectId");
  

  useEffect(() => {
    if (projectId) {
      get(`/projects/${projectId}`)
        .then((response) => {
          const projectDetails = {
            id: response.data._id,
            name: response.data.name, // Fetch project name from the API response
            layers: response.data.layers.map((layer) => ({
              layerId: layer._id,
              name: layer.name,
              images: layer.images,
            })),
          };
  
          console.log("Fetched project details:", projectDetails);
  
          setProject(projectDetails);
        })
        .catch((error) => {
          console.error("Error fetching project:", error);
        });
    }
  }, [projectId]);
  

  const handleRandomize = () => {
    setIsLoading(true); 
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
    })
    .finally(() => {
      setIsLoading(false); // Turn off loading spinner when done
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
      <div className="randomize-header">
      <h1>{project.name}</h1>
      <div className="random-selection">
        <label className="collection-label">
          Collection size:
          <div className="input-container">
          <input
            type="number"
            value={collectionSize}
            onChange={(e) => setCollectionSize(Math.max(1, parseInt(e.target.value)))}
            min={1}
            step={1}
            className="collection-input"
          />
          </div>
        </label>
        <button className="randomize-button" onClick={handleRandomize}>Randomize</button>
        </div>
      </div>

          <div className="randomize-container">
            <div className="summary-section">
              <Link to={`/projects/${projectId}`} className="back-link">Go Back</Link>
              <h1>Summary</h1>
              {project.layers.length > 0 && (
                <p className="layer-name-num">Number of Layers: {project.layers.length}</p>
                )}
              {project.layers.map((layer, idx) => (
                <div key={idx} className="layer-summary">
                <p className="layer-name">{layer.name}:</p>
                <p className="num-images">{layer.images.length} images</p>
                </div>
              ))}
            </div>
            <div className="imagesAndDownload">
            {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p className="do-not-refresh">Do not refresh...</p>
          </div>
        )}
        <div className="layer-images-random">
          {transformedImages.map((imageUrl, idx) => (
            <div key={idx} className="image-wrapper">
              <img
                src={imageUrl}
                alt={`Transformed ${idx + 1}`}
                className="transformed-image"
              />
            </div>
          ))}
        </div>
        <button
          className={`randomize-button ${transformedImages.length === 0 ? 'disabled-button' : ''}`}
          onClick={handleDownloadAll}
          disabled={transformedImages.length === 0}
        >
          Download All
        </button>
      </div>
    </div>
  </div>
);
}

export default RandomizePage;
