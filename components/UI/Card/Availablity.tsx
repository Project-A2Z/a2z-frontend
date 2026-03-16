import styles from './card.module.css';
import { useTranslations } from 'next-intl';
function Availablity ({available = true}: {available?: boolean}) {
  const t = useTranslations('products.availability');
  return (
    <div className={styles.available}>
      {available ? (
        <span className={styles.availableText}> {t('inStock')} </span>
      ) : (
        <span className={styles.unavailableText}> {t('outOfStock')} </span>
      )}
    </div>
  );
}
export default Availablity;