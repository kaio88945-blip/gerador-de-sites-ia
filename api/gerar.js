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

    const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";
    const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    const promptMaster = `
Você é um Web Designer e Copywriter especialista em criar Landing Pages de Alta Conversão no estilo Dark Mode de luxo.
Crie um site extremamente profissional, moderno e completo em um ÚNICO arquivo HTML.

REFERÊNCIA VISUAL DE ESTILO:
Tome como referência a landing page https://pyerry-diniz-nutri-personal.vercel.app/
O site DEVE ser em Dark Mode escuro e sofisticado (use cores de fundo escuro como #0f172a, #0b0f17, #1e293b e textos em branco #ffffff ou cinza claro #f1f5f9). NUNCA deixe o fundo branco.

REGRAS DE TECNOLOGIA:
1. Inclua o Tailwind CSS no <head>: <script src="https://cdn.tailwindcss.com"></script>
2. Inclua FontAwesome no <head>: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
3. Garanta CSS inline no <head> para evitar telas brancas:
   <style>
     body { background-color: #0b0f17 !important; color: #f8fafc !important; font-family: sans-serif; margin: 0; padding: 0; }
     .bg-card { background-color: #111827; border: 1px solid rgba(255,255,255,0.1); }
   </style>

DADOS DO CLIENTE PARA INJETAR NO SITE:
- Nome/Marca: ${nome || 'Kaio - Especialista'}
- Nicho/Área: ${nicho || 'Marketing e Vendas'}
- Sobre/História: ${descricao || 'Ajudando clientes a alcançarem resultados com estratégias de alto impacto.'}
- Slogan: ${dados.slogan || ''}
- Público Alvo: ${dados.publico_alvo || ''}
- Diferenciais: ${dados.diferenciais || ''}
- Cor de Destaque / Botões: ${dados.cor_primaria || '#6366f1'}
- Texto do Botão CTA: ${dados.cta_texto || 'Entrar em Contato no WhatsApp'}
- WhatsApp do Botão: ${numeroLimpo}

ESTRUTURA COMPLETA DA LANDING PAGE (CRIE SEÇÕES RICAS E EXTENSAS):
1. Header fixo com efeito vidro (backdrop-blur), logo/nome e links de navegação.
2. Hero Section com Headline gigante persuasiva, subhead descritivo, selos de garantia e botão CTA estiloso para WhatsApp.
3. Seção de Números/Estatísticas em destaque (Ex: +500 Clientes, 99% Satisfação, etc.).
4. Seção "Sobre Nós / Apresentação Profissional" bem estruturada.
5. Seção "Nossos Serviços / Soluções" com cards modernos e ícones do FontAwesome.
6. Seção "Processo de Funcionamento / Passo a Passo".
7. Seção de Depoimentos de Clientes: 3 cards elegantes com avatares do Unsplash e 5 estrelas amarelas.
8. Seção FAQ (Perguntas Frequentes): 6 perguntas e respostas expandidas em formato de lista visual elegante.
9. Seção de Chamada Final para Ação (CTA) com botão do WhatsApp chamativo.
10. Footer completo com contatos e redes sociais.

IMPORTANTE: Retorne APENAS o código HTML5 completo e funcional começando diretamente em <!DOCTYPE html> e terminando em </html>. NÃO use blocos de marcação markdown como \`\`\`html.
`;

    const respGroq = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Você é um gerador de código HTML/Tailwind altamente preciso que retorna apenas código web funcional em Dark Mode estilo luxo." },
          { role: "user", content: promptMaster }
        ],
        temperature: 0.6,
        max_tokens: 4096
      })
    });

    const dataGroq = await respGroq.json();

    if (dataGroq.error) {
      console.error("Erro na Groq:", dataGroq.error);
      return res.status(400).json({ success: false, error: `Erro na Groq: ${dataGroq.error.message}` });
    }

    let siteHtml = dataGroq?.choices?.[0]?.message?.content || "";

    siteHtml = siteHtml.replace(/```html/gi, '').replace(/```/g, '').trim();

    if (!siteHtml || siteHtml.length < 100) {
      return res.status(500).json({ success: false, error: 'A IA não retornou um código HTML válido.' });
    }

    // Notificação do Robô
    const URL_ROBO = 'https://bot-whatsapp-production-c379.up.railway.app/send-message';
    const textoMensagem = `Olá, ${nome}! 🚀\n\nSeu site profissional em Dark Mode foi gerado com sucesso pela nossa IA!\n\nAcesse a plataforma para visualizar a prévia completa em tela cheia.`;

    try {
      await fetch(URL_ROBO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: numeroLimpo, text: textoMensagem })
      });
    } catch (eRobo) {
      console.error("Erro no robô:", eRobo);
    }

    return res.status(200).json({ success: true, html: siteHtml });

  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
