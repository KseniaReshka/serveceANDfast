const express=require('express')
const router=express.Router({mergeParams:true})
const {check, validationResult}= require('express-validator')
const User=require('../models/User')
const bcrypt=require('bcryptjs') 
const { generateUserData } = require('../utils/halper')
const tokenService=require('../services/token.service')
const Token = require('../models/Token')

router.post("/signUp", [
  check('email', 'некоректный email').isEmail(),
  check('password', 'минимум 8 символов').isLength({min:8}),
  async (req,res)=>{
    console.log("body",req.body);
  try {
    const {email,password}=req.body
    console.log("email",email);
    const extingUser=await User.findOne({email:email})
    console.log("extingUser",extingUser);
    if(extingUser){
      return res.status(400).json({
        error:{message:'EMAIL_EXISTS',
        code:400
      }
    })}
    const hashedPassword=await bcrypt.hash(password,12)
    console.log("hashedPassword",hashedPassword);
    const newUser=await User.create({
      ...generateUserData(),
      ...req.body,
      password:hashedPassword
    })
    console.log("newUser",newUser);
    const tokens=await tokenService.generate({_id:newUser._id})
    await tokenService.save(newUser._id, tokens.refreshToken)
    res.status(200).send({...tokens,userId:newUser._id})
  } catch (error) {
    res.status(500).json({message:"oшибка"})
  }

}])


router.post('/signInWithPassword', [
  check('email','email некорректный').normalizeEmail().isEmail(),
  check('password','пароль не должен быть пустым').exists(),
  async(req,res)=>{
try {
const errors=validationResult(req)
console.log("error", errors); 
if(!errors.isEmpty()){
  return res.status(400).json({
    error:{
message:'INVALID_DATA',
code:400
    }
  })
}
console.log("body",req.body)
const {email,password}=req.body
console.log("email", email);
const extingUser=await User.findOne({email:email})
console.log("extingUser", extingUser);
if(!extingUser){
  return res.status(400).json({
    error:{message:'EMAIL_NOT_FOUND',
    code:400
  }
})}
const isPasswordEqual=await bcrypt.compare(password,extingUser.password)
if(!isPasswordEqual){
  return res.status(400).json({
    error:{message:'INVALID_PASSWORD',
    code:400
  }})
}

const tokens=await tokenService.generate({_id:extingUser._id})
console.log("etokens", tokens)
    await tokenService.save(extingUser._id, tokens.refreshToken)
    res.status(201).send({...tokens,userId:extingUser._id})

} catch (error) {
  res.status(500).json({message:"oшибка"})
}
}])


function isTokenInvalid(data, dbToken){
return !data||!dbToken||data._id!==dbToken?.user?.toString()
}

router.post('/token', async(req,res)=>{
  try {

    const {refresh_token: refreshToken}=req.body
   
    tokenService.validateRefresh(refreshToken)
    const dbToken= await tokenService.findToken(refreshToken)
    if(isTokenInvalid(data, dbToken)){
      return res.status(401).json({message:'Unauthorized'})
    }
    const tokens= await tokenService.generate({_id:data._id})
await tokenService.save(data._id, tokens.refreshToken)
res.status(200).send({...tokens, userId:data._id})
    } catch (error) {
      res.status(500).json({message:"oшибка"})
    }
})
module.exports=router