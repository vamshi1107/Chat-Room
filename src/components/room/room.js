import { collection,doc,getFirestore, setDoc ,addDoc,updateDoc, onSnapshot} from "@firebase/firestore";
import firebase from "../../database/firebase";
import {useEffect,useState} from 'react'
import { fetchpath, messagepath } from "../../utils/paths";
import { msgbuilder } from "../../utils/msgbuilder";
import  './room.css';
import GoogleLogin from "react-google-login";


const Room=(props)=>{

    var [data,setData]=useState([])
    const id=props.match.params.id
     var [user,setUser]=useState({})
    var [login,setLogin]=useState(false)
    const cid="68953686096-ib5j3874c8dji08huiq55qp7jq0gog1s.apps.googleusercontent.com"

   const firestore=getFirestore(firebase)
 
      async function sendMessage(){
       var message=getInput()

      const coll=doc(firestore,messagepath(id,new Date().toISOString()))
      const data=await setDoc(coll,msgbuilder(message,user),{merge:true})
      clearInput()


    }

    const getInput=()=>{
        return document.getElementById("imp").value
    }

    function clearInput(){
        document.getElementById("imp").value=""
    }

    async function getRooms(){
        onSnapshot(collection(firestore,fetchpath(id)),(snap)=>{
            const d=snap.docs.map(data=>data.data())
            setData(d)
            console.log(d)
        })
      
    }

    function keypress(e){
        if(e.key=="Enter"){
            sendMessage()
        }

    }

    function showMSG(e){
            if(e["user"].email===user.email){
                return (
                    <div className="wholemsg this">
                        <div className="userpic"><img src={e["user"].imageUrl}></img></div>
                            <div key={Math.random().toString()*10000} className="msg">
                                    <div className="uname">{e["user"]["name"]}</div>
                                   <div className="content">{e.message}</div>
                            </div>
                     </div>
                )
            }
            else{
                return (
                <div className="wholemsg other">
                <div className="userpic"><img src={e["user"].imageUrl}></img></div>
                    <div key={Math.random().toString()*10000} className="msg">
                        <div className="uname">{e["user"]["name"]}</div>
                        <div className="content">{e.message}</div>
                     </div>
               </div>
               )
            }
    }

    useEffect(() => {
         var data=JSON.parse(localStorage.getItem("user"))
        if(data){
            setUser({...data})
            setLogin(true)
        }
        getRooms()
    }, [])

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

    return (
        <div>
            {login?
                <div className="page">
                    <div className="side"></div>
                        <div className="canvas">
                            <div className="msgcon">
                                    {data.map(e=>{
                                        return (
                                            showMSG(e)
                                        )
                                    })}
                            </div>
                            <div className="sendcon">
                                    <div className="inpcon">
                                        <input type="text" id="imp" onKeyDown={keypress} placeholder="Write a message..." autoComplete="off"></input>
                                    </div>
                            </div>
                        </div>
                    </div>
             :
                <div>
                        <GoogleLogin    
                        clientId={cid}
                        buttonText="login with google"
                        cookiePolicy={"single_host_origin"}
                        onSuccess={loginsuccess}
                        onFailure={loginfailure}
                        ></GoogleLogin>
                </div>
            }
        
        </div>
    )
}

export default Room;