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

    // PROMPT BASE MASTER COM A SUA REFERÊNCIA
    const promptMaster = `
Você é um Copywriter, Engenheiro de Software e Web Designer de nível mundial especializado em Landing Pages de Alta Conversão.
Crie o código completo de um site extremamente profissional, moderno, elegante e visualmente impressionante em UM ÚNICO ARQUIVO HTML5 PURO.

INSTRUÇÕES E PROMPT BASE DE REFERÊNCIA:
Crie um site profissional tomando como principal referência a estrutura, proposta e organização do seguinte site: https://pyerry-diniz-nutri-personal.vercel.app/
Não copie o site exatamente. Utilize-o apenas como referência de estrutura, proposta e organização das informações, mas desenvolva uma versão mais completa, moderna, sofisticada e visualmente superior.
O novo site deve ser significativamente mais extenso, com mais seções, informações e elementos visuais que transmitam profissionalismo, autoridade e qualidade.

DESIGN E EXPERIÊNCIA VISUAL:
- Desenvolva um design premium, moderno e elegante (use Dark Theme escuro e sofisticado ou cores elegantes ajustadas ao negócio).
- Crie uma identidade visual mais impactante e sofisticada que a do site de referência.
- Utilize uma hierarquia visual clara, com títulos fortes e chamadas para ação (CTA) bem destacadas.
- O layout deve ser 100% responsivo, funcionando perfeitamente em celulares, tablets e computadores (priorizando mobile).
- Utilize Tailwind CSS no <head> (<script src="https://cdn.tailwindcss.com"></script>).
- Utilize FontAwesome para ícones (<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">).
- Utilize a biblioteca AOS para animações de rolagem no <head> e <script> (<link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" /> e no final da página <script src="https://unpkg.com/aos@next/dist/aos.js"></script> e inicialize com <script>AOS.init({duration: 800, once: true});</script>).

DADOS DA EMPRESA / CLIENTE RECEBIDOS DO FORMULÁRIO:
- Nome da Empresa/Marca: ${nome || 'Empresa'}
- Segmento/Nicho: ${nicho || 'Serviços Profissionais'}
- Slogan/Frase: ${dados.slogan || ''}
- Descrição/História/Serviços: ${descricao || 'Ajudando clientes com soluções de excelência.'}
- Público Alvo: ${dados.publico_alvo || ''}
- Diferenciais: ${dados.diferenciais || ''}
- Estilo Visual: ${dados.estilo || 'Elegante e Luxuoso'}
- Cor Principal: ${dados.cor_primaria || '#6366f1'}
- Botão Principal (CTA): ${dados.cta_texto || 'Entrar em Contato'}
- WhatsApp de Contato: ${numeroLimpo}

ESTRUTURA OBRIGATÓRIA DA LANDING PAGE (SEJA MUITO COMPLETO E EXTENSO):
1. Header moderno e responsivo fixo com blur/transparência, logo/nome e botões de navegação.
2. Hero Section impactante com título de autoridade gigante, subhead envolvente, selos de garantia e botão principal CTA do WhatsApp.
3. Seção Estatísticas / Números de Impacto (Contadores como +500 Clientes, 99% Satisfação, etc.).
4. Seção Apresentação Profissional e Sobre a Empresa (História persuasiva, diferenciais).
5. Seção de Serviços / Planos / Soluções formatada em Cards 3D interativos com ícones e hover.
6. Seção Processo de Funcionamento / Passo a Passo (Como funciona o serviço).
7. Seção de Oferta Especial / Promoção com gatilho de urgência.
8. Seção de Depoimentos: Adicione 3 depoimentos realistas com fotos de perfil reais do Unsplash (ex: https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150, https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150), nomes, identificação do cliente, texto natural e avaliação 5 estrelas amarelas.
9. Seção FAQ (Perguntas Frequentes): Adicione uma seção com 8 perguntas frequentes relevantes com sistema de acordeão interativo em JavaScript.
10. Seção Final de Conversão (CTA de fechamento) + Footer completo com redes sociais e contatos.

ANIMAÇÕES OBRIGATÓRIAS:
- Adicione atributos data-aos="fade-up", data-aos="zoom-in", data-aos="fade-right" nas seções, cards, títulos e depoimentos para criar animações fluidas e elegantes durante a rolagem da página.
- Adicione script de JavaScript para o acordeão do FAQ funcionar ao clicar.

IMPORTANTE: Retorne APENAS o código HTML puro começando diretamente em <!DOCTYPE html> e terminando em </html>. Não inclua conversas, explicações antes/depois ou marcações do tipo \`\`\`html.
`;

    // Chamada para a API da Groq (Llama 3.3 70B)
    const respGroq = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Você é um gerador de código HTML/Tailwind altamente preciso que retorna apenas código web funcional e de design premium." },
          { role: "user", content: promptMaster }
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    const dataGroq = await respGroq.json();

    if (dataGroq.error) {
      console.error("Erro na Groq:", dataGroq.error);
      return res.status(400).json({ success: false, error: `Erro na Groq: ${dataGroq.error.message}` });
    }

    let siteHtml = dataGroq?.choices?.[0]?.message?.content || "";

    // Limpeza de marcações markdown
    siteHtml = siteHtml.replace(/```html/gi, '').replace(/```/g, '').trim();

    if (!siteHtml || siteHtml.length < 100) {
      return res.status(500).json({ success: false, error: 'A IA não retornou um código HTML válido.' });
    }

    // Notificação do Robô no Railway
    const URL_ROBO = 'https://bot-whatsapp-production-c379.up.railway.app/send-message';
    const textoMensagem = `Olá, ${nome}! 🚀\n\nSeu site profissional no modelo Premium foi gerado com sucesso pela nossa Inteligência Artificial!\n\nAcesse a plataforma para visualizar a prévia completa em tela cheia!`;

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
