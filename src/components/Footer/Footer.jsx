//Import CSS
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-section">
          <h4>Marvel App</h4>
          <p>Explorez l'univers Marvel avec notre application interactive.</p>
        </div>

        <div className="footer-section">
          <h4>Liens utiles</h4>
          <ul>
            <li>
              <a href="/characters">Personnages</a>
            </li>
            <li>
              <a href="/comics">Comics</a>
            </li>
            <li>
              <a href="/favorites">Favoris</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Développement</h4>
          <p className="developed-with">
            Développé avec{" "}
            <a
              href="https://fr.react.dev/"
              target="_blank"
              rel="noopener noreferrer"
            >
              React
            </a>{" "}
            à{" "}
            <a
              href="https://www.lereacteur.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Le Reacteur
            </a>
          </p>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <a
            href="https://github.com/Neomia42"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
          >
            GitHub - Neomia42
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Marvel App. Tous droits réservés.</p>
        <p className="disclaimer">
          Les données Marvel sont utilisées avec l'autorisation de Marvel. ©
          Marvel
        </p>
      </div>
    </footer>
  );
};

export default Footer;
