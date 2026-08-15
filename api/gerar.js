export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const dados = req.body;
    const { nome, whatsapp, nicho, descricao } = dados;

    if (!whatsapp) {
      return res.status(400).json({ success: false, error: 'Número de WhatsApp é obrigatório!' });
    }

    let numeroLimpo = String(whatsapp).replace(/\D/g, '');
    if (!numeroLimpo.startsWith('55')) {
      numeroLimpo = '55' + numeroLimpo;
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AQ.Ab8RN6LIjQTDHM9i817TEAVLku-rLLmQtxn8xKf_AkXsHW3hKw";
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // SUPER PROMPT MASTER PROFISSIONAL
    const promptMaster = `
Você é um Copywriter e Web Designer de nível mundial especializado em Landing Pages de Alta Conversão.
Crie o código de um site extremamente profissional, moderno, elegante e visualmente impressionante em HTML5 puro.

DADOS DA EMPRESA/PROFISSIONAL:
- Nome: ${nome || 'Kaio - Especialista'}
- Segmento/Nicho: ${nicho || 'Marketing Digital e Vendas'}
- Sobre/Descrição: ${descricao || 'Ajudando empresas a alavancarem suas vendas online'}
- Estilo: ${dados.estilo || 'Elegante e Luxuoso'}
- Cor Principal: ${dados.cor_primaria || '#6366f1'}
- WhatsApp de Contato: ${numeroLimpo}

REGRAS DE CONTEÚDO E ESTRUTURA (SEJA MUITO COMPLETO E EXTENSO):
1. Escreva copywriters persuasivos, com headlines chamativas, gatilhos de autoridade, prova social e dor do cliente.
2. Expanda as informações fornecidas, criando argumentos de venda completos.
3. Inclua Tailwind CSS no <head> (<script src="https://cdn.tailwindcss.com"></script>).
4. Inclua FontAwesome CDN (<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">).
5. ESTRUTURA OBRIGATÓRIA DA LANDING PAGE:
   - Header fixo transparente/blur com logo/nome e botões de navegação.
   - Hero Section com título de impacto gigante, subhead explicativo, selos de garantia e botão principal estilo CTA.
   - Seção Estatísticas / Números de Impacto (Ex: +100 Clientes Atendidos, 99% Satisfação, etc.).
   - Seção "Sobre Mim / Sobre a Empresa" com história persuasiva e pontos fortes.
   - Seção de "Nossos Serviços / Soluções" formatados em cards 3D/Hover incríveis com ícones.
   - Seção de "Depoimentos de Clientes" (Crie 3 depoimentos realistas com fotos de avatar do Unsplash e avaliação 5 estrelas).
   - Seção "Perguntas Frequentes (FAQ)" com acordeão de dúvidas comuns respondidas.
   - Seção Call to Action (CTA) Final de urgência com botão do WhatsApp.
   - Footer elegante com direitos autorais e links.

IMPORTANTE: Retorne APENAS o código HTML puro sem explicações e sem blocos de markdown.
`;

    const respGemini = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptMaster }] }]
      })
    });

    const dataGemini = await respGemini.json();
    let siteHtml = dataGemini?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    siteHtml = siteHtml.replace(/```html/gi, '').replace(/```/g, '').trim();

    if (!siteHtml || siteHtml.length < 200) {
      throw new Error("A IA não gerou o HTML completo. Verifique a chave da API.");
    }

    // Notificação do Robô
    const URL_ROBO = 'https://bot-whatsapp-production-c379.up.railway.app/send-message';
    const textoMensagem = `Olá, ${nome}! 🚀\n\nSeu site profissional foi gerado com sucesso pela nossa Inteligência Artificial!\n\nAcesse o gerador para abrir e visualizar seu site completo!`;

    try {
      await fetch(URL_ROBO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: numeroLimpo, text: textoMensagem })
      });
    } catch (e) {}

    return res.status(200).json({ success: true, html: siteHtml });

  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
