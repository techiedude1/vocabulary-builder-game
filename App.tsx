
import React, { useState, useEffect, useCallback } from 'react';
import { fetchVocabularyQuestion } from './services/geminiService';
import { VocabularyQuestion, GameState, SentenceStatus } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import SentenceCard from './components/SentenceCard';

const MAX_ATTEMPTS = 2;

const App: React.FC = () => {
  const [question, setQuestion] = useState<VocabularyQuestion | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(MAX_ATTEMPTS);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const loadNewQuestion = useCallback(async () => {
    setGameState(GameState.LOADING);
    setError(null);
    setFeedback('');
    setSelectedSentenceIndex(null);
    setQuestion(null);
    try {
      const fetchedQuestion = await fetchVocabularyQuestion();
      setQuestion(fetchedQuestion);
      setAttemptsLeft(MAX_ATTEMPTS);
      setGameState(GameState.PLAYING);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching the question.");
      setGameState(GameState.ERROR);
    }
  }, []);

  useEffect(() => {
    loadNewQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadNewQuestion]); // loadNewQuestion is memoized, so this runs once on mount correctly.

  const handleSentenceSelect = (index: number) => {
    if (gameState !== GameState.PLAYING || !question) return;

    setSelectedSentenceIndex(index);

    if (index === question.correctSentenceIndex) {
      setFeedback(`Correct! "${question.word}" is the right fit. ${question.explanation}`);
      setGameState(GameState.SHOWING_RESULT);
    } else {
      const newAttemptsLeft = attemptsLeft - 1;
      setAttemptsLeft(newAttemptsLeft);
      if (newAttemptsLeft > 0) {
        setFeedback("Not quite! That doesn't seem right. Try one more time.");
        // gameState remains PLAYING
      } else {
        setFeedback(
          `Oops! The correct answer was sentence #${question.correctSentenceIndex + 1}. 
          The word "${question.word}" means: ${question.explanation}`
        );
        setGameState(GameState.SHOWING_RESULT);
      }
    }
  };

  const getSentenceStatus = (index: number): SentenceStatus => {
    if (!question) return 'disabled';

    if (gameState === GameState.PLAYING) {
      return index === selectedSentenceIndex && attemptsLeft < MAX_ATTEMPTS ? 'selected' : 'default';
    }

    if (gameState === GameState.SHOWING_RESULT) {
      if (index === question.correctSentenceIndex) return 'correct';
      if (index === selectedSentenceIndex) return 'incorrect'; // Only mark the last selected incorrect one
      return 'disabled'; // Other sentences are disabled and neutral
    }
    return 'default';
  };
  
  const renderContent = () => {
    if (gameState === GameState.LOADING) {
      return <LoadingSpinner />;
    }

    if (gameState === GameState.ERROR) {
      return (
        <div className="text-center p-8 bg-red-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Oh no! Something went wrong.</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={loadNewQuestion}
            className="px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow hover:bg-sky-600 transition duration-150"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!question) {
      return <p className="text-center text-gray-600">No question loaded yet.</p>;
    }

    return (
      <>
        <div className="mb-8 text-center">
          <p className="text-lg text-gray-600 mb-2">Which sentence best fits the word:</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-sky-700 tracking-tight">{question.word}</h2>
        </div>

        <div className="space-y-4 mb-8">
          {question.sentences.map((sentence, index) => {
            let sentenceText = sentence;
            if (gameState === GameState.SHOWING_RESULT && index === question.correctSentenceIndex) {
              sentenceText = sentence.replace("_____", `<strong>${question.word}</strong>`);
            }
            return (
              <SentenceCard
                key={index}
                text={gameState === GameState.SHOWING_RESULT && index === question.correctSentenceIndex ? sentence.replace("_____", question.word) : sentence}
                onClick={() => handleSentenceSelect(index)}
                status={getSentenceStatus(index)}
                isDisabled={gameState !== GameState.PLAYING}
              />
            );
          })}
        </div>
        
        {feedback && (
          <div className={`p-4 mb-6 rounded-lg shadow ${gameState === GameState.SHOWING_RESULT && selectedSentenceIndex === question.correctSentenceIndex ? 'bg-green-100 text-green-700' : gameState === GameState.SHOWING_RESULT ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
            <p className="font-medium">{feedback}</p>
          </div>
        )}

        {gameState === GameState.SHOWING_RESULT && (
          <div className="text-center mt-8">
            <button
              onClick={loadNewQuestion}
              className="px-8 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition duration-150 text-lg"
            >
              Next Word
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <header className="mb-8 sm:mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-sky-800">Vocabulary Builder</h1>
        <p className="text-lg text-sky-600 mt-2">A fun game to expand your word power!</p>
      </header>
      <main className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        {renderContent()}
      </main>
      <footer className="mt-12 text-center text-sm text-sky-700">
        <p>&copy; {new Date().getFullYear()} Vocabulary Fun. Powered by Gemini.</p>
      </footer>
    </div>
  );
};

export default App;

    