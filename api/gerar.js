export default async function handler(req, res) {
  // Liberar requisição de qualquer origem (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { nome, whatsapp, ideia } = req.body;

    if (!whatsapp) {
      return res.status(400).json({ success: false, error: 'O número de WhatsApp é obrigatório!' });
    }

    // 1. Limpeza rigorosa do número de WhatsApp
    let numeroLimpo = String(whatsapp).replace(/\D/g, ''); // Remove tudo que não for dígito
    if (!numeroLimpo.startsWith('55')) {
      numeroLimpo = '55' + numeroLimpo;
    }

    // URL do seu robô no Railway
    const URL_ROBO = 'https://bot-whatsapp-production-c379.up.railway.app/send-message';

    // Texto de teste da notificação do robô
    const textoMensagem = `Olá, ${nome || 'Cliente'}! 🚀\n\nRecebemos o seu briefing para o site sobre: "${ideia || 'Seu Negócio'}".\n\nSua Inteligência Artificial já iniciou o desenvolvimento do seu site!`;

    console.log(`Disparando mensagem para o número: ${numeroLimpo}`);

    // 2. Disparo direto para o Robô do WhatsApp no Railway
    const respostaRailway = await fetch(URL_ROBO, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        number: numeroLimpo,
        text: textoMensagem
      })
    });

    const resultadoRailway = await respostaRailway.json();
    console.log('Resposta do Railway:', resultadoRailway);

    return res.status(200).json({ 
      success: true, 
      message: 'Notificação enviada no WhatsApp!',
      railway: resultadoRailway 
    });

  } catch (error) {
    console.error('Erro na API da Vercel:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
