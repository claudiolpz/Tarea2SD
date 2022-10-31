const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const { Kafka } = require("kafkajs");
const { client } = require("./db/dbconnector");
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
var venta=[]
var patentes=[]
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const diaria = async () => {
  while(true){
    var minutos=1; // para ejecutar cada dia, se debe cambiar el valor a 1440
    await sleep(1000*60*minutos)
    console.log("Calculando ventas diarias")
    client.connect((err,client,release) => {
        if(err){
          return console.error('Error acquiring client db',err.stack);
        }

      client.query("SELECT patente_carrito, count(*) as Tventas, count(distinct cliente) as Tcliente  FROM venta GROUP BY patente_carrito;",(err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }

        for(let i in result.rows){
          var {pat, total, tclient} = result.rows[i];
          var pat = result.rows[i].patente_carrito
          var total = result.rows[i].tventas
          var tclient = result.rows[i].tcliente
          var promedio = total/tclient
          console.log("El carrito con patente "+pat+" vendio en total "+total+" y tuvo "+tclient+" clientes. Su promedio de ventas por clientes fue de "+promedio)
        }
        });
      client.query("Delete from venta");
    });

  }
}


const main = async () => {
  const consumer = kafka.consumer({ groupId: "venta-group" });
  
  await consumer.connect();
  await consumer.subscribe({ topic: "Topic-Venta", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if(partition == 1)
      {
        console.log("Particion 1:  Realizando venta")
        var datos = JSON.parse(message.value.toString());
        venta.push(datos);  
        client.connect((err,client,release) => {

          if(err){

            return console.error('Error acquiring client db',err.stack);

          }

        client.query("INSERT INTO venta(cliente,cantidad_sopaipilla,hora,ubicacion,patente_carrito) values($1,$2,$3,$4,$5);",[venta[0].cliente, venta[0].cantidad, venta[0].hora, venta[0].ubicacion,venta[0].patente]);
        console.log("Venta insertado en base de datos con exito")
        venta.pop();
        });   

      }
    },
  })
}


diaria()

app.listen(port,host,()=>{
    console.log(`API-Blocked run in: http://localhost:${port}.`)
    main()
});
