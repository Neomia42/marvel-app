import { Link } from "react-router-dom";
import Cookie from "js-cookie";
//import img
import logoMarvel from "../../assets/img/8ee9c1e8083ebe9babe7208c1f46daca.png";
//Import CSS
import "./Header.css";
const Header = ({ isConnected, setIsConnected, onSearch = () => {} }) => {
  const handleInputChange = (event) => {
    // console.log("Input changé:", event.target.value);
    onSearch(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  return (
    <header className="app-header fade-in">
      {isConnected ? (
        <div className="top-header">
          <div className="bloc-img">
            <Link to="/">
              <img src={logoMarvel} alt="logo marvel" />
            </Link>
            <h1 className="app-header-title accent-text">
              ://ARCHIVE_S.H.I.E.L.D.
            </h1>
          </div>
          <nav className="app-header-nav">
            <Link to="/operations">// OPÉRATIONS</Link>

            <a
              className="logout-btn"
              onClick={() => {
                Cookie.remove("token");
                localStorage.removeItem("userId");
                setIsConnected(false);
              }}
            >
              // DÉCONNEXION AGENT
            </a>

            <Link to="/favorites">// WATCHLIST</Link>
          </nav>
        </div>
      ) : (
        <div className="top-header">
          <div className="bloc-img">
            <Link to="/">
              <img src={logoMarvel} alt="logo marvel" />
            </Link>
            <h1 className="app-header-title accent-text">
              ://ARCHIVE_S.H.I.E.L.D.
            </h1>
          </div>
          <nav className="app-header-nav">
            <Link to="/operations">// OPÉRATIONS</Link>
            <Link to="/signup">// RECRUTEMENT</Link>
            <Link to="/login">ACCÈS AGENT</Link>
          </nav>
        </div>
      )}

      {/* Barre de recherche */}
      <div
        className="search-section fade-in"
        style={{ animationDelay: "100ms" }}
      >
        <div className="search-wrapper">
          <span className="search-prompt accent-text">&gt;</span>
          <input
            type="text"
            placeholder="Entrez nom, alias, ou mot-clé(s) séparé(s) par une virgule"
            className="search-input-field"
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </header>
  );
};
export default Header;
