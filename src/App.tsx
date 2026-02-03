import { css } from "@emotion/react";
import _ from "lodash";
import { HTML5toTouch } from "rdndmb-html5-to-touch"; // or any other pipeline
import {
  ChangeEvent,
  Dispatch,
  forwardRef,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDrag, useDrop } from "react-dnd";
import { DndProvider } from "react-dnd-multi-backend";
import { MdArrowBack, MdArrowForward, MdHome } from "react-icons/md";
import { useParams } from "react-router";
import { Button, Div, DivProps, H1, Img, Select, Span } from "style-props-html";
import LoadingSpinner from "./components/LoadingSpinner";
import useDingBuzzer from "./hooks/useDingBuzzer";
import useTransformJsonData from "./hooks/useTransformData";
import shuffleArray from "shuffle-array"

// The amounts of extra room on each side to add to the bboxes/drop targets to make them a little less tight
// OCR was used to get bounding boxes and the boxes are too tight to look good
// These are in original units from the image (not css units)
const EXPAND_X_PX = 20;
const EXPAND_Y_PX = 20;

interface Annotation {
  // x, y, w, h
  bbox: [number, number, number, number];
  text: string;
}

interface JsonData {
  page_image: string;
  width: number;
  height: number;
  annotations: Annotation[];
}


function useMeasureDivClientWidth(
  ref: RefObject<HTMLElement | null>
): number | null {
  const [clientWidth, setClientWidth] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Function to update the rect state
    const updateRect = () => {
      if (ref.current) {
        setClientWidth(ref.current.clientWidth);
      }
    };

    // Initial measurement
    updateRect();

    // Throttled update function
    const throttledUpdateRect = _.throttle(updateRect, 100, { trailing: true });

    // Try to use ResizeObserver if available
    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(throttledUpdateRect);
      resizeObserver.observe(ref.current);
    } else {
      // Fallback to window resize event
      window.addEventListener("resize", throttledUpdateRect);
    }

    const current = ref.current;

    // Cleanup function
    return () => {
      throttledUpdateRect.cancel();

      if (resizeObserver) {
        if (current) {
          resizeObserver.unobserve(current);
        }
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", throttledUpdateRect);
      }
    };
  }, [ref]);

  return clientWidth;
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
  used: boolean;
}

