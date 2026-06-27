const { openLoginModal } = useModal(); // Get openLoginModal function from context


<Header 
  categories={['NEWS', 'BUSINESS', 'FINANCE', 'SPORT', 'TRAVEL', 'EARTH', 'CULTURE']} 
  activeCategory={article.category} 
  onSelectCategory={handleLogoClick} 
  onLoginClick={() => navigate('/')} 
/>
