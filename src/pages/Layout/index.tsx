import { useEffect } from "react";
import { session } from '@/utils/sessionUtil'
import { useNavigate } from "react-router"
import ChatPage from "../ChatPage";
import styles from './index.module.scss'

function App() {
    const navigate = useNavigate()
    // useEffect(()=>{
    //     const token = session.getSession()
    //     if(!token){
    //         navigate('/login')
    //     }
    // })

    return (
        <>
            <div className={styles.layout}>
                <div className={styles.mainContainer}>

                    <ChatPage></ChatPage>
                </div>
            </div>
        </>
    );
}

export default App;