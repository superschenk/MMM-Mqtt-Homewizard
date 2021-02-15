'use strict';

const NodeHelper = require('node_helper');
var mqtt = require('mqtt');

module.exports = NodeHelper.create({
  start: function() {
    console.log('MMM-Mqtt-Homewizard started ...');
  },

  getMqtt: function(payload) {
    var self = this;
    var client = mqtt.connect(payload.mqttServer);

    client.on('connect', function() {
      client.subscribe(payload.topic);
    });

    client.on('error', function(error) {
      console.log('ERROR: ' + error);
      self.sendSocketNotification('ERROR', {
        type: 'notification',
        title: 'MQTT Error',
        message: 'MQTTgenerated an error: ' + error
      });
    });

    client.on('message', function(topic, message) {
      self.sendSocketNotification('MQTT_DATA', {'topic':topic, 'data':message.toString()});
    });
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'MQTT_SERVER') {
      this.getMqtt(payload);
    }
  }
});
