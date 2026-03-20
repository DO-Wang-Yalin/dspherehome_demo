import { useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { questions } from './data/questions';
import { QuestionCard } from './components/QuestionCard';
import { ProgressBar } from './components/ProgressBar';
import { ResultPage } from './components/ResultPage';

type HomeStyleEvalProps = {
  onGoDeepEval?: () => void;
  /** 需求书补齐流程：结果页主按钮文案（默认引导去线索页） */
  deepEvalButtonLabel?: string;
  onGoHome?: () => void;
  /** 受控子页：0..questions.length-1 为题目，questions.length 为结果页；与 onPageChange 一起由目录跳转使用 */
  controlledPageIndex?: number;
  onPageChange?: (nextPageIndex: number) => void;
  /** 风格测评结果就绪时写入 FormData */
  onStyleResult?: (result: { styleId: string; styleName: string; colorGene: string; styleSuggestions: string }) => void;
};

export function HomeStyleEval({
  onGoDeepEval,
  deepEvalButtonLabel,
  onGoHome,
  controlledPageIndex,
  onPageChange,
  onStyleResult,
}: HomeStyleEvalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const isControlled = controlledPageIndex !== undefined && onPageChange !== undefined;
  const pageIndex = isControlled ? controlledPageIndex! : (showResult ? questions.length : currentIndex);
  const showResultPage = pageIndex >= questions.length;
  const currentQuestion = useMemo(() => questions[pageIndex] as typeof questions[0] | undefined, [pageIndex]);

  /** 严格位于当前题之前的、已作答题目数（本题答完并进入下一题后，上一题才计入） */
  const progressCompleted = useMemo(
    () =>
      questions.slice(0, pageIndex).filter((q) => (answers[q.id]?.length ?? 0) > 0).length,
    [answers, pageIndex]
  );

  const handleNext = () => {
    if (isControlled) {
      onPageChange!(Math.min(pageIndex + 1, questions.length));
    } else if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (isControlled) {
      onPageChange!(Math.max(pageIndex - 1, 0));
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    if (isControlled) onPageChange!(0);
    setCurrentIndex(0);
    setAnswers({});
    setTextAnswers({});
    setShowResult(false);
  };

  const canProceed = () => {
    if (!currentQuestion) return true;
    const currentAns = answers[currentQuestion.id];
    if (currentQuestion.type === 'single') {
      return currentAns && currentAns.length > 0;
    }
    return true;
  };

  const handleOptionSelect = (optionId: string) => {
    setAnswers((prev) => {
      const currentAnswers = prev[currentQuestion.id] || [];
      if (currentQuestion.type === 'single') return { ...prev, [currentQuestion.id]: [optionId] };
      if (currentAnswers.includes(optionId)) return { ...prev, [currentQuestion.id]: currentAnswers.filter((id) => id !== optionId) };
      return { ...prev, [currentQuestion.id]: [...currentAnswers, optionId] };
    });

    if (currentQuestion?.type === 'single') {
      setTimeout(() => handleNext(), 400);
    }
  };

  const handleTextChange = (text: string) => {
    if (currentQuestion) setTextAnswers((prev) => ({ ...prev, [currentQuestion.id]: text }));
  };

  return (
    <div className="min-h-screen bg-transparent text-stone-800 font-sans antialiased selection:bg-orange-200 selection:text-stone-900">
      <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 lg:px-12 py-8 md:py-12 lg:py-16">
        {onGoHome && (
          <div className="mb-6 md:mb-8">
            <button
              type="button"
              onClick={onGoHome}
              aria-label="返回欢迎页"
              title="返回欢迎页"
              className="w-11 h-11 rounded-full bg-white shadow-sm border border-stone-200/80 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <Home size={20} strokeWidth={2} />
            </button>
          </div>
        )}
        <AnimatePresence mode="wait">
          {showResultPage ? (
            <div key="result">
              <ResultPage
                answers={answers}
                textAnswers={textAnswers}
                onRestart={handleRestart}
                onGoDeepEval={onGoDeepEval}
                deepEvalButtonLabel={deepEvalButtonLabel}
                onStyleResult={onStyleResult}
              />
            </div>
          ) : currentQuestion ? (
            <div key="question-container" className="w-full">
              <ProgressBar completed={progressCompleted} total={questions.length} />

              <AnimatePresence mode="wait">
                <div key={currentQuestion.id}>
                  <QuestionCard
                    question={currentQuestion}
                    selectedOptions={answers[currentQuestion.id] || []}
                    textAnswer={textAnswers[currentQuestion.id]}
                    onOptionSelect={handleOptionSelect}
                    onTextChange={handleTextChange}
                  />
                </div>
              </AnimatePresence>

              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 w-full max-w-5xl mx-auto mt-12 md:mt-16 pt-6 md:pt-8 border-t border-stone-200/50">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={pageIndex === 0}
                  className={`flex items-center justify-center gap-2 px-7 md:px-8 py-3.5 md:py-4 rounded-full text-base md:text-[1.0625rem] font-semibold transition-colors ${
                    pageIndex === 0
                      ? 'text-stone-300 cursor-not-allowed bg-stone-50/50'
                      : 'text-stone-700 bg-stone-100/80 hover:bg-stone-200/90 hover:text-stone-900'
                  }`}
                >
                  <ArrowLeft size={20} strokeWidth={2} />
                  上一题
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`flex items-center justify-center gap-2 px-9 md:px-10 py-3.5 md:py-4 rounded-full text-base md:text-[1.0625rem] font-semibold transition-all ${
                    !canProceed()
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-[#EF6B00] text-white hover:bg-[#D85F00] shadow-lg shadow-[#EF6B00]/25 hover:shadow-xl'
                  }`}
                >
                  {pageIndex === questions.length - 1 ? '查看结果' : '下一题'}
                  <ArrowRight size={20} strokeWidth={2} />
                </button>
              </div>
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

