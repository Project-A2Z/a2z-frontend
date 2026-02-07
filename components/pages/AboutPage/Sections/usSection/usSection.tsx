import Image from 'next/image';
import styles from './usSection.module.css';

interface UsSectionProps {
  image: string;
  imageDirection: 'left' | 'right';
  title: string;
  body: string;
}

export default function UsSection({ image, imageDirection, title, body }: UsSectionProps) {
  return (
    <div className={styles.usSection}>
      <div className={`${styles.content} ${imageDirection === 'left' ? styles.contentReverse : ''}`}>
        <div className={styles.info}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.body}>{body}</p>
        </div>
        <div className={styles.imageWrapper}>
          <Image
            src={image}
            alt={title}
            fill
            className={styles.image}
          />
        </div>
      </div>
    </div>
  );
}