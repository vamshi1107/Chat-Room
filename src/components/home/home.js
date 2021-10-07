import { collection,doc,getFirestore, setDoc ,addDoc,updateDoc, onSnapshot} from "@firebase/firestore";
import firebase from "../../database/firebase";
import {useEffect,useState} from 'react'
import {randomBytes} from 'crypto'
import { useHistory } from "react-router";
import GoogleLogin from "react-google-login";

import './home.css';

const Home=(props)=>{

    const history=useHistory()
    const firestore=getFirestore(firebase)
    var [user,setUser]=useState({})
    var [login,setLogin]=useState(false)
    const cid="68953686096-d71ouf7jgcso0fjbqtseo761kjqnurta.apps.googleusercontent.com"

     const create=async ()=>{
        var id=randomBytes(16).toString("hex")
        var col=doc(firestore,"rooms/"+id+"/room/user")
        var v=await setDoc(col,{"host":user})
        history.push("room/"+id)
    }

    function loginsuccess(response){
         var data=response.profileObj
         setUser({...data})
         setLogin(true)
        localStorage.setItem("user",JSON.stringify(data))
    }

    function loginfailure(response){
        setLogin(false)
         setUser({})
    }

    function logoutsuccess(response){
        setLogin(false)
         setUser({})
    }

    function logoutfailure(response){
        console.log(response)
    }

    useEffect(()=>{
        var data=JSON.parse(localStorage.getItem("user"))
        if(data){
            setUser({...data})
            setLogin(true)
        }
    },[])

    return (
        <div className="pv">
            {
            !login?<GoogleLogin
                  clientId={cid}
                  buttonText="Login with google"
                  cookiePolicy={"single_host_origin"}
                  onSuccess={loginsuccess}
                  onFailure={loginfailure}
                ></GoogleLogin>:
                <div>
                        <button onClick={(e)=>{create()}} id="createbut">Create</button>
                </div>
            }
             <div>
                    <lottie-player src="https://assets3.lottiefiles.com/private_files/lf30_gqs2uqht.json"   speed="1"  style={{height:"50vh"}}  loop  autoplay></lottie-player>
            </div>
            
            
        </div>
    )
}

export default Home;