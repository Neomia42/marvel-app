import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Cookie from "js-cookie";
import { useState } from "react";
import "./App.css";

//import components
import CliModal from "./components/CliModal/CliModal";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
//Import pages
import Home from "./pages/Home/Home";
import Favorite from "./pages/Favorite/Favorite";
import SignUp from "./pages/SignUp/SignUp";
import Operations from "./pages/Operations/Opereations";
import Login from "./pages/Login/Login";

function App() {
  const [isConnected, setIsConnected] = useState(Cookie.get("token") || false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term) => {
    // console.log("Recherche dans App:", term);
    setSearchTerm(term);
  };

  return (
    <Router>
      <main className="app-container">
        <CliModal />
        <Header
          onSearch={handleSearch}
          isConnected={isConnected}
          setIsConnected={setIsConnected}
        />

        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home searchTerm={searchTerm} />} />
            <Route
              path="/operations"
              element={<Operations searchTerm={searchTerm} />}
            />
            <Route
              path="/favorites"
              isConnected={isConnected}
              setIsConnected={setIsConnected}
              element={<Favorite />}
            />
            <Route
              path="/login"
              element={<Login setIsConnected={setIsConnected} />}
            />
            <Route
              path="/signup"
              element={
                <SignUp
                  isConnected={isConnected}
                  setIsConnected={setIsConnected}
                />
              }
            />
          </Routes>
        </div>
        <Footer />
      </main>
    </Router>
  );
}

export default App;
