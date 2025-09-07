//import css
import "./Login.css";
// Import react
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

//Import logo
import LogoShield from "../../assets/img/logo-sombre-favorite.png";
// Import icons
import { IoEyeOffSharp } from "react-icons/io5";
import { IoEyeSharp } from "react-icons/io5";
//Import utils
import handleToken from "../../assets/utils/handleToken";
import handleChange from "../../assets/utils/handleChange";
//Import URL API
import API_URL from "../../config/API_URL";
// Import css
import "./Login.css";

const Login = ({ setIsConnected }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <main className="login-container">
      <div className="title-top">
        <h1>ACCÈS AGENT</h1>

        <img src={LogoShield} alt="Logo Shield" />
      </div>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          //   verifier que les deux mdp sont identiques
          try {
            // envoyer les données au serveur
            const response = await axios.post(`${API_URL}/user/login`, {
              email: email,
              password: password,
            });
            // stocker le token dans un cookie et modifie le state isConnected

            handleToken(response.data.token, setIsConnected);

            // rediriger l'utilisateur vers la page d'accueil
            navigate("/");
          } catch (error) {
            console.log(error.response);
            if (error.response && error.response.status === 400) {
              setMessageError(true);
            }
          }
        }}
      >
        <div className="login-form">
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
              onChange={(event) => handleChange(event, setPassword)}
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoEyeSharp /> : <IoEyeOffSharp />}
            </span>
          </div>

          <button className="btn-gen">Authentification</button>
          {messageError && (
            <div style={{ color: "red", marginTop: "8px" }}>
              Les informations fournies ne sont pas correctes
            </div>
          )}
        </div>
      </form>
    </main>
  );
};
export default Login;
