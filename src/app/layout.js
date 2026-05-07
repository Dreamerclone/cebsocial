import { SocialProvider } from '../contexts/SocialContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import './globals.css';

export const metadata = {
  title: 'CebSocial - Your Local Cebuano Community',
  description: 'Connect with your neighbors in Cebu City',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('cebsocial_theme');
                var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                if (theme === 'dark' || (!theme && supportDarkMode)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `,
        }} />
      </head>
      <body>
        <ThemeProvider>
          <SocialProvider>
            {children}
          </SocialProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
