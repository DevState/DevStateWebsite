/**
 * Created by sakri on 16-12-13.
 */


module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                src: [
                    "js/common/DSClassManager.js",
                    "js/common/SimpleGeometry.js",
                    "js/common/DSColors.js",
                    "js/common/UnitAnimator.js",
                    "js/common/SimpleLoaderGraphic.js",
                    "js/common/ImageStore.js",
                    "js/common/DSLightBox.js",
                    "js/demos/AbstractDemo.js",
                    "js/main.js"

                ],
                dest: 'js/devstate.js'
            }
        },

        uglify: {

            dist: {
                files: {

                    'js/common/ArrowButtons.min.js': 'js/common/ArrowButtons.js',
                    'js/common/BlockSetAnimator.min.js': 'js/common/BlockSetAnimator.js',
                    'js/common/ImageEffects.min.js': 'js/common/ImageEffects.js',
                    'js/common/ImageTransformRectangle.min.js': 'js/common/ImageTransformRectangle.js',
                    'js/common/Isometric.min.js': 'js/common/Isometric.js',
                    'js/common/TransformRectangle.min.js': 'js/common/TransformRectangle.js',
                    'js/common/Wanderer.min.js': 'js/common/Wanderer.js',

                    'js/charting/BarChart.min.js': 'js/charting/BarChart.js',
                    'js/charting/ChartBackground.min.js': 'js/charting/ChartBackground.js',
                    'js/charting/LineChart.min.js': 'js/charting/LineChart.js',
                    'js/charting/PieChart.min.js': 'js/charting/PieChart.js',

                    'js/menus/SimpleCoverFlow.min.js': 'js/menus/SimpleCoverFlow.js',
                    'js/menus/ThumbnailCarousel.min.js': 'js/menus/ThumbnailCarousel.js',

                    'js/slideShows/BasicSlideShow.min.js': 'js/slideShows/BasicSlideShow.js',
                    'js/slideShows/ImageEffectFader.min.js': 'js/slideShows/ImageEffectFader.js',

                    'js/textEffects/TextChopper.min.js': 'js/textEffects/TextChopper.js',

                    'js/demos/AbstractDemo.min.js': 'js/demos/AbstractDemo.js',
                    'js/demos/BarChartDemo.min.js': 'js/demos/BarChartDemo.js',
                    'js/demos/BasicSlideShowDemo.min.js': 'js/demos/BasicSlideShowDemo.js',
                    'js/demos/BlockSetAnimatorDemo.min.js': 'js/demos/BlockSetAnimatorDemo.js',
                    'js/demos/BlockSetAnimatorDemo.min.js': 'js/demos/BlockSetAnimatorDemo.js',
                    'js/demos/ImageFaderDemo.min.js': 'js/demos/ImageFaderDemo.js',
                    'js/demos/IsometryDemo.min.js': 'js/demos/IsometryDemo.js',
                    'js/demos/LineChartDemo.min.js': 'js/demos/LineChartDemo.js',
                    'js/demos/PieChartDemo.min.js': 'js/demos/PieChartDemo.js',
                    'js/demos/SimpleCoverFlowDemo.min.js': 'js/demos/SimpleCoverFlowDemo.js',
                    'js/demos/TextEffectDemo.min.js': 'js/demos/TextEffectDemo.js',
                    'js/demos/ThumbnailCarouselDemo.min.js': 'js/demos/ThumbnailCarouselDemo.js',
                    'js/demos/WandererDemo.min.js': 'js/demos/WandererDemo.js',



                    'js/devstate.min.js': 'js/devstate.js'
                }
            }
        }

    });


    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat', 'uglify']);

};