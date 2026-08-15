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
        instrucaoGaleriaImagens = "O CLIENTE ENVIOU AS SEGUINTES IMAGENS PARA O SITE. CRIE UMA SEÇÃO DE GALERIA/PROTÓTIPO ELEGANTE APENAS COM ESTAS IMAGENS REALMENTE FORNECIDAS:\n" +
          fotosValidas.map((img, i) => `- Imagem ${i + 1}: URL: "${img.url}" | Descrição/Uso: "${img.descricao || 'Foto do Projeto'}"`).join("\n");
      }
    }

    // Lógica do tema visual respeitando o formulário mas ancorada no estilo do Pyerry Diniz
    let instrucaoEstiloVisual = "";
    if (estilo && estilo.includes("Clean")) {
      instrucaoEstiloVisual = `ESTILO VISUAL: Clean e Claro (Minimalista).
- Adaptar o layout do modelo para fundo claro (#ffffff ou #f8fafc), mantendo os botões arredondados e a tipografia Montserrat/Open Sans.
- --bg-dark: #f8fafc; --bg-card: #ffffff; --text-light: #0a0a0a; --text-gray: #4b5563;`;
    } else if (estilo && estilo.includes("Colorido")) {
      instrucaoEstiloVisual = `ESTILO VISUAL: Colorido e Vibrante.
- Utilizar gradientes vívidos com a cor primária (${cor_primaria || '#ff3b3f'}) e secundária (${cor_secundaria || '#22c55e'}).`;
    } else {
      instrucaoEstiloVisual = `ESTILO VISUAL: Dark Mode Luxo Exato do Modelo Pyerry Diniz.
- Utilizar exatamente as cores e CSS do site de referência:
  --primary: ${cor_primaria || '#ff3b3f'};
  --bg-dark: #0a0a0a;
  --bg-card: #161616;
  --text-light: #ffffff;
  --text-gray: #b0b0b0;`;
    }

    // PROMPT MASTER BASEADO NO HTML REAL DO PYERRY DINIZ
    const promptMaster = `
Você é um Engenheiro de Software Front-end e Web Designer Sênior de nível internacional.
Sua missão é criar o código HTML5 completo de uma landing page de altíssima qualidade tomando como REFERÊNCIA DIRETA E TÉCNICA O CÓDIGO E LAYOUT DO SEGUINTE SITE:

${instrucaoEstiloVisual}

ESTRUTURA TÉCNICA E CSS OBRIGATÓRIA (INSPIRADA NO CÓDIGO DO SITE DE REFERÊNCIA):
O HTML DEVE ser entregue completo, sem erros, iniciando obrigatoriamente em:
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nome || 'Landing Page Pro'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
  <style>
    :root {
      --primary: ${cor_primaria || '#ff3b3f'};
      --primary-dark: #d32f2f;
      --bg-dark: #0a0a0a;
      --bg-card: #161616;
      --text-light: #ffffff;
      --text-gray: #b0b0b0;
      --font-main: 'Open Sans', sans-serif;
      --font-heading: 'Montserrat', sans-serif;
      --transition: all 0.3s ease;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; font-size: 16px; overflow-x: hidden; }
    body { background-color: var(--bg-dark); color: var(--text-light); font-family: var(--font-main); line-height: 1.6; }
    a { text-decoration: none; color: inherit; transition: var(--transition); }
    ul { list-style: none; }
    h1, h2, h3, h4 { font-family: var(--font-heading); font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem; }
    .highlight { color: var(--primary); }
    .btn { display: inline-block; padding: 15px 35px; background-color: var(--primary); color: white; font-family: var(--font-heading); font-weight: 700; text-transform: uppercase; border-radius: 50px; border: 2px solid transparent; cursor: pointer; transition: var(--transition); text-align: center; }
    .btn:hover { background-color: transparent; border-color: var(--primary); color: var(--primary); transform: translateY(-3px); }
    .section-title { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; position: relative; padding-bottom: 15px; }
    .section-title::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 80px; height: 4px; background-color: var(--primary); }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 5%; }
    section { padding: 90px 0; }
    /* Estilos de Header, Cards, Depoimentos e FAQ no padrão da referência */
    header { position: fixed; top: 0; width: 100%; background-color: rgba(10, 10, 10, 0.85); backdrop-filter: blur(10px); z-index: 1000; border-bottom: 1px solid #222; }
    .plano-card { background-color: var(--bg-card); padding: 40px 30px; border-radius: 15px; border: 2px solid #222; transition: var(--transition); position: relative; display: flex; flex-direction: column; justify-content: space-between; }
    .plano-card:hover { border-color: var(--primary); transform: scale(1.03); }
    .popular-badge { position: absolute; top: 20px; right: -35px; background-color: var(--primary); color: white; padding: 5px 40px; transform: rotate(45deg); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
    .testi-card { background-color: var(--bg-card); padding: 30px; border-radius: 10px; position: relative; border: 1px solid #222; }
    .testi-card i.quote-icon { position: absolute; top: 20px; right: 20px; font-size: 2rem; color: rgba(255,59,63,0.2); }
    .faq-item { background-color: var(--bg-dark); margin-bottom: 15px; border-radius: 5px; overflow: hidden; border: 1px solid #222; }
    .faq-question { padding: 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: var(--font-heading); font-weight: 600; }
    .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; padding: 0 20px; color: var(--text-gray); font-size: 0.95rem; }
    .faq-item.active .faq-answer { padding: 0 20px 20px 20px; max-height: 300px; }
    .faq-item.active .faq-icon { transform: rotate(180deg); }
  </style>
</head>

DADOS DO CLIENTE RECEBIDOS DO FORMULÁRIO:
- Nome/Marca: ${nome || 'Empresa'}
- Segmento/Nicho: ${nicho || 'Serviços'}
- Descrição/História: ${descricao || 'Ajudando clientes com excelência e profissionalismo.'}
- Slogan: ${slogan || ''}
- Público-alvo: ${publico_alvo || ''}
- Diferenciais: ${diferenciais || ''}
- Cor Primária: ${cor_primaria || '#ff3b3f'}
- Cor Secundária: ${cor_secundaria || '#22c55e'}
- Botão CTA: "${cta_texto || 'Solicitar Atendimento'}"
- WhatsApp do Botão: ${numeroLimpo}

INSTRUÇÃO DE IMAGENS PERSONALIZADAS:
${instrucaoGaleriaImagens}

DEPOIMENTOS (NOMES E FOTOS OBRIGATÓRIAS):
Crie exatamente 3 cards de depoimentos baseados no layout do Pyerry Diniz com aspas em marca d'água (<i class="fas fa-quote-right quote-icon"></i>).
Utilize obrigatoriamente estes 3 nomes e fotos de perfil:
1. Nome "Ana Clara" | Foto: https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80
2. Nome "João Lucas" | Foto: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80
3. Nome "Natália Oliveira" | Foto: https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80
Cada card deve conter o nome em negrito, a imagem arredondada com borda na cor primária, 5 estrelas amarelas (<i class="fas fa-star text-yellow-400"></i>) e o depoimento realista.

FAQ (8 PERGUNTAS COM RESPOSTAS DETALHADAS E VISÍVEIS):
- Crie a seção de FAQ com EXATAMENTE 8 perguntas frequentes.
- CADA PERGUNTA DEVE CONTER UMA RESPOSTA DETALHADA E PERFEITAMENTE VISÍVEL DENTRO DA DIV .faq-answer.
- Aplique o script JS para que o clique na .faq-question adicione/remova a classe 'active' no .faq-item, expandindo e recolhendo a resposta suavemente.

RODAPÉ / FOOTER (ANO 2026):
- O rodapé DEVE conter obrigatoriamente os direitos autorais com o ano de 2026:
  "&copy; 2026 ${nome || 'Empresa'}. Todos os direitos reservados."

ESTRUTURA DAS SEÇÕES NA PÁGINA:
1. HEADER FIXO com efeito blur, logo/nome, navegação rápida e botão CTA para WhatsApp.
2. HERO SECTION de impacto com título grande, subhead persuasivo e botão principal estilizado no padrão pill (border-radius: 50px).
3. SEÇÃO SOBRE MIM / EMPRESA com estatísticas em Grid (Anos de Experiência, Pacientes/Clientes Atendidos, Satisfação).
4. SEÇÃO DE SERVIÇOS / PLANOS formatada em Grid de Cards com bordas elegantes (#222), badge em destaque ("Mais Escolhido") no card principal e botão CTA do WhatsApp.
5. SEÇÃO BENEFÍCIOS E DIFERENCIAIS.
6. GALERIA DE IMAGENS PERSONALIZADAS (Apenas se enviadas no briefing. Se não houver, ignore e não crie quadros vazios).
7. SEÇÃO DE DEPOIMENTOS (Ana Clara, João Lucas e Natália Oliveira).
8. SEÇÃO FAQ (8 perguntas e respostas com funcionalidade acordeão).
9. CTA FINAL impactante com botão direto do WhatsApp.
10. FOOTER completo com © 2026 e botão flutuante fixo do WhatsApp no canto da tela.

SCRIPTS NO FINAL DA PÁGINA (ANTES DO </body>):
  <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
  <script>
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });

    // Script do FAQ Acordeão
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', () => {
          faqItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
            }
          });
          item.classList.toggle('active');
        });
      }
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
          { role: "system", content: "Você é um compilador de código HTML/CSS de nível internacional. Retorne EXCLUSIVAMENTE o código HTML5 puro funcional idêntico à estrutura CSS e visual do modelo Pyerry Diniz, ano 2026 no rodapé, depoimentos com Ana Clara, João Lucas e Natália Oliveira, FAQ expansível funcional, sem markdown e sem caixas de código." },
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
    const textoMensagem = `Olá, ${nome}! 🚀\n\nSeu site profissional Premium de alta conversão foi gerado com sucesso!\n\nAcesse a plataforma para visualizar a prévia completa.`;

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
