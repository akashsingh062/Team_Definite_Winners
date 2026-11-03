import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface StudentContext {
  fullName?: string;
  major?: string;
  degree?: string;
  graduationYear?: number;
  preferredRole?: string;
  skills?: string[];
  totalApplications?: number;
  hasResume?: boolean;
}

export interface CompanionMessage {
  role: "user" | "assistant";
  content: string;
}

export interface DeepLink {
  label: string;
  href: string;
}

export interface CompanionResponse {
  reply: string;
  language: "en" | "hi";
  suggestedQuestions: string[];
  deepLinks: DeepLink[];
  isAiGenerated: boolean;
}

export const SUGGESTED_QUESTIONS_EN = [
  "What skills should I learn for a Full-Stack role?",
  "How can I improve my resume for software internships?",
  "How does the What-If Simulator help my career planning?",
  "How can I connect with an alumni mentor?",
  "What local tech opportunities are available nearby?",
];

export const SUGGESTED_QUESTIONS_HI = [
  "फुल-स्टैक डेवलपर बनने के लिए मुझे कौन सी स्किल्स सीखनी चाहिए?",
  "मैं इंटर्नशिप के लिए अपना रिज्यूमे कैसे बेहतर बनाऊं?",
  "व्हॉट-इफ सिम्युलेटर (What-If Simulator) मेरे करियर में कैसे मदद करेगा?",
  "मैं एक अनुभवी मेंटर से कैसे संपर्क कर सकता हूँ?",
  "मेरे क्षेत्र में कौन से स्थानीय अवसर और ट्रेनिंग सेंटर्स उपलब्ध हैं?",
];

export async function askCareerCompanion(
  message: string,
  language: "en" | "hi" = "en",
  history: CompanionMessage[] = [],
  studentContext?: StudentContext
): Promise<CompanionResponse> {
  const trimmed = message.trim();
  const ai = getAIClient();

  if (!ai) {
    return generateDeterministicCompanionFallback(trimmed, language, studentContext);
  }

  try {
    const studentInfoText = studentContext
      ? `Student Profile Context:
- Name: ${studentContext.fullName || "Student"}
- Major / Degree: ${studentContext.major || "Computer Science"} ${studentContext.degree || "B.Tech"} (Graduation: ${studentContext.graduationYear || "Upcoming"})
- Target Role: ${studentContext.preferredRole || "Software Developer"}
- Known Skills: ${studentContext.skills?.join(", ") || "General Technical Skills"}
- Applications Submitted: ${studentContext.totalApplications ?? 0}
- Resume Uploaded: ${studentContext.hasResume ? "Yes" : "No"}`
      : "Student Profile: General undergraduate student.";

    const historyText = history
      .slice(-4)
      .map((h) => `${h.role === "user" ? "Student" : "NexSkill Companion"}: ${h.content}`)
      .join("\n");

    const prompt = `You are the Multilingual AI Career Companion at NexSkill AI (From Skill to Opportunity), an empathetic, encouraging and expert career counselor for university students.
The student has asked you a question.

${studentInfoText}

${historyText ? `Recent Chat Context:\n${historyText}\n` : ""}
Language to respond in: ${language === "hi" ? "Hindi (हिंदी in Devanagari script, using natural tech terms like रिज्यूमे, इंटर्नशिप, कोडिंग, स्किल्स)" : "English (clear, encouraging, structured)"}

Student's current message: "${trimmed}"

Instructions:
1. Provide a well-structured, actionable response (2-3 concise paragraphs or bullet points).
2. Directly answer their question while connecting it to their target role (${studentContext?.preferredRole || "technology"}).
3. Reference relevant NexSkill platform tools when helpful (e.g., AI Resume Analyzer, Career Explorer, What-If Simulator, Skill Assessments, Skills Passport, Mentorship Network, Local Opportunities).
4. Maintain a warm, encouraging tone without making unrealistic employment guarantees.
5. If responding in Hindi, write in fluent, natural Hindi using Devanagari script.

Format your output as valid JSON with this exact structure:
{
  "reply": "Your full response text here",
  "suggestedQuestions": ["Follow up question 1", "Follow up question 2", "Follow up question 3"]
}`;

    const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "";
    const parsed = JSON.parse(text);

    const deepLinks = determineDeepLinks(trimmed, parsed.reply);

    return {
      reply: parsed.reply || generateFallbackReply(trimmed, language),
      language,
      suggestedQuestions: Array.isArray(parsed.suggestedQuestions) && parsed.suggestedQuestions.length > 0
        ? parsed.suggestedQuestions.slice(0, 3)
        : (language === "hi" ? SUGGESTED_QUESTIONS_HI.slice(0, 3) : SUGGESTED_QUESTIONS_EN.slice(0, 3)),
      deepLinks,
      isAiGenerated: true,
    };
  } catch (err) {
    console.warn("Gemini API call failed for Career Companion, using deterministic fallback:", err);
    return generateDeterministicCompanionFallback(trimmed, language, studentContext);
  }
}

