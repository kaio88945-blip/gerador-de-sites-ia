export default async function handler(req, res) {
  // Configuração de CORS para liberar requisições do seu site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const dados = req.body;
    const { nome, whatsapp, nicho, descricao, imagens_personalizadas } = dados;

    if (!whatsapp) {
      return res.status(400).json({ success: false, error: 'O número de WhatsApp é obrigatório!' });
    }

    // 1. Limpeza e formatação do número do WhatsApp
    let numeroLimpo = String(whatsapp).replace(/\D/g, '');
    if (!numeroLimpo.startsWith('55')) {
      numeroLimpo = '55' + numeroLimpo;
    }

    // 2. CONFIGURAÇÕES DA API DA QWEN (DashScope / Alibaba Cloud)
    const QWEN_API_KEY = process.env.QWEN_API_KEY || "sk-ws-H.DMEDIDR.A3e2.MEQCIBYvIBLMRQFijb7-GkusJzYzSbGUbSgRRNT_OFjGY2A3AiBvQiqyvky59UjJrwnpj6LhN6wSYGUfT6wqE3hnFSyhWQ";
    const QWEN_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";

    // 3. Validação e tratamento das imagens personalizadas enviadas pelo cliente
    let instrucaoGaleriaImagens = "O CLIENTE NÃO ENVIOU IMAGENS PERSONALIZADAS. NUNCA CRIE UMA GALERIA OU QUADROS DE IMAGEM VAZIOS/SKELETONS NA PÁGINA. IGNORE ESSA SEÇÃO COMPLETAMENTE.";
    if (imagens_personalizadas && Array.isArray(imagens_personalizadas) && imagens_personalizadas.length > 0) {
      const fotosValidas = imagens_personalizadas.filter(img => img.url && img.url.trim().length > 5);
      if (fotosValidas.length > 0) {
        instrucaoGaleriaImagens = "O CLIENTE ENVIOU AS SEGUINTES IMAGENS PARA O SITE. CRIE UMA SEÇÃO DE GALERIA/PROTÓTIPO ELEGANTE APENAS SE ELAS EXISTIREM:\n" +
          fotosValidas.map((img, i) => `- Imagem ${i + 1}: URL: "${img.url}" | Descrição/Uso: "${img.descricao || 'Foto do Projeto'}"`).join("\n");
      }
    }

    // 4. PROMPT MASTER COMPLETO PARA A IA QWEN
    const promptMaster = `
Você é um Engenheiro de Software Front-end e UX/UI Designer Sênior de nível internacional, especialista em criação de landing pages modernas, responsivas, visualmente sofisticadas e focadas em alta conversão.
Sua missão é criar o código HTML5 completo de uma landing page de altísima qualidade, utilizando as informações fornecidas abaixo.

REFERÊNCIA DE ESTILO, ESTRUTURA E QUALIDADE:
Utilize como principal referência o seguinte site: https://pyerry-diniz-nutri-personal.vercel.app/
Não copie o site literalmente. Utilize-o apenas como referência de estilo, qualidade visual, organização, identidade, experiência do usuário e proposta.
Crie uma versão muito mais completa, extensa, sofisticada, moderna e visualmente superior.
O design deve seguir uma estética moderna e sofisticada utilizando Dark Mode luxuoso, efeitos de profundidade, transparências, blur, gradientes sutis, cards modernos, bordas elegantes e elementos visuais que transmitam autoridade e profissionalismo.

REGRAS RÍGIDAS DE TÉCNICA E CÓDIGO:
O código deve ser entregue em HTML5 completo, funcional e sem erros de codificação. Não utilize caracteres corrompidos.
O HTML DEVE iniciar obrigatoriamente com:
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nome || 'Landing Page Pro'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
    body { background-color: #0b0f17 !important; color: #f8fafc !important; overflow-x: hidden; }
    .container-custom { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    .bg-card { background-color: rgba(17, 24, 39, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(12px); }
  </style>
</head>

DADOS DA EMPRESA E DO CLIENTE:
- Nome/Marca: ${nome || 'Kaio - Especialista'}
- Segmento/Nicho: ${nicho || 'Serviços Profissionais'}
- Descrição/História: ${descricao || 'Ajudando clientes a alcançarem resultados com estratégias de alto impacto.'}
- Slogan: ${dados.slogan || ''}
- Público-alvo: ${dados.publico_alvo || ''}
- Diferenciais: ${dados.diferenciais || ''}
- Cor de destaque (Botões/Links/Destaques): ${dados.cor_primaria || '#6366f1'}
- Botão CTA: "${dados.cta_texto || 'Falar no WhatsApp'}"
- WhatsApp do Botão: ${numeroLimpo}

INSTRUÇÃO DE IMAGENS PERSONALIZADAS:
${instrucaoGaleriaImagens}

DEPOIMENTOS — OBRIGATÓRIO:
Crie exatamente 3 cards de depoimentos de clientes satisfeitos. Cada depoimento deve parecer natural e realista.
Utilize obrigatoriamente estas imagens estáticas nos <img> dos depoimentos:
- Cliente 1: https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80
- Cliente 2: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80
- Cliente 3: https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80
Cada card deve conter foto com borda, nome, pequena identificação, depoimento e avaliação com 5 estrelas amarelas (<i class="fas fa-star text-yellow-400"></i>).

FAQ — OBRIGATÓRIO:
Crie uma seção com EXATAMENTE 8 perguntas frequentes relevantes com sistema de acordeão interativo em JavaScript (abrir e fechar suavemente com ícone + / - ou seta).

ANIMAÇÕES:
- Inclua animações AOS ('data-aos="fade-up"') em seções, headlines, botões, cards e depoimentos.
- No final da página (antes do </body>), inclua a inicialização da biblioteca AOS:
  <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
  <script>AOS.init({ duration: 800, once: true });</script>

ESTRUTURA COMPLETA DA LANDING PAGE:
1. HEADER FIXO com efeito Blur, logo/nome, links de navegação e botão CTA destacado para o WhatsApp. Menu hambúrguer funcional para mobile.
2. HERO SECTION impactante com Headline gigante, subhead persuasivo, badges de autoridade e botão principal estilo CTA.
3. SEÇÃO DE AUTORIDADE E ESTATÍSTICAS com 3 ou 4 contadores de números (Ex: +500 Clientes Atendidos, 99% Satisfação, +5 Anos).
4. SEÇÃO SOBRE A EMPRESA / PROFISSIONAL com história, missão e diferenciais bem estruturados.
5. SEÇÃO DE SERVIÇOS E SOLUÇÕES em Grid de Cards modernos com ícones FontAwesome e hover.
6. SEÇÃO BENEFÍCIOS E DIFERENCIAIS com checkmarks e destaques.
7. SEÇÃO "COMO FUNCIONA" com passo a passo numerado (3 a 5 etapas).
8. GALERIA DE IMAGENS PERSONALIZADAS (SOMENTE se houver imagens fornecidas no briefing. Caso contrário, NÃO CRIE essa seção nem quadros vazios).
9. SEÇÃO DE DEPOIMENTOS (Exatamente 3 cards com as fotos Unsplash e 5 estrelas).
10. SEÇÃO FAQ (Exatamente 8 perguntas sanfonadas interativas).
11. CTA FINAL persuasivo direcionando para o WhatsApp.
12. FOOTER completo e centralizado.

FORMATO OBRIGATÓRIO DA RESPOSTA:
Retorne EXCLUSIVAMENTE o código HTML5 completo do <!DOCTYPE html> até </html>.
Não escreva nenhuma explicação antes ou depois do código.
Não utilize Markdown nem blocos de código tipo \`\`\`html.
`;

    // 5. Chamada para a API da Qwen (Qwen-Max / Qwen-Plus)
    const respQwen = await fetch(QWEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "qwen-max",
        messages: [
          { role: "system", content: "Você é um compilador e gerador de código HTML/Tailwind de nível internacional. Retorne EXCLUSIVAMENTE o código HTML5 puro funcional, sem markdown, sem caixas de código e sem texto explicativo." },
          { role: "user", content: promptMaster }
        ],
        temperature: 0.5
      })
    });

    const dataQwen = await respQwen.json();

    if (dataQwen.error) {
      console.error("Erro na Qwen:", dataQwen.error);
      return res.status(400).json({ success: false, error: `Erro na IA: ${dataQwen.error.message || JSON.stringify(dataQwen.error)}` });
    }

    let siteHtml = dataQwen?.choices?.[0]?.message?.content || "";

    // Limpeza rigorosa de marcações markdown
    siteHtml = siteHtml.replace(/```html/gi, '').replace(/```/g, '').trim();

    if (!siteHtml || siteHtml.length < 100) {
      return res.status(500).json({ success: false, error: 'A IA Qwen não retornou um código HTML válido.' });
    }

    // 6. Notificação do Robô do WhatsApp no Railway
    const URL_ROBO = 'https://bot-whatsapp-production-c379.up.railway.app/send-message';
    const textoMensagem = `Olá, ${nome}! 🚀\n\nSeu site profissional Premium foi gerado com sucesso pela nossa Inteligência Artificial (Qwen)!\n\nAcesse a plataforma para visualizar a prévia completa em tela cheia.`;

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
