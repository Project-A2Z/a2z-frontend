import styles from './card.module.css';
function Availablity ({available = true}: {available?: boolean}) {
  return (
    <div >
      {available ? (
        <span className={styles.availableText}> متوفر في المخزون</span>
      ) : (
        <span className={styles.unavailableText}>نفذ من المخزون</span>
      )}
    </div>
  );
}
export default Availablity;