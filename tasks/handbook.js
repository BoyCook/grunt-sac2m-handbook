/*
 * grunt-handbook
 * https://github.com/boycook/grunt-handbook
 *
 * Copyright (c) 2015 Craig COok
 * Licensed under the MIT license.
 */

'use strict';

// var fs = require('fs');
var fs = require('fs-extra');
var request = require('request');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  function getTiddlers(url, html, target, configFile, done) {
    var tiddlers;
    var options = {
      url: url,
      headers: {
        'Accept': 'application/json'
      }
    };
     
    function callback(error, response, body) {
      if (!error && response.statusCode === 200) {
        var tiddlers = JSON.parse(body);
        var config = [{'gen/*.html': 'templates/html/*.html'}]; //Hack to give base.json context
        for (var i = 0, len = tiddlers.length; i < len; i++) {
            var tiddler = tiddlers[i];
            var json = {
              "description": "SAC2M Handbook - " + tiddler.title,
              "extends": ["base.json"],
              "targetPath" : "index.html",
              "partials%add": [],
              "depth": "../../",
              "title": tiddler.title,
              "content": tiddler.render,
              "tags": tiddler.tags
            };
            
            var item = {};
            item['gen/handbook/' + tiddler.title + '/*.html'] = 'templates/html/handbook/' + tiddler.title + '/*.html';
            config.push(item);
            var text = JSON.stringify(json);
            var path = target + '/' + tiddler.title;
            fs.mkdirSync(path);
            fs.writeFileSync(path + '/index.json', text);
            fs.copySync(html, path + '/index.html');
            if (i === len-1) {
              fs.writeFileSync(configFile, JSON.stringify(config));
              done();
            }
        }        
      } else {
        console.log(error);
        done(false);
      }
    }

    request(options, callback);
  }

  grunt.registerTask('sac2mHandbook', 'Generating the Scaling Agile Handbook.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var done = this.async();
  
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });

    console.log('Using source URL: ' + options.url);
    console.log('Using HTML tempate: ' + options.template.html);
    console.log('Using target: ' + options.target);
    console.log('Using config file: ' + options.configFile);

    if (!fs.existsSync(options.target)) {
      fs.mkdirSync(options.target);
    }

    getTiddlers(options.url, options.template.html, options.target, options.configFile, done);
  });
};
