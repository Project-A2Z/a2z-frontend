import { Api, API_ENDPOINTS } from '../api/endpoints';
import { UserStorage } from '../auth/login';

export interface ProfileMessages {
  _id: string;
  name: string;
  description: string;
  id: string;
  status?: 'open' | 'closed' | 'pending';
  createdAt: string;
  updatedAt: string;
  reply?: string;
}

export interface ProfileMessagesResponse {
  status: string;
  message: string;
  length: number;
  inquiries: ProfileMessages[];
}

export class ProfileMessagesError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ProfileMessagesError';
  }
}

/**
 * Retrieves the current user's email from storage
 * @returns User email or null if not found or running on server
 */
const getEmail = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = UserStorage.getUser();
    return userData?.email || null;
  } catch (error) {
    //console.error('Error retrieving user email:', error);
    return null;
  }
};

/**
 * Fetches all messages/inquiries for the current user
 * @returns Array of profile messages
 * @throws {ProfileMessagesError} If user is not authenticated or request fails
 */
export const fetchProfileMessages = async (): Promise<ProfileMessages[]> => {
  const email = getEmail();
  
  if (!email) {
    throw new ProfileMessagesError('User email not found. Please log in again.');
  }

  try {
    const url = `${Api}${API_ENDPOINTS.USERS.MESSAGES}?email=${email}`;
    const token = UserStorage.getToken();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    //console.log('Fetch profile messages response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch profile messages';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If error response is not JSON, use status text
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }

      throw new ProfileMessagesError(
        errorMessage,
        response.status
      );
    }

    const data: ProfileMessagesResponse = await response.json();
    
    //console.log('Fetch profile messages response body:', data);
    
    // Handle new response structure
    if (data.status === 'success' && Array.isArray(data.inquiries)) {
      return data.inquiries;
    }
    
    // Fallback for other possible structures
    if (Array.isArray(data)) {
      return data as ProfileMessages[];
    } else if ((data as any).data && Array.isArray((data as any).data)) {
      return (data as any).data as ProfileMessages[];
    } else if ((data as any).messages && Array.isArray((data as any).messages)) {
      return (data as any).messages as ProfileMessages[];
    }
    
    // If we get here, return empty array
    return [];
  } catch (error) {
    if (error instanceof ProfileMessagesError) {
      throw error;
    }

    // Network or other errors
    throw new ProfileMessagesError(
      'An error occurred while fetching profile messages. Please check your connection and try again.',
      undefined,
      error
    );
  }
};

/**
 * Fetches a single message by ID
 * @param messageId - The ID of the message to fetch
 * @returns Single profile message
 * @throws {ProfileMessagesError} If message is not found or request fails
 */
export const fetchProfileMessage = async (
  messageId: string
): Promise<ProfileMessages> => {
  const email = getEmail();
  
  if (!email) {
    throw new ProfileMessagesError('User email not found. Please log in again.');
  }

  try {
    const url = `${Api}${API_ENDPOINTS.USERS.MESSAGES}/${messageId}?email=${encodeURIComponent(email)}`;
    const token = UserStorage.getToken();
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new ProfileMessagesError(
        `Failed to fetch message with ID: ${messageId}`,
        response.status
      );
    }

    const data = await response.json();
    return data as ProfileMessages;
  } catch (error) {
    if (error instanceof ProfileMessagesError) {
      throw error;
    }

    throw new ProfileMessagesError(
      'An error occurred while fetching the message.',
      undefined,
      error
    );
  }
};

/**
 * Filters messages by status
 * @param messages - Array of messages to filter
 * @param status - Status to filter by
 * @returns Filtered array of messages
 */
export const filterMessagesByStatus = (
  messages: ProfileMessages[],
  status: 'open' | 'closed' | 'pending'
): ProfileMessages[] => {
  return messages.filter((msg) => msg.status === status);
};

/**
 * Sorts messages by date
 * @param messages - Array of messages to sort
 * @param order - Sort order (ascending or descending)
 * @returns Sorted array of messages
 */
export const sortMessagesByDate = (
  messages: ProfileMessages[],
  order: 'asc' | 'desc' = 'desc'
): ProfileMessages[] => {
  return [...messages].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};