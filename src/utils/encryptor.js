const crypto=require("crypto-js")

const secret=process.env.REACT_APP_SECRET

export const encrypt=(msg)=>{
    return crypto.AES.encrypt(msg,secret).toString()
}

export const decrypt=(msg)=>{
    return crypto.AES.decrypt(msg,secret).toString(crypto.enc.Utf8)
}

