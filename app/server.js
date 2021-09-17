const sql = require('mssql')

const config = {
    user: process.env.username,
    password: process.env.password,
    server: process.env.host, 
    database: process.env.database,
}

module.exports = { 
  main: async function (event, context) {
    try {
      const method = event.extensions.request.method
      const order_id = event.extensions.request.path.split("/")[2];
      const pool = await sql.connect(config)
      const request = new sql.Request()
      
      switch(method) {
        case "GET":
          if(order_id){
            return await getOrder(request, order_id);
          }else{
            return await getOrders(request);
          } 
        case "POST":
          return await addOrder(request, event.data);
        case "PUT":
          return await editOrder(request, event.data);
        case "DELETE":
          return await deleteOrder(request, order_id);
        default:
          event.extensions.response.status(500).json({"message": "Unhandled method was received", "error": "Unhandled method was received"});
      }
    } catch (err) {
        // ... error checks
        console.log("ERROR catch: ", err);
        event.extensions.response.status(500).json({"message": "An error occurred during execution", "error": err});
    }
    
    sql.on('error', err => {
      // ... error handler
      console.log("ERROR handler: ", error);
      event.extensions.response.status(500).json({"message": "Connection to the database could not be established", "error": err});
    })
  }
}

async function getOrders(request){
  try{
    let result = await request.query('select * from Orders')
    return result.recordsets[0];
  }catch(err){
    throw err;
  }
}

async function getOrder(request, order_id){
  try{
    let result = await request.query(`select * from Orders where order_id = '${order_id}'`)
    return result.recordsets[0];
  }catch(err){
    throw err;
  }
}

async function addOrder(request, data){
  try{
    let result = await request.query(`insert into Orders (order_id, description) values ('${data.order_id}', '${data.description}'); select * from Orders where order_id = '${data.order_id}'`);
    return result.recordsets[0];
  }catch(err){
    throw err
  }
}

async function editOrder(request, data){
  try{
    let result = await request.query(`update Orders set description = '${data.description}' where order_id = '${data.order_id}'; select * from Orders where order_id = '${data.order_id}'`);
    return result.rowsAffected;
  }catch(err){
    throw err
  }
}

async function deleteOrder(request, order_id){
  try{
    let result = await request.query(`delete from Orders where order_id = '${order_id}'`);
    return result.rowsAffected;
  }catch(err){
    throw err
  }
}
