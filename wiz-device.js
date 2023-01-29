module.exports = function (RED) {

  function WizDevice(config) {

    RED.nodes.createNode(this, config);

    const node = this;

    let wizLocalControl = null;
    let emitter = null;

    const onWizMsg = (msg) => {
      node.send([
        typeof msg.params.state === "boolean" ? { payload: msg.params.state } : null,
        typeof msg.params.sceneId === "number" ? { payload: msg.params.sceneId } : null,
        typeof msg.params.dimming === "number" ? { payload: msg.params.dimming } : null,
        typeof msg.params.temp === "number" ? { payload: msg.params.temp } : null,
        typeof msg.params.r === "number" ? { payload: msg.params.r } : null,
        typeof msg.params.g === "number" ? { payload: msg.params.g } : null,
        typeof msg.params.b === "number" ? { payload: msg.params.b } : null
      ]);
    }

    try {
      const configNode = RED.nodes.getNode(config.wiz_config);

      wizLocalControl = configNode.wizLocalControl;
      emitter = configNode.emitter;

      emitter.on(config.ip, onWizMsg);

    } catch (err) {
      node.error(err);
    }


    node.on("input", async (msg) => {
      try {
        if (msg.topic === "state") {
          await wizLocalControl.changeStatus(Boolean(msg.payload), config.ip);

        } else if (msg.topic === "scene-id") {
          await wizLocalControl.changeLightMode({
            type: "scene",
            sceneId: Number(msg.payload)
          }, config.ip);
          
        } else if (msg.topic === "brightness") {
          await wizLocalControl.changeBrightness(Number(msg.payload), config.ip);
          
        } else if (msg.topic === "temperature") {
          await wizLocalControl.changeLightMode({
            type: "temperature",
            colorTemperature: Number(msg.payload)
          }, config.ip);
          
        } else if (msg.topic === "color") {
          await wizLocalControl.changeLightMode({
            type: "color",
            r: msg.payload.r, g: msg.payload.g, b: msg.payload.b 
          }, config.ip);
          
        }

      } catch (err) {
        node.error(err);
      }
    });

    node.on("close", (removed, done) => {
      try {
        if (emitter) {
          emitter.off(config.ip, onWizMsg);
        }
        
      } catch (err) {
        node.error(err);
      }
      done();
    })

  }
  RED.nodes.registerType("wiz-device", WizDevice);
};
