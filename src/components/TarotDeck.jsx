import React, { useState, useEffect, useRef } from 'react';
import { tarotDeck } from '../tarotData';
import { useLanguage } from '../LanguageContext';

export default function TarotDeck({ mode, onComplete, onCancel }) {
  const { t, lang } = useLanguage();
  let maxCards = 1;
  if (mode === 'basic') maxCards = 3;
  else if (mode === 'premium') maxCards = 5;
  else if (mode === 'vip') maxCards = 10;
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [revealedCards, setRevealedCards] = useState({}); // map index -> cardData
  const scrollRef = useRef(null);

  // Generate a beautiful, realistic "fanned spread" (arc shape) like a real tarot reader does
  const [cardStyles] = useState(() => {
    const N = 78;
    return Array.from({ length: N }).map((_, i) => {
      // 1. Calculate perfect arc using a parabola
      const normalized = (i / (N - 1)) * 2 - 1; // Ranges from -1 to +1
      const maxRotation = 40; // End cards rotated by 40 degrees
      const maxYDrop = 80; // End cards dropped down by 80px
      
      const baseRotate = normalized * maxRotation;
      const baseY = (normalized * normalized) * maxYDrop;

      // 2. Add very subtle "human" imperfection (jitter) so it doesn't look like machine-drawn
      const jitterRot = Math.sin(i * 12.34) * 1.5; // ±1.5 degrees
      const jitterY = Math.cos(i * 45.67) * 3; // ±3 px
      
      return {
        rotate: (baseRotate + jitterRot).toFixed(1),
        translateY: (baseY + jitterY).toFixed(1)
      };
    });
  });

  // Convert vertical mouse wheel scrolling to horizontal scrolling for PC users
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const handleWheel = (e) => {
      // If scrolling vertically, convert it to horizontal scroll
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY + e.deltaX;
      }
    };
    
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleCardClick = (index) => {
    if (selectedIndices.includes(index) || selectedIndices.length >= maxCards) return;

    // Pick a random card from the deck that hasn't been picked yet
    const availableCards = tarotDeck.filter(c => !Object.values(revealedCards).some(r => r.id === c.id));
    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];

    const newRevealed = { ...revealedCards, [index]: randomCard };
    setRevealedCards(newRevealed);
    
    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === maxCards) {
      setTimeout(() => {
        onComplete(newSelected.map(i => newRevealed[i]));
      }, 2000); // Wait a bit longer for the user to see all 78 cards and the drawn ones
    }
  };

  // 78 cards
  const virtualDeck = Array.from({ length: 78 });

  return (
    <div className="flex flex-col items-center w-full mx-auto py-12 px-4 min-h-screen overflow-hidden">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-white mb-2">
          {t(mode + 'ReadTitle')}
        </h2>
        <p className="text-gray-400">
          {lang === 'ko' ? `집중하고 ${maxCards}장의 카드를 선택해주세요.` : 
           lang === 'en' ? `Focus and select ${maxCards} card(s).` :
           lang === 'ja' ? `集中して${maxCards}枚のカードを選んでください。` :
           lang === 'zh' ? `请集中注意力并选择${maxCards}张牌。` :
           lang === 'es' ? `Concéntrate y selecciona ${maxCards} carta(s).` :
           lang === 'fr' ? `Concentrez-vous et sélectionnez ${maxCards} carte(s).` :
           lang === 'th' ? `ตั้งสมาธิแล้วเลือกไพ่ ${maxCards} ใบ` :
           `Tập trung và chọn ${maxCards} lá bài.`}
        </p>
        <p className="text-tarot-accent mt-4 font-semibold text-xl">
          {selectedIndices.length} / {maxCards}
        </p>
      </div>

      {/* 78 Cards Spread (Horizontal Scrollable) */}
      <div 
        ref={scrollRef}
        className="w-full max-w-[100vw] overflow-x-auto hide-scrollbar pb-32 pt-20 cursor-grab active:cursor-grabbing"
      >
        <div className="flex px-[10vw] md:px-[30vw] min-w-max perspective-1000 items-center h-64 md:h-80">
          {virtualDeck.map((_, index) => {
            const isFlipped = selectedIndices.includes(index);
            const cardData = revealedCards[index];
            const { rotate, translateY } = cardStyles[index];
            
            // Adjust margin to make cards overlap like a fan
            const marginLeftClass = index === 0 ? '' : '-ml-12 md:-ml-16 lg:-ml-20';

            return (
              <div 
                key={index} 
                className={`tarot-card relative shrink-0 w-20 h-32 md:w-28 md:h-44 lg:w-36 lg:h-56 cursor-pointer transform-style-3d ${marginLeftClass} ${isFlipped ? 'flipped' : ''}`}
                style={{ 
                  zIndex: isFlipped ? 90 : index,
                  '--random-rot': `${rotate}deg`,
                  '--random-y': `${translateY}px`
                }}
                onClick={() => handleCardClick(index)}
              >
                {/* Back of the card */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-tarot-primary to-[#2a1b4d] border border-tarot-secondary/60 rounded-xl shadow-xl flex items-center justify-center">
                  <div className="w-10 h-10 md:w-16 md:h-16 border border-tarot-gold/30 rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 border border-tarot-gold/20 rotate-45"></div>
                    <div className="absolute inset-0 border border-tarot-gold/20 rotate-12"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-tarot-accent rounded-full shadow-[0_0_10px_#00F0FF]"></div>
                  </div>
                </div>

                {/* Front of the card (Revealed) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-[#f8f5f2] border-2 border-tarot-gold rounded-xl shadow-2xl flex flex-col items-center justify-center p-2 md:p-3 text-center overflow-hidden">
                  <div className="w-full h-full border border-gray-300 rounded-lg flex flex-col items-center justify-center p-1 md:p-2 bg-white relative">
                    <div className="absolute top-2 text-tarot-gold text-xs">✧</div>
                    <div className="absolute bottom-2 text-tarot-gold text-xs">✧</div>
                    <span className="text-xs md:text-sm lg:text-base font-bold text-gray-800 break-words mt-1">
                      {cardData ? (lang === 'ko' ? cardData.nameKo : cardData.name) : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 text-gray-500 text-sm animate-pulse">
        {lang === 'ko' ? '← 마우스 휠이나 스와이프로 카드를 고르세요 →' : 
         lang === 'en' ? '← Scroll or swipe to choose a card →' :
         lang === 'ja' ? '← スクロールまたはスワイプしてカードを選んでください →' :
         lang === 'zh' ? '← 滚动或滑动选择卡片 →' :
         lang === 'es' ? '← Desliza para elegir una carta →' :
         lang === 'fr' ? '← Glissez pour choisir une carte →' :
         lang === 'th' ? '← ปัดซ้ายหรือขวาเพื่อเลือกไพ่ →' :
         '← Vuốt sang trái hoặc phải để chọn thẻ →'}
      </div>

      <button 
        onClick={onCancel}
        className="mt-12 px-6 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-white rounded-full transition-all"
      >
        {lang === 'ko' ? '돌아가기' : 
         lang === 'en' ? 'Go Back' :
         lang === 'ja' ? '戻る' :
         lang === 'zh' ? '返回' :
         lang === 'es' ? 'Volver' :
         lang === 'fr' ? 'Retour' :
         lang === 'th' ? 'กลับ' :
         'Quay lại'}
      </button>
    </div>
  );
}
