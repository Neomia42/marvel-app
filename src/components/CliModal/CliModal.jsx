import { useState, useEffect, useRef } from "react";
//Import Img
import logoMarvel from "../../assets/img/8ee9c1e8083ebe9babe7208c1f46daca.png";
//import CSS
import "./CliModal.css";
const CliModal = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [showCliContainer, setShowCliContainer] = useState(false);
  const [typedLines, setTypedLines] = useState([]);
  const [currentCursorLine, setCurrentCursorLine] = useState(0);
  const [showEnterButton, setShowEnterButton] = useState(false);

  const timeouts = useRef([]);

  const linesToType = [
    "> Connexion au réseau S.H.I.E.L.D. en cours...",
    "> Authentification de l'agent...",
    "> Accès de niveau 7 accordé.",
    "<br>",
    "> Chargement de l'archive MARVEL...",
    "<span class='accent-text'>> Initialisation de l'interface... Terminé.</span>",
    "<br>",
    "> Bienvenue, Agent.",
  ];

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowCliContainer(true);
    }, 2500);

    timeouts.current.push(logoTimer);

    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!showCliContainer) return;

    let lineIndex = 0;

    const typeLine = () => {
      if (lineIndex >= linesToType.length) {
        setCurrentCursorLine(-1);
        setShowEnterButton(true);
        return;
      }

      const line = linesToType[lineIndex];
      const isHTML = line.startsWith("<");

      if (isHTML) {
        setTypedLines((prev) => [...prev, line]);
        setCurrentCursorLine((prev) => prev + 1);
        lineIndex++;
        const timer = setTimeout(typeLine, 200);
        timeouts.current.push(timer);
      } else {
        let charIndex = 0;
        setTypedLines((prev) => [...prev, ""]);
        const typeChar = () => {
          if (charIndex < line.length) {
            setTypedLines((prev) => {
              const newLines = [...prev];
              newLines[lineIndex] += line.charAt(charIndex);
              return newLines;
            });
            charIndex++;
            const timer = setTimeout(typeChar, 35);
            timeouts.current.push(timer);
          } else {
            lineIndex++;
            if (lineIndex >= linesToType.length) {
              // Dernière ligne tapée, retire le curseur
              setCurrentCursorLine(-1);
              setShowEnterButton(true);
            } else {
              setCurrentCursorLine((prev) => prev + 1);
              const timer = setTimeout(typeLine, 400);
              timeouts.current.push(timer);
            }
          }
        };
        typeChar();
      }
    };

    typeLine();
  }, [showCliContainer]);

  const handleEnter = () => {
    const modal = document.getElementById("cli-modal-overlay");
    if (modal) {
      modal.classList.add("fade-out");
    }
    setTimeout(() => {
      setIsVisible(false);
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <main id="cli-modal-overlay" className="cli-modal-overlay">
      <div className="cli-modal-content">
        {!showCliContainer && (
          <div id="logo-container">
            <img src={logoMarvel} alt="Logo Marvel" className="logo-img" />
          </div>
        )}
        {showCliContainer && (
          <div id="cli-container" className="cli-container fade-in">
            <div id="cli-output" className="cli-output">
              {typedLines.map((line, index) => (
                <p
                  key={index}
                  className={
                    index === currentCursorLine && !showEnterButton
                      ? "with-cursor"
                      : ""
                  }
                  dangerouslySetInnerHTML={{
                    __html: line === "<br>" ? "&nbsp;" : line,
                  }}
                />
              ))}
            </div>
            <div className="button-container">
              <button
                id="enter-button"
                onClick={handleEnter}
                className={`enter-button ${
                  showEnterButton ? "opacity-100" : "opacity-0"
                }`}
              >
                [ ACCÉDER À L'ARCHIVE ]
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Bouton Skip fixé en bas à gauche de la modale */}
      {showCliContainer && (
        <button id="next-button" onClick={handleEnter} className="next-button">
          &gt; &gt; Skip &lt; &lt;
        </button>
      )}
    </main>
  );
};

export default CliModal;
