import React from 'react';
import MessageComponent from './Messages';
import styles from './Messages.module.css';

// Static test data
const messagesData = [
  {
    id: 1,
    message: "أود أن أستفسر عن مشكلة واجهتها وأحتاج مساعدتكم في حل هذه المشكلة",
    timestamp: "20/2/2025",
    isCurrentUser: true,
    senderName: "شكرا لكم",
    response: "شكرا لتواصلك معنا تحت خدماتنا المتاحة في حل هذه المشكلة في أقرب وقت ممكن",
    responseTimestamp: "25/2/2025",
    responseSenderName: "فريق المساندة"
  },
  {
    id: 2,
    message: "مرحبا، أريد الاستفسار عن خدماتكم المتاحة",
    timestamp: "18/2/2025",
    isCurrentUser: true,
    senderName: "أحمد محمد"
    // No response - will show like Image 2
  },
  {
    id: 3,
    message: "هل يمكنني الحصول على مزيد من المعلومات حول الأسعار؟",
    timestamp: "15/2/2025",
    isCurrentUser: true,
    senderName: "سارة أحمد",
    response: "بالطبع، يمكنك الاطلاع على قائمة الأسعار في الموقع الإلكتروني أو التواصل مع قسم المبيعات",
    responseTimestamp: "15/2/2025",
    responseSenderName: "فريق خدمة العملاء"
  },
  {
    id: 4,
    message: "شكرا لكم على الخدمة الممتازة",
    timestamp: "12/2/2025",
    isCurrentUser: true,
    senderName: "محمد علي"
    // No response
  },
  {
    id: 5,
    message: "أحتاج مساعدة في تفعيل حسابي الجديد",
    timestamp: "10/2/2025",
    isCurrentUser: true,
    senderName: "فاطمة حسن",
    response: "مرحبا فاطمة، لتفعيل حسابك يرجى اتباع الرابط المرسل إلى بريدك الإلكتروني",
    responseTimestamp: "10/2/2025",
    responseSenderName: "الدعم التقني"
  }
];

const MessagesList = () => {
  return (
    <div className={styles.messagesContainer}>
      {/* Page Title */}
      <div className={styles.pageTitle}>رسائلك</div>
      
      <div className={styles.messagesList}>
        {messagesData.map((messageData) => (
          <MessageComponent
            key={messageData.id}
            message={messageData.message}
            timestamp={messageData.timestamp}
            isCurrentUser={messageData.isCurrentUser}
            senderName={messageData.senderName}
            response={messageData.response}
            responseTimestamp={messageData.responseTimestamp}
            responseSenderName={messageData.responseSenderName}
          />
        ))}
      </div>
    </div>
  );
};

export default MessagesList;