export default async function handler(req, res) {
  // 1. Configurações Globais de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const dados = req.body || {};

    // 2. TRATAMENTO DAS INFORMAÇÕES OBRIGATÓRIAS
    const nome = dados.nome || 'Sua Empresa';
    const nicho = dados.nicho || 'Serviços Profissionais';
    const slogan = dados.slogan || '';
    const descricao = dados.descricao || 'Oferecemos as melhores soluções e serviços com excelência e compromisso com o cliente.';
    const publico_alvo = dados.publico_alvo || '';
    const diferenciais = dados.diferenciais || '';
    
    // Tratamento estrito do número de WhatsApp
    let whatsappLimpo = String(dados.whatsapp || '').replace(/\D/g, '');
    if (whatsappLimpo && !whatsappLimpo.startsWith('55')) {
      whatsappLimpo = '55' + whatsappLimpo;
    }

    if (!whatsappLimpo) {
      return res.status(400).json({ success: false, error: 'O número de WhatsApp é obrigatório!' });
    }

    // 3. TRATAMENTO DAS INFORMAÇÕES OPCIONAIS (Montagem dos blocos condicionais)
    
    // Visual / Identidade
    const estilo = dados.estilo || '';
    const cor_primaria = dados.cor_primaria || '#6366f1';
    const cor_secundaria = dados.cor_secundaria || '#22c55e';
    const link_logo = dados.link_logo || '';

    // Imagens Personalizadas
    let instrucaoImagensPersonalizadas = "Nenhuma imagem personalizada foi enviada pelo cliente. Não crie quadros de galeria vazios ou placeholders de foto sem sentido.";
    if (dados.imagens_personalizadas && Array.isArray(dados.imagens_personalizadas) && dados.imagens_personalizadas.length > 0) {
      const imgsValidas = dados.imagens_personalizadas.filter(img => img.url && img.url.trim().length > 5);
      if (imgsValidas.length > 0) {
        instrucaoImagensPersonalizadas = "O cliente enviou as seguintes imagens personalizadas com descrições. Posicione cada uma na seção mais adequada conforme a intenção:\n" +
          imgsValidas.map((img, i) => `- Imagem ${i + 1}: URL="${img.url}" | Descrição="${img.descricao || 'Foto institucional/produto'}"`).join("\n");
      }
    }

    // Seção Opcional: Serviços
    let blocoServicos = "O cliente NÃO enviou uma lista de serviços. NÃO crie a seção de serviços no site.";
    if (dados.servicos && Array.isArray(dados.servicos) && dados.servicos.length > 0) {
      blocoServicos = "CRIE A SEÇÃO DE SERVIÇOS com os seguintes itens fornecidos:\n" + JSON.stringify(dados.servicos, null, 2);
    }

    // Seção Opcional: Produtos
    let blocoProdutos = "O cliente NÃO enviou uma lista de produtos. NÃO crie a seção de produtos no site.";
    if (dados.produtos && Array.isArray(dados.produtos) && dados.produtos.length > 0) {
      blocoProdutos = "CRIE A SEÇÃO DE PRODUTOS com os seguintes itens fornecidos:\n" + JSON.stringify(dados.produtos, null, 2);
    }

    // Seção Opcional: Oferta Especial
    let blocoOferta = "O cliente NÃO enviou uma oferta especial. NÃO crie a seção de oferta/promoção no site.";
    if (dados.oferta && (dados.oferta.titulo || dados.oferta_titulo)) {
      blocoOferta = "CRIE UMA SEÇÃO DE OFERTA/PROMOÇÃO DE ALTA CONVERSÃO com os seguintes dados:\n" + JSON.stringify(dados.oferta, null, 2);
    }

    // Seção Opcional: Galeria
    let blocoGaleria = "O cliente NÃO forneceu link de galeria/portfólio. NÃO crie a seção de galeria.";
    if (dados.link_galeria && dados.link_galeria.trim().length > 5) {
      blocoGaleria = `CRIE A SEÇÃO DE GALERIA/PORTFÓLIO apontando ou destacando este recurso: ${dados.link_galeria}`;
    }

    // Informações de Contato Adicionais
    const email = dados.email || '';
    const endereco = dados.endereco || '';
    const redes_sociais = dados.redes_sociais || {};

    // Configuração do CTA Principal
    const cta_texto = dados.cta_texto || 'Falar no WhatsApp';
    const cta_destino = dados.cta_destino || 'whatsapp';
    const cta_detalhe = dados.cta_detalhe || '';

    // 4. CONFIGURAÇÃO DA IA (Qwen / DashScope)
    const QWEN_API_KEY = process.env.QWEN_API_KEY || "sk-ws-H.DMEDIDR.A3e2.MEQCIBYvIBLMRQFijb7-GkusJzYzSbGUbSgRRNT_OFjGY2A3AiBvQiqyvky59UjJrwnpj6LhN6wSYGUfT6wqE3hnFSyhWQ";
    const QWEN_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";

    // 5. PROMPT MASTER COMPLETO E RÍGIDO
    const promptMaster = `
PROMPT MESTRE — IA GERADORA DE SITES PERSONALIZADOS DE ALTA CONVERSÃO

Você é um Engenheiro de Software Front-End Sênior, UX/UI Designer internacional e especialista em criação de sites modernos, elegantes e focados em resultados.
Sua missão é criar um site completo em arquivo único HTML5, totalmente responsivo, profissional e visualmente impactante, utilizando rigorosamente os dados abaixo.

=====================================================
REGRA PRINCIPAL DE MONTAGEM
=====================================================
1. As INFORMAÇÕES OBRIGATÓRIAS devem ser utilizadas na construção das seções estruturais.
2. As SEÇÕES OPCIONAIS só devem existir se houverem dados preenchidos no briefing abaixo. Se o dado estiver vazio ou omitido, NÃO crie a seção correspondente e NÃO invente textos falsos ou placeholders.
3. NUNCA exiba textos de exemplo como: "Nome do serviço", "Produto aqui", "Lorem Ipsum", "Depoimento do cliente", "Sua imagem aqui".

=====================================================
INFORMAÇÕES OBRIGATÓRIAS DO SITE
=====================================================
- Nome da Empresa: ${nome}
- Segmento / Área de Atuação: ${nicho}
- Slogan / Frase de Impacto: ${slogan}
- Descrição e História: ${descricao}
- Público-Alvo: ${publico_alvo}
- Principais Diferenciais: ${diferenciais}
- WhatsApp / Telefone Principal: ${whatsappLimpo}

=====================================================
INFORMAÇÕES OPCIONAIS (USAR APENAS SE DISPONÍVEIS)
=====================================================
ESTILO VISUAL SELECIONADO: ${estilo || 'Automático/Moderno para o segmento'}
Cor Primária: ${cor_primaria}
Cor Secundária: ${cor_secundaria}
Link da Logo: ${link_logo ? link_logo : 'Nenhuma logo enviada (Utilizar o nome da empresa em tipografia estilizada no header)'}

IMAGENS PERSONALIZADAS:
${instrucaoImagensPersonalizadas}

SERVIÇOS:
${blocoServicos}

PRODUTOS:
${blocoProdutos}

OFERTA ESPECIAL:
${blocoOferta}

GALERIA / PORTFÓLIO:
${blocoGaleria}

CONTATO COMPLEMENTAR:
E-mail: ${email ? email : 'Não informado (Não exibir e-mail fictício no site)'}
Endereço: ${endereco ? endereco : 'Não informado (Não exibir endereço fictício no site)'}
Redes Sociais Enviadas: ${Object.keys(redes_sociais).length > 0 ? JSON.stringify(redes_sociais) : 'Nenhuma rede enviada (Exibir apenas o botão de contato)'}

CONFIGURAÇÃO DO CTA PRINCIPAL:
- Texto do Botão: "${cta_texto}"
- Destino Selecionado: ${cta_destino}
- Mensagem Automática / Detalhe: "${cta_detalhe}"
(Observação: Se for WhatsApp, monte o link corretamente: https://wa.me/${whatsappLimpo}?text=${encodeURIComponent(cta_detalhe || 'Olá! Vim pelo site e gostaria de mais informações.')})

=====================================================
REGRAS ESTRUTURAIS E DESIGN (INVIOLÁVEIS)
=====================================================

1. HEADER:
- Fundo fixo ou translúcido com Glassmorphic Blur.
- Logo (se houver) ou Nome da Empresa estilizado.
- Menu de navegação responsivo apontando APENAS para seções que REALMENTE existem no site.
- Menu Hambúrguer funcional via JavaScript para mobile.

2. HERO SECTION:
- Apresentação impactante de altíssimo nível.
- Headline gigante, slogan, resumo persuasivo do segmento (${nicho}), badges de diferenciais e botão CTA destacado.

3. SOBRE A EMPRESA:
- Seção institucional contando a história e diferenciais de forma elegante, dividida em cards ou colunas.

4. DEPOIMENTOS — OBRIGATÓRIO (EXATAMENTE 3 DEPOIMENTOS):
Independentemente das opções do formulário, o site DEVE conter 3 depoimentos realistas com 5 estrelas amarelas (<i class="fas fa-star text-yellow-400"></i>).
Utilize obrigatoriamente estes 3 nomes e imagens nos depoimentos:
  1. Nome: "Ana Clara" | Foto: https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80
  2. Nome: "João Lucas" | Foto: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80
  3. Nome: "Natália Oliveira" | Foto: https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80

5. PERGUNTAS FREQUENTES (FAQ) — OBRIGATÓRIO (EXATAMENTE 8 PERGUNTAS E RESPOSTAS):
- Crie EXATAMENTE 8 perguntas e respostas essenciais e extremamente úteis sobre o segmento (${nicho}).
- O FAQ DEVE ser um acordeão sanfonado interativo com JavaScript (clicar no título revela/oculta a resposta suavemente).
- As respostas DEVEM ter contraste de cor perfeito e excelente legibilidade.

6. SEÇÃO DE CONTATO E FOOTER:
- Seção de contato destacada oferecendo o botão para o WhatsApp (${whatsappLimpo}) e exibindo e-mail/endereço SOMENTE se tiverem sido fornecidos.
- Footer completo contendo: "© 2026 ${nome}. Todos os direitos reservados."
- Botão flutuante fixo do WhatsApp no canto inferior direito da tela.

=====================================================
TECNOLOGIAS E ANIMAÇÕES
=====================================================
- Arquivo único HTML5.
- CDN do Tailwind CSS para estilização moderna.
- FontAwesome para ícones.
- Google Fonts (Fontes modernas como 'Plus Jakarta Sans' ou 'Inter').
- JavaScript puro nativo com IntersectionObserver para efeitos de Scroll Reveal (elementos surgem suavemente com fade-up ao rolar a página).

=====================================================
REGRA FINAL DE SAÍDA (FORMATO ESTRITO)
=====================================================
Retorne EXCLUSIVAMENTE o código HTML5 completo.
NÃO inclua nenhuma explicação, introdução ou conclusão.
NÃO utilize blocos de código tipo \`\`\`html.
A resposta DEVE começar rigorosamente com:
<!DOCTYPE html>
E terminar exatamente com:
</html>
`;

    // 6. EXECUÇÃO DA CHAMADA À IA
    const respQwen = await fetch(QWEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "qwen-max",
        messages: [
          { 
            role: "system", 
            content: "Você é um compilador de código HTML/Tailwind CSS de nível internacional. Sua função é gerar EXCLUSIVAMENTE o código HTML5 puro, sem explicações, sem texto antes ou depois e sem blocos de código Markdown." 
          },
          { 
            role: "user", 
            content: promptMaster 
          }
        ],
        temperature: 0.4
      })
    });

    const dataQwen = await respQwen.json();

    if (dataQwen.error) {
      console.error("Erro na resposta da Qwen:", dataQwen.error);
      return res.status(400).json({ success: false, error: `Erro na IA: ${dataQwen.error.message}` });
    }

    let siteHtml = dataQwen?.choices?.[0]?.message?.content || "";

    // 7. LIMPEZA RÍGIDA DE MARCAÇÕES MARKDOWN
    siteHtml = siteHtml.replace(/```html/gi, '').replace(/```/g, '').trim();

    if (!siteHtml || siteHtml.length < 100) {
      return res.status(500).json({ success: false, error: 'A IA não retornou um código HTML válido.' });
    }

    // 8. NOTIFICAÇÃO VIA ROBÔ DO RAILWAY (WhatsApp)
    const URL_ROBO = 'https://bot-whatsapp-production-c379.up.railway.app/send-message';
    const textoMensagem = `Olá, ${nome}! 🚀\n\nSeu site profissional de alta conversão foi gerado com sucesso pela nossa Inteligência Artificial!\n\nAcesse a plataforma para visualizar a prévia completa em tela cheia.`;

    try {
      await fetch(URL_ROBO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: whatsappLimpo, text: textoMensagem })
      });
    } catch (eRobo) {
      console.error("Erro no envio do aviso do robô:", eRobo);
    }

    // 9. RETORNO PARA O FRONTEND
    return res.status(200).json({ success: true, html: siteHtml });

  } catch (error) {
    console.error('Erro no servidor/handler:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