function determineDeepLinks(query: string, reply: string): DeepLink[] {
  const combined = (query + " " + reply).toLowerCase();
  const links: DeepLink[] = [];

  if (combined.includes("resume") || combined.includes("रिज्यूमे") || combined.includes("cv")) {
    links.push({ label: "AI Resume Analyzer", href: "/dashboard/resume" });
  }
  if (combined.includes("career") || combined.includes("path") || combined.includes("करियर") || combined.includes("रोल")) {
    links.push({ label: "Career Explorer", href: "/dashboard/career-explorer" });
  }
  if (combined.includes("simulator") || combined.includes("what-if") || combined.includes("सिम्युलेटर") || combined.includes("skills")) {
    links.push({ label: "What-If Simulator", href: "/dashboard/career-simulator" });
  }
  if (combined.includes("assessment") || combined.includes("test") || combined.includes("टेस्ट") || combined.includes("परीक्षा")) {
    links.push({ label: "Skill Assessments", href: "/dashboard/assessments" });
  }
  if (combined.includes("mentor") || combined.includes("मेंटर") || combined.includes("guidance") || combined.includes("सलाह")) {
    links.push({ label: "Find a Mentor", href: "/dashboard/mentors" });
  }
  if (combined.includes("local") || combined.includes("nearby") || combined.includes("स्थानीय") || combined.includes("training centre")) {
    links.push({ label: "Local Opportunities", href: "/dashboard/local-opportunities" });
  }
  if (combined.includes("match") || combined.includes("recommend") || combined.includes("internship") || combined.includes("इंटर्नशिप") || combined.includes("नौकरी")) {
    links.push({ label: "Smart Matches", href: "/dashboard/recommendations" });
  }

  // Fallback defaults if none matched
  if (links.length === 0) {
    links.push({ label: "Career Explorer", href: "/dashboard/career-explorer" });
    links.push({ label: "Smart Matches", href: "/dashboard/recommendations" });
  }

  return links.slice(0, 3);
}

function generateFallbackReply(query: string, language: "en" | "hi"): string {
  if (language === "hi") {
    return `करियर मार्गदर्शन में आपका स्वागत है। आपके प्रश्न "${query}" के आधार पर, हम अनुशंसा करते हैं कि आप NexSkill AI के Career Explorer और Skill Gap Analyzer का उपयोग करके अपनी प्राथमिकताओं के अनुसार लक्षित कौशल विकसित करें।`;
  }
  return `Thank you for asking about "${query}". Based on your career goals, we recommend exploring our Career Explorer and Skill Gap Analyzer to identify high-impact technical competencies and build demonstrable project proof.`;
}

