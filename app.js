// Homey App for Byron DB series doorbells

// Author: Erwin Dondorp
// E-Mail: byrondb@dondorp.com

// PUSH BUTTONs
// ============
// 90017 (tested)

// DOOR CHIMEs
// ===========
// DB401E (tested)

'use strict';

const Homey = require('homey');

// remember when the bells last sounded
// so that we don't trigger too often
// and so that we can help with pairing
const Global = require('../drivers/global.js');
Global.allLastRings = {};

let buttonPressedTriggerGeneric = new Homey.FlowCardTrigger('receive_signal_generic');
buttonPressedTriggerGeneric.register();

let buttonPressedTriggerPaired = new Homey.FlowCardTrigger('receive_signal_paired');
buttonPressedTriggerPaired.register();

// create & register a signal using the id from your app.json
let byronDbSignal = new Homey.Signal433('ByronDbSignal');
byronDbSignal.register()
	.then(() => {
		console.log("byronDbSignal.register.then");

		// Other payloads
		// payload: 0,1,0,1,1,0,0,1,0,1,0,0,0,1,1,0,1,1,0,1,0,1,0,1,1,0,0,1,0,0,1,1
		// TODO

		byronDbSignal.on('payload', function(payload, first) {
			//console.log('received: signal:[' + payload + '], first:' + first);

			// get the values from the bit-patterns
			var byte0 =
				payload[0+0*8] * 128 +
				payload[1+0*8] * 64 +
				payload[2+0*8] * 32 +
				payload[3+0*8] * 16 +
				payload[4+0*8] * 8 +
				payload[5+0*8] * 4 +
				payload[6+0*8] * 2 +
				payload[7+0*8] * 1;
			var byte1 =
				payload[0+1*8] * 128 +
				payload[1+1*8] * 64 +
				payload[2+1*8] * 32 +
				payload[3+1*8] * 16 +
				payload[4+1*8] * 8 +
				payload[5+1*8] * 4 +
				payload[6+1*8] * 2 +
				payload[7+1*8] * 1;
			var byte2 =
				payload[0+2*8] * 128 +
				payload[1+2*8] * 64 +
				payload[2+2*8] * 32 +
				payload[3+2*8] * 16 +
				payload[4+2*8] * 8 +
				payload[5+2*8] * 4 +
				payload[6+2*8] * 2 +
				payload[7+2*8] * 1;
			var byte3 =
				payload[0+3*8] * 128 +
				payload[1+3*8] * 64 +
				payload[2+3*8] * 32 +
				payload[3+3*8] * 16 +
				payload[4+3*8] * 8 +
				payload[5+3*8] * 4 +
				payload[6+3*8] * 2 +
				payload[7+3*8] * 1;
			var buttonId = 256 * 256 * 256 * byte0 + 256 * 256 * byte1 + 256 * byte2 + byte3;

			// Controller may return multiple events with "first=true"
			// Therefore we use our own mechanism
			// Administation is per buttonId
			var now = Date.now();
			var lastRing = Global.allLastRings[buttonId];
			if(lastRing === undefined)
				lastRing = {"dateTime":0};
			var millis = now - lastRing.dateTime;
			if(millis < 5000)
			{
				// Accept only one ring within 5 seconds
				// console.log('IGNORED button: [' + payload + ']=' + buttonId + ', first: " + first);
				return;
			}

			Global.allLastRings[buttonId] = {"dateTime":now};

			console.log('buttonId: [' + payload + ']=' + buttonId);

			var tokensGeneric = {
				'buttonId': buttonId,
				};
			var stateGeneric = {
				};
			buttonPressedTriggerGeneric
				.trigger(tokensGeneric, stateGeneric)
				.catch(this.error)
				.then(this.log);

			var tokensPaired = {
				'buttonId': buttonId,
				};
			var statePaired = {
				};
			buttonPressedTriggerPaired
				.trigger(tokensPaired, statePaired)
				.catch(this.error)
				.then(this.log);
		})
})
.catch(this.error);

let ringBellActionIdGeneric = new Homey.FlowCardAction('send_ring_generic');
ringBellActionIdGeneric.register();

let ringBellActionIdPaired = new Homey.FlowCardAction('send_ring_paired');
ringBellActionIdPaired.register();

function getBits(buttonId)
{
	// +256*256*256*256 to force fixed length of 33 bits
	// then use bits 1..8 (but not bit 0)
	var buttonIdBits = (buttonId + 256*256*256*256).toString(2);
	return [
			parseInt(buttonIdBits[1]),
			parseInt(buttonIdBits[2]),
			parseInt(buttonIdBits[3]),
			parseInt(buttonIdBits[4]),
			parseInt(buttonIdBits[5]),
			parseInt(buttonIdBits[6]),
			parseInt(buttonIdBits[7]),
			parseInt(buttonIdBits[8]),
			parseInt(buttonIdBits[9]),
			parseInt(buttonIdBits[10]),
			parseInt(buttonIdBits[11]),
			parseInt(buttonIdBits[12]),
			parseInt(buttonIdBits[13]),
			parseInt(buttonIdBits[14]),
			parseInt(buttonIdBits[15]),
			parseInt(buttonIdBits[16]),
			parseInt(buttonIdBits[17]),
			parseInt(buttonIdBits[18]),
			parseInt(buttonIdBits[19]),
			parseInt(buttonIdBits[20]),
			parseInt(buttonIdBits[21]),
			parseInt(buttonIdBits[22]),
			parseInt(buttonIdBits[23]),
			parseInt(buttonIdBits[24]),
			parseInt(buttonIdBits[25]),
			parseInt(buttonIdBits[26]),
			parseInt(buttonIdBits[27]),
			parseInt(buttonIdBits[28]),
			parseInt(buttonIdBits[29]),
			parseInt(buttonIdBits[30]),
			parseInt(buttonIdBits[31]),
			parseInt(buttonIdBits[32]),
			];
}

class ByronDbDoorbell extends Homey.App {

	logit(err, result) {
		console.log("err: " + err + ", result: " + result);
	}

	onInit() {
		this.log("ByronDbDoorbell.onInit");

		ringBellActionIdGeneric.registerRunListener((args, state) => {
			var buttonId = args['buttonId']
			this.log('RING-ID-GENERIC: buttonId:' + buttonId);
			var bits = getBits(buttonId);
			this.log("bits:", bits);
			byronDbSignal.tx(bits, this.logit);
			return true;
		});

		ringBellActionIdPaired.registerRunListener((args, state) => {
			var buttonId = parseInt(args['bell_id_paired'].getData()["buttonId"]);
			this.log('RING-ID-PAIRED: buttonId:' + buttonId);
			var bits = getBits(buttonId);
			this.log("bits:", bits);
			byronDbSignal.tx(bits, this.logit);
			return true;
		});

		this.log('ByronDbDoorbell is running...');
	}
}

module.exports = ByronDbDoorbell;

// vim:ts=4
