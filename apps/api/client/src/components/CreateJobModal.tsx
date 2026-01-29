import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select, SelectOption } from './ui/Select';

export interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  epics?: Array<{ id: string; subject: string }>;
}

interface FormData {
  subject: string;
  description: string;
  issueType: 'epic' | 'story' | 'task';
  phase: 'idea' | 'backlog' | 'ready';
  parentEpicId: string;
}

interface FormErrors {
  subject?: string;
}

const issueTypeOptions: SelectOption[] = [
  { value: 'epic', label: 'Epic' },
  { value: 'story', label: 'Story' },
  { value: 'task', label: 'Task' },
];

const phaseOptions: SelectOption[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'backlog', label: 'Backlog' },
  { value: 'ready', label: 'Ready' },
];

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  epics = [],
}) => {
  const [formData, setFormData] = useState<FormData>({
    subject: '',
    description: '',
    issueType: 'task',
    phase: 'idea',
    parentEpicId: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        subject: '',
        description: '',
        issueType: 'task',
        phase: 'idea',
        parentEpicId: '',
      });
      setErrors({});
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, just log the form data and call onSuccess
      // Integration with createJob API will come later
      console.log('Creating job with data:', formData);

      // Simulate a short delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      onSuccess();
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create job'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Generate epic options with a default "None" option
  const epicOptions: SelectOption[] = [
    { value: '', label: 'None' },
    ...epics.map((epic) => ({
      value: epic.id,
      label: epic.subject,
    })),
  ];

  // Show parent epic selector only for stories and tasks
  const showParentEpicSelector =
    formData.issueType === 'story' || formData.issueType === 'task';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Job"
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-4">
            {/* Subject */}
            <Input
              name="subject"
              label="Subject"
              placeholder="Enter job subject"
              value={formData.subject}
              onChange={handleInputChange}
              error={errors.subject}
              fullWidth
              required
              disabled={isSubmitting}
              autoFocus
            />

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-eve-200 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Enter job description (optional)"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-eve-900 border border-eve-700 hover:border-eve-600 rounded-lg text-white placeholder-eve-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-eve-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
            </div>

            {/* Issue Type and Phase in a row */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                name="issueType"
                label="Issue Type"
                value={formData.issueType}
                onChange={handleInputChange}
                options={issueTypeOptions}
                fullWidth
                disabled={isSubmitting}
              />

              <Select
                name="phase"
                label="Phase"
                value={formData.phase}
                onChange={handleInputChange}
                options={phaseOptions}
                fullWidth
                disabled={isSubmitting}
              />
            </div>

            {/* Parent Epic (conditional) */}
            {showParentEpicSelector && (
              <Select
                name="parentEpicId"
                label="Parent Epic"
                value={formData.parentEpicId}
                onChange={handleInputChange}
                options={epicOptions}
                fullWidth
                disabled={isSubmitting || epics.length === 0}
                helperText={
                  epics.length === 0
                    ? 'No epics available'
                    : 'Optional: Link this job to a parent epic'
                }
              />
            )}

            {/* Error Message */}
            {submitError && (
              <div className="p-4 bg-error-900/50 border border-error-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-error-400 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-error-300">
                      Error creating job
                    </h4>
                    <p className="text-sm text-error-400 mt-1">{submitError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Create Job
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
