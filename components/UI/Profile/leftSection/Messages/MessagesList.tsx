import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

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
  filterMessagesByStatus,
} from '@/services/profile/messages';

type MessageStatus = 'open' | 'closed' | 'pending';

const MessagesList = () => {
  const t = useTranslations('profile.left');

  const [messages, setMessages] = useState<ProfileMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<MessageStatus | 'all'>('all');

  useEffect(() => { loadMessages(); }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProfileMessages();
      setMessages(sortMessagesByDate(data, 'desc'));
    } catch (err) {
      setError(
        err instanceof ProfileMessagesError
          ? err.message
          : t('messages.error')
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric', month: 'numeric', day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const filteredMessages =
    filterStatus === 'all' ? messages : filterMessagesByStatus(messages, filterStatus);

  if (loading) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.pageTitle}>{t('messages.title')}</div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>{t('messages.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.pageTitle}>{t('messages.title')}</div>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={loadMessages} className={styles.retryButton}>
            {t('messages.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.pageTitle}>{t('messages.title')}</div>
        <div className={styles.emptyStateContainer}>
          <MessageCircle size={64} className={styles.emptyIcon} strokeWidth={1.5} />
          <p className={styles.emptyStateText}>{t('messages.empty')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messagesContainer}>
      <div className={styles.pageTitle}>{t('messages.title')}</div>
      <div className={styles.messagesList}>
        {filteredMessages.map(messageData => (
          <MessageComponent
            key={messageData._id}
            message={messageData.description}
            timestamp={formatDate(messageData.createdAt)}
            isCurrentUser={true}
            senderName={messageData.name}
            response={messageData.reply || null}
            responseTimestamp={messageData.reply ? formatDate(messageData.updatedAt) : null}
            responseSenderName={messageData.reply ? t('messages.message.replySalutation') : null}
          />
        ))}
      </div>
    </div>
  );
};

export default MessagesList;