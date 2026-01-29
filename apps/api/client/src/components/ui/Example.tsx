/**
 * Example component demonstrating usage of UI primitives
 * This file can be used as a reference and removed when no longer needed
 */

import React, { useState } from 'react';
import { Button } from './Button';
import { Card, CardHeader, CardBody, CardFooter } from './Card';
import { Badge, PhaseBadge } from './Badge';
import { Input } from './Input';
import { Select } from './Select';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';

export const UIExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('ready');

  const phaseOptions = [
    { value: 'idea', label: 'Idea' },
    { value: 'backlog', label: 'Backlog' },
    { value: 'ready', label: 'Ready' },
    { value: 'active', label: 'Active' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
  ];

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-white mb-8">UI Components Example</h1>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Buttons</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </CardBody>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Badges & Phase Badges</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <PhaseBadge phase="idea" />
              <PhaseBadge phase="backlog" />
              <PhaseBadge phase="ready" />
              <PhaseBadge phase="active" />
              <PhaseBadge phase="review" />
              <PhaseBadge phase="done" />
              <PhaseBadge phase="cancelled" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Inputs */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Form Inputs</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4 max-w-md">
            <Input
              label="Job Title"
              placeholder="Enter job title"
              helperText="Choose a descriptive name for your job"
              fullWidth
            />
            <Input
              label="Error Example"
              placeholder="This has an error"
              error="This field is required"
              fullWidth
            />
            <Select
              label="Phase"
              options={phaseOptions}
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              fullWidth
            />
          </div>
        </CardBody>
      </Card>

      {/* Modal */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Modal</h2>
        </CardHeader>
        <CardBody>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        size="md"
      >
        <ModalHeader>
          <p className="text-eve-200">This is a modal dialog example.</p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Name"
              placeholder="Enter your name"
              fullWidth
            />
            <Select
              label="Phase"
              options={phaseOptions}
              fullWidth
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            Save
          </Button>
        </ModalFooter>
      </Modal>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Card with Header</h3>
            <PhaseBadge phase="active" />
          </CardHeader>
          <CardBody>
            <p className="text-eve-300">
              This is a card with a header, body, and footer. It uses the backdrop
              blur effect by default.
            </p>
          </CardBody>
          <CardFooter>
            <Button variant="secondary" size="sm">Cancel</Button>
            <Button variant="primary" size="sm">Save</Button>
          </CardFooter>
        </Card>

        <Card blur={false}>
          <CardHeader>
            <h3 className="text-lg font-semibold">Solid Card</h3>
            <Badge variant="info">No Blur</Badge>
          </CardHeader>
          <CardBody>
            <p className="text-eve-300">
              This card has blur disabled for a solid background.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
