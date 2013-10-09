module.exports = function(grunt) {

  grunt.initConfig({
    less: {
      production: {
        options: { yuicompress: true },
        files: {
          'public/css/debugger-io.min.css': 'public/css/debugger-io.less'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.registerTask('default', ['less']);
};
