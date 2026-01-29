# UI Component Primitives

This directory contains the foundational UI components for the Eve Horizon Dashboard, built with React, TypeScript, and Tailwind CSS.

## Components

### Button
A versatile button component with multiple variants and sizes.

**Variants:**
- `primary` - Eve blue background, primary action
- `secondary` - Subtle eve background with border
- `ghost` - Transparent background, minimal styling
- `danger` - Red background for destructive actions

**Sizes:** `sm`, `md`, `lg`

**Props:**
- `loading` - Shows spinner and disables button
- `fullWidth` - Expands to full width

**Example:**
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Click me
</Button>

<Button variant="danger" loading>
  Deleting...
</Button>
```

---

### Card
Container component with optional header, body, and footer sections.

**Props:**
- `blur` - Enable/disable backdrop blur (default: true)

**Subcomponents:**
- `CardHeader` - Top section with bottom border
- `CardBody` - Main content area
- `CardFooter` - Bottom section with top border, right-aligned

**Example:**
```tsx
import { Card, CardHeader, CardBody, CardFooter, Button } from '@/components/ui';

<Card>
  <CardHeader>
    <h2>Job Details</h2>
  </CardHeader>
  <CardBody>
    <p>Job content goes here</p>
  </CardBody>
  <CardFooter>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Save</Button>
  </CardFooter>
</Card>
```

---

### Badge
Status and phase indicators with semantic colors.

**Variants:**
- `default`, `success`, `warning`, `error`, `info`
- Phase variants: `idea`, `backlog`, `ready`, `active`, `review`, `done`, `cancelled`

**PhaseBadge:**
Specialized component for job phase badges.

**Example:**
```tsx
import { Badge, PhaseBadge } from '@/components/ui';

<Badge variant="success">Completed</Badge>
<PhaseBadge phase="active" />
```

---

### Input
Text input with label, error states, and helper text.

**Props:**
- `label` - Label text
- `error` - Error message (shows error state)
- `helperText` - Helper text below input
- `fullWidth` - Expand to full width

**Example:**
```tsx
import { Input } from '@/components/ui';

<Input
  label="Job Title"
  placeholder="Enter title"
  helperText="Choose a descriptive name"
  fullWidth
/>

<Input
  label="Required Field"
  error="This field is required"
  fullWidth
/>
```

---

### Select
Dropdown select with label and error states.

**Props:**
- `label` - Label text
- `error` - Error message
- `helperText` - Helper text
- `options` - Array of `{ value, label, disabled? }`
- `fullWidth` - Expand to full width

**Example:**
```tsx
import { Select } from '@/components/ui';

const options = [
  { value: 'idea', label: 'Idea' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
];

<Select
  label="Phase"
  options={options}
  value={phase}
  onChange={(e) => setPhase(e.target.value)}
  fullWidth
/>
```

---

### Modal
Dialog/modal overlay component with backdrop.

**Props:**
- `isOpen` - Controls visibility
- `onClose` - Close handler
- `title` - Modal title
- `size` - `sm`, `md`, `lg`, `xl`
- `showCloseButton` - Show X button (default: true)
- `closeOnOverlayClick` - Close when clicking backdrop (default: true)
- `closeOnEscape` - Close on Escape key (default: true)

**Subcomponents:**
- `ModalHeader` - Top section for additional header content
- `ModalBody` - Main content area
- `ModalFooter` - Bottom section for actions

**Example:**
```tsx
import { Modal, ModalBody, ModalFooter, Button } from '@/components/ui';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <ModalBody>
    <p>Are you sure you want to proceed?</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleConfirm}>
      Confirm
    </Button>
  </ModalFooter>
</Modal>
```

---

## Theme Tokens

The design system uses the Eve color palette with additional semantic colors:

### Colors
- **Eve palette:** `eve-50` through `eve-950` (cyan/blue spectrum)
- **Success:** `success-50` through `success-950` (green)
- **Warning:** `warning-50` through `warning-950` (amber)
- **Error:** `error-50` through `error-950` (red)
- **Info:** `info-50` through `info-950` (blue)

### Typography
- **Sans:** Inter with system fallbacks
- **Mono:** JetBrains Mono, Fira Code with monospace fallbacks

### Spacing
Extended spacing scale includes: `18` (4.5rem), `88` (22rem), `128` (32rem)

### Focus Rings
- Default ring color: `eve-600`
- Ring offset: `eve-950` (matches background)

## Accessibility

All components include:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus-visible styles
- Screen reader friendly markup
- Color contrast compliance

## Usage

Import components from the index:

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  PhaseBadge,
  Input,
  Select,
  Modal,
} from '@/components/ui';
```

See `Example.tsx` for comprehensive usage examples.
