const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const { Kafka } = require("kafkajs");
const { client } = require("./db/dbconnector");
//------------REGISTRAR MIEMBRO------------------
const app = express()
dotenv.config()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())
app.use(cors())

var port = process.env.PORT || 4000;
var host = process.env.PORT || '0.0.0.0';

var kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
});

var premium = [];
var normales = [];
var aux=[];
var contador=0;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const registrar_normal = async () => {
  while(true){
    var minutos = 1; // para un mes son 43800 minutos, cambiar esta variable para que funcione con registro de cada mes
    await sleep(1000*60*minutos) 

    for(let i = 0; i < normales.length; i++) {
      client.connect((err,client,release) => {
        if(err){
          return console.error('Error acquiring client db',err.stack);
        }
      client.query("INSERT INTO miembros(nombre,apellido,rut,correo_dueno,patente_carrito,ispremium) values($1,$2,$3,$4,$5,$6);",[normales[0].nombre, normales[0].apellido, normales[0].rut, normales[0].mail, normales[0].patente,normales[0].premium]);
      console.log("Miembro insertado en la base de datos")
      normales.splice(i,1);
      i--;
      });
    }
  }
    
}



const main = async () => {
  const consumer = kafka.consumer({ groupId: "grupo-miembros" });
  await consumer.connect();
  await consumer.subscribe({ topic: "Topic-Miembros", fromBeginning: true });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("Registrando Miembro...");
      if(partition == 1)
      {
        console.log("Particion 1:  Registro Miembros Premium")
        var miembro = JSON.parse(message.value.toString());
        premium.push(miembro); 
        
        if(premium.length > 0)
        {
          client.connect((err,client,release) => {
            if(err){
              return console.error('Error acquiring client db',err.stack);
            }
      
          client.query("INSERT INTO miembros(nombre,apellido,rut,correo_dueno,patente_carrito,ispremium) values($1,$2,$3,$4,$5,$6);",[premium[0].nombre, premium[0].apellido, premium[0].rut, premium[0].mail, premium[0].patente,premium[0].premium]);
          console.log("Miembro premium insertado en la base de datos")
          premium.pop();
          });
        
        }
      }
      else if(partition == 0)
      {
        console.log("Particion 0: Registro usuarios no premium")
        var miembro = JSON.parse(message.value.toString());
        normales.push(miembro);
        contador++;
      }
    },
  })
}
registrar_normal()
app.listen(port,host,()=>{
    console.log(`Registro de miembros in: http://localhost:${port}.`)
    main()
});
