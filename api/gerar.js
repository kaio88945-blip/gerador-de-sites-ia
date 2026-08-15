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

    // 3. TRATAMENTO DAS INFORMAÇÕES OPCIONAIS
    const estilo = dados.estilo || '';
    const cor_primaria = dados.cor_primaria || '#6366f1';
    const cor_secundaria = dados.cor_secundaria || '#22c55e';
    const link_logo = dados.link_logo || '';

    // Imagens Personalizadas enviadas pelo cliente
    let instrucaoImagensPersonalizadas = "O cliente NÃO enviou fotos personalizadas. NUNCA crie galerias vazias, nem coloque quadros cinzas de fotos e NUNCA coloque fotos aleatórias do Unsplash como imagem de fundo de seções.";
    if (dados.imagens_personalizadas && Array.isArray(dados.imagens_personalizadas) && dados.imagens_personalizadas.length > 0) {
      const imgsValidas = dados.imagens_personalizadas.filter(img => img.url && img.url.trim().length > 5);
      if (imgsValidas.length > 0) {
        instrucaoImagensPersonalizadas = "O cliente enviou as seguintes imagens personalizadas reais. Utilize-as estrategicamente nos locais indicados por suas descrições:\n" +
          imgsValidas.map((img, i) => `- Imagem ${i + 1}: URL="${img.url}" | Uso/Descrição="${img.descricao || 'Foto do cliente'}"`).join("\n");
      }
    }

    // Blocos Condicionais de Seções Opcionais
    let blocoServicos = "O cliente NÃO enviou uma lista de serviços. NÃO crie a seção de serviços no site.";
    if (dados.servicos && Array.isArray(dados.servicos) && dados.servicos.length > 0) {
      blocoServicos = "CRIE A SEÇÃO DE SERVIÇOS com os seguintes itens fornecidos:\n" + JSON.stringify(dados.servicos, null, 2);
    }

    let blocoProdutos = "O cliente NÃO enviou uma lista de produtos. NÃO crie a seção de produtos no site.";
    if (dados.produtos && Array.isArray(dados.produtos) && dados.produtos.length > 0) {
      blocoProdutos = "CRIE A SEÇÃO DE PRODUTOS com os seguintes itens fornecidos:\n" + JSON.stringify(dados.produtos, null, 2);
    }

    let blocoOferta = "O cliente NÃO enviou uma oferta especial. NÃO crie a seção de oferta/promoção no site.";
    if (dados.oferta && (dados.oferta.titulo || dados.oferta_titulo)) {
      blocoOferta = "CRIE UMA SEÇÃO DE OFERTA/PROMOÇÃO DE ALTA CONVERSÃO com os seguintes dados:\n" + JSON.stringify(dados.oferta, null, 2);
    }

    let blocoGaleria = "O cliente NÃO forneceu link de galeria/portfólio. NÃO crie a seção de galeria.";
    if (dados.link_galeria && dados.link_galeria.trim().length > 5) {
      blocoGaleria = `CRIE A SEÇÃO DE GALERIA/PORTFÓLIO apontando para: ${dados.link_galeria}`;
    }

    const email = dados.email || '';
    const endereco = dados.endereco || '';
    const redes_sociais = dados.redes_sociais || {};

    const cta_texto = dados.cta_texto || 'Falar no WhatsApp';
    const cta_destino = dados.cta_destino || 'whatsapp';
    const cta_detalhe = dados.cta_detalhe || '';

    // 4. CONFIGURAÇÃO DA IA (Qwen / DashScope)
    const QWEN_API_KEY = process.env.QWEN_API_KEY || "sk-ws-H.DMEDIDR.A3e2.MEQCIBYvIBLMRQFijb7-GkusJzYzSbGUbSgRRNT_OFjGY2A3AiBvQiqyvky59UjJrwnpj6LhN6wSYGUfT6wqE3hnFSyhWQ";
    const QWEN_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";

    // 5. PROMPT MASTER COMPLETO, EXTENSO E REFINADO
    const promptMaster = `
PROMPT MESTRE — GERADOR DE SITES DE ALTA PERFORMANCE E CONVERSÃO (2026)

Você é um Engenheiro de Software Front-End Sênior e Lead Designer UI/UX. Sua missão é criar um site HTML5 completo, robusto, extenso, moderno e visualmente impecável.

=====================================================
REGRA CRÍTICA #1: PROIBIDO USAR FOTOS UNSPLASH COMO IMAGEM DE FUNDO
=====================================================
- NUNCA utilize imagens de fundo do Unsplash (background-image) em seções como Hero, Sobre, Contato ou Seções Principais.
- O design do site deve ser construído 100% com CSS moderno de alto nível: gradientes refinados, cores sólidas elegantes, sombras suaves, overlays de blur e cards com Glassmorphism.
- As ÚNICAS fotos externas permitidas no site são os 3 pequenos avatares dos depoimentos dos clientes.

=====================================================
REGRA CRÍTICA #2: EXPANSÃO APROFUNDADA DE CONTEÚDO (SEM INVENTAR DADOS FALSOS)
=====================================================
- O site NÃO deve ser curto nem superficial. Desenvolva uma página extensa, detalhada e rica em conteúdo persuasivo.
- Pegue as informações fornecidas e desdobre-as em parágrafos bem escritos, tópicos explicativos, seções de metodologia, motivos para escolher a empresa, etapas de atendimento e benefícios para o cliente.
- NUNCA invente dados falsos como preços não informados, e-mails fictícios ou endereços que não foram fornecidos.

=====================================================
INFORMAÇÕES OBRIGATÓRIAS DO CLIENTE
=====================================================
- Nome da Empresa: ${nome}
- Segmento / Área de Atuação: ${nicho}
- Slogan / Frase de Impacto: ${slogan}
- Descrição e História: ${descricao}
- Público-Alvo: ${publico_alvo}
- Principais Diferenciais: ${diferenciais}
- WhatsApp / Telefone Principal: ${whatsappLimpo}

=====================================================
INFORMAÇÕES OPCIONAIS (INCLUIR SOMENTE SE DISPONÍVEIS)
=====================================================
ESTILO VISUAL SOLICITADO: ${estilo || 'Moderno e Profissional para o segmento'}
Cor Primária de Destaque: ${cor_primaria}
Cor Secundária: ${cor_secundaria}
Link da Logo: ${link_logo ? link_logo : 'Nenhuma logo enviada (Exibir nome da empresa com tipografia elegante e estilizada no Header)'}

IMAGENS PERSONALIZADAS ENVIADAS:
${instrucaoImagensPersonalizadas}

SERVIÇOS:
${blocoServicos}

PRODUTOS:
${blocoProdutos}

OFERTA ESPECIAL:
${blocoOferta}

GALERIA / PORTFÓLIO:
${blocoGaleria}

CONTATO ADICIONAL:
E-mail: ${email ? email : 'Não fornecido (Não exibir e-mail no site)'}
Endereço: ${endereco ? endereco : 'Não fornecido (Não exibir endereço no site)'}
Redes Sociais: ${Object.keys(redes_sociais).length > 0 ? JSON.stringify(redes_sociais) : 'Não enviadas (Exibir apenas o botão principal de atendimento)'}

CONFIGURAÇÃO DO CTA PRINCIPAL:
- Texto do Botão: "${cta_texto}"
- Destino: ${cta_destino}
- Mensagem Automática: "${cta_detalhe}"
(Link do WhatsApp pré-formatado: https://wa.me/${whatsappLimpo}?text=${encodeURIComponent(cta_detalhe || 'Olá! Vim pelo site e gostaria de mais informações.')})

=====================================================
ESTRUTURA DETALHADA E SEÇÕES DO SITE
=====================================================

1. HEADER FIXO ELEGANTE:
- Menu com efeito Glassmorphism (blur de fundo).
- Logo ou Nome da empresa com tipografia estilizada.
- Links de navegação apontando exclusivamente para seções existentes.
- Botão CTA destacado para o WhatsApp.
- Menu Hambúrguer funcional para mobile via JavaScript.

2. HERO SECTION IMPACTANTE (DESIGN 100% CSS):
- Fundo moderno em gradientes e cores com CSS puro (SEM foto Unsplash de fundo).
- Badge de autoridade em destaque.
- Headline gigante e persuasiva.
- Parágrafos detalhados sobre como a empresa atende o nicho (${nicho}).
- Botões de ação com efeitos de iluminação e hover.

3. SEÇÃO SOBRE E INSTITUCIONAL EXPANDIDA:
- Desdobre a história, visão e pilares da empresa em textos ricos, bem formatados e agradáveis de ler.
- Apresente os diferenciais (${diferenciais}) em uma grade de cards interativos com ícones do FontAwesome.

4. SEÇÃO "COMO FUNCIONA / ETAPAS DE ATENDIMENTO":
- Crie um passo a passo numerado de 3 a 4 etapas explicando como o cliente é atendido desde o primeiro contato no WhatsApp até a entrega dos resultados.

5. SEÇÃO DE SERVIÇOS / PRODUTOS / OFERTA:
- Crie APENAS se tiverem sido fornecidos no briefing.

6. DEPOIMENTOS — OBRIGATÓRIO (EXATAMENTE 3 CARDS):
- Crie 3 cards de depoimentos com avaliação de 5 estrelas (<i class="fas fa-star text-yellow-400"></i>), aspas elegantes e depoimentos ultra-realistas.
- Utilize rigorosamente estes 3 nomes e fotos de perfil:
  1. "Ana Clara" | Foto: https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80
  2. "João Lucas" | Foto: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80
  3. "Natália Oliveira" | Foto: https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80

7. FAQ REDESENHADO, LINDO E COM RESPOSTAS RICAS (EXATAMENTE 8 PERGUNTAS):
- Crie um FAQ visualmente deslumbrante com cards bem acabados, sombras sutis, bordas arredondadas e ícones animáveis (+ / - ou seta).
- CADA UMA DAS 8 PERGUNTAS DEVE POSSUIR UMA RESPOSTA EXTENSA, COMPLETA, DETALHADA E PERFEITAMENTE VISÍVEL DENTRO DO ACORDEÃO.
- Escreva respostas que passem autoridade, tirem dúvidas reais sobre o nicho (${nicho}), prazos, formas de contato e processo.
- Insira o script JavaScript que permite abrir e fechar a resposta com animação suave e transição fluida ao clicar.

8. SEÇÃO DE CONTATO E FOOTER COMPLETO:
- Bloco final de alta conversão convidando o cliente para conversar no WhatsApp (${whatsappLimpo}).
- Exiba e-mail ou endereço SOMENTE se fornecidos.
- Rodapé refinado: "© 2026 ${nome}. Todos os direitos reservados."
- Botão flutuante fixo do WhatsApp no canto inferior direito da tela.

=====================================================
TECNOLOGIAS E ESTILIZAÇÃO
=====================================================
- Arquivo único HTML5 completo e funcional.
- Tailwind CSS via CDN.
- FontAwesome para ícones.
- Fonte moderna Google Fonts ('Plus Jakarta Sans' ou 'Inter').
- JavaScript puro para acordeão do FAQ, menu mobile e animações de entrada no scroll com IntersectionObserver.

=====================================================
FORMATO EXCLUSIVO DE RESPOSTA
=====================================================
Retorne EXCLUSIVAMENTE o código HTML5 puro do <!DOCTYPE html> até </html>.
NÃO use blocos Markdown de código (\`\`\`html).
NÃO escreva nenhuma introdução, explicação ou comentário antes ou depois do código.
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
            content: "Você é um compilador de código HTML/Tailwind CSS de nível internacional. Sua função é gerar EXCLUSIVAMENTE o código HTML5 puro, sem explicações, sem fotos Unsplash de fundo, sem texto antes ou depois e sem blocos de código Markdown." 
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

    // 7. LIMPEZA DE MARKDOWN
    siteHtml = siteHtml.replace(/```html/gi, '').replace(/```/g, '').trim();

    if (!siteHtml || siteHtml.length < 100) {
      return res.status(500).json({ success: false, error: 'A IA não retornou um código HTML válido.' });
    }

    // 8. NOTIFICAÇÃO VIA ROBÔ DO RAILWAY (WhatsApp)
    const URL_ROBO = 'https://bot-whatsapp-production-c379.up.railway.app/send-message';
    const textoMensagem = `Olá, ${nome}! 🚀\n\nSeu site profissional Premium foi gerado com sucesso pela nossa Inteligência Artificial!\n\nAcesse a plataforma para visualizar a prévia em tela cheia.`;

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
