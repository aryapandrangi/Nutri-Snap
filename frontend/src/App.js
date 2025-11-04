import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import {
  Upload, BarChart2, Zap, Target, BookOpen, Trash2,
  Camera, Sparkles, Gauge, ArrowRight
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

(function checkUserMagicKey() {
  const key = localStorage.getItem('userMagicKey');
  if (!key) {
    localStorage.setItem('userMagicKey', uuidv4());
  }
})();
const saveMealToLog = (mealData) => {
  const log = JSON.parse(localStorage.getItem('mealLog') || '[]');
  const newMeal = { id: uuidv4(), date: new Date().toISOString(), ...mealData };
  log.push(newMeal);
  localStorage.setItem('mealLog', JSON.stringify(log));
};
const loadMealLog = () => {
  const log = JSON.parse(localStorage.getItem('mealLog') || '[]');
  return log.sort((a, b) => new Date(b.date) - new Date(a.date));
};
const deleteMealFromLog = (mealId) => {
  let log = loadMealLog();
  log = log.filter((meal) => meal.id !== mealId);
  localStorage.setItem('mealLog', JSON.stringify(log));
  return log;
};
const hasSavedMeals = () => {
  const log = localStorage.getItem('mealLog');
  return log && JSON.parse(log).length > 0;
};

function LandingPage({ onStartApp, onGoToLog, onGoToUpload }) {
  const userHasLog = hasSavedMeals();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="container">
          <div className="nav-logo">Nutri-Snap 🥗</div>
          {userHasLog ? (
            <div className="nav-links landing-nav-links">
              <a href="#upload" onClick={onGoToUpload}>
                <Upload size={18} /> Upload
              </a>
              <a href="#dashboard" onClick={onGoToLog}>
                <BookOpen size={18} /> My Log
              </a>
            </div>
          ) : (
            <button className="ShadButton primary" onClick={onStartApp}>
              Analyze Your First Meal
            </button>
          )}
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="container">
            <div className="hero-text">
              <h1>Stop Guessing. <br/><span className="text-green">Start Knowing.</span></h1>
              <p>
                Snap a photo of your meal. Our AI gives you an instant health
                score, calorie count, and AI-powered alternatives. No sign-up
                required.
              </p>
              <button className="ShadButton primary large" onClick={onStartApp}>
                Analyze Your First Meal <ArrowRight size={20} />
              </button>
            </div>
            <div className="hero-image">
              <img
                src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                alt="Healthy salad bowl"
                onError={(e) => e.target.src = 'https://placehold.co/600x600/e2f5e9/333?text=Healthy+Meal'}
              />
            </div>
          </div>
        </section>

        <section className="how-it-works-section">
          <div className="container">
            <h2>Get Your Health Score in <span className="text-peach">3 Seconds</span></h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-icon green">
                  <Camera size={32} />
                </div>
                <h3>1. Upload Your Meal</h3>
                <p>Take a quick photo of your plate</p>
              </div>
              <div className="step-card">
                <div className="step-icon peach">
                  <Sparkles size={32} />
                </div>
                <h3>2. Get AI Analysis</h3>
                <p>Instant nutritional breakdown powered by AI</p>
              </div>
              <div className="step-card">
                <div className="step-icon green">
                  <BarChart2 size={32} />
                </div>
                <h3>3. Track Your Progress</h3>
                <p>Watch your health improve over time</p>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <h2>Your Personal <span className="text-green">AI Nutritionist</span></h2>
            <div className="features-grid">
              <div className="ShadCard">
                <Gauge size={24} className="text-green" />
                <h3>Instant Health Score</h3>
                <p>Our AI grades every meal from 1 to 10, so you can see your health at a glance.</p>
              </div>
              <div className="ShadCard">
                <Zap size={24} className="text-peach" />
                <h3>Smarter Swaps</h3>
                <p>Find healthier alternatives for your favorite foods, powered by AI.</p>
              </div>
              <div className="ShadCard">
                <BookOpen size={24} className="text-green" />
                <h3>Track Your Journey</h3>
                <p>Save meals to your password-free log and watch your 7-day health score improve.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="final-cta-section">
          <div className="container">
            <h2>Ready to understand your food?</h2>
            <button className="ShadButton primary large" onClick={onStartApp}>
              Get Started for Free
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <p>© 2025 Nutri-Snap. Built by Sri Venkata Arya Pandrangi.</p>
        </div>
      </footer>
    </div>
  );
}

function UploadPage({ onMealAnalyzed }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (file) => {
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${backendUrl}/analyze_meal`, formData);
      onMealAnalyzed({
        ...response.data,
        imageUrl: preview,
      });
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page-container">
      <div className="container">
        <form
          onSubmit={handleSubmit}
          className={`uploader-box ${isDragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragOver(false)}
        >
          <Upload className="upload-icon" size={48} />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files[0])}
            id="file-upload"
            hidden
          />
          {preview ? (
            <img src={preview} alt="Meal preview" className="preview-image" />
          ) : (
            <p>Drag & drop your meal photo, or <label htmlFor="file-upload" className="browse-label">browse</label></p>
          )}

          {loading && (
            <div className="loading-container">
              <p>Analyzing... this can take a few seconds.</p>
              <div className="progress-bar">
                <div className="progress-indicator"></div>
              </div>
            </div>
          )}

          <button type="submit" className="ShadButton primary" disabled={!selectedFile || loading}>
            {loading ? 'Please Wait...' : <><Zap size={18} /> Analyze Meal</>}
          </button>
          
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}

