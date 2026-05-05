import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from './LanguageContext';
import TarotDeck from './components/TarotDeck';
import { getTarotReading } from './lib/gemini';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import PayPalCheckout from './components/PayPalCheckout';

function App() {
  const { lang, setLang, t } = useLanguage();
  const [appState, setAppState] = useState('home'); // 'home', 'free-reading', 'deep-reading', 'result'
  const [readingResult, setReadingResult] = useState(null);
  const [readingText, setReadingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutMode, setCheckoutMode] = useState(null); // 'basic', 'premium', 'vip'

  const getAmountForMode = (mode) => {
    if (mode === 'basic') return 2.99;
    if (mode === 'premium') return 4.99;
    if (mode === 'vip') return 8.99;
    return 0;
  };

  const startReading = (mode) => {
    setAppState(mode + '-reading');
  };

  const handleCardsDrawn = async (cards) => {
    const mode = appState.replace('-reading', '');
    setReadingResult({ cards, mode });
    setAppState('result');
    setReadingText("");
    setError(null);
    setIsLoading(true);

    try {
      // Call Gemini API
      const text = await getTarotReading(cards, mode, lang);
      setReadingText(text);
    } catch (err) {
      if (err.message === "API_KEY_MISSING") {
        setError(lang === 'ko' 
          ? "API 키가 설정되지 않았습니다. .env.local 파일에 VITE_GEMINI_API_KEY를 입력해주세요." 
          : "API key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");
      } else {
        setError(lang === 'ko' 
          ? "AI 리딩을 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." 
          : "An error occurred while fetching the reading. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (appState.includes('-reading')) {
    return (
      <TarotDeck 
        mode={appState.replace('-reading', '')} 
        onComplete={handleCardsDrawn} 
        onCancel={() => setAppState('home')} 
      />
    );
  }

  if (appState === 'result') {
    return (
      <div className="min-h-screen bg-tarot-dark flex flex-col items-center py-20 px-6">
        <h2 className="text-3xl font-bold text-tarot-gold mb-8 text-center">
          {t(readingResult.mode + 'ReadTitle')}
        </h2>
        
        {/* Selected Cards Display */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {readingResult.cards.map((c, i) => (
            <div key={c.id} className="flex flex-col items-center gap-2">
              <div className="w-28 h-44 md:w-36 md:h-56 border-2 border-tarot-gold rounded-xl overflow-hidden shadow-[0_0_30px_rgba(255,215,0,0.4)]">
                <img
                  src={c.image}
                  alt={lang === 'ko' ? c.nameKo : c.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-tarot-gold text-xs font-semibold text-center max-w-[7rem]">
                {lang === 'ko' ? c.nameKo : c.name}
              </span>
            </div>
          ))}
        </div>

        {/* Reading Result Box */}
        <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 backdrop-blur-sm shadow-2xl relative">
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-tarot-secondary border-t-tarot-accent rounded-full animate-spin mb-6"></div>
              <p className="text-gray-300 animate-pulse text-lg text-center">
                {lang === 'ko' ? 'AI 타로 마스터가 카드의 기운을 읽고 있습니다...' : 
                 lang === 'en' ? 'The AI Tarot Master is reading the energy of your cards...' :
                 lang === 'ja' ? 'AIタロットマスターがカードの気を読んでいます...' :
                 lang === 'zh' ? 'AI塔罗大师正在解读卡片的能量...' :
                 lang === 'es' ? 'El Maestro de Tarot AI está leyendo la energía de tus cartas...' :
                 lang === 'fr' ? 'Le Maître du Tarot IA lit l\'énergie de vos cartes...' :
                 lang === 'th' ? 'AI ปรมาจารย์ไพ่ทาโรต์กำลังอ่านพลังงานจากไพ่ของคุณ...' :
                 'Bậc thầy Tarot AI đang đọc năng lượng từ các lá bài của bạn...'}
              </p>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-center py-8 bg-red-900/20 rounded-xl border border-red-500/30">
              <p className="text-xl mb-2">⚠️</p>
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && readingText && (
            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-tarot-gold prose-a:text-tarot-accent prose-strong:text-white">
              <ReactMarkdown>{readingText}</ReactMarkdown>
            </div>
          )}

        </div>

        <button 
          onClick={() => setAppState('home')}
          className="mt-12 px-8 py-3 border border-tarot-secondary text-tarot-secondary hover:bg-tarot-secondary hover:text-white rounded-full transition-all"
        >
          {lang === 'ko' ? '메인으로 돌아가기' : 
           lang === 'en' ? 'Back to Home' :
           lang === 'ja' ? 'ホームに戻る' :
           lang === 'zh' ? '返回首页' :
           lang === 'es' ? 'Volver al Inicio' :
           lang === 'fr' ? 'Retour à l\'Accueil' :
           lang === 'th' ? 'กลับไปที่หน้าแรก' :
           'Trở về Trang chủ'}
        </button>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
      <div className="min-h-screen bg-tarot-dark flex flex-col items-center">
        {/* Checkout Modal */}
        {checkoutMode && (
          <PayPalCheckout 
            mode={checkoutMode}
            amount={getAmountForMode(checkoutMode)}
            onSuccess={(details) => {
              const mode = checkoutMode;
              setCheckoutMode(null);
              startReading(mode);
            }}
            onCancel={() => setCheckoutMode(null)}
          />
        )}
      {/* Header */}
      <header className="w-full flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tarot-secondary via-tarot-accent to-tarot-gold tracking-wider cursor-pointer" 
          onClick={() => setAppState('home')}
        >
          {t('siteName')}
        </div>
        <div className="flex gap-2 p-1 rounded-lg border border-white/10 backdrop-blur-sm bg-white/5">
          <select 
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer appearance-none px-2"
          >
            <option value="ko" className="text-black">🇰🇷 한국어</option>
            <option value="en" className="text-black">🇺🇸 English</option>
            <option value="ja" className="text-black">🇯🇵 日本語</option>
            <option value="zh" className="text-black">🇨🇳 中文</option>
            <option value="es" className="text-black">🇪🇸 Español</option>
            <option value="fr" className="text-black">🇫🇷 Français</option>
            <option value="th" className="text-black">🇹🇭 ภาษาไทย</option>
            <option value="vi" className="text-black">🇻🇳 Tiếng Việt</option>
          </select>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mx-auto px-6 py-12 md:py-20 gap-12">
        <div className="flex-1 text-center md:text-left space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            {t('heroTitle').split(' ').map((word, i) => (
              <span key={i} className={i % 2 !== 0 ? "text-tarot-accent" : ""}> {word} </span>
            ))}
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-xl mx-auto md:mx-0">
            {t('heroDesc')}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button 
              onClick={() => startReading('free')}
              className="px-8 py-3.5 bg-gradient-to-r from-tarot-secondary to-blue-600 hover:from-tarot-secondary hover:to-blue-500 rounded-full font-bold text-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(122,77,255,0.4)]"
            >
              {t('startSectionTitle')}
            </button>
          </div>
        </div>
        <div className="flex-1 relative flex justify-center items-center w-full max-w-md">
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-tarot-secondary/20 blur-[100px] rounded-full"></div>
          <div className="w-full aspect-[4/5] rounded-2xl relative z-10 border border-purple-500/30 overflow-hidden flex items-center justify-center" style={{background:'radial-gradient(ellipse at 60% 40%, rgba(122,77,255,0.4) 0%, rgba(26,10,60,0.9) 60%, rgba(10,5,30,1) 100%)', boxShadow:'0 0 60px rgba(122,77,255,0.3)'}}>
            <div className="absolute w-48 h-48 rounded-full" style={{top:'30%',left:'50%',transform:'translate(-50%,-50%)',background:'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)'}} />
            <div className="relative w-36 h-56">
              <div className="absolute inset-0 rounded-xl border border-yellow-400/40" style={{background:'linear-gradient(135deg,rgba(122,77,255,0.3) 0%,rgba(255,215,0,0.08) 100%)',transform:'rotate(12deg)',boxShadow:'0 0 15px rgba(255,215,0,0.1)'}}><div className="absolute inset-3 rounded-lg border border-yellow-400/20 flex items-center justify-center"><span className="text-yellow-400/40 text-3xl">✦</span></div></div>
              <div className="absolute inset-0 rounded-xl border border-yellow-400/50" style={{background:'linear-gradient(135deg,rgba(100,50,255,0.25) 0%,rgba(255,215,0,0.08) 100%)',transform:'rotate(5deg)',boxShadow:'0 0 15px rgba(255,215,0,0.1)'}}><div className="absolute inset-3 rounded-lg border border-yellow-400/25 flex items-center justify-center"><span className="text-yellow-400/50 text-3xl">☽</span></div></div>
              <div className="absolute inset-0 rounded-xl border border-yellow-400/60" style={{background:'linear-gradient(135deg,rgba(80,30,200,0.3) 0%,rgba(255,215,0,0.1) 100%)',transform:'rotate(-4deg)',boxShadow:'0 0 20px rgba(255,215,0,0.15)'}}><div className="absolute inset-3 rounded-lg border border-yellow-400/30 flex items-center justify-center"><span className="text-yellow-400/60 text-3xl">✧</span></div></div>
            </div>
            <div className="absolute bottom-6 w-full text-center"><p className="text-yellow-400/60 text-xs tracking-[6px]">ARCANA INSIGHT</p></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-black/40 border-y border-white/5 py-20 mt-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">{t('whyTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 bg-tarot-primary/30 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🌍</div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('feature1Title')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t('feature1Desc')}</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 bg-tarot-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">👁️</div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('feature2Title')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t('feature2Desc')}</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 bg-tarot-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✨</div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('feature3Title')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t('feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Section */}
      <section className="flex flex-col items-center w-full max-w-5xl space-y-8 px-6 py-20">
        <h2 className="text-3xl font-bold text-white mb-6">{t('startSectionTitle')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Free Tier */}
          <div className="w-full bg-tarot-primary/20 backdrop-blur-md border border-tarot-secondary/30 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(122,77,255,0.15)] transition-all hover:shadow-[0_0_60px_rgba(122,77,255,0.25)] flex flex-col justify-between h-full relative overflow-hidden">
            <div className="text-left mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">{t('freeReadTitle')}</h2>
              <p className="text-gray-400">{t('freeReadDesc')}</p>
            </div>
            <button 
              onClick={() => startReading('free')}
              className="w-full py-3.5 bg-gradient-to-r from-tarot-secondary to-blue-600 hover:from-tarot-secondary hover:to-blue-500 rounded-full font-bold text-white transition-all shadow-[0_0_20px_rgba(122,77,255,0.4)]"
            >
              {t('freeReadBtn')}
            </button>
          </div>

          {/* Basic Tier */}
          <div className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center shadow-lg transition-all hover:border-tarot-accent/50 flex flex-col justify-between h-full relative overflow-hidden">
            <div className="text-left mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">{t('basicReadTitle')}</h2>
              <p className="text-gray-400">{t('basicReadDesc')}</p>
            </div>
            <button 
              onClick={() => setCheckoutMode('basic')}
              className="w-full py-3.5 border border-tarot-accent text-tarot-accent hover:bg-tarot-accent hover:text-black rounded-full font-bold transition-all"
            >
              {t('basicReadBtn')}
            </button>
          </div>

          {/* Premium Tier */}
          <div className="w-full bg-tarot-dark backdrop-blur-md border border-tarot-gold/50 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(255,215,0,0.15)] transition-all hover:shadow-[0_0_60px_rgba(255,215,0,0.3)] relative overflow-hidden flex flex-col justify-between h-full transform md:-translate-y-2">
            <div className="absolute top-0 right-0 bg-tarot-gold text-black text-xs font-bold px-3 py-1 rounded-bl-lg tracking-wider z-10">BEST SELLER</div>
            <div className="text-left mb-6 relative z-0">
              <h2 className="text-2xl font-semibold text-tarot-gold mb-2">{t('premiumReadTitle')}</h2>
              <p className="text-gray-400">{t('premiumReadDesc')}</p>
            </div>
            <button 
              onClick={() => setCheckoutMode('premium')}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-tarot-gold hover:from-yellow-400 hover:to-yellow-300 rounded-full font-bold text-black transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)]"
            >
              {t('premiumReadBtn')}
            </button>
          </div>

          {/* VIP Tier */}
          <div className="w-full bg-gradient-to-br from-black to-tarot-primary/20 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 text-center shadow-lg transition-all hover:border-purple-400/60 flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg tracking-wider z-10">VIP ONLY</div>
            <div className="text-left mb-6 relative z-0">
              <h2 className="text-2xl font-semibold text-purple-300 mb-2">{t('vipReadTitle')}</h2>
              <p className="text-gray-400">{t('vipReadDesc')}</p>
            </div>
            <button 
              onClick={() => setCheckoutMode('vip')}
              className="w-full py-3.5 border border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white rounded-full font-bold transition-all"
            >
              {t('vipReadBtn')}
            </button>
          </div>
        </div>
      </section>
      
      <footer className="w-full text-center py-8 border-t border-white/5 text-sm text-gray-500">
        {t('footerText')}
      </footer>
    </div>
    </PayPalScriptProvider>
  );
}

export default App;
