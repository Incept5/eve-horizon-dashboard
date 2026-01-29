import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';

export interface LogStreamProps {
  jobId: string;
  attemptId?: string;
  className?: string;
}

interface LogLine {
  id: string;
  text: string;
  timestamp: number;
}

// ANSI color code to Tailwind class mapping
const ANSI_COLOR_MAP: Record<string, string> = {
  '30': 'text-gray-900',      // Black
  '31': 'text-red-400',        // Red
  '32': 'text-green-400',      // Green
  '33': 'text-yellow-400',     // Yellow
  '34': 'text-blue-400',       // Blue
  '35': 'text-purple-400',     // Magenta
  '36': 'text-cyan-400',       // Cyan
  '37': 'text-gray-300',       // White
  '90': 'text-gray-600',       // Bright Black (Gray)
  '91': 'text-red-300',        // Bright Red
  '92': 'text-green-300',      // Bright Green
  '93': 'text-yellow-300',     // Bright Yellow
  '94': 'text-blue-300',       // Bright Blue
  '95': 'text-purple-300',     // Bright Magenta
  '96': 'text-cyan-300',       // Bright Cyan
  '97': 'text-white',          // Bright White
};

/**
 * Parse ANSI escape codes and convert to React elements with Tailwind classes
 */
function parseAnsiColors(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const ansiRegex = /\x1b\[([0-9;]+)m/g;

  let lastIndex = 0;
  let match;
  let currentColor = 'text-green-400'; // Default color

  while ((match = ansiRegex.exec(text)) !== null) {
    // Add text before the ANSI code
    if (match.index > lastIndex) {
      const textSegment = text.slice(lastIndex, match.index);
      parts.push(
        <span key={`${lastIndex}-${match.index}`} className={currentColor}>
          {textSegment}
        </span>
      );
    }

    // Parse the ANSI code
    const codes = match[1].split(';');
    for (const code of codes) {
      if (code === '0' || code === '') {
        currentColor = 'text-green-400'; // Reset to default
      } else if (ANSI_COLOR_MAP[code]) {
        currentColor = ANSI_COLOR_MAP[code];
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`${lastIndex}-end`} className={currentColor}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  // If no ANSI codes found, return the whole text with default color
  if (parts.length === 0) {
    parts.push(
      <span key="full" className="text-green-400">
        {text}
      </span>
    );
  }

  return parts;
}

export function LogStream({ jobId, attemptId, className = '' }: LogStreamProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(true);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const userScrolledRef = useRef(false);
  const lastScrollTop = useRef(0);

  // Auto-scroll to bottom when new logs arrive and following is enabled
  useEffect(() => {
    if (isFollowing && logContainerRef.current && !userScrolledRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isFollowing]);

  // Handle manual scroll - disable auto-follow if user scrolls up
  const handleScroll = () => {
    if (!logContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;

    // User scrolled up
    if (scrollTop < lastScrollTop.current && !isAtBottom) {
      userScrolledRef.current = true;
      setIsFollowing(false);
    }

    // User scrolled to bottom
    if (isAtBottom) {
      userScrolledRef.current = false;
      setIsFollowing(true);
    }

    lastScrollTop.current = scrollTop;
  };

  // Toggle follow mode
  const toggleFollow = () => {
    const newFollowing = !isFollowing;
    setIsFollowing(newFollowing);
    userScrolledRef.current = !newFollowing;

    if (newFollowing && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  };

  // Connect to SSE endpoint
  useEffect(() => {
    const url = attemptId
      ? `/api/jobs/${jobId}/attempts/${attemptId}/stream`
      : `/api/jobs/${jobId}/stream`;

    // Calculate backoff delay (exponential with max 30s)
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);

    const connectTimeout = setTimeout(() => {
      setIsLoading(true);
      setError(null);

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setIsLoading(false);
        setError(null);
        setReconnectAttempt(0); // Reset backoff on successful connection
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const newLine: LogLine = {
            id: `${Date.now()}-${Math.random()}`,
            text: data.line || data.message || event.data,
            timestamp: data.timestamp || Date.now(),
          };

          setLogs((prev) => [...prev, newLine]);
        } catch (err) {
          // If parsing fails, treat the raw data as the log line
          const newLine: LogLine = {
            id: `${Date.now()}-${Math.random()}`,
            text: event.data,
            timestamp: Date.now(),
          };

          setLogs((prev) => [...prev, newLine]);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        setIsLoading(false);
        setError('Connection lost. Attempting to reconnect...');
        eventSource.close();

        // Trigger reconnect with backoff
        setReconnectAttempt((prev) => prev + 1);
      };
    }, delay);

    return () => {
      clearTimeout(connectTimeout);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [jobId, attemptId, reconnectAttempt]);

  // Clear logs when jobId or attemptId changes
  useEffect(() => {
    setLogs([]);
    setReconnectAttempt(0);
  }, [jobId, attemptId]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with connection status and controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-eve-900 border-b border-eve-800">
        <div className="flex items-center gap-3">
          {/* Connection status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-success-500 animate-pulse'
                  : isLoading
                  ? 'bg-warning-500 animate-pulse'
                  : 'bg-error-500'
              }`}
            />
            <span className="text-sm text-eve-300">
              {isConnected ? 'Connected' : isLoading ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>

          {/* Line count */}
          <span className="text-sm text-eve-400">
            {logs.length} {logs.length === 1 ? 'line' : 'lines'}
          </span>
        </div>

        {/* Follow toggle button */}
        <Button
          variant={isFollowing ? 'primary' : 'ghost'}
          size="sm"
          onClick={toggleFollow}
          className="text-xs"
        >
          {isFollowing ? '▼ Following' : '▼ Follow'}
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-error-900/50 border-b border-error-700 text-error-300 text-sm">
          {error}
        </div>
      )}

      {/* Log output */}
      <div
        ref={logContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-eve-950 font-mono text-sm"
      >
        {isLoading && logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="animate-spin h-8 w-8 text-eve-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-eve-400">Connecting to log stream...</span>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-eve-400">No logs available</span>
          </div>
        ) : (
          <div className="divide-y divide-eve-900/50">
            {logs.map((line, index) => (
              <div
                key={line.id}
                className="flex hover:bg-eve-900/30 transition-colors"
              >
                {/* Line number */}
                <div className="flex-shrink-0 w-16 px-3 py-1 text-right text-eve-500 select-none border-r border-eve-900">
                  {index + 1}
                </div>

                {/* Log content */}
                <div className="flex-1 px-4 py-1 whitespace-pre-wrap break-all">
                  {parseAnsiColors(line.text)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
