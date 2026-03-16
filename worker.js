/**
 * Cloudflare Worker para envio de e-mail via API REST da Brevo (Sendinblue)
 * Recebe requisições POST do formulário de contato e envia o e-mail pela API.
 */

// A chave da API agora será injetada via variável de ambiente do Cloudflare (env.BREVO_API_KEY)
const EMAIL_TO = "89ad31001@smtp-brevo.com";
 

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Em produção, altere para "https://confrariaweb.com.br"
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env, ctx) {
    // Lidar com requisição CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    try {
      // Pega os dados JSON do formulário
      const data = await request.json();
      
      const { name, email, phone, message } = data;

      if (!name || !email || !message) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      // Monta o payload para a API da Brevo
      const brevoPayload = {
        sender: {
          name: name,
          email: email
        },
        to: [
          {
            email: EMAIL_TO,
            name: "Confraria Web Contato"
          }
        ],
        subject: `Novo Contato do Site: ${name}`,
        htmlContent: `
          <h3>Novo Contato Recebido pelo Site Institucional</h3>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Telefone/WhatsApp:</strong> ${phone || 'Não informado'}</p>
          <hr>
          <p><strong>Mensagem:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      };

      // Faz a requisição para a API da Brevo
      const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "api-key": env.BREVO_API_KEY
        },
        body: JSON.stringify(brevoPayload)
      });

      if (!brevoResponse.ok) {
        const errorData = await brevoResponse.text();
        console.error("Brevo API Error:", errorData);
        throw new Error("Failed to send email via Brevo");
      }

      // Sucesso
      return new Response(JSON.stringify({ success: true, message: "E-mail enviado com sucesso" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });

    } catch (error) {
      console.error("Worker Error:", error.message);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};
