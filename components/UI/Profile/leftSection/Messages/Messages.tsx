// MessageComponent.tsx
import React from 'react';

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
  isCurrentUser = false,
  senderName,
  response,
  responseTimestamp,
  responseSenderName,
}) => {
  return (
    <div className={styles.chatContainer}>
      
      
      <div className={styles.messageGroup}>
        {/* Customer Message */}
        <div className={styles.customerMessage}>
          <div className={styles.senderName}>
            { 'عزيزي فريق الدعم'}
          </div>
          <div className={styles.messageText}>
            {message}
          </div>
          <div className={styles.messageFooter}>
            {/* <span className={styles.signature}>شكراً لكم</span> */}
            <div className={styles.timestamp}>
              {timestamp}
            </div>
          </div>
        </div>

        {/* Response Message */}
        {response && (
          <div className={styles.responseMessage}>
            <div className={styles.responseHeader}>
              <span className={styles.responseLabel}>الرد</span>
              
            </div>
            <div className={styles.responseText}>
                <h5 className={styles.responseSender}>
                { ' عزيزي المستخدم ' }
              </h5>
              {response}
            </div>
            <div className={styles.responseFooter}>
              {/* <span className={styles.responseSignature}>تحياتنا</span> */}
              <div className={styles.responseTimestamp}>
                {responseTimestamp}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageComponent;