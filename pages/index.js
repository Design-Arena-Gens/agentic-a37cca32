import { useMemo, useState } from 'react';
import Head from 'next/head';
import clsx from 'clsx';
import productsData from '@/product-data.json';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export default function Home() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const products = productsData;

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  function addToCart(product) {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }

  function updateQuantity(id, delta) {
    setCartItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p))
        .filter((p) => p.quantity > 0)
    );
  }

  async function handleCheckout(e) {
    e.preventDefault();
    setIsCheckingOut(true);
    setOrderResult(null);
    try {
      const formData = new FormData(e.currentTarget);
      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        address: formData.get('address'),
        items: cartItems,
        total: cartTotal
      };
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      setOrderResult(json);
      if (json?.success) setCartItems([]);
    } catch (err) {
      setOrderResult({ success: false, message: 'Checkout failed. Try again.' });
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <>
      <Head>
        <title>Agentic Storefront</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="A simple modern e-commerce page." />
      </Head>
      <header className="container header">
        <div className="brand">
          <span className="logo">???</span>
          <span className="brand-text">Agentic Shop</span>
        </div>
        <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
          Cart <span className="pill">{cartItems.reduce((a, c) => a + c.quantity, 0)}</span>
        </button>
      </header>

      <main className="container">
        <section className="hero">
          <h1>Discover products you&apos;ll love</h1>
          <p>Modern, fast, and deployable on Vercel.</p>
        </section>

        <section className="grid">
          {products.map((p) => (
            <article key={p.id} className="card">
              <div className="image-wrap">
                <img src={p.image} alt={p.name} className="image" />
              </div>
              <div className="card-body">
                <h3 className="card-title">{p.name}</h3>
                <p className="card-desc">{p.description}</p>
                <div className="row">
                  <span className="price">{formatCurrency(p.price)}</span>
                  <button className="primary" onClick={() => addToCart(p)}>
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer className="container footer">
        <span>? {new Date().getFullYear()} Agentic Shop</span>
        <a href="https://vercel.com" target="_blank" rel="noreferrer">
          Deployed on Vercel
        </a>
      </footer>

      <aside className={clsx('cart-drawer', isCartOpen && 'open')}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="icon" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            ?
          </button>
        </div>
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <p className="muted">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">
                    {item.quantity} ? {formatCurrency(item.price)}
                  </div>
                </div>
                <div className="cart-actions">
                  <button className="icon" onClick={() => updateQuantity(item.id, -1)}>-</button>
                  <button className="icon" onClick={() => updateQuantity(item.id, +1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          <div className="row">
            <span className="muted">Subtotal</span>
            <strong>{formatCurrency(cartTotal)}</strong>
          </div>
          <details className="checkout">
            <summary className="primary outline">Proceed to checkout</summary>
            <form onSubmit={handleCheckout} className="checkout-form">
              <input name="name" placeholder="Full name" required />
              <input name="email" type="email" placeholder="Email" required />
              <textarea name="address" placeholder="Shipping address" rows={3} required />
              <button className="primary" type="submit" disabled={isCheckingOut || cartItems.length === 0}>
                {isCheckingOut ? 'Processing?' : `Pay ${formatCurrency(cartTotal)}`}
              </button>
              {orderResult && (
                <p className={clsx('status', orderResult.success ? 'success' : 'error')}>
                  {orderResult.message}
                </p>
              )}
            </form>
          </details>
        </div>
      </aside>

      <div className={clsx('scrim', isCartOpen && 'show')} onClick={() => setIsCartOpen(false)} />
    </>
  );
}

