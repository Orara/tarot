import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';

const MAX_CHARS = 200;
const MIN_CHARS = 10;

const CATEGORIES = {
  ko: [
    { id: 'love',    label: '❤️ 사랑 / 연애' },
    { id: 'money',   label: '💰 돈 / 재정' },
    { id: 'family',  label: '👨‍👩‍👧 가족' },
    { id: 'future',  label: '🔮 미래 / 진로' },
    { id: 'work',    label: '💼 직장 / 커리어' },
    { id: 'relation',label: '🤝 인간관계' },
    { id: 'other',   label: '✏️ 기타 / 자유 작성' },
  ],
  en: [
    { id: 'love',    label: '❤️ Love / Relationship' },
    { id: 'money',   label: '💰 Money / Finances' },
    { id: 'family',  label: '👨‍👩‍👧 Family' },
    { id: 'future',  label: '🔮 Future / Career Path' },
    { id: 'work',    label: '💼 Work / Career' },
    { id: 'relation',label: '🤝 Relationships' },
    { id: 'other',   label: '✏️ Other / Free Write' },
  ],
  ja: [
    { id: 'love',    label: '❤️ 恋愛・愛情' },
    { id: 'money',   label: '💰 お金・財政' },
    { id: 'family',  label: '👨‍👩‍👧 家族' },
    { id: 'future',  label: '🔮 未来・進路' },
    { id: 'work',    label: '💼 仕事・キャリア' },
    { id: 'relation',label: '🤝 人間関係' },
    { id: 'other',   label: '✏️ その他・自由記入' },
  ],
  zh: [
    { id: 'love',    label: '❤️ 爱情 / 感情' },
    { id: 'money',   label: '💰 金钱 / 财务' },
    { id: 'family',  label: '👨‍👩‍👧 家庭' },
    { id: 'future',  label: '🔮 未来 / 前途' },
    { id: 'work',    label: '💼 工作 / 职业' },
    { id: 'relation',label: '🤝 人际关系' },
    { id: 'other',   label: '✏️ 其他 / 自由填写' },
  ],
  es: [
    { id: 'love',    label: '❤️ Amor / Relaciones' },
    { id: 'money',   label: '💰 Dinero / Finanzas' },
    { id: 'family',  label: '👨‍👩‍👧 Familia' },
    { id: 'future',  label: '🔮 Futuro / Rumbo' },
    { id: 'work',    label: '💼 Trabajo / Carrera' },
    { id: 'relation',label: '🤝 Relaciones personales' },
    { id: 'other',   label: '✏️ Otro / Escritura libre' },
  ],
  fr: [
    { id: 'love',    label: '❤️ Amour / Relations' },
    { id: 'money',   label: '💰 Argent / Finances' },
    { id: 'family',  label: '👨‍👩‍👧 Famille' },
    { id: 'future',  label: '🔮 Avenir / Orientation' },
    { id: 'work',    label: '💼 Travail / Carrière' },
    { id: 'relation',label: '🤝 Relations personnelles' },
    { id: 'other',   label: '✏️ Autre / Écriture libre' },
  ],
  th: [
    { id: 'love',    label: '❤️ ความรัก / ความสัมพันธ์' },
    { id: 'money',   label: '💰 เงิน / การเงิน' },
    { id: 'family',  label: '👨‍👩‍👧 ครอบครัว' },
    { id: 'future',  label: '🔮 อนาคต / เส้นทางชีวิต' },
    { id: 'work',    label: '💼 งาน / อาชีพ' },
    { id: 'relation',label: '🤝 ความสัมพันธ์' },
    { id: 'other',   label: '✏️ อื่นๆ / เขียนอิสระ' },
  ],
  vi: [
    { id: 'love',    label: '❤️ Tình yêu / Quan hệ' },
    { id: 'money',   label: '💰 Tiền bạc / Tài chính' },
    { id: 'family',  label: '👨‍👩‍👧 Gia đình' },
    { id: 'future',  label: '🔮 Tương lai / Hướng đi' },
    { id: 'work',    label: '💼 Công việc / Sự nghiệp' },
    { id: 'relation',label: '🤝 Các mối quan hệ' },
    { id: 'other',   label: '✏️ Khác / Viết tự do' },
  ],
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
    ko: '주제를 선택하고, 현재 상황을 구체적으로 적어주세요.',
    en: 'Select a topic, then describe your situation in detail.',
    ja: 'テーマを選択し、現在の状況を具体的にお書きください。',
    zh: '选择主题，然后具体描述您的情况。',
    es: 'Selecciona un tema y describe tu situación en detalle.',
    fr: 'Choisissez un sujet, puis décrivez votre situation en détail.',
    th: 'เลือกหัวข้อ จากนั้นอธิบายสถานการณ์ของคุณโดยละเอียด',
    vi: 'Chọn chủ đề, sau đó mô tả tình huống của bạn một cách chi tiết.',
  },
  categoryLabel: {
    ko: '어떤 주제인가요?',
    en: 'What topic?',
    ja: 'どんなテーマですか？',
    zh: '关于什么主题？',
    es: '¿Qué tema?',
    fr: 'Quel sujet ?',
    th: 'หัวข้ออะไร?',
    vi: 'Chủ đề gì?',
  },
  detailLabel: {
    ko: '구체적으로 어떤 상황인지 알려주세요',
    en: 'Describe your situation',
    ja: '具体的な状況を教えてください',
    zh: '请描述您的具体情况',
    es: 'Describe tu situación',
    fr: 'Décrivez votre situation',
    th: 'อธิบายสถานการณ์ของคุณ',
    vi: 'Mô tả tình huống của bạn',
  },
  placeholder: {
    love:    { ko: '예) 3년 사귄 남자친구와 최근 자주 다투고 있어요. 이 관계를 계속해야 할지 헤어져야 할지 모르겠어요.', en: 'e.g. I\'ve been with my partner for 3 years but we argue constantly lately. Should I stay or move on?' },
    money:   { ko: '예) 이직을 고려 중인데 연봉이 낮아질 수도 있어요. 지금 이 결정이 재정적으로 괜찮을지 궁금해요.', en: 'e.g. I\'m considering a job change but the salary might drop. Will this decision be financially okay?' },
    family:  { ko: '예) 부모님과 의견 충돌이 잦아졌어요. 독립을 원하지만 가족과의 관계가 걱정됩니다.', en: 'e.g. I\'ve been clashing with my parents a lot. I want independence but worry about our relationship.' },
    future:  { ko: '예) 지금 다니는 회사를 그만두고 창업을 하고 싶은데 두렵습니다. 어떤 선택이 맞는지 알고 싶어요.', en: 'e.g. I want to quit my job and start a business but I\'m scared. I need guidance on which path to take.' },
    work:    { ko: '예) 직장에서 승진이 계속 안 되고 있어요. 이 회사에 계속 있어야 할지, 이직을 해야 할지 모르겠어요.', en: 'e.g. I keep getting passed over for promotions. Should I stay at this company or look for something new?' },
    relation:{ ko: '예) 친한 친구와 오해로 사이가 멀어졌어요. 먼저 다가가야 할지, 기다려야 할지 모르겠어요.', en: 'e.g. A misunderstanding has distanced me from a close friend. Should I reach out first or wait?' },
    other:   { ko: '지금 가장 궁금한 것, 가장 힘든 것을 자유롭게 써주세요.', en: 'Write freely about what\'s on your mind — your biggest question or struggle right now.' },
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
  selectFirst: {
    ko: '먼저 주제를 선택해주세요',
    en: 'Please select a topic first',
    ja: 'まずテーマを選んでください',
    zh: '请先选择主题',
    es: 'Por favor selecciona un tema primero',
    fr: 'Veuillez d\'abord choisir un sujet',
    th: 'กรุณาเลือกหัวข้อก่อน',
    vi: 'Vui lòng chọn chủ đề trước',
  },
  minCharsHint: {
    ko: (n) => `${MIN_CHARS - n}자 더 작성해주세요`,
    en: (n) => `${MIN_CHARS - n} more characters needed`,
    ja: (n) => `あと${MIN_CHARS - n}文字入力してください`,
    zh: (n) => `还需输入${MIN_CHARS - n}个字符`,
    es: (n) => `Faltan ${MIN_CHARS - n} caracteres`,
    fr: (n) => `Encore ${MIN_CHARS - n} caractères`,
    th: (n) => `ต้องการอีก ${MIN_CHARS - n} ตัวอักษร`,
    vi: (n) => `Cần thêm ${MIN_CHARS - n} ký tự`,
  },
};

