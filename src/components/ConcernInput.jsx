import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';

const EXAMPLES = {
  ko: ['연애와 관계', '직장과 커리어', '재정과 돈', '중요한 결정', '가족 문제', '미래의 방향'],
  en: ['Love & relationship', 'Career & work', 'Money & finances', 'An important decision', 'Family matters', 'Future direction'],
  ja: ['恋愛・人間関係', '仕事・キャリア', 'お金・財政', '重要な決断', '家族の問題', '将来の方向性'],
  zh: ['爱情与关系', '职业与工作', '金钱与财务', '重要决定', '家庭问题', '未来方向'],
  es: ['Amor y relaciones', 'Carrera y trabajo', 'Dinero y finanzas', 'Una decisión importante', 'Asuntos familiares', 'Dirección futura'],
  fr: ['Amour et relations', 'Carrière et travail', 'Argent et finances', 'Une décision importante', 'Questions familiales', 'Direction future'],
  th: ['ความรักและความสัมพันธ์', 'อาชีพและการทำงาน', 'เงินและการเงิน', 'การตัดสินใจสำคัญ', 'เรื่องครอบครัว', 'ทิศทางอนาคต'],
  vi: ['Tình yêu và mối quan hệ', 'Sự nghiệp và công việc', 'Tiền bạc và tài chính', 'Một quyết định quan trọng', 'Vấn đề gia đình', 'Định hướng tương lai'],
};

const TEXT = {
  title: {
    ko: '카드에게 무엇을 묻고 싶으신가요?',
    en: 'What do you want to ask the cards?',
    ja: 'カードに何を聞きたいですか？',
    zh: '您想问塔罗牌什么？',
    es: '¿Qué quieres preguntarle a las cartas?',
    fr: 'Que voulez-vous demander aux cartes ?',
    th: 'คุณต้องการถามไพ่ว่าอะไร?',
    vi: 'Bạn muốn hỏi những lá bài điều gì?',
  },
  subtitle: {
    ko: '현재 고민이나 상황을 구체적으로 적을수록 더 정확한 리딩을 받을 수 있습니다.',
    en: 'The more specific your concern, the more accurate and personal your reading will be.',
    ja: '悩みや状況を具体的に書くほど、より正確なリーディングが得られます。',
    zh: '您的问题越具体，塔罗牌的解读就越准确、越个性化。',
    es: 'Cuanto más específica sea tu pregunta, más precisa y personal será tu lectura.',
    fr: 'Plus votre question est précise, plus votre lecture sera exacte et personnalisée.',
    th: 'ยิ่งคุณระบุความกังวลของคุณได้ชัดเจนมากเท่าไหร่ การอ่านก็จะยิ่งแม่นยำมากขึ้นเท่านั้น',
    vi: 'Câu hỏi của bạn càng cụ thể, bài đọc sẽ càng chính xác và cá nhân hóa hơn.',
  },
  placeholder: {
    ko: '예) 요즘 3년간 사귄 남자친구와의 관계가 답답합니다. 이 관계를 계속해야 할지, 헤어져야 할지 방향을 알고 싶습니다.',
    en: 'e.g. I\'ve been with my partner for 3 years but things feel stagnant. Should I keep going or is it time to move on?',
    ja: '例）3年間付き合っている彼氏との関係が行き詰まっています。この関係を続けるべきか、別れるべきか方向性を知りたいです。',
    zh: '例）我和交往了3年的男友关系陷入瓶颈。我想知道是否应该继续这段关系，还是该分手。',
    es: 'ej. Llevo 3 años con mi pareja pero siento que la relación está estancada. ¿Debo seguir o es momento de seguir adelante?',
    fr: 'ex. Je suis avec mon partenaire depuis 3 ans mais les choses semblent stagner. Dois-je continuer ou est-il temps de passer à autre chose ?',
    th: 'เช่น ฉันคบกับแฟนมา 3 ปีแล้ว แต่รู้สึกว่าความสัมพันธ์ไม่ก้าวหน้า ควรจะเดินหน้าต่อหรือเลิกกันดี?',
    vi: 'vd. Tôi đã yêu người bạn trai được 3 năm nhưng mọi thứ có vẻ trì trệ. Tôi có nên tiếp tục hay đã đến lúc buông tay?',
  },
  tagLabel: {
    ko: '주제 예시 (클릭하면 추가됩니다)',
    en: 'Topic examples (click to add)',
    ja: 'テーマ例（クリックで追加）',
    zh: '主题示例（点击添加）',
    es: 'Ejemplos de temas (haz clic para añadir)',
    fr: 'Exemples de sujets (cliquez pour ajouter)',
    th: 'ตัวอย่างหัวข้อ (คลิกเพื่อเพิ่ม)',
    vi: 'Ví dụ chủ đề (nhấp để thêm)',
  },
  minChars: {
    ko: '최소 20자 이상 작성해주세요',
    en: 'Please write at least 20 characters',
    ja: '20文字以上入力してください',
    zh: '请至少输入20个字符',
    es: 'Por favor escribe al menos 20 caracteres',
    fr: 'Veuillez écrire au moins 20 caractères',
    th: 'กรุณาเขียนอย่างน้อย 20 ตัวอักษร',
    vi: 'Vui lòng viết ít nhất 20 ký tự',
  },
  startBtn: {
    ko: '카드 뽑으러 가기',
    en: 'Draw My Cards',
    ja: 'カードを引く',
    zh: '开始抽牌',
    es: 'Sacar mis cartas',
    fr: 'Tirer mes cartes',
    th: 'จั่วไพ่ของฉัน',
    vi: 'Rút bài của tôi',
  },
  backBtn: {
    ko: '돌아가기',
    en: 'Go Back',
    ja: '戻る',
    zh: '返回',
    es: 'Volver',
    fr: 'Retour',
    th: 'กลับ',
    vi: 'Quay lại',
  },
  charCount: {
    ko: (n) => `${n}자 입력됨`,
    en: (n) => `${n} characters`,
    ja: (n) => `${n}文字`,
    zh: (n) => `已输入${n}个字符`,
    es: (n) => `${n} caracteres`,
    fr: (n) => `${n} caractères`,
    th: (n) => `${n} ตัวอักษร`,
    vi: (n) => `${n} ký tự`,
  },
};

