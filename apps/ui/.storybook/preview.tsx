import type { Preview } from '@storybook/react-vite'
import type { ReactRenderer } from '@storybook/react-vite'
import type { DecoratorFunction } from 'storybook/internal/types'
import { MemoryRouter } from 'react-router-dom'
import { QueryProvider } from '../src/providers/query'
import { ThemeProvider } from '../src/providers/ThemeProvider'
import '../src/styles/index.css'

const withProviders: DecoratorFunction<ReactRenderer> = (Story, context) => {
  document.documentElement.classList.add('dark')
  const skipRouter = context.parameters.skipRouter === true

  const content = (
    <QueryProvider>
      <ThemeProvider>
        <div style={{
          background: 'var(--color-bg-base)',
          color: 'var(--color-text-primary)',
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