export default function ConcernInput({ mode, onStart, onCancel }) {
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [text, setText] = useState('');

  const t = (key) => TEXT[key]?.[lang] || TEXT[key]?.en || '';
  const categories = CATEGORIES[lang] || CATEGORIES.en;

  const handleCategoryClick = (cat) => {
    if (selectedCategory?.id === cat.id) return;
    setSelectedCategory(cat);
    setText('');
  };

  const handleTextChange = (e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setText(e.target.value);
    }
  };

  const getPlaceholder = () => {
    if (!selectedCategory) return '';
    const p = TEXT.placeholder[selectedCategory.id];
    return p?.[lang] || p?.en || '';
  };

  const isReady = selectedCategory && text.trim().length >= MIN_CHARS;

  const handleStart = () => {
    if (!isReady) return;
    const categoryLabel = selectedCategory.id !== 'other'
      ? `[${selectedCategory.label.replace(/^.{2}\s/, '')}] `
      : '';
    onStart(categoryLabel + text.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-tarot-dark">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-tarot-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔮</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            {t('title')}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">

          {/* Step 1: Category */}
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            01 · {t('categoryLabel')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-7">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all border ${
                    isSelected
                      ? 'bg-tarot-secondary/30 border-tarot-secondary text-white shadow-[0_0_12px_rgba(122,77,255,0.4)]'
                      : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Step 2: Detail text */}
          <p className={`text-xs uppercase tracking-wider mb-3 transition-colors ${selectedCategory ? 'text-gray-500' : 'text-gray-700'}`}>
            02 · {t('detailLabel')}
          </p>
          <div className="relative">
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder={selectedCategory ? getPlaceholder() : t('selectFirst')}
              disabled={!selectedCategory}
              rows={4}
              className={`w-full bg-black/30 border rounded-xl p-4 text-white text-sm leading-relaxed resize-none outline-none transition-all placeholder-gray-600 ${
                selectedCategory
                  ? 'border-white/10 focus:border-tarot-secondary/60'
                  : 'border-white/5 cursor-not-allowed opacity-40'
              }`}
            />
            {/* Char counter */}
            {selectedCategory && (
              <span className={`absolute bottom-3 right-3 text-xs ${text.length >= MAX_CHARS ? 'text-red-400' : 'text-gray-600'}`}>
                {text.length} / {MAX_CHARS}
              </span>
            )}
          </div>

          {/* Validation hint */}
          <div className="h-5 mt-1.5 mb-5">
            {selectedCategory && text.trim().length > 0 && text.trim().length < MIN_CHARS && (
              <p className="text-xs text-yellow-500/80">
                {typeof TEXT.minCharsHint[lang] === 'function'
                  ? TEXT.minCharsHint[lang](text.trim().length)
                  : TEXT.minCharsHint.en(text.trim().length)}
              </p>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleStart}
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
