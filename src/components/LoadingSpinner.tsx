import { css, keyframes } from "@emotion/react";
import { forwardRef } from "react";
import { Div, DivProps } from "style-props-html";

interface LoadingSpinnerProps extends DivProps {
  size: number | string;
  spinnerSize?: number | string;
  innerDivProps?: Partial<DivProps>;
}

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  function LoadingSpinner(
    { size, spinnerSize = size, innerDivProps = {}, ...rest },
    ref
  ) {
    const sizeString = typeof size === "number" ? `${size}px` : size;
    const spinnerSizeString =
      typeof spinnerSize === "number" ? `${spinnerSize}px` : spinnerSize;
    return (
      <Div
        ref={ref}
        width={sizeString}
        height={sizeString}
        display="flex"
        alignItems="center"
        justifyContent="center"
        {...rest}
      >
        <Div
          width={spinnerSizeString}
          height={spinnerSizeString}
          borderRadius="50%"
          border="3px solid blue"
          borderTop="3px solid skyblue"
          transformOrigin="center"
          css={css`
            animation: ${spinAnimation} 1s linear infinite;
          `}
          {...innerDivProps}
        ></Div>
      </Div>
    );
  }
);


export default LoadingSpinner;