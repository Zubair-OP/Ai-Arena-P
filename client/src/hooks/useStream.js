import { useState, useEffect, useCallback } from 'react';

export function useStream(socket) {
  const [modelAText, setModelAText] = useState('');
  const [modelBText, setModelBText] = useState('');
  const [judgeText, setJudgeText] = useState('');
  const [ratings, setRatings] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamPhase, setStreamPhase] = useState(null);

  const resetStream = useCallback(() => {
    setModelAText('');
    setModelBText('');
    setJudgeText('');
    setRatings(null);
    setWinner(null);
    setIsStreaming(false);
    setStreamPhase(null);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onStreamStart = () => {
      setIsStreaming(true);
      setStreamPhase('models');
      setModelAText('');
      setModelBText('');
      setJudgeText('');
      setRatings(null);
      setWinner(null);
    };

    const onTokenA = ({ token }) => {
      setModelAText((prev) => prev + token);
    };

    const onTokenB = ({ token }) => {
      setModelBText((prev) => prev + token);
    };

    const onJudgeStart = () => {
      setStreamPhase('judge');
    };

    const onComplete = ({ ratings: r, winner: w, reasoning }) => {
      setRatings(r);
      setWinner(w);
      setJudgeText(reasoning || '');
      setIsStreaming(false);
      setStreamPhase('complete');
    };

    socket.on('stream_start', onStreamStart);
    socket.on('responseA_token', onTokenA);
    socket.on('responseB_token', onTokenB);
    socket.on('judge_start', onJudgeStart);
    socket.on('arena_complete', onComplete);

    return () => {
      socket.off('stream_start', onStreamStart);
      socket.off('responseA_token', onTokenA);
      socket.off('responseB_token', onTokenB);
      socket.off('judge_start', onJudgeStart);
      socket.off('arena_complete', onComplete);
    };
  }, [socket]);

  return {
    modelAText,
    modelBText,
    judgeText,
    ratings,
    winner,
    isStreaming,
    streamPhase,
    resetStream,
  };
}
