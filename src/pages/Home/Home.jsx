import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
//import fonction config
import API_URL from "../../config/API_URL";
//import icons
import { FaRegWindowClose } from "react-icons/fa";
import { FaExternalLinkSquareAlt } from "react-icons/fa";
import { FaAngleDoubleRight } from "react-icons/fa";
import { FaAngleDoubleLeft } from "react-icons/fa";
// Import image
import imageIronMan from "../../assets/img/Iron_Man_Infobox.webp";
import imageFavoriteBefore from "../../assets/img/logo-claire-favorite.png";
import imageFavoriteAfter from "../../assets/img/logo-sombre-favorite.png";
// Import CSS
import "./Home.css";
const Home = ({ searchTerm = "", onPageChange, onTotalPagesChange }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [previewCharacter, setPreviewCharacter] = useState(null);
  const [previewComics, setPreviewComics] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentLimit, setCurrentLimit] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  //gestion pagination
  const handlePageChange = async (page, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // console.log(`Changement de page: ${currentPage} → ${page}`);

    // Éviter le rechargement si c'est la même page
    if (page === currentPage) return;

    try {
      setIsPaginating(true);

      // console.log(`Chargement page ${page}`);

      const response = await axios.get(`${API_URL}/characters/?page=${page}`);

      // Mettre à jour les données sans déclencher de rechargement complet
      setData(response.data || []);
      setFilteredData(response.data || []);
      setCurrentPage(page);

      // console.log(`Page ${page} chargée:`, response.data);

      if (onPageChange && page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    } catch (err) {
      console.error("Erreur changement de page:", err);
    } finally {
      setIsPaginating(false);
    }
  };

  const handleTotalPagesChange = (total) => {
    setTotalPages(total);
  };

  // useEffect pour charger les données initiales (seulement une fois)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/characters`);
        setData(response.data || []);
        setFilteredData(response.data || []);
        setTotalCount(response.data?.count || 0);
        setCurrentLimit(response.data?.limit || 100);

        const count = response.data?.count || 0;
        const limitPage = response.data?.limit || 100;
        const calculatedTotalPages = Math.ceil(count / limitPage);
        setTotalPages(calculatedTotalPages);

        if (onTotalPagesChange) {
          onTotalPagesChange(calculatedTotalPages);
        }
        // console.log("Données initiales chargées:", response.data);
      } catch (err) {
        console.error("Erreur chargement initial:", err);
        setError("Une erreur est survenue lors du chargement des données.");
      } finally {
        setIsLoading(false);
      }
    };

    // Charger seulement si on n'a pas encore de données
    if (!data) {
      fetchInitialData();
    }
  }, []); // Pas de dépendances, se charge une seule fois

  // useEffect pour rechercher via l'API
  useEffect(() => {
    // console.log("searchTerm changé:", searchTerm);

    const searchData = async () => {
      if (!searchTerm.trim()) {
        // Si pas de recherche, afficher les données initiales
        setFilteredData(data);
        // Restaurer les valeurs initiales depuis data
        setTotalCount(data?.count || 0);
        setCurrentLimit(data?.limit || 0);
        return;
      }

      try {
        setIsSearching(true);
        // Utiliser le paramètre 'name' de l'API pour chercher dans TOUS les personnages
        const response = await axios.get(
          `${API_URL}/characters/?name=${encodeURIComponent(searchTerm)}`
        );
        console.log("Réponse recherche:", response.data);
        setFilteredData(response.data || []);
        setTotalCount(response.data?.count || 0);
        setCurrentLimit(response.data?.limit || 0);
        // console.log("Résultats de recherche:", response.data);
      } catch (err) {
        console.error("Erreur de recherche:", err);
        // En cas d'erreur, fallback sur filtrage local
        if (data) {
          const filtered = {
            ...data,
            results: data.results.filter((character) =>
              character.name.toLowerCase().includes(searchTerm.toLowerCase())
            ),
          };
          setFilteredData(filtered);
        }
      } finally {
        setIsSearching(false);
      }
    };

    // Délai pour éviter trop de requêtes
    const timeoutId = setTimeout(searchData, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, data]);

  // Quand previewCharacter change, on récupère les comics
  useEffect(() => {
    const fetchComics = async () => {
      if (
        previewCharacter &&
        previewCharacter.comics &&
        previewCharacter.comics.length > 0
      ) {
        try {
          // Récupère les IDs des comics
          const comicIds = previewCharacter.comics.slice(0, 4);
          // console.log("comicIds envoyés au backend:", comicIds);
          // Requête batch pour récupérer les détails des comics, créée specifiquement pour le preview en backend , donne une liste de commics lié au personnage select dans le preview.
          const response = await axios.post(`${API_URL}/comics/batch`, {
            ids: comicIds,
          });

          setPreviewComics(response.data);
        } catch (error) {
          setPreviewComics([]);
        }
      } else {
        setPreviewComics([]);
      }
    };

    fetchComics();
  }, [previewCharacter]);
  // Fonction pour gérer le clic sur une carte envoi au state le personnage et affiche la fiche
  const handleCardClick = (characters) => {
    setPreviewCharacter(characters);
  };
  const handleAddFavorite = () => {
    const userId = localStorage.getItem("userId");
    const marvelId = previewCharacter._id;
    const type = "character";
    console.log({ userId, marvelId, type }); // ← Ajoute ce log
    axios
      .post(`${API_URL}/favorites`, { userId, marvelId, type })
      .then(() => setIsFavorite(true))
      .catch((err) => {
        console.error(
          "Erreur ajout favori:",
          err.response?.data || err.message
        );
      });
  };
  return isLoading ? (
    <div className="loading-screen">
      <div className="loading-spinner">
        <img
          src={imageFavoriteAfter}
          alt="Chargement"
          className="spinning-image"
        />
      </div>

      <div className="loader-text">
        <p>
          Chargement des données
          <span className="loading-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>
    </div>
  ) : (
    <main>
      <div className="main-content">
        {/* Colonne de gauche: Fiche personnage */}
        {previewCharacter ? (
          <aside
            className="info-sidebar fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <div className="card info-card">
              <button
                className="btn-reset"
                onClick={() => setPreviewCharacter(null)}
              >
                <FaRegWindowClose /> FERMER LE DOSSIER
              </button>
              <img
                src={isFavorite ? imageFavoriteAfter : imageFavoriteBefore}
                alt={isFavorite ? "Retirer des favoris" : "Ajouter en favori"}
                className="favorite-icon"
                onClick={handleAddFavorite}
                style={{ cursor: "pointer" }}
              />
              <div className="info-card-image-wrapper scanline-effect">
                <img
                  src={
                    previewCharacter.thumbnail
                      ? `${previewCharacter.thumbnail.path}/portrait_fantastic.${previewCharacter.thumbnail.extension}`
                      : "https://placehold.co/100x100/0A192F/8892B0?text=N/A"
                  }
                  alt="Portrait in Archive"
                  className="info-card-image"
                />
              </div>

              <h2>Dossier: {previewCharacter.name}</h2>
              <p className="character-id accent-text">
                ID:{" "}
                {previewCharacter._id
                  ? `${previewCharacter._id.slice(
                      0,
                      3
                    )}.${previewCharacter._id.slice(3, 8)}`
                  : ""}
              </p>

              <div className="details-section">
                <div className="archives-section">
                  <p className="details-title">// RAPPORT</p>
                  <p>
                    {previewCharacter.description
                      ? previewCharacter.description
                      : "Aucune informations disponible."}
                  </p>
                </div>
                <div className="comics-section">
                  <p className="details-title">// OPÉRATIONS</p>
                  <p className="comics-list">
                    {previewComics.length > 0
                      ? previewComics.map((comic, idx) => (
                          <span key={comic._id || idx}>
                            {comic.title}
                            {idx < previewComics.length - 1 && <br />}
                          </span>
                        ))
                      : "Aucun comic disponible."}
                  </p>
                </div>

                <p className="details-title">// STATUT</p>
                <p className="status">
                  <span className="status-indicator"></span>Actif
                </p>
                <Link to="/" id="link-character">
                  Accès au dossier complet <FaExternalLinkSquareAlt />
                </Link>
              </div>
            </div>
          </aside>
        ) : (
          <aside
            className="info-sidebar fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <div className="card info-card">
              <div className="info-card-image-wrapper scanline-effect">
                <img
                  src={imageIronMan}
                  alt="Portrait de Iron Man"
                  className="info-card-image"
                />
              </div>

              <h2>Dossier: IRON MAN</h2>
              <p className="character-id accent-text">ID: 424.24242</p>

              <div className="details-section">
                <div>
                  <p className="details-title">// IDENTITÉ</p>
                  <p>Anthony "Tony" Stark</p>
                </div>
                <div>
                  <p className="details-title">// AFFILIATION</p>
                  <p>Avengers, S.H.I.E.L.D , Stark Industries</p>
                </div>
                <div>
                  <p className="details-title">// PREMIÈRE APPARITION</p>
                  <p>Tales of Suspense #39 (1963)</p>
                </div>
                <div>
                  <p className="details-title">// STATUT</p>
                  <p className="status">
                    <span className="status-indicator"></span>Actif
                  </p>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Colonne de droite: Résultats et activité */}
        <section className="main-section">
          <div className="fade-in" style={{ animationDelay: "400ms" }}>
            <h3 className="section-title accent-text">
              // FLUX D'ACTIVITÉ RÉCENT
            </h3>
            <div className="card activity-feed">
              <p>
                <span className="timestamp">[20:45:12]</span>&nbsp;&nbsp;
                <span className="accent-text">NOUVEAU DOSSIER:</span>{" "}
                <span className="highlight">Spider-Man (Miles Morales)</span>
              </p>
              <p>
                <span className="timestamp">[20:44:51]</span>&nbsp;&nbsp;
                <span>ACCÈS:</span>{" "}
                <span className="highlight">Dossier HULK par Dr. Banner</span>
              </p>
              <p>
                <span className="timestamp">[20:44:23]</span>&nbsp;&nbsp;
                <span className="accent-text">MISE À JOUR:</span>{" "}
                <span className="highlight">Série 'X-Men '97'</span>
              </p>
              <p>
                <span className="timestamp">[20:43:05]</span>&nbsp;&nbsp;
                <span className="alert">ALERTE:</span> Anomalie détectée -
                Dossier #616
              </p>
            </div>
          </div>
          <div
            className="fade-in bagr-style"
            style={{ animationDelay: "300ms" }}
          >
            <h3 className="section-title accent-text">
              // RÉSULTATS ASSOCIÉS:{" "}
              {!searchTerm.trim()
                ? `${currentLimit} / ${totalCount}`
                : `(${filteredData?.results?.length || 0})`}
              {isSearching && (
                <span className="loader-search">
                  <img
                    src={imageFavoriteAfter}
                    alt="Chargement"
                    className="spinning-image"
                    style={{ width: "16px", height: "16px" }}
                  />
                  Recherche en cours
                  <span className="loading-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                </span>
              )}
            </h3>
            {/* Contrôles de pagination */}
            {!searchTerm.trim() && totalPages > 1 && (
              <div className="pagination-controls">
                {/* Première page */}
                <button
                  type="button"
                  className={
                    currentPage === totalPages ? "btn-active" : "btn-pagination"
                  }
                  onClick={(event) => handlePageChange(1, event)}
                  disabled={currentPage === 1 || isPaginating}
                  style={{
                    cursor:
                      currentPage === 1 || isPaginating
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <FaAngleDoubleLeft style={{ marginTop: "2px" }} />
                </button>
                {/* Précédent */}
                <button
                  type="button"
                  className={
                    currentPage === totalPages ? "btn-active" : "btn-pagination"
                  }
                  onClick={(event) =>
                    handlePageChange(
                      currentPage > 1 ? currentPage - 1 : 1,
                      event
                    )
                  }
                  disabled={currentPage === 1 || isPaginating}
                  style={{
                    cursor:
                      currentPage === 1 || isPaginating
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Précédent
                </button>

                <span className="nb-pages">
                  Page {currentPage} sur {totalPages}
                </span>

                {/* Suivant */}
                <button
                  type="button"
                  className={
                    currentPage + 1 !== totalPages && currentPage < totalPages
                      ? "btn-active"
                      : "btn-pagination"
                  }
                  onClick={(event) =>
                    handlePageChange(
                      currentPage < totalPages ? currentPage + 1 : totalPages,
                      event
                    )
                  }
                  disabled={currentPage === totalPages || isPaginating}
                  style={{
                    cursor:
                      currentPage === totalPages || isPaginating
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Suivant
                </button>
                {/* Dernière page */}
                <button
                  type="button"
                  className={
                    currentPage + 1 !== totalPages && currentPage < totalPages
                      ? "btn-active"
                      : "btn-pagination"
                  }
                  onClick={(event) => handlePageChange(totalPages, event)}
                  disabled={currentPage === totalPages || isPaginating}
                  style={{
                    cursor:
                      currentPage === totalPages || isPaginating
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <FaAngleDoubleRight style={{ marginTop: "2px" }} />
                </button>
              </div>
            )}
            <div
              className="results-grid"
              style={{
                opacity: isSearching || isPaginating ? 0.6 : 1,
                position: "relative",
              }}
            >
              {isPaginating && (
                <div className="pagination-loading-overlay">
                  <img
                    src={imageFavoriteAfter}
                    alt="Chargement"
                    className="spinning-image-page"
                  />
                  <span style={{ color: "var(--color-accent)" }}>
                    Chargement de la page {currentPage}...
                  </span>
                </div>
              )}

              {filteredData?.results?.map((characters, index) => (
                <div
                  className="card result-card"
                  key={index}
                  onClick={() => handleCardClick(characters)}
                >
                  <img
                    src={
                      filteredData &&
                      filteredData.results &&
                      filteredData.results[0]
                        ? `${characters.thumbnail.path}/portrait_large.${characters.thumbnail.extension}`
                        : "https://placehold.co/100x100/0A192F/8892B0?text=N/A"
                    }
                    alt="Image archive"
                    className="result-avatar"
                  />
                  <div className="result-info">
                    <p className="result-title">{characters.name}</p>
                    <div className="desc-characters">
                      <h3>// Information du Shield</h3>
                      <p className="result-description">
                        {characters.description
                          ? characters.description
                          : "Aucune informations disponible."}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
