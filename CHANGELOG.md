# Changelog

## [1.2.1](https://github.com/magicink/phaser-maze/compare/phaser-sandbox-v1.2.0...phaser-sandbox-v1.2.1) (2025-07-30)


### Bug Fixes

* add missing `type` attribute ([181bcdf](https://github.com/magicink/phaser-maze/commit/181bcdf4e2fde2ec8b8c70ad53a3487c349e091c))

## [1.2.0](https://github.com/magicink/phaser-maze/compare/phaser-sandbox-v1.1.0...phaser-sandbox-v1.2.0) (2025-07-10)


### Features

* enable react 19 compiler ([#24](https://github.com/magicink/phaser-maze/issues/24)) ([ee1fd59](https://github.com/magicink/phaser-maze/commit/ee1fd599a922e9abcee830245dd008c928040eb9))

## [1.1.0](https://github.com/magicink/phaser-maze/compare/phaser-sandbox-v1.0.0...phaser-sandbox-v1.1.0) (2025-07-10)


### Features

* shift player during squish animation ([#21](https://github.com/magicink/phaser-maze/issues/21)) ([bf7a508](https://github.com/magicink/phaser-maze/commit/bf7a508e57f30251c1ce19a393c8bc630a8099ac))
* squish player when hitting walls ([#19](https://github.com/magicink/phaser-maze/issues/19)) ([fac1b7c](https://github.com/magicink/phaser-maze/commit/fac1b7c903132c6b9d63f4cd8982c5b385b148fb))
* throttle player movement and add tests ([#23](https://github.com/magicink/phaser-maze/issues/23)) ([2f96a7e](https://github.com/magicink/phaser-maze/commit/2f96a7eef3ef99eed18481e5f762219fb395394b))


### Bug Fixes

* pause input during squish animation ([#22](https://github.com/magicink/phaser-maze/issues/22)) ([1c86492](https://github.com/magicink/phaser-maze/commit/1c86492760eafa227a7317ea26ba84e4a4fb120e))

## 1.0.0 (2025-07-09)


### ⚠ BREAKING CHANGES

* generate maze

### Features

* add random end cell selection and highlight in maze ([c67d2b8](https://github.com/magicink/phaser-maze/commit/c67d2b824cf4b7e2db1a8cf06d7acd290ba2843c))
* add step counter with singleton GameManager integration ([#1](https://github.com/magicink/phaser-maze/issues/1)) ([617e7d1](https://github.com/magicink/phaser-maze/commit/617e7d15f898ac7d6bf4f7fc082fd1b81d6fbedb))
* enhance maze generation with dynamic shapes and increased cell count for better visibility ([512d0c8](https://github.com/magicink/phaser-maze/commit/512d0c83b7a59db04f892a5065f866ab2357ff22))
* ensure all maze cells are reachable and create path if none exists ([3e6907f](https://github.com/magicink/phaser-maze/commit/3e6907f7b1243ae4052e2735dda4b073b89adadb))
* generate maze ([f274c16](https://github.com/magicink/phaser-maze/commit/f274c169b0b5409ca15e2f5081ebb73686183ccc))
* implement keyboard controls for MainMenu scene ([14c35a3](https://github.com/magicink/phaser-maze/commit/14c35a3847433b4d53ac5b70ae9801dc064ef15e))
* implement level tracking, event-driven level updates, and dynamic maze generation ([3f4c2f7](https://github.com/magicink/phaser-maze/commit/3f4c2f71a04c3614ab73d2c2227aaea60e8435ff))
* introduce donut shape ([11dd99a](https://github.com/magicink/phaser-maze/commit/11dd99a7687d911d57604b3de1a1208492c94dfc))
* introduce MazeScene and enhance maze generation logic ([8f8d0ce](https://github.com/magicink/phaser-maze/commit/8f8d0ce66586390d610e57998ea47fed83250406))
* **maze:** allow random maze center ([#5](https://github.com/magicink/phaser-maze/issues/5)) ([039a66f](https://github.com/magicink/phaser-maze/commit/039a66fad8ccb6fa74601f295e4e9303e4579ba8))


### Bug Fixes

* add repo url to release workflow ([#12](https://github.com/magicink/phaser-maze/issues/12)) ([fa3b2a8](https://github.com/magicink/phaser-maze/commit/fa3b2a8654216b0756e3ecf25b00dea73a274c4f))
* increase maze cell count for improved shape visibility ([e200f54](https://github.com/magicink/phaser-maze/commit/e200f54c5f80090ba18d3778c65324149d3fefc1))
* rename release-please config file ([#13](https://github.com/magicink/phaser-maze/issues/13)) ([32834f7](https://github.com/magicink/phaser-maze/commit/32834f7e027150e9a79488c339d517e331e02473))
* validate and ensure exit cell is placed on a valid maze cell ([d1ad5ab](https://github.com/magicink/phaser-maze/commit/d1ad5ab20303f1a92e297855b44513f5ec969407))
