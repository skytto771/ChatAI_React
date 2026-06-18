import { useEffect } from "react";
import ChatPage from "../ChatPage";
import styles from "./index.module.scss";
import { http, session } from "@/utils";
import api from "@/api";
import { useUserStore } from "@/store";

function App() {
  const userStore = useUserStore();

  useEffect(() => {
    const auth = session.getSession();
    if (auth?.userId) {
      http.post(api.user.detail, { id: auth.userId }).then((res) => {
        userStore.setUser(res.data);
      });
    }
  }, []);

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
