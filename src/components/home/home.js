import { collection,doc,getFirestore, setDoc ,addDoc,updateDoc, onSnapshot} from "@firebase/firestore";
import {getAuth,signInWithPopup,GoogleAuthProvider} from "@firebase/auth"
import firebase from "../../database/firebase";
import {useEffect,useState} from 'react'
import {randomBytes} from 'crypto'
import { useHistory } from "react-router";
import GoogleLogin from "react-google-login";

import './home.css';
import { decrypt, encrypt } from "../../utils/encryptor";
import { hostpath, statusfetchspath,memberspath } from "../../utils/paths";

const Home=(props)=>{

    const history=useHistory()
    const firestore=getFirestore(firebase)
    const auth=getAuth(firebase)
    const provider = new GoogleAuthProvider();
    var [user,setUser]=useState({})
    var [login,setLogin]=useState(false)

     const create=async ()=>{
        var id=randomBytes(16).toString("hex")
        var col=doc(firestore,hostpath(id))
        await setDoc(col,{"host":user})
        var status=doc(firestore,statusfetchspath(id))
        await setDoc(status,{"active":true})
        history.push("room/"+id)
    }

    function loginEx(){
        signInWithPopup(auth,provider).then(res=>{
            var data=res._tokenResponse
            setUser({...data})
            setLogin(true)
            localStorage.setItem("user",encrypt(JSON.stringify(data)))
        })
    }

    useEffect(()=>{
        var data=localStorage.getItem("user")
        if(data){
            data=JSON.parse(decrypt(data))
            setUser({...data})
            setLogin(true)
        }
    },[])

    return (
        <div className="pv">
            {
            !login?<button
                className="loginbut"
               onClick={(e)=>loginEx()}
            >Login</button>:
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