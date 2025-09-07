//import react
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Import icons
import { IoEyeOffSharp } from "react-icons/io5";
import { IoEyeSharp } from "react-icons/io5";
import { FaUpload, FaUserCircle } from "react-icons/fa";

//Import utils
import handleChange from "../../assets/utils/handleChange";
import handleToken from "../../assets/utils/handleToken";
//Import URL API
import API_URL from "../../config/API_URL";
//import css
import "./SignUp.css";
//import logo
import LogoShield from "../../assets/img/logo-sombre-favorite.png";

const SignUp = ({ setIsConnected }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [messageError, setMessageError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatar(file);
      // Créer une preview de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <main className="signup-container">
      <div className="title-top">
        <h1>COMMENCEZ VOTRE ENROLEMENT</h1>
        <img src={LogoShield} alt="Logo Shield vert sombre" />
      </div>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          //   verifier que les deux mdp sont identiques
          if (password === confirmPassword) {
            try {
              //FormData pour envoyer les fichiers
              const formData = new FormData();
              formData.append("username", username);
              formData.append("email", email);
              formData.append("password", password);
              formData.append("newsletter", newsletter ? "true" : "false");
              if (avatar) {
                formData.append("avatar", avatar);
              }

              // envoi les données au serveur
              const response = await axios.post(
                `${API_URL}/user/signup`,
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );
              // stocker le token dans un cookie si il est pas présent
              hhandleToken(
                response.data.token,
                setIsConnected,
                response.data._id
              );
              // rediriger l'utilisateur vers la page d'accueil
              navigate("/");
            } catch (error) {
              console.log(error);
              if (
                error.response &&
                (error.response.status === 400 || error.response.status === 409)
              ) {
                setMessageError(true);
                return;
              }
            }
          } else {
            setPasswordError(true);
          }
        }}
      >
        <div className="signup-form">
          {/* Section Avatar */}
          <div className="avatar-section">
            <div className="avatar-preview">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview avatar"
                  className="avatar-image"
                />
              ) : (
                <FaUserCircle className="default-avatar" />
              )}
            </div>
            <label htmlFor="avatar" className="avatar-upload-btn">
              <FaUpload /> Choisir un avatar
              <input
                type="file"
                id="avatar"
                name="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
          <input
            type="text"
            id="username"
            name="name"
            placeholder="Nom d'utilisateur"
            required
            value={username}
            onChange={(event) => handleChange(event, setUsername)}
          />

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            required
            value={email}
            onChange={(event) => handleChange(event, setEmail)}
          />
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Mot de passe"
              required
              value={password}
              onChange={(event) => {
                handleChange(event, setPassword);
                if (event.target.value === confirmPassword) {
                  setPasswordError(false);
                }
              }}
              style={passwordError ? { borderBottom: "2px solid red" } : {}}
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoEyeSharp /> : <IoEyeOffSharp />}
            </span>
          </div>
          <div className="password-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirmer le mot de passe"
              required
              value={confirmPassword}
              onChange={(event) => {
                handleChange(event, setConfirmPassword);
                if (event.target.value === password) {
                  setPasswordError(false);
                }
              }}
              style={passwordError ? { borderBottom: "2px solid red" } : {}}
            />
            <span
              className="eye-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <IoEyeSharp /> : <IoEyeOffSharp />}
            </span>
          </div>
          <div className="checkbox-container">
            <div>
              <input
                type="checkbox"
                value={newsletter}
                id="newsletter"
                onChange={(event) => {
                  setNewsletter(event.target.checked);
                }}
              />
              <span>S'inscrire à notre newsletter</span>
            </div>
            <p>
              En m'inscrivant je confirme avoir lu et accepté les Termes &
              Conditions et Politique de Confidentialité de Vinted. Je confirme
              avoir au moins 18 ans.
            </p>
          </div>
          <button className="btn-gen">Enrôlement</button>
          {messageError && (
            <div style={{ color: "red", marginTop: "8px" }}>
              Impossible de créer le compte. Veuillez vérifier vos informations.
            </div>
          )}
          {passwordError && (
            <div style={{ color: "red", marginTop: "8px" }}>
              Les mots de passe ne correspondent pas.
            </div>
          )}
        </div>
      </form>
    </main>
  );
};

export default SignUp;
