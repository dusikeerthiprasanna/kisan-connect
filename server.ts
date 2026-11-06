import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client if key available
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.error('Failed to initialize Gemini SDK:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// AI Assistant Endpoint: Ask KisanRent
app.post('/api/chat', async (req, res) => {
  const { message, language = 'en', equipmentCatalog = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Provide catalog summary context to Gemini
  const catalogContext = Array.isArray(equipmentCatalog) && equipmentCatalog.length > 0
    ? equipmentCatalog.slice(0, 15).map((e: any) => 
        `- ${e.name} (${e.category}): ₹${e.pricePerHour}/hr, ₹${e.pricePerDay}/day in ${e.location?.village}, ${e.location?.district}. HP/Specs: ${e.specs?.hp || e.specs?.capacity || 'Standard'}. Operator: ${e.operatorIncluded ? 'Yes' : 'No'}. ID: ${e.id}`
      ).join('\n')
    : 'Default catalog available with Tractors, Harvesters, Cultivators, Sprayers around Vijayawada and Guntur.';

  const systemInstruction = `You are "KISAN CONNECT", a warm, respectful, and highly knowledgeable agricultural machinery AI assistant for KISAN CONNECT in Andhra Pradesh and Telangana, India.
You help farmers find the right equipment (Tractor, Harvester, Cultivator, Seed Drill, Sprayer, Drone Sprayer, Water Tanker, Rotavator, Plough) based on their crop, field acreage, timing, and budget.
Current user language preference: ${language === 'te' ? 'Telugu (తెలుగు)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English'}.
Always reply in the user's selected language (${language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English'}).
If the farmer asks in Telugu or Hindi, respond naturally in that language using respectful terminology like "రైతు సోదరా" (Farmer brother) or "किसान भाई".
Keep your answers brief, actionable, and easy to understand for farmers with low digital literacy.
Suggest 1 to 3 matching equipment from this available catalog if relevant:
${catalogContext}

If suggesting equipment, mention the equipment name, price, and location. Also provide recommended action like "Tap Search or View Details to book".`;

  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemInstruction },
              { text: `Farmer request: "${message}"` }
            ]
          }
        ],
        config: {
          temperature: 0.3,
          maxOutputTokens: 600,
        }
      });

      const replyText = response.text || '';
      return res.json({ reply: replyText });
    } catch (err: any) {
      console.error('Gemini API call failed:', err?.message || err);
      // Fallback below
    }
  }

  // Smart localized rule-based fallback when GEMINI_API_KEY is not configured or in offline state
  const lowerMsg = message.toLowerCase();
  let fallbackReply = '';

  if (language === 'te') {
    if (lowerMsg.includes('ట్రాక్టర్') || lowerMsg.includes('tractor') || lowerMsg.includes('దున్నడం')) {
      fallbackReply = 'రైతు సోదరా! మా వద్ద విజయవాడ & గుంటూరు ప్రాంతాల్లో మహీంద్రా 575 DI (45 HP) మరియు జాన్ డీర్ 5050D ట్రాక్టర్లు గంటకు ₹650 నుండి అందుబాటులో ఉన్నాయి. ఆపరేటర్ కూడా ఉంటారు. మీరు డైరెక్ట్‌గా యాప్‌లో బుక్ చేసుకోవచ్చు!';
    } else if (lowerMsg.includes('కోత') || lowerMsg.includes('harvester') || lowerMsg.includes('వరి')) {
      fallbackReply = 'వరి మరియు మొక్కజొన్న కోత కోసం ప్రీత్ 987 కంబైన్ హార్వెస్టర్ రోజుకు ₹18,000 కు మైలవరం & ఏలూరు వద్ద అందుబాటులో ఉంది. ఇంధనం మరియు ఆపరేటర్ కూడా ఉంటాయి!';
    } else if (lowerMsg.includes('స్ప్రేయర్') || lowerMsg.includes('drone') || lowerMsg.includes('మందు')) {
      fallbackReply = 'పురుగుమందుల పిచికారీ కోసం గార్విమ్ 16L అగ్రికల్చర్ డ్రోన్ స్ప్రేయర్ ఎకరానికి తక్కువ ఖర్చుతో అందుబాటులో ఉంది. గంటకు ₹1,200 మాత్రమే!';
    } else {
      fallbackReply = 'నమస్కారం రైతు సోదరా! మీకు ఏ పరికరం కావాలి? ట్రాక్టర్, హార్వెస్టర్, రొటవేటర్ లేదా డ్రోన్ స్ప్రేయర్? మీరు మీ ఊరు లేదా బడ్జెట్ చెబితే సరిగ్గా సహాయం చేస్తాను.';
    }
  } else if (language === 'hi') {
    if (lowerMsg.includes('ट्रैक्टर') || lowerMsg.includes('tractor') || lowerMsg.includes('जुताई')) {
      fallbackReply = 'किसान भाई! विजयवाड़ा और गुंटूर क्षेत्र में महिंद्रा 575 DI (45 HP) ट्रैक्टर ₹650/घंटे से उपलब्ध है। ऑपरेटर भी साथ मिलेगा। आप तुरंत सर्च करके बुक कर सकते हैं!';
    } else if (lowerMsg.includes('हार्वेस्टर') || lowerMsg.includes('harvester') || lowerMsg.includes('कटाई')) {
      fallbackReply = 'धान और मक्का की कटाई के लिए प्रीत 987 कंबाइन हार्वेस्टर ₹18,000/दिन में उपलब्ध है। ऑपरेटर और ईंधन शामिल हैं!';
    } else if (lowerMsg.includes('ड्रोन') || lowerMsg.includes('drone') || lowerMsg.includes('दवा')) {
      fallbackReply = 'कीटनाशक छिड़काव के लिए आधुनिक कृषि ड्रोन ₹1,200/घंटे में उपलब्ध है। 15 मिनट में 1 एकड़ छिड़काव हो जाता है!';
    } else {
      fallbackReply = 'नमस्ते किसान भाई! आपको कौन सा कृषि उपकरण चाहिए? ट्रैक्टर, कंबाइन हार्वेस्टर, कल्टीवेटर या ड्रोन? मुझे अपनी आवश्यकता बताएं, मैं तुरंत सुझाव दूंगा।';
    }
  } else {
    if (lowerMsg.includes('tractor') || lowerMsg.includes('plough') || lowerMsg.includes('tillage')) {
      fallbackReply = 'Hello farmer! We have reliable tractors like Mahindra 575 DI (45 HP) and John Deere 5050D available starting at ₹650/hour near Vijayawada & Guntur with experienced operators included.';
    } else if (lowerMsg.includes('harvester') || lowerMsg.includes('paddy') || lowerMsg.includes('cutting')) {
      fallbackReply = 'For grain and paddy harvesting, Preet 987 Combine Harvester is available around Mylavaram & Eluru at ₹18,000/day including operator and fuel.';
    } else if (lowerMsg.includes('drone') || lowerMsg.includes('spray')) {
      fallbackReply = 'For fast crop pesticide spraying, Garuda 16L Agriculture Drone is ready near Vijayawada at ₹1,200/hour. Covers 1 acre in 15 mins!';
    } else {
      fallbackReply = 'Welcome to Kisan Connect! I can help you find Tractors, Harvesters, Drone Sprayers, Rotavators and more near your village. What equipment do you need today?';
    }
  }

  res.json({ reply: fallbackReply });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KISAN CONNECT server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
