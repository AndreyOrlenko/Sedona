'use strict';
const gulp = require('gulp'),
    debug = require('gulp-debug'),
    sourcemaps = require('gulp-sourcemaps'),
    del = require('del'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    imgMin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    notify = require('gulp-notify'),
    merge = require('merge-stream'),
    browserSync = require('browser-sync'),
    spritesmith = require('gulp.spritesmith'),
    paths = require('path'),
    gulpSequence = require('gulp-sequence'),
    cssUrls = require('gulp-css-urls'),
    svgSprite = require('gulp-svg-sprite'),
    combiner = require('stream-combiner2').obj,
    cached = require('gulp-cached'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    data = require('gulp-data'),
    svgo = require('gulp-svgo'),
    watch = require('gulp-watch'),
    include = require('gulp-include'),
    fileinclude = require('gulp-file-include'),
    If = require('gulp-if');


let isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';
/*При таком условии будет генирироваться sourcemap,
если нужно создать файл без него, в консоли запускаем ( set NODE_ENV=prodaction , set NODE_ENV=development)
*/


//--------------------------------------------------------------------------------------------------
let path = {
  build: {
    html: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/img/',
    fonts: 'build/fonts/'
  },
  src: {
    html: 'src/*.html',
    js: 'src/js/main.js',
    jsAll: 'src/js/**/*.js',
    jsNotMain: '!src/js/main.js',
    less: 'src/less/main.css',
    lessFolder: 'src/less/',
    lessAll: 'src/**/*.less',
    img: 'src/blocks/**/*.{jpg,png,svg}',
    imgSpritePng: 'src/blocks/sprites/spritrs-icon/png/*.png',
    imgSprite: '!src/blocks/sprites/spritrs-icon/**/*.*',
    imgSpriteSVG: 'src/blocks/sprites/spritrs-icon/svg/*.svg',
    imgSpriteFolder: 'src/blocks/sprites/',
    fonts: 'src/fonts/**/*.*',
    imgFolder: 'src/img/',
    blocks: 'src/blocks',
    blocksImgAll: 'src/blocks/**/*.{jpg,png,svg}',
    css: 'src/css/**/*.css',
    postcss: 'src/postcss/main.css',
    scss: 'src/scss/main.scss',

  },
  watchSrc: {
    html: 'src/*.html',
    htmlBlocks: 'src/blocks/**/*.html',
    htmlTamplate: 'src/template/**/*.html',
    js: 'src/js/**/main.js',
    jsAll: 'src/js/**/*.js',
    jsNotMain: '!src/js/main.js',
    jsBlocks: 'src/blocks/**/*.js',
    less: 'src/less/**/*.less',
    lessBlocks: 'src/blocks/**/*.less',
    css: 'src/css/**/*.css',
    img: 'src/blocks/**/*.{jpg,png,svg}',
    imgFolder: 'src/img/**',
    fonts: 'src/fonts/**/*.*',
    postcss: 'src/postcss/main.css',
    postcssBlocks: 'src/blocks/**/*.css',
    scss: 'src/scss/**/main.scss',
    scssBlocks: 'src/blocks/**/*.scss'


  },
  watchBuild: {
    html: 'build/*.html',
    js: 'build/js/**/main.js',
    jsAll: 'build/js/**/*.js',
    jsNotMain: '!build/js/main.js',
    less: 'build/less/**/*.less',
    img: 'build/img/**/*.{jpg,png,svg}',
    imgFolder: 'build/img/**',
    fonts: 'build/fonts/**/*.*',
    css: 'build/css/**/*.css',
    cssMain: 'build/css/main.css',
    cssNotMain: '!build/css/main.css',
    all: 'build/**/*.*'
  },
  clean: './build'
};
//---------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------
// Конфигурация локального сервера
let config = {
  server: {
    baseDir: "./build"
  },
  // tunnel: true, // создает тунель по которому можно демонстрировать сайт заказчику
  host: 'localhost',
  port: 9000,
  logPrefix: "Frontend_Devil",
  open: false
};
//---------------------------------------------------------------------------------------------------------------

//-------------------------------scss-task-------------------------------------------------
gulp.task('scss:build', function () {
  return combiner(
      gulp.src(path.src.scss),

      If(isDevelopment, sourcemaps.init()),
      sass(),
      If(isDevelopment, sourcemaps.write()),

      cssUrls(function (url) {
            if (paths.extname(url) == '.woff' || paths.extname(url) == '.woff2') {
              return '../fonts/' + paths.basename(url)
            }
            return '../img/' + paths.basename(url)
          },
          {
            sourcemaps: false,
          }),

      If(!isDevelopment, postcss([autoprefixer({browsers: [' cover 99.5% ']}), cssnano()])),

      cached('scss'),
      gulp.dest(path.build.css),
      browserSync.reload({stream: true})
  ).on('error', notify.onError());

});
//-------------------------------scss-task-------------------------------------------------


//-------------------------------css-task--------------------------------------------------
//Переносим файлы из папки src/css в папку build/css
gulp.task('css:build', function () {
  return combiner(
      gulp.src(path.src.css),
      If(!isDevelopment, postcss([autoprefixer({browsers: [' cover 99.5% ']}), cssnano()])),
      cached('css'),
      debug(),
      gulp.dest(path.build.css),
      browserSync.reload({stream: true})
  ).on('error', notify.onError());
});

//-------------------------------css-task--------------------------------------------------


//---------------------------js-task--------------------------------------
gulp.task('js:build', function () {
  return combiner(
      gulp.src(path.src.js),

      If(isDevelopment, sourcemaps.init()),
      include(),
      If(isDevelopment, sourcemaps.write()),
      If(!isDevelopment, babel({
        presets: ['env']
      })),
      If(!isDevelopment, uglify()),
      cached('js'),
      gulp.dest(path.build.js),
      browserSync.reload({stream: true})
  ).on('error', notify.onError());
});
//---------------------------js-task--------------------------------------


//---------------------------js-trantport-secondary-file-------------------------------
//Переносим все файлы js кроме main.js
gulp.task('jsOther:build', function () {
  return combiner(
      gulp.src([path.src.jsAll, path.src.jsNotMain]),
      If(!isDevelopment, babel({
        presets: ['env']
      })),
      If(!isDevelopment, uglify()),
      cached('jsAll'),
      debug({title: 'cached'}),
      gulp.dest(path.build.js),
      browserSync.reload({stream: true})
  ).on('error', notify.onError());
});


//---------------------------js-trantport-secondary-file-------------------------------


//------------------------clean-task---------------------------------------
//Удаление директории prodaction
gulp.task('clean', function () {
  return del(path.clean);
});
//------------------------clean-task---------------------------------------


//--------------------------------html-task--------------------------------------
gulp.task('html:build', function () {
  return combiner(
      gulp.src(path.src.html),
      fileinclude({prefix: '@'}),
      cached('html'),
      gulp.dest(path.build.html),
      browserSync.reload({stream: true})
  ).on('error', notify.onError());
});
//--------------------------------html-task-----------------------------------------


//-------------------------------fonts-task----------------------------------------

gulp.task('fonts:build', function () {
  return combiner(
      gulp.src(path.src.fonts),
      cached('fonts'),
      gulp.dest(path.build.fonts),
      browserSync.reload({stream: true})
  ).on('error', notify.onError());
});
//-------------------------------fonts-task------------------------------------------


//-------------------------------img-task------------------------------------------
gulp.task('image:build', function () {
  return combiner(
      gulp.src([path.src.img, path.src.imgSprite]),

      //Выберем наши картинки кроме иконок для спрайтов, меняем пути так, что бы избавиться от лишних папок
      data(function (file) {
        let fileCwd = file.cwd;
        let pathArray = file.path.split('\\', -1);
        let baseName = '';
        for (var i = 1; i <= pathArray.length; i++) {
          if (i === pathArray.length) {
            baseName = pathArray[(i - 1)];
          }

        }
        ;
        file.base = fileCwd + '\\src\\blocks';
        file.path = fileCwd + '\\src\\blocks\\' + baseName;
        return file.relative;
      }),

      cached('image'),
      debug(),
      imgMin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()],
        interlaced: true
      }),
      gulp.dest(path.build.img),
      browserSync.reload({stream: true})
  ).on('error', notify.onError());
});
//-------------------------------img-task------------------------------------------


