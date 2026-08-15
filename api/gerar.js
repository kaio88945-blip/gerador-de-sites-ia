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

    // Diretrizes de tema e cores
    let instrucaoEstiloVisual = "";
    if (estilo && estilo.includes("Clean")) {
      instrucaoEstiloVisual = `ESTILO SOLICITADO: Clean e Claro (Minimalista Premium).
- Fundo do site claro (#ffffff ou #f8fafc).
- Textos principais em tons escuros e elegantes (#0f172a, #1e293b).
- Cards brancos com bordas bem finas (#e2e8f0), cantos arredondados (rounded-2xl) e sombras refinadas (shadow-xl).
- NUNCA use fundo totalmente escuro se essa opção foi selecionada.`;
    } else if (estilo && estilo.includes("Colorido")) {
      instrucaoEstiloVisual = `ESTILO SOLICITADO: Colorido e Vibrante.
- Gradientes sofisticados combinando a cor primaria (${cor_primaria || '#6366f1'}) e a cor secundaria (${cor_secundaria || '#22c55e'}).
- Cards modernos com bordas brilhantes, badges coloridas e destaques chamativos.`;
    } else if (estilo && estilo.includes("Elegante")) {
      instrucaoEstiloVisual = `ESTILO SOLICITADO: Elegante e Luxuoso.
- Fundo escuro luxuoso (#080c14 ou #05070c) com acentos dourados e iluminação sutil de fundo.
- Cards em tom de preto sofisticado com bordas douradas finas e sombras profundas.`;
    } else {
      instrucaoEstiloVisual = `ESTILO SOLICITADO: Moderno e Escuro (Dark Luxo - Padrão Pyerry Diniz).
- Fundo escuro (#0b0f17) com gradientes e iluminações de fundo em radial-gradient.
- Cards em Glassmorphism (rgba(17, 24, 39, 0.75)) com backdrop-filter blur(16px) e borda sutil branca/10.`;
    }

    // PROMPT MASTER MAGNATA V2
    const promptMaster = `
Você é um Engenheiro de Software Front-end e UX/UI Designer Sênior de nível internacional, especialista em criação de landing pages modernas, responsivas, visualmente impecáveis e focadas em altíssima conversão.
Sua missão é criar o código HTML5 completo de uma landing page de padrão visual luxuoso inspirada na elegância e sofisticação do site https://pyerry-diniz-nutri-personal.vercel.app/

DIRETRIZES DE ESTILO VISUAL E MÓDULOS:
${instrucaoEstiloVisual}

REGRAS RÍGIDAS DE UI/UX E ACABAMENTO DOS MÓDULOS:
1. DESIGN DOS MÓDULOS/CARDS:
   - Todos os cards (Serviços, Depoimentos, Diferenciais, FAQ) devem ter cantos arredondados modernos (rounded-2xl ou rounded-3xl).
   - Utilize efeito de brilho e elevação suave ao passar o mouse (hover:-translate-y-2 hover:shadow-2xl transition-all duration-300).
   - Adicione ícones elegantes do FontAwesome envelopados em círculos ou quadrados com fundo suave e cor de destaque.
2. TIPOGRAFIA ELEGANTE:
   - Use obrigatoriamente a fonte 'Plus Jakarta Sans' do Google Fonts.
   - Headlines com marcadores de texto em gradiente (bg-clip-text text-transparent bg-gradient-to-r).
3. ESTRUTURA TÉCNICA DO HTML:
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

DEPOIMENTOS — NOMES E FOTOS OBRIGATÓRIAS:
Crie exatamente 3 cards de depoimentos de alta conversão.
Os nomes e fotos DEVEM SER EXATAMENTE ESTES:
1. Primeiro Depoimento: Nome "Ana Clara" | Foto: https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80
2. Segundo Depoimento: Nome "João Lucas" | Foto: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80
3. Terceiro Depoimento: Nome "Natália Oliveira" | Foto: https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80

Cada card deve conter foto com borda refinada na cor primária (${cor_primaria || '#6366f1'}), o NOME EXATO em negrito, 5 estrelas amarelas (<i class="fas fa-star text-yellow-400"></i>) e depoimento persuasivo.

FAQ (PERGUNTAS FREQUENTES COM RESPOSTAS VISÍVEIS) — OBRIGATÓRIO:
- Crie um FAQ com 6 a 8 perguntas frequentes.
- CADA PERGUNTA DEVE CONTER UMA RESPOSTA BEM DETALHADA E COM ALTÍSSIMO CONTRASTE VISUAL DE LEITURA.
- Crie acordeão interativo com botão (<button class="faq-btn">) e a div de resposta (<div class="faq-content hidden p-5">). Ao clicar, a resposta aparece suavemente.

RODAPÉ / FOOTER:
- No final da página, inclua um rodapé elegante e centralizado com os direitos autorais contendo EXATAMENTE O ANO DE 2026:
  "© 2026 ${nome || 'Empresa'}. Todos os direitos reservados."

ESTRUTURA DA PÁGINA:
1. HEADER FIXO com efeito Blur glassmorphism, nome/logo e botão CTA para WhatsApp.
2. HERO SECTION luxuosa com Headline chamativa, subhead explicativo, estatísticas/badges e botão CTA destacado.
3. SEÇÃO DE NÚMEROS / IMPACTO (Ex: +500 Clientes, 99% Satisfação, +5 Anos de Tradição).
4. SEÇÃO SOBRE A EMPRESA com história e proposta de valor.
5. SEÇÃO DE SERVIÇOS E SOLUÇÕES em Grid de Cards modernos com ícones FontAwesome e animação hover.
6. SEÇÃO BENEFÍCIOS E DIFERENCIAIS com checkmarks estilizados.
7. SEÇÃO "COMO FUNCIONA" (3 a 5 etapas visuais e ordenadas).
8. GALERIA DE IMAGENS PERSONALIZADAS (Somente se houver imagens no briefing. Caso contrário, ignore).
9. SEÇÃO DE DEPOIMENTOS (Os 3 cards obrigatórios: Ana Clara, João Lucas e Natália Oliveira com 5 estrelas).
10. SEÇÃO FAQ COMPLETA (Perguntas + Respostas detalhadas em acordeão funcional).
11. CTA FINAL persuasivo e marcante apontando para o WhatsApp.
12. FOOTER completo com © 2026.

SCRIPTS E ANIMAÇÕES:
Antes de fechar o </body>, inclua o AOS e o Script JS do FAQ:
  <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
  <script>
    AOS.init({ duration: 800, once: true });
    
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
          { role: "system", content: "Você é um compilador de código HTML/Tailwind de nível internacional. Retorne EXCLUSIVAMENTE o código HTML5 puro funcional com acabamento premium dos módulos, ano 2026 no rodapé, depoimentos de Ana Clara, João Lucas e Natália Oliveira, sem markdown e sem caixas de código." },
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
    const textoMensagem = `Olá, ${nome}! 🚀\n\nSeu site profissional Premium de alta conversão foi gerado com sucesso!\n\nAcesse a plataforma para visualizar a prévia completa em tela cheia.`;

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
