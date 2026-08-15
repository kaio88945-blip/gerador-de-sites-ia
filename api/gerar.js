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

    // 1. Limpeza do número do WhatsApp
    let numeroLimpo = String(whatsapp).replace(/\D/g, '');
    if (!numeroLimpo.startsWith('55')) {
      numeroLimpo = '55' + numeroLimpo;
    }

    // 2. CHAVE DA API DO GEMINI
    const GEMINI_API_KEY = "AQ.Ab8RN6LIjQTDHM9i817TEAVLku-rLLmQtxn8xKf_AkXsHW3hKw";
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // 3. PROMPT BASE MASTER PARA A IA DE
    const promptMaster = `
Você é um Engenheiro de Software e Web Designer de nível internacional.
Sua missão é criar um site HTML completo, responsivo, moderno, elegante e de altíssimo nível para uma empresa.

DADOS DO BRIEFING DA EMPRESA:
- Nome da Empresa: ${nome || 'Sua Empresa'}
- Segmento/Nicho: ${nicho || 'Geral'}
- Descrição/História: ${descricao || 'Sua história e diferenciais'}
- Estilo Visual: ${dados.estilo || 'Moderno e Dark'}
- Cor Principal: ${dados.cor_primaria || '#6366f1'}
- Cor Secundária: ${dados.cor_secundaria || '#22c55e'}
- Slogan: ${dados.slogan || ''}
- Público Alvo: ${dados.publico_alvo || ''}
- Diferenciais: ${dados.diferenciais || ''}
- Botão Principal (CTA): "${dados.cta_texto || 'Entrar em Contato'}"
- WhatsApp de Contato: ${numeroLimpo}

REGRAS OBRIGATÓRIAS DE CÓDIGO E DESIGN:
1. Retorne APENAS o código HTML puro, iniciando diretamente em <!DOCTYPE html> e terminando em </html>. NÃO use blocos de código com de marcação de texto como markdown (\`\`\`html).
2. Inclua o Tailwind CSS via CDN no <head> (<script src="https://cdn.tailwindcss.com"></script>).
3. Inclua Ícones do FontAwesome no <head> (<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">).
4. Utilize as cores do briefing nos botões, destaques e elementos principais.
5. O site DEVE ter estrutura completa:
   - Header fixo com logo/nome e links de navegação.
   - Hero Section marcante com título grande, subtítulo envolvente e o botão CTA principal chamativo.
   - Seção "Sobre Nós" bem escrita.
   - Seção de Serviços/Produtos formatada em Cards interativos.
   - Seção de Oferta/Gatilho de Urgência (caso haja).
   - Seção de Depoimentos/Avaliações com estrelas de satisfação.
   - Seção de Perguntas Frequentes (FAQ).
   - Rodapé completo com links sociais e formulário/botão direto de WhatsApp.
`;

    // 4. Chamada para a IA Gemini
    const respGemini = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptMaster }] }]
      })
    });

    const dataGemini = await respGemini.json();
    let siteHtml = dataGemini?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Limpa eventuais marcações de código da IA
    siteHtml = siteHtml.replace(/```html/gi, '').replace(/```/g, '').trim();

    if (!siteHtml) {
      siteHtml = `<h1>${nome}</h1><p>${descricao}</p>`;
    }

    // 5. Disparo da Notificação via Robô do WhatsApp no Railway
    const URL_ROBO = 'https://bot-whatsapp-production-c379.up.railway.app/send-message';
    const textoMensagem = `Olá, ${nome}! 🚀\n\nSeu site profissional foi gerado com sucesso pela nossa Inteligência Artificial!\n\nAcesse sua plataforma para visualizar a prévia completa.`;

    try {
      await fetch(URL_ROBO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: numeroLimpo,
          text: textoMensagem
        })
      });
    } catch (eRobo) {
      console.error("Erro ao avisar robô:", eRobo);
    }

    // Retorna o HTML gerado diretamente para o site exibir no iframe
    return res.status(200).json({ 
      success: true, 
      html: siteHtml 
    });

  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
