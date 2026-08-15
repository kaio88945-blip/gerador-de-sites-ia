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

    // API KEY DA GROQ
    const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";
    const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    // PROMPT MASTER PROFISSIONAL
    const promptMaster = `
Você é um Copywriter e Web Designer de nível mundial especializado em Landing Pages de Alta Conversão.
Sua missão é criar o código de um site extremamente profissional, moderno, bonito, elegante e visualmente impressionante em HTML5 puro.

DADOS DA EMPRESA/PROFISSIONAL:
- Nome: ${nome || 'Empresa'}
- Segmento/Nicho: ${nicho || 'Serviços'}
- Sobre/Descrição: ${descricao || 'Ajudando clientes com soluções de excelência.'}
- Estilo Visual: ${dados.estilo || 'Elegante e Luxuoso'}
- Cor Principal: ${dados.cor_primaria || '#6366f1'}
- WhatsApp de Contato: ${numeroLimpo}

REGRAS DE CONTEÚDO E ESTRUTURA:
1. Escreva textos persuasivos, headlines chamativas e argumentos de venda completos.
2. Inclua o Tailwind CSS no <head> (<script src="https://cdn.tailwindcss.com"></script>).
3. Inclua Ícones do FontAwesome no <head> (<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">).
4. ESTRUTURA OBRIGATÓRIA DA LANDING PAGE:
   - Header fixo com nome/logo e links de navegação.
   - Hero Section com título de impacto gigante, subhead explicativo e botão principal estilo CTA.
   - Seção Estatísticas / Números de Impacto.
   - Seção "Sobre Nós / História" persuasiva.
   - Seção de "Nossos Serviços / Soluções" formatados em cards interativos.
   - Seção de "Depoimentos de Clientes" com estrelas de avaliação.
   - Seção "Perguntas Frequentes (FAQ)".
   - Seção Call to Action (CTA) Final com botão do WhatsApp.
   - Footer elegante com direitos autorais.

IMPORTANTE: Retorne APENAS o código HTML puro começando em <!DOCTYPE html> e terminando em </html>. Não adicione textos antes nem depois. Não use marcações do tipo \`\`\`html.
`;

    // Chamada para a API da Groq (Llama 3.3 70B Versatile)
    const respGroq = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Você é um gerador de código HTML/Tailwind altamente preciso que retorna apenas código web funcional." },
          { role: "user", content: promptMaster }
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    const dataGroq = await respGroq.json();

    if (dataGroq.error) {
      console.error("Erro na API da Groq:", dataGroq.error);
      return res.status(400).json({ success: false, error: `Erro na Groq: ${dataGroq.error.message}` });
    }

    let siteHtml = dataGroq?.choices?.[0]?.message?.content || "";

    // Limpeza de marcações markdown se houver
    siteHtml = siteHtml.replace(/```html/gi, '').replace(/```/g, '').trim();

    if (!siteHtml || siteHtml.length < 100) {
      return res.status(500).json({ success: false, error: 'A IA não retornou um código HTML válido.' });
    }

    // Notificação do Robô no Railway
    const URL_ROBO = 'https://bot-whatsapp-production-c379.up.railway.app/send-message';
    const textoMensagem = `Olá, ${nome}! 🚀\n\nSeu site profissional foi gerado com sucesso pela nossa Inteligência Artificial (Groq)!\n\nAcesse a plataforma para visualizar a prévia completa.`;

    try {
      await fetch(URL_ROBO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: numeroLimpo, text: textoMensagem })
      });
    } catch (eRobo) {
      console.error("Erro ao avisar robô:", eRobo);
    }

    return res.status(200).json({ success: true, html: siteHtml });

  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
