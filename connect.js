var BufferMaker = require('buffermaker');
var crypto = require('crypto');
var net = require('net');

function VersionMessage(){
  this.version = 70012;
	this.services = 0;
	this.timestamp = Date.now();
	this.addrRecvIp = '127.0.0.1';
	this.addrRecvPort = 18445;
	this.addrTransIp = '127.0.0.1';
	this.addrTransPort = 18444;
	this.nonce = crypto.randomBytes(8);
	this.userAgent = 0;
	this.startHeight = 1;
	this.relay = false;
}

VersionMessage.prototype = {
  constructor: VersionMessage,
	serialize: function(){
	  var msg =  new BufferMaker()
	  .UInt32LE(this.version)
		.Int64BE(this.services)
		.Int64BE(this.timestamp)
		.Int64BE(this.services)
		.Int64BE(0)//placeholder forip addr
		.Int64BE(0)
		.UInt16BE(this.addrRecvPort)
		.Int64BE(this.services)
		.Int64BE(0)//placeholder forip addr
		.Int64BE(0)
		.UInt16BE(this.addrTransPort)
		.Int64BE(this.nonce)
		.UInt8(this.userAgent)
		.Int32LE(this.startHeight)
		.UInt8(this.relay)
		.make()
		msg.write(this.addrRecvIp, offset=28)
		msg.write(this.addrTransIp, offset=48)
	  return msg;	
	}
}

function MessageHeader(){
  this.magicNumber = 0xfabfb5da;
	this.commandName = 'version\0\0\0\0\0';
	this.payloadSize = 0;
	this.checksum = 0;
	this._payload = undefined;
}

MessageHeader.prototype = {
  constructor: MessageHeader,
	payload: function(payload){
	  this._payload = payload;
		this.payloadSize = payload.length;
		var sha256 = crypto.createHash('sha256');
		//sha256.update(payload);
		this.checksum = crypto.createHash('sha256').update(sha256.update(payload).digest('hex')).digest('hex').substring(0,8)
	  return this;
	},
	serialize: function(){
	  return new BufferMaker()
		  .UInt32LE(this.magicNumber)
			.string(this.commandName)
			.UInt32LE(this.payloadSize)
			.string(this.checksum)
			.make();
	}
}

var con = new net.Socket();
con.connect(18444,'127.0.0.1', function(){
  console.log('connected');
  var msg = new VersionMessage().serialize();
	var header = new MessageHeader().payload(msg).serialize();
	con.write(Buffer.concat([header,msg]));
	console.log('msg sent');
});
con.on('data', function(data){
  console.log('Reply: ' + data);
});
