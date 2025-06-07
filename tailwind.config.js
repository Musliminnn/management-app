import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                roboto: ['Roboto', 'sans-serif'],
            },
            colors: {
                main: '#078941',
                'custom-black': '#131313',
            },
            boxShadow: {
                custom: '0 0 4px rgba(0, 0, 0, 0.10)',
            },
        },
    },

    plugins: [forms],
};
