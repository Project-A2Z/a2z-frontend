import React, { useEffect, useState } from 'react';

// Components
import MessageComponent from '@/components/UI/Profile/leftSection/Messages/Messages';

// Styles
import styles from '@/components/UI/Profile/leftSection/Messages/Messages.module.css';

import { MessageCircle } from 'lucide-react';

// Services
import { 
  fetchProfileMessages, 
  ProfileMessages,
  ProfileMessagesError,
  sortMessagesByDate,
  filterMessagesByStatus
} from '@/services/profile/messages';

type MessageStatus = 'open' | 'closed' | 'pending';

const MessagesList = () => {
  const [messages, setMessages] = useState<ProfileMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<MessageStatus | 'all'>('all');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchProfileMessages();
      
      // Sort by newest first
      const sortedMessages = sortMessagesByDate(data, 'desc');
      setMessages(sortedMessages);
    } catch (err) {
      if (err instanceof ProfileMessagesError) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء تحميل الرسائل. يرجى المحاولة مرة أخرى.');
      }
      //console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getFilteredMessages = () => {
    if (filterStatus === 'all') {
      return messages;
    }
    return filterMessagesByStatus(messages, filterStatus);
  };

  const filteredMessages = getFilteredMessages();

  // Loading state
  if (loading) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.pageTitle}>رسائلك</div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>جاري تحميل الرسائل...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.pageTitle}>رسائلك</div>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            onClick={loadMessages} 
            className={styles.retryButton}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // Empty state - No messages at all
  if (messages.length === 0) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.pageTitle}>رسائلك</div>
        
        <div className={styles.emptyStateContainer}>
          <MessageCircle size={64} className={styles.emptyIcon} strokeWidth={1.5} />
          <p className={styles.emptyStateText}>لا يوجد رسائل</p>
          
        </div>
      </div>
    );
  }


  

  return (
    <div className={styles.messagesContainer}>
      {/* Page Title */}
      <div className={styles.pageTitle}>رسائلك</div>

    

      {/* Messages List */}
      <div className={styles.messagesList}>
        {filteredMessages.map((messageData) => (
          <MessageComponent
            key={messageData._id}
            message={messageData.description}
            timestamp={formatDate(messageData.createdAt)}
            isCurrentUser={true}
            senderName={messageData.name}
            response={messageData.reply || null}
            responseTimestamp={messageData.reply ? formatDate(messageData.updatedAt) : null}
            responseSenderName={messageData.reply ? 'فريق الدعم' : null}
          />
        ))}
      </div>

      
    </div>
  );
};

export default MessagesList;