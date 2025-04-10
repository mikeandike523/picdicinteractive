import React, { useState, useEffect } from 'react';
import './App.css';

// Type for the bounding box (4 numbers: [x, y, width, height])
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

// Page component that displays the full-size image with red bounding boxes
const Page: React.FC<{ data: PageData }> = ({ data }) => {
  return (
    // Container enables scrolling if the image exceeds the viewport size
    <div style={{ position: 'relative', overflow: 'auto' }}>
      <img src={data.page_image} alt="Page" style={{ display: 'block' }} />
      {data.annotations.map((ann, idx) => {
        const [x, y, width, height] = ann.bbox;
        const style: React.CSSProperties = {
          position: 'absolute',
          left: x,
          top: y,
          width: width,
          height: height,
          border: '2px solid red',
          pointerEvents: 'none' // Allows interactions with the image behind
        };
        return <div key={idx} style={style} />;
      })}
    </div>
  );
};

const App: React.FC = () => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch the JSON data from the public directory when the component mounts.
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

  return (
    <div className="App">
      <Page data={pageData} />
    </div>
  );
};

export default App;
