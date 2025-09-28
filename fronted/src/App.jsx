import { Routes, Route } from "react-router-dom";
import UserProvider from "./context/UserContext";
import Homepage from './pages/Homepage' 
import ProductDetailsPage from './pages/ProductDetailsPage'
import Myprofile from "./pages/Myprofile";
import SearchResultPage from "./pages/SearchResultPage";
import './App.css'


function App() {

  return (
    <UserProvider>
      <div> 
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/product-detail/:id" element={<ProductDetailsPage />} />
          <Route path="/myprofile" element={<Myprofile />} />
          <Route path="/search" element={<SearchResultPage />} />  
        </Routes>
      </div>
    </UserProvider>
  )
}

export default App