function ResultsPage({ analysisData, onSave, onAnalyzeAnother }) {

  const scoreAngle = (analysisData.health_score / 10) * 360;

  return (
    <div className="app-page-container">
      <div className="container">
        <div className="ShadCard results-header">
          <img src={analysisData.imageUrl} alt="Analyzed meal" className="results-image" />
          <div className="results-main-score">
            <div
              className="health-score-circle"
              style={{ background: `conic-gradient(var(--main-green) ${scoreAngle}deg, var(--border-light) 0deg)` }}
            >
              <span className="score-number">{analysisData.health_score}</span>
              <span className="score-label">/ 10</span>
            </div>
            <p>Your Meal's Health Score</p>
          </div>
        </div>

        <div className="results-grid">
          <div className="ShadCard">
            <h3><Target size={20} /> Total Calories</h3>
            <p className="calories-text">{analysisData.total_calories} kcal</p>
          </div>

          <div className="ShadCard">
            <h3>Health Analysis</h3>
            <p>{analysisData.health_analysis}</p>
          </div>

          <div className="ShadCard wide">
            <h3>Identified Items</h3>
            <ul>
              {analysisData.food_items.map((item, index) => (
                <li key={index}>
                  <strong>{item.item_name}</strong>: {item.estimated_calories} kcal ({item.estimated_grams}g)
                </li>
              ))}
            </ul>
          </div>

          <div className="ShadCard wide">
            <h3>Healthier Alternatives</h3>
            <ul>
              {analysisData.healthy_alternatives.map((alt, index) => (
                <li key={index}>
                  <strong>Replace "{alt.original_item}" with:</strong> {alt.suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="results-actions">
          <button className="ShadButton secondary" onClick={onAnalyzeAnother}>Analyze Another</button>
          <button className="ShadButton primary" onClick={onSave}>Save to My Log</button>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ mealLog, onMealDelete }) {

  const chartData = Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().split('T')[0];
      const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });

      const mealsForDay = mealLog.filter(m => m.date.startsWith(dayKey));
      let avgScore = null;
      if (mealsForDay.length > 0) {
          avgScore = mealsForDay.reduce((sum, m) => sum + m.health_score, 0) / mealsForDay.length;
      }
      return { day: dayShort, score: avgScore };
  }).reverse();

  return (
    <div className="app-page-container">
      <div className="container">
        <h2>Your 7-Day Progress</h2>

        {mealLog.length === 0 ? (
          <p>Your log is empty. Analyze a meal to see your progress!</p>
        ) : (
          <>
            <div className="ShadCard chart-card">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="day" stroke="var(--main-light)" />
                  <YAxis domain={[0, 10]} stroke="var(--main-light)" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 'var(--radius)',
                      borderColor: 'var(--border-light)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    }}
                    labelStyle={{ color: 'var(--main-dark)', fontWeight: '600' }}
                    itemStyle={{ color: 'var(--main-green)', fontWeight: '600' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--main-green)"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="meal-log-list">
              <h3>Full Meal Log</h3>
              {mealLog.map(meal => (
                <div className="ShadCard log-item" key={meal.id}>
                  <img src={meal.imageUrl} alt="Logged meal" className="log-item-image" />
                  <div className="log-item-details">
                    <strong>{new Date(meal.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</strong>
                    <p>{meal.food_items.map(f => f.item_name).join(', ')}</p>
                    <span className="log-item-score">{meal.health_score}/10 Score</span>
                    <span className="log-item-cals">{meal.total_calories} kcal</span>
                  </div>
                  <button className="ShadButton danger-ghost" onClick={() => onMealDelete(meal.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('landing');
  const [analysisData, setAnalysisData] = useState(null);
  const [mealLog, setMealLog] = useState(loadMealLog());

  const handleMealAnalyzed = (data) => {
    setAnalysisData(data);
    setPage('results');
  };

  const handleSaveToLog = () => {
    saveMealToLog(analysisData);
    setMealLog(loadMealLog());
    setPage('dashboard');
  };

  const handleMealDelete = (mealId) => {
    const newLog = deleteMealFromLog(mealId);
    setMealLog(newLog);
  };

  const handleStartApp = () => {
    setPage('upload');
  };

  const handleGoToLog = () => {
    setPage('dashboard');
  };

  const handleGoToUpload = () => {
    setPage('upload');
  };

  const handleGoToLanding = () => {
    setPage('landing');
  };

  if (page === 'landing') {
    return <LandingPage onStartApp={handleStartApp} onGoToLog={handleGoToLog} onGoToUpload={handleGoToUpload}/>;
  }

  return (
    <div className="App">
      <nav className="navbar">
        <div className="container">
          <div className="nav-logo" onClick={handleGoToLanding} style={{cursor: 'pointer'}}>
            Nutri-Snap 🥗
          </div>
          <div className="nav-links">
            <a
              href="#upload"
              className={page === 'upload' || page === 'results' ? 'active' : ''}
              onClick={handleGoToUpload}
            >
              <Upload size={18} /> Upload
            </a>
            <a
              href="#dashboard"
              className={page === 'dashboard' ? 'active' : ''}
              onClick={handleGoToLog}
            >
              <BookOpen size={18} /> My Log
            </a>
          </div>
        </div>
      </nav>

      <main>
        {page === 'upload' && <UploadPage onMealAnalyzed={handleMealAnalyzed} />}

        {page === 'results' && (
          <ResultsPage
            analysisData={analysisData}
            onSave={handleSaveToLog}
            onAnalyzeAnother={handleGoToUpload}
          />
        )}

        {page === 'dashboard' && <DashboardPage mealLog={mealLog} onMealDelete={handleMealDelete} />}
      </main>
    </div>
  );
}

export default App;