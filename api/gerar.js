export default async function handler(req, res) {
  // Configuração de CORS para aceitar requisições do seu site
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

    // Garante que o número receba a formatação limpa (somente números)
    let numeroLimpo = String(whatsapp).replace(/\D/g, '');

    // Garante o código do Brasil (55) no início do número
    if (!numeroLimpo.startsWith('55')) {
      numeroLimpo = '55' + numeroLimpo;
    }

    // URL do seu robô no Railway que está online
    const URL_ROBO = 'https://bot-whatsapp-production-c379.up.railway.app/send-message';

    // Mensagem que o ROBÔ vai enviar diretamente para o WhatsApp do cliente
    const textoMensagem = `Olá, ${nome}! 🚀\n\nSua solicitação para criar o site "${ideia}" foi recebida com sucesso!\n\nSeu projeto já está sendo processado pela nossa Inteligência Artificial.`;

    // O Robô no Railway envia a mensagem para o número do cliente
    const respostaRailway = await fetch(URL_ROBO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: numeroLimpo,
        text: textoMensagem
      })
    });

    const resultadoRailway = await respostaRailway.json();

    return res.status(200).json({ 
      success: true, 
      message: 'Mensagem disparada pelo robô!',
      railwayResponse: resultadoRailway 
    });

  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
