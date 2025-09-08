import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Mic, MicOff, Play, Pause, Send } from 'lucide-react';

interface VoiceMessageProps {
  onSendVoiceMessage: (duration: number, waveform: number[]) => void;
  onCancel: () => void;
}

export function VoiceMessage({ onSendVoiceMessage, onCancel }: VoiceMessageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveform, setWaveform] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Generate mock waveform data
      const mockWaveform: number[] = [];
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
        // Generate random amplitude for waveform visualization
        mockWaveform.push(Math.random() * 100);
        setWaveform([...mockWaveform]);
      }, 100);

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioBlob && !isPlaying) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current = audio;
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const sendVoiceMessage = () => {
    if (audioBlob) {
      onSendVoiceMessage(duration, waveform);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 rounded-lg p-4 mx-4 mb-4"
    >
      <div className="flex items-center space-x-3">
        {!audioBlob ? (
          <>
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              className={`rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <div className="flex-1">
              {isRecording ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {waveform.slice(-20).map((amplitude, index) => (
                      <motion.div
                        key={index}
                        animate={{ height: `${Math.max(4, amplitude * 0.3)}px` }}
                        className="w-1 bg-blue-500 rounded-full"
                        style={{ minHeight: '4px' }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600">{formatDuration(Math.floor(duration / 10))}</span>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              ) : (
                <p className="text-sm text-slate-600">Tap to start recording</p>
              )}
            </div>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={playAudio}
              className="rounded-full"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <div className="flex-1 flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {waveform.slice(0, 30).map((amplitude, index) => (
                  <div
                    key={index}
                    className="w-1 bg-blue-400 rounded-full"
                    style={{ height: `${Math.max(4, amplitude * 0.2)}px` }}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600">{formatDuration(Math.floor(duration / 10))}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="text-slate-600"
            >
              Cancel
            </Button>
            
            <Button
              size="sm"
              onClick={sendVoiceMessage}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}