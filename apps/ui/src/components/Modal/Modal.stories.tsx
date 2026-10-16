import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Modal, ModalFooter, ModalPreviewBox } from ".";
import { Button } from "../Button";

const meta = {
  component: Modal,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dark p-8 bg-[var(--color-bg-base)] min-h-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: "Modal Title",
    children: <p className="text-[var(--color-text-secondary)] text-[var(--text-base-sm)]">Modal body content goes here.</p>,
    footer: (
      <ModalFooter
        onCancel={() => {}}
        onConfirm={() => {}}
        confirmLabel="Confirm"
      />
    ),
  },
};

export const WithFooter: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: "Confirm Action",
    children: (
      <div className="flex flex-col gap-3">
        <p className="text-[var(--color-text-secondary)] text-[var(--text-base-sm)]">
          Are you sure you want to proceed with this action?
        </p>
        <ModalPreviewBox>Preview: something will change</ModalPreviewBox>
      </div>
    ),
    footer: (
      <ModalFooter
        onCancel={() => {}}
        onConfirm={() => {}}
        confirmLabel="Apply changes"
        confirmVariant="warning-ghost"
      />
    ),
  },
};

export const LongContent: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: "Long Content Modal",
    children: (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }, (_, index) => (
          <p key={index} className="text-[var(--color-text-secondary)] text-[var(--text-base-sm)]">
            This is paragraph {index + 1} of many. It demonstrates how the modal
            handles longer content that might need scrolling.
          </p>
        ))}
      </div>
    ),
    footer: (
      <ModalFooter
        onCancel={() => {}}
        onConfirm={() => {}}
        confirmLabel="Done"
      />
    ),
  },
};

function InteractiveDemo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Interactive Modal"
        footer={
          <ModalFooter
            onCancel={() => setIsOpen(false)}
            onConfirm={() => setIsOpen(false)}
            confirmLabel="Save"
          />
        }
      >
        <p className="text-[var(--color-text-secondary)] text-[var(--text-base-sm)]">
          Click Cancel or the X button to close.
        </p>
      </Modal>
    </>
  );
}

export const Interactive: Story = {
  args: { isOpen: false, onClose: () => {}, title: "", children: null },
  render: () => <InteractiveDemo />,
};
