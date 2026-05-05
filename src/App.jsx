import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from './LanguageContext';
import TarotDeck from './components/TarotDeck';
import ConcernInput from './components/ConcernInput';
import ShareCard from './components/ShareCard';
import ShortsGenerator from './components/ShortsGenerator';
import html2canvas from 'html2canvas';
import { getTarotReading } from './lib/gemini';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import PayPalCheckout from './components/PayPalCheckout';

const ADMIN_KEY = 'arcana2026';
const FREE_USED_KEY = 'arcana_free_used';

function App() {
  const { lang, setLang, t } = useLanguage();
  const [appState, setAppState] = useState('home');
  const [readingResult, setReadingResult] = useState(null);
  const [readingText, setReadingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutMode, setCheckoutMode] = useState(null);
  const [freeUsed, setFreeUsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [concern, setConcern] = useState('');
  const [pendingMode, setPendingMode] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const shareCardRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch {
      // 통계 로드 실패 시 무시
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    // 어드민 모드: URL에 ?admin=arcana2026 이 있으면 활성화
    const params = new URLSearchParams(window.location.search);
    let admin = false;
    if (params.get('admin') === ADMIN_KEY) {
      setIsAdmin(true);
      sessionStorage.setItem('arcana_admin', '1');
      admin = true;
    } else if (sessionStorage.getItem('arcana_admin') === '1') {
      setIsAdmin(true);
      admin = true;
    }

    if (admin && params.get('mode') === 'shorts') {
      setAppState('shorts');
    }

    // 무료 리딩 사용 여부 확인
    if (localStorage.getItem(FREE_USED_KEY)) {
      setFreeUsed(true);
    }

    // 방문자 추적 (세션당 1회)
    if (!sessionStorage.getItem('visit_tracked')) {
      sessionStorage.setItem('visit_tracked', '1');
      fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'visit' }) }).catch(() => {});
    }

    // 어드민이면 통계 바로 로드
    if (admin) fetchStats();
  }, []);

  const getAmountForMode = (mode) => {
    if (mode === 'basic') return 2.99;
    if (mode === 'premium') return 4.99;
    if (mode === 'vip') return 8.99;
    return 0;
  };

  const goToConcernInput = (mode) => {
    setPendingMode(mode);
    setAppState('concern');
  };

  const startReading = (mode, userConcern) => {
    setConcern(userConcern || '');
    setAppState(mode + '-reading');
  };

  const handleFreeClick = () => {
    if (freeUsed && !isAdmin) {
      alert(
        lang === 'ko' ? '무료 리딩은 1회만 이용 가능합니다.\n유료 플랜을 이용해 더 깊은 인사이트를 받아보세요!' :
        lang === 'en' ? 'Free reading is limited to once per device.\nTry a paid plan for deeper insights!' :
        lang === 'ja' ? '無料リーディングは1回限りです。\n有料プランでより深い洞察を得てください！' :
        lang === 'zh' ? '免费占卜每台设备限用一次。\n请购买付费方案获取更深入的洞察！' :
        lang === 'es' ? 'La lectura gratuita está limitada a una vez por dispositivo.\n¡Prueba un plan de pago para más insights!' :
        lang === 'fr' ? 'La lecture gratuite est limitée à une fois par appareil.\nEssayez un plan payant pour plus d\'insights !' :
        lang === 'th' ? 'การอ่านฟรีจำกัดครั้งละ 1 ครั้งต่ออุปกรณ์\nลองแผนชำระเงินเพื่อรับข้อมูลเชิงลึกมากขึ้น!' :
        'Đọc bài miễn phí chỉ được dùng một lần mỗi thiết bị!\nHãy thử gói trả phí để có nhiều thông tin hơn!'
      );
      return;
    }
    goToConcernInput('free');
  };

  const handleCardsDrawn = async (cards) => {
    const mode = appState.replace('-reading', '');

    // 무료 리딩 완료 시 사용 기록 저장
    if (mode === 'free') {
      localStorage.setItem(FREE_USED_KEY, '1');
      setFreeUsed(true);
    }

    setReadingResult({ cards, mode, concern });
    setAppState('result');
    setReadingText("");
    setError(null);
    setIsLoading(true);

    try {
      const text = await getTarotReading(cards, mode, lang, concern);
      setReadingText(text);
    } catch (err) {
      if (err.message === "API_KEY_MISSING") {
        setError(lang === 'ko'
          ? "API 키가 설정되지 않았습니다."
          : "API key is missing.");
      } else {
        setError(lang === 'ko'
          ? "AI 리딩을 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          : "An error occurred while fetching the reading. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!shareCardRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 1, // Keep 1080x1920 resolution
        useCORS: true,
        backgroundColor: '#0a051e',
        allowTaint: true
      });
      const image = canvas.toDataURL("image/png");
      
      // Try Web Share API for mobile devices
      if (navigator.share) {
        try {
          const blob = await (await fetch(image)).blob();
          const file = new File([blob], 'tarot-reading.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: lang === 'ko' ? '나의 타로 리딩' : 'My Tarot Reading',
              text: lang === 'ko' ? 'Arcana Insight에서 타로를 확인해보세요!' : 'Check out my tarot reading at Arcana Insight!',
              files: [file],
            });
            setIsSharing(false);
            return;
          }
        } catch (err) {
          console.log('Share API failed, falling back to download', err);
        }
      }

      // Fallback: Download image directly
      const link = document.createElement('a');
      link.href = image;
      link.download = `arcana-insight-tarot-${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error("Error generating image:", err);
      alert(lang === 'ko' ? "이미지 생성 중 오류가 발생했습니다." : "Failed to generate image.");
    } finally {
      setIsSharing(false);
    }
  };

  if (appState === 'concern') {
    return (
      <ConcernInput
        mode={pendingMode}
        onStart={(userConcern) => startReading(pendingMode, userConcern)}
        onCancel={() => setAppState('home')}
      />
    );
  }

  if (appState === 'shorts') {
    return <ShortsGenerator />;
  }

  if (appState.includes('-reading')) {
    return (
      <TarotDeck
        mode={appState.replace('-reading', '')}
        concern={concern}
        onComplete={handleCardsDrawn}
        onCancel={() => setAppState('concern')}
      />
    );
  }

  if (appState === 'result') {
    return (
      <div className="min-h-screen bg-tarot-dark flex flex-col items-center py-20 px-6">
        <h2 className="text-3xl font-bold text-tarot-gold mb-4 text-center">
          {t(readingResult.mode + 'ReadTitle')}
        </h2>

        {/* Concern display */}
        {readingResult.concern && (
          <div className="w-full max-w-2xl mb-8 bg-tarot-secondary/10 border border-tarot-secondary/30 rounded-xl px-5 py-3 text-center">
            <p className="text-xs text-tarot-secondary uppercase tracking-widest mb-1">
              {lang === 'ko' ? '당신의 질문' : lang === 'en' ? 'Your Question' : lang === 'ja' ? 'あなたの質問' : lang === 'zh' ? '您的问题' : 'Your Question'}
            </p>
            <p className="text-gray-300 text-sm leading-relaxed italic">"{readingResult.concern}"</p>
          </div>
        )}

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

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center z-20">
          {!isLoading && !error && readingText && (
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-full font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              {isSharing ? (
                <span className="animate-pulse">{lang === 'ko' ? '이미지 생성 중...' : 'Generating Image...'}</span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  {lang === 'ko' ? '인스타그램에 공유하기 (이미지 저장)' : 'Save & Share Result'}
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setAppState('home')}
            className="px-8 py-3.5 border border-tarot-secondary text-tarot-secondary hover:bg-tarot-secondary hover:text-white rounded-full transition-all"
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

        {/* Hidden ShareCard Component for Rendering PNG */}
        {!isLoading && !error && readingText && (
          <ShareCard 
            ref={shareCardRef}
            cards={readingResult.cards}
            concern={readingResult.concern}
            readingText={readingText}
            lang={lang}
            mode={readingResult.mode}
          />
        )}
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
      <div className="min-h-screen bg-tarot-dark flex flex-col items-center">

        {/* 어드민 배지 */}
        {isAdmin && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg">
            🔑 ADMIN MODE — 모든 리딩 무료
          </div>
        )}

        {/* 어드민 통계 대시보드 */}
        {isAdmin && (
          <div className="w-full max-w-6xl mx-auto px-6 pt-16 pb-0">
            <div className="bg-yellow-950/40 border border-yellow-500/40 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-400 font-bold text-lg">📊 오늘의 현황 ({adminStats?.date || '로딩 중...'})</h3>
                <button
                  onClick={fetchStats}
                  disabled={statsLoading}
                  className="text-xs px-3 py-1 rounded-full border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 transition-all disabled:opacity-50"
                >
                  {statsLoading ? '새로고침 중...' : '🔄 새로고침'}
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-yellow-500/30">
                    <th className="text-left py-2 text-yellow-300/70 font-semibold">항목</th>
                    <th className="text-right py-2 text-yellow-300/70 font-semibold">수치</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 text-gray-300">👥 오늘 방문자 수</td>
                    <td className="py-3 text-right text-white font-bold text-lg">
                      {statsLoading ? '—' : (adminStats ? adminStats.visits.toLocaleString() : '—')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-300">💳 오늘 결제 수</td>
                    <td className="py-3 text-right text-tarot-gold font-bold text-lg">
                      {statsLoading ? '—' : (adminStats ? adminStats.payments.toLocaleString() : '—')}
                    </td>
                  </tr>
                </tbody>
              </table>
              {!adminStats && !statsLoading && (
                <p className="text-xs text-yellow-500/60 mt-3">⚠️ KV 네임스페이스가 연결되지 않았습니다. Cloudflare 대시보드에서 설정이 필요합니다.</p>
              )}
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {checkoutMode && (
          <PayPalCheckout
            mode={checkoutMode}
            amount={getAmountForMode(checkoutMode)}
            onSuccess={(details) => {
              const mode = checkoutMode;
              setCheckoutMode(null);
              fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'payment' }) }).catch(() => {});
              goToConcernInput(mode);
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
                onClick={handleFreeClick}
                className="px-8 py-3.5 bg-gradient-to-r from-tarot-secondary to-blue-600 hover:from-tarot-secondary hover:to-blue-500 rounded-full font-bold text-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(122,77,255,0.4)]"
              >
                {t('startSectionTitle')}
              </button>
            </div>
          </div>
          <div className="flex-1 relative flex justify-center items-center w-full max-w-md">
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
                {freeUsed && !isAdmin && (
                  <p className="text-yellow-400 text-xs mt-2 font-semibold">
                    {lang === 'ko' ? '✓ 이미 사용하셨습니다' :
                     lang === 'en' ? '✓ Already used' :
                     lang === 'ja' ? '✓ 既に使用済み' :
                     lang === 'zh' ? '✓ 已使用' :
                     '✓ Ya utilizado'}
                  </p>
                )}
              </div>
              <button
                onClick={handleFreeClick}
                disabled={freeUsed && !isAdmin}
                className={`w-full py-3.5 rounded-full font-bold text-white transition-all shadow-[0_0_20px_rgba(122,77,255,0.4)] ${
                  freeUsed && !isAdmin
                    ? 'bg-gray-600 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-tarot-secondary to-blue-600 hover:from-tarot-secondary hover:to-blue-500'
                }`}
              >
                {freeUsed && !isAdmin
                  ? (lang === 'ko' ? '이미 사용됨' : lang === 'en' ? 'Already Used' : lang === 'ja' ? '使用済み' : '已使用')
                  : t('freeReadBtn')}
              </button>
            </div>

            {/* Basic Tier */}
            <div className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center shadow-lg transition-all hover:border-tarot-accent/50 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2">{t('basicReadTitle')}</h2>
                <p className="text-gray-400">{t('basicReadDesc')}</p>
              </div>
              <button
                onClick={() => isAdmin ? goToConcernInput('basic') : setCheckoutMode('basic')}
                className="w-full py-3.5 border border-tarot-accent text-tarot-accent hover:bg-tarot-accent hover:text-black rounded-full font-bold transition-all"
              >
                {isAdmin ? (lang === 'ko' ? '3장 바로 시작 (어드민)' : '3 Cards – Admin Free') : t('basicReadBtn')}
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
                onClick={() => isAdmin ? goToConcernInput('premium') : setCheckoutMode('premium')}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-tarot-gold hover:from-yellow-400 hover:to-yellow-300 rounded-full font-bold text-black transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              >
                {isAdmin ? (lang === 'ko' ? '5장 바로 시작 (어드민)' : '5 Cards – Admin Free') : t('premiumReadBtn')}
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
                onClick={() => isAdmin ? goToConcernInput('vip') : setCheckoutMode('vip')}
                className="w-full py-3.5 border border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white rounded-full font-bold transition-all"
              >
                {isAdmin ? (lang === 'ko' ? '10장 바로 시작 (어드민)' : '10 Cards – Admin Free') : t('vipReadBtn')}
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
