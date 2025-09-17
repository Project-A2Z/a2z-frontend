'use clinet';
import React , {useState}from 'react';
import styles from './../../profile.module.css';
import Info from '../../../../components/UI/Profile/RightSection/Info';


const InformationSection = () => {
    const [user, setUser] = useState({ name: 'أحمد محمد', avatar: null as string | null });
    
  return (
    <div className={styles.information_section}>
        <Info user={user}/>
    </div>
  ); 
}   
export default InformationSection;