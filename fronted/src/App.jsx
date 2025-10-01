import { Routes, Route } from "react-router-dom";
import UserProvider from "./context/UserContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import CartPanel from "./components/CartPanel";
import Homepage from './pages/Homepage' 
import ProductDetailsPage from './pages/ProductDetailsPage'
import Myprofile from "./pages/Myprofile";
import SearchResultPage from "./pages/SearchResultPage";
import WishlistPage from "./pages/WishlistPage";
import HelpSupport from "./pages/HelpSupport";
import OrdersPage from "./pages/OrdersPage";
import SubcategoryProducts from "./pages/SubcategoryProducts";
import TopRankingPage from './pages/TopRankingPage';
import './App.css'


function App() {

  return (
    <UserProvider>
      <WishlistProvider>
        <CartProvider>
          <div> 
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/top-ranking" element={<TopRankingPage />} />
              <Route path="/product-detail/:id" element={<ProductDetailsPage />} />
              <Route path="/myprofile" element={<Myprofile />} />
              <Route path="/search" element={<SearchResultPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/help" element={<HelpSupport />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/browse/:categoryKey/:subcategoryKey" element={<SubcategoryProducts />} />
            </Routes>
            <CartPanel />
          </div>
        </CartProvider>
      </WishlistProvider>
    </UserProvider>
  )
}

export default App
