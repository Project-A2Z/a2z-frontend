
import styles from './Card.module.css';
function Availablity ({available = true}: {available?: boolean}) {
  return (
    <div >
      {available ? (
        <span className={styles.availableText}> متوفر في المخزون</span>
      ) : (
        <span className={styles.unavailableText}>غير متوفر في المخزون</span>
      )}
    </div>
  );
}
export default Availablity;