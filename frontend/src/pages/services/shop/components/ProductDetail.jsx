export default function ProductDetail({
    selectedProduct,
    cartItems = [],
    setPageMode,
    handleAddToCart
  }) {
    const safeCart = Array.isArray(cartItems) ? cartItems : [];
    const isInCart = selectedProduct && safeCart.some(ci => ci && ci.id === selectedProduct.id);

    return (
      <div className="details-page">
        <button className="back-button" onClick={() => setPageMode("products")}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
  
        <div className="image-container">
          <img
            src={selectedProduct?.img}
            alt={selectedProduct?.name}
            className="details-image"
          />
        </div>
  
        <div className="details-content">
          <div>
            <h2 className="details-name">{selectedProduct?.name}</h2>
            <p className="details-description">{selectedProduct?.description}</p>
            <p className="details-price">₹ {selectedProduct?.price}</p>
          </div>
  
          <button
            className="add-to-cart-btn"
            onClick={() => selectedProduct && handleAddToCart(selectedProduct.id)}
            disabled={isInCart}
          >
            {isInCart ? <p>Item already in cart</p> : <p>Add to Cart</p>}
          </button>
        </div>
      </div>
    );
  }
  