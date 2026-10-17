import type { Preview } from '@storybook/react-vite'
import type { ReactRenderer } from '@storybook/react-vite'
import type { DecoratorFunction } from 'storybook/internal/types'
import { MemoryRouter } from 'react-router-dom'
import { QueryProvider } from '../src/providers/query'
import { ThemeProvider } from '../src/providers/ThemeProvider'
import '../src/styles/index.css'

const THEME_STORAGE_KEY = 'ratly-theme'

const withProviders: DecoratorFunction<ReactRenderer> = (Story, context) => {
  const selectedTheme = context.globals.theme || 'dark'
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(selectedTheme))
  const skipRouter = context.parameters.skipRouter === true

  const content = (
    <QueryProvider>
      <ThemeProvider key={selectedTheme}>
        <div style={{
          background: 'var(--color-bg-base)',
          fontFamily: 'var(--font-sans)',
          padding: '24px',
          minHeight: '100vh',
        }}>
          <Story />
        </div>
      </ThemeProvider>
    </QueryProvider>
  )

  if (skipRouter) return content
  return <MemoryRouter>{content}</MemoryRouter>
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'light', title: 'Light', icon: 'sun' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'dark',
  },
  decorators: [withProviders],
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      test: 'error'
    }
  },
};

export default preview;
