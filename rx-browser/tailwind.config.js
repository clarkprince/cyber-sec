module.exports = {
  content: [
    "../hub/templates/**/*.html", 
    "**/*.go", 
    "components.js", 
    "../hub/prose/cmd/quickcheck/*"],
  theme: {
    fontsize: {
      "rc": ["1.3rem", "1.3rem"],
    },
    extend: {
      width: {
        '128': '32rem',
        '256': '64rem',
      },
      transitionProperty: {
        // for floating menus
        'inset': 'inset',
        // for drop zone
        'size': 'width,height',
      },
      variants: {
        height: ['responsive', 'hover', 'focus']
      },
      colors: {
        qualitative: {
          'red': '#fbb4ae',
          'blue': '#b3cde3',
          'green': '#ccebc5',
          'purple': '#decbe4',
          'yellow': '#fed9a6'
        }
      },
      keyframes: {
        blinkcursor: {
          // opacity will have an annoying progressive transition effect
          "0%, 100%": { visibility: "visible" },
          "50%": { visibility: "hidden" },
        }
      },
      animation: {
        blinkcursor: "blinkcursor steps(1) 1s infinite"
      }
    }
  }
}
