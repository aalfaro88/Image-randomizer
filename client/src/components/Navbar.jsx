import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";

function Navbar() {
  const { user, logOutUser } = useContext(AuthContext);

  const getToken = () => {
    return localStorage.getItem("authToken");
  };

  return (
    <nav>
      <Link to="/">
        <button>Home</button>
      </Link>

      {getToken() ? (
        <>
          <Link to="/projects"> {/* Add the link to the projects page */}
            <button>Projects</button>
          </Link>
          <button onClick={logOutUser}>Logout</button>
          <span>{user && user.username}</span>
        </>
      ) : (
        <>
          <Link to="/signup">
            <button>Sign Up</button>
          </Link>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
