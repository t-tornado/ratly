import type { Preview } from '@storybook/react-vite'
import type { ReactRenderer } from '@storybook/react-vite'
import type { DecoratorFunction } from 'storybook/internal/types'
import '../src/styles/index.css'

const withDarkMode: DecoratorFunction<ReactRenderer> = (Story) => (
  <div className="dark" style={{
    background: 'var(--color-bg-base)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-sans)',
    padding: '24px',
    minHeight: '100vh',
  }}>
    <Story />
  </div>
)

const preview: Preview = {
  decorators: [withDarkMode],
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      test: 'todo'
    }
  },
};

export default preview;