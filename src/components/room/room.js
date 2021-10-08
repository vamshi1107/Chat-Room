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
     let audio=new Audio("https://firebasestorage.googleapis.com/v0/b/chatroom-9f810.appspot.com/o/Iphone%20Ting%20Message%20Tone.mp3?alt=media&token=dd314fce-ced4-4bc3-82b1-12d669e26ae1")
     var areu=false


   const firestore=getFirestore(firebase)
 
    async function sendMessage(){
        var message=getInput()
        var c=message;
        if(c.replace(" ","").length > 0){
            const coll=doc(firestore,messagepath(id,new Date().toISOString()))
            const data=await setDoc(coll,msgbuilder(message,user),{merge:true})
        }

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
                        if(!checkdup(v,i)){
                            v.push(i["member"])
                        }
                }
                setMembers(v)
            }
            else{
                addDoc(coll,{"member":d},{merge:true})
            }
        })
    }

    function checkdup(v,i){
        var c=false
        for(let j of v){
            if(j["email"]==i["member"]["email"]){
                c=true
            }
        }
        return c
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
            ring(d,JSON.parse(localStorage.getItem("user")))     
        })
      
    }

    function ring(d,user){
        var v=d
        var c=Array.from(v).pop()
        if(user){
            if(c["user"]["email"]!=user.email){
                audio.play()
            }
         }  
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

    function focus(){
        var v=document.querySelectorAll(".wholemsg")
        var c=Array.from(v).pop()
        if(c){
            c.focus()
            c.scrollIntoView();
        }
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
                                {focus()} 
                            </div>
                            <div className="sendcon">
                                    <div className="inpcon">
                                        <input type="text" id="imp" onKeyDown={keypress} placeholder="Write a message..." autoComplete="off"></input>
                                    </div>
                            </div>
                        </div>
                    </div>
             :
                 <div className="pv">
                   <GoogleLogin
                  clientId={cid}
                  buttonText="Login with google"
                  cookiePolicy={"single_host_origin"}
                  onSuccess={loginsuccess}
                  onFailure={loginfailure}
                ></GoogleLogin>
                    <div>
                            <lottie-player src="https://assets3.lottiefiles.com/private_files/lf30_gqs2uqht.json"   speed="1"  style={{height:"50vh"}}  loop  autoplay></lottie-player>
                    </div> 
        </div>
            }
        
        </div>
    )
}

export default Room;