const DraggableWord: React.FC<DraggableWordProps> = ({ used, word, id }) => {
  const [{ isDragging }, drag] = useDrag<
    DragItem,
    void,
    { isDragging: boolean }
  >(
    () => ({
      canDrag: !used,
      type: "word",
      item: { id, word },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [used]
  );

  return (
    <div
      className="draggable"
      ref={drag as unknown as RefObject<HTMLDivElement>}
      style={{
        touchAction: "none" /* Prevent scrolling while dragging */,
        opacity: isDragging ? 0.5 : used ? 0.25 : 1,
        cursor: used ? "not-allowed" : "move",
        userSelect: "none",
        pointerEvents: "auto",
        margin: "5px",
        padding: "15px", // Increased padding for larger word bank items
        border: "1px solid #333",
        borderRadius: "4px",
        display: "inline-block",
        fontSize: "18px", // Larger font size for word bank text
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
  dragItemId: string | number;
}

// Drop zone component for each bounding box area on the image
interface DropZoneProps {
  annotation: Annotation;
  onDropWord: (annotation: Annotation, item: DragItem) => void;
  droppedResult?: DroppedResult;
  imageWidth: number;
  imageHeight: number;
  // viewerScrollHeight: number;
  viewerClientWidth: number;
  id: string | number;
  setDropped: Dispatch<
    SetStateAction<Record<string | number, DroppedResult | null>>
  >;
}

const DropZone: React.FC<DropZoneProps> = ({
  imageWidth,
  // imageHeight,
  annotation,
  onDropWord,
  droppedResult,
  // viewerScrollHeight,
  viewerClientWidth,
  id,
  setDropped,
}) => {
  // const scaleFactor =
  //   viewerScrollHeight && imageHeight ? viewerScrollHeight / imageHeight : 0;

  const scaleFactor = viewerClientWidth && imageWidth? viewerClientWidth / imageWidth : 0;

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>(
    () => ({
      accept: "word",
      drop: (item: DragItem) => {
        onDropWord(annotation, item);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    })
  );

  // Use the bbox values directly (with x adjusted in Page component)
  const [x, y, w, h] = annotation.bbox;

  const xPx = `${(x - EXPAND_X_PX) * scaleFactor}px`;
  const yPx = `${(y - EXPAND_Y_PX) * scaleFactor}px`;

  const wPx = `${(w + 2 * EXPAND_X_PX) * scaleFactor}px`;
  const hPx = `${(h + 2 * EXPAND_Y_PX) * scaleFactor}px`;

  // Determine background and border styles based on drop state.
  let backgroundColor = "rgba(255, 255, 255, 1)";
  let borderStyle = "2px dashed blue";
  if (droppedResult) {
    backgroundColor = droppedResult.isCorrect
      ? "rgba(0, 255, 0, 1)"
      : "rgba(255, 0, 0,1)";
    borderStyle = "2px solid " + (droppedResult.isCorrect ? "green" : "red");
  } else if (isOver) {
    backgroundColor = "rgba(150,150,244, 1)";
  }

  const style: React.CSSProperties = {
    zIndex: 2,
    position: "absolute",
    left: xPx,
    top: yPx,
    width: wPx,
    height: hPx,
    border: borderStyle,
    backgroundColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "all",
    fontSize: "20px",
    color: "white",
    textShadow: "1px 1px 2px black",
  };

  return (
    <div ref={drop as unknown as RefObject<HTMLDivElement>} style={style}>
      {droppedResult ? droppedResult.word : ""}

      {droppedResult && !droppedResult.isCorrect && (
        <Button
          position="absolute"
          userSelect="none"
          right="-12px"
          top="-12px"
          padding="4px"
          background="white"
          border="1px solid black"
          borderRadius="50%"
          width="24px"
          height="24px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          onClick={() => {
            setDropped((prev) => {
              return Object.fromEntries(
                Object.entries(prev).filter(([dropZoneId]) => {
                  return dropZoneId.toString() !== id.toString();
                })
              );
            });
          }}
        >
          <Span fontSize="24px">&times;</Span>
        </Button>
      )}
    </div>
  );
};

const iconButtonCss = css`
  width: 1.5rem;
  height: 1.5rem;
  background: white;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:not(:disabled):hover {
  }
  &:not(:disabled):active {
  }
  &:disabled {
    cursor: not-allowed;
    background: lightgray;
  }
`;

interface BookPageNavbarProps extends DivProps {
  catalogData: Record<number, string | undefined>;
  pageNumber: number;
}

const BookPageNavbar = forwardRef<HTMLDivElement, BookPageNavbarProps>(
  function BookPageNavbar({ pageNumber, catalogData, ...rest }, ref) {
    const navigate = (url: string) => {
      window.location.href = url;
    };
    const chapterName = catalogData[pageNumber] ?? `Page ${pageNumber}`;
    const availablePageNumbers = Object.keys(catalogData).map(Number);
    const isFirst = pageNumber === availablePageNumbers[0];
    const isLast =
      pageNumber === availablePageNumbers[availablePageNumbers.length - 1];
    return (
      <Div
        ref={ref}
        width="100%"
        background="teal"
        color="white"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        padding="0.5rem"
        {...rest}
      >
        <Div flex={1} display="flex" flexDirection="row" alignItems="center">
          <Div
            flex={1}
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap="0.5rem"
          >
            <Button
              disabled={isFirst}
              css={iconButtonCss}
              onClick={() => {
                navigate(`/${pageNumber - 1}`);
              }}
            >
              <MdArrowBack fontSize="1rem" color="teal" />
            </Button>
            <Button
              css={iconButtonCss}
              onClick={() => {
                navigate(`/`);
              }}
            >
              <MdHome fontSize="1rem" color="teal" />
            </Button>
            <Select
              marginLeft="auto"
              marginRight="0.5rem"
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                navigate(`/${e.target.value}`);
              }}
            >
              {availablePageNumbers.map((pageNumberItem) => (
                <option
                  key={pageNumberItem}
                  value={pageNumberItem}
                  selected={pageNumberItem === pageNumber}
                >
                  {pageNumberItem}
                </option>
              ))}
            </Select>
          </Div>
          <H1
            fontSize="1.5rem"
            textAlign="center"
            fontWeight="bold"
            flex={0}
            whiteSpace="nowrap"
          >
            {chapterName}
          </H1>
          <Div flex={1} display="flex" flexDirection="row" alignItems="center">
            <Button
              disabled={isLast}
              css={iconButtonCss}
              onClick={() => {
                navigate(`/${pageNumber + 1}`);
              }}
              marginLeft="auto"
            >
              <MdArrowForward fontSize="1rem" color="teal" />
            </Button>
          </Div>
        </Div>
      </Div>
    );
  }
);

export default function App() {

  // Check for render loops just in case
  console.log("App render");

  const pageNumber = Number(useParams().pageNumber!);
  // const [data, setData] = useState<JsonData | null>(null);

  const [rawData, setRawData] = useState<JsonData | null>(null);

  const transformedData = useTransformJsonData(rawData);
  
  const data = useMemo(() => {
    if (!transformedData) {
      return null;
    }
    const randomizedAnnotations = shuffleArray(transformedData.annotations);
    return {
      ...transformedData,
      annotations: randomizedAnnotations,
    }
  },[transformedData])


  const [catalogData, setCatalogData] = useState<Record<number, string> | null>(
    null
  );
  const viewerRef = useRef<HTMLDivElement | null>(null);
  // const viewerScrollHeight = useMeasureDivScrollHeight(viewerRef);
  const viewerClientWidth = useMeasureDivClientWidth(viewerRef);

  const loadData = useCallback(
    async function loadData() {
      const response = await fetch(`/static/pages/annotations/${pageNumber}.json`);
      if (response.ok) {
        setRawData(await response.json());
      }
      const response2 = await fetch("/static/pages/pageList.json");
      if (response2.ok) {
        setCatalogData(await response2.json());
      }
    },
    [pageNumber]
  );
  useEffect(() => {
    loadData();
  }, [loadData]);
  const wordBank = data ? data.annotations.map((ann) => ann.text) : null;
  // const ready = data && viewerScrollHeight && wordBank;
  const ready = data && viewerClientWidth && wordBank;

  const [dropped, setDropped] = useState<
    Record<string | number, DroppedResult | null>
  >({});

  const dingBuzzer = useDingBuzzer();
  return (
    <DndProvider options={HTML5toTouch}>
      <Div
        width="100dvw"
        height="100dvh"
        overflow="auto"
        display="grid"

        css={css`
          grid-template-rows: 60dvh 40dvh;
          grid-template-columns: 1fr;
          @media (min-aspect-ratio: 1/1) {
            grid-template-rows: 1fr;
            grid-template-columns: 60dvw 1fr;
          }
          

          
          `}
      >
        <Div
          display="grid"
          gridTemplateRows="auto 1fr"
          gridTemplateColumns="1fr"
          css={css`
          height: 60dvh;
          @media (min-aspect-ratio: 1/1) {
            height: 100dvh;
          }
            `}
        >
          {catalogData && (
            <Div zIndex={3}>
              <BookPageNavbar
                catalogData={catalogData}
                pageNumber={pageNumber}
              />
            </Div>
          )}
          <Div ref={viewerRef} overflowY={"auto"} position="relative">
            <Div position="relative" width="100%" height="auto">
              <Img
                zIndex={1}
                src={`/static/pages/images/${pageNumber}.png`}
                position="relative"
                cssWidth="100%"
                cssHeight="auto"
                objectFit="contain"
                margin="0"
                padding="0"
              />

              {ready && (
                <>
                  {data.annotations.map((ann, i) => {
                    return (
                      <DropZone
                        id={i}
                        setDropped={setDropped}
                        imageWidth={data.width}
                        imageHeight={data.height}
                        // viewerScrollHeight={viewerScrollHeight}
                        viewerClientWidth={viewerClientWidth}
                        key={i}
                        annotation={{ ...ann }}
                        onDropWord={(ann, item) => {
                          const isCorrect = ann.text === item.word;
                          if (isCorrect) {
                            dingBuzzer.playDing();
                          } else {
                            dingBuzzer.playBuzzer();
                          }
                          setDropped((prev) => ({
                            ...prev,
                            [i]: {
                              word: item.word,
                              isCorrect: ann.text === item.word,
                              dragItemId: item.id,
                            },
                          }));
                        }}
                        droppedResult={dropped[i] ?? undefined}
                      />
                    );
                  })}
                </>
              )}
            </Div>

            <Div
              zIndex={4}
              position="fixed"
              top="0"
              left="0"
              width="60dvw"
              height="100dvh"
              cursor="progress"
              background="rgba(0,0,0,0.5)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              opacity={!ready ? 1 : 0}
              pointerEvents={!ready ? "auto" : "none"}
              transition="opacity 0.25s ease-in-out"
            >
              <LoadingSpinner
                size="2.5rem"
                spinnerSize="2.25rem"
                background="white"
                borderRadius="0.25rem"
              />
            </Div>
          </Div>
        </Div>

        <Div
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="center"
          overflowY="auto"
        >
          <Div
            display="flex"
            flexDirection="row"
            flexWrap="wrap"
            alignItems="center"
            justifyContent="center"
            width="100%"
          >
            {wordBank && (
              <>
                {wordBank.map((word, i) => (
                  <DraggableWord
                    key={i}
                    word={word}
                    id={i}
                    used={
                      //  True if exists any drop result for which dragItemId is equal to i
                      dropped &&
                      Object.values(dropped).some((result) => {
                        if (!result) {
                          return false;
                        }
                        return result.dragItemId === i;
                      })
                    }
                  />
                ))}
              </>
            )}
          </Div>
        </Div>
      </Div>
    </DndProvider>
  );
}
