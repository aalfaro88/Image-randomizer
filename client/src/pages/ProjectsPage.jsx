// src/pages/ProjectsPage.js

import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { get, del, put } from "../services/authService";
import { AuthContext } from "../context/auth.context";

function ProjectsPage() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (user) {
      get(`/projects?creator=${user._id}`)
        .then((response) => {
          setProjects(response.data);
        })
        .catch((error) => {
          console.error("Error fetching projects:", error);
        });
    }
  }, [user]);

  const handleRename = (projectId, currentName) => {
    const newName = prompt("Enter the new name:", currentName);
    if (!newName) return; 

    const updatedProject = {
      name: newName,
    };

    put(`/projects/${projectId}`, updatedProject)
      .then((response) => {
        setProjects((prevProjects) =>
          prevProjects.map((project) =>
            project._id === projectId ? { ...project, name: newName } : project
          )
        );
      })
      .catch((error) => {
        console.error("Error renaming project:", error);
      });
  };

  const handleDelete = (projectId) => {
    del(`/projects/${projectId}`)
      .then(() => {
        setProjects((prevProjects) =>
          prevProjects.filter((project) => project._id !== projectId)
        );
      })
      .catch((error) => {
        console.error("Error deleting project:", error);
      });
  };

  return (
    <div>
      <h1>My Projects</h1>
      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project._id}>
              <Link to={`/projects/${project._id}`}>{project.name}</Link>
              <button onClick={() => handleRename(project._id, project.name)}>
                Rename
              </button>
              <button onClick={() => handleDelete(project._id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectsPage;
