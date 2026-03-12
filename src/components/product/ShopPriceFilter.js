import React, { useState } from "react";
import PropTypes from "prop-types";

const ShopPriceFilter = ({ string, getSortParams }) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleApply = () => {
    getSortParams("price", { min: parseFloat(minPrice) || 0, max: parseFloat(maxPrice) || Infinity });
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    getSortParams("price", { min: 0, max: Infinity });
  };

  return (
    <div className="sidebar-widget mt-30" style={{ position: "relative", zIndex: 1 }}>
      <h4 className="pro-sidebar-title">{string["Price"] || "Price"}</h4>
      <div className="sidebar-widget-list mt-20">
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            style={{ width: "70px", padding: "4px", border: "1px solid #ddd", position: "relative", zIndex: 1 }}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            style={{ width: "70px", padding: "4px", border: "1px solid #ddd", position: "relative", zIndex: 1 }}
          />
        </div>
        <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
          <button onClick={handleApply} style={{ padding: "4px 12px", background: "#333", color: "#fff", border: "none", cursor: "pointer", position: "relative", zIndex: 1 }}>
            {string["Apply"] || "Apply"}
          </button>
          <button onClick={handleReset} style={{ padding: "4px 12px", background: "#ddd", border: "none", cursor: "pointer", position: "relative", zIndex: 1 }}>
            {string["Reset"] || "Reset"}
          </button>
        </div>
      </div>
    </div>
  );
};

ShopPriceFilter.propTypes = {
  getSortParams: PropTypes.func,
  string: PropTypes.object
};

export default ShopPriceFilter;
