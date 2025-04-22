import { Theme } from "@aws-amplify/ui-react";

export const theme: Theme = {
  name: "fomo-theme",
  tokens: {
    colors: {
      border: {
        primary: "#D9D9D9",
        hover:"#438AE8",
        focus: "#438AE8",
        active: "#438AE8",
      },
    },
    components: {
      textareafield: {
        color: "{colors.fomored.500}",
        _focus: {
          borderColor: "#438AE8",
        },
      },
      input: {
        color: "{colors.fomored.500}",
        _focus: {
          borderColor: "#438AE8",
        },
      },
      loader: {
        strokeEmpty: "{colors.neutral.20}",
        strokeFilled: "#438AE8",
        linear: {
          width: "50%",
          strokeWidth: "{fontSizes.xxs}",
          strokeFilled: "#438AE8",
          strokeEmpty: "{colors.neutral.20}",
          animationDuration: "2s",
        },
      },
      accordion: {
        item: {
          trigger: {
            color: "{colors.fomored.500}",
            backgroundColor: "{colors.fomored.500}",
            _hover: {
              color: "{colors.fomored.500}",
              backgroundColor: "{colors.fomored.500}",
            },
          },
          content: {},
        },
      },
      button: {
        fontWeight: { value: "{fontWeights.bold}" },
        backgroundColor: { value: "white" },
        borderColor: "#171717",
        outlined: {
          info: {
            borderColor: "#438AE8",
            color: "#171717",
          },
        },
        primary: {
          // backgroundColor: { value: "{colors.fomoyellow.500}" },
          // backgroundColor: "{colors.fomoyellow.500}",
          backgroundColor: { value: "{colors.fomoyellow.500}" },
          color: { value: "{colors.fomoyellow.500}" },
          _hover: {
            backgroundColor: { value: "{colors.fomoyellow.500}" },
          },
          _focus: {
            backgroundColor: { value: "#438AE8" },
          },
          _active: {
            backgroundColor: { value: "{colors.fomoyellow.500}" },
          },
          // _disabled: {
          //   backgroundColor: "transparent",
          //   borderColor: "{colors.neutral.30}",
          // },
          // error: {
          //   backgroundColor: "{colors.fomored.500}",
          //   color: "{colors.red.80}",
          //   _hover: {
          //     backgroundColor: "#a51b34",
          //   },
          //   _focus: {
          //     backgroundColor: "#9a0c26",
          //   },
          //   _active: {
          //     backgroundColor: "#9a0c26",
          //   },
          // },
        },
      },
      sliderfield: {
        thumb: {
          backgroundColor: "{colors.fomored.500}",
          _hover: {
            backgroundColor: "#438AE8",
            borderColor: "#438AE8",
          },
          _focus: {
            borderColor: "#438AE8",
          },
        },
        track: {
          backgroundColor: "{colors.fomoyellow.500}",
          height: "{fontSizes.medium}",
        },
        range: {
          backgroundColor: "{colors.fomoyellow.500}",
        },
      },
      tabs: {
        backgroundColor: "#FDC94D",
        borderColor: "#FDC94D",
        borderStyle: "solid",
        borderWidth: "1px",
        panel: {
          backgroundColor: "white",
        },
        gap: "0px",
        item: {
          _active: {
            backgroundColor: "{colors.fomored.500}",
            color: "{colors.fomoyellow.500}",
            borderColor: "#FFD166",
            boxShadow: "none",
          },
          _hover: {
            backgroundColor: "red",
            color: "white",
            borderColor: "#FFD166",
          },
          _disabled: {
            color: "#FFD166",
            backgroundColor: "white",
            borderColor: "#FFD166",
            boxShadow: "none",
          },
          _focus: {
            backgroundColor: "#FFD166",
            borderColor: "#FFD166",
            color: "white",
            boxShadow: "0 0 0 3px #FFD166",
          },
        },
      },
      link: {
        color: "#FDC94D",
      },
      checkbox: {
        button: {
          color: "#FDC94D",
          _focus: {
            outlineColor: "#FDC94D",
            borderColor: "{#FDC94D}",
          },
        },
        icon: {
          backgroundColor: "{#FDC94D}",
        },
        label: {
          _disabled: {
            color: "{#FDC94D}",
          },
        },
      },
      authenticator: {
        form: {
          padding: "20px",
        },
        container: {
          widthMax: "400px",
        },
        router: {
          backgroundColor: "#FDC94D",
          borderColor: "#FDC94D",
        },
      },
      badge: {
        error: {
          backgroundColor: "#FFD166",
          color: "#BD4C2A",
        },
      },
      alert: {
        success: {
          backgroundColor: "#FDC94D",
          color: "#00000",
        },
      },
    },
    fonts: {
      default: {
        variable: "Poppins, sans-serif",
        static: "Poppins, sans-serif",
      },
    },
  },
};
