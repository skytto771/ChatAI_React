import { useEffect } from "react";
import { useNavigate } from "react-router"
import ChatPage from "../ChatPage";
import styles from './index.module.scss'
import { http,session } from '@/utils'
import api from "@/api";
import { useUserStore } from "@/store";

function App() {
    const navigate = useNavigate()
    const userStore = useUserStore()

    const getUserInfo = async (userId:string)=>{
        const res = await http.post(api.user.detail, {id: userId})
        userStore.setUser(res.data)
    }

    useEffect(()=>{
        const auth = session.getSession()
        if(!auth){
            navigate('/login')
        }
        return ()=>{
            getUserInfo(auth.userId)
        }
    },[])

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