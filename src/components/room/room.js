import { collection,doc,getFirestore, setDoc ,addDoc,updateDoc, onSnapshot, DocumentSnapshot} from "@firebase/firestore";
import firebase from "../../database/firebase";
import {useEffect,useState} from 'react'
import { fetchpath, memberspath, messagepath ,memberfetchspath} from "../../utils/paths";
import { msgbuilder } from "../../utils/msgbuilder";
import  './room.css';
import GoogleLogin from "react-google-login";


const Room=(props)=>{

    var [data,setData]=useState([])
    var [members,setMembers]=useState([])
    const id=props.match.params.id
     var [user,setUser]=useState({})
    var [login,setLogin]=useState(false)
    const cid="68953686096-d71ouf7jgcso0fjbqtseo761kjqnurta.apps.googleusercontent.com"

   const firestore=getFirestore(firebase)
 
    async function sendMessage(){
        var message=getInput()
        const coll=doc(firestore,messagepath(id,new Date().toISOString()))
        const data=await setDoc(coll,msgbuilder(message,user),{merge:true})
        

        clearInput()
    }


    async function checkMembers(d){
        var coll=collection(firestore,memberspath(id))
         onSnapshot(coll,(snap)=>{
            const mem=snap.docs.map(data=>data.data())
            var there=false
            for(let i of mem){
                if(i["member"]["email"]==d.email){
                    there=true
                }
            }
            if(there){
                var v=[]
                for(let i of mem){
                        v.push(i["member"])
                }
                setMembers(v)
            }
            else{
                addDoc(coll,{"member":d},{merge:true})
            }
        })
    }

    const getInput=()=>{
        return document.getElementById("imp").value
    }

    function clearInput(){
        document.getElementById("imp").value=""
    }

    async function getMessages(){
        onSnapshot(collection(firestore,fetchpath(id)),(snap)=>{
            const d=snap.docs.map(data=>data.data())
            setData(d)
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
                            <div key={Math.random().toString()*100000} className="msg">
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
                    <div key={Math.random().toString()*100000} className="msg">
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
            checkMembers(data)
            getMessages()
            checkMembers(data)
            getMessages()
        }
    }, [])

  function loginsuccess(response){
         var data=response.profileObj
         setUser({...data})
         setLogin(true)
        localStorage.setItem("user",JSON.stringify(data))
        window.location.reload()
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
                    <div className="side">
                        <div className="memcon">
                            {members.map(mem=>{
                                return (
                                    <div className="mem">
                                        <div className="memimg">
                                          <img src={mem["imageUrl"]}></img>
                                        </div>
                                        <div className="memname">{mem["name"]}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
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