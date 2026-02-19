
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatBubble } from './components/ChatMessage';
import { Stats } from './components/Stats';
import { generateRound } from './services/geminiService';
import { GameState, RoundData, FallacyType, ChatMessage } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    morale: 70,
    progress: 10,
    conflict: 20,
    roundCount: 1,
    score: 0,
    currentStep: 0,
    history: [],
    currentRound: null,
    gameStatus: 'loading',
    lastFeedback: null,
    isCorrect: false,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.history, state.gameStatus]);

  const loadNextRound = useCallback(async () => {
    setState(prev => ({ ...prev, gameStatus: 'loading' }));
    try {
      const nextRound = await generateRound(state.roundCount);
      const firstMsg = nextRound.scene[0];
      
      setState(prev => {
        const newHistory = [...prev.history];
        // If it's not the first round, add a divider
        if (prev.roundCount > 1) {
          newHistory.push({ sender: 'SYSTEM', text: `________ Round ${prev.roundCount} ________`, isDivider: true });
        }
        newHistory.push(firstMsg);
        
        return {
          ...prev,
          currentRound: nextRound,
          currentStep: 0,
          gameStatus: 'playing',
          history: newHistory,
        };
      });
    } catch (err) {
      console.error("Round Load Failure", err);
    }
  }, [state.roundCount]);

  useEffect(() => {
    loadNextRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReaction = (type: 'neutral' | 'fallacy') => {
    if (!state.currentRound) return;

    const currentMsg = state.currentRound.scene[state.currentStep];
    const isActuallyFallacy = state.currentRound.fallacyLocation.includes(currentMsg.text);

    if (type === 'neutral') {
      if (isActuallyFallacy) {
        // Missed it!
        setState(prev => ({
          ...prev,
          morale: Math.max(0, prev.morale - 10),
          conflict: Math.min(100, prev.conflict + 10),
          lastFeedback: state.currentRound!.consequences.missedFlag,
          isCorrect: false,
          gameStatus: 'feedback'
        }));
      } else {
        // Correctly passed a normal message
        proceedToNextStep();
      }
    } else {
      // Flagged as fallacy (❗)
      if (isActuallyFallacy) {
        setState(prev => ({ ...prev, gameStatus: 'questioning' }));
      } else {
        // False Alarm
        setState(prev => ({
          ...prev,
          morale: Math.max(0, prev.morale - 5),
          conflict: Math.min(100, prev.conflict + 5),
          lastFeedback: "Wait, this seems like a standard update or valid concern. You're being a bit too jumpy with the flags!",
          isCorrect: false,
          gameStatus: 'feedback'
        }));
      }
    }
  };

  const handleQuestionAnswer = (optionIndex: number) => {
    if (!state.currentRound) return;
    const option = state.currentRound.fallacyQuestion.options[optionIndex];

    let dMorale = 0, dProgress = 0, dConflict = 0;
    let scoreIncrement = 0;

    if (option.isCorrect) {
      dMorale += 10; dProgress += 15; dConflict -= 10;
      scoreIncrement = 1;
    } else {
      dMorale -= 10; dConflict += 15;
    }

    setState(prev => ({
      ...prev,
      score: prev.score + scoreIncrement,
      lastFeedback: option.isCorrect ? state.currentRound!.consequences.correctFlag : state.currentRound!.consequences.wrongFlag,
      isCorrect: option.isCorrect,
      gameStatus: 'feedback',
      morale: Math.max(0, Math.min(100, prev.morale + dMorale)),
      progress: Math.max(0, Math.min(100, prev.progress + dProgress)),
      conflict: Math.max(0, Math.min(100, prev.conflict + dConflict)),
    }));
  };

  const proceedToNextStep = () => {
    if (!state.currentRound) return;

    const nextStep = state.currentStep + 1;
    if (nextStep < state.currentRound.scene.length) {
      setState(prev => ({
        ...prev,
        currentStep: nextStep,
        gameStatus: 'playing',
        lastFeedback: null,
        history: [...prev.history, state.currentRound!.scene[nextStep]]
      }));
    } else {
      // End of the current round
      if (state.roundCount >= 3) {
        setState(prev => ({ ...prev, gameStatus: 'finished' }));
      } else {
        setState(prev => ({
          ...prev,
          roundCount: prev.roundCount + 1,
          lastFeedback: null,
        }));
      }
    }
  };

  // Re-run loadNextRound whenever roundCount increases
  useEffect(() => {
    if (state.roundCount > 1 && state.roundCount <= 3) {
      loadNextRound();
    }
  }, [state.roundCount, loadNextRound]);

  const isFallacyMessage = (msg: ChatMessage) => {
    if (state.gameStatus !== 'feedback' || !state.currentRound) return false;
    const currentMsgText = state.currentRound.scene[state.currentStep].text;
    return state.currentRound.fallacyLocation.includes(msg.text) && msg.text === currentMsgText && state.isCorrect;
  };

  if (state.gameStatus === 'finished') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md border border-slate-200 animate-fade-in-up">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Game End</h1>
          
          <div className="mb-8">
            <div className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Your Logic Score</div>
            <div className="text-7xl font-black text-slate-900">
              {state.score}<span className="text-slate-300">/3</span>
            </div>
          </div>

          <div className="space-y-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
             <div className="flex justify-between items-center">
               <span className="text-sm font-semibold text-slate-600">Final Team Morale:</span> 
               <span className={`font-bold ${state.morale > 50 ? 'text-emerald-600' : 'text-rose-600'}`}>{state.morale}%</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm font-semibold text-slate-600">Final Conflict Level:</span> 
               <span className={`font-bold ${state.conflict < 40 ? 'text-emerald-600' : 'text-rose-600'}`}>{state.conflict}%</span>
             </div>
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-1 active:translate-y-0"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-slate-50 shadow-2xl overflow-hidden relative border-x border-slate-200">
      <div className="bg-indigo-600 text-white p-4 flex items-center justify-between shadow-lg z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-400 rounded-full flex items-center justify-center font-bold ring-2 ring-white/20">GC</div>
          <div>
            <h1 className="font-bold text-sm">Group Project (4)</h1>
            <p className="text-[10px] opacity-80 uppercase tracking-widest font-medium">Active Now • Round {state.roundCount}/3</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <Stats morale={state.morale} progress={state.progress} conflict={state.conflict} />

      <div className="flex-1 overflow-y-auto p-4 chat-container bg-slate-100 space-y-1">
        {state.history.map((msg, i) => {
          if (msg.isDivider) {
            return (
              <div key={i} className="flex items-center justify-center py-8 opacity-40">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">{msg.text}</span>
              </div>
            );
          }
          return (
            <ChatBubble 
              key={i}
              sender={msg.sender} 
              text={msg.text} 
              isPlayer={msg.isPlayer} 
              highlight={isFallacyMessage(msg)}
              fallacyType={isFallacyMessage(msg) ? state.currentRound?.fallacyType : undefined}
              showReactions={state.gameStatus === 'playing' && i === state.history.length - 1}
              onReact={handleReaction}
            />
          );
        })}
        {state.gameStatus === 'loading' && <div className="text-gray-400 text-xs italic ml-2 mt-4 animate-pulse">Syncing chat logs...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="bg-white p-4 border-t border-gray-100 shadow-2xl z-20 min-h-[140px] flex flex-col justify-center">
        {state.gameStatus === 'playing' && (
          <div className="text-center p-2">
            <p className="text-xs font-semibold text-gray-400 animate-pulse uppercase tracking-wider">React to the latest message above</p>
          </div>
        )}

        {state.gameStatus === 'questioning' && state.currentRound && (
          <div className="animate-fade-in-up">
            <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded flex items-center justify-center text-xs">❗</span>
              {state.currentRound.fallacyQuestion.questionText}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {state.currentRound.fallacyQuestion.options.map((opt, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleQuestionAnswer(idx)}
                  className="w-full p-3 text-left text-xs bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all active:scale-[0.98] group flex gap-3"
                >
                  <span className="w-5 h-5 bg-white border border-slate-200 rounded text-[10px] font-bold flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white shrink-0">{String.fromCharCode(65 + idx)}</span>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.gameStatus === 'feedback' && (
          <div className="animate-fade-in-up">
            <div className={`p-4 rounded-2xl mb-4 border-2 ${state.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-rose-50 border-rose-100 text-rose-900'}`}>
              <div className="flex items-center gap-2 font-bold mb-2">
                <i className={`fas ${state.isCorrect ? 'fa-check-circle text-emerald-500' : 'fa-exclamation-circle text-rose-500'}`}></i>
                {state.isCorrect ? "Correct Identification" : "Logic Error"}
              </div>
              <p className="text-sm leading-relaxed">{state.lastFeedback}</p>
            </div>
            <button 
              onClick={proceedToNextStep}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition flex items-center justify-center gap-2 shadow-xl"
            >
              Continue Chat <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
