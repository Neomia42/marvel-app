import { useState, useEffect } from "react";
import { FaRegWindowClose } from "react-icons/fa";
import logoSombreFavorite from "../../assets/img/logo-sombre-favorite.png";
import axios from "axios";
import imageFavoriteAfter from "../../assets/img/logo-sombre-favorite.png";
import API_URL from "../../config/API_URL";
import "./Favorite.css";

const Favorite = () => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteDetails, setFavoriteDetails] = useState([]);
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/favorites/${userId}`);
        setFavorites(response.data);
      } catch (error) {
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) fetchFavorites();
  }, [userId]);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      const details = await Promise.all(
        favorites.map(async (fav) => {
          if (fav.type === "comic") {
            try {
              const res = await axios.get(`${API_URL}/comic/${fav.marvelId}`);
              return { ...fav, ...res.data };
            } catch {
              return fav;
            }
          }
          if (fav.type === "character") {
            try {
              const res = await axios.get(
                `${API_URL}/character/${fav.marvelId}`
              );
              return { ...fav, ...res.data };
            } catch {
              return fav;
            }
          }
          return fav;
        })
      );
      setFavoriteDetails(details);
      setIsLoading(false);
    };
    if (favorites.length > 0) fetchDetails();
  }, [favorites]);

  const handleRemoveFavorite = async (fav) => {
    try {
      await axios.delete(`${API_URL}/favorites`, {
        data: {
          userId,
          marvelId: fav.marvelId,
          type: fav.type,
        },
      });
      setFavorites((prev) =>
        prev.filter(
          (f) => !(f.marvelId === fav.marvelId && f.type === fav.type)
        )
      );
      if (
        selectedFavorite &&
        selectedFavorite.marvelId === fav.marvelId &&
        selectedFavorite.type === fav.type
      ) {
        setSelectedFavorite(null);
      }
    } catch (error) {
      console.error("Erreur de recherche:", error);
      setError("Une erreur est survenue lors du chargement des données.");
    }
  };

  return (
    <main>
      <div className="main-content">
        {isLoading ? (
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
          <>
            <aside className="info-sidebar fade-in">
              {selectedFavorite ? (
                <div className="card info-card">
                  <button
                    className="btn-reset"
                    onClick={() => setSelectedFavorite(null)}
                  >
                    <FaRegWindowClose /> FERMER LE DOSSIER
                  </button>
                  <h2 className="info-title">
                    {selectedFavorite.type === "comic" ? "Comic" : "Personnage"}{" "}
                    : {selectedFavorite.title || selectedFavorite.name}
                  </h2>
                  {selectedFavorite.thumbnail && (
                    <img
                      src={`${selectedFavorite.thumbnail.path}/portrait_fantastic.${selectedFavorite.thumbnail.extension}`}
                      alt={selectedFavorite.title || selectedFavorite.name}
                    />
                  )}
                  <p>{selectedFavorite.description || "Aucune description."}</p>
                </div>
              ) : (
                <div className="card info-card">
                  <h2>Sélectionne un favori</h2>
                </div>
              )}
            </aside>
            <section className="main-section">
              <h3 className="section-title accent-text">// WATCHLIST</h3>
              <div className="results-grid">
                <div className="column-container">
                  <h4 className="column-title">Personnages</h4>
                  {favoriteDetails.filter((fav) => fav.type === "character")
                    .length === 0 ? (
                    <p>Aucun personnage en favori.</p>
                  ) : (
                    favoriteDetails
                      .filter((fav) => fav.type === "character")
                      .map((fav, idx) => (
                        <div
                          className="card result-card"
                          key={fav.marvelId + "-character"}
                          style={{
                            cursor: "pointer",
                            position: "relative",
                            marginBottom: "16px",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              width: 28,
                              height: 28,
                              cursor: "pointer",
                              zIndex: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFavorite(fav);
                            }}
                          >
                            <img
                              src={logoSombreFavorite}
                              alt="Retirer des favoris"
                              className="remove-fav-logo"
                              style={{ width: 24, height: 24, opacity: 0.8 }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: "18px",
                                pointerEvents: "none",
                                textShadow: "0 0 2px #000, 0 0 4px #000",
                              }}
                            >
                              ×
                            </span>
                          </span>
                          {fav.thumbnail && (
                            <img
                              src={`${fav.thumbnail.path}/portrait_small.${fav.thumbnail.extension}`}
                              alt={fav.title || fav.name}
                              style={{ width: "60px", borderRadius: "6px" }}
                              onClick={() => setSelectedFavorite(fav)}
                            />
                          )}
                          <p onClick={() => setSelectedFavorite(fav)}>
                            {fav.title || fav.name}
                          </p>
                        </div>
                      ))
                  )}
                </div>
                <div className="column-container">
                  <h4 className="column-title">Comics</h4>
                  {favoriteDetails.filter((fav) => fav.type === "comic")
                    .length === 0 ? (
                    <p>Aucun comic en favori.</p>
                  ) : (
                    favoriteDetails
                      .filter((fav) => fav.type === "comic")
                      .map((fav, idx) => (
                        <div
                          className="card result-card"
                          key={fav.marvelId + "-comic"}
                          style={{
                            cursor: "pointer",
                            position: "relative",
                            marginBottom: "16px",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              width: 28,
                              height: 28,
                              cursor: "pointer",
                              zIndex: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFavorite(fav);
                            }}
                          >
                            <img
                              src={logoSombreFavorite}
                              alt="Retirer des favoris"
                              className="remove-fav-logo"
                              style={{ width: 24, height: 24, opacity: 0.8 }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: "18px",
                                pointerEvents: "none",
                                textShadow: "0 0 2px #000, 0 0 4px #000",
                              }}
                            >
                              ×
                            </span>
                          </span>
                          {fav.thumbnail && (
                            <img
                              src={`${fav.thumbnail.path}/portrait_small.${fav.thumbnail.extension}`}
                              alt={fav.title || fav.name}
                              style={{ width: "60px", borderRadius: "6px" }}
                              onClick={() => setSelectedFavorite(fav)}
                            />
                          )}
                          <p onClick={() => setSelectedFavorite(fav)}>
                            {fav.title || fav.name}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default Favorite;