const MIN_CHARS = 20;

export default function ConcernInput({ mode, onStart, onCancel }) {
  const { lang } = useLanguage();
  const [concern, setConcern] = useState('');

  const t = (key) => TEXT[key]?.[lang] || TEXT[key]?.en || '';
  const examples = EXAMPLES[lang] || EXAMPLES.en;

  const handleTagClick = (tag) => {
    if (concern && !concern.endsWith(' ')) {
      setConcern(prev => prev + ' ' + tag + ' ');
    } else {
      setConcern(prev => prev + tag + ' ');
    }
  };

  const isReady = concern.trim().length >= MIN_CHARS;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-tarot-dark">
      {/* Decorative glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-tarot-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">🔮</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {t('title')}
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-lg mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Input card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
          {/* Topic tag examples */}
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">{t('tagLabel')}</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => handleTagClick(ex)}
                className="px-3 py-1.5 text-xs rounded-full border border-tarot-secondary/50 text-tarot-secondary hover:bg-tarot-secondary/20 transition-all"
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            placeholder={t('placeholder')}
            rows={5}
            className="w-full bg-black/30 border border-white/10 focus:border-tarot-secondary/60 rounded-xl p-4 text-white placeholder-gray-600 text-sm leading-relaxed resize-none outline-none transition-all"
          />

          {/* Character count + validation */}
          <div className="flex justify-between items-center mt-2 mb-6">
            <span className={`text-xs transition-colors ${isReady ? 'text-green-400' : 'text-gray-500'}`}>
              {isReady ? '✓ ' : ''}{typeof t('charCount') === 'function' ? t('charCount')(concern.trim().length) : concern.trim().length}
            </span>
            {!isReady && concern.trim().length > 0 && (
              <span className="text-xs text-yellow-500/80">{t('minChars')}</span>
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => isReady && onStart(concern.trim())}
            disabled={!isReady}
            className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
              isReady
                ? 'bg-gradient-to-r from-tarot-secondary to-blue-600 hover:from-tarot-secondary hover:to-blue-500 text-white shadow-[0_0_30px_rgba(122,77,255,0.5)] hover:scale-[1.02]'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            {t('startBtn')}
          </button>
        </div>

        {/* Back button */}
        <div className="text-center mt-6">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            ← {t('backBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
