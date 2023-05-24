const proffesionMock=require('../mock/professions.json')
const qualitiesMock=require('../mock/qualities.json')
const Profession=require('../models/Profession')
const Quality=require('../models/Quality')


module.exports= async () => {
const professions= await Profession.find()
if(professions.length !==proffesionMock.length){
  await createInitialEntity(Profession,proffesionMock)
}
const qualitys= await Quality.find()
if(qualitys.length !==qualitiesMock.length){
  await createInitialEntity(Quality,qualitiesMock)
}
}

async function createInitialEntity(Model, data){
  await Model.collection.drop()
  return Promise.all(
    data.map(async item=>{
      try {
        delete item._id
        const newItem=new Model(item)
        await newItem.save()
        return newItem
      } catch (error) {
        return error
      }
    })
  )
}