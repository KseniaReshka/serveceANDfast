const express=require('express')
const chalk=require('chalk')
const config=require('config')
const mongoose=require('mongoose')
const initDatabase=require('./startUp/initDataBase.js')
const routes=require('./routes')

const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use('/api', routes)

const PORT=config.get('port') ?? 8080

async function start(){
  try {
    mongoose.connection.once('open',()=>{
      initDatabase()
    })
    await mongoose.connect(config.get('mongoUri'))
    
    app.listen(PORT, ()=>{console.log(`hi ${PORT}`);})
  } catch (error) {
    console.log(chalk.red(error.message))
    process.exit(1)
  }
}
start() 