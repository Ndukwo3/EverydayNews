import { useAuth } from './context/AuthContext';
import { useModal } from './context/ModalContext';

import { Header } from './components/Header';
import { ProductList } from './components/ProductList';

import './App.css';

function App() {
  const { categories, activeCategory, setActiveCategory, searchQuery, setSearchQuery } = useAuth();
  const { openLoginModal } = useModal();

  return (
    <div className="App">
      <Header
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onLoginClick={openLoginModal}
        onSearchChange={setSearchQuery}
      />
      <ProductList searchQuery={searchQuery} />
    </div>
  );
}

export default App;
