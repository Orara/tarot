import React, { forwardRef } from 'react';

const ShareCard = forwardRef(({ cards, concern, readingText, lang, mode }, ref) => {
  // Extract a short snippet from the reading text (e.g., the first paragraph)
  const summaryMatch = readingText?.match(/^(.*?)(?:\n\n|\r\n\r\n|$)/s);
  const summary = summaryMatch ? summaryMatch[1].replace(/[*#]/g, '').slice(0, 150) + '...' : '';

  const titleText = 
    lang === 'ko' ? '나의 타로 리딩 결과' :
    lang === 'ja' ? '私のタロットリーディング結果' :
    'My Tarot Reading Result';

  return (
    <div
      ref={ref}
      className="absolute top-0 left-[-9999px] bg-[#0a051e] flex flex-col items-center justify-between overflow-hidden"
      style={{
        width: '1080px',
        height: '1920px',
        background: 'radial-gradient(ellipse at 50% 30%, #2a114f 0%, #0a051e 70%)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Background aesthetic elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#7a4dff] opacity-20 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#ffd700] opacity-10 blur-[200px] rounded-full"></div>
      
      {/* Header */}
      <div className="w-full flex flex-col items-center pt-32 px-20 z-10">
        <h2 className="text-[#ffd700] text-5xl font-bold tracking-widest uppercase mb-4 opacity-90 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
          ARCANA INSIGHT
        </h2>
        <div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-50 mb-8"></div>
        <h1 className="text-white text-6xl font-extrabold mb-8">{titleText}</h1>
        
        {concern && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md max-w-3xl">
            <p className="text-[#a890d3] text-2xl uppercase tracking-widest mb-3 text-center">
              {lang === 'ko' ? '나의 질문' : 'My Question'}
            </p>
            <p className="text-white text-4xl text-center font-light italic leading-relaxed">
              "{concern}"
            </p>
          </div>
        )}
      </div>

      {/* Cards Display */}
      <div className="flex flex-wrap justify-center gap-12 px-12 z-10 w-full mt-16 mb-auto">
        {cards?.map((c, i) => (
          <div key={c.id} className="flex flex-col items-center gap-6">
            <div 
              className="w-[260px] h-[410px] border-[4px] border-[#ffd700] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.3)] relative"
              style={{
                transform: cards.length === 3 ? (i === 0 ? 'rotate(-5deg) translateY(20px)' : i === 1 ? 'translateY(-20px)' : 'rotate(5deg) translateY(20px)') : 'none',
              }}
            >
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous" // IMPORTANT for html2canvas
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <span className="text-[#ffd700] text-3xl font-semibold text-center drop-shadow-md px-4">
              {lang === 'ko' ? c.nameKo : c.name}
            </span>
          </div>
        ))}
      </div>

      {/* Reading Snippet */}
      <div className="w-full px-24 z-10 mb-24">
        <div className="bg-black/40 border border-[#7a4dff]/30 rounded-3xl p-12 backdrop-blur-xl shadow-2xl relative">
          <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-[#7a4dff] p-4 rounded-full shadow-[0_0_20px_#7a4dff]">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <p className="text-gray-200 text-4xl leading-relaxed text-center font-medium">
            {summary}
          </p>
        </div>
      </div>

      {/* Footer / Watermark */}
      <div className="w-full pb-16 flex flex-col items-center z-10">
        <div className="h-[1px] w-full max-w-xl bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>
        <p className="text-white/80 text-3xl font-medium tracking-wide mb-2">
          {lang === 'ko' ? '당신의 운명을 지금 확인해보세요' : 'Discover your destiny now'}
        </p>
        <p className="text-[#ffd700] text-4xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
          arcana-insight.com
        </p>
      </div>
    </div>
  );
});

export default ShareCard;
