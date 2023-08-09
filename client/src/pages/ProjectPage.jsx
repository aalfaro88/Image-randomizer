// pages/projectPage

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { get, post, uploadImage } from "../services/authService";


function ProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [newLayerName, setNewLayerName] = useState("");
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


  const fetchImagesForLayers = async (layers) => {
    const newLayerImages = {};
  
    await Promise.all(
      layers.map(async (layer) => {
        try {
          const response = await get(`/projects/${projectId}/layers/${layer._id}/images`);
          newLayerImages[layer._id] = response.data.images; 
        } catch (error) {
          console.error("Error fetching images for layer:", layer._id, error);
        }
      })
    );
  
    setLayerImages(newLayerImages);
  };
  

  useEffect(() => {
    get(`/projects/${projectId}`)
      .then((response) => {
        setProject(response.data);
        fetchImagesForLayers(response.data.layers);
      })
      .catch((error) => {
        console.error("Error fetching project:", error);
      });
  }, [projectId]);

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

      const names = filesArray.map((file) => file.name);
  
      post(`/projects/${projectId}/layers/${layerId}/images`, { names })
        .then((response) => {
          console.log("Image names added to MongoDB:", response.data);
        })
        .catch((error) => {
          console.error("Error adding image names to MongoDB:", error);
        });
  
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
      <Link to={`/randomize?projectId=${projectId}`}>
        <button>Ready to Randomize</button>
      </Link>


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
              <p>Number of images: {layerImages[layer._id].length}</p>
              {layerImages[layer._id].map((imageName, idx) => (
                <img
                  key={idx}
                  src={`https://res.cloudinary.com/dtksvajmx/image/upload/v1691356199/Image-randomizer/${project._id}/${layer._id}/${imageName}`}
                  alt={imageName}
                  style={{ width: "100px" }} 
                />
              ))}
            </div>
          ) : (
            <div>
              <p>No images in this layer.</p>
            </div>
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

