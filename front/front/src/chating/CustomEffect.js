import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

const CustomTypingEffect = ({ text, speed, onComplete, scrollToBottom }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }

    const typeCharacter = () => {
      const nextChar = text.charAt(currentIndex);
      setDisplayedText((prev) => prev + nextChar);
      setCurrentIndex((prev) => prev + 1);

      if (nextChar === '\n') {
        scrollToBottom();
      }
    };

    if (currentIndex < text.length) {
      const timeoutId = setTimeout(typeCharacter, speed);
      return () => clearTimeout(timeoutId);
    } else {
      if (onComplete) onComplete();
    }
  }, [text, speed, currentIndex, onComplete, scrollToBottom]);

  return <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayedText) }} />;
};

export default CustomTypingEffect;
