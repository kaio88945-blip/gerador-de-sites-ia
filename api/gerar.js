export default async function handler(req, res) {
  // Configuração do CORS
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

    // Trata e limpa o número
    let numeroLimpo = String(whatsapp || '').replace(/\D/g, '');
    if (!numeroLimpo.startsWith('55')) {
      numeroLimpo = '55' + numeroLimpo;
    }

    // URL pública do robô no Railway
    const URL_ROBO = 'https://bot-whatsapp-production-c379.up.railway.app/send-message';

    const textoMensagem = `Olá, ${nome || 'Cliente'}! 🚀\n\nRecebemos sua solicitação para o site sobre: "${ideia || 'Seu Negócio'}".\n\nSua Inteligência Artificial já está criando o projeto!`;

    // Chamada para o Railway
    const respostaRailway = await fetch(URL_ROBO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: numeroLimpo,
        text: textoMensagem
      })
    });

    const data = await respostaRailway.json();

    return res.status(200).json({ success: true, railway: data });
  } catch (error) {
    console.error('Erro ao chamar o Railway:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
