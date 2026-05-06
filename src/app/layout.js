import { SocialProvider } from '../contexts/SocialContext';
import './globals.css';

export const metadata = {
  title: 'CebSocial - Your Local Cebuano Community',
  description: 'Connect with your neighbors in Cebu City',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SocialProvider>
          {children}
        </SocialProvider>
      </body>
    </html>
  );
}
