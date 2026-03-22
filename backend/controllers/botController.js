import Groq from 'groq-sdk';
import BotResponse from '../models/BotResponse.js';

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

if (!groq) {
  console.warn("GROQ_API_KEY topilmadi. Bot javoblari cheklangan bo'ladi.");
}

export const askBot = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Xabar yuborilmadi' });
  }

  try {
    if (!groq) {
      throw new Error("Groq client not initialized (missing API key)");
    }
    // 1. Groq orqali javob olish
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Sen "HealthAI" intellektual salomatlik konsyerjisans. 
      Sening asosiy vazifang foydalanuvchi belgilarini tahlil qilish va ularga to'g'ri tibbiy yo'nalish berishdir (Diplom ishi mavzusi: "Medicinalıq másláhát beriw hám qánigelerge jóneltiriw").

      Qoidalar:
      1. Har doim o'zbek tilida javob ber.
      2. Foydalanuvchi shikoyatlarini diqqat bilan tahlil qil.
      3. Tashxis qo'yma, lekin ehtimoliy holatlarni tushuntir.
      4. Eng muhimi: Mos keladigan shifokor mutaxassisligini (masalan: Nevropatolog, Kardiolog, Terapevt, Dermatolog) aniq ko'rsat.
      5. Javobing oxirida har doim "yo'nalish" kalit so'zi bilan mutaxassisni yoz. Masalan: [yo'nalish: Kardiolog]
      6. Muomala odobiga rioya qil va foydalanuvchini tinchlantir.
    `,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 500,
    });

    const botText = chatCompletion.choices[0]?.message?.content || "Kechirasiz, hozirda javob bera olmayman.";

    // 2. Tavsiya etilgan mutaxassisni aniqlash (oddiy regex orqali)
    let recommendedSpecialty = null;
    const lowerText = botText.toLowerCase();

    if (lowerText.includes('kardiolog')) recommendedSpecialty = 'Kardiolog';
    else if (lowerText.includes('nevrolog')) recommendedSpecialty = 'Nevrolog';
    else if (lowerText.includes('nevropatolog')) recommendedSpecialty = 'Nevrolog';
    else if (lowerText.includes('terapevt')) recommendedSpecialty = 'Terapevt';
    else if (lowerText.includes('stomatolog')) recommendedSpecialty = 'Stomatolog';
    else if (lowerText.includes('urolog')) recommendedSpecialty = 'Urolog';
    else if (lowerText.includes('ginekolog')) recommendedSpecialty = 'Ginekolog';
    else if (lowerText.includes('lor')) recommendedSpecialty = 'LOR';
    else if (lowerText.includes('oftalmolog')) recommendedSpecialty = 'Oftalmolog';
    else if (lowerText.includes('shifokor')) recommendedSpecialty = 'Terapevt';

    res.json({
      response: {
        text: botText,
        recommendedSpecialty: recommendedSpecialty
      }
    });

  } catch (error) {
    console.error('Groq API Error:', error);

    // Fallback: Agar Groq ishlamasa, bazadan qidirish
    try {
      const responses = await BotResponse.find();
      const lowerMessage = message.toLowerCase();
      const foundResponse = responses.find((r) => lowerMessage.includes(r.keyword.toLowerCase()));

      if (foundResponse) {
        return res.json({
          response: {
            text: foundResponse.response,
            recommendedSpecialty: foundResponse.recommendedSpecialty
          }
        });
      }
    } catch (dbError) {
      console.error('Database Fallback Error:', dbError);
    }

    res.status(500).json({
      message: 'Bot javob berishda xatolik yuz berdi',
      response: {
        text: "Kechirasiz, texnik nosozlik tufayli hozircha javob bera olmayman. Iltimos, keyinroq qayta urinib ko'ring."
      }
    });
  }
};