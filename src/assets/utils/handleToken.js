import Cookie from "js-cookie";

const handleToken = (token, setIsConnected, userId) => {
  // Si on veut se déconnecter (token false)
  if (!token) {
    Cookie.remove("token");
    localStorage.removeItem("userId"); // Supprime userId si déconnexion
    setIsConnected(false);
    return false;
  }
  // Si on passe un token, on le sauvegarde (nouveau ou existant)
  Cookie.set("token", token, { expires: 7 });
  setIsConnected(true);
  if (userId) {
    localStorage.setItem("userId", userId); // Stocke userId
  }
  console.log("Token stocké:", Cookie.get("token"));
  return token;
};
export default handleToken;
