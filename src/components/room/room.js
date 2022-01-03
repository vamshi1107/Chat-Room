import { collection,doc,getFirestore, setDoc ,addDoc,updateDoc, onSnapshot, DocumentSnapshot,getDoc,getDocs} from "@firebase/firestore";
import firebase from "../../database/firebase";
import {useEffect,useState} from 'react'
import { fetchpath, memberspath, messagepath ,memberfetchspath, statusfetchspath} from "../../utils/paths";
import { msgbuilder } from "../../utils/msgbuilder";
import  './room.css';
import {getAuth,signInWithPopup,GoogleAuthProvider} from "@firebase/auth"
import { decrypt, encrypt } from "../../utils/encryptor";

const Room=(props)=>{

    var [data,setData]=useState([])
    var [status,setStatus]=useState(false)
    var [members,setMembers]=useState([])
    var [login,setLogin]=useState(false)
    var [user,setUser]=useState({})

    const id=props.match.params.id

    const auth=getAuth(firebase)
    const provider = new GoogleAuthProvider();
   
    let audio=new Audio("https://firebasestorage.googleapis.com/v0/b/chatroom-9f810.appspot.com/o/Iphone%20Ting%20Message%20Tone.mp3?alt=media&token=dd314fce-ced4-4bc3-82b1-12d669e26ae1")


   const firestore=getFirestore(firebase)

    useEffect(async() => {
        var data=localStorage.getItem("user")
        if(data){
            data=JSON.parse(decrypt(data))
            setUser({...data})
            setLogin(true)
            if(checkstatus()){
                checkMembers(data)
                getMessages()
                checkMembers(data)
                getMessages()
            }
        }
    }, [])
 
       const  checkstatus=async()=>{
            var stat=doc(firestore,statusfetchspath(id))
            var res=await getDoc(stat)
            setStatus(res.data()["active"])
            setListerner()
            return res.data()["active"]
       }
     
       const setListerner= async()=>{
            var stat=doc(firestore,statusfetchspath(id))
            await onSnapshot(stat,(snap)=>{
                setStatus(snap.data()["active"])
            })
       }

    async function sendMessage(){
        var message=getInput()
        var c=message;
        if(c.replaceAll(" ","").length > 0){
            clearInput()
            const coll=doc(firestore,messagepath(id,new Date().toISOString()))
            message=encrypt(message)
            const data=await setDoc(coll,msgbuilder(message,user),{merge:true})
        }
    }


     async function checkMembers(d){
        var coll=collection(firestore,memberspath(id))
         onSnapshot(coll,(snap)=>{
            const mem=snap.docs.map(data=>data.data())
            var there=false
            for(let i of mem){
                if(i["email"]==d.email){
                    there=true
                }
            }
            if(there){
                var v=[]
                for(let i of mem){
                    if(!checkdup(v,i)){
                        v.push(i)
                    }
                }
                setMembers(v)
            }
            else{
                addDoc(coll,d)
            }
        })
    }

    function checkdup(v,i){
        var c=false
        v.forEach(j=>{
                if(j["email"]==i["email"]){
                                c=true
                    }
        })
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
            var d=snap.docs.map(data=>data.data())
            d=d.map(ele=>{
                var v={...ele}
                v["message"]=decrypt(v["message"])
                return v
            })
            setData(d)
        })
      
    }


    function ring(d,user){
        var v=d
        var c=Array.from(v).pop()
        if(user!=undefined){
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

    function debug(e){
        return (<div></div>)
    }

    function showMSG(e){
                return (
                    <div className={e["user"].email===user.email?"wholemsg this":"wholemsg other"}>
                        {debug(e)}
                    <div className="userpic"><img src={e["user"].photoUrl}></img></div>
                        <div key={Math.random().toString()*100000} className="msg">
                            <div className="uname">{e["user"]["fullName"]}</div>
                            <div className="content" >{e.message}</div>
                        </div>
                </div>
                )
    }

      function loginEx(){
        signInWithPopup(auth,provider).then(res=>{
            var data=res._tokenResponse
            setUser({...data})
            setLogin(true)
            localStorage.setItem("user",encrypt(JSON.stringify(data)))
            window.location.reload()
        })
    }

    function focus(){
        var v=document.querySelectorAll(".wholemsg")
        var c=Array.from(v).pop()
        if(c){
            c.focus()
            c.scrollIntoView();
        }
    }

    const closeRoom=async (e)=>{
         var stat=doc(firestore,statusfetchspath(id))
         var k= await updateDoc(stat,{"active":false})
         setStatus(false)
    }

    const closedMsg=()=>{
        return (
            <div className="page">
                
            </div>
        )
    }

    return (
        <>
        {login?<>
            {status==true?
                        <div className="page">
                            <div className="side">
                                <div className="memcon">
                                    {members.map(mem=>{
                                        return (
                                            <div className="mem">
                                                <div className="memimg">
                                                <img src={mem["photoUrl"]}></img>
                                                </div>
                                                <div className="memname">{mem["fullName"]}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="ctrls">
                                    <button className="ctrlbut" id="close" onClick={e=>{closeRoom(e)}}>close</button>
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
                    <div>{closedMsg()}</div>
                    }
                    </>
                    :
                        <div className="pv">
                            <button className="loginbut" onClick={loginEx}>
                                Login
                            </button>
                                <div>
                                        <lottie-player src="https://assets3.lottiefiles.com/private_files/lf30_gqs2uqht.json"   speed="1"  style={{height:"50vh"}}  loop  autoplay></lottie-player>
                                </div> 
                        </div>
                    
                }
        </>
        )
}

export default Room;