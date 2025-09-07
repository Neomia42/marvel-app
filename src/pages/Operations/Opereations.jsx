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
import imageSpiderman from "../../assets/img/spiderman.jpg";
import imageFavoriteBefore from "../../assets/img/logo-claire-favorite.png";
import imageFavoriteAfter from "../../assets/img/logo-sombre-favorite.png";
//import CSS file
import "./Operations.css";
const Operations = ({ searchTerm = "", onTotalPagesChange }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  //   const [previewCharacters, setPreviewCharacters] = useState([]);
  const [previewComics, setPreviewComics] = useState(null);
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
    // Éviter le rechargement si c'est la même page
    if (page === currentPage) return;
    try {
      setIsPaginating(true);
      // console.log(`Chargement page ${page}`);
      const response = await axios.get(`${API_URL}/comics/?page=${page}`);
      //   console.log("response page =>", response.data);
      // Mettre à jour les données sans déclencher de rechargement complet
      setData(response.data || []);
      setFilteredData(response.data || []);
      setCurrentPage(page);
    } catch (err) {
      console.error("Erreur changement de page:", err);
    } finally {
      setIsPaginating(false);
    }
  };
  useEffect(() => {
    const checkFavorite = async () => {
      setIsFavorite(false);
      if (!previewComics) return;
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      try {
        const res = await axios.get(
          `${API_URL.replace(/\/$/, "")}/favorites/${userId}?type=comic`
        );
        const favs = res.data || [];
        const exists = favs.some((f) => f.marvelId === previewComics._id);
        setIsFavorite(Boolean(exists));
      } catch (err) {
        // si erreur, on laisse isFavorite à false
        setIsFavorite(false);
      }
    };

    checkFavorite();
  }, [previewComics]);

  // useEffect pour charger les données initiales (seulement une fois)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/comics`);
        console.log("reponse comics =>", response.data);
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
    const fetchComicsByName = async () => {
      if (!searchTerm.trim()) {
        setFilteredData(data);
        setTotalCount(data?.count || 0);
        setCurrentLimit(data?.limit || 0);
        return;
      }
      setIsSearching(true);
      try {
        // 1. Chercher tous les personnages dont le nom contient le terme
        const characterRes = await axios.get(
          `${API_URL}/characters?name=${encodeURIComponent(searchTerm.trim())}`
        );
        const characterList = characterRes.data?.results || [];
        // Filtrer tous les personnages dont le nom commence par le terme
        const characters = characterList.filter((char) =>
          char.name.toLowerCase().startsWith(searchTerm.trim().toLowerCase())
        );
        if (characters.length > 0) {
          // Recherche par nom exact (prioritaire)
          const exactCharacter = characters.find(
            (char) =>
              char.name.toLowerCase() === searchTerm.trim().toLowerCase()
          );
          if (
            exactCharacter &&
            Array.isArray(exactCharacter.comics) &&
            exactCharacter.comics.length > 0
          ) {
            let allComics = [];
            for (const comicId of exactCharacter.comics) {
              try {
                const comicRes = await axios.get(`${API_URL}/comic/${comicId}`);
                console.log("Réponse comic:", comicRes.data);
                if (comicRes.data) {
                  allComics.push(comicRes.data);
                }
              } catch (err) {
                // Ignore les erreurs pour un comic
                console.error(`Erreur comic pour ${comicId}:`, err);
              }
            }
            setFilteredData({ comics: allComics });
            setTotalCount(allComics.length);
            setCurrentLimit(allComics.length);
          } else {
            // Sinon, recherche multi-personnages comme avant
            let allComics = [];
            for (const character of characters) {
              const characterId = character._id || character.id;
              try {
                const comicsRes = await axios.get(
                  `${API_URL}/comics/${characterId}`
                );
                if (comicsRes.data && comicsRes.data.comics) {
                  allComics = allComics.concat(comicsRes.data.comics);
                }
              } catch (err) {
                // Ignore les erreurs pour un personnage
                console.error(`Erreur comics pour ${character.name}:`, err);
              }
            }
            setFilteredData({ comics: allComics });
            setTotalCount(allComics.length);
            setCurrentLimit(allComics.length);
          }
        } else {
          setFilteredData({ comics: [] });
          setTotalCount(0);
          setCurrentLimit(0);
        }
      } catch (err) {
        setFilteredData({ comics: [] });
        setTotalCount(0);
        setCurrentLimit(0);
      } finally {
        setIsSearching(false);
      }
    };
    const timeoutId = setTimeout(fetchComicsByName, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, data]);

  const handleCardClick = (comics) => {
    setPreviewComics(comics);
  };
  const handleAddFavorite = () => {
    const userId = localStorage.getItem("userId");
    const marvelId = previewComics._id; // ← ici, on utilise previewComics
    const type = "comic";
    console.log({ userId, marvelId, type });
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
        {previewComics ? (
          <aside
            className="info-sidebar fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <div className="card info-card">
              <button
                className="btn-reset"
                onClick={() => setPreviewComics(null)}
              >
                <FaRegWindowClose /> FERMER L'OPÉRATION
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
                    previewComics.thumbnail
                      ? `${previewComics.thumbnail.path}/standard_fantastic.${previewComics.thumbnail.extension}`
                      : "https://placehold.co/100x100/0A192F/8892B0?text=N/A"
                  }
                  alt="Portrait in Archive"
                  className="info-card-image"
                />
              </div>

              <h2>Opération: {previewComics.name}</h2>
              <p className="character-id accent-text">
                ID:{" "}
                {previewComics._id
                  ? `${previewComics._id.slice(0, 3)}.${previewComics._id.slice(
                      3,
                      8
                    )}`
                  : ""}
              </p>

              <div className="details-section">
                <div className="archives-section">
                  <p className="details-title">// RAPPORT NAME</p>
                  <p>
                    {previewComics.description
                      ? previewComics.description
                      : "Aucune informations disponible."}
                  </p>
                </div>
                <div className="comics-section">
                  <p className="details-title">// CHARACTERS</p>
                  <p className="comics-list">
                    Aucune donnés fiable disponible{" "}
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
                  src={imageSpiderman}
                  alt="Portrait de Iron Man"
                  className="info-card-image"
                />
              </div>

              <h2 className="oper-small">OPÉRATION: SPIDERMAN</h2>
              <p className="character-id accent-text">ID: 424.24242</p>

              <div className="details-section">
                <div>
                  <p className="details-title">// IDENTITÉ</p>
                  <p>Peter PARKER</p>
                </div>
                <div>
                  <p className="details-title">// AFFILIATION</p>
                  <p>Avengers, S.H.I.E.L.D , Mutant Bitten by a spider </p>
                </div>
                <div>
                  <p className="details-title">// PREMIÈRE APPARITION</p>
                  <p>Amazing Fantasy ( vol. 1) #15 en août 1962</p>
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
                <span className="accent-text">NOUVELLE OPÉRATION:</span>{" "}
                <span className="highlight">Avengers (Infinty War)</span>
              </p>
              <p>
                <span className="timestamp">[20:44:51]</span>&nbsp;&nbsp;
                <span>ACCÈS:</span>{" "}
                <span className="highlight">
                  Opération NEW YORK par Nick Fury
                </span>
              </p>
              <p>
                <span className="timestamp">[20:44:23]</span>&nbsp;&nbsp;
                <span className="accent-text">MISE À JOUR:</span>{" "}
                <span className="highlight">
                  S100th Anniversary Special (2014) #1
                </span>
              </p>
              <p>
                <span className="timestamp">[20:43:05]</span>&nbsp;&nbsp;
                <span className="alert">ALERTE:</span> Anomalie détectée -
                Dossier #896 &gt; #722 conflict
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

              {(filteredData?.comics || filteredData?.results || []).map(
                (comics, index) => (
                  <div
                    className="card result-card"
                    key={index}
                    onClick={(event) => {
                      handleCardClick(comics);
                      console.log("comics sélectionné :", comics);
                    }}
                  >
                    <img
                      src={
                        comics.thumbnail
                          ? `${comics.thumbnail.path}/standard_large.${comics.thumbnail.extension}`
                          : "https://placehold.co/100x100/0A192F/8892B0?text=N/A"
                      }
                      alt="Image archive"
                      className="result-avatar"
                    />
                    <div className="result-info">
                      <p className="result-title">{comics.title}</p>
                      <div className="desc-characters">
                        <h3>// Information du Shield</h3>
                        <p className="result-description">
                          {comics.description
                            ? comics.description
                            : "Aucune informations disponible."}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Operations;
