### IMPORTANT
I'm no longer able to properly support this project.
Anyone that can supply any nice PRs or other relevant motivation will be promoted to project owner...

### Byron DB series doorbells
Homey app to receive signals from Byron DB doorbell pushbuttons; and to send signal to Byron DB doorbell chimes.

This driver is still ALPHA.

The push buttons seem to emit 2 different values.
I've not been able to determine the relation between the 2.
Therefore this driver thinks these are 2 different push buttons.

These devices are supported:

Doorbell push buttons:
* 90017 tested
* possibly other Byron DB buttons

Doorbell chimes:
* DB286A
* DB301
* DB302
* DB303
* DB304
* DB305usb
* DB306
* DB312
* DB313
* DB320
* DB333
* DB401E tested
* DB411E tested
* DB421E
* DB431E
* DB433E
* possibly other Byron DB chimes

Please tell me when you have a Byron DB device that is not listed here.
Please tell me when you have a Byron DB device that is properly working with Homey, but which is not yet marked as 'tested' here.

### Installation
Install the app and add the App to a flow. You can use the generic Byron DB application as a starting trigger, or as an action in a flow. In that case you are required to manually fill in the bell-id that is used. Better, you can pair a Byron DB button and/or a Byron DB ringer and use these in a flow.

#### Activity

When the card is added to the condition column, it detects a Byron DB push button being pushed. A parameter is added to the trigger:
* buttonId:
Contains the internal ID of the button that is pushed.

When the card is added to the action column, it is able to send a signal to a Byron DB bell. This card takes one parameter:
* buttonId:
Contains the internal ID of the button that is recognized by the bell. Typically, this is the same number as is sent by the push button.

You may create more complicated scenarios where you let the Homey flow decide whether or not to send a command to the bell. First pair be bell so that it has a known internal ID. Then remove the batteries from the push button and reinsert them. This gives the push button a new random internal ID. Unless you are unlucky, the push button now has a different internal ID than the bell. You can use this to let your Homey decide whether the bell should indeed ring.

#### Protocols
The Byron DB series push buttons and bells all use the same 433MHz-based protocol. It uses a simple message consisting of 32 bits. The internal structure for the message has not yet been determined.
