import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, User, MessageSquare, Mic, Download, Copy, Check, FileText, Award, Target, Brain, Users, Calendar, BarChart3, Clock } from 'lucide-react';

const PharmBoosterApp = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [userName, setUserName] = useState('');
  const [userPosition, setUserPosition] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [currentMarathon, setCurrentMarathon] = useState(0);
  const [currentStep, setCurrentStep] = useState('intro');
  const [userAnswer, setUserAnswer] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scores, setScores] = useState({});
  const [audioFile, setAudioFile] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [doctorMood, setDoctorMood] = useState('neutral');
  const [initialAnalysis, setInitialAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  // Добавляем стили для анимации
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse-delay {
        0%, 80%, 100% { opacity: 0.4; }
        40% { opacity: 1; }
      }
      .animation-delay-200 { animation-delay: 200ms; }
      .animation-delay-400 { animation-delay: 400ms; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const marathons = [
    {
      id: 1,
      title: "Планирование визитов",
      icon: <Calendar className="w-6 h-6" />,
      intro: "Научитесь эффективно планировать встречи с врачами, учитывая их график, специализацию и потребности.",
      task: "Опишите, как бы вы спланировали визит к кардиологу в крупную городскую клинику. Учтите время визита, подготовку материалов и цели встречи.",
      doctorRole: "строгий главврач кардиологического отделения",
      scenario: "планирование визита"
    },
    {
      id: 2,
      title: "Презентация препарата",
      icon: <FileText className="w-6 h-6" />,
      intro: "Овладейте искусством презентации медицинских препаратов, делая акцент на преимуществах и клинической эффективности.",
      task: "Подготовьте краткую презентацию нового антигипертензивного препарата. Выделите ключевые преимущества и клинические данные.",
      doctorRole: "опытный терапевт с 20-летним стажем",
      scenario: "презентация препарата"
    },
    {
      id: 3,
      title: "Выявление потребностей",
      icon: <Target className="w-6 h-6" />,
      intro: "Научитесь задавать правильные вопросы для выявления реальных потребностей врача и его пациентов.",
      task: "Какие вопросы вы зададите эндокринологу, чтобы понять его потребности в препаратах для лечения диабета?",
      doctorRole: "эндокринолог районной поликлиники",
      scenario: "выявление потребностей"
    },
    {
      id: 4,
      title: "Работа с возражениями",
      icon: <MessageSquare className="w-6 h-6" />,
      intro: "Освойте техники работы с возражениями врачей, превращая сомнения в возможности.",
      task: "Как вы ответите на возражение: 'Ваш препарат слишком дорогой, есть более дешевые аналоги'?",
      doctorRole: "скептически настроенный заведующий отделением",
      scenario: "работа с возражениями"
    },
    {
      id: 5,
      title: "Завершение визита",
      icon: <Check className="w-6 h-6" />,
      intro: "Научитесь правильно завершать встречу, оставляя положительное впечатление и договариваясь о следующих шагах.",
      task: "Опишите, как вы завершите успешную встречу с врачом. Какие договоренности зафиксируете?",
      doctorRole: "дружелюбный семейный врач",
      scenario: "завершение визита"
    },
    {
      id: 6,
      title: "Пост-рефлексия и самооценка",
      icon: <Brain className="w-6 h-6" />,
      intro: "Развивайте навык анализа проведенных встреч для постоянного улучшения результатов.",
      task: "Проанализируйте свой последний визит. Что прошло хорошо? Что можно улучшить?",
      doctorRole: "наставник-коуч по медицинским продажам",
      scenario: "анализ и рефлексия"
    }
  ];

  const analyzeInitialAnswer = async (answer, marathonTitle) => {
    try {
      const prompt = `Проанализируй ответ медпредставителя на задание "${marathonTitle}":
"${answer}"

Оцени качество подготовки и дай рекомендации для успешного диалога с врачом.

Ответь СТРОГО в формате JSON без markdown блоков:
{
  "strengths": ["2-3 сильные стороны ответа"],
  "improvements": ["2-3 области для улучшения"],
  "tips": ["2-3 конкретных совета для диалога с врачом"],
  "readinessScore": число от 1 до 5,
  "predictedChallenges": ["возможные сложности в диалоге"]
}`;

      const response = await callOpenAI(prompt);
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error analyzing answer:', error);
      return null;
    }
  };

  const callOpenAI = async (prompt) => {
    if (!apiKey) {
      throw new Error('API ключ не установлен');
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const simulateGPTChat = async (userMessage, role, scenario) => {
    try {
      // Определяем контекст диалога на основе истории
      const dialogueContext = chatMessages.length === 0 ? 'начало разговора' : 
        chatMessages.length < 3 ? 'знакомство и установление контакта' :
        chatMessages.length < 5 ? 'основная часть презентации' :
        'завершение диалога';

      const prompt = `Ты играешь роль ${role}. Контекст: ${scenario}, стадия диалога: ${dialogueContext}.
Медпредставитель говорит: "${userMessage}"

ВАЖНЫЕ ИНСТРУКЦИИ:
1. Веди себя как настоящий врач с многолетним опытом
2. Задавай конкретные профессиональные вопросы (дозировка, противопоказания, лекарственные взаимодействия)
3. Упоминай свой опыт и случаи из практики
4. Выражай реалистичные сомнения или интерес
5. Реагируй на качество аргументации медпредставителя

История диалога: ${chatMessages.length} сообщений

Ответь СТРОГО в формате JSON без markdown блоков:
{
  "response": "твой ответ как врача (2-3 предложения, профессионально и по существу)",
  "evaluation": {
    "structure": число от 1 до 5,
    "argumentation": число от 1 до 5,
    "objectionHandling": число от 1 до 5
  },
  "feedback": "конструктивная обратная связь для улучшения навыков",
  "doctorMood": "neutral/interested/skeptical/positive",
  "nextTopic": "что врач хотел бы обсудить дальше"
}`;

      const response = await callOpenAI(prompt);
      // Убираем markdown блоки если они есть
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const parsed = JSON.parse(cleanResponse);
      
      return {
        response: parsed.response,
        evaluation: parsed.evaluation,
        feedback: parsed.feedback,
        doctorMood: parsed.doctorMood,
        nextTopic: parsed.nextTopic
      };
    } catch (error) {
      console.error('Error in GPT simulation:', error);
      return {
        response: "Интересно, расскажите подробнее. Какие клинические исследования подтверждают эффективность?",
        evaluation: { structure: 3, argumentation: 3, objectionHandling: 3 },
        feedback: "Продолжайте развивать вашу аргументацию с использованием конкретных данных.",
        doctorMood: "neutral",
        nextTopic: "клинические исследования"
      };
    }
  };

  const handleStartChat = async () => {
    setIsProcessing(true);
    
    // Анализируем первоначальный ответ
    const analysis = await analyzeInitialAnswer(userAnswer, marathons[currentMarathon].title);
    setInitialAnalysis(analysis);
    
    setCurrentStep('chat');
    setChatMessages([
      { 
        role: 'system',
        content: `💡 Анализ вашей подготовки: Готовность - ${analysis?.readinessScore || 3}/5. ${analysis?.tips?.[0] || 'Будьте внимательны к реакции врача.'}`
      },
      { 
        role: 'doctor', 
        content: `Добрый день! Я ${marathons[currentMarathon].doctorRole}. Чем могу быть полезен?` 
      }
    ]);
    setDoctorMood('neutral');
    setIsProcessing(false);
  };

  const handleSendMessage = async () => {
    if (!userAnswer.trim() || isProcessing) return;

    const newMessage = { role: 'user', content: userAnswer };
    setChatMessages(prev => [...prev, newMessage]);
    setUserAnswer('');
    setIsProcessing(true);

    try {
      const result = await simulateGPTChat(
        userAnswer,
        marathons[currentMarathon].doctorRole,
        marathons[currentMarathon].scenario
      );

      setChatMessages(prev => [...prev, { role: 'doctor', content: result.response }]);
      setDoctorMood(result.doctorMood || 'neutral');
      
      // Показываем подсказку о следующей теме
      if (result.nextTopic && chatMessages.length < 5) {
        setTimeout(() => {
          setChatMessages(prev => [...prev, { 
            role: 'system', 
            content: `💭 Врач заинтересован в теме: ${result.nextTopic}` 
          }]);
        }, 1000);
      }
      
      if (chatMessages.filter(m => m.role === 'user').length >= 3) {
        setTimeout(() => finishChat(result), 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      setChatMessages(prev => [...prev, { 
        role: 'doctor', 
        content: 'Извините, возникла техническая проблема. Попробуйте еще раз.' 
      }]);
    }

    setIsProcessing(false);
  };

  const finishChat = (lastResult) => {
    const overallScore = {
      structure: Math.round(chatMessages.reduce((acc, msg, idx) => {
        if (msg.evaluation?.structure) acc += msg.evaluation.structure;
        return acc;
      }, 0) / chatMessages.filter(m => m.evaluation).length || lastResult.evaluation.structure),
      argumentation: Math.round(chatMessages.reduce((acc, msg) => {
        if (msg.evaluation?.argumentation) acc += msg.evaluation.argumentation;
        return acc;
      }, 0) / chatMessages.filter(m => m.evaluation).length || lastResult.evaluation.argumentation),
      objectionHandling: Math.round(chatMessages.reduce((acc, msg) => {
        if (msg.evaluation?.objectionHandling) acc += msg.evaluation.objectionHandling;
        return acc;
      }, 0) / chatMessages.filter(m => m.evaluation).length || lastResult.evaluation.objectionHandling)
    };
    
    const marathonResult = {
      marathonId: currentMarathon + 1,
      marathonTitle: marathons[currentMarathon].title,
      date: new Date().toLocaleString('ru-RU'),
      scores: overallScore,
      feedback: lastResult.feedback,
      messages: chatMessages.filter(m => m.role !== 'system'),
      doctorFinalMood: doctorMood,
      initialPreparation: initialAnalysis
    };
    
    setAllResults(prev => [...prev, marathonResult]);
    setScores(overallScore);
    setCurrentStep('results');
  };

  const handleAudioUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 20 * 1024 * 1024) {
      setAudioFile(file);
      setIsProcessing(true);
      
      // Симуляция транскрипции и анализа аудио
      setTimeout(async () => {
        try {
          const prompt = `Проанализируй транскрипцию голосового визита медпредставителя для марафона "${marathons[currentMarathon].title}".
          
Представь, что в аудио были следующие ключевые моменты:
- Приветствие и представление
- Презентация препарата с упоминанием клинических данных
- Ответы на 2-3 вопроса врача
- Работа с одним возражением
- Договоренность о следующей встрече

Дай детальную оценку качества визита.

Ответь СТРОГО в формате JSON без markdown блоков:
{
  "transcriptionSummary": "краткое содержание диалога (2-3 предложения)",
  "scores": {
    "structure": число от 1 до 5,
    "argumentation": число от 1 до 5,
    "objectionHandling": число от 1 до 5,
    "voiceConfidence": число от 1 до 5,
    "professionalTone": число от 1 до 5
  },
  "highlights": ["3 лучших момента визита"],
  "improvements": ["3 области для улучшения"],
  "detailedFeedback": "развернутый анализ визита с конкретными рекомендациями"
}`;

          const response = await callOpenAI(prompt);
          const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          const analysis = JSON.parse(cleanResponse);
          
          setScores(analysis.scores);
          setCurrentStep('audioResults');
          
          const audioResult = {
            marathonId: currentMarathon + 1,
            marathonTitle: marathons[currentMarathon].title,
            date: new Date().toLocaleString('ru-RU'),
            scores: analysis.scores,
            feedback: analysis.detailedFeedback,
            audioFile: file.name,
            audioAnalysis: analysis
          };
          setAllResults(prev => [...prev, audioResult]);
        } catch (error) {
          console.error('Error analyzing audio:', error);
          alert('Ошибка при анализе аудио. Попробуйте еще раз.');
        }
        
        setIsProcessing(false);
      }, 4000);
    } else {
      alert('Файл слишком большой. Максимальный размер: 20 МБ');
    }
  };

  const copyToClipboard = () => {
    const resultsText = allResults.map(result => {
      let text = `Марафон: ${result.marathonTitle}
Дата: ${result.date}
Оценки:
- Структура: ${result.scores.structure}/5
- Аргументация: ${result.scores.argumentation}/5
- Работа с возражениями: ${result.scores.objectionHandling}/5`;

      if (result.scores.voiceConfidence) {
        text += `
- Уверенность голоса: ${result.scores.voiceConfidence}/5
- Профессиональный тон: ${result.scores.professionalTone}/5`;
      }

      text += `
Обратная связь: ${result.feedback}`;

      if (result.audioFile) {
        text += `
Аудиофайл: ${result.audioFile}`;
      }

      if (result.audioAnalysis) {
        text += `

Лучшие моменты:
${result.audioAnalysis.highlights.map(h => `- ${h}`).join('\n')}

Рекомендации:
${result.audioAnalysis.improvements.map(i => `- ${i}`).join('\n')}`;
      }

      return text + '\n---';
    }).join('\n\n');

    const fullText = `ФАРМ БУСТЕР - Результаты обучения
Участник: ${userName}
Должность: ${userPosition}
Дата завершения: ${new Date().toLocaleString('ru-RU')}

${resultsText}`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const exportToExcel = () => {
    const headers = `Марафон,Дата,Структура,Аргументация,Работа с возражениями,Уверенность голоса,Профессиональный тон,Средний балл,Тип визита,Обратная связь`;
    
    const rows = allResults.map(r => {
      const avgScore = Math.round((r.scores.structure + r.scores.argumentation + r.scores.objectionHandling) / 3 * 10) / 10;
      const visitType = r.audioFile ? 'Голосовой' : 'Текстовый';
      
      return `"${r.marathonTitle}","${r.date}",${r.scores.structure},${r.scores.argumentation},${r.scores.objectionHandling},${r.scores.voiceConfidence || 'N/A'},${r.scores.professionalTone || 'N/A'},${avgScore},"${visitType}","${r.feedback.replace(/"/g, '""')}"`;
    });

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows.join('\n')}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pharm_booster_results_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nextMarathon = () => {
    if (currentMarathon < marathons.length - 1) {
      setCurrentMarathon(currentMarathon + 1);
      setCurrentStep('intro');
      setChatMessages([]);
      setUserAnswer('');
      setScores({});
      setAudioFile(null);
      setDoctorMood('neutral');
      setInitialAnalysis(null);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    const totalScores = allResults.reduce((acc, result) => {
      acc.structure += result.scores.structure || 0;
      acc.argumentation += result.scores.argumentation || 0;
      acc.objectionHandling += result.scores.objectionHandling || 0;
      acc.count += 1;
      return acc;
    }, { structure: 0, argumentation: 0, objectionHandling: 0, count: 0 });

    const avgScores = {
      structure: totalScores.count > 0 ? (totalScores.structure / totalScores.count).toFixed(1) : 0,
      argumentation: totalScores.count > 0 ? (totalScores.argumentation / totalScores.count).toFixed(1) : 0,
      objectionHandling: totalScores.count > 0 ? (totalScores.objectionHandling / totalScores.count).toFixed(1) : 0
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🎉 Поздравляем, {userName}!</h1>
              <p className="text-gray-600">Вы успешно завершили программу ФАРМ БУСТЕР</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-center">📊 Ваша общая статистика</h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{avgScores.structure}</div>
                  <div className="text-sm text-gray-600 mt-1">Структура диалога</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{avgScores.argumentation}</div>
                  <div className="text-sm text-gray-600 mt-1">Аргументация</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{avgScores.objectionHandling}</div>
                  <div className="text-sm text-gray-600 mt-1">Работа с возражениями</div>
                </div>
                
                {isProcessing && audioFile && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <div>
                        <p className="font-medium text-blue-800">Анализируем ваш голосовой визит...</p>
                        <p className="text-sm text-blue-600">Транскрибируем и оцениваем качество диалога</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {marathons.map((marathon, idx) => {
                const result = allResults.find(r => r.marathonId === idx + 1);
                const avgScore = result ? 
                  Math.round((result.scores.structure + result.scores.argumentation + result.scores.objectionHandling) / 3 * 10) / 10 : 0;
                
                return (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {marathon.icon}
                        <h3 className="font-semibold">{marathon.title}</h3>
                      </div>
                      {result && (
                        <div className="flex items-center gap-1">
                          <Award className="w-5 h-5 text-yellow-500" />
                          <span className="font-bold">{avgScore}</span>
                        </div>
                      )}
                    </div>
                    {result ? (
                      <>
                        <p className="text-sm text-gray-600 mb-2">{result.date}</p>
                        {result.audioFile && (
                          <p className="text-xs text-blue-600 flex items-center gap-1">
                            <Mic className="w-3 h-3" />
                            Голосовой визит
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">Не пройдено</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">💼 Рекомендации для дальнейшего развития:</h3>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Практикуйтесь в реальных визитах, применяя полученные навыки</li>
                  <li>• Ведите дневник визитов для анализа прогресса</li>
                  <li>• Регулярно обновляйте знания о продуктах и конкурентах</li>
                  <li>• Работайте над областями с наименьшими оценками</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {copySuccess ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copySuccess ? 'Скопировано!' : 'Копировать результаты'}
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-5 h-5" />
                Экспорт в Excel
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('dashboard');
                  setShowResults(false);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Users className="w-5 h-5" />
                К марафонам
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <Award className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ФАРМ БУСТЕР</h1>
            <p className="text-gray-600">Обучающая программа для медпредставителей</p>
          </div>
          
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Что вас ждет:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 6 практических марафонов по ключевым навыкам</li>
              <li>• Реалистичные симуляции визитов с AI-врачом</li>
              <li>• Анализ голосовых визитов</li>
              <li>• Персонализированная обратная связь</li>
              <li>• Детальная оценка прогресса</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Ваше имя"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Ваша должность"
              value={userPosition}
              onChange={(e) => setUserPosition(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="OpenAI API ключ"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-xs text-gray-500 -mt-2">
              Ваш API ключ используется только для работы с OpenAI и не сохраняется
            </div>
            <button
              onClick={() => userName && userPosition && apiKey && setCurrentScreen('dashboard')}
              disabled={!userName || !userPosition || !apiKey}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              Начать обучение
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Добро пожаловать, {userName}!</h1>
                <p className="text-gray-600">{userPosition}</p>
              </div>
              <button
                onClick={() => setShowResults(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <BarChart3 className="w-5 h-5" />
                Мои результаты
              </button>
            </div>

            <h2 className="text-xl font-semibold mb-6">Выберите марафон:</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marathons.map((marathon, index) => {
                const isCompleted = allResults.some(r => r.marathonId === index + 1);
                const isLocked = index > 0 && !allResults.some(r => r.marathonId === index);
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isLocked) {
                        setCurrentMarathon(index);
                        setCurrentStep('intro');
                        setCurrentScreen('marathon');
                      }
                    }}
                    disabled={isLocked}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      isLocked 
                        ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50' 
                        : isCompleted
                        ? 'bg-green-50 border-green-300 hover:shadow-lg cursor-pointer'
                        : 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-lg cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${
                        isCompleted ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {marathon.icon}
                      </div>
                      {isCompleted && <Check className="w-5 h-5 text-green-600" />}
                    </div>
                    <h3 className="font-semibold text-left mb-1">{marathon.title}</h3>
                    <p className="text-sm text-gray-600 text-left">Марафон {index + 1} из 6</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentMarathonData = marathons[currentMarathon];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              {currentMarathonData.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{currentMarathonData.title}</h2>
              <p className="text-sm text-gray-600">Марафон {currentMarathon + 1} из 6</p>
            </div>
          </div>

          {currentStep === 'intro' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-gray-700">{currentMarathonData.intro}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">📝 Задание:</h3>
                <p className="text-gray-700 mb-6">{currentMarathonData.task}</p>
                
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Введите ваш ответ здесь..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={5}
                />
                
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={handleStartChat}
                    disabled={!userAnswer.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Начать симуляцию визита
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={isProcessing}
                  >
                    <Mic className="w-5 h-5" />
                    {isProcessing && audioFile ? 'Анализируем...' : 'Загрузить аудио'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'chat' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Симуляция визита</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span>Настроение врача:</span>
                  <span className={`px-3 py-1 rounded-full font-medium ${
                    doctorMood === 'positive' ? 'bg-green-100 text-green-700' :
                    doctorMood === 'interested' ? 'bg-blue-100 text-blue-700' :
                    doctorMood === 'skeptical' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {doctorMood === 'positive' ? '😊 Позитивный' :
                     doctorMood === 'interested' ? '🤔 Заинтересован' :
                     doctorMood === 'skeptical' ? '🤨 Скептичный' :
                     '😐 Нейтральный'}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
                {chatMessages.map((message, index) => (
                  <div key={index} className="mb-4">
                    {message.role === 'system' ? (
                      <div className="text-center">
                        <div className="inline-block p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div
                          className={`inline-block max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <p className="text-sm font-semibold mb-1">
                            {message.role === 'user' ? 'Вы' : 'Врач'}
                          </p>
                          <p>{message.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isProcessing && (
                  <div className="text-center">
                    <div className="inline-block p-3 bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animation-delay-200"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animation-delay-400"></div>
                        </div>
                        <p className="text-sm text-gray-600">Врач думает...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Введите ваше сообщение..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userAnswer.trim() || isProcessing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Отправить
                </button>
              </div>
              
              {chatMessages.filter(m => m.role === 'user').length >= 2 && (
                <div className="text-center text-sm text-gray-600">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Диалог скоро завершится...
                </div>
              )}
            </div>
          )}

          {(currentStep === 'results' || currentStep === 'audioResults') && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">🎯 Результаты оценки:</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Структура диалога:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`w-6 h-6 rounded ${
                              star <= (scores.structure || 0)
                                ? 'bg-yellow-400'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{scores.structure || 0}/5</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Аргументация:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`w-6 h-6 rounded ${
                              star <= (scores.argumentation || 0)
                                ? 'bg-yellow-400'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{scores.argumentation || 0}/5</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Работа с возражениями:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`w-6 h-6 rounded ${
                              star <= (scores.objectionHandling || 0)
                                ? 'bg-yellow-400'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{scores.objectionHandling || 0}/5</span>
                    </div>
                  </div>
                  
                  {currentStep === 'audioResults' && scores.voiceConfidence && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Уверенность голоса:</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className={`w-6 h-6 rounded ${
                                  star <= (scores.voiceConfidence || 0)
                                    ? 'bg-yellow-400'
                                    : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{scores.voiceConfidence || 0}/5</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Профессиональный тон:</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className={`w-6 h-6 rounded ${
                                  star <= (scores.professionalTone || 0)
                                    ? 'bg-yellow-400'
                                    : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{scores.professionalTone || 0}/5</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {allResults[allResults.length - 1]?.feedback && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-2">💡 Обратная связь:</h4>
                  <p className="text-gray-700">{allResults[allResults.length - 1].feedback}</p>
                </div>
              )}
              
              {currentStep === 'audioResults' && allResults[allResults.length - 1]?.audioAnalysis && (
                <>
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-3">✨ Лучшие моменты визита:</h4>
                    <ul className="space-y-2">
                      {allResults[allResults.length - 1].audioAnalysis.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 mt-0.5" />
                          <span className="text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-3">📈 Области для улучшения:</h4>
                    <ul className="space-y-2">
                      {allResults[allResults.length - 1].audioAnalysis.improvements.map((improvement, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Target className="w-5 h-5 text-orange-600 mt-0.5" />
                          <span className="text-gray-700">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              
              {initialAnalysis && currentStep === 'results' && (
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-3">📊 Анализ вашей подготовки:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Сильные стороны:</p>
                      <ul className="space-y-1">
                        {initialAnalysis.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-gray-700">• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Рекомендации:</p>
                      <ul className="space-y-1">
                        {initialAnalysis.tips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-gray-700">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentScreen('dashboard')}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Вернуться к выбору
                </button>
                <button
                  onClick={nextMarathon}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {currentMarathon < marathons.length - 1 ? 'Следующий марафон' : 'Завершить программу'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmBoosterApp;