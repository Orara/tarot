import React, { useState, useEffect } from 'react';
import { tarotDeck } from '../tarotData';

const ShortsGenerator = () => {
  const [step, setStep] = useState('intro'); // intro -> select -> reveal
  const [selectedCards, setSelectedCards] = useState([]);
  
  // 랜덤으로 3장의 카드를 뽑습니다
  useEffect(() => {
    const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
    setSelectedCards(shuffled.slice(0, 3));
  }, []);

  useEffect(() => {
    if (step === 'intro') {
      const timer = setTimeout(() => setStep('select'), 3000); // 3초 인트로
      return () => clearTimeout(timer);
    } else if (step === 'select') {
      const timer = setTimeout(() => setStep('reveal'), 5000); // 5초 고르는 시간
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div 
      className="w-screen h-screen flex flex-col justify-center items-center overflow-hidden bg-[#0a051e] relative text-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#7a4dff] opacity-20 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#ffd700] opacity-10 blur-[200px] rounded-full"></div>
      
      {/* Title */}
      <div className="absolute top-20 text-center z-10 w-full px-6">
        <h2 className="text-[#ffd700] text-xl font-bold tracking-widest uppercase mb-2 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          ARCANA INSIGHT
        </h2>
        {step === 'intro' && (
          <h1 className="text-4xl font-extrabold animate-pulse leading-tight">
            내일 당신에게<br/>일어날 일은?
          </h1>
        )}
        {step === 'select' && (
          <h1 className="text-3xl font-bold leading-tight">
            가장 끌리는 카드를<br/>하나 선택하세요
          </h1>
        )}
        {step === 'reveal' && (
          <h1 className="text-3xl font-bold leading-tight text-[#ffd700]">
            당신의 카드 결과입니다
          </h1>
        )}
      </div>

      {/* Cards Area */}
      <div className="flex justify-center items-center gap-6 z-10 mt-20">
        {selectedCards.map((card, idx) => (
          <div key={card.id} className="flex flex-col items-center gap-4">
            <div 
              className="w-28 h-44 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.2)] overflow-hidden border-2 border-[#ffd700]/50 relative transition-transform duration-1000"
              style={{
                transform: step === 'reveal' ? 'rotateY(0deg)' : 'rotateY(180deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Back of card */}
              <div 
                className="absolute inset-0 bg-[#2a114f] flex justify-center items-center backface-hidden"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="w-20 h-32 border border-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white/50 text-2xl font-bold">{idx + 1}</span>
                </div>
              </div>
              
              {/* Front of card */}
              <div 
                className="absolute inset-0 backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <img src={card.image} alt={card.nameKo} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
            </div>

            {/* Keyword Reveal */}
            <div className={`text-center transition-opacity duration-1000 ${step === 'reveal' ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-[#ffd700] font-bold text-lg">{card.nameKo}</p>
              <p className="text-gray-300 text-sm">{card.keywords[0]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Footer */}
      <div className="absolute bottom-20 text-center w-full px-6 z-10">
        {step === 'reveal' && (
          <div className="bg-[#7a4dff]/20 border border-[#7a4dff] rounded-2xl p-4 backdrop-blur-md animate-bounce">
            <p className="text-white font-bold text-lg mb-1">소름돋는 상세 해석 보기</p>
            <p className="text-[#ffd700] text-sm">프로필 링크를 클릭하세요!</p>
          </div>
        )}
      </div>

      {/* Progress Bar for Select Step */}
      {step === 'select' && (
        <div className="absolute bottom-40 w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#ffd700]" style={{ animation: 'shrink 5s linear forwards' }}>
            <style>{`
              @keyframes shrink {
                from { width: 100%; }
                to { width: 0%; }
              }
            `}</style>
          </div>
        </div>
      )}
      
      {/* Admin Reload Button */}
      <button 
        onClick={() => window.location.reload()}
        className="absolute bottom-4 right-4 text-xs text-white/30 hover:text-white/80 z-50"
      >
        새로고침(F5)
      </button>
    </div>
  );
};

export default ShortsGenerator;