//----------------------------------png-sprite------------------------------------------
gulp.task('png:sprite', function () {
  // Создаем спрайт
  let spriteData = gulp.src(path.src.imgSpritePng)
      .pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'spritepng.scss',
        padding: 20, //отступы от изображений по умолчанию в пикселях
        imgPath: 'sprite.png', // указывает путь отдельным изображениям до спрайта
        algorithm: 'binary-tree'
      }));

  // Выводим изображение на диск
  let imgStream = spriteData.img
      .pipe(gulp.dest(path.src.imgSpriteFolder));
  // Выводим less на диск
  let cssStream = spriteData.css
      .pipe(gulp.dest(path.src.imgSpriteFolder));

  // Возвращаем слитый поток
  return merge(imgStream, cssStream);
});
//--------------------------------png-sprite--------------------------------------------


//--------------------------------svg-sprite-------------------------------------------
gulp.task('svg:sprite', function () {
  return gulp.src(path.src.imgSpriteSVG)
      .pipe(svgo())
      .pipe(svgSprite({
        mode: {
          css: {
            dest: '.', // базовая директория
            bust: false, //удлинняющие префиксы
            latout: 'packed', // тип упаковки
            // prefix: '.',

            padding: 15,
            sprite: 'sprite.svg',
            dimensions: true, //параметры ширины внесены в один файл с позицией
            render: {
              less: {
                dest: 'spritesvg.scss' // тип выводимого файла с координатами
              }
            }
          }
        },


      }))
      .pipe(gulp.dest(path.src.imgSpriteFolder));
});

