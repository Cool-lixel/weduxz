// api/send-message.js
export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metode tidak diizinkan' });
    }

    const { botToken, chatId, text, photoUrl, videoUrl, caption } = req.body;

    if (!botToken || !chatId) {
        return res.status(400).json({ error: 'Token bot dan ID chat diperlukan' });
    }

    let telegramApiMethod = '';
    let payload = { chat_id: chatId };
    let successMessage = '';

    if (photoUrl) {
        telegramApiMethod = 'sendPhoto';
        payload.photo = photoUrl;
        if (caption) payload.caption = caption;
        successMessage = `Gambar berhasil dikirim ke ID ${chatId}`;
    } else if (videoUrl) {
        telegramApiMethod = 'sendVideo';
        payload.video = videoUrl;
        if (caption) payload.caption = caption;
        successMessage = `Video berhasil dikirim ke ID ${chatId}`;
    } else if (text) {
        telegramApiMethod = 'sendMessage';
        payload.text = text;
        successMessage = `Pesan teks berhasil dikirim ke ID ${chatId}`;
    } else {
        return res.status(400).json({ error: 'Setidaknya pesan teks, URL gambar, atau URL video diperlukan' });
    }

    try {
        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/${telegramApiMethod}`;
        const apiRes = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await apiRes.json();

        if (!apiRes.ok || !data.ok) {
            console.error('Telegram API Error:', data);
            return res.status(apiRes.status).json({ error: data.description || `Gagal mengirim ${telegramApiMethod}` });
        }

        res.status(200).json({ message: successMessage });
    } catch (error) {
        console.error('Error in send-message:', error);
        res.status(500).json({ error: 'Kesalahan internal server' });
    }
};
