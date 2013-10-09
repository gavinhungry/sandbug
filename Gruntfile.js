module.exports = function(grunt) {

  grunt.initConfig({
    less: {
      production: {
        options: { yuicompress: true },
        files: {
          'public/css/debuggerio.std.min.css': 'source/less/debuggerio.std.less',
          'public/css/debuggerio.alt.min.css': 'source/less/debuggerio.alt.less'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.registerTask('default', ['less']);
};