export function generateDeterministicCompanionFallback(
  query: string,
  language: "en" | "hi",
  studentContext?: StudentContext
): CompanionResponse {
  const q = query.toLowerCase();
  const name = studentContext?.fullName || (language === "hi" ? "साथी" : "there");
  const targetRole = studentContext?.preferredRole || "Software Developer";

  let reply = "";
  const deepLinks = determineDeepLinks(query, "");

  if (language === "hi") {
    if (q.includes("रिज्यूमे") || q.includes("resume") || q.includes("सीवी")) {
      reply = `नमस्ते ${name}! इंटर्नशिप के लिए एक मजबूत रिज्यूमे बनाने के लिए इन मुख्य बिंदुओं पर ध्यान दें:
1. **मापने योग्य परिणाम (Action-Oriented Metrics)**: अपने प्रोजेक्ट्स में सिर्फ जिम्मेदारियां न लिखें, बल्कि यह बताएं कि आपने क्या हासिल किया (उदा. "React और MongoDB का उपयोग करके लोडिंग समय 35% घटाया")।
2. **कुशलता सत्यापन (Verified Skills)**: NexSkill AI के AI Resume Analyzer पर अपना रिज्यूमे अपलोड करें, जिससे आपको तुरंत एटीएस (ATS) स्कोर और सुधार के सुझाव मिलेंगे।
3. **सक्रिय प्रोजेक्ट लिंक**: अपने GitHub रिपॉजिटरी और लाइव डेमो लिंक अवश्य शामिल करें।`;
    } else if (q.includes("स्किल") || q.includes("कौशल") || q.includes("skill") || q.includes("सीख")) {
      reply = `नमस्ते ${name}! ${targetRole} के लिए वर्तमान में सबसे अधिक मांग वाले कौशल ये हैं:
1. **कोर टेक्नोलॉजीज**: जावास्क्रिप्ट/टाइपस्क्रिप्ट, रिएक्ट या नेक्स्ट.जेएस, और नोड.जेएस बैकएंड।
2. **डेटाबेस व एपीआई**: REST API आर्किटेक्चर और MongoDB या PostgreSQL।
3. **प्रैक्टिकल टेस्ट**: NexSkill पर हमारे Skill Assessments देकर आप अपनी स्किल्स को "Verified" स्टेटस में बदल सकते हैं, जिससे एम्प्लॉयर्स का भरोसा बढ़ता है।`;
    } else if (q.includes("मेंटर") || q.includes("सलाह") || q.includes("mentor")) {
      reply = `नमस्ते ${name}! एक अनुभवी मेंटर से जुड़ना आपके करियर के लिए बेहद फायदेमंद है।
आप NexSkill के Mentorship Network पर जाकर पूर्व छात्रों और तकनीकी विशेषज्ञों की प्रोफाइल देख सकते हैं, 1-on-1 सेशन बुक कर सकते हैं, और अपने रिज्यूमे या प्रोजेक्ट्स पर सीधे फीडबैक ले सकते हैं।`;
    } else if (q.includes("व्हॉट-इफ") || q.includes("सिम्युलेटर") || q.includes("what-if")) {
      reply = `नमस्ते ${name}! What-If Simulator आपको यह देखने की सुविधा देता है कि नई स्किल्स (जैसे Docker, GraphQL या Next.js) सीखने से आपकी करियर तत्परता और इंटर्नशिप मैच स्कोर पर क्या सकारात्मक प्रभाव पड़ेगा। इसे आज़माकर आप अपना व्यक्तिगत लर्निंग रोडमैप तैयार कर सकते हैं।`;
    } else {
      reply = `नमस्ते ${name}! NexSkill AI आपके करियर लक्ष्यों (${targetRole}) को हासिल करने में आपकी पूरी मदद करेगा।
आप नीचे दिए गए विकल्पों में से किसी एक को चुनकर शुरुआत कर सकते हैं: अपनी प्रोफाइल अपडेट करें, AI Resume Analyzer का उपयोग करें, या What-If Simulator के माध्यम से अपनी प्रगति की योजना बनाएं।`;
    }

    return {
      reply,
      language: "hi",
      suggestedQuestions: SUGGESTED_QUESTIONS_HI.slice(0, 3),
      deepLinks,
      isAiGenerated: false,
    };
  }

  // English fallback
  if (q.includes("resume") || q.includes("cv")) {
    reply = `Hello ${name}! To make your resume stand out for competitive tech roles:
1. **Highlight Quantifiable Impact**: Rather than listing passive duties, describe tangible outcomes (e.g., "Architected a full-stack platform supporting 500+ active users with sub-second response times").
2. **Verify Demonstrated Skills**: Run your resume through our **AI Resume Analyzer** to check ATS keyword alignment, format compliance, and role suitability.
3. **Include Active Project Evidence**: Add links to your GitHub repositories, deployed web applications, and verified assessment badges from NexSkill AI.`;
  } else if (q.includes("skill") || q.includes("learn") || q.includes("tech")) {
    reply = `Hello ${name}! For a ${targetRole} pathway, high-priority skills employers look for include:
1. **Modern Frontend & Backend**: TypeScript, React/Next.js, Node.js, and API design principles.
2. **Data & Storage**: Relational (PostgreSQL/SQL) and Document (MongoDB) database modeling.
3. **Verification**: Complete our practical **Skill Assessments** (JavaScript, React, Node.js) to earn verified credentials displayed directly on your Digital Skills Passport.`;
  } else if (q.includes("mentor") || q.includes("guidance") || q.includes("counsel")) {
    reply = `Hello ${name}! Connecting with an experienced professional is one of the fastest ways to accelerate your growth.
In our **Mentorship Network**, you can explore verified alumni and senior industry mentors, send targeted guidance requests, schedule 1-on-1 virtual sessions, and request in-depth code or resume critiques.`;
  } else if (q.includes("what-if") || q.includes("simulator") || q.includes("simulate")) {
    reply = `Hello ${name}! The **What-If Simulator** enables you to model prospective skill acquisitions (like TypeScript, AWS, or GraphQL) before investing study time. It dynamically calculates how learning these skills will boost your match percentage across current live opportunities.`;
  } else {
    reply = `Hello ${name}! Welcome to your NexSkill AI Career Companion (From Skill to Opportunity). I am here to help you navigate your journey toward becoming a successful ${targetRole}.
You can ask me about resume strategies, industry-demanded skill stacks, interview preparation, finding an alumni mentor, or exploring local internships.`;
  }

  return {
    reply,
    language: "en",
    suggestedQuestions: SUGGESTED_QUESTIONS_EN.slice(0, 3),
    deepLinks,
    isAiGenerated: false,
  };
}

