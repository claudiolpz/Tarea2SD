const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const { Kafka } = require("kafkajs");

//---------------STOCK----------------------
const app = express()
dotenv.config()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())
app.use(cors())

var port = process.env.PORT || 7000;
var host = process.env.PORT || '0.0.0.0';

var kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
});

var stock = []
var contador=0;
const main = async () => {
  const consumer = kafka.consumer({ groupId: "stock-group" });
  
  await consumer.connect();
  await consumer.subscribe({ topic: "Topic-Venta", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      var value = JSON.parse(message.value.toString());
      
      if(partition == 0)
      {
        contador++;
        console.log("Particion 0, consulta numero "+contador);
        var find=false;
        for(let i=0; i<=stock.length-1; i++)
        {
          if(stock[i]["patente"] === value["patente"]){
            find=true;
            stock[i]["stock"] = value["stock"];
            console.log("actualizando stock de "+stock[i]["patente"]+" es "+stock[i]["stock"]);
          }
        }
        if(!find){
          stock.push({"patente":value["patente"],"stock":value["stock"]});
        }

        if(contador==5){
          for(let j=0; j<=stock.length-1; j++)
          {
            if(stock[j]["stock"]<20){
              console.log("Preparar reposicion al carro con patente"+stock[j]["patente"]);
              stock.splice(j,1)
              j--;
            }
            else{
              console.log("El carro con patente"+stock[j]["patente"]+"todavia no cumple el minimo para reposicion");
              stock.splice(j,1)
              j--;
            }
          }
          contador=0;
        }
      }
    },
  })


}

app.listen(port,host,()=>{
    console.log(`API-Blocked run in: http://localhost:${port}.`)
    main()

});