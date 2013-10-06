module.exports = function(grunt) {

  grunt.initConfig({
    less: {
      production: {
        options: { yuicompress: true },
        files: {
          'client/css/debugger-io.min.css': 'client/css/debugger-io.less'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.registerTask('default', ['less']);
};
