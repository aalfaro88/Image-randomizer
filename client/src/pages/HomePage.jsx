// pages/HomePage.jsx

import { Link } from "react-router-dom";

const HomePage = () => {
  const isLoggedIn = !!localStorage.getItem("authToken");

  return (
    <div>
      <h1>Image Randomizer</h1>
      <Link to={isLoggedIn ? "/create-project" : "/login"}>
        <button>Get Started</button>
      </Link>
    </div>
  );
};

export default HomePage;
