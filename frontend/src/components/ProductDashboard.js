import React, { useEffect, useMemo, useState } from "react";
import { api, clearTokens, formatApiError, parseJwtPayload, getAccessToken } from "../api/client";
import TaglineSection from "../TaglineSection";

function ProductDashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_name: "",
    product_type: "",
    price: "",
    quantity: "",
  });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  const claims = useMemo(() => parseJwtPayload(getAccessToken()), []);
  const email = claims?.sub || "Signed in";

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/");
      setProducts(res.data);
      setError("");
    } catch (err) {
      setError(formatApiError(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;
    const q = filter.trim().toLowerCase();
    if (q) {
      filtered = products.filter(
        (p) =>
          String(p.id).toLowerCase().includes(q) ||
          p.product_name?.toLowerCase().includes(q) ||
          p.product_type?.toLowerCase().includes(q)
      );
    }
    return [...filtered].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "price" || sortField === "quantity") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = String(aVal ?? "").toLowerCase();
        bVal = String(bVal ?? "").toLowerCase();
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [products, filter, sortField, sortDirection]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ product_name: "", product_type: "", price: "", quantity: "" });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        product_name: form.product_name,
        product_type: form.product_type,
        price: Number(form.price),
        quantity: Number(form.quantity),
      };
      if (editId) {
        await api.put(`/products/${encodeURIComponent(editId)}`, payload);
        setMessage("Product updated successfully");
      } else {
        await api.post("/products/", payload);
        setMessage("Product created successfully");
      }
      resetForm();
      await fetchProducts();
    } catch (err) {
      setError(formatApiError(err));
    }
    setLoading(false);
  };

  const handleEdit = (product) => {
    setForm({
      product_name: product.product_name,
      product_type: product.product_type,
      price: String(product.price),
      quantity: String(product.quantity),
    });
    setEditId(product.id);
    setMessage("");
    setError("");
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await api.delete(`/products/${encodeURIComponent(id)}`);
      setMessage("Product deleted successfully");
      await fetchProducts();
    } catch (err) {
      setError(formatApiError(err));
    }
    setLoading(false);
  };

  const logout = () => {
    clearTokens();
    onLogout();
  };

  const currency = (n) =>
    typeof n === "number" ? n.toFixed(2) : Number(n || 0).toFixed(2);

  return (
    <div className="app-bg">
      <header className="topbar">
        <div className="brand">
          <span className="brand-badge">📦</span>
          <div>
            <h1>Telusko Trac</h1>
            <div className="user-chip">{email}</div>
          </div>
        </div>
        <div className="top-actions">
          <button className="btn btn-light" type="button" onClick={fetchProducts} disabled={loading}>
            Refresh
          </button>
          <button className="btn btn-light" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <div className="container">
        <div className="stats">
          <div className="chip">Total: {products.length}</div>
          <div className="search">
            <input
              type="text"
              placeholder="Search by id, name, or type…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="content-grid">
          <div className="card form-card">
            <h2>{editId ? "Edit product" : "Add product"}</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <input
                type="text"
                name="product_name"
                placeholder="Product name"
                value={form.product_name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="product_type"
                placeholder="Product type"
                value={form.product_type}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                min="0"
                step="1"
              />
              <div className="form-actions">
                <button className="btn" type="submit" disabled={loading}>
                  {editId ? "Update" : "Add"}
                </button>
                {editId && (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                      resetForm();
                      setMessage("");
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            {message ? <div className="success-msg">{message}</div> : null}
            {error ? <div className="error-msg">{error}</div> : null}
          </div>

          <TaglineSection />

          <div className="card list-card">
            <h2>Products</h2>
            {loading ? (
              <div className="loader">Loading…</div>
            ) : (
              <div className="scroll-x">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th
                        className={`sortable ${sortField === "id" ? `sort-${sortDirection}` : ""}`}
                        onClick={() => handleSort("id")}
                      >
                        ID
                      </th>
                      <th
                        className={`sortable ${sortField === "product_name" ? `sort-${sortDirection}` : ""}`}
                        onClick={() => handleSort("product_name")}
                      >
                        Name
                      </th>
                      <th
                        className={`sortable ${sortField === "product_type" ? `sort-${sortDirection}` : ""}`}
                        onClick={() => handleSort("product_type")}
                      >
                        Type
                      </th>
                      <th
                        className={`sortable ${sortField === "price" ? `sort-${sortDirection}` : ""}`}
                        onClick={() => handleSort("price")}
                      >
                        Price
                      </th>
                      <th
                        className={`sortable ${sortField === "quantity" ? `sort-${sortDirection}` : ""}`}
                        onClick={() => handleSort("quantity")}
                      >
                        Qty
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="id-cell" title={p.id}>{p.id}</td>
                        <td className="name-cell">{p.product_name}</td>
                        <td className="desc-cell">{p.product_type}</td>
                        <td className="price-cell">${currency(p.price)}</td>
                        <td>
                          <span className="qty-badge">{p.quantity}</span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button type="button" className="btn btn-edit" onClick={() => handleEdit(p)}>
                              Edit
                            </button>
                            <button type="button" className="btn btn-delete" onClick={() => handleDelete(p.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty">
                          No products found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDashboard;
