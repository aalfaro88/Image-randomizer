// pages/projectPage

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { get, post, uploadImage } from "../services/authService";
// import { SERVER_URL } from "../services/SERVER_URL";

function ProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [newLayerName, setNewLayerName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [layerImages, setLayerImages] = useState({}); 
  const [filesArray, setFilesArray] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    console.log("Selected Files:", files);
    setFilesArray(files);
  };

  const handleCheckButton = (layerId) => {
    console.log("Layer ID:", layerId);
  };

  useEffect(() => {
    get(`/projects/${projectId}`)
      .then((response) => {
        setProject(response.data);
        fetchImagesForLayers(response.data.layers);
        console.log("response.data.layers:",response.data.layers)
      })
      .catch((error) => {
        console.error("Error fetching project:", error);
      });
  }, [projectId]);

  const fetchImagesForLayers = async (layers) => {
    const imagesMap = {};


    await Promise.all(
      layers.map(async (layer) => {
        try {
          const imagesResponse = await get(`/images/${projectId}/${layer._id}`);
          const images = imagesResponse.data;
          imagesMap[layer._id] = images; 
        } catch (error) {
          console.error("Error fetching images:", error);
        }
      })
    );

    console.log("Layer Images:", imagesMap); 
    setLayerImages(imagesMap); 
  };

  useEffect(() => {
    if (project && project.layers.length > 0) {
      const newlyAddedLayerName = project.layers[project.layers.length - 1]._id;
      console.log("Newly added layer name:", newlyAddedLayerName);
    }
  }, [project]);

  if (!project) {
    return <div>Loading...</div>;
  }

  const handleAddLayer = () => {
    const newLayer = {
      name: newLayerName.trim() || `Layer ${project.layers.length + 1}`,
      images: [],
    };

    post(`/projects/${projectId}/layers`, newLayer)
      .then((response) => {
        setProject((prevProject) => ({
          ...prevProject,
          layers: [...prevProject.layers, response.data],
        }));
        setNewLayerName("");

        // Log the newly added layer ID directly without using state
        console.log("Newly added layer ID:", response.data._id);
      })
      .catch((error) => {
        console.error("Error adding layer:", error);
      });
  };

  const handleImageUpload = async (layerId) => {
    if (filesArray.length === 0) {
      console.error("No files selected.");
      return;
    }
  
    try {
      console.log("Files Array:", filesArray); 
  
      const imageIds = await Promise.all(
        filesArray.map((file) => uploadImage(file, projectId, layerId))
      );
  
      const updatedProject = {
        ...project,
        layers: project.layers.map((layer) =>
          layer._id === layerId
            ? {
                ...layer,
                images: [...layer.images, ...imageIds],
              }
            : layer
        ),
      };
  
      setProject(updatedProject);
      setFilesArray([]);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };
  

  return (
    <div>
      <h2>{project.name}</h2>

      <input
        type="text"
        value={newLayerName}
        onChange={(e) => setNewLayerName(e.target.value)}
        placeholder="Layer Name"
      />
      <button onClick={handleAddLayer}>Add New Layer</button>

      {project.layers.map((layer, index) => (
        <div key={index}>
          <h3>{layer.name}</h3>
          {layerImages[layer._id] && layerImages[layer._id].length > 0 ? (
            <div>
              {/* {layerImages[layer._id].map((image, imageIndex) => {
                console.log("Image URL:", image.url); // Add this line to log the URL
                return (
                  <img
                    key={imageIndex}
                    src={image.url} // Assuming the response object has a 'url' property
                    alt={`Image ${imageIndex}`}
                  /> */}
                {/* );
              })} */}
            </div>
          ) : (
            <p>No images in this layer.</p>
          )}

      <input type="file" onChange={handleFileChange} multiple />
      <button onClick={() => handleImageUpload(layer._id)}>Upload Images</button>
      <button onClick={() => handleCheckButton(layer._id)}>Check</button>
        </div>
      ))}
    </div>
  );
}

export default ProjectPage;

