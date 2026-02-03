import { css } from "@emotion/react";
import { useCallback, useEffect, useState } from "react";
import { A, Div, H1 } from "style-props-html";
import LoadingSpinner from "./components/LoadingSpinner";
import theme from "./themes/main";

type CatalogData = Record<string, string | undefined>;

export default function Home() {
  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);
  const loadData = useCallback(async function loadData() {
    const response2 = await fetch("/static/pages/pageList.json");
    if (response2.ok) {
      setCatalogData(await response2.json());
    }
  }, []);
  useEffect(() => {
    loadData();
  }, [loadData]);
  console.log(catalogData);
  return (
    <Div
      width="100dvw"
      height="100dvh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      overflow="auto"
    >
      {catalogData ? (
        <Div
          width="100%"
          maxWidth={`min(${70 * 0.7}rem,100dvw)`}
          display="flex"
          flexDirection="column"
          alignItems="stretch"
          maxHeight="100dvh"
          overflowY="auto"
          position="relative"
        >
          <H1
            position="sticky"
            top="0"
            left="0"
            textAlign="center"
            color={theme.colors.card.header.textColor}
            backgroundColor={theme.colors.card.header.backgroundColor}
            fontSize={"2rem"}
            padding={"0.5rem"}
          >
            Interactive Picture Dictionary
          </H1>
          <Div
            rowGap="1.5rem"
            columnGap="1rem"
            width="100%"
            display="grid"
            // gridTemplateColumns="repeat(3, 1fr)"
            css={css`
              grid-template-columns: 1fr 1fr;
              @media (min-aspect-ratio: 1/1) {
                grid-template-columns: 1fr 1fr 1fr;
              }
            `}
            backgroundColor={theme.colors.card.backgroundColor}
            padding={theme.pages.home.layout.lessonListingGap}
          >
            {Object.entries(catalogData).map(([id, title]) => (
              <A
                key={id}
                href={`/${id}`}
                css={css`
                  width: 100%;
                  font-weight: normal;
                  text-align: center;
                  font-size: ${theme.pages.home.lessonTitle.fontSize};
                  margin: 0;
                  padding: 0;
                  color: ${theme.pages.home.lessonTitle.textColor};
                  text-decoration: none;
                  cursor: pointer;
                  user-select: none;
                  text-decoration: underline;
                  &:visited {
                    color: ${theme.pages.home.lessonTitle.textColor};
                  }
                  &:hover {
                    color: ${theme.pages.home.lessonTitle.hoverTextColor};
                  }
                  &:active {
                    color: ${theme.pages.home.lessonTitle.activeTextColor};
                  }
                `}
              >
                {title || `Page ${id}`}
              </A>
            ))}
          </Div>
        </Div>
      ) : (
        <LoadingSpinner size="5rem" />
      )}
    </Div>
  );
}