//--------------------------------svg-sprite-------------------------------------------


//-------------------------------------serve----------------------------------------------
gulp.task('serve', function () {
  browserSync.init(config);// запускаем локальный сервер с переменной config в которой мы указали все параметры
  //Следит за всеми файлами в src и при удалении, изменении, добавлении перезагружает страницу
  browserSync.watch(['src/**/*.*', 'build/**/*.*']).on('add', browserSync.reload).on('change', browserSync.reload).on('unlink', browserSync.reload).on('error', notify.onError());

});
//--------------------------------------serve------------------------------------------------


//---------------------------------------WATCH----------------------------------------------------------------------------

gulp.task('watch', function () {

//---------------------------------------------SCSS-------------------------------
  watch([path.watchSrc.scss, path.watchSrc.scssBlocks],
      {
        usePolling: true,
        // interval: 5,
        // binaryInterval: 5,
        // alwaysStat: true,
        // depth: 2,
        // awaitWriteFinish: {
        //   stabilityThreshold: 5,
        //   pollInterval: 5
        // }
      }, function (file) {

        if (file.event === 'unlink') {
          let filePath = file.path;
          let FilePathSplit = filePath.split('src')[1];

          if (FilePathSplit.substring(1, 5) === 'scss') {
            let fileCached = filePath.split('.')[0] + '.css'

            delete cached.caches.scss[fileCached];

            let filePathBuild = 'build\\css\\main.css';
            del.sync(filePathBuild);
            gulp.start('scss:build');
          }
          gulp.start('scss:build');

        } else if (file.event === 'error') {
          notify.onError();
        }
        gulp.start('scss:build');
      });

//---------------------------------------------SCSS-------------------------------

//---------------------------------------------CSS--------------------------------
  watch(path.watchSrc.css, {
    usePolling: true, interval: 100,
    binaryInterval: 300,
    alwaysStat: false,
    depth: 5,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  }, function (file) {

    if (file.event === 'unlink') {
      let filePath = file.path;
      let FilePathSplit = filePath.split('src')[1];
      if (FilePathSplit.substring(1, 4) === 'css') {
        delete cached.caches.css[file.path];
        let pathInBuildCss = 'build' + FilePathSplit;
        del.sync(pathInBuildCss);
        gulp.start('css:build');
      }
      gulp.start('css:build');
    } else if (file.event === 'error') {
      notify.onError();
    }
    gulp.start('css:build');
  });

//---------------------------------------------CSS--------------------------------


//---------------------------------------------JS-------------------------------
  watch([path.watchSrc.js, path.watchSrc.jsBlocks], {
    usePolling: true, interval: 100,
    binaryInterval: 300,
    alwaysStat: false,
    depth: 5,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  }, function (file) {

    if (file.event === 'unlink') {
      let filePath = file.path;
      let filePathSplit = filePath.split('src')[1];

      if (filePathSplit.substring(1, 3) === 'js') {
        delete cached.caches.js[file.path];
        let filePathBuild = 'build' + filePathSplit;
        del.sync(filePathBuild);
        gulp.start('js:build');
      }

      gulp.start('js:build');

    } else if (file.event === 'error') {
      notify.onError();
    }
    gulp.start('js:build');
  });


//Следим за всеми файлами .js кроме main.js как в src так и в build

  watch([path.watchSrc.jsAll, path.watchSrc.jsNotMain], {
    usePolling: true, interval: 100,
    binaryInterval: 300,
    alwaysStat: false,
    depth: 5,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  }, function (file) {

    if (file.event === 'unlink') {
      delete cached.caches.jsAll[file.path];

      let filePath = file.path;
      let FilePathBuild = 'build' + filePath.split('src')[1];
      del.sync(FilePathBuild);

      gulp.start('jsOther:build');

    } else if (file.event === 'error') {
      notify.onError();
    }

    gulp.start('jsOther:build');
  });
//---------------------------------------------JS-------------------------------


//------------------------------------FONTS---------------------------------------


  watch(path.watchSrc.fonts, {
    usePolling: true, interval: 100,
    binaryInterval: 300,
    alwaysStat: false,
    depth: 5,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  }, function (file) {

    if (file.event === 'unlink') {

      delete cached.caches.fonts[file.path];

      let filePath = file.path;
      let FilePathSplit = filePath.split('src');
      let filePathBuild = 'build' + FilePathSplit[1];

      del.sync(filePathBuild);

      gulp.start('fonts:build');

    } else if (file.event === 'error') {
      notify.onError();
    }

    gulp.start('fonts:build');
  });

//-------------------------------------FONTS--------------------------------------


//------------------------------------------HTML----------------------------------------
//Следим за файлами HTML в папке template и в основной директории
// За папкой template, если произошли изменения пересобираем основные файлы
  watch(path.watchSrc.htmlTamplate, {
    usePolling: true, interval: 100,
    binaryInterval: 300,
    alwaysStat: false,
    depth: 5,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  }, function (file) {
    if (file.event === 'error') {
      notify.onError()
    }
    gulp.start('html:build');
  });


// За основными файлами, если файл удален, то удаляем его и из build
  watch(path.watchSrc.html, {
    usePolling: true, interval: 100,
    binaryInterval: 300,
    alwaysStat: false,
    depth: 5,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  }, function (file) {
    if (file.event === 'unlink') {
      delete cached.caches.html[file.path];
      let filePath = file.path;
      let FilePathSplit = filePath.split('src');
      let filePathBuild = 'build' + FilePathSplit[1];
      del.sync(filePathBuild);
      gulp.start('html:build');
    } else if (file.event === 'error') {
      notify.onError()
    }


    gulp.start('html:build');
  });
//--------------------------------HTML-------------------------------


//---------------------------------IMAGE----------------------------------------------------
  watch([path.watchSrc.img, path.src.imgSprite], {
    usePolling: true, interval: 100,
    binaryInterval: 300,
    alwaysStat: false,
    depth: 5,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  }, function (file) {
    if (file.event === 'unlink') {
      let filePath = file.path;
      let FilePathSplit = filePath.split('src');
      if (FilePathSplit[1].substring(1, 7) === 'blocks') {
        let relativeImgPath = FilePathSplit[0] + 'src\\blocks\\' + file.basename;
        delete cached.caches.image[relativeImgPath];
        let pathInBuildFile = 'build\\img\\' + file.basename;
        del.sync(pathInBuildFile);
        gulp.start('image:build');
      }
      gulp.start('image:build');
    }
    gulp.start('image:build');
  });
//--------------------------------------------IMAGE---------------------------------------


});
//---------------------------------------------WATCH--------------------------------------------------------


//-------------------------------------GULP------------------------------------------------------------------
gulp.task('default', gulpSequence(['clean'], ['html:build', 'scss:build', 'css:build', 'js:build', 'jsOther:build', 'image:build', 'fonts:build'], ['watch', 'serve']));
