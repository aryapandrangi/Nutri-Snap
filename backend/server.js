import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const app = express();
const port = 8000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://nutri-snap-seven.vercel.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const systemPrompt = `
You are an expert AI nutritionist. Your task is to analyze the image of the meal provided by the user.

1.  Identify every food item in the image.
2.  For each item, estimate the portion size in grams and the total calories.
3.  Calculate the total calories for the entire meal.
4.  Provide a brief "Health Analysis" (1-2 sentences) of the meal.
5.  For any unhealthy items, suggest a "Healthier Alternative".
6.  **Crucially, you MUST provide a "health_score".** This is a single integer from 1 (very unhealthy) to 10 (perfectly healthy and balanced). This is the most important field.
`;

const jsonSchema = {
  type: "OBJECT",
  properties: {
    "food_items": {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          "item_name": { type: "STRING" },
          "estimated_grams": { type: "NUMBER" },
          "estimated_calories": { type: "NUMBER" },
        },
        required: ["item_name", "estimated_grams", "estimated_calories"]
      }
    },
    "total_calories": { type: "NUMBER" },
    "health_analysis": { type: "STRING" },
    "health_score": { type: "NUMBER" },
    "healthy_alternatives": {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          "original_item": { type: "STRING" },
          "suggestion": { type: "STRING" },
        },
        required: ["original_item", "suggestion"]
      }
    }
  },
  required: ["food_items", "total_calories", "health_analysis", "health_score", "healthy_alternatives"]
};

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: jsonSchema,
  },
});

function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

app.post('/analyze_meal', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const imagePart = fileToGenerativePart(req.file.buffer, req.file.mimetype);
    
    const result = await model.generateContent([systemPrompt, imagePart]);
    const response = result.response;
    
    const jsonResponse = JSON.parse(response.text());
    
    res.json(jsonResponse);

  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).send('Error analyzing image. See console for details.');
  }
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});