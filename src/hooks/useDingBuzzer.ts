import { useRef } from "react";

export default function useDingBuzzer() {



  const rightSoundRef = useRef(new Audio("/right.mp3"));
  const wrongSoundRef = useRef(new Audio("/wrong.mp3"));

  const playDing = () => {
    rightSoundRef.current.currentTime = 0;
    rightSoundRef.current.play();
  };

  const playBuzzer = () => {
    wrongSoundRef.current.currentTime = 0;
    wrongSoundRef.current.play();
  };

  return { playDing, playBuzzer };
}
