export default async function handler(req, res) {
  // Configurações de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const dados = req.body;
    const { 
      nome, 
      whatsapp, 
      nicho, 
      descricao, 
      slogan, 
      publico_alvo, 
      diferenciais, 
      estilo, 
      cor_primaria, 
      cor_secundaria, 
      cta_texto, 
      imagens_personalizadas 
    } = dados;

    if (!whatsapp) {
      return res.status(400).json({ success: false, error: 'O número de WhatsApp é obrigatório!' });
    }

    // Tratamento do número de WhatsApp
    let numeroLimpo = String(whatsapp).replace(/\D/g, '');
    if (!numeroLimpo.startsWith('55')) {
      numeroLimpo = '55' + numeroLimpo;
    }

    // Configuração da API do Qwen (DashScope)
    const QWEN_API_KEY = process.env.QWEN_API_KEY || "sk-ws-H.DMEDIDR.A3e2.MEQCIBYvIBLMRQFijb7-GkusJzYzSbGUbSgRRNT_OFjGY2A3AiBvQiqyvky59UjJrwnpj6LhN6wSYGUfT6wqE3hnFSyhWQ";
    const QWEN_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";

    // Tratamento condicional de imagens do briefing
    let instrucaoGaleriaImagens = "O CLIENTE NÃO ENVIOU IMAGENS PERSONALIZADAS. NUNCA CRIE UMA GALERIA OU QUADROS DE IMAGEM VAZIOS/SKELETONS NA PÁGINA. IGNORE ESSA SEÇÃO COMPLETAMENTE.";
    if (imagens_personalizadas && Array.isArray(imagens_personalizadas) && imagens_personalizadas.length > 0) {
      const fotosValidas = imagens_personalizadas.filter(img => img.url && img.url.trim().length > 5);
      if (fotosValidas.length > 0) {
        instrucaoGaleriaImagens = "O CLIENTE ENVIOU AS SEGUINTES IMAGENS PARA O SITE. CRIE UMA SEÇÃO DE GALERIA/PROTÓTIPO ELEGANTE E MODERNA APENAS COM ESTAS IMAGENS REALMENTE FORNECIDAS:\n" +
          fotosValidas.map((img, i) => `- Imagem ${i + 1}: URL: "${img.url}" | Descrição/Uso: "${img.descricao || 'Foto do Projeto'}"`).join("\n");
      }
    }

    // Lógica do tema visual respeitando a seleção do usuário
    let instrucaoEstiloVisual = "";
    if (estilo && estilo.includes("Clean")) {
      instrucaoEstiloVisual = `ESTILO VISUAL: Moderno, Minimalista & Clean.
- Fundo do site super claro (#ffffff ou #f8fafc).
- Cartões com fundo branco (#ffffff), bordas suaves (border: 1px solid #e2e8f0), sombras elegantes (box-shadow) e cantos arredondados (20px).
- Textos em tons escuros e de alta legibilidade (#0f172a, #334155).`;
    } else if (estilo && estilo.includes("Colorido")) {
      instrucaoEstiloVisual = `ESTILO VISUAL: Colorido, Vibrante & High-Tech.
- Gradientes ultra-modernos utilizando a cor primária (${cor_primaria || '#6366f1'}) e secundária (${cor_secundaria || '#22c55e'}).
- Cards com iluminação interna, badges e botões chamativos.`;
    } else if (estilo && estilo.includes("Elegante")) {
      instrucaoEstiloVisual = `ESTILO VISUAL: Elegante, Luxuoso e Premium.
- Fundo preto sofisticado (#05070c) com acentos dourados e iluminação ambiente de fundo.
- Bordas finas metálicas, sombras profundas e estéticas refinadas.`;
    } else {
      instrucaoEstiloVisual = `ESTILO VISUAL: Ultra Modern Dark Mode (Padrão SaaS & Startup Top Global).
- Fundo escuro luxuoso (#090d16) com efeitos de iluminação radial no background.
- Cards Glassmorphism (background: rgba(17, 24, 39, 0.7), backdrop-filter: blur(16px), border: 1px solid rgba(255, 255, 255, 0.08)).`;
    }

    // PROMPT MASTER ULTRAPROFISSIONAL E MODERNO
    const promptMaster = `
Você é um Diretor de Arte, UI/UX Designer e Engenheiro Front-End Sênior de nível internacional.
Sua missão é criar o código HTML5 completo de uma landing page EXTRAORDINÁRIA, digna de grandes startups e agências globais de alta conversão.

${instrucaoEstiloVisual}

DIRETRIZES RÍGIDAS DE DESIGN & CÓDIGO:
1. DESIGN MODERNO DE ALTO IMPACTO:
   - Layout fluido, espaçoso, elegante e 100% responsivo para celular, tablet e computador.
   - Tipografia ultra-moderna 'Plus Jakarta Sans' do Google Fonts.
   - Headlines com gradientes de texto marcantes e badges de autoridade estilizados.
   - Cards com cantos bem arredondados (border-radius: 20px ou 24px), hover suave (transform: translateY(-5px); transition: all 0.3s ease;).
   - Botões estilo Pill (border-radius: 50px) com brilho (glow), sombra e texto em caixa alta/negrito.

2. CÓDIGO HTML5 PONTUAL:
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
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    html { scroll-behavior: smooth; }
    .btn-gradient {
      background: linear-gradient(135deg, ${cor_primaria || '#6366f1'}, ${cor_secundaria || '#22c55e'});
      transition: all 0.3s ease;
    }
    .btn-gradient:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
    }
    .text-gradient {
      background: linear-gradient(135deg, #ffffff 30%, ${cor_primaria || '#818cf8'});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  </style>
</head>

DADOS DO CLIENTE RECEBIDOS DO FORMULÁRIO:
- Nome/Marca: ${nome || 'Sua Empresa'}
- Segmento/Nicho: ${nicho || 'Serviços Profissionais'}
- Descrição/História: ${descricao || 'Sua solução completa com foco em alta performance e resultados reais.'}
- Slogan: ${slogan || ''}
- Público-alvo: ${publico_alvo || ''}
- Diferenciais: ${diferenciais || ''}
- Cor Primária: ${cor_primaria || '#6366f1'}
- Cor Secundária: ${cor_secundaria || '#22c55e'}
- Botão CTA: "${cta_texto || 'Falar no WhatsApp'}"
- WhatsApp do Botão: ${numeroLimpo}

INSTRUÇÃO DE IMAGENS PERSONALIZADAS:
${instrucaoGaleriaImagens}

DEPOIMENTOS — REGRA STRICT DE NOMES E ESTRUTURA:
Crie exatamente 3 cards de depoimentos extremamente profissionais.
Os nomes e fotos dos clientes DEVEM SER EXATAMENTE ESTES:
1. "Ana Clara" | Foto: https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80
2. "João Lucas" | Foto: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80
3. "Natália Oliveira" | Foto: https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80

Cada card DEVE conter:
- Foto de perfil circular com borda brilhante na cor primária (${cor_primaria || '#6366f1'}).
- O NOME EXATO em negrito destacado.
- Avaliação de 5 estrelas amarelas (<i class="fas fa-star text-yellow-400"></i>).
- Depoimento hiper-realista e convincente focado no segmento (${nicho}).

FAQ (PERGUNTAS FREQUENTES COM RESPOSTAS LÚCIDAS E EXPAN SÍVEIS):
- Crie uma seção de FAQ contendo 6 a 8 perguntas frequentes essenciais sobre o nicho (${nicho}).
- CADA PERGUNTA DEVE CONTER UMA RESPOSTA DETALHADA, CLARA E TOTALMENTE LEGÍVEL.
- Cada item deve possuir um botão com a classe .faq-btn e a resposta em uma div com .faq-content.hidden.
- Crie um script JS funcional ao final da página que abre e fecha o conteúdo da resposta ao clicar de forma fluida.

RODAPÉ / FOOTER (ANO 2026):
- Inclua um rodapé profissional e elegante com os direitos autorais contendo EXATAMENTE O ANO DE 2026:
  "© 2026 ${nome || 'Empresa'}. Todos os direitos reservados."
- Inclua um botão flutuante do WhatsApp no canto inferior direito da tela.

ESTRUTURA DAS SEÇÕES DA LANDING PAGE:
1. HEADER FIXO com efeito Blur Glassmorphism, Logo/Nome em destaque e botão CTA para WhatsApp.
2. HERO SECTION impactante com Badge em destaque, Headline com texto gradiente gigante, subtítulo persuasivo e botões de ação.
3. SEÇÃO NÚMEROS / ESTATÍSTICAS (Ex: +500 Clientes Atendidos, 99% Satisfação, +5 Anos de Tradição).
4. SEÇÃO SOBRE A EMPRESA com história, missão e diferenciais bem diagramados.
5. SEÇÃO DE SERVIÇOS E SOLUÇÕES em Grid de Cards modernos com ícones FontAwesome e animações no hover.
6. SEÇÃO BENEFÍCIOS E DIFERENCIAIS com checkmarks estilizados.
7. SEÇÃO "COMO FUNCIONA" (3 a 5 etapas visuais explicativas).
8. GALERIA DE IMAGENS PERSONALIZADAS (Somente se fornecidas no briefing. Caso contrário, não crie a seção nem quadros vazios).
9. SEÇÃO DE DEPOIMENTOS (Os 3 cards obrigatórios: Ana Clara, João Lucas e Natália Oliveira com 5 estrelas).
10. SEÇÃO FAQ COMPLETA (Perguntas + Respostas detalhadas com acordeão expansível).
11. CTA FINAL persuasivo direcionando para o WhatsApp.
12. FOOTER completo com © 2026 e botão fixo flutuante do WhatsApp.

SCRIPTS E ANIMAÇÕES (ANTES DE FECHAR O </body>):
  <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
  <script>
    AOS.init({ duration: 800, once: true });
    
    // Script Interativo do FAQ
    document.addEventListener('DOMContentLoaded', () => {
      const faqButtons = document.querySelectorAll('.faq-btn');
      faqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const content = btn.nextElementSibling;
          const icon = btn.querySelector('.faq-icon');
          if (content) {
            content.classList.toggle('hidden');
            if (icon) {
              icon.classList.toggle('rotate-180');
            }
          }
        });
      });
    });
  </script>

FORMATO OBRIGATÓRIO DA RESPOSTA:
Retorne EXCLUSIVAMENTE o código HTML5 completo do <!DOCTYPE html> até </html>.
Não escreva nenhuma explicação antes ou depois do código.
Não utilize Markdown nem blocos de código tipo \`\`\`html.
`;

    // Chamada para a API da Qwen (DashScope)
    const respQwen = await fetch(QWEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "qwen-max",
        messages: [
          { role: "system", content: "Você é um compilador de código HTML/Tailwind de nível internacional. Retorne EXCLUSIVAMENTE o código HTML5 puro funcional com design ultra-moderno, ano 2026 no rodapé, depoimentos de Ana Clara, João Lucas e Natália Oliveira, FAQ expansível sem markdown." },
          { role: "user", content: promptMaster }
        ],
        temperature: 0.5
      })
    });

    const dataQwen = await respQwen.json();

    if (dataQwen.error) {
      console.error("Erro na Qwen:", dataQwen.error);
      return res.status(400).json({ success: false, error: `Erro na IA: ${dataQwen.error.message}` });
    }

    let siteHtml = dataQwen?.choices?.[0]?.message?.content || "";

    // Limpeza de marcações markdown
    siteHtml = siteHtml.replace(/```html/gi, '').replace(/```/g, '').trim();

    if (!siteHtml || siteHtml.length < 100) {
      return res.status(500).json({ success: false, error: 'A IA não retornou um código HTML válido.' });
    }

    // Notificação do Robô no Railway
    const URL_ROBO = 'https://bot-whatsapp-production-c379.up.railway.app/send-message';
    const textoMensagem = `Olá, ${nome}! 🚀\n\nSeu site profissional Premium foi gerado com sucesso!\n\nAcesse a plataforma para visualizar a prévia completa em tela cheia.`;

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
