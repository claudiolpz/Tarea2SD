const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const { Kafka } = require("kafkajs");
//-----------------_AVISO---------------
const app = express()
dotenv.config()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())
app.use(cors())

var port = process.env.PORT || 6000;
var host = process.env.PORT || '0.0.0.0';

var kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
});


var carro = []
var perdido = []

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const ubicacion_check = async () => {
  while(true){
    await sleep(5000)
    for(let i=0; i<=carro.length-1; i++)
    {
      console.log(Date.now()/1000 - carro[i]["tiempo"])
      if((Date.now()/1000 - carro[i]["tiempo"]) > 60){
        console.log("Borrando ubicacion de carro:",carro[i]["patente"]);
        carro.splice(i,1);
      }
    }
  }
}

const main = async () => {
  const consumer = kafka.consumer({ groupId: "ubicacion-group" });
  
  await consumer.connect();
  await consumer.subscribe({ topic: "Topic-Aviso", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      var value = JSON.parse(message.value.toString());

      if(partition == 0)
      {
        console.log("Entra en Particion 0")
        console.log("El carro esta bien")
        
        var find = false;
        for(let i=0; i<=carro.length-1; i++)
        {
          if(carro[i]["patente"] === value["patente"]){
            find = true;
            carro[i]["ubicacion"] = value["ubicacion"];
            carro[i]["tiempo"] = Date.now()/1000;
            console.log(carro[i]["tiempo"]);
            console.log("actualizando ubicacion de carro "+carro[i]["patente"]+" a "+carro[i]["ubicacion"]);
          }
        }
        if(!find){
          carro.push({"patente":value["patente"],"ubicacion":value["ubicacion"],"tiempo":Date.now()/1000});
          console.log("insertando ubicacion de carro "+value["patente"],"(Ubicacion:",value["ubicacion"]+")")
        }
        

      }
      else if(partition == 1)
      {
        perdido.push(value["ubicacion"]);
        console.log("Entra en Particion 1")
        console.log("Este carro esta perdido, patente:", value["patente"])
        console.log(perdido)
      }
    },
  })
}

ubicacion_check()

app.listen(port,host,()=>{
    console.log(`API-Blocked run in: http://localhost:${port}.`)
    main()
});
