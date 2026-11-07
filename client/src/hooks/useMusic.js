import { useCallback, useEffect, useRef, useState } from 'react';

// Trình duyệt chỉ cho phát nhạc sau một cú chạm của người dùng,
// nên play() được gọi từ nút "Chạm để mở thiệp".
export function useMusic(src, volume = 0.5) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume;
    audio.preload = 'auto';
    audio.addEventListener('error', () => setAvailable(false));
    audio.src = src;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, [src, volume]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause]);

  return { playing, available, play, pause, toggle };
}
