/**
 * Cloudflare Pages Function — envio de e-mail via API Brevo
 * Rota: POST /api/contact
 *
 * Variável de ambiente necessária (Cloudflare Pages → Settings → Environment Variables):
 *   BREVO_API_KEY  (marcar como Secret)
 *
 * Remetente verificado necessário na Brevo:
 *   contato@confrariaweb.com.br
 */

const EMAIL_TO   = "contato@confrariaweb.com.br";
const EMAIL_FROM = "contato@confrariaweb.com.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://confrariaweb.com.br",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function onRequestPost({ request, env }) {
  // Preflight CORS
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await request.json();
    const { name, email, phone, message } = data;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios ausentes." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const safeName    = escapeHtml(name);
    const safeEmail   = escapeHtml(email);
    const safePhone   = escapeHtml(phone || "Não informado");
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    const brevoPayload = {
      sender:  { name: "Confraria Web", email: EMAIL_FROM },
      replyTo: { email: email, name: name },
      to: [{ email: EMAIL_TO, name: "Confraria Web" }],
      subject: `Novo contato do site: ${safeName}`,
      htmlContent: `
        <h3>Novo contato recebido pelo site</h3>
        <p><strong>Nome:</strong> ${safeName}</p>
        <p><strong>E-mail:</strong> ${safeEmail}</p>
        <p><strong>Telefone/WhatsApp:</strong> ${safePhone}</p>
        <hr>
        <p><strong>Mensagem:</strong></p>
        <p>${safeMessage}</p>
      `,
    };

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify(brevoPayload),
    });

    if (!brevoResponse.ok) {
      const errorText = await brevoResponse.text();
      console.error("Brevo API Error:", errorText);
      throw new Error("Falha ao enviar e-mail via Brevo.");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("Pages Function Error:", error.message);
    return new Response(JSON.stringify({ error: "Erro interno. Tente novamente." }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}
