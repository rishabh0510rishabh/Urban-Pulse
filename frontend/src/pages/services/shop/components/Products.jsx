import React from "react";

export default function Products({
  filteredItems = [],
  cartItems = [],
  handleAddToCart,
  setSelectedProduct,
  setPageMode,
}) {
  const safeCart = Array.isArray(cartItems) ? cartItems : [];

  return (
    <div className="products-section">
      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <p>No products found</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredItems.map((item) => {
            const isItemInCart = safeCart.some((ci) => ci && ci.id === item.id);
            return (
              <div
                key={item.id}
                className="product-card"
                onClick={() => {
                  setSelectedProduct(item);
                  setPageMode("details");
                }}
              >
                <div className="product-image-wrapper">
                  <img src={item.img} alt={item.name} className="product-image" />
                  <div className="product-price-badge">₹ {item.price}</div>
                </div>

                <div className="product-info">
                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-description">{item.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item.id);
                    }}
                    disabled={isItemInCart}
                    className={`add-to-cart-btn ${isItemInCart ? "added" : ""}`}
                  >
                    {isItemInCart ? (
                      <>
                        <span className="btn-icon">✓</span> Added
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">
                          <i className="fa-solid fa-cart-shopping"></i>
                        </span>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
