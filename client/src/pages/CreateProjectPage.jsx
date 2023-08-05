// pages/CreateProjectPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../services/authService";

function CreateProjectPage() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");

  const handleCreateProject = () => {
    post("/projects", { name: projectName })
      .then((response) => {
        const projectId = response.data._id;
        navigate(`/projects/${projectId}`);
      })
      .catch((error) => {
        console.error("Error creating project:", error);
      });
  };

  return (
    <div>
      <h2>Create a New Project</h2>
      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <button onClick={handleCreateProject}>Create</button>
    </div>
  );
}

export default CreateProjectPage;
