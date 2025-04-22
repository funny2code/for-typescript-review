module.exports = {
  plugins: {
    "postcss-import": {},
    "tailwindcss/nesting": {},
    "postcss-reporter": {
        clearReportedMessages: true,
    },
    tailwindcss: {},
    autoprefixer: {},
  },
  // plugins: [require("tailwindcss"), require("autoprefixer")],
};
