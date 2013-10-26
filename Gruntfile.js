module.exports = function(grunt) {

  grunt.initConfig({
    less: {
      production: {
        options: { yuicompress: true },
        files: {
          'public/css/debuggerio.light.min.css':
          'public/css/less/debuggerio.light.less',

          'public/css/debuggerio.dark.min.css':
          'public/css/less/debuggerio.dark.less'
        }
      }
    },

    cssmin: {
      production: {
        src: ['server/static/css/gfm.css'],
        dest: 'server/static/css/gfm.min.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-yui-compressor');
  grunt.registerTask('default', ['less', 'cssmin']);
};
