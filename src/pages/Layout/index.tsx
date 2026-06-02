import { useEffect } from "react";
import { session } from '../../utils/sessionUtil'
import { useNavigate } from "react-router"

function App() {
    const navigate = useNavigate()
    useEffect(()=>{
        const token = session.getSession()
        if(!token){
            navigate('/login')
        }
    })

    return (
        <>
            <div className="layout"></div>
        </>
    );
}

export default App;