const WiZLocalControl = require("@heleon19/wiz-local-control").default;
const EventEmitter = require("events");
  
module.exports = function (RED) {
  
  function WizConfig(config) {

    RED.nodes.createNode(this, config);

    const node = this;

    node.emitter = new EventEmitter();

    node.wizLocalControl = null;
    
    try {
      node.wizLocalControl = new WiZLocalControl({
        incomingMsgCallback: (msg, ip) => {
          node.emitter.emit(ip, msg);
        },
        interfaceName: config.interface
      });
      node.wizLocalControl.startListening();

    } catch (err) {
      node.error(err);
    }

    
    node.on("close", (removed, done) => {
      try {
        if (node.wizLocalControl) {
          node.wizLocalControl.stopListening();
        }

      } catch (err) {
        node.err(err);
      }
      done();
    });

  };

  RED.nodes.registerType("wiz-config", WizConfig);
};
