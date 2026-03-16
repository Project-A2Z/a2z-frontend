import React from 'react';
import { useTranslations } from 'next-intl';

// Styles
import styles from '@/components/UI/Profile/leftSection/Messages/Messages.module.css';

export type MessageComponentProps = {
  message: string;
  timestamp: string;
  isCurrentUser?: boolean;
  senderName?: string | null;
  response?: string | null;
  responseTimestamp?: string | null;
  responseSenderName?: string | null;
};

const MessageComponent: React.FC<MessageComponentProps> = ({
  message,
  timestamp,
  response,
  responseTimestamp,
}) => {
  const t = useTranslations('profile.left');

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageGroup}>
        {/* Customer Message */}
        <div className={styles.customerMessage}>
          <div className={styles.senderName}>
            {t('messages.message.salutation')}
          </div>
          <div className={styles.messageText}>{message}</div>
          <div className={styles.messageFooter}>
            <div className={styles.timestamp}>{timestamp}</div>
          </div>
        </div>

        {/* Response Message */}
        {response && (
          <div className={styles.responseMessage}>
            <div className={styles.responseHeader}>
              <span className={styles.responseLabel}>
                {t('messages.message.replyLabel')}
              </span>
            </div>
            <div className={styles.responseText}>
              <h5 className={styles.responseSender}>
                {t('messages.message.replySalutation')}
              </h5>
              {response}
            </div>
            <div className={styles.responseFooter}>
              <div className={styles.responseTimestamp}>{responseTimestamp}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageComponent;