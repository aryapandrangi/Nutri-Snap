# Nutri-Snap: An AI-Powered Nutrition Analyst

Nutri-Snap is a full-stack, intelligent web application designed to bridge the gap between food choices and health awareness. In a world of complex nutritional information, this app provides users with an instant, easy-to-understand analysis of any meal from a simple photograph.

This project demonstrates the integration of a modern frontend (React), a robust backend (Node.js/Express), and a powerful multimodal AI (Google Gemini) to solve a complex, real-world problem.

[**Click Here for a Live Demo!**](https://nutri-snap-seven.vercel.app)

## What It Does (Key Features)

* **🤖 AI-Powered Meal Analysis:** Utilizes Google's Gemini AI (`gemini-2.5-flash`) to perform multimodal image analysis. It identifies food items, estimates portion sizes, and calculates calories.

* **🔟 Instant Health Score:** The AI doesn't just list data; it *analyzes* the meal's balance and provides a simple, motivating "Health Score" from 1 (Unhealthy) to 10 (Perfectly Balanced).

* **💡 Smarter Alternatives:** Provides actionable advice by suggesting healthier food swaps for any unhealthy items identified in the meal.

* **📈 Personal Health Dashboard:** Users can save their analyzed meals to a personal log. The dashboard features a 7-day line graph to visualize their "Health Score" progress over time, fulfilling the user's need to "see their weekly increase in health."

* **🔑 No Sign-Up Required:** Implements a "password-free" experience using the browser's `localStorage` to create a persistent "Magic Key" (UUID) for each user. This respects user privacy and removes the barrier of a sign-up form.

* **🎨 Responsive, Multi-Page Design:** Features a beautiful, professional landing page and a seamless multi-page app experience, all built with a "shadcn/ui" inspired design system.

## How To Use The App

1. **Visit the Landing Page:** The user is greeted with a full-width, responsive landing page explaining the app's value.

2. **Analyze a Meal:** Click "Analyze Your First Meal."

3. **Upload:** On the "Upload" page, drag-and-drop or browse for a photo of a meal.

4. **Wait for AI:** A loading bar appears while the AI analyzes the meal (this can take 5-10 seconds).

5. **Review Results:** The app displays the full analysis, including the Health Score, calorie count, and food items.

6. **Save Your Meal:** Click "Save to My Log" to save the result.

7. **Track Your Progress:** Click the "My Log" tab to view your full meal history and see your 7-day progress on the line chart.

## Technology Stack & Architecture

This project is a full-stack application with a clear separation of concerns.

### Frontend (Built with React)

* **Framework:** React (using functional components and hooks like `useState` & `useEffect`).

* **Data Visualization:** `recharts` - A professional library used to build the 7-day health dashboard.

* **Styling:** Custom CSS modules inspired by the "shadcn/ui" component library for a modern, clean aesthetic.

* **Icons:** `lucide-react` for lightweight, clean icons.

* **HTTP Client:** `axios` to handle all API requests to the backend.

* **Client-Side Storage:** `localStorage` to store the user's "Magic Key" and their meal log.

### Backend (Built with Node.js)

* **Framework:** Node.js & Express.js - Used to create a robust, scalable REST API.

* **AI API:** `@google/generative-ai` - The official Google SDK to communicate with the Gemini AI.

* **Forced JSON:** Implements Google's `responseSchema` feature to *force* the AI to return a clean, predictable JSON object every time.

* **File Handling:** `multer` - A middleware used to handle the `multipart/form-data` image uploads.

* **Security:** `cors` - Configured to only allow requests from the deployed frontend app (on Vercel) and the local development server.

### Technical Data Flow (Architecture)

1. A user on the **React Frontend** (on Vercel) uploads an image.

2. An `axios` POST request is sent to the **Node.js Backend** (on Render).

3. The `multer` middleware on the backend receives the image.

4. The backend sends the image and a JSON schema prompt to the **Google Gemini AI**.

5. The AI analyzes the image and returns a guaranteed-valid JSON object.

6. The Node.js backend sends this JSON response back to the React frontend.

7. The frontend displays the data on the "Results" page.

## Future Improvements (For an MS Application)

This project, while fully functional, is a perfect foundation for future development. My next steps would be:

1. **Migrate to PostgreSQL:** This is the most critical upgrade. I would replace the `localStorage` system with a full PostgreSQL database (a skill from my resume). This would allow users to access their log from *any* device or browser, making it a true, persistent web service.

2. **Full User Authentication:** To support the database, I would implement a secure JWT (JSON Web Token) authentication system.

3. **Deeper Nutritional Tracking:** I would expand the AI prompt to also return macronutrients (Protein, Fat, Carbs) and allow users to track these macros on their dashboard.

*Built by Sri Venkata Arya Pandrangi.*