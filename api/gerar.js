export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const dados = req.body;
    const { nome, whatsapp, nicho, descricao, imagens_personalizadas } = dados;

    if (!whatsapp) {
      return res.status(400).json({ success: false, error: 'Número de WhatsApp é obrigatório!' });
    }

    let numeroLimpo = String(whatsapp).replace(/\D/g, '');
    if (!numeroLimpo.startsWith('55')) {
      numeroLimpo = '55' + numeroLimpo;
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";
    const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    // Mapeamento e formatação das imagens personalizadas enviadas no briefing
    let textoImagensPersonalizadas = "";
    if (imagens_personalizadas && Array.isArray(imagens_personalizadas) && imagens_personalizadas.length > 0) {
      textoImagensPersonalizadas = "IMAGENS ENVIADAS PELO CLIENTE PARA INCLUIR NO SITE:\n" +
        imagens_personalizadas.map((img, i) => `- Imagem ${i + 1}: URL: "${img.url}" | Descrição/Uso: "${img.descricao}"`).join("\n");
    }

    // PROMPT MASTER PROFISSIONAL DE ALTA PRECISÃO
    const promptMaster = `
Você é um Engenheiro de Software Front-end e UX/UI Designer Senior de nível internacional.
Sua missão é criar o código completo de um site de altíssima conversão em HTML5 puro, sem erros de codificação, sem caracteres corrompidos, com layout 100% centralizado, responsivo e visualmente perfeito.

REFERÊNCIA DE ESTILO E QUALIDADE:
Siga o padrão de elegância em Dark Mode luxuoso do modelo https://pyerry-diniz-nutri-personal.vercel.app/

REGRAS RÍGIDAS DE TÉCNICA E CSS:
1. O HTML DEVE iniciar obrigatoriamente com:
   <!DOCTYPE html>
   <html lang="pt-BR">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <script src="https://cdn.tailwindcss.com"></script>
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
     <style>
       * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
       body { background-color: #0b0f17 !important; color: #f8fafc !important; overflow-x: hidden; }
       .container-custom { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
       .bg-card { background-color: rgba(17, 24, 39, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(12px); }
     </style>
   </head>

2. CENTRALIZAÇÃO E LAYOUT:
   - Todas as seções DEVEM utilizar contêineres centralizados ('container-custom' ou 'max-w-6xl mx-auto px-4').
   - NENHUM elemento pode ficar descentralizado ou desalinhado.
   - Grids devem ter espaçamento harmônico (ex: 'grid grid-cols-1 md:grid-cols-3 gap-8').

3. IMAGENS NOS DEPOIMENTOS (OBRIGATÓRIO):
   - Crie exatamente 3 cards de depoimentos de clientes satisfeitos.
   - Cada card DEVE ter a foto de perfil do cliente usando ESTAS URLs estáticas do Unsplash:
     * Cliente 1: <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" class="w-14 h-14 rounded-full object-cover border-2 border-indigo-500" alt="Foto do Cliente">
     * Cliente 2: <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" class="w-14 h-14 rounded-full object-cover border-2 border-indigo-500" alt="Foto do Cliente">
     * Cliente 3: <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" class="w-14 h-14 rounded-full object-cover border-2 border-indigo-500" alt="Foto do Cliente">
   - Inclua estrelas de avaliação amarelas (<i class="fas fa-star text-yellow-400"></i>) em cada depoimento.

DADOS DA EMPRESA E CLIENTE:
- Nome/Marca: ${nome || 'Kaio - Especialista'}
- Segmento/Nicho: ${nicho || 'Serviços Profissionais'}
- Descrição/História: ${descricao || 'Ajudando clientes a alcançarem resultados com estratégias de alto impacto.'}
- Slogan: ${dados.slogan || ''}
- Público Alvo: ${dados.publico_alvo || ''}
- Diferenciais: ${dados.diferenciais || ''}
- Cor de Destaque (Botões/Acentos): ${dados.cor_primaria || '#6366f1'}
- Botão CTA: "${dados.cta_texto || 'Falar no WhatsApp'}"
- WhatsApp do Botão: ${numeroLimpo}

${textoImagensPersonalizadas}

ESTRUTURA DE SEÇÕES DA LANDING PAGE:
1. Header Fixo com efeito Blur, logo/nome, links do menu e botão destacado para o WhatsApp.
2. Hero Section com Headline chamativa gigante centralizada, subtítulo explicativo, badges e botão CTA.
3. Seção de Estatísticas (3 a 4 números de autoridade centralizados, ex: +500 Clientes, 99% Satisfação).
4. Seção "Sobre Nós / Apresentação" com argumentos de vendas completos e imagem representativa.
5. Seção de "Serviços e Soluções" em Grid de Cards com ícones do FontAwesome e efeitos de hover.
6. Seção com as Imagens Personalizadas enviadas pelo cliente (se houver no briefing) organizadas em uma galeria/grid elegante com suas respectivas descrições.
7. Seção de Depoimentos (3 cards com fotos de perfil do Unsplash fornecidas e estrelas).
8. Seção de Perguntas Frequentes (FAQ) com 6 perguntas essenciais sanfonadas/organizadas.
9. Seção de Chamada Final para Ação (CTA) em destaque para o WhatsApp.
10. Rodapé completo centralizado.

IMPORTANTE: Retorne EXCLUSIVAMENTE o código HTML5 completo do início ao fim. Não escreva textos antes ou depois. Não utilize marcações markdown tipo \`\`\`html.
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
          { role: "system", content: "Você é um compilador de código HTML/Tailwind de nível profissional. Retorne apenas HTML válido em UTF-8 com layout centralizado em Dark Mode sem markdown." },
          { role: "user", content: promptMaster }
        ],
        temperature: 0.5,
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

    // Notificação do Robô no Railway
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
