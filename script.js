// ===== Configuración =====
// Para recibir las solicitudes por email, crea un formulario gratuito en https://formspree.io
// y pega aquí su URL (ej: "https://formspree.io/f/abcdwxyz"). Si queda vacío, el formulario
// solo muestra el mensaje de confirmación (modo demo).
const FORM_ENDPOINT = "";

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const form = document.getElementById("booking-form");
  const fields = document.getElementById("form-fields");
  const success = document.getElementById("form-success");
  const dateInput = document.getElementById("date");
  const messageInput = document.getElementById("message");

  // Año del footer
  document.getElementById("year").textContent = new Date().getFullYear();

  // Borde del header al hacer scroll
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Fecha mínima: mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const toISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  dateInput.min = toISO(tomorrow);

  // "Agendar visita" en una propiedad -> precarga el comentario
  document.querySelectorAll(".card__link[data-property]").forEach((link) => {
    link.addEventListener("click", () => {
      messageInput.value = `Me interesa visitar: ${link.dataset.property}.`;
    });
  });

  // Validación
  const validators = {
    name: (v) => v.trim().length >= 2,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    phone: (v) => v.replace(/\D/g, "").length >= 7,
    type: (v) => v !== "",
    date: (v) => v !== "" && v >= dateInput.min,
    time: (v) => v !== "",
  };

  const validateField = (name) => {
    const input = form.elements[name];
    const ok = validators[name](input.value);
    input.closest(".field").classList.toggle("has-error", !ok);
    return ok;
  };

  Object.keys(validators).forEach((name) => {
    const input = form.elements[name];
    const evt = input.tagName === "SELECT" || input.type === "date" ? "change" : "blur";
    input.addEventListener(evt, () => validateField(name));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("has-error")) validateField(name);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const results = Object.keys(validators).map(validateField);
    if (results.includes(false)) {
      form.querySelector(".has-error input, .has-error select")?.focus();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = "Enviando…";

    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error("Error al enviar");
      }
      document.getElementById("success-name").textContent = form.elements.name.value.trim().split(" ")[0];
      fields.hidden = true;
      success.hidden = false;
    } catch {
      alert("No pudimos enviar tu solicitud. Inténtalo nuevamente en unos minutos.");
    } finally {
      button.disabled = false;
      button.textContent = "Solicitar cita";
    }
  });

  document.getElementById("form-reset").addEventListener("click", () => {
    form.reset();
    success.hidden = true;
    fields.hidden = false;
  });
});
