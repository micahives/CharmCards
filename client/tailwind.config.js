/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "node_modules/preline/dist/*.js",
    ],
    plugins: [
        // require('@tailwindcss/forms'),
        require('preline/plugin'),
    ],
    theme: {
        extend: {},
    },
}