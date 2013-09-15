module.exports = function(grunt) {

  grunt.initConfig({
    less: {

      production: {
        options: {
          yuicompress: true
        },
        files: {
          'client/css/jsbyte.min.css': 'client/css/jsbyte.less'
        }
      }

    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.registerTask('default', ['less']);
};
