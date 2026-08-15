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

    // Tratamento condicional das imagens enviadas
    let instrucaoGaleriaImagens = "O CLIENTE NÃO ENVIOU IMAGENS PERSONALIZADAS. NUNCA CRIE UMA GALERIA OU QUADROS DE IMAGEM VAZIOS/SKELETONS NA PÁGINA. IGNORE ESSA SEÇÃO COMPLETAMENTE.";
    if (imagens_personalizadas && Array.isArray(imagens_personalizadas) && imagens_personalizadas.length > 0) {
      const fotosValidas = imagens_personalizadas.filter(img => img.url && img.url.trim().length > 5);
      if (fotosValidas.length > 0) {
        instrucaoGaleriaImagens = "O CLIENTE ENVIOU AS SEGUINTES IMAGENS PARA O SITE. CRIE UMA SEÇÃO DE GALERIA/PROTÓTIPO ELEGANTE APENAS COM ESTAS IMAGENS REALMENTE FORNECIDAS:\n" +
          fotosValidas.map((img, i) => `- Imagem ${i + 1}: URL: "${img.url}" | Descrição/Uso: "${img.descricao || 'Foto do Projeto'}"`).join("\n");
      }
    }

    // Definição de regras de cores/tema de acordo com a opção selecionada no formulário
    let instrucaoEstiloVisual = "";
    if (estilo && estilo.includes("Clean")) {
      instrucaoEstiloVisual = `ESTILO SOLICITADO: Clean e Claro (Minimalista).
- O fundo do site DEVE SER CLARO (ex: #ffffff ou #f8fafc).
- Textos principais em cores escuras e legíveis (#0f172a, #1e293b).
- Cards com fundo branco (#ffffff), sombras suaves (shadow-xl) e bordas discretas (#e2e8f0).
- NUNCA use fundo escuro global se essa opção foi selecionada.`;
    } else if (estilo && estilo.includes("Colorido")) {
      instrucaoEstiloVisual = `ESTILO SOLICITADO: Colorido e Vibrante.
- Utilize gradientes chamativos e modernos combinando a cor primaria (${cor_primaria || '#6366f1'}) e a cor secundaria (${cor_secundaria || '#22c55e'}).
- Design dinâmico, alegre, com cards e badges bem destacados.`;
    } else if (estilo && estilo.includes("Elegante")) {
      instrucaoEstiloVisual = `ESTILO SOLICITADO: Elegante e Luxuoso.
- Fundo escuro sofisticado (#090d16) com detalhes em Dourado/Bronze e paleta refinada.
- Bordas finas brilhantes, fontes luxuosas e sombras profundas.`;
    } else {
      instrucaoEstiloVisual = `ESTILO SOLICITADO: Moderno e Escuro (Dark Mode).
- Fundo escuro luxuoso (#0b0f17) com cards semitransparentes em glassmorphism.`;
    }

    // PROMPT MASTER MAGNATA
    const promptMaster = `
Você é um Engenheiro de Software Front-end e UX/UI Designer Sênior de nível internacional, especialista em criação de landing pages modernas, responsivas, visualmente sofisticadas e focadas em alta conversão.
Sua missão é criar o código HTML5 completo de uma landing page de altíssima qualidade com base nas preferências selecionadas pelo usuário.

DIRETRIZES DE ESTILO VISUAL:
${instrucaoEstiloVisual}

REGRAS RÍGIDAS DE TIPOGRAFIA E ESTÉTICA:
- O HTML DEVE utilizar a fonte ultra-profissional 'Plus Jakarta Sans' importada do Google Fonts.
- A tipografia DEVE ser extremamente legível, moderna e elegante, com excelente contraste de texto.
- O HTML DEVE iniciar obrigatoriamente com:
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
    .container-custom { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    .faq-answer { transition: max-height 0.3s ease, opacity 0.3s ease; }
  </style>
</head>

DADOS DA EMPRESA E DO CLIENTE:
- Nome/Marca: ${nome || 'Sua Empresa'}
- Segmento/Nicho: ${nicho || 'Serviços Profissionais'}
- Descrição/História: ${descricao || 'Ajudando clientes a alcançarem os melhores resultados.'}
- Slogan: ${slogan || ''}
- Público-alvo: ${publico_alvo || ''}
- Diferenciais: ${diferenciais || ''}
- Cor Primária de Destaque: ${cor_primaria || '#6366f1'}
- Cor Secundária: ${cor_secundaria || '#22c55e'}
- Botão CTA: "${cta_texto || 'Falar no WhatsApp'}"
- WhatsApp do Botão: ${numeroLimpo}

INSTRUÇÃO DE IMAGENS PERSONALIZADAS:
${instrucaoGaleriaImagens}

DEPOIMENTOS — REGRA RÍGIDA DE NOMES E FOTOS:
Crie exatamente 3 cards de depoimentos de clientes satisfeitos.
Os nomes dos clientes DEVEM SER EXATAMENTE ESTES:
1. Primeiro Depoimento: Nome "Ana Clara" | Foto: https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80
2. Segundo Depoimento: Nome "João Lucas" | Foto: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80
3. Terceiro Depoimento: Nome "Natália Oliveira" | Foto: https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80

Cada card DEVE conter:
- Foto de perfil arredondada com borda elegante na cor primária (${cor_primaria || '#6366f1'})
- O NOME EXATO especificado acima em destaque em negrito
- Avaliação com 5 estrelas amarelas (<i class="fas fa-star text-yellow-400"></i>)
- Texto de depoimento realista, elogioso e diretamente relacionado ao segmento (${nicho}).

FAQ (PERGUNTAS FREQUENTES COM RESPOSTAS VISÍVEIS E INTERATIVAS) — OBRIGATÓRIO:
- Crie uma seção de FAQ com EXATAMENTE 6 a 8 perguntas frequentes essenciais do segmento (${nicho}).
- CADA PERGUNTA DEVE POSSUIR UMA RESPOSTA BEM ESCRITA, DETALHADA E PERFEITAMENTE VISÍVEL!
- A cor do texto da resposta DEVE TER ALTO CONTRASTE com o fundo do card para ser LIDA COM FACILIDADE (Exemplo: em tema claro, use text-slate-700; em tema escuro, use text-slate-300).
- Estruture cada item do FAQ com um botão (<button class="faq-btn">) com ícone de seta ou soma (+ / -) e a resposta logo abaixo em uma div (<div class="faq-content hidden p-4">).
- As respostas DEVEM ser visíveis e expansíveis ao clicar de forma totalmente fluida.

ESTRUTURA COMPLETA DA LANDING PAGE:
1. HEADER FIXO com efeito Blur, logo/nome, links de navegação e botão CTA destacado para o WhatsApp. Menu mobile funcional.
2. HERO SECTION impactante com Headline gigante e elegante, subhead persuasivo, badges de autoridade e botão CTA principal.
3. SEÇÃO DE ESTATÍSTICAS / NÚMEROS (Ex: +500 Clientes Atendidos, 99% Satisfação, +5 Anos).
4. SEÇÃO SOBRE A EMPRESA apresentando a história, missão e diferenciais.
5. SEÇÃO DE SERVIÇOS E SOLUÇÕES em Grid de Cards com ícones FontAwesome e hover elegante.
6. SEÇÃO BENEFÍCIOS E DIFERENCIAIS.
7. SEÇÃO "COMO FUNCIONA" (3 a 5 passos bem visuais).
8. GALERIA DE IMAGENS PERSONALIZADAS (Apenas se fornecidas no briefing. Se não houver, ignore e não crie quadros vazios).
9. SEÇÃO DE DEPOIMENTOS (Os 3 cards obrigatórios com Ana Clara, João Lucas e Natália Oliveira com 5 estrelas).
10. SEÇÃO FAQ COMPLETA (Perguntas + Respostas detalhadas em alta visibilidade e com acordeão interativo funcional).
11. CTA FINAL persuasivo direcionando para o WhatsApp.
12. FOOTER completo e centralizado.

ANIMAÇÕES E SCRIPTS:
Antes do fechamento do </body>, inclua a inicialização do AOS e o Script JS do FAQ:
  <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
  <script>
    AOS.init({ duration: 800, once: true });
    
    // Script Interativo Profissional do FAQ
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
          { role: "system", content: "Você é um compilador de código HTML/Tailwind de nível internacional. Retorne EXCLUSIVAMENTE o código HTML5 puro funcional, respeitando o tema visual escolhido, usando a fonte Plus Jakarta Sans, com depoimentos de Ana Clara, João Lucas e Natália Oliveira, e FAQ com respostas claras e visíveis sem markdown." },
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
    const textoMensagem = `Olá, ${nome}! 🚀\n\nSeu site profissional Premium foi gerado com sucesso!\n\nAcesse a plataforma para visualizar a prévia completa.`;

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
