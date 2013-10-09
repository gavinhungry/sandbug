module.exports = function(grunt) {

  grunt.initConfig({
    less: {
      production: {
        options: { yuicompress: true },
        files: {
          'public/css/debuggerio.std.min.css': 'public/css/debuggerio.std.less',
          'public/css/debuggerio.alt.min.css': 'public/css/debuggerio.alt.less'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.registerTask('default', ['less']);
};
