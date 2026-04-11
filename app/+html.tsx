import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{
          __html: `
            input:focus, select:focus {
              outline: 2px solid #FF385C !important;
              border-color: #FF385C !important;
              box-shadow: 0 0 0 3px rgba(255,56,92,0.15) !important;
            }
            input[type="date"]::-webkit-calendar-picker-indicator {
              opacity: 0.6;
              cursor: pointer;
            }
            * { box-sizing: border-box; }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
