import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function App() {
  const [designs, setDesigns] = useState([]);
  const [whatsapp, setWhatsapp] = useState("966553069295");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    description: ""
  });

  useEffect(() => {
    loadWebsite();
  }, []);

  async function loadWebsite() {
    try {
      const { data } = await supabase
        .from("designs")
        .select("*")
        .eq("is_active", true);

      if (data) setDesigns(data);

      const { data: settings } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "whatsapp_number")
        .maybeSingle();

      if (settings?.setting_value) {
        setWhatsapp(settings.setting_value);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function sendOrder(e) {
    e.preventDefault();

    if (!selected) return;

    const message =
      `New Design Order\n` +
      `Design: ${selected.title}\n` +
      `Name: ${form.name}\n` +
      `Phone: ${form.phone}\n` +
      `Details: ${form.description}`;

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

    const { data: auth } = await supabase.auth.getUser();

    const { error } = await supabase.from("orders").insert({
      user_id: auth.user?.id || null,
      design_id: selected.id,
      customer_name: form.name,
      customer_phone: form.phone,
      description: form.description
    });

    if (error) {
      alert("WhatsApp will open, but the order could not be saved in the database.");
      console.error(error);
    }

    window.open(url, "_blank");

    setSelected(null);
    setForm({ name: "", phone: "", description: "" });
  }

  return (
    <main className="website">
      <header className="header">
        <h1>M0H7AMED ALI <span>DESIGNS</span></h1>
        <p>CREATIVE DESIGN STUDIO</p>
      </header>

      <section className="hero">
        <p>WELCOME TO MY WORLD</p>
        <h2>DESIGN THAT<br /><span>MAKES YOU STAND OUT.</span></h2>
        <p>Explore creative designs made with passion.</p>
      </section>

      <section className="gallery">
        <h2>OUR DESIGNS</h2>

        {loading ? (
          <p>Loading designs...</p>
        ) : designs.length === 0 ? (
          <p>No designs available yet.</p>
        ) : (
          <div className="design-grid">
            {designs.map((design) => (
              <article className="design-card" key={design.id}>
                <div className="design-image">
                  {design.image_path && (
                    <img src={design.image_path} alt={design.title} />
                  )}
                </div>
                <h3>{design.title}</h3>
                <p>{design.category}</p>
                <button onClick={() => setSelected(design)}>
                  ORDER THIS DESIGN
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="modal">
          <form onSubmit={sendOrder} className="order-form">
            <button
              type="button"
              className="close"
              onClick={() => setSelected(null)}
            >
              ×
            </button>

            <h2>ORDER DESIGN</h2>
            <p>{selected.title}</p>

            <input
              required
              placeholder="Your Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              required
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <textarea
              placeholder="Describe your request..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <button type="submit">SEND ORDER VIA WHATSAPP</button>
          </form>
        </div>
      )}

      <footer>
        © 2026 M0H7AMED ALI DESIGNS
      </footer>
    </main>
  );
}