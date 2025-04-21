
const semantic = {
  colors: {
    brand: {
      textColor: "hsl(180 100% 25%)",
      backgroundColor: "hsl(100 80% 80%)",
    },
    card: {
      header: {
        textColor: "hsl(180 100% 25%)",
        backgroundColor: "hsl(100 80% 80%)",
      },
      backgroundColor: "hsl(55 35% 90%)",
      textColor: "hsl(0 0% 0%)",
      activeTextColor: "hsl(0 0% 50%)",
      hoverTextColor: "hsl(0 0% 75%)",
    },
    button: {
      emphasis: {
        normal: {
          textColor: "#ffffff",
          backgroundColor: "#ff69b4",
        },
        hover: {
          textColor: "#ffffff",
          backgroundColor: "#ff1493",
        },
        active: {
          textColor: "#ffffff",
          backgroundColor: "#db7093",
        },
      },
      light: {
        normal: {
          textColor: "#ffffff",
          backgroundColor: "#a0b8cc",
        },
        hover: {
          textColor: "#ffffff",
          backgroundColor: "#8ca6bd",
        },
        active: {
          textColor: "#ffffff",
          backgroundColor: "#7895ad",
        },
      },
      success: {
        normal: {
          textColor: "#ffffff",
          backgroundColor: "#28a745",
        },
        hover: {
          textColor: "#ffffff",
          backgroundColor: "#218838",
        },
        active: {
          textColor: "#ffffff",
          backgroundColor: "#1e7e34",
        },
      },

      warning: {
        normal: {
          textColor: "#000000",
          backgroundColor: "#ffecb3",
        },
        hover: {
          textColor: "#000000",
          backgroundColor: "#ffe066",
        },
        active: {
          textColor: "#000000",
          backgroundColor: "#ffcc00",
        },
      },

      danger: {
        normal: {
          textColor: "#ffffff",
          backgroundColor: "#dc3545",
        },
        hover: {
          textColor: "#ffffff",
          backgroundColor: "#c82333",
        },
        active: {
          textColor: "#ffffff",
          backgroundColor: "#bd2130",
        },
      },

      action: {
        normal: {
          textColor: "#ffffff",
          backgroundColor: "#007bff",
        },
        hover: {
          textColor: "#ffffff",
          backgroundColor: "#0069d9",
        },
        active: {
          textColor: "#ffffff",
          backgroundColor: "#0056b3",
        },
      },

      cancel: {
        normal: {
          textColor: "#000000",
          backgroundColor: "#e0e0e0",
        },
        hover: {
          textColor: "#000000",
          backgroundColor: "#bdbdbd",
        },
        active: {
          textColor: "#000000",
          backgroundColor: "#9e9e9e",
        },
      },
    },
  },
} as const;

const theme = {
  components: {
    navbar: {
      boxShadow: "0 0 8px rgba(0, 0, 0, 0.75)",
      backgroundColor: semantic.colors.brand.backgroundColor,
      logo: {
        fontSize: "1.5rem",
        textColor: semantic.colors.brand.textColor,
      },
      homeButtonSize: "3rem",
      homeButtonFontSize: "1.5rem",
      padding: "0.5rem",
      gap: "0.5rem",
      chapterTitle: {
        fontSize: "1rem",
        textColor: semantic.colors.brand.textColor,
      },
    },
    button: {
      disabledAlpha: 0.6,
      disabledSelectedAlpha: 0.8,
      pressShrink: 0.05,
      hoverGrow: 0.05,
      defaultPadding: "0.5em",
      colors: semantic.colors.button,
    },
  },
  pages: {
    quiz: {
      backgroundColor: "#faefc5",
      layout: {
        mainContentMaxWidth: "600px",
        mainContentGutter: "0.75rem",
      },
      lessonTitle: {
        backgroundColor: semantic.colors.card.header.backgroundColor,
        textColor: semantic.colors.card.header.textColor,
        fontSize: "2rem",
        padding: "0.5rem",
      },
      passageContainer: {
        gap: "0.5rem",
        padding: "0.5rem",
        backgroundColor: semantic.colors.card.backgroundColor,
      },
      passage: {
        textColor: semantic.colors.card.textColor,
        fontSize: "1.5rem",
      },
      illustration: {
        maxWidth: "300px",
      },
      activity: {
        title: {
          fontSize: "1.5rem",
          padding: "0.5rem",
          textColor: semantic.colors.card.header.textColor,
          backgroundColor: semantic.colors.card.header.backgroundColor,
        },
        content: {
          instructions: {
            padding: "0.5rem",
            fontSize: "1.25rem",
            fontWeight: "bold",
            textColor: semantic.colors.card.textColor,
          },
          question: {
            padding: "0.5rem",
            number: {
              feedback: {
                fontSize: "1.25rem",
                fontWeight: "bold",
                transform: "scale(2.0)",
                opacity: "80%",
              },
              fontSize: "1.25rem",
              fontWeight: "bold",
              textColor: semantic.colors.card.textColor,
              padding: "0.25rem",
            },
            text: {
              lineHeight: 1.6,
              fontSize: "1.25rem",
              fontWeight: "normal",
              textColor: semantic.colors.card.textColor,
              padding: "0.25rem",
            },
            answerChoices: {
              padding: "0.25rem",
              gap: "0.5rem",
              button: {
                enlargeSelected: 1.0,
                indicatorBorderWidth: "2px",
                fontSize: "1.0rem",
              },
            },
            gap: "1.25rem",
          },
          nonStandardQuestion: {
            "fill-blanks/dropdown": {
              dropdown: {
                fontSize: "2rem",
              },
            },
            "fill-blanks/textbox": {
              textbox: {
                fontSize: "2rem",
              },
            },
            "word-audio-matching": {
              backgroundColor: "none",
            },
          },
          padding: "0.5rem",
          backgroundColor: semantic.colors.card.backgroundColor,
        },
      },
    },
    home: {
      backgroundColor: "#faefc5",
      logo: {
        textColor: semantic.colors.brand.textColor,
        backgroundColor: semantic.colors.brand.backgroundColor,
      },
      icon: {
        size: `"calc( 100vw  - 2 * 1rem )`,
        pageColor: semantic.colors.card.backgroundColor,
        lineartColor: "black",
        coverColor: semantic.colors.button.success.normal.backgroundColor,
        bookmarkColor: semantic.colors.button.danger.normal.backgroundColor,
      },
      title: {
        width: "100%",
        borderRadius: "0",
        fontSize: "2.5rem",
        padding: "0.25rem",
        textColor: semantic.colors.brand.textColor,
        backgroundColor: semantic.colors.brand.backgroundColor,
      },
      chapterTitle: {
        fontSize: "1.5rem",
        padding: "0.25rem",
        textColor: semantic.colors.card.header.textColor,
        backgroundColor: semantic.colors.card.header.backgroundColor,
      },
      lessonTitle: {
        fontSize: "1.25rem",
        textColor: semantic.colors.card.textColor,
        activeTextColor: semantic.colors.card.activeTextColor,
        hoverTextColor: semantic.colors.card.hoverTextColor,
      },
      lessonListingContainer: {
        padding: "1.5rem",
        backgroundColor: semantic.colors.card.backgroundColor,
      },
      layout: {
        mainContentGap: "1rem",
        chapterListingGap: "1rem",
        lessonListingGap: "1.5rem",
      },
    },
  },
  ...semantic,
} as const;



export default theme;
