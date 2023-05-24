const express=require('express')
const router=express.Router({mergeParams:true})
const User=require("../models/User")
const auth=require('../middleware/auth.middleware')

router.get('/',auth, async(req,res)=>{
  try {
    const list=await User.find()
    res.status(200).send(list)
  } catch (error) {
    res.status(500).json({message:"oшибка"})
  }
})


router.patch('/:userId', async(req,res)=>{
  try {
    const {userId}=req.params
if(userId===req.user._id){
  const updateUser=await User.findByIdAndUpdate(userId,req.body,{new:true})
  res.status(200).send(updateUser)
}else{
  res.status(401).json({message:"Unauthorized"})
}

  } catch (error) {
    res.status(500).json({message:"oшибка"})
  }
})

module.exports=router