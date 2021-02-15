'use strict';
/* global Module */

/* Magic Mirror
 * Module: MMM-Mqtt-Homewizard
 *
 * By Tim Schenk
 */

Module.register('MMM-Mqtt-Homewizard', {

  defaults: {
    mqttServer: 'mqtt://',
    topic: '',
  },

  start: function() {
    Log.info('Starting module: ' + this.name);
    this.mqttVal = null;
    this.jsonMQTT = null;
    this.currentset = null;

    var self = this;
    self.sendSocketNotification('MQTT_SERVER', { mqttServer: self.config.mqttServer, topic: self.config.topic });
    this.updateDom();
  },

  getTemplate: function () {
    return "mmm-mqtt-homewizard.njk";
  },

  getTemplateData: function () {
    return {
      config: this.config,
      hwdaghuidig:      this.currentset == null ? null : this.currentset[0]['hwdaghuidig'],
      hwdagtotaal:      this.currentset == null ? null : this.currentset[0]['hwdagtotaal'],
      hwverbruikhuidig: this.currentset == null ? null : this.currentset[0]['hwverbruikhuidig'],
      hwverbruiktotaal: this.currentset == null ? null : this.currentset[0]['hwverbruiktotaal'],
      hwopwerkhuidig:   this.currentset == null ? null : this.currentset[0]['hwopwerkhuidig'],
      hwopwektotaal:    this.currentset == null ? null : this.currentset[0]['hwopwektotaal'],
      hwgastotaal:      this.currentset == null ? null : this.currentset[0]['hwgastotaal'],
      hwregentotaal:    this.currentset == null ? null : this.currentset[0]['hwregentotaal'],
      hwtemptotaal:     this.currentset == null ? null : this.currentset[0]['hwtemptotaal']
    };
  },

  getStyles: function() {
  	return [
  		'font-awesome.css'
  	]
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'MQTT_DATA' && payload.topic === this.config.topic && this.mqttVal != payload.data.toString()) {
      this.mqttVal = payload.data.toString();
      this.jsonMQTT = JSON.parse(this.mqttVal.toString())
      var newset =      [{
                            "hwdaghuidig":          this.jsonMQTT.response.energylinks[0].aggregate.po
                          , "hwdagtotaal":          this.jsonMQTT.response.energylinks[0].aggregate.dayTotal
                          , "hwverbruikhuidig":     this.jsonMQTT.response.energylinks[0].used.po
                          , "hwverbruiktotaal":     this.jsonMQTT.response.energylinks[0].used.dayTotal
                          , "hwopwerkhuidig":       this.jsonMQTT.response.energylinks[0].s1.po
                          , "hwopwektotaal":        this.jsonMQTT.response.energylinks[0].s1.dayTotal
                          , "hwgastotaal":          this.jsonMQTT.response.energylinks[0].gas.dayTotal
                          , "hwregentotaal":        this.jsonMQTT.response.rainmeters[0].mm
                          , "hwtemptotaal":         this.jsonMQTT.response.thermometers[0].te
                        }]

      if (JSON.stringify(newset) !== JSON.stringify(this.currentset)) { // change detected
        this.currentset = newset // update current set
        this.updateDom();
      }
    }

    if (notification === 'ERROR') {
      this.sendNotification('SHOW_ALERT', payload);
    }
  }

});
