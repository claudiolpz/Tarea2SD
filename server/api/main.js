const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const { Kafka } = require("kafkajs");
const { client } = require("./db/dbconnector");

const app = express();
dotenv.config();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cors());

var port = process.env.PORT || 3000;
var host = process.env.PORT || '0.0.0.0';

var value = null;

var kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
});

app.post("/registrar", (req, res) => {
  (async () => {
      const producer = kafka.producer();
      await producer.connect();
      const { nombre, apellido, rut, mail, patente, premium } = req.body;
      let miembro = {
        nombre: nombre,
        apellido: apellido,
        rut: rut,
        mail: mail,
        patente: patente,
        premium: premium,
      }
      value = JSON.stringify(miembro);
      if(miembro["premium"] == 1){
        const topicMessages = [
          {
            topic: 'Topic-Miembros',
            partition : 1,
            messages: [{value: JSON.stringify(miembro), partition: 1}]
          },
        ]
        await producer.sendBatch({ topicMessages })
      }else{
        
        const topicMessages = [
          {
            topic: 'Topic-Miembros',
            partition:0,
            messages: [{value: JSON.stringify(miembro), partition: 0}]
          },
        ]
        await producer.sendBatch({ topicMessages })
      }

      await producer.disconnect();

      res.json("se registro al miembro");  
    })();

});




app.post("/venta", (req, res) => {
  (async () => {
      const producer = kafka.producer();

      await producer.connect();
      const { cliente, cantidad, patente, stock, ubicacion, hora} = req.body;
      let venta = {
        cliente: cliente,
        cantidad : cantidad,
        patente : patente,
        ubicacion:ubicacion,
        hora:hora
      }
      let Stock = {
        patente: patente,
        stock: stock
      }
      value = JSON.stringify(venta);

      const topicMessages = [         // Como especifico que cada topic debe tener dos particiones,
        {                             // se va a mandar los datos al server de stock por la particion 0 y
          topic: 'Topic-Venta',       // por la particion 1 se va manda datos a ventas (server)    
          partition:0,         
          messages: [{value: JSON.stringify(Stock), partition: 0}]
        },
        {
        topic: 'Topic-Venta',       
        partition:1,         
        messages: [{value: JSON.stringify(venta), partition: 1}]
        },
      ]
      
      await producer.sendBatch({ topicMessages})
      await producer.disconnect();

      res.json("stock mandado");  
    })();

});




app.post("/aviso", (req, res) => {
  (async () => {
      const producer = kafka.producer();
      await producer.connect();
      const { ubicacion, patente, estaperdido} = req.body;
      let aviso = {
        ubicacion: ubicacion,
        patente : patente,
        Isperdido: estaperdido
      }

      value = JSON.stringify(aviso);
      if(aviso["Isperdido"] == 1){
        const topicMessages = [
          {
            topic: 'Topic-Aviso',
            partition : 1,
            messages: [{value: JSON.stringify(aviso), partition: 1}]
          },
        ]
        await producer.sendBatch({ topicMessages })
      }else{
        
        const topicMessages = [
          {
            topic: 'Topic-Aviso',
            partition:0,
            messages: [{value: JSON.stringify(aviso), partition: 0}]
          },
        ]
        await producer.sendBatch({ topicMessages })
      }

      await producer.disconnect();

      res.json("Aviso mandado");  
    })();

});




app.get('/', (req, res) => {
  res.send("api-funciona con cara fachera facherita")
})

app.listen(port,host, () => {
  console.log(`API run in: http://localhost:${port}.`);
});
