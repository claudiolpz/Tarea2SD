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

var port = process.env.PORT || 8000;
var host = process.env.PORT || '0.0.0.0';

var kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
});


const main = async () => {
  const consumer = kafka.consumer({ groupId: "stock-group" });
  
  await consumer.connect();
  await consumer.subscribe({ topic: "Topic-Venta", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      var value = JSON.parse(message.value.toString());
      console.log("AAAAA");
      if(partition == 1)
      {
        console.log("hLAALALALLA")
      }
    },
  })


}

app.listen(port,host,()=>{
    console.log(`API-Blocked run in: http://localhost:${port}.`)
    main()

});