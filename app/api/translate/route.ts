import { NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { text, trigger_word } = await request.json();

    const languageCheck = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Twoim zadaniem jest określić, czy podany tekst jest po polsku. Odpowiedz tylko 'true' lub 'false'."
        },
        {
          role: "user",
          content: `Czy ten tekst jest po polsku: "${text}"`
        }
      ]
    });

    const isPolish = languageCheck.choices[0].message.content?.toLowerCase() === 'true';

    if (!isPolish) {
      return NextResponse.json({
        translatedText: text,
        originalText: text,
        wasTranslated: false
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Jesteś tłumaczem z języka polskiego na angielski. Tłumacz dokładnie. Jeżeli tekst jest w cudzysłowie, nie tłumacz go."
        },
        {
          role: "user",
          content: trigger_word 
            ? `Przetłumacz następujący prompt na angielski, zachowując słowo kluczowe "${trigger_word}": ${text}`
            : `Przetłumacz następujący prompt na angielski: ${text}`
        }
      ]
    });

    const translatedText = completion.choices[0].message.content;

    return NextResponse.json({
      translatedText,
      originalText: text,
      wasTranslated: true
    });
  } catch (error) {
    console.error('Błąd podczas tłumaczenia:', error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas tłumaczenia" },
      { status: 500 }
    );
  }
}
