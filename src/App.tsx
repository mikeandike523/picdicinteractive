import React, { RefObject, useEffect, useState, useRef } from 'react';
import { DndProvider, DropTargetMonitor, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';

// Type for the bounding box (assumed to always have 4 numbers)
type BBox = [number, number, number, number];

// Interface for each annotation from the JSON
interface Annotation {
  bbox: BBox;
  text: string;
}

// Interface for the page data
interface PageData {
  page_image: string;
  annotations: Annotation[];
}

// Type for the drag item
interface DragItem {
  id: number;
  word: string;
}

// Draggable word component using react-dnd's useDrag hook
interface DraggableWordProps {
  word: string;
  id: number;
}

const DraggableWord: React.FC<DraggableWordProps> = ({ word, id }) => {
  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>(() => ({
    type: 'word',
    item: { id, word },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as unknown as RefObject<HTMLDivElement>}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        margin: '5px',
        padding: '15px', // Increased padding for larger word bank items
        border: '1px solid #333',
        borderRadius: '4px',
        display: 'inline-block',
        fontSize: '24px', // Larger font size for word bank text
      }}
    >
      {word}
    </div>
  );
};

// Type for the dropped result, including correctness flag.
interface DroppedResult {
  word: string;
  isCorrect: boolean;
}

// Drop zone component for each bounding box area on the image
interface DropZoneProps {
  annotation: Annotation;
  onDropWord: (annotation: Annotation, item: DragItem) => void;
  droppedResult?: DroppedResult;
}

const DropZone: React.FC<DropZoneProps> = ({ annotation, onDropWord, droppedResult }) => {
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>(() => ({
    accept: 'word',
    drop: (item: DragItem, monitor: DropTargetMonitor) => {
      onDropWord(annotation, item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // Use the bbox values directly (with x adjusted in Page component)
  const [x, y, width, height] = annotation.bbox;

  // Determine background and border styles based on drop state.
  let backgroundColor = 'rgba(0, 0, 0, 0.5)';
  let borderStyle = '2px dashed blue';
  if (droppedResult) {
    backgroundColor = droppedResult.isCorrect
      ? 'rgba(0, 255, 0, 0.7)'
      : 'rgba(255, 0, 0, 0.7)';
    borderStyle = '2px solid ' + (droppedResult.isCorrect ? 'green' : 'red');
  } else if (isOver) {
    backgroundColor = 'rgba(144,238,144, 0.5)';
  }

  const style: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    width: width,
    height: height,
    border: borderStyle,
    backgroundColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'all',
    fontSize: '20px',
    color: 'white',
    textShadow: '1px 1px 2px black',
  };

  return (
    <div ref={drop as unknown as RefObject<HTMLDivElement>} style={style}>
      {droppedResult ? droppedResult.word : ''}
    </div>
  );
};

interface PageProps {
  data: PageData;
  onDrop: (annotation: Annotation, item: DragItem) => void;
  dropped: Record<string, DroppedResult>;
}

// The Page component now calculates the image's left offset
// and adjusts the bounding box positions accordingly.
const Page: React.FC<PageProps> = ({ data, onDrop, dropped }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageOffset, setImageOffset] = useState(0);

  const updateImageOffset = () => {
    if (containerRef.current && imageRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const imageWidth = imageRef.current.clientWidth;
      const offset = (containerWidth - imageWidth) / 2;
      setImageOffset(offset);
    }
  };

  useEffect(() => {
    updateImageOffset();
    window.addEventListener('resize', updateImageOffset);
    return () => {
      window.removeEventListener('resize', updateImageOffset);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', overflow: 'auto', maxHeight: '80vh', width: '100%' }}
    >
      <img
        ref={imageRef}
        src={data.page_image}
        alt="Page"
        onLoad={updateImageOffset}
        style={{ display: 'block', margin: '0 auto', width: '100%', height: 'auto' }}
      />
      {data.annotations.map((ann) => {
        const key = ann.text + '-' + ann.bbox.join('-');
        // Adjust the x coordinate of the bounding box by the image offset.
        const [x, y, width, height] = ann.bbox;
        const adjustedBBox: BBox = [x/1.3, y/1.3, width/1.3, height/1.3];
        return (
          <DropZone
            key={key}
            annotation={{ ...ann, bbox: adjustedBBox }}
            onDropWord={onDrop}
            droppedResult={dropped[key]}
          />
        );
      })}
    </div>
  );
};

interface WordBankProps {
  words: { id: number; word: string }[];
}

// The WordBank component is rendered outside the scrolling image container.
const WordBank: React.FC<WordBankProps> = ({ words }) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '20px',
        borderTop: '1px solid #ccc',
      }}
    >
      {words.map((item) => (
        <DraggableWord key={item.id} word={item.word} id={item.id} />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dropped, setDropped] = useState<Record<string, DroppedResult>>({});

  useEffect(() => {
    fetch('/page_006.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch JSON data');
        }
        return response.json();
      })
      .then((data: PageData) => setPageData(data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div>Error loading page data: {error}</div>;
  }

  if (!pageData) {
    return <div>Loading...</div>;
  }

  const wordList = pageData.annotations.map((ann, idx) => ({ id: idx, word: ann.text }));

  const handleDrop = (annotation: Annotation, item: DragItem) => {
    const key = annotation.text + '-' + annotation.bbox.join('-');
    const isCorrect =
      item.word.trim().toLowerCase() === annotation.text.trim().toLowerCase();
    setDropped((prev) => ({ ...prev, [key]: { word: item.word, isCorrect } }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="App"
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <h1 style={{ textAlign: 'center' }}>Drag and Drop Literacy Exercise</h1>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Page data={pageData} onDrop={handleDrop} dropped={dropped} />
        </div>
        <WordBank words={wordList} />
      </div>
    </DndProvider>
  );
};

export default App;
