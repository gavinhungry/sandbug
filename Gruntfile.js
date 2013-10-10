module.exports = function(grunt) {

  grunt.initConfig({
    less: {
      production: {
        options: { yuicompress: true },
        files: {
          'public/css/debuggerio.light.min.css':
          'src/less/debuggerio.light.less',

          'public/css/debuggerio.dark.min.css':
          'src/less/debuggerio.dark.less'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.registerTask('default', ['less']);
};
