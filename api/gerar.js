export default async function handler(req, res) {
  // Libera permissão CORS
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

    // URL do seu robô no Railway
    const URL_ROBO = 'https://bot-whatsapp-production-c379.up.railway.app/send-message';

    // Texto da mensagem enviada no WhatsApp do cliente
    const mensagem = `Olá, ${nome}! 🚀\n\nSua solicitação para criar o site sobre "${ideia}" foi recebida com sucesso! Estamos gerando seu projeto.`;

    // Dispara a mensagem via robô no Railway
    await fetch(URL_ROBO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: whatsapp,
        text: mensagem
      })
    });

    return res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
