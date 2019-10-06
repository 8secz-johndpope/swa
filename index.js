const mysql = require('mysql')
const MySQLEvents = require('@patrickwalker/mysql-events');
const sulla = require('./controllers/initializer')

const mysqlConfig = {
  connectionLimit : 10,
  host            : '192.168.1.99',
  user            : 'root',
  password        : 'pkm',
  database        : 'simpus'
}
const eventConfig = {
  startAtEnd: true,
  excludedSchemas: {
    mysql: true,
  },
}

class mysqlAndWa {
  constructor( { mysqlConfig, eventConfig } ) {
    this.pool = mysql.createPool(mysqlConfig);
    this.eventConfig = eventConfig
    this.client = false
  }

  async getConnection() {
    await new Promise ( resolve => this.pool.getConnection( async (err, connection) => {
      if(err){
        console.error(err)
        await this.getConnection()
      } else {
        console.log('connected')
        this.connection = connection
        resolve()
      }
    }))
  }

  async init() {
    await this.getConnection()
    if(!this.client) {
      this.client = await sulla.create()
    }
    this.instance = new MySQLEvents(this.connection, this.eventConfig);
    await this.instance.start()
    this.instance.addTrigger({
      name: 'NEW_VISITS',
      expression: 'simpus.visits',
      statement: MySQLEvents.STATEMENTS.ALL, //INSERT,
      onEvent: async (event) => { // You will receive the events here
        await this.client.sendText( `6287833597999@c.us`, JSON.stringify(event))
      },
    });
      
    this.instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, async (err) => {
      console.error(err)
      await this.client.sendText( `6287833597999@c.us`, JSON.stringify(err))
      console.log('restart instance')
      await this.client.sendText( `6287833597999@c.us`, 'restart instance')
      await this.instance.stop()
      await this.init()
    });
    this.instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, async (err) => {
      console.error(err)
      await this.client.sendText( `6287833597999@c.us`, JSON.stringify(err))
      console.log('restart instance')
      await this.client.sendText( `6287833597999@c.us`, 'restart instance')
      await this.instance.stop()
      await this.connection.release()
      await this.init()
    });
  }
}

let a = new mysqlAndWa( { mysqlConfig, eventConfig } )

;(async() => await a.init())()